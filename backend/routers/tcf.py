from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from database import db_cursor
from schemas import (
    TCFQuestionOut, TCFSubmitIn, TCFAttemptOut, ExpressionSubmitIn, ExpressionOut, ExpressionPromptOut,
)
from deps import get_current_user
from scoring import score_from_ratio
import ai_correction

router = APIRouter(prefix="/api/tcf", tags=["tcf"])

VALID_SECTIONS = {"comprehension_orale", "comprehension_ecrite"}
VALID_EXPRESSION_SECTIONS = {"expression_ecrite", "expression_orale"}


def has_active_access(user_id: int, cur) -> bool:
    """Vrai si l'utilisateur a au moins un achat payé dont l'accès n'est pas expiré."""
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute(
        "SELECT 1 FROM purchases WHERE user_id = ? AND status = 'paid' AND expires_at > ? LIMIT 1",
        (user_id, now),
    )
    return cur.fetchone() is not None


@router.get("/questions", response_model=list[TCFQuestionOut])
def get_questions(section: str = Query(..., description="comprehension_orale | comprehension_ecrite")):
    if section not in VALID_SECTIONS:
        raise HTTPException(status_code=400, detail="Section invalide")
    with db_cursor() as cur:
        cur.execute("SELECT * FROM tcf_questions WHERE section = ? ORDER BY id", (section,))
        rows = cur.fetchall()
    return [
        TCFQuestionOut(
            id=r["id"], section=r["section"], niveau=r["niveau"], question_text=r["question_text"],
            passage_or_audio_desc=r["passage_or_audio_desc"], option_a=r["option_a"], option_b=r["option_b"],
            option_c=r["option_c"], option_d=r["option_d"],
        )
        for r in rows
    ]


@router.get("/expression-prompts", response_model=ExpressionPromptOut)
def get_random_expression_prompt(section: str = Query(..., description="expression_ecrite | expression_orale")):
    if section not in VALID_EXPRESSION_SECTIONS:
        raise HTTPException(status_code=400, detail="Section invalide")
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM tcf_expression_prompts WHERE section = ? ORDER BY RANDOM() LIMIT 1",
            (section,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Aucun sujet disponible pour cette section")
    return ExpressionPromptOut(id=row["id"], section=row["section"], prompt_text=row["prompt_text"])


@router.post("/submit", response_model=TCFAttemptOut)
def submit_test(payload: TCFSubmitIn, current_user: dict = Depends(get_current_user)):
    if payload.section not in VALID_SECTIONS:
        raise HTTPException(status_code=400, detail="Section invalide")
    if not payload.answers:
        raise HTTPException(status_code=400, detail="Aucune réponse fournie")

    question_ids = [a.question_id for a in payload.answers]
    placeholders = ",".join("?" for _ in question_ids)
    with db_cursor(commit=True) as cur:
        cur.execute(
            f"SELECT id, niveau, correct_option FROM tcf_questions WHERE id IN ({placeholders})",
            question_ids,
        )
        question_map = {r["id"]: r for r in cur.fetchall()}

        nb_correct = sum(
            1 for a in payload.answers
            if question_map.get(a.question_id) and question_map[a.question_id]["correct_option"] == a.selected_option.lower()
        )
        nb_questions = len(payload.answers)
        ratio = nb_correct / nb_questions if nb_questions else 0
        score_tcf, niveau_clb = score_from_ratio(ratio)

        cur.execute(
            """INSERT INTO tcf_attempts (user_id, section, nb_questions, nb_correct, score_tcf, niveau_clb)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (current_user["id"], payload.section, nb_questions, nb_correct, score_tcf, niveau_clb),
        )
        attempt_id = cur.lastrowid
        cur.execute("SELECT * FROM tcf_attempts WHERE id = ?", (attempt_id,))
        row = cur.fetchone()

        access = has_active_access(current_user["id"], cur)
        breakdown = None
        if access:
            breakdown = {}
            for a in payload.answers:
                q = question_map.get(a.question_id)
                if not q:
                    continue
                niveau = q["niveau"]
                breakdown.setdefault(niveau, {"correct": 0, "total": 0})
                breakdown[niveau]["total"] += 1
                if q["correct_option"] == a.selected_option.lower():
                    breakdown[niveau]["correct"] += 1

    return TCFAttemptOut(
        id=row["id"], section=row["section"], nb_questions=row["nb_questions"], nb_correct=row["nb_correct"],
        score_tcf=row["score_tcf"], niveau_clb=row["niveau_clb"], created_at=row["created_at"],
        detailed_analysis_available=access, breakdown_by_niveau=breakdown,
    )


@router.get("/attempts", response_model=list[TCFAttemptOut])
def my_attempts(current_user: dict = Depends(get_current_user)):
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM tcf_attempts WHERE user_id = ? ORDER BY created_at DESC",
            (current_user["id"],),
        )
        rows = cur.fetchall()
    return [
        TCFAttemptOut(id=r["id"], section=r["section"], nb_questions=r["nb_questions"], nb_correct=r["nb_correct"],
                       score_tcf=r["score_tcf"], niveau_clb=r["niveau_clb"], created_at=r["created_at"])
        for r in rows
    ]


def _correction_credits_remaining(user_id: int, cur) -> int:
    cur.execute(
        """SELECT COALESCE(SUM(tcf_packs.ai_correction_credits), 0) AS total
           FROM purchases JOIN tcf_packs ON purchases.pack_id = tcf_packs.id
           WHERE purchases.user_id = ? AND purchases.status = 'paid'""",
        (user_id,),
    )
    total_credits = cur.fetchone()["total"]
    cur.execute("SELECT COUNT(*) AS used FROM tcf_expression_submissions WHERE user_id = ?", (user_id,))
    used = cur.fetchone()["used"]
    return max(total_credits - used, 0)


@router.get("/correction-credits")
def correction_credits(current_user: dict = Depends(get_current_user)):
    with db_cursor() as cur:
        remaining = _correction_credits_remaining(current_user["id"], cur)
    return {"remaining": remaining}


@router.post("/expression/submit", response_model=ExpressionOut)
def submit_expression(payload: ExpressionSubmitIn, current_user: dict = Depends(get_current_user)):
    """Soumission d'une production écrite ou orale (transcrite). Nécessite un
    crédit de correction IA (obtenu via l'achat d'une formule d'accès). La
    correction est faite de façon synchrone via l'API Claude — voir
    ai_correction.py. Une correction humaine approfondie reste disponible
    séparément via une consultation."""
    if payload.section not in VALID_EXPRESSION_SECTIONS:
        raise HTTPException(status_code=400, detail="Section invalide")

    with db_cursor() as cur:
        remaining = _correction_credits_remaining(current_user["id"], cur)
    if remaining <= 0:
        raise HTTPException(
            status_code=402,
            detail="Aucun crédit de correction IA disponible. Achetez une formule d'accès pour en obtenir.",
        )

    # Appel IA fait hors transaction DB (appel réseau potentiellement long).
    feedback_json = ai_correction.correct_expression(payload.section, payload.prompt, payload.content)

    with db_cursor(commit=True) as cur:
        cur.execute(
            """INSERT INTO tcf_expression_submissions (user_id, section, prompt, content, status, feedback)
               VALUES (?, ?, ?, ?, 'corrige', ?)""",
            (current_user["id"], payload.section, payload.prompt, payload.content, feedback_json),
        )
        submission_id = cur.lastrowid
        cur.execute("SELECT * FROM tcf_expression_submissions WHERE id = ?", (submission_id,))
        row = cur.fetchone()

    return ExpressionOut(
        id=row["id"], section=row["section"], prompt=row["prompt"], content=row["content"],
        status=row["status"], feedback=row["feedback"], created_at=row["created_at"],
    )


@router.get("/expression/mine", response_model=list[ExpressionOut])
def my_expressions(current_user: dict = Depends(get_current_user)):
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM tcf_expression_submissions WHERE user_id = ? ORDER BY created_at DESC",
            (current_user["id"],),
        )
        rows = cur.fetchall()
    return [
        ExpressionOut(id=r["id"], section=r["section"], prompt=r["prompt"], content=r["content"],
                       status=r["status"], feedback=r["feedback"], created_at=r["created_at"])
        for r in rows
    ]

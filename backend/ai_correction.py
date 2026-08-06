"""
Correction automatique des productions écrites/orales (TCF Canada) via l'API Claude.

Correction synchrone : l'appel est fait au moment de la soumission, pas de file
d'attente. Si ANTHROPIC_API_KEY n'est pas configurée, `correct_expression` lève
une erreur claire que le router transforme en HTTP 503 plutôt que de planter.
"""
import json
import os

from fastapi import HTTPException

MODEL = "claude-sonnet-4-5"

SYSTEM_PROMPT = (
    "Tu es un correcteur expert du TCF Canada (Test de connaissance du français). "
    "Tu corriges des productions d'expression écrite ou orale (transcrite) comme le "
    "ferait un examinateur TCF Canada. Réponds UNIQUEMENT avec un objet JSON valide, "
    "sans texte autour, avec exactement ces clés : "
    '{"score_sur_20": <nombre>, "niveau_cecr": "<A2|B1|B2|C1>", '
    '"points_forts": ["...", "..."], "points_a_ameliorer": ["...", "..."]}. '
    "Les points forts et points à améliorer doivent être en français, 3 à 4 chacun, "
    "concis et actionnables."
)


def correct_expression(section: str, prompt_text: str, content: str) -> str:
    """Appelle Claude pour corriger une production et renvoie un JSON (str) prêt
    à être stocké dans tcf_expression_submissions.feedback."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Correction IA non configurée, contactez l'administrateur.",
        )

    import anthropic  # import local pour ne pas alourdir le démarrage si non utilisé

    client = anthropic.Anthropic(api_key=api_key)
    section_label = "expression écrite" if section == "expression_ecrite" else "expression orale (transcription)"

    user_message = (
        f"Section : {section_label}.\n"
        f"Sujet / consigne : {prompt_text}\n\n"
        f"Production du candidat :\n{content}"
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_text = "".join(block.text for block in response.content if block.type == "text").strip()

    try:
        parsed = json.loads(raw_text)
    except (ValueError, json.JSONDecodeError):
        # Si le modèle n'a pas renvoyé un JSON strictement valide, on garde le
        # texte brut plutôt que de faire échouer la soumission.
        parsed = {
            "score_sur_20": None,
            "niveau_cecr": None,
            "points_forts": [],
            "points_a_ameliorer": [],
            "raw": raw_text,
        }

    return json.dumps(parsed, ensure_ascii=False)

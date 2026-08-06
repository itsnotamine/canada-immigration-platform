from pydantic import BaseModel
from typing import Optional

# NB : on utilise `str` (et non `EmailStr`) pour l'email afin de ne pas dépendre
# du package optionnel `email-validator` (non installé par défaut avec FastAPI).
# Une validation basique du format est faite manuellement dans les routers si besoin.


# --- Auth ---
class RegisterIn(BaseModel):
    full_name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    is_admin: bool


class TokenOut(BaseModel):
    access_token: str
    user: UserOut


# --- Consultations ---
class ConsultationIn(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    program_interest: str
    preferred_date: Optional[str] = None
    message: Optional[str] = None


class ConsultationOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    program_interest: str
    preferred_date: Optional[str]
    message: Optional[str]
    price_mad: float
    payment_status: str
    status: str
    created_at: str


class ConsultationStatusUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None


# --- Packs / Purchases ---
class PackOut(BaseModel):
    id: int
    name: str
    description: str
    price_mad: float
    original_price_mad: Optional[float] = None
    is_popular: bool
    duration_days: int
    ai_correction_credits: int


class CheckoutIn(BaseModel):
    pack_id: int


class PurchaseOut(BaseModel):
    id: int
    pack_id: int
    pack_name: str
    amount_mad: float
    status: str
    expires_at: str
    created_at: str


# --- TCF practice ---
class TCFQuestionOut(BaseModel):
    id: int
    section: str
    niveau: str
    question_text: str
    passage_or_audio_desc: Optional[str]
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    # correct_option volontairement absent : ne jamais renvoyer la réponse au client


class TCFAnswer(BaseModel):
    question_id: int
    selected_option: str  # 'a' | 'b' | 'c' | 'd'


class TCFSubmitIn(BaseModel):
    section: str
    answers: list[TCFAnswer]


class TCFAttemptOut(BaseModel):
    id: int
    section: str
    nb_questions: int
    nb_correct: int
    score_tcf: int
    niveau_clb: str
    created_at: str
    detailed_analysis_available: bool = False
    # Détail par niveau (A2/B1/B2/C1...) : {"B1": {"correct": 2, "total": 3}, ...}
    # Non renvoyé (None) si l'utilisateur n'a pas d'accès actif.
    breakdown_by_niveau: Optional[dict[str, dict]] = None


class ExpressionPromptOut(BaseModel):
    id: int
    section: str
    prompt_text: str


class ExpressionSubmitIn(BaseModel):
    section: str  # expression_ecrite | expression_orale
    prompt: str
    content: str


class ExpressionOut(BaseModel):
    id: int
    section: str
    prompt: str
    content: str
    status: str
    feedback: Optional[str]  # JSON (str) : score_sur_20, niveau_cecr, points_forts, points_a_ameliorer
    created_at: str
    human_correction_hint: str = "Besoin d'un avis humain approfondi ? Réservez une consultation."
    human_correction_url: str = "/consultations"

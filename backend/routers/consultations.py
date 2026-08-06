from fastapi import APIRouter, Depends, HTTPException
from database import db_cursor
from schemas import ConsultationIn, ConsultationOut, ConsultationStatusUpdate
from deps import get_current_user, get_optional_user

router = APIRouter(prefix="/api/consultations", tags=["consultations"])

CONSULTATION_PRICE_MAD = 550.0


def _row_to_out(row) -> ConsultationOut:
    return ConsultationOut(
        id=row["id"], full_name=row["full_name"], email=row["email"], phone=row["phone"],
        program_interest=row["program_interest"], preferred_date=row["preferred_date"],
        message=row["message"], price_mad=row["price_mad"], payment_status=row["payment_status"],
        status=row["status"], created_at=row["created_at"],
    )


@router.post("", response_model=ConsultationOut)
def create_booking(payload: ConsultationIn, current_user: dict | None = Depends(get_optional_user)):
    """Prise de rendez-vous de consultation payante (550 MAD par défaut).
    Le paiement se fait ensuite via /api/payments/checkout."""
    user_id = current_user["id"] if current_user else None
    with db_cursor(commit=True) as cur:
        cur.execute(
            """INSERT INTO consultation_bookings
            (user_id, full_name, email, phone, program_interest, preferred_date, message, price_mad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, payload.full_name, payload.email, payload.phone, payload.program_interest,
             payload.preferred_date, payload.message, CONSULTATION_PRICE_MAD),
        )
        booking_id = cur.lastrowid
        cur.execute("SELECT * FROM consultation_bookings WHERE id = ?", (booking_id,))
        row = cur.fetchone()
    return _row_to_out(row)


@router.get("/mine", response_model=list[ConsultationOut])
def my_bookings(current_user: dict = Depends(get_current_user)):
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM consultation_bookings WHERE user_id = ? OR email = ? ORDER BY created_at DESC",
            (current_user["id"], current_user["email"]),
        )
        rows = cur.fetchall()
    return [_row_to_out(r) for r in rows]


@router.get("", response_model=list[ConsultationOut])
def list_bookings(current_user: dict = Depends(get_current_user)):
    """Réservé aux administrateurs : vue d'ensemble de toutes les demandes."""
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    with db_cursor() as cur:
        cur.execute("SELECT * FROM consultation_bookings ORDER BY created_at DESC")
        rows = cur.fetchall()
    return [_row_to_out(r) for r in rows]


@router.patch("/{booking_id}", response_model=ConsultationOut)
def update_booking(booking_id: int, payload: ConsultationStatusUpdate, current_user: dict = Depends(get_current_user)):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    with db_cursor(commit=True) as cur:
        cur.execute("SELECT * FROM consultation_bookings WHERE id = ?", (booking_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Réservation introuvable")
        new_status = payload.status or row["status"]
        new_payment = payload.payment_status or row["payment_status"]
        cur.execute(
            "UPDATE consultation_bookings SET status = ?, payment_status = ? WHERE id = ?",
            (new_status, new_payment, booking_id),
        )
        cur.execute("SELECT * FROM consultation_bookings WHERE id = ?", (booking_id,))
        row = cur.fetchone()
    return _row_to_out(row)

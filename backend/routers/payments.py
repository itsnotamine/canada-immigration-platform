"""
Paiements — implémentation "mock" qui valide instantanément la transaction,
pour que la plateforme soit fonctionnelle de bout en bout sans clé API externe.

Pour brancher un vrai processeur de paiement (Stripe recommandé) :
1. `pip install stripe` et définir STRIPE_SECRET_KEY dans les variables d'environnement.
2. Remplacer le corps de `checkout_pack` / `checkout_consultation` par la création
   d'une `stripe.checkout.Session` (mode="payment") et rediriger le frontend vers
   `session.url` au lieu de marquer le paiement "paid" directement.
3. Ajouter un webhook `/api/payments/webhook` qui écoute `checkout.session.completed`
   pour marquer la commande comme payée côté serveur (source de vérité), au lieu
   de faire confiance au frontend.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from database import db_cursor
from schemas import CheckoutIn, PurchaseOut
from deps import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/checkout-pack", response_model=PurchaseOut)
def checkout_pack(payload: CheckoutIn, current_user: dict = Depends(get_current_user)):
    with db_cursor(commit=True) as cur:
        cur.execute("SELECT * FROM tcf_packs WHERE id = ?", (payload.pack_id,))
        pack = cur.fetchone()
        if not pack:
            raise HTTPException(status_code=404, detail="Pack introuvable")

        expires_at = (datetime.utcnow() + timedelta(days=pack["duration_days"])).strftime("%Y-%m-%d %H:%M:%S")
        cur.execute(
            "INSERT INTO purchases (user_id, pack_id, amount_mad, status, expires_at) VALUES (?, ?, ?, 'paid', ?)",
            (current_user["id"], pack["id"], pack["price_mad"], expires_at),
        )
        purchase_id = cur.lastrowid
        cur.execute(
            """SELECT purchases.*, tcf_packs.name AS pack_name
               FROM purchases JOIN tcf_packs ON purchases.pack_id = tcf_packs.id
               WHERE purchases.id = ?""",
            (purchase_id,),
        )
        row = cur.fetchone()

    return PurchaseOut(id=row["id"], pack_id=row["pack_id"], pack_name=row["pack_name"],
                        amount_mad=row["amount_mad"], status=row["status"], expires_at=row["expires_at"],
                        created_at=row["created_at"])


@router.post("/checkout-consultation/{booking_id}")
def checkout_consultation(booking_id: int):
    with db_cursor(commit=True) as cur:
        cur.execute("SELECT * FROM consultation_bookings WHERE id = ?", (booking_id,))
        booking = cur.fetchone()
        if not booking:
            raise HTTPException(status_code=404, detail="Réservation introuvable")
        cur.execute(
            "UPDATE consultation_bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?",
            (booking_id,),
        )
    return {"booking_id": booking_id, "payment_status": "paid", "status": "confirmed"}

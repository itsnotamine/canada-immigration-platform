from fastapi import APIRouter, Depends
from database import db_cursor
from schemas import PackOut, PurchaseOut
from deps import get_current_user

router = APIRouter(prefix="/api/packs", tags=["packs"])


def _pack_row_to_out(row) -> PackOut:
    return PackOut(
        id=row["id"], name=row["name"], description=row["description"], price_mad=row["price_mad"],
        original_price_mad=row["original_price_mad"], is_popular=bool(row["is_popular"]),
        duration_days=row["duration_days"], ai_correction_credits=row["ai_correction_credits"],
    )


@router.get("", response_model=list[PackOut])
def list_packs():
    with db_cursor() as cur:
        cur.execute("SELECT * FROM tcf_packs ORDER BY price_mad ASC")
        rows = cur.fetchall()
    return [_pack_row_to_out(r) for r in rows]


@router.get("/mine", response_model=list[PurchaseOut])
def my_purchases(current_user: dict = Depends(get_current_user)):
    with db_cursor() as cur:
        cur.execute(
            """SELECT purchases.*, tcf_packs.name AS pack_name
               FROM purchases JOIN tcf_packs ON purchases.pack_id = tcf_packs.id
               WHERE purchases.user_id = ? ORDER BY purchases.created_at DESC""",
            (current_user["id"],),
        )
        rows = cur.fetchall()
    return [
        PurchaseOut(id=r["id"], pack_id=r["pack_id"], pack_name=r["pack_name"],
                    amount_mad=r["amount_mad"], status=r["status"], expires_at=r["expires_at"],
                    created_at=r["created_at"])
        for r in rows
    ]

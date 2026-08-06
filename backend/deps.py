from fastapi import Header, HTTPException, status
from security import decode_token
from database import db_cursor


def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Non authentifié")
    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session invalide ou expirée")
    with db_cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id = ?", (payload["user_id"],))
        user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur introuvable")
    return dict(user)


def get_optional_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if not payload:
        return None
    with db_cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id = ?", (payload["user_id"],))
        user = cur.fetchone()
    return dict(user) if user else None

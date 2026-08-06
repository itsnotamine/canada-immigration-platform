from fastapi import APIRouter, HTTPException, Depends, status
from database import db_cursor
from security import hash_password, verify_password, create_token
from schemas import RegisterIn, LoginIn, TokenOut, UserOut
from deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn):
    with db_cursor(commit=True) as cur:
        cur.execute("SELECT id FROM users WHERE email = ?", (payload.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet email")

        password_hash, salt = hash_password(payload.password)
        cur.execute(
            "INSERT INTO users (email, password_hash, salt, full_name) VALUES (?, ?, ?, ?)",
            (payload.email, password_hash, salt, payload.full_name),
        )
        user_id = cur.lastrowid

    token = create_token(user_id, payload.email)
    return TokenOut(
        access_token=token,
        user=UserOut(id=user_id, full_name=payload.full_name, email=payload.email, is_admin=False),
    )


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn):
    with db_cursor() as cur:
        cur.execute("SELECT * FROM users WHERE email = ?", (payload.email,))
        user = cur.fetchone()

    if not user or not verify_password(payload.password, user["salt"], user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe incorrect")

    token = create_token(user["id"], user["email"])
    return TokenOut(
        access_token=token,
        user=UserOut(id=user["id"], full_name=user["full_name"], email=user["email"], is_admin=bool(user["is_admin"])),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        is_admin=bool(current_user["is_admin"]),
    )

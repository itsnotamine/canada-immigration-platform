"""
Auth "maison" en pur stdlib (pas de passlib / python-jose) :
- hachage de mot de passe : hashlib.pbkdf2_hmac (sécurisé, pas besoin de lib externe)
- jeton de session : payload JSON signé en HMAC-SHA256, encodé base64 (équivalent JWT simplifié)
"""
import hashlib
import hmac
import base64
import json
import os
import time
import secrets

SECRET_KEY = os.environ.get("APP_SECRET_KEY", "dev-secret-change-me-in-production")
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7  # 7 jours


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return digest.hex(), salt


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    digest, _ = hash_password(password, salt)
    return hmac.compare_digest(digest, expected_hash)


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_token(user_id: int, email: str) -> str:
    payload = {"user_id": user_id, "email": email, "exp": time.time() + TOKEN_TTL_SECONDS}
    payload_json = json.dumps(payload).encode()
    payload_b64 = _b64encode(payload_json)
    signature = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).digest()
    signature_b64 = _b64encode(signature)
    return f"{payload_b64}.{signature_b64}"


def decode_token(token: str) -> dict | None:
    try:
        payload_b64, signature_b64 = token.split(".")
        expected_sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64encode(expected_sig), signature_b64):
            return None
        payload = json.loads(_b64decode(payload_b64))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

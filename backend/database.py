"""
Couche d'accès aux données — SQLite via le module standard `sqlite3`.
Aucune dépendance externe (pas de SQLAlchemy) pour que le backend tourne
avec seulement fastapi + uvicorn déjà installés.
"""
import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def db_cursor(commit: bool = False):
    conn = get_connection()
    try:
        cur = conn.cursor()
        yield cur
        if commit:
            conn.commit()
    finally:
        conn.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consultation_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    program_interest TEXT NOT NULL,
    preferred_date TEXT,
    message TEXT,
    price_mad REAL NOT NULL DEFAULT 550.0,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- "tcf_packs" = formules d'accès : tous les tiers donnent accès à tout le
-- contenu (tests illimités), seules la durée d'accès et les corrections IA
-- incluses changent.
CREATE TABLE IF NOT EXISTS tcf_packs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_mad REAL NOT NULL,
    original_price_mad REAL,
    is_popular INTEGER NOT NULL DEFAULT 0,
    duration_days INTEGER NOT NULL,
    ai_correction_credits INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pack_id INTEGER NOT NULL,
    amount_mad REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid',
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (pack_id) REFERENCES tcf_packs(id)
);

CREATE TABLE IF NOT EXISTS tcf_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL, -- comprehension_orale | comprehension_ecrite
    niveau TEXT NOT NULL,  -- A1..C2 (indicatif)
    question_text TEXT NOT NULL,
    passage_or_audio_desc TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL -- 'a' | 'b' | 'c' | 'd'
);

CREATE TABLE IF NOT EXISTS tcf_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    section TEXT NOT NULL,
    nb_questions INTEGER NOT NULL,
    nb_correct INTEGER NOT NULL,
    score_tcf INTEGER NOT NULL,
    niveau_clb TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tcf_expression_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL, -- expression_ecrite | expression_orale
    prompt_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tcf_expression_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    section TEXT NOT NULL, -- expression_ecrite | expression_orale
    prompt TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'en_attente', -- en_attente | corrige
    feedback TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
"""


def init_db():
    with db_cursor(commit=True) as cur:
        cur.executescript(SCHEMA)

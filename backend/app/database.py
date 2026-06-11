from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from app.config import settings

DB_PATH = Path(settings.database_url.replace("sqlite:///", ""))
if not DB_PATH.is_absolute():
    DB_PATH = Path(__file__).resolve().parents[1] / DB_PATH


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                full_name TEXT NOT NULL,
                company TEXT,
                role TEXT NOT NULL DEFAULT 'Recruiter',
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS screenings (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                job_title TEXT NOT NULL,
                job_description TEXT NOT NULL,
                job_requirements_json TEXT NOT NULL,
                total_resumes INTEGER NOT NULL,
                top_score REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS candidates (
                id TEXT PRIMARY KEY,
                screening_id TEXT NOT NULL,
                candidate_name TEXT NOT NULL,
                resume_filename TEXT NOT NULL,
                score REAL NOT NULL,
                semantic_score REAL NOT NULL,
                rule_score REAL NOT NULL,
                matched_skills_json TEXT NOT NULL,
                missing_skills_json TEXT NOT NULL,
                strengths_json TEXT NOT NULL,
                weaknesses_json TEXT NOT NULL,
                recommendation TEXT NOT NULL,
                explanation TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(screening_id) REFERENCES screenings(id) ON DELETE CASCADE
            );
            """
        )


def row_to_user(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "email": row["email"],
        "full_name": row["full_name"],
        "company": row["company"],
        "role": row["role"],
    }


def dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def loads(value: str) -> Any:
    return json.loads(value)

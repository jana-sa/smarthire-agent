from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.agents.orchestrator import ScreeningOrchestrator
from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.config import settings
from app.database import dumps, get_connection, init_db, loads, row_to_user
from app.schemas import (
    AuthResponse,
    ScreeningResponse,
    ScreeningRunSummary,
    UserCreate,
    UserLogin,
    UserOut,
)
from app.services.anonymization import anonymize_resume_text
from app.services.file_parsers import extract_text_from_upload

app = FastAPI(title="SmartHire Agent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = ScreeningOrchestrator()


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/signup", response_model=AuthResponse)
def signup(payload: UserCreate) -> AuthResponse:
    email = payload.email.strip().lower()

    with get_connection() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,),
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists.",
            )

        cur = conn.execute(
            """
            INSERT INTO users (email, full_name, company, role, password_hash)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                email,
                payload.full_name.strip(),
                payload.company,
                "Recruiter",
                hash_password(payload.password),
            ),
        )

        row = conn.execute(
            "SELECT * FROM users WHERE id = ?",
            (cur.lastrowid,),
        ).fetchone()

    user = row_to_user(row)

    return AuthResponse(
        access_token=create_access_token(int(user["id"])),
        user=UserOut(**user),
    )


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: UserLogin) -> AuthResponse:
    email = payload.email.strip().lower()

    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not row or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    user = row_to_user(row)

    return AuthResponse(
        access_token=create_access_token(int(user["id"])),
        user=UserOut(**user),
    )


@app.get("/me", response_model=UserOut)
def me(current_user: Annotated[dict, Depends(get_current_user)]) -> UserOut:
    return UserOut(**current_user)


@app.post("/api/v1/screen", response_model=ScreeningResponse)
async def screen_candidates(
    current_user: Annotated[dict, Depends(get_current_user)],
    job_description_text: Annotated[str | None, Form()] = None,
    job_description_file: Annotated[UploadFile | None, File()] = None,
    resumes: Annotated[list[UploadFile], File(...)] = ...,
) -> ScreeningResponse:
    if not resumes:
        raise HTTPException(
            status_code=400,
            detail="At least one resume file is required.",
        )

    if not job_description_text and not job_description_file:
        raise HTTPException(
            status_code=400,
            detail="Provide job_description_text or job_description_file.",
        )

    if job_description_file:
        job_description = await extract_text_from_upload(
            job_description_file,
            max_file_size_mb=settings.max_file_size_mb,
        )
    else:
        job_description = (job_description_text or "").strip()

    parsed_resumes: list[tuple[str, str]] = []

    for upload in resumes:
        resume_text = await extract_text_from_upload(
            upload,
            max_file_size_mb=settings.max_file_size_mb,
        )

        filename = upload.filename or "candidate"
        parsed_resumes.append(
            (
                filename,
                anonymize_resume_text(resume_text),
            )
        )

    result = orchestrator.run(
        job_description=job_description,
        resumes=parsed_resumes,
    )

    screening_id = f"run_{uuid.uuid4().hex[:12]}"
    top_score = result.candidates[0].score if result.candidates else 0

    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO screenings
            (id, user_id, job_title, job_description, job_requirements_json, total_resumes, top_score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                screening_id,
                int(current_user["id"]),
                result.job_requirements.title or "Screening Run",
                job_description,
                result.job_requirements.model_dump_json(),
                len(result.candidates),
                top_score,
            ),
        )

        for candidate in result.candidates:
            candidate_id = f"cand_{uuid.uuid4().hex[:12]}"

            conn.execute(
                """
                INSERT INTO candidates
                (
                    id,
                    screening_id,
                    candidate_name,
                    resume_filename,
                    score,
                    semantic_score,
                    rule_score,
                    matched_skills_json,
                    missing_skills_json,
                    strengths_json,
                    weaknesses_json,
                    recommendation,
                    explanation
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    candidate_id,
                    screening_id,
                    candidate.candidate_name,
                    candidate.candidate_name,
                    candidate.score,
                    candidate.semantic_score,
                    candidate.rule_score,
                    dumps(candidate.matched_skills),
                    dumps(candidate.missing_skills),
                    dumps(getattr(candidate, "strengths", [])),
                    dumps(getattr(candidate, "weaknesses", [])),
                    getattr(candidate, "recommendation", ""),
                    candidate.explanation,
                ),
            )

    result.id = screening_id
    result.job_title = result.job_requirements.title or "Screening Run"
    result.total_resumes = len(result.candidates)

    return result


@app.get("/screening/history", response_model=list[ScreeningRunSummary])
def screening_history(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> list[ScreeningRunSummary]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, job_title, created_at, total_resumes, top_score
            FROM screenings
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (int(current_user["id"]),),
        ).fetchall()

    return [ScreeningRunSummary(**dict(row)) for row in rows]


@app.get("/screening/{screening_id}", response_model=ScreeningResponse)
def screening_result(
    screening_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> ScreeningResponse:
    with get_connection() as conn:
        run = conn.execute(
            """
            SELECT *
            FROM screenings
            WHERE id = ? AND user_id = ?
            """,
            (
                screening_id,
                int(current_user["id"]),
            ),
        ).fetchone()

        if not run:
            raise HTTPException(
                status_code=404,
                detail="Screening run not found.",
            )

        candidates = conn.execute(
            """
            SELECT *
            FROM candidates
            WHERE screening_id = ?
            ORDER BY score DESC
            """,
            (screening_id,),
        ).fetchall()

    return {
        "id": run["id"],
        "job_title": run["job_title"],
        "created_at": run["created_at"],
        "job_requirements": loads(run["job_requirements_json"]),
        "total_resumes": run["total_resumes"],
       "candidates": [
    {
        "candidate_name": row["candidate_name"],
        "name": row["candidate_name"],
        "resume_filename": row["resume_filename"],
        "score": row["score"],
        "overall_score": row["score"],
        "explanation": row["explanation"],
        "semantic_score": row["semantic_score"],
        "rule_score": row["rule_score"],
        "matched_skills": loads(row["matched_skills_json"]),
        "missing_skills": loads(row["missing_skills_json"]),
        "strengths": loads(row["strengths_json"]),
        "weaknesses": loads(row["weaknesses_json"]),
        "recommendation": row["recommendation"],
    }
    for row in candidates
  ],
    }


@app.delete("/screening/{screening_id}")
def delete_screening(
    screening_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict[str, bool]:
    with get_connection() as conn:
        conn.execute(
            "DELETE FROM candidates WHERE screening_id = ?",
            (screening_id,),
        )

        conn.execute(
            """
            DELETE FROM screenings
            WHERE id = ? AND user_id = ?
            """,
            (
                screening_id,
                int(current_user["id"]),
            ),
        )

    return {"ok": True}
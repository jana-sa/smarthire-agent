from __future__ import annotations

import json
import re

import google.generativeai as genai

from app.config import settings
from app.schemas import JobRequirements


class ParserAgent:
    """
    Parser Agent (ADK-style):
    Converts free-form JD text into structured requirements JSON.
    """

    def __init__(self) -> None:
        self._model = None
        if settings.google_api_key:
            genai.configure(api_key=settings.google_api_key)
            self._model = genai.GenerativeModel(settings.gemini_model)

    def parse(self, job_description: str) -> JobRequirements:
        if self._model:
            parsed = self._parse_with_llm(job_description)
            if parsed:
                return parsed
        return self._parse_with_heuristics(job_description)

    def _parse_with_llm(self, job_description: str) -> JobRequirements | None:
        prompt = f"""
You are a hiring assistant.
Extract job requirements into valid JSON only with this exact schema:
{{
  "title": "string",
  "skills": ["string"],
  "experience_years": 0,
  "qualifications": ["string"],
  "nice_to_have": ["string"]
}}

Rules:
- Only output JSON (no markdown, no extra text).
- Keep skills short and standardized.
- experience_years must be integer.

Job Description:
{job_description}
"""
        try:
            response = self._model.generate_content(prompt)
            text = response.text.strip()
            data = json.loads(text)
            return JobRequirements(**data)
        except Exception:
            return None

    def _parse_with_heuristics(self, job_description: str) -> JobRequirements:
        text = job_description.strip()
        lower = text.lower()

        possible_skills = [
            "python",
            "fastapi",
            "django",
            "flask",
            "sql",
            "postgresql",
            "mysql",
            "mongodb",
            "docker",
            "kubernetes",
            "aws",
            "gcp",
            "azure",
            "react",
            "next.js",
            "typescript",
            "machine learning",
            "nlp",
            "pytorch",
            "tensorflow",
            "git",
        ]
        skills = [skill for skill in possible_skills if skill in lower]

        exp_match = re.search(r"(\d+)\+?\s+years?\s+of\s+experience", lower)
        experience_years = int(exp_match.group(1)) if exp_match else 0

        qualifications: list[str] = []
        for key in ["bachelor", "master", "phd", "computer science", "engineering"]:
            if key in lower:
                qualifications.append(key)

        title = text.splitlines()[0][:80] if text else "Unknown Role"
        return JobRequirements(
            title=title,
            skills=skills,
            experience_years=experience_years,
            qualifications=qualifications,
            nice_to_have=[],
        )

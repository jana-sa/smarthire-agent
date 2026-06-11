from __future__ import annotations

import re

from app.schemas import JobRequirements


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def extract_years_of_experience(text: str) -> int:
    lower = normalize_text(text)
    patterns = [
        r"(\d+)\+?\s+years?\s+of\s+experience",
        r"experience\s*[:\-]?\s*(\d+)\+?\s+years?",
        r"(\d+)\+?\s+yrs?\s+experience",
    ]
    years: list[int] = []
    for pattern in patterns:
        for match in re.findall(pattern, lower):
            try:
                years.append(int(match))
            except ValueError:
                continue
    return max(years) if years else 0


def compute_rule_score(job: JobRequirements, resume_text: str) -> tuple[float, list[str], list[str]]:
    resume_norm = normalize_text(resume_text)

    required_skills = [skill.strip().lower() for skill in job.skills if skill.strip()]
    matched_skills = [skill for skill in required_skills if skill in resume_norm]
    missing_skills = [skill for skill in required_skills if skill not in resume_norm]

    if required_skills:
        skills_score = len(matched_skills) / len(required_skills)
    else:
        skills_score = 1.0

    candidate_years = extract_years_of_experience(resume_norm)
    if job.experience_years <= 0:
        experience_score = 1.0
    else:
        experience_score = min(candidate_years / job.experience_years, 1.0)

    qualification_hits = 0
    qualifications = [q.strip().lower() for q in job.qualifications if q.strip()]
    for qualification in qualifications:
        if qualification in resume_norm:
            qualification_hits += 1
    qualification_score = (
        qualification_hits / len(qualifications) if qualifications else 1.0
    )

    # Weighted simple rule-based score
    rule_score = (0.6 * skills_score) + (0.25 * experience_score) + (0.15 * qualification_score)
    rule_score = max(0.0, min(1.0, rule_score))
    return rule_score, matched_skills, missing_skills


def build_explanation(
    final_score: float,
    semantic_score: float,
    rule_score: float,
    matched_skills: list[str],
    missing_skills: list[str],
) -> str:
    matched_str = ", ".join(matched_skills[:5]) if matched_skills else "none"
    missing_str = ", ".join(missing_skills[:5]) if missing_skills else "none"
    return (
        f"Overall fit score is {final_score:.1f}/100. "
        f"Semantic relevance: {semantic_score * 100:.1f}%, rule match: {rule_score * 100:.1f}%. "
        f"Matched skills: {matched_str}. Missing key skills: {missing_str}."
    )

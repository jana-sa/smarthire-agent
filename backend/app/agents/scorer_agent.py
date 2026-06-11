from __future__ import annotations

from app.schemas import CandidateScore, JobRequirements
from app.services.scoring import build_explanation, compute_rule_score
from app.services.similarity import SimilarityService


class ScorerAgent:
    """
    Scorer Agent:
    Evaluates candidate resume text against parsed job requirements.
    Uses hybrid scoring:
    - 30% semantic similarity
    - 70% rule-based required skill matching
    Also applies a penalty for missing required skills.
    """

    def __init__(self) -> None:
        self.similarity_service = SimilarityService()

    def score_resume(
        self,
        candidate_name: str,
        job: JobRequirements,
        resume_text: str,
    ) -> CandidateScore:
        job_summary = self._job_as_text(job)

        semantic_score = self.similarity_service.cosine_similarity(
            job_summary,
            resume_text,
        )

        rule_score, matched_skills, missing_skills = compute_rule_score(
            job,
            resume_text,
        )

        # More realistic scoring:
        # Exact skill matching should matter more than general text similarity.
        semantic_weight = 0.20
        rule_weight = 0.80

        final_score = (
            (semantic_score * 100.0 * semantic_weight)
            + (rule_score * 100.0 * rule_weight)
        )

        # Penalize candidates missing many required skills.
        missing_skill_penalty = len(missing_skills) * 2.0
        final_score -= missing_skill_penalty

        # Keep score between 0 and 100.
        final_score = max(0.0, min(100.0, final_score))

        explanation = build_explanation(
            final_score=final_score,
            semantic_score=semantic_score,
            rule_score=rule_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
        )

        return CandidateScore(
            candidate_name=candidate_name,
            score=round(final_score, 2),
            explanation=explanation,
            semantic_score=round(semantic_score, 4),
            rule_score=round(rule_score, 4),
            matched_skills=matched_skills,
            missing_skills=missing_skills,
        )

    @staticmethod
    def _job_as_text(job: JobRequirements) -> str:
        return (
            f"Role: {job.title}. "
            f"Skills: {', '.join(job.skills)}. "
            f"Experience required: {job.experience_years} years. "
            f"Qualifications: {', '.join(job.qualifications)}. "
            f"Nice to have: {', '.join(job.nice_to_have)}."
        )
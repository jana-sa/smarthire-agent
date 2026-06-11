from __future__ import annotations

from app.agents.adk_workflow import root_agent
from app.agents.parser_agent import ParserAgent
from app.agents.scorer_agent import ScorerAgent
from app.schemas import ScreeningResponse


class ScreeningOrchestrator:
    """
    Sequential multi-agent pipeline:
    Parser -> structured JSON -> Scorer -> ranked output.
    """

    def __init__(self) -> None:
        self.parser_agent = ParserAgent()
        self.scorer_agent = ScorerAgent()
        self.adk_root_agent = root_agent

    def run(
        self, job_description: str, resumes: list[tuple[str, str]]
    ) -> ScreeningResponse:
        parsed_job = self.parser_agent.parse(job_description)

        scored = [
            self.scorer_agent.score_resume(name, parsed_job, text)
            for name, text in resumes
        ]

        ranked = sorted(
            scored,
            key=lambda candidate: candidate.score,
            reverse=True
        )

        return ScreeningResponse(
            job_requirements=parsed_job,
            candidates=ranked
        )
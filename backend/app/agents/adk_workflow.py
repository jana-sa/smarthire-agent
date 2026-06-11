from __future__ import annotations

from google.adk.agents import Agent


parser_adk_agent = Agent(
    name="parser_agent",
    model="gemini-2.0-flash",
    instruction="""
You are the Parser Agent for SmartHire Agent.
Extract structured hiring requirements from a job description:
- required skills
- preferred skills
- experience years
- education
- responsibilities
- certifications
Return structured output.
""",
)

scorer_adk_agent = Agent(
    name="scorer_agent",
    model="gemini-2.0-flash",
    instruction="""
You are the Scorer Agent for SmartHire Agent.
Evaluate resume text against parsed job requirements.
Identify:
- matched skills
- missing skills
- strengths
- weaknesses
- recommendation
- score reasoning
Return recruiter-style feedback.
""",
)

root_agent = Agent(
    name="smarthire_root_agent",
    model="gemini-2.0-flash",
    instruction="""
You are the root coordinator for SmartHire Agent.
Coordinate a two-step workflow:
1. Parser Agent extracts job requirements.
2. Scorer Agent evaluates resumes against those requirements.

Use the parser and scorer roles to produce explainable resume screening results.
""",
    sub_agents=[parser_adk_agent, scorer_adk_agent],
)
from pydantic import BaseModel, Field


class JobRequirements(BaseModel):
    title: str = ""
    skills: list[str] = Field(default_factory=list)
    experience_years: int = 0
    qualifications: list[str] = Field(default_factory=list)
    nice_to_have: list[str] = Field(default_factory=list)


class CandidateScore(BaseModel):
    candidate_name: str
    score: float
    explanation: str
    semantic_score: float
    rule_score: float
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    recommendation: str = ""


class ScreeningResponse(BaseModel):
    id: str | None = None
    job_title: str | None = None
    created_at: str | None = None
    job_requirements: JobRequirements
    candidates: list[CandidateScore]
    total_resumes: int | None = None


class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str = Field(min_length=8)
    company: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    company: str | None = None
    role: str = "Recruiter"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ScreeningRunSummary(BaseModel):
    id: str
    job_title: str
    created_at: str
    total_resumes: int
    top_score: float

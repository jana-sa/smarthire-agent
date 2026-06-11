import type {
  Candidate,
  JobRequirements,
  ScreeningResult,
  ScreeningRunSummary,
  User,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const USE_MOCK_AUTH = false;
const USE_MOCK_HISTORY = false;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("smarthire_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.detail ?? `Request failed: ${res.status}`);
    } catch {
      throw new Error(text || `Request failed: ${res.status}`);
    }
  }

  return res.json();
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export async function login(email: string, password: string): Promise<User> {
  if (USE_MOCK_AUTH) {
    await delay(700);
    if (!email || !password) throw new Error("Email and password are required");

    const user: User = {
      id: "u_1",
      email,
      full_name: email.split("@")[0].replace(/\./g, " "),
      company: "Acme Inc.",
      role: "Talent Acquisition Lead",
    };

    localStorage.setItem("smarthire_token", "mock_token_123");
    localStorage.setItem("smarthire_user", JSON.stringify(user));
    return user;
  }

  const data = await request<{ access_token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("smarthire_token", data.access_token);
  localStorage.setItem("smarthire_user", JSON.stringify(data.user));
  return data.user;
}

export async function signup(
  full_name: string,
  email: string,
  password: string,
  company?: string,
): Promise<User> {
  if (USE_MOCK_AUTH) {
    await delay(900);

    const user: User = {
      id: "u_new",
      email,
      full_name,
      company,
      role: "Recruiter",
    };

    localStorage.setItem("smarthire_token", "mock_token_123");
    localStorage.setItem("smarthire_user", JSON.stringify(user));
    return user;
  }

  const data = await request<{ access_token: string; user: User }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ full_name, email, password, company }),
  });

  localStorage.setItem("smarthire_token", data.access_token);
  localStorage.setItem("smarthire_user", JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem("smarthire_token");
  localStorage.removeItem("smarthire_user");
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("smarthire_user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function updateProfile(updates: Partial<User>): Promise<User> {
  const current = getCurrentUser();
  if (!current) throw new Error("Not authenticated");

  if (USE_MOCK_AUTH) {
    await delay(500);
    const next = { ...current, ...updates };
    localStorage.setItem("smarthire_user", JSON.stringify(next));
    return next;
  }

  const next = { ...current, ...updates };
  localStorage.setItem("smarthire_user", JSON.stringify(next));
  return next;
}

/* -------------------------------------------------------------------------- */
/* Screening                                                                  */
/* -------------------------------------------------------------------------- */

// Backend response'unu frontend'in beklediği shape'e çeviriyoruz
function mapBackendResponseToScreeningResult(data: any): ScreeningResult {
  const candidates: Candidate[] = (data.candidates ?? []).map((candidate: any, index: number) => ({
    id: candidate.id ?? `c_${index}`,
    name: candidate.name ?? candidate.resume_filename ?? `Candidate ${index + 1}`,
    email: candidate.email ?? "",
    phone: candidate.phone ?? "",
    semantic_score: Math.round(((candidate.semantic_score ?? candidate.semantic_similarity_score ?? 0) <= 1 ? (candidate.semantic_score ?? candidate.semantic_similarity_score ?? 0) * 100 : (candidate.semantic_score ?? candidate.semantic_similarity_score ?? 0))),
    rule_based_score: Math.round(((candidate.rule_based_score ?? candidate.rule_score ?? 0) <= 1 ? (candidate.rule_based_score ?? candidate.rule_score ?? 0) * 100 : (candidate.rule_based_score ?? candidate.rule_score ?? 0))),
    overall_score:
      candidate.overall_score ??
      candidate.score ??
      0,
    matched_skills: candidate.matched_skills ?? [],
    missing_skills: candidate.missing_skills ?? [],
    strengths: candidate.strengths ?? [],
    weaknesses: candidate.weaknesses ?? [],
    recommendation: candidate.recommendation ?? "",
    experience_years: candidate.experience_years ?? 0,
    explanation: candidate.explanation ?? "No explanation provided.",
    resume_filename: candidate.resume_filename ?? candidate.name ?? `candidate_${index + 1}.pdf`,
  }));

  const jobRequirements: JobRequirements = {
    title:
      data.job_title ??
      data.job_requirements?.title ??
      "Screening Run",
    required_skills:
      data.job_requirements?.required_skills ??
      data.job_requirements?.skills ??
      [],
    preferred_skills:
      data.job_requirements?.preferred_skills ??
      data.job_requirements?.nice_to_have ??
      [],
    experience_years:
      data.job_requirements?.experience_years ?? 0,
    education:
      data.job_requirements?.education ??
      data.job_requirements?.qualifications?.join?.(", ") ??
      "",
    responsibilities:
      data.job_requirements?.responsibilities ?? [],
  };

  return {
    id: data.id ?? `run_${Date.now()}`,
    job_title: data.job_title ?? jobRequirements.title,
    created_at: data.created_at ?? new Date().toISOString(),
    job_requirements: jobRequirements,
    candidates,
    total_resumes: data.total_resumes ?? candidates.length,
  };
}

function saveScreeningToLocalHistory(result: ScreeningResult) {
  const history = getHistorySync();

  history.unshift({
    id: result.id,
    job_title: result.job_title,
    created_at: result.created_at,
    total_resumes: result.total_resumes,
    top_score: result.candidates[0]?.overall_score ?? 0,
  });

  localStorage.setItem("smarthire_history", JSON.stringify(history));
  localStorage.setItem(`smarthire_run_${result.id}`, JSON.stringify(result));
}

export async function submitScreening(
  jobDescription: string,
  resumes: File[],
): Promise<ScreeningResult> {
  if (!jobDescription.trim()) {
    throw new Error("Job description is required");
  }

  if (resumes.length === 0) {
    throw new Error("Upload at least one resume");
  }

  const form = new FormData();
  form.append("job_description_text", jobDescription);

  resumes.forEach((file) => {
    form.append("resumes", file);
  });

  const token = localStorage.getItem("smarthire_token");

  const res = await fetch(`${API_BASE_URL}/api/v1/screen`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.detail ?? "Screening failed");
    } catch {
      throw new Error(text || "Screening failed");
    }
  }

  const backendData = await res.json();
  const mappedResult = mapBackendResponseToScreeningResult(backendData);

  saveScreeningToLocalHistory(mappedResult);

  return mappedResult;
}

/* -------------------------------------------------------------------------- */
/* History                                                                    */
/* -------------------------------------------------------------------------- */

function getHistorySync(): ScreeningRunSummary[] {
  const raw = localStorage.getItem("smarthire_history");
  return raw ? (JSON.parse(raw) as ScreeningRunSummary[]) : [];
}

export async function getHistory(): Promise<ScreeningRunSummary[]> {
  if (USE_MOCK_HISTORY) {
    await delay(400);
    return getHistorySync();
  }

  return request<ScreeningRunSummary[]>("/screening/history");
}

export async function getScreeningResult(id: string): Promise<ScreeningResult> {
  if (USE_MOCK_HISTORY) {
    await delay(300);
    const raw = localStorage.getItem(`smarthire_run_${id}`);
    if (!raw) throw new Error("Screening run not found");
    return JSON.parse(raw) as ScreeningResult;
  }

  const data = await request<any>(`/screening/${id}`);
  return mapBackendResponseToScreeningResult(data);
}

export async function deleteScreening(id: string): Promise<void> {
  if (USE_MOCK_HISTORY) {
    await delay(300);
    localStorage.removeItem(`smarthire_run_${id}`);
    const history = getHistorySync().filter((r) => r.id !== id);
    localStorage.setItem("smarthire_history", JSON.stringify(history));
    return;
  }

  await request<void>(`/screening/${id}`, { method: "DELETE" });
}
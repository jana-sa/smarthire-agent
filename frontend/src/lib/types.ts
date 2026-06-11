export interface JobRequirements {
  title: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_years: number;
  education: string;
  responsibilities: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  semantic_score: number; // 0-100
  rule_based_score: number; // 0-100
  overall_score: number; // 0-100
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  experience_years: number;
  explanation: string;
  resume_filename: string;
}

export interface ScreeningResult {
  id: string;
  job_title: string;
  created_at: string;
  job_requirements: JobRequirements;
  candidates: Candidate[];
  total_resumes: number;
}

export interface ScreeningRunSummary {
  id: string;
  job_title: string;
  created_at: string;
  total_resumes: number;
  top_score: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  role?: string;
}

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Search,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { getScreeningResult } from "@/lib/api";
import type { Candidate, ScreeningResult } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";

const getCandidateDisplayName = (candidate: Candidate, rank?: number) => {
  return (
    candidate.resume_filename ||
    candidate.name ||
    (rank ? `Candidate ${rank}` : "Candidate")
  );
};

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);

    getScreeningResult(id)
      .then((r) => mounted && setResult(r))
      .catch((e) => mounted && setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  const filteredCandidates = useMemo(() => {
    const candidates = result?.candidates ?? [];
    const q = query.trim().toLowerCase();

    if (!q) return candidates;

    return candidates.filter((candidate) =>
      [
        candidate.name,
        candidate.resume_filename,
        candidate.email,
        candidate.recommendation,
        ...candidate.matched_skills,
        ...candidate.missing_skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query, result]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading screening results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <EmptyState
        icon={XCircle}
        title="Could not load results"
        description={error ?? "This screening run was not found."}
        actionLabel="Back to dashboard"
        onAction={() => window.history.back()}
      />
    );
  }

  const req = result.job_requirements;
  const top = result.candidates[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1 h-7 text-muted-foreground">
            <Link to="/history">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              All runs
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {result.job_title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {result.total_resumes} resumes screened · {new Date(result.created_at).toLocaleString()}
          </p>
        </div>

        <Badge variant="secondary" className="bg-success/10 text-success">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      </div>

      <Card className="overflow-hidden shadow-elegant">
        <div className="border-b border-border bg-gradient-card px-6 py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Parsed Job Requirements</h2>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Required skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {req.required_skills.map((s) => (
                <Badge key={s} className="bg-primary/10 text-primary hover:bg-primary/15">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferred skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {req.preferred_skills.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Experience
            </p>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Award className="h-4 w-4 text-primary" />
              {req.experience_years}+ years
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Education
            </p>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-primary" />
              {req.education || "Not specified"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Key responsibilities
            </p>
            <ul className="space-y-1">
              {req.responsibilities.length === 0 && (
                <li className="text-sm text-muted-foreground">No responsibilities extracted.</li>
              )}

              {req.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {top && (
        <Card className="bg-gradient-hero p-6 text-primary-foreground shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Top match
              </p>
              <p className="mt-1 text-2xl font-bold">
                {getCandidateDisplayName(top, 1)}
              </p>
              <p className="text-sm opacity-90">
                {top.matched_skills.length
                  ? top.matched_skills.slice(0, 4).join(" · ")
                  : "No matched skills detected"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-5xl font-bold">{top.overall_score}</p>
              <p className="text-xs uppercase tracking-wider opacity-80">
                Overall score
              </p>
            </div>
          </div>
        </Card>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Ranked Candidates</h2>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates, files or skills..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredCandidates.map((c, idx) => (
            <CandidateCard key={c.id} candidate={c} rank={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

function CandidateCard({ candidate, rank }: { candidate: Candidate; rank: number }) {
  const [open, setOpen] = useState(rank === 1);
  const displayName = getCandidateDisplayName(candidate, rank);
  const internalName =
    candidate.name && candidate.name !== displayName ? candidate.name : "";

  return (
    <Card className="overflow-hidden transition-smooth hover:shadow-elegant">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-4 px-6 py-4 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
              {rank}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{displayName}</p>

              <p className="truncate text-xs text-muted-foreground">
                Rank #{rank}
                {internalName ? ` · ${internalName}` : ""}
                {candidate.experience_years ? ` · ${candidate.experience_years}y exp` : " · 0y exp"}
              </p>
            </div>

            <div className="hidden items-center gap-4 sm:flex">
              <ScoreRing score={candidate.overall_score} size={56} label="Overall" />
            </div>

            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-base ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border bg-muted/20 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Score breakdown
                </p>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">Semantic match</span>
                    <span className="font-semibold text-primary">{candidate.semantic_score}</span>
                  </div>
                  <Progress value={candidate.semantic_score} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    AI similarity to JD
                  </p>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">Rule-based match</span>
                    <span className="font-semibold text-primary">{candidate.rule_based_score}</span>
                  </div>
                  <Progress value={candidate.rule_based_score} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Skills + experience rules
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Matched skills
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matched_skills.length === 0 && (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}

                    {candidate.matched_skills.map((s) => (
                      <Badge key={s} className="bg-success/10 text-success hover:bg-success/15">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Missing skills
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missing_skills.length === 0 && (
                      <Badge variant="secondary">All requirements covered</Badge>
                    )}

                    {candidate.missing_skills.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="border border-destructive/20 bg-destructive/5 text-destructive"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI explanation
                  </p>
                  <p className="rounded-md border border-border bg-card p-3 text-sm leading-relaxed">
                    {candidate.explanation}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recruiter feedback
                  </p>

                  <div className="rounded-md border border-border bg-card p-3 text-sm">
                    <p className="font-medium text-primary">
                      {candidate.recommendation || "Review recommended"}
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <FeedbackList title="Strengths" items={candidate.strengths} tone="success" />
                      <FeedbackList title="Watch-outs" items={candidate.weaknesses} tone="destructive" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-sm">
                  {candidate.email && (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {candidate.email}
                    </a>
                  )}

                  {candidate.phone && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {candidate.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "destructive";
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{title}</p>

      <ul className="space-y-1">
        {(items.length ? items : ["No details available"]).map((item) => (
          <li key={item} className="flex gap-1.5 text-xs">
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                tone === "success" ? "bg-success" : "bg-destructive"
              }`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Results;
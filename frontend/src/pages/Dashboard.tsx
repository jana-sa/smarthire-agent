import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileText, Loader2, ShieldCheck, Sparkles, Trash2, Upload, Users, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getHistory, submitScreening } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_JD = `Senior Backend Engineer

We're looking for a senior backend engineer to join our platform team.

Required:
- 3+ years building production APIs in Python (FastAPI/Django)
- Strong PostgreSQL and SQL experience
- React + TypeScript familiarity for full-stack collaboration

Nice to have:
- AWS, Docker, Kubernetes
- LLM/RAG experience`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [jd, setJd] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getHistory().then(setHistory).catch(() => undefined);
  }, []);

  const analytics = useMemo(() => {
    const totalCandidates = history.reduce((sum, run) => sum + run.total_resumes, 0);
    const averageTopScore = history.length ? Math.round(history.reduce((sum, run) => sum + run.top_score, 0) / history.length) : 0;
    return { totalRuns: history.length, totalCandidates, averageTopScore };
  }, [history]);

  const onDrop = useCallback((accepted: File[]) => {
    setResumes((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const next = accepted.filter((f) => !names.has(f.name));
      return [...prev, ...next];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  const removeResume = (name: string) => setResumes((prev) => prev.filter((f) => f.name !== name));

  const handleSubmit = async () => {
    if (!jd.trim()) {
      toast.error("Please add a job description");
      return;
    }
    if (resumes.length === 0) {
      toast.error("Please upload at least one resume");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitScreening(jd, resumes);
      toast.success(`Screened ${result.total_resumes} resumes successfully`);
      navigate(`/results/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Screening failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">New Screening</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a job description and upload candidate resumes to generate a ranked shortlist.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={BarChart3} label="Screening runs" value={analytics.totalRuns} />
        <MetricCard icon={Users} label="Candidates analyzed" value={analytics.totalCandidates} />
        <MetricCard icon={ShieldCheck} label="Avg. top score" value={analytics.averageTopScore ? `${analytics.averageTopScore}%` : "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* JD card */}
        <Card className="p-6 shadow-elegant">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Job Description</Label>
              <p className="text-xs text-muted-foreground">Paste the JD or job posting text</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setJd(SAMPLE_JD)}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Use sample
            </Button>
          </div>
          <Textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste your job description here..."
            className="min-h-[280px] resize-none font-mono text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">{jd.length} characters</p>
        </Card>

        {/* Resumes card */}
        <Card className="p-6 shadow-elegant">
          <div className="mb-4">
            <Label className="text-base font-semibold">Candidate Resumes</Label>
            <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT — multiple files supported</p>
          </div>

          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-base hover:border-primary hover:bg-primary-soft/40",
              isDragActive && "border-primary bg-primary-soft/60",
            )}
          >
            <input {...getInputProps()} />
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {isDragActive ? "Drop the files here" : "Drag & drop resumes, or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Up to 50 files at once</p>
          </div>

          {resumes.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{resumes.length} file{resumes.length !== 1 && "s"} selected</p>
                <Button variant="ghost" size="sm" onClick={() => setResumes([])} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                  <Trash2 className="mr-1 h-3 w-3" /> Clear all
                </Button>
              </div>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {resumes.map((f) => (
                  <div key={f.name} className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm animate-fade-in">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate font-medium">{f.name}</span>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">{(f.size / 1024).toFixed(0)} KB</Badge>
                    </div>
                    <button onClick={() => removeResume(f.name)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 bg-gradient-card p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">Ready to screen {resumes.length || "your"} candidate{resumes.length !== 1 && "s"}?</p>
          <p className="text-sm text-muted-foreground">Average run time: ~30 seconds for 10 resumes.</p>
        </div>
        <Button size="lg" onClick={handleSubmit} disabled={submitting} className="w-full shadow-glow sm:w-auto">
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Screening...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Run Screening</>
          )}
        </Button>
      </Card>
    </div>
  );
};

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="p-5 shadow-elegant">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default Dashboard;

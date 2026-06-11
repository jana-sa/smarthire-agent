import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileSearch, Loader2, Trash2, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteScreening, getHistory } from "@/lib/api";
import type { ScreeningRunSummary } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

const History = () => {
  const [runs, setRuns] = useState<ScreeningRunSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getHistory()
      .then(setRuns)
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteScreening(id);
      toast.success("Screening deleted");
      load();
    } catch {
      toast.error("Could not delete");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Screening History</h1>
        <p className="mt-1 text-sm text-muted-foreground">All your previous screening runs.</p>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !runs || runs.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No screening runs yet"
          description="Upload a job description and resumes to run your first screening."
          actionLabel="Start screening"
          onAction={() => (window.location.href = "/dashboard")}
        />
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <Card key={run.id} className="flex flex-wrap items-center justify-between gap-4 p-5 transition-smooth hover:shadow-elegant">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                  <FileSearch className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{run.job_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(run.created_at).toLocaleString()} · {run.total_resumes} resumes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Top: {run.top_score}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(run.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/results/${run.id}`}>
                    View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

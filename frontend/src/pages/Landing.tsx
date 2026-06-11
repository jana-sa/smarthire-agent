import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileSearch,
  Gauge,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI-Powered Parsing", desc: "Extract structured requirements from any JD and skills, experience, and intent from any resume — instantly." },
  { icon: Gauge, title: "Dual Scoring Engine", desc: "Combine semantic similarity with rule-based matching for ranked, explainable candidate scores." },
  { icon: FileSearch, title: "Bulk Resume Screening", desc: "Drop dozens of resumes at once. Get a ranked shortlist with reasoning in seconds, not days." },
  { icon: ShieldCheck, title: "Bias-Aware", desc: "Transparent scoring rules and explanations help you build a fairer, defensible hiring process." },
  { icon: Zap, title: "Lightning Fast", desc: "Built on a modern Python backend — process 100+ resumes per JD with sub-minute latency." },
  { icon: Users, title: "Built for Teams", desc: "Share screening runs, save history, and collaborate with hiring managers in one workspace." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-base hover:text-foreground">Features</a>
            <a href="#how" className="text-sm font-medium text-muted-foreground transition-base hover:text-foreground">How it works</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-base hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI screening that actually explains itself
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl">
             Screen 100 resumes in <span className="text-primary">60 seconds</span>.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              SmartHire Agent parses your job description, ranks every candidate with a dual scoring model, and tells you exactly why — so you hire faster, fairer, and smarter.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="shadow-glow" asChild>
                <Link to="/signup">
                  Start screening free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">View demo</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />GDPR compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />Cancel anytime</span>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="mx-auto mt-16 max-w-4xl animate-scale-in">
            <Card className="overflow-hidden border-border/60 shadow-card">
              <div className="border-b border-border bg-muted/40 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                </div>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-3">
                {[
                  { name: "Priya Patel", score: 94, role: "Senior Backend Engineer" },
                  { name: "Alex Chen", score: 87, role: "Senior Backend Engineer" },
                  { name: "Maya Rivera", score: 81, role: "Senior Backend Engineer" },
                ].map((c) => (
                  <div key={c.name} className="rounded-lg border border-border bg-card p-4 transition-smooth hover:shadow-elegant">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                        {c.name.split(" ").map((p) => p[0]).join("")}
                      </div>
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                        {c.score}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Everything you need to hire smarter</h2>
            <p className="text-lg text-muted-foreground">Modern recruiters need modern tools. SmartHire Agent puts AI to work where it matters most.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="group p-6 transition-smooth hover:-translate-y-1 hover:shadow-card">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-card text-primary transition-smooth group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Three steps to a shortlist</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Drop your JD", d: "Paste or upload the job description. Our AI extracts the key requirements and skills." },
              { n: "02", t: "Upload resumes", d: "Add one or hundreds of resumes. PDFs, DOCX — we handle the parsing." },
              { n: "03", t: "Get ranked results", d: "Receive a scored, ranked shortlist with explanations for every candidate." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="mb-4 text-4xl font-bold text-primary/30">{s.n}</div>
                <h3 className="mb-2 text-xl font-semibold">{s.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-hero p-12 text-center shadow-card md:p-20">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
                Ready to hire 10× faster?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/90">
                Join forward-thinking teams who use SmartHire Agent to make better hiring decisions every day.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/signup">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <Logo />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SmartHire Agent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

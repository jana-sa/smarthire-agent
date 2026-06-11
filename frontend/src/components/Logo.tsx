import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  to?: string;
}

export function Logo({ className, to = "/" }: LogoProps) {
  return (
    <Link to={to} className={cn("flex items-center gap-2 group", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero shadow-glow transition-smooth group-hover:scale-105">
        <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight text-foreground">SmartHire</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">Agent</span>
      </div>
    </Link>
  );
}

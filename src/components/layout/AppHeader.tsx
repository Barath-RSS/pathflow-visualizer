import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  mode: "lab" | "maps";
  right?: ReactNode;
}

/** Shared app header with the Algorithm Lab / Real-World Maps switcher. */
export function AppHeader({ mode, right }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">PathLab</h1>
            <p className="text-xs text-muted-foreground">
              Algorithm Lab · Real-World Routing — interactive navigation laboratory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav aria-label="Mode" className="flex rounded-lg border border-border bg-secondary/60 p-1">
            <Link
              to="/"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                mode === "lab"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={mode === "lab" ? "page" : undefined}
            >
              Algorithm Lab
            </Link>
            <Link
              to="/maps"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                mode === "maps"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={mode === "maps" ? "page" : undefined}
            >
              Real-World Maps
            </Link>
          </nav>
          {right}
        </div>
      </div>
    </header>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { Dashboard } from "@/components/visualizer/Dashboard";
import { GridBoard } from "@/components/visualizer/GridBoard";
import { InfoDialog } from "@/components/visualizer/InfoDialog";
import { Legend } from "@/components/visualizer/Legend";
import { useVisualizer } from "@/hooks/useVisualizer";

const TITLE = "Pathfinding & Maze Visualizer — BFS, DFS, Dijkstra, A*";
const DESCRIPTION =
  "Draw walls, generate mazes and watch BFS, DFS, Dijkstra and A* explore the same grid with live performance metrics.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const v = useVisualizer();
  const running = v.status === "running" || v.status === "paused";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Pathfinding &amp; Maze Visualizer
                </h1>
                <p className="text-xs text-muted-foreground">
                  BFS · DFS · Dijkstra · A* — interactive algorithm laboratory
                </p>
              </div>
            </div>
            <InfoDialog />
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
          <ControlBar
            algorithm={v.algorithm}
            onAlgorithmChange={v.changeAlgorithm}
            speed={v.speed}
            onSpeedChange={v.setSpeed}
            status={v.status}
            onStart={v.startVisualization}
            onPauseToggle={v.togglePause}
            onClearPath={v.clearPath}
            onResetGrid={v.resetGrid}
            onGenerateMaze={v.makeMaze}
          />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section className="space-y-3">
              <GridBoard
                grid={v.grid}
                registry={v.registry}
                onPaintStart={v.onPaintStart}
                onPaintMove={v.onPaintMove}
                onPaintEnd={v.onPaintEnd}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Legend />
                {v.message ? (
                  <p
                    role="status"
                    className={
                      v.metrics.found === false
                        ? "text-sm font-medium text-destructive"
                        : "text-sm font-medium text-primary"
                    }
                  >
                    {v.message}
                  </p>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Click and drag on the grid to draw or erase walls. Drag the start or end marker to
                move it.
              </p>
            </section>

            <aside>
              <Dashboard metrics={v.metrics} algorithm={v.algorithm} running={running} />
            </aside>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

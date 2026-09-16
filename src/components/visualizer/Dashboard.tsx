import { Activity, Boxes, Route, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ALGORITHMS, type AlgorithmKey, type Metrics } from "@/lib/pathfinding/types";

interface DashboardProps {
  metrics: Metrics;
  algorithm: AlgorithmKey;
  running: boolean;
}

function StatCard({
  title,
  icon: Icon,
  value,
  hint,
  tooltip,
}: {
  title: string;
  icon: LucideIcon;
  value: string;
  hint?: string;
  tooltip?: string;
}) {
  const body = (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <p className="font-mono text-2xl font-semibold text-foreground">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  if (!tooltip) return body;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div tabIndex={0} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {body}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function Dashboard({ metrics, algorithm, running }: DashboardProps) {
  const meta = ALGORITHMS[algorithm];
  const placeholder = running ? "Running..." : "—";

  const pathValue =
    metrics.found === false
      ? "No path"
      : metrics.pathLength === null
        ? placeholder
        : `${metrics.pathLength} steps`;

  return (
    <div className="space-y-3">
      <h2 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Performance Analytics
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <StatCard
          title="Execution Time"
          icon={Timer}
          value={
            metrics.executionTime === null ? placeholder : `${metrics.executionTime.toFixed(2)} ms`
          }
          hint="Algorithm computation only"
        />
        <StatCard
          title={meta.guaranteesShortest ? "Path Length" : "Calculated Route"}
          icon={Route}
          value={pathValue}
          hint={meta.guaranteesShortest ? "Shortest path" : "Not guaranteed shortest"}
        />
        <StatCard
          title="Nodes Explored"
          icon={Activity}
          value={metrics.nodesExplored === null ? placeholder : `${metrics.nodesExplored} nodes`}
          hint="Unique cells visited"
        />
        <StatCard
          title="Peak Data Structure"
          icon={Boxes}
          value={metrics.peakSize === null ? placeholder : `${metrics.peakSize}`}
          hint={meta.peakLabel}
          tooltip="Browser JavaScript does not provide a reliable cross-browser measurement of application-level peak RAM allocation. This metric represents the maximum number of active elements in the algorithm's primary data structure."
        />
      </div>
    </div>
  );
}

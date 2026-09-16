import { Eraser, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ALGORITHMS, type AlgorithmKey, type VisualizationState } from "@/lib/pathfinding/types";

interface ControlBarProps {
  algorithm: AlgorithmKey;
  onAlgorithmChange: (value: AlgorithmKey) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  status: VisualizationState;
  onStart: () => void;
  onPauseToggle: () => void;
  onClearPath: () => void;
  onResetGrid: () => void;
  onGenerateMaze: () => void;
}

export function ControlBar({
  algorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  status,
  onStart,
  onPauseToggle,
  onClearPath,
  onResetGrid,
  onGenerateMaze,
}: ControlBarProps) {
  const active = status === "running" || status === "paused";
  const meta = ALGORITHMS[algorithm];

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={algorithm}
          onValueChange={(v) => onAlgorithmChange(v as AlgorithmKey)}
          disabled={active}
        >
          <SelectTrigger className="w-[230px]" aria-label="Select algorithm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ALGORITHMS).map((a) => (
              <SelectItem key={a.key} value={a.key}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex min-w-[190px] flex-1 items-center gap-3 sm:max-w-[260px]">
          <span className="text-xs text-muted-foreground">Slow</span>
          <Slider
            value={[speed]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => onSpeedChange(v ?? 50)}
            aria-label="Animation speed"
          />
          <span className="text-xs text-muted-foreground">Fast</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onStart} disabled={active} className="font-medium">
            <Play className="h-4 w-4" />
            Start Visualization
          </Button>

          <Button variant="secondary" onClick={onPauseToggle} disabled={!active}>
            {status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {status === "paused" ? "Resume" : "Pause"}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onGenerateMaze} disabled={active}>
                <Sparkles className="h-4 w-4" />
                Generate Maze
              </Button>
            </TooltipTrigger>
            <TooltipContent>Recursive backtracking maze, always solvable</TooltipContent>
          </Tooltip>

          <Button variant="outline" onClick={onClearPath}>
            <Eraser className="h-4 w-4" />
            Clear Path
          </Button>

          <Button variant="outline" onClick={onResetGrid}>
            <RotateCcw className="h-4 w-4" />
            Reset Grid
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{meta.short}</span> — {meta.description}
      </p>
    </div>
  );
}

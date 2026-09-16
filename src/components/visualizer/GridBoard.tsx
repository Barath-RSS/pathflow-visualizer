import { memo, useCallback, useRef } from "react";
import { Flag, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Grid, Position } from "@/lib/pathfinding/types";

export interface CellRegistry {
  map: Map<string, HTMLDivElement>;
}

interface CellProps {
  row: number;
  col: number;
  type: "empty" | "wall" | "start" | "end";
  register: (k: string, el: HTMLDivElement | null) => void;
}

const Cell = memo(function Cell({ row, col, type, register }: CellProps) {
  const k = `${row}-${col}`;
  return (
    <div
      ref={(el) => register(k, el)}
      data-row={row}
      data-col={col}
      role="gridcell"
      aria-label={`Row ${row + 1} column ${col + 1}: ${type}`}
      className={cn(
        "node relative aspect-square border-[0.5px] border-grid-line",
        type === "wall" && "node-wall",
        type === "start" && "node-start",
        type === "end" && "node-end",
      )}
    >
      {type === "start" && (
        <Play
          className="pointer-events-none absolute inset-0 m-auto h-[70%] w-[70%] text-background"
          strokeWidth={3}
        />
      )}
      {type === "end" && (
        <Flag
          className="pointer-events-none absolute inset-0 m-auto h-[70%] w-[70%] text-background"
          strokeWidth={3}
        />
      )}
    </div>
  );
});

interface GridBoardProps {
  grid: Grid;
  registry: CellRegistry;
  onPaintStart: (pos: Position) => void;
  onPaintMove: (pos: Position) => void;
  onPaintEnd: () => void;
}

export function GridBoard({
  grid,
  registry,
  onPaintStart,
  onPaintMove,
  onPaintEnd,
}: GridBoardProps) {
  const drawing = useRef(false);
  const cols = grid[0]?.length ?? 0;

  const register = useCallback(
    (k: string, el: HTMLDivElement | null) => {
      if (el) registry.map.set(k, el);
      else registry.map.delete(k);
    },
    [registry],
  );

  const posFromEvent = (e: React.PointerEvent): Position | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const cell = el?.closest<HTMLElement>("[data-row]");
    if (!cell) return null;
    return { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
  };

  return (
    <div
      className="w-full touch-none overflow-x-auto select-none"
      onPointerDown={(e) => {
        const pos = posFromEvent(e);
        if (!pos) return;
        drawing.current = true;
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        onPaintStart(pos);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const pos = posFromEvent(e);
        if (pos) onPaintMove(pos);
      }}
      onPointerUp={() => {
        if (!drawing.current) return;
        drawing.current = false;
        onPaintEnd();
      }}
      onPointerLeave={() => {
        if (!drawing.current) return;
        drawing.current = false;
        onPaintEnd();
      }}
    >
      <div
        role="grid"
        aria-label="Pathfinding grid"
        className="grid min-w-[640px] gap-0 rounded-lg border border-border bg-card p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.map((rowCells, r) =>
          rowCells.map((type, c) => (
            <Cell key={`${r}-${c}`} row={r} col={c} type={type} register={register} />
          )),
        )}
      </div>
    </div>
  );
}

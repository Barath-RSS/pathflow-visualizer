import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runAlgorithm } from "@/lib/pathfinding/algorithms";
import {
  DEFAULT_COLS,
  DEFAULT_ROWS,
  cloneGrid,
  createGrid,
  defaultEnd,
  defaultStart,
  key,
  samePos,
} from "@/lib/pathfinding/grid";
import { generateMaze } from "@/lib/pathfinding/maze";
import {
  ALGORITHMS,
  type AlgorithmKey,
  type Grid,
  type Metrics,
  type Position,
  type VisualizationState,
} from "@/lib/pathfinding/types";
import type { CellRegistry } from "@/components/visualizer/GridBoard";

const EMPTY_METRICS: Metrics = {
  executionTime: null,
  pathLength: null,
  nodesExplored: null,
  peakSize: null,
  found: null,
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Slider 0 (slow, 100 ms) → 100 (fast, 5 ms). */
const delayFor = (speed: number) => Math.round(100 - (speed / 100) * 95);

type PaintMode = "draw" | "erase" | "start" | "end" | null;

export function useVisualizer(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
  const registry = useMemo<CellRegistry>(() => ({ map: new Map() }), []);

  const [grid, setGrid] = useState<Grid>(() => createGrid(rows, cols));
  const [start, setStart] = useState<Position>(() => defaultStart(rows));
  const [end, setEnd] = useState<Position>(() => defaultEnd(rows, cols));
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("astar");
  const [speed, setSpeed] = useState(70);
  const [status, setStatus] = useState<VisualizationState>("idle");
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [message, setMessage] = useState<string | null>(null);

  const runIdRef = useRef(0);
  const pausedRef = useRef(false);
  const speedRef = useRef(speed);
  const paintMode = useRef<PaintMode>(null);
  speedRef.current = speed;

  /** Composite grid used by the algorithms (walls + endpoints). */
  const solveGrid = useCallback((): Grid => {
    const g = cloneGrid(grid);
    g[start.row]![start.col] = "start";
    g[end.row]![end.col] = "end";
    return g;
  }, [grid, start, end]);

  const clearOverlay = useCallback(() => {
    registry.map.forEach((el) => el.classList.remove("node-visited", "node-path"));
  }, [registry]);

  const cancelRun = useCallback(() => {
    runIdRef.current += 1;
    pausedRef.current = false;
  }, []);

  useEffect(() => cancelRun, [cancelRun]);

  const paint = useCallback(
    (pos: Position, cls: "node-visited" | "node-path") => {
      if (samePos(pos, start) || samePos(pos, end)) return;
      registry.map.get(key(pos))?.classList.add(cls);
    },
    [registry, start, end],
  );

  const startVisualization = useCallback(async () => {
    if (status === "running" || status === "paused") return;
    if (samePos(start, end)) {
      setMessage("Start and End cannot be the same cell.");
      return;
    }

    cancelRun();
    const runId = ++runIdRef.current;
    clearOverlay();
    setMetrics(EMPTY_METRICS);
    setMessage(null);
    setStatus("running");

    const g = solveGrid();
    const t0 = performance.now();
    const result = runAlgorithm(algorithm, g, start, end);
    const executionTime = performance.now() - t0;

    const waitStep = async () => {
      while (pausedRef.current && runIdRef.current === runId) await sleep(60);
      await sleep(delayFor(speedRef.current));
    };

    for (const pos of result.visitedOrder) {
      if (runIdRef.current !== runId) return;
      paint(pos, "node-visited");
      await waitStep();
    }

    if (runIdRef.current !== runId) return;

    for (const pos of result.path) {
      if (runIdRef.current !== runId) return;
      paint(pos, "node-path");
      await waitStep();
    }

    if (runIdRef.current !== runId) return;

    const meta = ALGORITHMS[algorithm];
    setMetrics({
      executionTime,
      pathLength: result.found ? Math.max(0, result.path.length - 1) : null,
      nodesExplored: result.nodesExplored,
      peakSize: result.peakDataStructureSize,
      found: result.found,
    });
    setMessage(
      result.found
        ? meta.guaranteesShortest
          ? `${meta.short} completed successfully`
          : `${meta.short} completed — route discovered`
        : "No path found",
    );
    setStatus("completed");
  }, [algorithm, cancelRun, clearOverlay, end, paint, solveGrid, start, status]);

  const togglePause = useCallback(() => {
    setStatus((s) => {
      if (s === "running") {
        pausedRef.current = true;
        return "paused";
      }
      if (s === "paused") {
        pausedRef.current = false;
        return "running";
      }
      return s;
    });
  }, []);

  const clearPath = useCallback(() => {
    cancelRun();
    clearOverlay();
    setMetrics(EMPTY_METRICS);
    setMessage(null);
    setStatus("idle");
  }, [cancelRun, clearOverlay]);

  const resetGrid = useCallback(() => {
    cancelRun();
    clearOverlay();
    setGrid(createGrid(rows, cols));
    setStart(defaultStart(rows));
    setEnd(defaultEnd(rows, cols));
    setMetrics(EMPTY_METRICS);
    setMessage(null);
    setStatus("idle");
  }, [cancelRun, clearOverlay, cols, rows]);

  const makeMaze = useCallback(() => {
    cancelRun();
    clearOverlay();
    const maze = generateMaze(rows, cols, start, end);
    maze[start.row]![start.col] = "empty";
    maze[end.row]![end.col] = "empty";
    setGrid(maze);
    setMetrics(EMPTY_METRICS);
    setMessage(null);
    setStatus("idle");
  }, [cancelRun, clearOverlay, cols, end, rows, start]);

  /** Any grid edit invalidates a finished/running visualization. */
  const invalidate = useCallback(() => {
    if (status === "idle" && metrics.executionTime === null) return;
    cancelRun();
    clearOverlay();
    setMetrics(EMPTY_METRICS);
    setMessage(null);
    setStatus("idle");
  }, [cancelRun, clearOverlay, metrics.executionTime, status]);

  const applyPaint = useCallback(
    (pos: Position) => {
      const mode = paintMode.current;
      if (!mode) return;
      if (mode === "start") {
        if (samePos(pos, end) || grid[pos.row]![pos.col] === "wall") return;
        setStart(pos);
        return;
      }
      if (mode === "end") {
        if (samePos(pos, start) || grid[pos.row]![pos.col] === "wall") return;
        setEnd(pos);
        return;
      }
      if (samePos(pos, start) || samePos(pos, end)) return;
      const target = mode === "draw" ? "wall" : "empty";
      if (grid[pos.row]![pos.col] === target) return;
      setGrid((prev) => {
        const next = cloneGrid(prev);
        next[pos.row]![pos.col] = target;
        return next;
      });
    },
    [end, grid, start],
  );

  const onPaintStart = useCallback(
    (pos: Position) => {
      if (status === "running" || status === "paused") return;
      invalidate();
      if (samePos(pos, start)) paintMode.current = "start";
      else if (samePos(pos, end)) paintMode.current = "end";
      else paintMode.current = grid[pos.row]![pos.col] === "wall" ? "erase" : "draw";
      applyPaint(pos);
    },
    [applyPaint, end, grid, invalidate, start, status],
  );

  const onPaintMove = useCallback(
    (pos: Position) => {
      if (status === "running" || status === "paused") return;
      applyPaint(pos);
    },
    [applyPaint, status],
  );

  const onPaintEnd = useCallback(() => {
    paintMode.current = null;
  }, []);

  const changeAlgorithm = useCallback((value: AlgorithmKey) => setAlgorithm(value), []);

  return {
    registry,
    grid,
    start,
    end,
    algorithm,
    speed,
    status,
    metrics,
    message,
    setSpeed,
    changeAlgorithm,
    startVisualization,
    togglePause,
    clearPath,
    resetGrid,
    makeMaze,
    onPaintStart,
    onPaintMove,
    onPaintEnd,
  };
}

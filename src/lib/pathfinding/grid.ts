import type { CellType, Grid, Position } from "./types";

export const DEFAULT_ROWS = 30;
export const DEFAULT_COLS = 50;

export const defaultStart = (rows: number): Position => ({
  row: Math.floor(rows / 2),
  col: 5,
});

export const defaultEnd = (rows: number, cols: number): Position => ({
  row: Math.floor(rows / 2),
  col: Math.max(6, cols - 5),
});

export function createGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "empty" as CellType),
  );
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

export const samePos = (a: Position, b: Position): boolean => a.row === b.row && a.col === b.col;

export const key = (p: Position): string => `${p.row}-${p.col}`;

/** 4-directional neighbours (no diagonals), in-bounds only. */
export function neighbors(p: Position, rows: number, cols: number): Position[] {
  const out: Position[] = [];
  if (p.row > 0) out.push({ row: p.row - 1, col: p.col });
  if (p.col < cols - 1) out.push({ row: p.row, col: p.col + 1 });
  if (p.row < rows - 1) out.push({ row: p.row + 1, col: p.col });
  if (p.col > 0) out.push({ row: p.row, col: p.col - 1 });
  return out;
}

export const isWall = (grid: Grid, p: Position): boolean => grid[p.row]![p.col] === "wall";

/** Lightweight BFS connectivity check used to validate generated mazes. */
export function isReachable(grid: Grid, start: Position, end: Position): boolean {
  const rows = grid.length;
  const cols = grid[0]!.length;
  if (isWall(grid, start) || isWall(grid, end)) return false;
  const seen = new Set<string>([key(start)]);
  const queue: Position[] = [start];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++]!;
    if (samePos(cur, end)) return true;
    for (const n of neighbors(cur, rows, cols)) {
      const k = key(n);
      if (seen.has(k) || isWall(grid, n)) continue;
      seen.add(k);
      queue.push(n);
    }
  }
  return false;
}

import { createGrid, isReachable, samePos } from "./grid";
import type { Grid, Position } from "./types";

/**
 * Recursive backtracking maze carved on odd cells, then validated for
 * solvability. Start and End are always carved open.
 */
function carve(rows: number, cols: number): Grid {
  const grid: Grid = createGrid(rows, cols).map((row) => row.map(() => "wall" as const));
  const startRow = 1;
  const startCol = 1;
  const stack: Position[] = [{ row: startRow, col: startCol }];
  grid[startRow]![startCol] = "empty";

  const dirs = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ] as const;

  while (stack.length > 0) {
    const cur = stack[stack.length - 1]!;
    const options: Position[] = [];
    for (const [dr, dc] of dirs) {
      const nr = cur.row + dr;
      const nc = cur.col + dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr]![nc] === "wall") {
        options.push({ row: nr, col: nc });
      }
    }
    if (options.length === 0) {
      stack.pop();
      continue;
    }
    const next = options[Math.floor(Math.random() * options.length)]!;
    grid[(cur.row + next.row) / 2]![(cur.col + next.col) / 2] = "empty";
    grid[next.row]![next.col] = "empty";
    stack.push(next);
  }

  // Sprinkle a few extra openings so corridors form loops instead of a single tree.
  const extras = Math.floor((rows * cols) / 120);
  for (let i = 0; i < extras; i++) {
    const r = 1 + Math.floor(Math.random() * (rows - 2));
    const c = 1 + Math.floor(Math.random() * (cols - 2));
    grid[r]![c] = "empty";
  }

  return grid;
}

/** Clear a plus-shaped pocket so an endpoint is never sealed in. */
function openAround(grid: Grid, p: Position): void {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const cells: Position[] = [
    p,
    { row: p.row - 1, col: p.col },
    { row: p.row + 1, col: p.col },
    { row: p.row, col: p.col - 1 },
    { row: p.row, col: p.col + 1 },
  ];
  for (const c of cells) {
    if (c.row >= 0 && c.row < rows && c.col >= 0 && c.col < cols) grid[c.row]![c.col] = "empty";
  }
}

/** Carve a straight L-corridor between two points as a solvability fallback. */
function carveCorridor(grid: Grid, a: Position, b: Position): void {
  let c = a.col;
  while (c !== b.col) {
    grid[a.row]![c] = "empty";
    c += b.col > a.col ? 1 : -1;
  }
  let r = a.row;
  while (r !== b.row) {
    grid[r]![b.col] = "empty";
    r += b.row > a.row ? 1 : -1;
  }
  grid[b.row]![b.col] = "empty";
}

export function generateMaze(
  rows: number,
  cols: number,
  start: Position,
  end: Position,
): Grid {
  for (let attempt = 0; attempt < 8; attempt++) {
    const grid = carve(rows, cols);
    openAround(grid, start);
    openAround(grid, end);
    if (!samePos(start, end) && isReachable(grid, start, end)) return grid;
  }
  // Guaranteed-solvable fallback.
  const grid = carve(rows, cols);
  openAround(grid, start);
  openAround(grid, end);
  carveCorridor(grid, start, end);
  return grid;
}

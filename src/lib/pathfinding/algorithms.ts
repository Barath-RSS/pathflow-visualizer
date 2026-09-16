import { PriorityQueue } from "./priorityQueue";
import { isWall, key, neighbors, samePos } from "./grid";
import type { AlgorithmKey, AlgorithmResult, Grid, Position } from "./types";

function reconstruct(parents: Map<string, Position>, start: Position, end: Position): Position[] {
  const path: Position[] = [];
  let cur: Position | undefined = end;
  while (cur) {
    path.push(cur);
    if (samePos(cur, start)) break;
    cur = parents.get(key(cur));
  }
  return path.reverse();
}

export const manhattan = (a: Position, b: Position): number =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

/** Breadth-First Search — FIFO queue, guarantees shortest path on unweighted grids. */
export function bfs(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const visitedOrder: Position[] = [];
  const parents = new Map<string, Position>();
  const seen = new Set<string>([key(start)]);
  const queue: Position[] = [start];
  let head = 0;
  let peak = 1;
  let found = false;

  while (head < queue.length) {
    peak = Math.max(peak, queue.length - head);
    const cur = queue[head++]!;
    visitedOrder.push(cur);
    if (samePos(cur, end)) {
      found = true;
      break;
    }
    for (const n of neighbors(cur, rows, cols)) {
      const k = key(n);
      if (seen.has(k) || isWall(grid, n)) continue;
      seen.add(k);
      parents.set(k, cur);
      queue.push(n);
    }
  }

  return {
    visitedOrder,
    path: found ? reconstruct(parents, start, end) : [],
    nodesExplored: visitedOrder.length,
    peakDataStructureSize: peak,
    found,
  };
}

/** Depth-First Search — LIFO stack, explores deeply and backtracks. No shortest-path guarantee. */
export function dfs(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const visitedOrder: Position[] = [];
  const parents = new Map<string, Position>();
  const visited = new Set<string>();
  const stack: Position[] = [start];
  let peak = 1;
  let found = false;

  while (stack.length > 0) {
    peak = Math.max(peak, stack.length);
    const cur = stack.pop()!;
    const ck = key(cur);
    if (visited.has(ck)) continue;
    visited.add(ck);
    visitedOrder.push(cur);
    if (samePos(cur, end)) {
      found = true;
      break;
    }
    // Push in reverse so the first neighbour is explored first.
    const ns = neighbors(cur, rows, cols);
    for (let i = ns.length - 1; i >= 0; i--) {
      const n = ns[i]!;
      const nk = key(n);
      if (visited.has(nk) || isWall(grid, n)) continue;
      parents.set(nk, cur);
      stack.push(n);
    }
  }

  return {
    visitedOrder,
    path: found ? reconstruct(parents, start, end) : [],
    nodesExplored: visitedOrder.length,
    peakDataStructureSize: peak,
    found,
  };
}

/** Dijkstra — min-heap, uniform edge cost of 1. */
export function dijkstra(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const visitedOrder: Position[] = [];
  const parents = new Map<string, Position>();
  const dist = new Map<string, number>([[key(start), 0]]);
  const finalized = new Set<string>();
  const pq = new PriorityQueue<Position>();
  pq.enqueue(start, 0);
  let peak = 1;
  let found = false;

  while (!pq.isEmpty()) {
    peak = Math.max(peak, pq.size());
    const cur = pq.dequeue()!;
    const ck = key(cur);
    if (finalized.has(ck)) continue;
    finalized.add(ck);
    visitedOrder.push(cur);
    if (samePos(cur, end)) {
      found = true;
      break;
    }
    const curDist = dist.get(ck) ?? Infinity;
    for (const n of neighbors(cur, rows, cols)) {
      const nk = key(n);
      if (finalized.has(nk) || isWall(grid, n)) continue;
      const candidate = curDist + 1;
      if (candidate < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, candidate);
        parents.set(nk, cur);
        pq.enqueue(n, candidate);
        peak = Math.max(peak, pq.size());
      }
    }
  }

  return {
    visitedOrder,
    path: found ? reconstruct(parents, start, end) : [],
    nodesExplored: visitedOrder.length,
    peakDataStructureSize: peak,
    found,
  };
}

/** A* — f(n) = g(n) + h(n) with the Manhattan heuristic. */
export function astar(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const visitedOrder: Position[] = [];
  const parents = new Map<string, Position>();
  const gScore = new Map<string, number>([[key(start), 0]]);
  const closed = new Set<string>();
  const open = new PriorityQueue<Position>();
  open.enqueue(start, manhattan(start, end));
  let peak = 1;
  let found = false;

  while (!open.isEmpty()) {
    peak = Math.max(peak, open.size());
    const cur = open.dequeue()!;
    const ck = key(cur);
    if (closed.has(ck)) continue;
    closed.add(ck);
    visitedOrder.push(cur);
    if (samePos(cur, end)) {
      found = true;
      break;
    }
    const g = gScore.get(ck) ?? Infinity;
    for (const n of neighbors(cur, rows, cols)) {
      const nk = key(n);
      if (closed.has(nk) || isWall(grid, n)) continue;
      const tentative = g + 1;
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, tentative);
        parents.set(nk, cur);
        open.enqueue(n, tentative + manhattan(n, end));
        peak = Math.max(peak, open.size());
      }
    }
  }

  return {
    visitedOrder,
    path: found ? reconstruct(parents, start, end) : [],
    nodesExplored: visitedOrder.length,
    peakDataStructureSize: peak,
    found,
  };
}

export const runAlgorithm = (
  algorithm: AlgorithmKey,
  grid: Grid,
  start: Position,
  end: Position,
): AlgorithmResult => {
  switch (algorithm) {
    case "bfs":
      return bfs(grid, start, end);
    case "dfs":
      return dfs(grid, start, end);
    case "dijkstra":
      return dijkstra(grid, start, end);
    case "astar":
      return astar(grid, start, end);
  }
};

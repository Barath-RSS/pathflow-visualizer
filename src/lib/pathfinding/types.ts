/** Core domain types for the pathfinding visualizer. */

export type CellType = "empty" | "start" | "end" | "wall";

export type NodeType = CellType | "visited" | "path";

export interface Position {
  row: number;
  col: number;
}

export interface GridNode extends Position {
  type: CellType;
}

/** A grid is a 2D matrix of static cell types (walls / start / end / empty). */
export type Grid = CellType[][];

export type AlgorithmKey = "bfs" | "dfs" | "dijkstra" | "astar";

export interface AlgorithmResult {
  /** Order in which nodes were dequeued/explored (excludes start & end markers rendering). */
  visitedOrder: Position[];
  /** Reconstructed route from start to end (inclusive of both). Empty when not found. */
  path: Position[];
  nodesExplored: number;
  peakDataStructureSize: number;
  found: boolean;
}

export type VisualizationState = "idle" | "running" | "paused" | "completed";

export interface Metrics {
  executionTime: number | null;
  pathLength: number | null;
  nodesExplored: number | null;
  peakSize: number | null;
  found: boolean | null;
}

export interface AlgorithmMeta {
  key: AlgorithmKey;
  label: string;
  short: string;
  description: string;
  dataStructure: string;
  peakLabel: string;
  shortestPath: string;
  heuristic: string;
  guaranteesShortest: boolean;
  applications: string[];
}

export const ALGORITHMS: Record<AlgorithmKey, AlgorithmMeta> = {
  bfs: {
    key: "bfs",
    label: "BFS — Breadth-First Search",
    short: "BFS",
    description:
      "BFS explores nodes level by level and guarantees a shortest path in an unweighted grid.",
    dataStructure: "Queue",
    peakLabel: "Peak Queue",
    shortestPath: "Yes, unweighted",
    heuristic: "None",
    guaranteesShortest: true,
    applications: [
      "Shortest paths in unweighted graphs",
      "Network routing",
      "Social-network relationship traversal",
      "Finding nearby locations",
    ],
  },
  dfs: {
    key: "dfs",
    label: "DFS — Depth-First Search",
    short: "DFS",
    description:
      "DFS explores deeply before backtracking and does not guarantee the shortest path.",
    dataStructure: "Stack",
    peakLabel: "Peak Stack",
    shortestPath: "No",
    heuristic: "None",
    guaranteesShortest: false,
    applications: [
      "Maze exploration",
      "Graph traversal",
      "Backtracking",
      "Cycle detection",
      "Puzzle solving",
    ],
  },
  dijkstra: {
    key: "dijkstra",
    label: "Dijkstra's Algorithm",
    short: "Dijkstra",
    description:
      "Dijkstra explores the lowest-cost nodes first and guarantees the shortest path for non-negative edge weights.",
    dataStructure: "Min-Heap",
    peakLabel: "Peak Priority Queue",
    shortestPath: "Yes",
    heuristic: "None",
    guaranteesShortest: true,
    applications: [
      "GPS / navigation systems",
      "Network routing",
      "Road and path optimization",
      "Weighted graph problems",
    ],
  },
  astar: {
    key: "astar",
    label: "A* Search",
    short: "A*",
    description:
      "A* finds a shortest path by combining the cost already travelled with a heuristic estimate of the remaining distance.",
    dataStructure: "Min-Heap",
    peakLabel: "Peak Open Set",
    shortestPath: "Yes",
    heuristic: "Manhattan",
    guaranteesShortest: true,
    applications: [
      "Game AI",
      "Robotics",
      "GPS / navigation",
      "Autonomous movement",
      "Path planning",
    ],
  },
};

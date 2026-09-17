# Pathflow Visualizer

Build a Complete Pathfinding & Maze Visualizer

Build a fully functional, polished, single-page Pathfinding & Maze Visualizer web application.

This must be a real working application — not a static mockup or UI prototype. All four pathfinding algorithms, maze generation, grid interaction, animations, controls, and performance metrics must actually work in the browser.

1. Technology Stack

Use:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Lucide React icons

No backend

No database

No authentication

No external API required

The application should run entirely client-side.

Use clean, modular TypeScript code and separate the algorithm logic from the UI components.

2. Application Layout

Create a modern dark-mode single-page application.

Overall layout:

┌───────────────────────────────────────────────────────────────┐
│                     PATHFINDING VISUALIZER                    │
│  Algorithm ▼   Speed ─────   Start   Pause   Clear   Reset   │
├───────────────────────────────────────────────┬───────────────┤
│                                               │               │
│                                               │   PERFORMANCE │
│                                               │               │
│                  GRID BOARD                   │  Execution    │
│                                               │  Time         │
│                                               │               │
│                                               │  Path Length  │
│                                               │               │
│                                               │  Nodes        │
│                                               │  Explored     │
│                                               │               │
│                                               │  Peak Data    │
│                                               │  Structure    │
│                                               │               │
├───────────────────────────────────────────────┴───────────────┤
│ Legend: Start • End • Wall • Visited • Shortest Path          │
└───────────────────────────────────────────────────────────────┘


The layout must be responsive.

On desktop:

Grid should occupy the majority of the screen.

Performance dashboard should appear on the right.

On smaller screens:

Dashboard should move below the grid.

Controls should wrap cleanly.

Grid should remain usable with touch interaction.

3. Header

Create a clean header containing:

PATHFINDING VISUALIZER

Subtitle:

Explore how pathfinding algorithms navigate complex environments.

Include an information/help button using a Lucide icon such as Info.

Clicking the information button should open a shadcn Dialog/Sheet explaining:

Real-World Applications

BFS

Used for:

Shortest paths in unweighted graphs

Network routing

Social-network relationship traversal

Finding nearby locations

DFS

Used for:

Maze exploration

Graph traversal

Backtracking

Cycle detection

Puzzle solving

Dijkstra

Used for:

GPS/navigation systems

Network routing

Road/path optimization

Weighted graph problems

A*

Used for:

Game AI

Robotics

GPS/navigation

Autonomous movement

Path planning

Also briefly explain:

A* combines the distance already travelled with an estimated remaining distance using a heuristic.

4. Interactive Grid

Create a dynamic 2D grid.

Default size should be approximately:

30 rows × 50 columns

But structure the code so the dimensions can easily be changed later.

Each cell/node must support these states:

EMPTY
START
END
WALL
VISITED
PATH


Use a clean visual appearance with visible grid boundaries.

Default positions

Place:

Start node approximately on the left side of the grid

End node approximately on the right side of the grid

For example:

Start → around column 5
End   → around column 45


Keep them on approximately the same row.

5. Node Colors / Visual States

Use clearly distinguishable colors.

Suggested visual scheme:

Empty: dark background

Start: green

End: red

Wall: near-black / dark gray

Visited: blue/purple tone

Final path: yellow/orange tone

Do not rely on color alone where possible. Use subtle icons or styling for Start and End.

Example:

🟢 START
🔴 END
⬛ WALL
🔵 VISITED
🟡 PATH


Animations should be smooth and visually clear.

Add subtle transitions rather than abrupt changes.

6. Wall Drawing Interaction

Users must be able to create walls by clicking and dragging across cells.

Behavior:

Mouse

Click empty cell → create wall

Click existing wall → remove wall

Click + drag → continuously draw walls

Click + drag starting on a wall → erase walls

Do not accidentally create walls on Start or End.

Touch

Support basic touch/pointer interaction on mobile devices as well.

Use pointer events if appropriate so mouse and touch interactions share the same implementation.

Prevent unwanted browser text selection while drawing.

7. Start and End Nodes

Allow users to reposition Start and End nodes.

Recommended behavior:

Drag Start → move Start

Drag End → move End

Start/End cannot occupy the same cell

Start/End cannot be placed on walls

Moving Start/End should remove their previous location

If implementing drag-and-drop becomes unnecessarily complex, support clicking a Start/End node and then clicking another valid cell to relocate it.

However, prefer drag interaction if practical.

8. Top Control Bar

Create a polished control bar using shadcn/ui components.

Include:

Algorithm Selector

Dropdown with:

BFS — Breadth-First Search
DFS — Depth-First Search
Dijkstra's Algorithm
A* Search


Default:

A Search*

Speed Slider

Provide a slider from slow to fast.

Example:

Slow ───────────── Fast


The speed should actually control animation delay.

Suggested delay range:

Slow: ~100 ms
Fast: ~5 ms


Map the slider smoothly between these values.

Changing speed during visualization should affect subsequent animation steps.

Start Visualization

Primary button:

Start Visualization

Use a Play icon.

When clicked:

Validate Start and End exist.

Clear previous visited/path visualization.

Start the selected algorithm.

Record start time using:

performance.now()


Animate the algorithm step-by-step.

Reconstruct the final path.

Animate the final path.

Calculate metrics.

Display metrics in the dashboard.

Do not reload the page.

Pause Button

Button:

Pause

Use a Pause icon.

The algorithm must genuinely pause the visualization.

When paused:

Current grid state remains visible.

No new nodes are animated.

Current algorithm state must be preserved.

Clicking Resume should continue from where it stopped.

When appropriate, change the button text/icon to:

Resume

Do not restart the algorithm when resuming.

Clear Path

Button:

Clear Path

This must:

Remove visited nodes

Remove final path

Preserve walls

Preserve Start

Preserve End

Reset performance metrics

It must not reset the entire grid.

Reset Grid

Button:

Reset Grid

This must:

Remove all walls

Remove visited nodes

Remove path

Restore Start position

Restore End position

Reset metrics

Add a confirmation only if necessary; preferably make it immediately usable.

9. Generate Maze

Add a prominent button:

Generate Maze

Use a Wand/Sparkles icon.

When clicked:

Clear existing walls/path/visited state.

Generate a randomized maze.

Preserve Start and End.

Ensure the generated maze is solvable.

Do not allow Start or End to become walls.

Display the generated maze cleanly.

Use a recursive maze-generation algorithm, preferably Recursive Division or Recursive Backtracking.

The generated maze should contain meaningful corridors rather than completely random isolated walls.

10. Maze Solvability

This is important.

After generating the maze, verify that Start can reach End.

Implement a lightweight connectivity check using BFS.

If the generated maze is not solvable:

regenerate it, or

modify/remove walls until a valid route exists.

The Generate Maze function must never leave the application with an obviously impossible maze.

11. Pathfinding Algorithms

Implement all algorithms manually in TypeScript.

Do NOT simply fake the animation.

Each algorithm must actually traverse the grid.

Use 4-directional movement:

       Up
       ↑
Left ← Node → Right
       ↓
      Down


Do not allow diagonal movement.

Walls cannot be traversed.

12. BFS — Breadth-First Search

Implement genuine BFS using a queue.

Requirements:

Use FIFO queue behavior.

Track visited nodes.

Track parent of each node.

Stop when End is reached.

Reconstruct the path from End back to Start.

Because every edge has equal cost, BFS should produce a shortest path in number of steps when one exists.

Track:

Peak Data Structure Size = maximum queue length

13. DFS — Depth-First Search

Implement genuine DFS using a stack.

Requirements:

Use LIFO stack behavior.

Track visited nodes.

Track parent nodes.

Stop when End is reached.

Reconstruct the discovered route.

Important:

DFS is primarily an exploration algorithm and does not guarantee the shortest path on an unweighted grid.

Track:

Peak Data Structure Size = maximum stack depth

Do not incorrectly label DFS's result as the shortest path.

The UI should say:

Calculated Route

rather than always saying "Shortest Path" for DFS.

14. Dijkstra's Algorithm

Implement genuine Dijkstra's shortest-path algorithm.

Use a priority queue/min-heap rather than repeatedly sorting a normal array.

Each grid movement should have a cost of:

1


Track:

distance
previous/parent
visited


Stop when End is finalized.

Reconstruct the shortest path.

Track:

Peak Data Structure Size = maximum priority queue size

15. A* Search

Implement genuine A*.

Use:

f(n) = g(n) + h(n)


Where:

g(n) = cost from Start to current node

h(n) = Manhattan distance from current node to End


Manhattan heuristic:

Math.abs(row1 - row2) + Math.abs(col1 - col2)


Use a priority queue/min-heap.

Track:

gScore
fScore
parent
visited


Reconstruct the final path.

Track:

Peak Data Structure Size = maximum open-set size

16. Algorithm Animation

This is one of the most important parts of the project.

Do not calculate the algorithm and then instantly display the result.

The user must be able to watch the algorithm work.

Animation sequence:

Start
 ↓
Explore nodes
 ↓
Visited cells appear progressively
 ↓
End is discovered
 ↓
Algorithm stops
 ↓
Final route is reconstructed
 ↓
Path cells animate progressively


Use asynchronous animation such as:

await delay(speed)


or an equivalent controlled animation mechanism.

Avoid blocking the browser's main thread with a huge synchronous loop.

17. Pause / Resume Architecture

The animation engine must support pause/resume correctly.

Maintain an execution state such as:

type VisualizationState =
  | "idle"
  | "running"
  | "paused"
  | "completed";


When paused:

preserve algorithm state

preserve current animation index

preserve current grid state

When resumed:

continue from the current position

do not restart

18. Performance Metrics Dashboard

Create a polished dashboard titled:

Performance Analytics

Use shadcn Card components.

Display four statistic cards.

Card 1

Execution Time

Example:

12.47 ms


Measure using:

const start = performance.now();
// algorithm
const end = performance.now();
const executionTime = end - start;


Important:

Measure the algorithm computation time, not the visual animation delay.

Card 2

Path Length

Display the number of movement steps in the resulting route.

For example:

42 steps


If no path exists:

No path


Start-to-End with zero movement should have a path length of 0.

Card 3

Nodes Explored

Display the total number of unique grid cells explored/visited by the selected algorithm.

Example:

186 nodes


Do not count the same node multiple times.

Card 4

Peak Data Structure

Because browser JavaScript cannot reliably expose the application's actual peak RAM allocation, use the size/depth of the algorithm's active data structure.

Display contextually:

BFS:
Peak Queue: 38

DFS:
Peak Stack: 72

Dijkstra:
Peak Priority Queue: 41

A*:
Peak Open Set: 29


The dashboard card title can be:

Peak Data Structure

Add a tooltip explaining:

Browser JavaScript does not provide a reliable cross-browser measurement of application-level peak RAM allocation. This metric represents the maximum number of active elements in the algorithm's primary data structure.

Do NOT fabricate RAM values.

19. Metrics Timing

Metrics should update only after the algorithm has completed.

Before execution:

Execution Time: —
Path Length: —
Nodes Explored: —
Peak Data Structure: —


During execution, optionally show:

Running...


After completion, show actual values.

When Clear Path or Reset Grid is clicked, reset the metrics.

20. No-Path Handling

If an algorithm cannot reach End:

Do not crash.

Show a clear message such as:

No path found

Metrics should still display:

Execution Time

Nodes Explored

Peak Data Structure

Path Length should display:

No path

21. Visual Animation Design

Visited nodes should animate into their visited state.

Use a subtle scale/fade transition where appropriate.

Final path should have a different animation from visited nodes.

Suggested sequence:

Visited:
fade/scale animation

Final path:
progressive highlight from Start → End


Do not make animations excessively flashy.

Prioritize readability and algorithm understanding.

22. Legend

Below the grid, add a compact legend:

● Start
● End
■ Wall
■ Visited
■ Path


Use the same visual styling/colors as the actual grid.

23. Algorithm Information

Near the algorithm selector, provide an optional information area showing a short explanation of the selected algorithm.

Example:

A* Search

A* finds a shortest path by combining the cost already travelled with a heuristic estimate of the remaining distance.

For BFS:

BFS explores nodes level by level and guarantees a shortest path in an unweighted grid.

For DFS:

DFS explores deeply before backtracking and does not guarantee the shortest path.

For Dijkstra:

Dijkstra explores the lowest-cost nodes first and guarantees the shortest path for non-negative edge weights.

Keep these descriptions concise.

24. Educational Comparison

Add a small section below the main application or inside the info drawer:

AlgorithmData StructureShortest PathHeuristicBFSQueueYes, unweightedNoneDFSStackNoNoneDijkstraMin-HeapYesNoneA*Min-HeapYesManhattan

This is an educational visualizer, so correctness of this information matters.

25. UI Design

Use a professional modern developer-tool aesthetic.

Dark theme.

Suggested characteristics:

Deep dark background

Slightly lighter cards

Rounded corners

Subtle borders

Soft shadows

Good spacing

Clear typography

Minimal gradients

Smooth hover states

Accessible contrast

Use shadcn/ui components for:

Button

Card

Select

Slider

Dialog/Sheet

Tooltip

Badge where appropriate

Use Lucide icons.

Do not overload the interface with unnecessary UI elements.

26. Responsive Design

Desktop:

Header
Control Bar

┌─────────────────────────────┬───────────────┐
│                             │ Performance   │
│             Grid            │ Dashboard     │
│                             │               │
└─────────────────────────────┴───────────────┘

Legend


Tablet/mobile:

Header
Controls

Grid

Performance Dashboard

Legend


The grid should remain usable on touch devices.

27. Application State Architecture

Keep the application maintainable.

Create appropriate TypeScript types/interfaces.

For example:

type NodeType =
  | "empty"
  | "start"
  | "end"
  | "wall"
  | "visited"
  | "path";

interface GridNode {
  row: number;
  col: number;
  type: NodeType;
  distance?: number;
  heuristic?: number;
  parent?: GridNode | null;
}


Avoid putting all logic into App.tsx.

Separate:

Grid rendering

Node rendering

Controls

Dashboard

Algorithms

Maze generation

Visualization logic

28. Algorithm Result Structure

Algorithms should return enough information for the visualization layer.

For example:

interface AlgorithmResult {
  visitedOrder: Position[];
  path: Position[];
  nodesExplored: number;
  peakDataStructureSize: number;
  found: boolean;
}


The visualization layer should not need to understand the internal details of BFS, DFS, Dijkstra, or A*.

29. Priority Queue

Implement a reusable TypeScript min-heap / priority queue.

It should support:

enqueue()
dequeue()
peek()
isEmpty()
size()


Use it for:

Dijkstra

A*

Do not use an inefficient array.sort() on every iteration.

30. Performance

The application should remain responsive.

Avoid:

unnecessary React re-renders

blocking synchronous animation loops

recreating the entire grid unnecessarily

expensive DOM operations for every animation frame

Use React state carefully.

If useful, use:

useMemo

useCallback

useRef

where appropriate.

Do not optimize prematurely at the cost of code readability.

31. Algorithm Correctness

Before considering the project complete, verify:

BFS

Finds shortest path in an unweighted grid.

Uses queue.

Correct parent tracking.

DFS

Uses stack.

Correctly explores and backtracks.

Does not claim shortest-path guarantee.

Dijkstra

Uses min-priority queue.

Correct distance relaxation.

Finds shortest path.

A*

Uses Manhattan distance.

Correct g + h scoring.

Finds shortest path.

Uses priority queue.

32. Important Edge Cases

Handle all of these:

Start adjacent to End.

Start and End separated by walls.

No walls.

Completely blocked path.

Start moved next to End.

Maze generated multiple times.

Start and End moved after maze generation.

Start equals End should not be allowed.

User clicks Start Visualization repeatedly.

User presses Reset while visualization is running.

User presses Clear Path while visualization is running.

User generates a maze while visualization is running.

User changes algorithm while visualization is running.

User changes speed while visualization is running.

Pause and Resume multiple times.

No path exists.

Prevent race conditions and stale animation updates.

When starting a new visualization, cancel/stop any previous visualization cleanly.

33. Control State Rules

While visualization is running:

Start button should be disabled or changed appropriately.

Algorithm selection should be disabled.

Maze generation should be disabled.

Reset/Clear actions should either safely cancel the visualization first or be explicitly handled.

Pause must remain available.

Speed slider may remain enabled.

After completion:

Start becomes available again.

Algorithm selector becomes available.

Maze generation becomes available.

34. Accessibility

Include:

Keyboard-accessible controls

Visible focus states

Proper button labels

Tooltips for icon-only buttons

ARIA labels where appropriate

Sufficient color contrast

Do not rely solely on color to communicate important state.

35. Empty / Initial Metrics

On initial load:

Execution Time
—

Path Length
—

Nodes Explored
—

Peak Data Structure
—


Do not show fake example metrics.

36. Final Result State

After successful visualization, show a small status message:

A* completed successfully


or:

No path found


For DFS, use wording such as:

DFS completed — route discovered


Do not call the DFS route a guaranteed shortest path.

37. Code Quality

Write production-quality TypeScript.

Requirements:

Strong typing

No unnecessary any

Reusable components

Clear naming

No duplicated algorithm logic

Helpful comments for complex algorithm sections

Keep algorithms independently testable

Avoid hardcoding logic into visual components

38. Final Verification

Before finishing the implementation, manually verify the entire application.

Test:

Grid

Wall creation

Wall deletion

Start movement

End movement

Maze

Maze generation

Randomization

Start/End preservation

Solvability

Algorithms

BFS

DFS

Dijkstra

A*

Controls

Start

Pause

Resume

Clear Path

Reset Grid

Speed slider

Algorithm selector

Analytics

Execution time

Path length

Nodes explored

Peak data structure

Responsive UI

Desktop

Tablet

Mobile

Fix any runtime errors, TypeScript errors, animation bugs, state synchronization issues, and visual glitches before considering the project complete.

39. Important Implementation Rule

Do NOT create placeholder buttons, fake metrics, simulated algorithm results, or static visualizations.

Every control visible in the UI must perform its intended function.

Every algorithm must actually execute its corresponding algorithm.

The generated maze must actually be generated.

The visited-node animation must correspond to the actual algorithm traversal.

The final path must be reconstructed from the actual parent relationships.

The performance metrics must be calculated from the actual execution.

The application should be immediately usable after installation with:

npm install
npm run dev


40. Overall Goal

The final result should feel like a polished interactive educational algorithm laboratory, not a basic student CRUD application.

A user should be able to open the application, draw a maze, select an algorithm, press Start, and clearly understand how BFS, DFS, Dijkstra, and A* behave differently by watching them explore the same environment.

Prioritize:

Algorithm correctness

Smooth visualization

Accurate metrics

Excellent usability

Clean responsive UI

Maintainable TypeScript architecture

Build the complete application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1bd2192b-8f00-425b-b766-af46708efa77).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

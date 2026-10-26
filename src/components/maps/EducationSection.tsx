import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CONCEPTS = [
  {
    title: "Weights are real here",
    body: "In the Algorithm Lab every step costs 1. On a real road network each edge carries traffic, speed limits, one-way streets and turn restrictions — Dijkstra's weighted search, running at continental scale.",
  },
  {
    title: "Heuristics guide the search",
    body: "Production routing engines use the same idea as A*'s heuristic: never explore a region that cannot be part of the best path. Engines like Google's pre-compute the network (contraction hierarchies) so queries answer in milliseconds.",
  },
  {
    title: "Why alternatives exist",
    body: "The fastest route is not always the one you want. Alternative routes come from a k-shortest-paths search — the same graph theory as the lab's BFS/Dijkstra, extended to return several good options.",
  },
  {
    title: "Try it side by side",
    body: "Pick two places here, then draw a similar trip in the Algorithm Lab: watch how A* leans toward the goal the same way live routing leans toward highways and avoid congestion.",
  },
];

/** Educational section tying the real-world map back to the grid algorithms. */
export function EducationSection() {
  return (
    <section aria-labelledby="real-world-learning" className="space-y-3">
      <h2 id="real-world-learning" className="font-display text-sm font-semibold tracking-wide text-primary">
        How Real-World Navigation Works
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {CONCEPTS.map((c) => (
          <Card key={c.title} className="border-border bg-card/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">{c.title}</CardTitle>
              <CardDescription className="sr-only">{c.title}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">{c.body}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ALGORITHMS } from "@/lib/pathfinding/types";
import { ComparisonTable } from "./ComparisonTable";

export function InfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="About the algorithms">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Real-World Applications</DialogTitle>
          <DialogDescription>
            Where each of these traversal and shortest-path algorithms is used in practice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {Object.values(ALGORITHMS).map((a) => (
            <section key={a.key}>
              <h3 className="font-display text-sm font-semibold tracking-wide text-primary">
                {a.short}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                {a.applications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            A* combines the distance already travelled with an estimated remaining distance using a
            heuristic — here the Manhattan distance to the end node.
          </p>

          <section>
            <h3 className="mb-2 font-display text-sm font-semibold tracking-wide text-primary">
              Comparison
            </h3>
            <ComparisonTable />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

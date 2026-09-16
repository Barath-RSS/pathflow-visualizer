import { Flag, Play } from "lucide-react";

const items = [
  { label: "Start", className: "bg-node-start", icon: Play },
  { label: "End", className: "bg-node-end", icon: Flag },
  { label: "Wall", className: "bg-node-wall border border-grid-line", icon: null },
  { label: "Visited", className: "bg-node-visited", icon: null },
  { label: "Path", className: "bg-node-path", icon: null },
] as const;

export function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
      <li className="font-medium text-foreground">Legend</li>
      {items.map(({ label, className, icon: Icon }) => (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-hidden
            className={`relative flex h-4 w-4 items-center justify-center rounded-[3px] ${className}`}
          >
            {Icon ? <Icon className="h-2.5 w-2.5 text-background" strokeWidth={3} /> : null}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

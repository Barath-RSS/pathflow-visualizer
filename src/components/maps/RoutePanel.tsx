import { ExternalLink, LocateFixed, Loader2, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRAVEL_MODES, formatDistance, formatDuration, googleMapsDirectionsUrl } from "@/lib/maps/format";
import type { MapPoint, RouteDTO, TravelMode } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

interface RoutePanelProps {
  origin: MapPoint | null;
  destination: MapPoint | null;
  travelMode: TravelMode;
  onTravelModeChange: (mode: TravelMode) => void;
  routes: RouteDTO[];
  activeIndex: number;
  onSelectRoute: (index: number) => void;
  loading: boolean;
  error?: string;
  onUseMyLocation: () => void;
  locating: boolean;
}

export function RoutePanel({
  origin,
  destination,
  travelMode,
  onTravelModeChange,
  routes,
  activeIndex,
  onSelectRoute,
  loading,
  error,
  onUseMyLocation,
  locating,
}: RoutePanelProps) {
  const bothSet = Boolean(origin && destination);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-wide text-foreground">Route</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onUseMyLocation}
          disabled={locating}
          aria-label="Use my current location as start"
        >
          {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
          My location
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-secondary/50 p-1">
        {TRAVEL_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onTravelModeChange(mode.value)}
            aria-pressed={travelMode === mode.value}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md py-2 text-xs font-medium transition-colors",
              travelMode === mode.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <mode.icon className="h-4 w-4" aria-hidden />
            {mode.label}
          </button>
        ))}
      </div>

      <div className="space-y-2" aria-live="polite">
        {!bothSet ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <RouteIcon className="h-4 w-4 shrink-0" aria-hidden />
            Pick a start and a destination to calculate routes.
          </p>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Calculating route…
          </div>
        ) : error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No route found between these points.</p>
        ) : (
          <ul className="space-y-2">
            {routes.map((route) => {
              const active = route.index === activeIndex;
              return (
                <li key={route.index}>
                  <button
                    type="button"
                    onClick={() => onSelectRoute(route.index)}
                    aria-pressed={active}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-primary/60 bg-primary/10"
                        : "border-border hover:border-border hover:bg-accent/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {route.durationText ?? formatDuration(route.durationSeconds)}
                      </span>
                      {route.label === "recommended" ? (
                        <Badge className="bg-primary/20 text-primary" variant="secondary">
                          Fastest
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Alt
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {route.distanceText ?? formatDistance(route.distanceMeters)}
                      {route.summary ? ` · via ${route.summary}` : ""}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Button variant="outline" className="w-full" disabled={!bothSet} asChild>
        <a
          href={
            origin && destination
              ? googleMapsDirectionsUrl(
                  { lat: origin.lat, lng: origin.lng },
                  { lat: destination.lat, lng: destination.lng },
                  travelMode,
                )
              : undefined
          }
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </a>
      </Button>
    </div>
  );
}

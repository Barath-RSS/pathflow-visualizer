import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mapsGateway, cachedJson } from "./gateway.server";
import type { RouteDTO, RoutesResult, TravelMode } from "./types";

const latLng = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

const routesInput = z.object({
  origin: latLng,
  destination: latLng,
  travelMode: z.enum(["DRIVE", "WALK", "BICYCLE", "TRANSIT"]),
  /** Alternatives are only requested for driving (Google supports them everywhere else rarely). */
  alternatives: z.boolean(),
});

const FIELD_MASK =
  "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.summary,routes.routeLabels,routes.localizedValues.distance.text,routes.localizedValues.duration.text";

interface RawRoute {
  distanceMeters?: number;
  duration?: string | number;
  summary?: string;
  routeLabels?: string[];
  polyline?: { encodedPolyline?: string };
  localizedValues?: { distance?: { text?: string }; duration?: { text?: string } };
}

/** Routes API durations arrive as strings like "5432s". */
function parseDuration(duration: string | number | undefined): number {
  if (typeof duration === "number") return duration;
  const parsed = Number.parseFloat(duration ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

export const computeRoutes = createServerFn({ method: "POST" })
  .inputValidator((data) => routesInput.parse(data))
  .handler(async ({ data }): Promise<RoutesResult> => {
    const cacheKey = `routes:${JSON.stringify(data)}`;
    try {
      return await cachedJson<RoutesResult>(cacheKey, 5 * 60_000, async () => {
        const body: Record<string, unknown> = {
          origin: { location: { latLng: { latitude: data.origin.lat, longitude: data.origin.lng } } },
          destination: {
            location: { latLng: { latitude: data.destination.lat, longitude: data.destination.lng } },
          },
          travelMode: data.travelMode as TravelMode,
        };
        if (data.travelMode === "DRIVE") {
          body.routingPreference = "TRAFFIC_AWARE";
          body.computeAlternativeRoutes = data.alternatives;
        }
        if (data.travelMode === "TRANSIT") {
          // Transit requests need a departure time.
          body.departureTime = new Date().toISOString();
        }

        const payload = (await mapsGateway({
          path: "/routes/directions/v2:computeRoutes",
          method: "POST",
          headers: { "X-Goog-FieldMask": FIELD_MASK },
          body,
        })) as { routes?: RawRoute[] };

        const raw = payload.routes ?? [];
        const routes: RouteDTO[] = raw
          .filter((r) => Boolean(r.polyline?.encodedPolyline))
          .slice(0, 4)
          .map((r, i) => ({
            index: i,
            distanceMeters: r.distanceMeters ?? 0,
            durationSeconds: parseDuration(r.duration),
            distanceText: r.localizedValues?.distance?.text,
            durationText: r.localizedValues?.duration?.text,
            summary: r.summary,
            encodedPolyline: r.polyline!.encodedPolyline!,
            label: r.routeLabels?.includes("DEFAULT_ROUTE") && i === 0 ? "recommended" : "alternative",
          }));

        return { routes };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Route calculation failed.";
      console.error("computeRoutes failed:", message);
      return { routes: [], error: message };
    }
  });

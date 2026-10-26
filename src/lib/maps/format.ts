import { Car, Footprints, Bike, TrainFront, type LucideIcon } from "lucide-react";
import type { TravelMode } from "./types";

/** Formats meters as a human-readable distance. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  if (meters < 10_000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 1000)} km`;
}

/** Formats seconds as a human-readable duration. */
export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${Math.max(1, mins)} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

interface TravelModeMeta {
  value: TravelMode;
  label: string;
  icon: LucideIcon;
  /** Slug used by the public "open in Google Maps" deep link. */
  googleTravelMode: "drive" | "walking" | "bicycling" | "transit";
}

export const TRAVEL_MODES: TravelModeMeta[] = [
  { value: "DRIVE", label: "Drive", icon: Car, googleTravelMode: "drive" },
  { value: "WALK", label: "Walk", icon: Footprints, googleTravelMode: "walking" },
  { value: "BICYCLE", label: "Cycle", icon: Bike, googleTravelMode: "bicycling" },
  { value: "TRANSIT", label: "Transit", icon: TrainFront, googleTravelMode: "transit" },
];

/** Builds a Google Maps deep link for the selected route. */
export function googleMapsDirectionsUrl(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: TravelMode,
): string {
  const meta = TRAVEL_MODES.find((m) => m.value === mode);
  const tm = meta?.googleTravelMode ?? "drive";
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: tm,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

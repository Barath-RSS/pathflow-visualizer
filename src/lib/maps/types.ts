/** Shared types for the Real-World Maps mode (browser-safe, no Google types). */

export interface LatLng {
  lat: number;
  lng: number;
}

export type TravelMode = "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT";

/** A pinned location with a human-readable label. */
export interface MapPoint extends LatLng {
  label: string;
}

export interface PlaceSuggestion {
  placeId: string;
  text: string;
}

export interface PlaceDetails {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export interface RouteDTO {
  /** Zero-based position in the response order (0 = Google's recommended route). */
  index: number;
  distanceMeters: number;
  durationSeconds: number;
  distanceText?: string;
  durationText?: string;
  summary?: string;
  encodedPolyline: string;
  /** "recommended" marks Google's default route; everything else is an alternative. */
  label?: "recommended" | "alternative";
}

export interface RoutesResult {
  routes: RouteDTO[];
  error?: string;
}

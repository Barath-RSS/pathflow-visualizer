import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/maps/mapLoader";
import { decodePolyline } from "@/lib/maps/polyline";
import type { MapPoint, RouteDTO } from "@/lib/maps/types";

/** Dark, developer-tool styled basemap. POIs/transit off: the app owns its markers. */
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1b1f2a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b96a5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#12151c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#101722" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a3040" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#333b4d" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#323a4c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3b445a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2c3342" }] },
];

const ACTIVE_ROUTE = "#22d3ee";
const ALTERNATE_ROUTE = "#5b6b7e";

interface MapViewProps {
  origin: MapPoint | null;
  destination: MapPoint | null;
  routes: RouteDTO[];
  activeIndex: number;
  onOriginDrag: (coords: { lat: number; lng: number }) => void;
  onDestinationDrag: (coords: { lat: number; lng: number }) => void;
}

/**
 * Browser-only Google Maps renderer. Lazily imported behind <ClientOnly>
 * so the Maps script never loads during SSR.
 */
export default function MapView({
  origin,
  destination,
  routes,
  activeIndex,
  onOriginDrag,
  onDestinationDrag,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{
    origin?: google.maps.Marker;
    destination?: google.maps.Marker;
  }>({});
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const dragCallbacks = useRef({ onOriginDrag, onDestinationDrag });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    dragCallbacks.current = { onOriginDrag, onDestinationDrag };
  });

  useEffect(() => {
    let mounted = true;
    loadGoogleMaps()
      .then((maps) => {
        if (!mounted || !containerRef.current || mapRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: { lat: 22.57, lng: 88.36 },
          zoom: 12,
          styles: DARK_MAP_STYLE,
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setReady(true);
      })
      .catch(() => {
        if (mounted) setFailed(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Reconcile the two draggable markers.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = window.google.maps;
    const markers = markersRef.current;

    const upsert = (
      existing: google.maps.Marker | undefined,
      point: MapPoint | null,
      fill: string,
      title: string,
      onDragEnd: (coords: { lat: number; lng: number }) => void,
    ): google.maps.Marker | undefined => {
      if (!point) {
        existing?.setMap(null);
        return undefined;
      }
      if (existing) {
        existing.setPosition({ lat: point.lat, lng: point.lng });
        existing.setTitle(title);
        return existing;
      }
      const marker = new maps.Marker({
        map: mapRef.current!,
        position: { lat: point.lat, lng: point.lng },
        draggable: true,
        title,
        zIndex: 200,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: fill,
          fillOpacity: 1,
          strokeColor: "#0b0e14",
          strokeWeight: 2,
        },
      });
      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) onDragEnd({ lat: pos.lat(), lng: pos.lng() });
      });
      return marker;
    };

    markers.origin = upsert(markers.origin, origin, "#4ade80", "Start — drag to move", (c) =>
      dragCallbacks.current.onOriginDrag(c),
    );
    markers.destination = upsert(
      markers.destination,
      destination,
      "#f87171",
      "Destination — drag to move",
      (c) => dragCallbacks.current.onDestinationDrag(c),
    );
  }, [ready, origin, destination]);

  // Reconcile route polylines and fit the viewport.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = window.google.maps;

    polylinesRef.current.forEach((line) => line.setMap(null));
    polylinesRef.current = [];

    const bounds = new maps.LatLngBounds();
    let hasPath = false;

    for (const route of routes) {
      const path = decodePolyline(route.encodedPolyline);
      const active = route.index === activeIndex;
      const line = new maps.Polyline({
        path,
        map: mapRef.current,
        strokeColor: active ? ACTIVE_ROUTE : ALTERNATE_ROUTE,
        strokeOpacity: active ? 0.95 : 0.55,
        strokeWeight: active ? 6 : 3,
        zIndex: active ? 100 : 10,
      });
      polylinesRef.current.push(line);
      path.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      hasPath = true;
    }

    if (hasPath) {
      mapRef.current.fitBounds(bounds, 60);
      return;
    }

    const points = [origin, destination].filter((p): p is MapPoint => Boolean(p));
    if (points.length === 1) {
      mapRef.current.setCenter({ lat: points[0]!.lat, lng: points[0]!.lng });
      if ((mapRef.current.getZoom() ?? 0) < 13) mapRef.current.setZoom(13);
    } else if (points.length === 2) {
      points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      mapRef.current.fitBounds(bounds, 80);
    }
  }, [ready, routes, activeIndex, origin, destination]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" aria-label="Interactive map" />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-card p-6 text-center text-sm text-muted-foreground">
          The map could not be loaded in this environment. Open the published site to see live
          Google Maps routing.
        </div>
      ) : null}
    </div>
  );
}

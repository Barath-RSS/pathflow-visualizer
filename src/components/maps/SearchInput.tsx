import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin, Search } from "lucide-react";
import { suggestPlaces, getPlaceDetails } from "@/lib/maps/search.functions";
import type { LatLng, MapPoint, PlaceSuggestion } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  label: string;
  placeholder: string;
  dotColorClass: string;
  onSelect: (point: MapPoint) => void;
  /** Optional map-center bias so suggestions favour the user's area. */
  bias?: LatLng;
}

/**
 * App-owned place autocomplete. Debounced (300 ms), calls the backend through
 * an authenticated server function — never Google Places directly.
 */
export function SearchInput({ label, placeholder, dotColorClass, onSelect, bias }: SearchInputProps) {
  const suggestFn = useServerFn(suggestPlaces);
  const detailsFn = useServerFn(getPlaceDetails);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const requestRef = useRef(0);
  const sessionTokenRef = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 3) {
      requestRef.current += 1;
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      const id = ++requestRef.current;
      setLoading(true);
      try {
        if (!sessionTokenRef.current) sessionTokenRef.current = crypto.randomUUID();
        const res = await suggestFn({
          data: { input: text, sessionToken: sessionTokenRef.current, bias },
        });
        if (id !== requestRef.current) return;
        setSuggestions(res.suggestions);
        setOpen(true);
      } catch {
        if (id === requestRef.current) setSuggestions([]);
      } finally {
        if (id === requestRef.current) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Close the dropdown on outside clicks.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function handleSelect(suggestion: PlaceSuggestion) {
    requestRef.current += 1;
    setOpen(false);
    setSuggestions([]);
    setQuery(suggestion.text);
    setSelecting(true);
    try {
      const token = sessionTokenRef.current ?? crypto.randomUUID();
      sessionTokenRef.current = crypto.randomUUID(); // token is spent after Details
      const res = await detailsFn({ data: { placeId: suggestion.placeId, sessionToken: token } });
      if (res.details) {
        onSelect({
          label: res.details.displayName,
          lat: res.details.lat,
          lng: res.details.lng,
        });
      }
    } catch {
      // Leave the previous selection untouched on failure.
    } finally {
      setSelecting(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotColorClass)} aria-hidden />
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {loading || selecting ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg"
        >
          {suggestions.map((s) => (
            <li key={s.placeId} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span>{s.text}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

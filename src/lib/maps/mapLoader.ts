/**
 * Async loader for the Google Maps JavaScript API (browser-only).
 * Uses `loading=async` + callback so `google.maps.Map` is only touched
 * after the API is fully initialised. Import this only from client-only
 * modules (it is lazy-loaded behind <ClientOnly>).
 */

const BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;
const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as string | undefined;

type GoogleMapsNamespace = typeof google.maps;
type WindowWithMapsInit = Window & {
  __pathlabMapsInit?: () => void;
  google?: { maps?: GoogleMapsNamespace };
};

let loadPromise: Promise<GoogleMapsNamespace> | null = null;

export function loadGoogleMaps(): Promise<GoogleMapsNamespace> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const win = window as WindowWithMapsInit;
    if (win.google?.maps) {
      resolve(win.google.maps);
      return;
    }
    if (!BROWSER_KEY) {
      reject(new Error("Google Maps browser key is not configured."));
      return;
    }

    const callbackName = "__pathlabMapsInit";
    win[callbackName] = () => {
      if (win.google?.maps) resolve(win.google.maps);
      else reject(new Error("Google Maps failed to initialise."));
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=${callbackName}${
      TRACKING_ID ? `&channel=${TRACKING_ID}` : ""
    }`;
    script.async = true;
    script.onerror = () => reject(new Error("Could not load Google Maps."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

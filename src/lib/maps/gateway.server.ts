/**
 * Server-only helper for calling the Google Maps Platform connector gateway.
 * The gateway injects Google's key; we authenticate with the Lovable API key
 * plus the connection key. Never import this from client code.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

/** Simple bounded TTL cache to avoid repeating identical billable calls. */
const cache = new Map<string, { at: number; value: unknown }>();
const CACHE_MAX_ENTRIES = 100;

export async function cachedJson<T>(
  cacheKey: string,
  ttlMs: number,
  compute: () => Promise<T>,
): Promise<T> {
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;

  const value = await compute();
  cache.set(cacheKey, { at: Date.now(), value });
  if (cache.size > CACHE_MAX_ENTRIES) {
    // Evict the oldest entry (Map iterates in insertion order).
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return value;
}

/** Names the user-fixable cause for 403s instead of a bare failure. */
function describe403(body: unknown): string {
  const details = (body as { error?: { details?: Array<{ reason?: string }> } })?.error?.details;
  const reason = details?.find((d) => d.reason)?.reason;
  if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
    return "Google Maps server key is referrer-restricted — set its application restrictions to 'None' or 'IP addresses' in Google Cloud Console.";
  }
  if (reason === "API_KEY_SERVICE_BLOCKED") {
    return "Google Maps server key does not allow this API — enable it for the key in Google Cloud Console.";
  }
  return "Google Maps request was denied (403). Check the server key's restrictions in Google Cloud Console.";
}

export interface GatewayCall {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function mapsGateway({ path, method = "GET", body, headers }: GatewayCall): Promise<unknown> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !mapsKey) {
    throw new Error("Google Maps is not configured on the server.");
  }

  const response = await fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 403) {
      throw new Error(describe403(safeParse(errorBody)));
    }
    console.error(`Maps gateway request failed [${response.status}]: ${errorBody}`);
    throw new Error(`Maps request failed [${response.status}].`);
  }

  const payload = await response.json();
  // Some Google APIs report failures inside a 2xx body.
  const error = (payload as { error?: { message?: string } }).error;
  if (error?.message && Object.keys(payload as object).length === 1) {
    throw new Error(`Maps request failed: ${error.message}`);
  }
  return payload;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { error: { details: [] } };
  }
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mapsGateway, cachedJson } from "./gateway.server";
import type { PlaceDetails, PlaceSuggestion } from "./types";

const suggestInput = z.object({
  input: z.string().trim().min(2).max(120),
  sessionToken: z.string().uuid(),
  /** Optional map-center bias so suggestions favour the user's area. */
  bias: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .optional(),
});

export const suggestPlaces = createServerFn({ method: "POST" })
  .inputValidator((data) => suggestInput.parse(data))
  .handler(async ({ data }) => {
    const locationBias = data.bias
      ? {
          circle: {
            center: { latitude: data.bias.lat, longitude: data.bias.lng },
            radius: 50_000,
          },
        }
      : undefined;

    const payload = (await mapsGateway({
      path: "/places/v1/places:autocomplete",
      method: "POST",
      headers: {
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
      },
      body: { input: data.input, sessionToken: data.sessionToken, locationBias },
    })) as { suggestions?: Array<{ placePrediction?: { placeId?: string; text?: { text?: string } } }> };

    const suggestions: PlaceSuggestion[] = (payload.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is { placeId: string; text: { text: string } } => Boolean(p?.placeId && p.text?.text))
      .slice(0, 5)
      .map((p) => ({ placeId: p.placeId, text: p.text.text }));

    return { suggestions };
  });

const detailsInput = z.object({
  placeId: z.string().min(6).max(256),
  sessionToken: z.string().uuid(),
});

export const getPlaceDetails = createServerFn({ method: "POST" })
  .inputValidator((data) => detailsInput.parse(data))
  .handler(async ({ data }) => {
    const key = `details:${data.placeId}`;
    const details = await cachedJson<PlaceDetails | null>(key, 10 * 60_000, async () => {
      const payload = (await mapsGateway({
        path: `/places/v1/places/${encodeURIComponent(data.placeId)}?sessionToken=${data.sessionToken}`,
        headers: {
          "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
        },
      })) as {
        id?: string;
        displayName?: { text?: string };
        formattedAddress?: { text?: string };
        location?: { latitude?: number; longitude?: number };
      };

      if (!payload.id || payload.location?.latitude === undefined || payload.location?.longitude === undefined) {
        return null;
      }
      return {
        placeId: payload.id,
        displayName: payload.displayName?.text ?? "Unnamed place",
        formattedAddress: payload.formattedAddress?.text ?? "",
        lat: payload.location.latitude,
        lng: payload.location.longitude,
      };
    });
    return { details };
  });

/**
 * Google Maps Routes API v2 — real driving-time helper.
 *
 * Returns the estimated driving duration in minutes between two addresses,
 * using traffic-aware routing. Returns null on any failure so callers can
 * fall back to mock values gracefully.
 */

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

/**
 * Fetches driving duration between origin and destination.
 * @returns Minutes (ceiling), or null if the API is unavailable / key missing.
 */
export async function getDriveMinutes(
  origin: string,
  destination: string
): Promise<number | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("[driveTime] GOOGLE_MAPS_API_KEY not set — falling back to mock");
    return null;
  }

  try {
    const res = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Request only the duration field to minimise billing cost
        "X-Goog-FieldMask": "routes.duration",
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
      }),
      // Prevent the Next.js data-cache from reusing a stale drive time across
      // different requests — each plan should reflect current traffic.
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[driveTime] Routes API responded ${res.status}:`,
        await res.text()
      );
      return null;
    }

    const data: unknown = await res.json();
    // Response shape: { routes: [{ duration: "3600s" }] }
    const durationStr =
      (data as { routes?: { duration?: string }[] })?.routes?.[0]?.duration;

    if (!durationStr) {
      console.warn("[driveTime] No duration in response — falling back to mock");
      return null;
    }

    // "3600s" → 60 minutes
    const seconds = parseInt(durationStr.replace("s", ""), 10);
    if (isNaN(seconds)) return null;

    return Math.ceil(seconds / 60);
  } catch (err) {
    console.error("[driveTime] Fetch failed:", err);
    return null;
  }
}

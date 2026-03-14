/**
 * Fetches live lift status for a resort from the liftie.info public API.
 *
 * liftie.info is a web app (not an npm library) that scrapes resort websites
 * and exposes a JSON REST API at /api/resort/{id}.
 *
 * Response shape: { lifts: { status: { "Lift Name": "open|closed|hold|scheduled" } } }
 *
 * Returns a LiftStatusMap on success, null on any failure so callers degrade
 * gracefully (treat all lifts as "unknown" → include them in the plan).
 */

import type { LiftStatus, LiftStatusMap } from "@/lib/schema/planRequest";

const VALID: Set<string> = new Set(["open", "closed", "hold", "scheduled"]);

/** Normalise raw status strings from liftie into our typed enum. */
function coerce(raw: string): LiftStatus {
  const s = raw.toLowerCase().trim();
  if (VALID.has(s)) return s as LiftStatus;
  if (s === "yes" || s === "1" || s === "true") return "open";
  if (s === "no" || s === "0" || s === "false") return "closed";
  if (s.includes("hold") || s.includes("wind")) return "hold";
  if (s.includes("scheduled") || s.includes("expected")) return "scheduled";
  return "unknown";
}

interface LiftieResponse {
  lifts?: { status?: Record<string, string> };
}

/**
 * @param liftieId  The liftie.info resort slug (e.g. "deer-valley", "parkcity").
 * @returns         Map of exact lift name → LiftStatus, or null on failure.
 */
export async function fetchLiftStatus(
  liftieId: string
): Promise<LiftStatusMap | null> {
  try {
    const res = await fetch(`https://liftie.info/api/resort/${liftieId}`, {
      // Cache 5 minutes — liftie.info refreshes its data roughly every 60 s.
      next: { revalidate: 300 },
      headers: {
        "User-Agent": "BestLine/1.0 (ski day planner)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[liftStatus] liftie.info returned ${res.status} for "${liftieId}"`);
      return null;
    }

    const data = (await res.json()) as LiftieResponse;
    const raw = data?.lifts?.status;

    if (!raw || typeof raw !== "object") {
      console.warn(`[liftStatus] Unexpected response shape for "${liftieId}"`);
      return null;
    }

    const map: LiftStatusMap = {};
    for (const [name, status] of Object.entries(raw)) {
      map[name] = coerce(String(status));
    }

    console.info(
      `[liftStatus] ${liftieId}: ${Object.keys(map).length} lifts fetched`
    );
    return map;
  } catch (err) {
    console.error(`[liftStatus] Fetch failed for "${liftieId}":`, err);
    return null;
  }
}

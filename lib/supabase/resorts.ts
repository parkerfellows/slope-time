/**
 * Supabase data layer for resort and lift data.
 *
 * Each function falls back to the hardcoded TypeScript constants when the
 * DB call fails, so the app degrades gracefully if Supabase is unreachable.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { LiftMetric } from "@/lib/resorts/liftMetrics";
import { LIFT_METRICS } from "@/lib/resorts/liftMetrics";
import { RESORT_COORDINATES } from "@/lib/resorts/resortCoordinates";

interface ResortRow {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface LiftRow {
  resort_id: string;
  lift_name: string;
  lift_minutes: number;
  run_minutes: number;
  vert_ft: number;
  difficulty: LiftMetric["difficulty"];
  terrain: LiftMetric["terrain"];
  representative_run: string;
}

/** Map a DB row to the LiftMetric shape the optimizer expects. */
function rowToMetric(row: LiftRow): LiftMetric {
  return {
    liftName: row.lift_name,
    liftMinutes: row.lift_minutes,
    runMinutes: row.run_minutes,
    vertFt: row.vert_ft,
    difficulty: row.difficulty,
    terrain: row.terrain,
    representativeRun: row.representative_run,
  };
}

/**
 * Fetch lat/lng for a resort from Supabase.
 * Falls back to RESORT_COORDINATES on any error.
 */
export async function fetchResortCoords(
  resortId: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("resorts")
      .select("lat, lng")
      .eq("id", resortId)
      .single<Pick<ResortRow, "lat" | "lng">>();

    if (error || !data) {
      console.warn(`[supabase/resorts] coords fallback for "${resortId}":`, error?.message);
      return RESORT_COORDINATES[resortId] ?? null;
    }

    return { lat: data.lat, lng: data.lng };
  } catch (err) {
    console.error(`[supabase/resorts] fetchResortCoords failed:`, err);
    return RESORT_COORDINATES[resortId] ?? null;
  }
}

/**
 * Fetch lift metrics for a resort from Supabase.
 * Falls back to LIFT_METRICS on any error.
 */
export async function fetchLiftMetrics(
  resortId: string
): Promise<LiftMetric[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("lifts")
      .select(
        "resort_id, lift_name, lift_minutes, run_minutes, vert_ft, difficulty, terrain, representative_run"
      )
      .eq("resort_id", resortId)
      .returns<LiftRow[]>();

    if (error || !data || data.length === 0) {
      console.warn(`[supabase/resorts] lifts fallback for "${resortId}":`, error?.message);
      return LIFT_METRICS[resortId] ?? LIFT_METRICS["deer-valley"];
    }

    console.info(`[supabase/resorts] ${resortId}: ${data.length} lifts from DB`);
    return data.map(rowToMetric);
  } catch (err) {
    console.error(`[supabase/resorts] fetchLiftMetrics failed:`, err);
    return LIFT_METRICS[resortId] ?? LIFT_METRICS["deer-valley"];
  }
}

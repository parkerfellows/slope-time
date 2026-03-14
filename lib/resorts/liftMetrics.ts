/**
 * Per-lift static configuration for each Utah resort.
 *
 * Lift names are chosen to match what liftie.info returns for each resort
 * as closely as possible. At runtime a case-insensitive lookup is used so
 * minor capitalisation differences are handled gracefully.
 *
 * Timing and vertical figures are ESTIMATES based on public resort trail maps
 * and are intentionally marked as such in the plan. They will be replaced by
 * OpenSkiMap geometry data in a later phase.
 */

import type { TimelineEntry } from "@/lib/schema/planRequest";

export interface LiftMetric {
  /** Lift name — should match liftie.info exactly (case-insensitive lookup) */
  liftName: string;
  /** Minutes to ride the lift from base to top */
  liftMinutes: number;
  /** Minutes for an average descent from this lift */
  runMinutes: number;
  /** Approximate vertical feet of descent */
  vertFt: number;
  /** Hardest difficulty accessible from this lift */
  difficulty: NonNullable<TimelineEntry["difficulty"]>;
  /** Primary terrain character of the lift's trails */
  terrain: "groomers" | "moguls" | "trees" | "bowls" | "park";
  /** A representative trail name shown in the timeline */
  representativeRun: string;
}

export const LIFT_METRICS: Record<string, LiftMetric[]> = {
  "deer-valley": [
    { liftName: "Jordanelle Express", liftMinutes: 12, runMinutes: 8, vertFt: 1300, difficulty: "blue",         terrain: "groomers", representativeRun: "Bald Eagle" },
    { liftName: "Sterling Express",   liftMinutes: 7,  runMinutes: 5, vertFt: 600,  difficulty: "green",        terrain: "groomers", representativeRun: "Success" },
    { liftName: "Carpenter Express",  liftMinutes: 8,  runMinutes: 6, vertFt: 800,  difficulty: "blue",         terrain: "groomers", representativeRun: "Nabob" },
    { liftName: "Wasatch Express",    liftMinutes: 9,  runMinutes: 7, vertFt: 900,  difficulty: "blue",         terrain: "groomers", representativeRun: "Tycoon" },
    { liftName: "Flagstaff Express",  liftMinutes: 10, runMinutes: 8, vertFt: 1100, difficulty: "black",        terrain: "groomers", representativeRun: "Hawkeye" },
    { liftName: "Empire Express",     liftMinutes: 10, runMinutes: 8, vertFt: 1200, difficulty: "black",        terrain: "groomers", representativeRun: "Stein's Way" },
    { liftName: "Lady Morgan",        liftMinutes: 8,  runMinutes: 7, vertFt: 900,  difficulty: "blue",         terrain: "groomers", representativeRun: "Lady Morgan Bowl" },
    { liftName: "Burns",              liftMinutes: 6,  runMinutes: 5, vertFt: 600,  difficulty: "blue",         terrain: "groomers", representativeRun: "Burns" },
    { liftName: "Little Stick",       liftMinutes: 5,  runMinutes: 4, vertFt: 350,  difficulty: "green",        terrain: "groomers", representativeRun: "Snowflake" },
  ],

  "park-city": [
    { liftName: "First Time",   liftMinutes: 5,  runMinutes: 4, vertFt: 300,  difficulty: "green",        terrain: "groomers", representativeRun: "First Time" },
    { liftName: "Crescent",     liftMinutes: 6,  runMinutes: 5, vertFt: 500,  difficulty: "green",        terrain: "groomers", representativeRun: "Homerun" },
    { liftName: "PayDay",       liftMinutes: 8,  runMinutes: 6, vertFt: 700,  difficulty: "blue",         terrain: "groomers", representativeRun: "PayDay" },
    { liftName: "Bonanza",      liftMinutes: 9,  runMinutes: 7, vertFt: 900,  difficulty: "blue",         terrain: "groomers", representativeRun: "Bonanza" },
    { liftName: "Silverlode",   liftMinutes: 10, runMinutes: 7, vertFt: 1000, difficulty: "blue",         terrain: "groomers", representativeRun: "Silverlode" },
    { liftName: "King Con",     liftMinutes: 10, runMinutes: 8, vertFt: 1100, difficulty: "black",        terrain: "moguls",   representativeRun: "King Con" },
    { liftName: "Motherlode",   liftMinutes: 7,  runMinutes: 6, vertFt: 800,  difficulty: "blue",         terrain: "groomers", representativeRun: "Motherlode" },
    { liftName: "Flatiron",     liftMinutes: 9,  runMinutes: 8, vertFt: 1100, difficulty: "black",        terrain: "groomers", representativeRun: "Flatiron" },
    { liftName: "Iron Mountain", liftMinutes: 9, runMinutes: 8, vertFt: 1000, difficulty: "black",        terrain: "bowls",    representativeRun: "Iron Mountain" },
    { liftName: "Tombstone",    liftMinutes: 7,  runMinutes: 6, vertFt: 700,  difficulty: "blue",         terrain: "groomers", representativeRun: "Tombstone" },
    { liftName: "Dreamscape",   liftMinutes: 8,  runMinutes: 6, vertFt: 750,  difficulty: "blue",         terrain: "groomers", representativeRun: "Dreamscape" },
  ],

  snowbird: [
    { liftName: "Aerial Tram",          liftMinutes: 9,  runMinutes: 14, vertFt: 2900, difficulty: "double-black", terrain: "bowls",    representativeRun: "Great Scott" },
    { liftName: "Peruvian Express",      liftMinutes: 8,  runMinutes: 9,  vertFt: 1300, difficulty: "black",        terrain: "groomers", representativeRun: "Chip's Run" },
    { liftName: "Gad 2",                 liftMinutes: 8,  runMinutes: 7,  vertFt: 900,  difficulty: "blue",         terrain: "groomers", representativeRun: "Chip's Run Lower" },
    { liftName: "Little Cloud",          liftMinutes: 9,  runMinutes: 11, vertFt: 1400, difficulty: "double-black", terrain: "bowls",    representativeRun: "Upper Cirque" },
    { liftName: "Mineral Basin Express", liftMinutes: 10, runMinutes: 9,  vertFt: 1400, difficulty: "black",        terrain: "bowls",    representativeRun: "Bassackwards" },
    { liftName: "Baldy Express",         liftMinutes: 9,  runMinutes: 8,  vertFt: 1100, difficulty: "black",        terrain: "moguls",   representativeRun: "Regulator Johnson" },
    { liftName: "Road to Provo",         liftMinutes: 7,  runMinutes: 6,  vertFt: 800,  difficulty: "blue",         terrain: "groomers", representativeRun: "Big Emma Lower" },
    { liftName: "Baby Thunder",          liftMinutes: 5,  runMinutes: 4,  vertFt: 400,  difficulty: "green",        terrain: "groomers", representativeRun: "Big Emma" },
  ],

  brighton: [
    { liftName: "Explorer",   liftMinutes: 6,  runMinutes: 5, vertFt: 500,  difficulty: "green", terrain: "groomers", representativeRun: "Explorer" },
    { liftName: "Majestic",   liftMinutes: 8,  runMinutes: 6, vertFt: 800,  difficulty: "blue",  terrain: "groomers", representativeRun: "Majestic" },
    { liftName: "Milly",      liftMinutes: 8,  runMinutes: 7, vertFt: 900,  difficulty: "blue",  terrain: "groomers", representativeRun: "Milly" },
    { liftName: "Crest 6",    liftMinutes: 10, runMinutes: 8, vertFt: 1200, difficulty: "black", terrain: "groomers", representativeRun: "Lone Pine" },
    { liftName: "Snake Creek", liftMinutes: 9, runMinutes: 9, vertFt: 1300, difficulty: "black", terrain: "trees",    representativeRun: "Snake Creek" },
    { liftName: "Evergreen",  liftMinutes: 8,  runMinutes: 7, vertFt: 900,  difficulty: "black", terrain: "trees",    representativeRun: "Evergreen" },
  ],

  solitude: [
    { liftName: "Summit",        liftMinutes: 9, runMinutes: 8,  vertFt: 1000, difficulty: "black", terrain: "groomers", representativeRun: "Dynamite" },
    { liftName: "Powderhorn",    liftMinutes: 8, runMinutes: 7,  vertFt: 800,  difficulty: "blue",  terrain: "groomers", representativeRun: "Powderhorn" },
    { liftName: "Eagle Express", liftMinutes: 9, runMinutes: 8,  vertFt: 1000, difficulty: "black", terrain: "bowls",    representativeRun: "Honeycomb Canyon" },
    { liftName: "Apex",          liftMinutes: 8, runMinutes: 7,  vertFt: 900,  difficulty: "black", terrain: "trees",    representativeRun: "Apex" },
    { liftName: "Sunrise",       liftMinutes: 7, runMinutes: 5,  vertFt: 650,  difficulty: "blue",  terrain: "groomers", representativeRun: "Sunrise" },
    { liftName: "Link",          liftMinutes: 5, runMinutes: 4,  vertFt: 400,  difficulty: "green", terrain: "groomers", representativeRun: "Woodsy Hollow" },
  ],
};

/** Fallback metrics used when a lift from Liftie has no entry in LIFT_METRICS. */
const RESORT_DEFAULTS: Record<string, Omit<LiftMetric, "liftName" | "representativeRun">> = {
  "deer-valley": { liftMinutes: 8, runMinutes: 6, vertFt: 800,  difficulty: "blue",  terrain: "groomers" },
  "park-city":   { liftMinutes: 8, runMinutes: 6, vertFt: 800,  difficulty: "blue",  terrain: "groomers" },
  snowbird:      { liftMinutes: 8, runMinutes: 7, vertFt: 1000, difficulty: "black", terrain: "groomers" },
  brighton:      { liftMinutes: 8, runMinutes: 6, vertFt: 800,  difficulty: "blue",  terrain: "groomers" },
  solitude:      { liftMinutes: 8, runMinutes: 6, vertFt: 800,  difficulty: "blue",  terrain: "groomers" },
};

const FALLBACK_DEFAULT: Omit<LiftMetric, "liftName" | "representativeRun"> = {
  liftMinutes: 8, runMinutes: 6, vertFt: 800, difficulty: "blue", terrain: "groomers",
};

/**
 * Build a case-insensitive lookup map from liftName → LiftMetric for a resort.
 * Used at runtime to match Liftie's lift names against our config.
 */
export function buildLiftLookup(resort: string): Map<string, LiftMetric> {
  const metrics = LIFT_METRICS[resort] ?? [];
  return new Map(metrics.map((m) => [m.liftName.toLowerCase(), m]));
}

/**
 * Returns a LiftMetric for a given lift name, using resort-specific defaults
 * when the lift is not in our config.
 */
export function getOrDefaultMetric(
  liftName: string,
  resort: string,
  lookup: Map<string, LiftMetric>
): LiftMetric {
  const found = lookup.get(liftName.toLowerCase());
  if (found) return found;

  const defaults = RESORT_DEFAULTS[resort] ?? FALLBACK_DEFAULT;
  return {
    liftName,
    representativeRun: `Descent from ${liftName}`,
    ...defaults,
  };
}

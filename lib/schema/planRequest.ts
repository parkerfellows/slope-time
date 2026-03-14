import { z } from "zod";

export const RESORTS = [
  "deer-valley",
  "park-city",
  "snowbird",
  "brighton",
  "solitude",
  "best-available",
] as const;

export const ABILITY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export const OPTIMIZATION_GOALS = [
  "max-runs",
  "max-vertical",
  "max-difficulty",
  "balanced",
] as const;

export const TERRAIN_TYPES = [
  "groomers",
  "moguls",
  "trees",
  "bowls",
  "park",
] as const;

export const PlanRequestSchema = z.object({
  /** When the user is free to leave (ISO 8601 local time string, e.g. "2026-03-15T07:30") */
  windowStart: z.string().min(1, "Start time is required"),

  /** When the user must be back (ISO 8601 local time string) */
  windowEnd: z.string().min(1, "End time is required"),

  /** Free-text starting address or city */
  startingLocation: z.string().min(2, "Starting location is required"),

  /** Target resort, or "best-available" to let the app choose */
  resort: z.enum(RESORTS),

  /** What to optimize for during on-mountain time */
  optimizationGoal: z.enum(OPTIMIZATION_GOALS),

  /** Skier ability level — controls which runs are included */
  abilityLevel: z.enum(ABILITY_LEVELS),

  /** Terrain types the skier wants to prioritize (at least one) */
  terrainPreferences: z
    .array(z.enum(TERRAIN_TYPES))
    .min(1, "Select at least one terrain type"),
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;

// ---- Lift status types ----

export type LiftStatus = "open" | "closed" | "hold" | "scheduled" | "unknown";

/**
 * Map of exact lift name (as returned by liftie.info) → status.
 * Used both during optimization (filter) and in the response (display).
 */
export type LiftStatusMap = Record<string, LiftStatus>;

// ---- Response types ----

/**
 * Hourly weather conditions for a single time slot, sourced from the
 * Google Weather API. All numeric fields are null when data is unavailable.
 */
export interface WeatherSlice {
  /** Temperature in °F */
  tempF: number | null;
  /** Wind speed in mph */
  windMph: number | null;
  /** Wind direction cardinal (e.g. "NW") */
  windDir: string | null;
  /** Precipitation probability 0–100 */
  precipChance: number | null;
  /** Snow accumulation in inches for this hour */
  snowInches: number | null;
  /** Human-readable condition description (e.g. "Light Snow") */
  conditionText: string | null;
}

export interface TimelineEntry {
  type: "drive" | "lift" | "run" | "buffer";
  label: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  durationMinutes: number;
  details?: string;
  /** Vertical drop in feet (runs only) */
  verticalFt?: number;
  /** Difficulty color code (runs only) */
  difficulty?: "green" | "blue" | "black" | "double-black";
  /** Weather conditions for this time slot; null when API is unavailable */
  weather?: WeatherSlice | null;
  /** Live status of this lift (lift entries only); undefined when unavailable */
  liftStatus?: LiftStatus;
  /** True when this entry's data is synthesised rather than sourced from a live API */
  isMock: boolean;
}

export interface DayPlan {
  resort: string;
  resortName: string;
  date: string; // YYYY-MM-DD
  summary: string;
  driveOutMinutes: number;
  driveBackMinutes: number;
  skiTimeMinutes: number;
  totalRuns: number;
  totalVerticalFt: number;
  timeline: TimelineEntry[];
  warnings: string[];
  /** True when all plan data is synthesised (no live API calls succeeded) */
  isMock: boolean;
}

export interface OptimizeResponse {
  success: true;
  plan: DayPlan;
}

export interface OptimizeErrorResponse {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

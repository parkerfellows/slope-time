/**
 * Day-plan builder.
 *
 * Lift names and statuses come from liftie.info (real data when available).
 * Lift/run timing and vertical figures are estimates from lib/resorts/liftMetrics.ts
 * and are clearly marked isMock: true until OpenSkiMap geometry is integrated.
 */

import type {
  DayPlan,
  LiftStatus,
  LiftStatusMap,
  PlanRequest,
  TimelineEntry,
} from "@/lib/schema/planRequest";
import {
  buildLiftLookup,
  getOrDefaultMetric,
  LIFT_METRICS,
} from "@/lib/resorts/liftMetrics";

const RESORT_NAMES: Record<string, string> = {
  "deer-valley": "Deer Valley Resort",
  "park-city": "Park City Mountain",
  snowbird: "Snowbird",
  brighton: "Brighton Resort",
  solitude: "Solitude Mountain Resort",
  "best-available": "Deer Valley Resort",
};

/** Rough fallback drive times (minutes) — replaced by Google Maps when available */
const FALLBACK_DRIVE_MINUTES: Record<string, number> = {
  "deer-valley": 45,
  "park-city": 40,
  snowbird: 35,
  brighton: 40,
  solitude: 42,
  "best-available": 45,
};

/** Add N minutes to a HH:MM string */
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Parse ISO local datetime string to HH:MM */
function toHHMM(isoLocal: string): string {
  const timePart = isoLocal.includes("T") ? isoLocal.split("T")[1] : isoLocal;
  return timePart.slice(0, 5);
}

/** HH:MM difference in minutes (end − start), clamped ≥ 0 */
function diffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

/**
 * Builds a day plan.
 *
 * @param req              Validated plan request.
 * @param realDriveMinutes Real one-way drive time from Google Maps (overrides fallback).
 * @param liftStatusMap    Live lift status from liftie.info (null = treat all as "unknown").
 */
export function buildMockPlan(
  req: PlanRequest,
  realDriveMinutes?: number,
  liftStatusMap?: LiftStatusMap | null
): DayPlan {
  const resortKey = req.resort === "best-available" ? "deer-valley" : req.resort;
  const resortName = RESORT_NAMES[req.resort] ?? RESORT_NAMES["deer-valley"];
  const driveOut = realDriveMinutes ?? FALLBACK_DRIVE_MINUTES[req.resort] ?? 45;
  const driveIsMock = realDriveMinutes === undefined;
  const BUFFER = 15; // minutes for parking + boots on each end

  const departTime = toHHMM(req.windowStart);
  const mustReturnBy = toHHMM(req.windowEnd);
  const date = req.windowStart.includes("T")
    ? req.windowStart.split("T")[0]
    : new Date().toISOString().split("T")[0];

  const totalWindowMinutes = diffMinutes(departTime, mustReturnBy);
  const nonSkiMinutes = driveOut * 2 + BUFFER * 2;
  const skiMinutes = Math.max(0, totalWindowMinutes - nonSkiMinutes);

  const warnings: string[] = [];
  if (skiMinutes < 60) {
    warnings.push(
      "Your time window leaves less than 1 hour on the mountain. Consider a later start or earlier return time."
    );
  }

  // ---- Build candidate lift list ----
  // Source: liftStatusMap from Liftie (real lift names + status) when available,
  // otherwise fall back to the static LIFT_METRICS list.

  const lookup = buildLiftLookup(resortKey);

  interface Candidate {
    liftName: string;
    status: LiftStatus;
    liftMinutes: number;
    runMinutes: number;
    vertFt: number;
    difficulty: NonNullable<TimelineEntry["difficulty"]>;
    terrain: string;
    representativeRun: string;
  }

  let candidates: Candidate[];

  if (liftStatusMap && Object.keys(liftStatusMap).length > 0) {
    // Real data path: use Liftie's lift list; enrich with metrics from our config.
    candidates = Object.entries(liftStatusMap).map(([name, status]) => {
      const { liftName: _, ...metric } = getOrDefaultMetric(name, resortKey, lookup);
      return { liftName: name, status, ...metric };
    });
    // Warn if Liftie is showing mostly closed
    const openCount = candidates.filter(
      (c) => c.status === "open" || c.status === "scheduled"
    ).length;
    if (openCount === 0) {
      warnings.push(
        "Live data shows no lifts currently open. Plan shows scheduled / unknown lifts as fallback."
      );
    }
  } else {
    // Fallback path: no live data, use static config with "unknown" status.
    const metrics = LIFT_METRICS[resortKey] ?? LIFT_METRICS["deer-valley"];
    candidates = metrics.map((m) => ({ ...m, status: "unknown" as LiftStatus }));
  }

  // ---- Filter by lift status ----
  // Exclude lifts that are definitively closed; keep open, hold, scheduled, unknown.
  const nonClosedCandidates = candidates.filter((c) => c.status !== "closed");
  const activeCandidates =
    nonClosedCandidates.length > 0 ? nonClosedCandidates : candidates; // fail-open

  // ---- Filter by ability level ----
  const abilityOrder = ["beginner", "intermediate", "advanced", "expert"];
  const abilityIndex = abilityOrder.indexOf(req.abilityLevel);
  const maxDifficulty = (["green", "blue", "black", "double-black"] as const)[
    Math.min(abilityIndex, 3)
  ];
  const difficultyRank: Record<string, number> = {
    green: 0,
    blue: 1,
    black: 2,
    "double-black": 3,
  };

  let filtered = activeCandidates.filter(
    (c) => difficultyRank[c.difficulty] <= difficultyRank[maxDifficulty]
  );

  // ---- Filter by terrain preference ----
  const terrainFiltered = filtered.filter(
    (c) =>
      req.terrainPreferences.length === 0 ||
      req.terrainPreferences.some((t) => t === c.terrain)
  );

  if (terrainFiltered.length > 0) {
    filtered = terrainFiltered;
  } else {
    warnings.push(
      "No open lifts matched your terrain preferences — showing all suitable open lifts."
    );
  }

  // ---- Sort by optimization goal ----
  const sorted = [...filtered].sort((a, b) => {
    if (req.optimizationGoal === "max-vertical")
      return b.vertFt - a.vertFt;
    if (req.optimizationGoal === "max-difficulty")
      return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
    if (req.optimizationGoal === "max-runs")
      return a.liftMinutes + a.runMinutes - (b.liftMinutes + b.runMinutes);
    // balanced: vertical-per-minute
    return (
      b.vertFt / (b.liftMinutes + b.runMinutes) -
      a.vertFt / (a.liftMinutes + a.runMinutes)
    );
  });

  // ---- Build timeline ----
  const timeline: TimelineEntry[] = [];
  let cursor = departTime;

  // Drive out
  const driveOutEnd = addMinutes(cursor, driveOut);
  timeline.push({
    type: "drive",
    label: `Drive to ${resortName}`,
    startTime: cursor,
    endTime: driveOutEnd,
    durationMinutes: driveOut,
    details: driveIsMock
      ? `Approx ${driveOut} min from ${req.startingLocation} (estimated)`
      : `${driveOut} min from ${req.startingLocation} (Google Maps)`,
    isMock: driveIsMock,
  });
  cursor = driveOutEnd;

  // Boots-on buffer
  const bootsEnd = addMinutes(cursor, BUFFER);
  timeline.push({
    type: "buffer",
    label: "Park & gear up",
    startTime: cursor,
    endTime: bootsEnd,
    durationMinutes: BUFFER,
    isMock: true,
  });
  cursor = bootsEnd;

  // Deadline to start heading back
  const driveBackStart = addMinutes(mustReturnBy, -(driveOut + BUFFER));
  let minutesRemaining = diffMinutes(cursor, driveBackStart);
  let runIdx = 0;
  let totalRuns = 0;
  let totalVert = 0;

  while (minutesRemaining > 0 && sorted.length > 0) {
    const lap = sorted[runIdx % sorted.length];
    const lapTime = lap.liftMinutes + lap.runMinutes;
    if (lapTime > minutesRemaining) break;

    const liftEnd = addMinutes(cursor, lap.liftMinutes);
    timeline.push({
      type: "lift",
      label: lap.liftName,
      startTime: cursor,
      endTime: liftEnd,
      durationMinutes: lap.liftMinutes,
      // liftStatus from Liftie is real; only the timing estimate is mock.
      liftStatus: lap.status,
      isMock: true,
    });

    const runEnd = addMinutes(liftEnd, lap.runMinutes);
    timeline.push({
      type: "run",
      label: lap.representativeRun,
      startTime: liftEnd,
      endTime: runEnd,
      durationMinutes: lap.runMinutes,
      verticalFt: lap.vertFt,
      difficulty: lap.difficulty,
      isMock: true,
    });

    cursor = runEnd;
    minutesRemaining -= lapTime;
    totalRuns++;
    totalVert += lap.vertFt;
    runIdx++;
  }

  // Boots-off buffer
  const bootsOffEnd = addMinutes(cursor, BUFFER);
  timeline.push({
    type: "buffer",
    label: "Gear down & walk to car",
    startTime: cursor,
    endTime: bootsOffEnd,
    durationMinutes: BUFFER,
    isMock: true,
  });
  cursor = bootsOffEnd;

  // Drive back
  const driveBackEnd = addMinutes(cursor, driveOut);
  timeline.push({
    type: "drive",
    label: `Drive home from ${resortName}`,
    startTime: cursor,
    endTime: driveBackEnd,
    durationMinutes: driveOut,
    details: driveIsMock ? undefined : `${driveOut} min (Google Maps)`,
    isMock: driveIsMock,
  });

  const hasLiveStatus = liftStatusMap != null;
  const summary =
    `Leave at ${departTime}, arrive ${resortName} around ${driveOutEnd}. ` +
    `Ski from ${bootsEnd} to ${cursor} (${skiMinutes} min on mountain). ` +
    `${totalRuns} run${totalRuns !== 1 ? "s" : ""}, ~${totalVert.toLocaleString()} ft vertical. ` +
    `Back by ${driveBackEnd}.` +
    (hasLiveStatus ? " Lift status: live." : "");

  return {
    resort: resortKey,
    resortName,
    date,
    summary,
    driveOutMinutes: driveOut,
    driveBackMinutes: driveOut,
    skiTimeMinutes: skiMinutes,
    totalRuns,
    totalVerticalFt: totalVert,
    timeline,
    warnings,
    isMock: driveIsMock && !hasLiveStatus,
  };
}

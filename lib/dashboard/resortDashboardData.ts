/**
 * Fetches all data needed for the conditions dashboard in parallel:
 * weather (Google), lift status (liftie.info), snow/trails (OnTheSnow).
 * Returns structured, display-ready data — no string formatting here.
 */

import { fetchHourlyWeather } from "@/lib/weather/googleWeather";
import { fetchLiftStatus } from "@/lib/resorts/liftStatus";
import { RESORT_COORDINATES } from "@/lib/resorts/resortCoordinates";
import { LIFTIE_RESORT_IDS } from "@/lib/resorts/liftieIds";
import { fetchOnTheSnowData } from "@/lib/resorts/onTheSnow";

export interface ResortWeather {
  tempF: number | null;
  /** Low across next 6 hours */
  tempLoF: number | null;
  /** High across next 6 hours */
  tempHiF: number | null;
  conditionText: string | null;
  windMph: number | null;
  windDir: string | null;
  /** 0–100 */
  precipChance: number | null;
  /** inches this hour */
  snowThisHour: number | null;
}

export interface ResortLifts {
  open: number;
  scheduled: number;
  hold: number;
  closed: number;
  total: number;
  /** Names of lifts that are open or scheduled */
  openNames: string[];
}

export interface ResortSnow {
  baseDepthIn: number | null;
  snowLast3Days: number | null;
  snowNext3Days: number | null;
  openTrails: number | null;
  totalTrails: number | null;
}

export interface ResortDashboardItem {
  key: string;
  name: string;
  driveFromSlcMin: number;
  weather: ResortWeather | null;
  lifts: ResortLifts | null;
  snow: ResortSnow | null;
}

const RESORT_NAMES: Record<string, string> = {
  "deer-valley": "Deer Valley",
  "park-city": "Park City Mountain",
  snowbird: "Snowbird",
  brighton: "Brighton",
  solitude: "Solitude",
};

const SLC_DRIVE_MINUTES: Record<string, number> = {
  "deer-valley": 45,
  "park-city": 40,
  snowbird: 35,
  brighton: 40,
  solitude: 42,
};

export async function fetchDashboardData(): Promise<{
  resorts: ResortDashboardItem[];
  fetchedAt: string;
}> {
  const resortKeys = Object.keys(RESORT_COORDINATES);

  const [weatherResults, liftResults, snowMap] = await Promise.all([
    Promise.all(
      resortKeys.map(async (key) => {
        const coords = RESORT_COORDINATES[key];
        const weather = await fetchHourlyWeather(coords.lat, coords.lng, 8);
        return { key, weather };
      })
    ),
    Promise.all(
      resortKeys.map(async (key) => {
        const liftieId = LIFTIE_RESORT_IDS[key];
        if (!liftieId) return { key, lifts: null };
        const lifts = await fetchLiftStatus(liftieId);
        return { key, lifts };
      })
    ),
    fetchOnTheSnowData(),
  ]);

  const resorts: ResortDashboardItem[] = resortKeys.map((key) => {
    const { weather: weatherMap } =
      weatherResults.find((r) => r.key === key)!;
    const { lifts: liftMap } =
      liftResults.find((r) => r.key === key)!;
    const onTheSnow = snowMap.get(key) ?? null;

    // ── Weather ──────────────────────────────────────────────────────────────
    let weather: ResortWeather | null = null;
    if (weatherMap) {
      const sorted = Array.from(weatherMap.keys()).sort();
      const current = sorted[0] ? (weatherMap.get(sorted[0]) ?? null) : null;
      const temps = sorted
        .slice(0, 6)
        .map((k) => weatherMap.get(k)?.tempF)
        .filter((t): t is number => t !== null && t !== undefined);

      weather = {
        tempF: current?.tempF ?? null,
        tempLoF: temps.length >= 2 ? Math.round(Math.min(...temps)) : null,
        tempHiF: temps.length >= 2 ? Math.round(Math.max(...temps)) : null,
        conditionText: current?.conditionText ?? null,
        windMph: current?.windMph !== null && current?.windMph !== undefined
          ? Math.round(current.windMph)
          : null,
        windDir: current?.windDir ?? null,
        precipChance: current?.precipChance ?? null,
        snowThisHour: current?.snowInches ?? null,
      };
    }

    // ── Lifts ─────────────────────────────────────────────────────────────────
    let lifts: ResortLifts | null = null;
    if (liftMap) {
      const entries = Object.entries(liftMap);
      const open = entries.filter(([, s]) => s === "open").length;
      const scheduled = entries.filter(([, s]) => s === "scheduled").length;
      const hold = entries.filter(([, s]) => s === "hold").length;
      const closed = entries.filter(([, s]) => s === "closed").length;
      const openNames = entries
        .filter(([, s]) => s === "open" || s === "scheduled")
        .map(([n]) => n);
      lifts = {
        open,
        scheduled,
        hold,
        closed,
        total: entries.length,
        openNames,
      };
    }

    // ── Snow (OnTheSnow) ──────────────────────────────────────────────────────
    const snow: ResortSnow | null = onTheSnow
      ? {
          baseDepthIn: onTheSnow.baseDepthIn,
          snowLast3Days: onTheSnow.snowLast3Days,
          snowNext3Days: onTheSnow.snowNext3Days,
          openTrails: onTheSnow.openTrails,
          totalTrails: onTheSnow.totalTrails,
        }
      : null;

    return {
      key,
      name: RESORT_NAMES[key] ?? key,
      driveFromSlcMin: SLC_DRIVE_MINUTES[key] ?? 0,
      weather,
      lifts,
      snow,
    };
  });

  const fetchedAt = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Denver",
  });

  return { resorts, fetchedAt };
}

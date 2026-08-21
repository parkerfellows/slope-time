/**
 * Fetches all data needed for the conditions dashboard in parallel:
 * weather (Google), lift status (liftie.info), snow/trails (OnTheSnow).
 * Returns structured, display-ready data — no string formatting here.
 */

import { fetchHourlyWeather, type WeatherByHour } from "@/lib/weather/googleWeather";
import { fetchLiftStatus } from "@/lib/resorts/liftStatus";
import { RESORT_COORDINATES } from "@/lib/resorts/resortCoordinates";
import { LIFTIE_RESORT_IDS } from "@/lib/resorts/liftieIds";

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
  /** Snowfall accumulation for the current hour (inches) */
  snowThisHour: number | null;
  /** Total forecast snowfall over the next 24 hours (inches) */
  snowNext24h: number | null;
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

/** Derive snow stats from the hourly weather forecast map. */
function deriveSnowFromWeather(weatherMap: WeatherByHour): ResortSnow {
  const sorted = Array.from(weatherMap.keys()).sort();
  const snowThisHour = sorted[0]
    ? (weatherMap.get(sorted[0])?.snowInches ?? null)
    : null;

  const allSnow = sorted
    .map((k) => weatherMap.get(k)?.snowInches ?? null)
    .filter((v): v is number => v !== null && v > 0);

  const snowNext24h =
    allSnow.length > 0
      ? parseFloat(allSnow.reduce((a, b) => a + b, 0).toFixed(1))
      : null;

  return { snowThisHour, snowNext24h };
}

export async function fetchDashboardData(): Promise<{
  resorts: ResortDashboardItem[];
  fetchedAt: string;
}> {
  const resortKeys = Object.keys(RESORT_COORDINATES);

  const [weatherResults, liftResults] = await Promise.all([
    Promise.all(
      resortKeys.map(async (key) => {
        const coords = RESORT_COORDINATES[key];
        // Fetch 24 hours so we can sum a full day's snow forecast.
        const weather = await fetchHourlyWeather(coords.lat, coords.lng, 24);
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
  ]);

  const resorts: ResortDashboardItem[] = resortKeys.map((key) => {
    const { weather: weatherMap } =
      weatherResults.find((r) => r.key === key)!;
    const { lifts: liftMap } =
      liftResults.find((r) => r.key === key)!;

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

    // ── Snow (derived from Google Weather forecast) ───────────────────────────
    const snow: ResortSnow | null = weatherMap
      ? deriveSnowFromWeather(weatherMap)
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

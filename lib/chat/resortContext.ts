/**
 * Builds a structured context string describing current conditions at all
 * Utah resorts. Fetches weather + lift status in parallel and degrades
 * gracefully when either API is unavailable.
 */

import { fetchHourlyWeather } from "@/lib/weather/googleWeather";
import { fetchLiftStatus } from "@/lib/resorts/liftStatus";
import { RESORT_COORDINATES } from "@/lib/resorts/resortCoordinates";
import { LIFTIE_RESORT_IDS } from "@/lib/resorts/liftieIds";
import { fetchOnTheSnowData } from "@/lib/resorts/onTheSnow";

const RESORT_NAMES: Record<string, string> = {
  "deer-valley": "Deer Valley Resort",
  "park-city": "Park City Mountain",
  snowbird: "Snowbird",
  brighton: "Brighton Resort",
  solitude: "Solitude Mountain Resort",
};

/** Approximate drive times from Salt Lake City (minutes) — used as context hints. */
const SLC_DRIVE_MINUTES: Record<string, number> = {
  "deer-valley": 45,
  "park-city": 40,
  snowbird: 35,
  brighton: 40,
  solitude: 42,
};

export async function buildResortContextString(): Promise<string> {
  const resortKeys = Object.keys(RESORT_COORDINATES);

  // Fetch weather, lift status, and OnTheSnow snow data in parallel
  const [weatherResults, liftResults, snowMap] = await Promise.all([
    Promise.all(
      resortKeys.map(async (key) => {
        const coords = RESORT_COORDINATES[key];
        const weather = await fetchHourlyWeather(coords.lat, coords.lng, 12);
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

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Denver",
  });

  const lines: string[] = [
    `CURRENT RESORT CONDITIONS (fetched ~${timeStr} MT):`,
    "",
  ];

  for (const { key, weather } of weatherResults) {
    const liftResult = liftResults.find((r) => r.key === key);
    const liftMap = liftResult?.lifts ?? null;
    const snow = snowMap.get(key) ?? null;
    const name = RESORT_NAMES[key] ?? key;

    // Use the earliest available hour from the weather map (current/next hour).
    const sortedHourKeys = weather
      ? Array.from(weather.keys()).sort()
      : [];
    const slice = sortedHourKeys.length > 0
      ? weather!.get(sortedHourKeys[0]) ?? null
      : null;

    // -- Weather summary --
    const weatherParts: string[] = [];
    if (slice) {
      if (slice.tempF !== null) weatherParts.push(`${Math.round(slice.tempF)}°F`);
      if (slice.windMph !== null) {
        const dir = slice.windDir ? ` ${slice.windDir}` : "";
        weatherParts.push(`winds${dir} ${Math.round(slice.windMph)} mph`);
      }
      if (slice.conditionText) weatherParts.push(slice.conditionText);
      if (slice.snowInches !== null && slice.snowInches > 0)
        weatherParts.push(`${slice.snowInches.toFixed(1)}" snow/hr`);
      if (slice.precipChance !== null && slice.precipChance > 10)
        weatherParts.push(`${Math.round(slice.precipChance)}% precip chance`);
    } else {
      weatherParts.push("weather data unavailable");
    }

    // Upcoming temp range (next few hours)
    if (weather && sortedHourKeys.length >= 3) {
      const temps = sortedHourKeys
        .slice(0, 6)
        .map((k) => weather.get(k)?.tempF)
        .filter((t): t is number => t !== null && t !== undefined);
      if (temps.length >= 2) {
        const lo = Math.round(Math.min(...temps));
        const hi = Math.round(Math.max(...temps));
        if (lo !== hi) weatherParts.push(`(${lo}–${hi}°F next 6 hrs)`);
      }
    }

    // -- Lift status summary --
    let liftSummary = "lift status unavailable";
    let openLiftsList = "";
    if (liftMap) {
      const entries = Object.entries(liftMap);
      const total = entries.length;
      const open = entries.filter(([, s]) => s === "open").length;
      const scheduled = entries.filter(([, s]) => s === "scheduled").length;
      const hold = entries.filter(([, s]) => s === "hold").length;
      const closed = entries.filter(([, s]) => s === "closed").length;

      const operatingCount = open + scheduled;
      liftSummary = `${operatingCount}/${total} lifts operating`;
      const notes: string[] = [];
      if (hold > 0) notes.push(`${hold} on hold`);
      if (closed > 0) notes.push(`${closed} closed`);
      if (notes.length) liftSummary += ` (${notes.join(", ")})`;

      const openLifts = entries
        .filter(([, s]) => s === "open" || s === "scheduled")
        .map(([n]) => n);
      if (openLifts.length > 0) {
        openLiftsList = `  Open lifts: ${openLifts.join(", ")}`;
      }
    }

    // -- OnTheSnow snow conditions --
    const snowParts: string[] = [];
    if (snow) {
      if (snow.baseDepthIn !== null)
        snowParts.push(`base ${snow.baseDepthIn}" deep`);
      if (snow.snowLast3Days !== null)
        snowParts.push(`${snow.snowLast3Days}" new (last 3 days)`);
      if (snow.snowNext3Days !== null)
        snowParts.push(`${snow.snowNext3Days}" forecast (next 3 days)`);
      if (snow.openTrails !== null) {
        const trailStr =
          snow.totalTrails !== null
            ? `${snow.openTrails}/${snow.totalTrails} trails open`
            : `${snow.openTrails} trails open`;
        snowParts.push(trailStr);
      }
      if (snow.openLifts !== null && !liftMap) {
        // Only use OnTheSnow lift count when liftie.info data is unavailable
        const liftStr =
          snow.totalLifts !== null
            ? `${snow.openLifts}/${snow.totalLifts} lifts open`
            : `${snow.openLifts} lifts open`;
        snowParts.push(liftStr);
      }
    }

    lines.push(`${name}:`);
    lines.push(`  Weather: ${weatherParts.join(", ")}`);
    lines.push(`  Lifts: ${liftSummary}`);
    if (openLiftsList) lines.push(openLiftsList);
    if (snowParts.length > 0) {
      lines.push(`  Snow/Trails (OnTheSnow): ${snowParts.join(", ")}`);
    } else {
      lines.push(`  Snow/Trails: data unavailable`);
    }
    lines.push(`  Drive from SLC: ~${SLC_DRIVE_MINUTES[key]} min (estimate)`);
    lines.push("");
  }

  lines.push(
    "NOTE: Lift status from liftie.info (~5 min refresh). Weather from Google Weather API. Snow/trail data from OnTheSnow.com (cached 30 min). Drive times are rough estimates from SLC — adjust if the user gives their origin."
  );

  return lines.join("\n");
}

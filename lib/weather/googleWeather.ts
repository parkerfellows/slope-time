/**
 * Google Weather API helper.
 *
 * Fetches an hourly forecast for a given lat/lng, then returns a map keyed by
 * hour ("HH") so callers can look up conditions for any time slot quickly.
 *
 * Returns null on any failure so the API route can degrade gracefully.
 */

import type { WeatherSlice } from "@/lib/schema/planRequest";

const WEATHER_API_BASE = "https://weather.googleapis.com/v1/forecast/hours:lookup";

// ---- Raw API response types ----

/**
 * google.type.DateTime object returned by the Weather API for displayDateTime.
 * Fields match the proto definition: year, month, day, hours (0-23), minutes, seconds.
 */
interface RawDateTime {
  year?: number;
  month?: number;
  day?: number;
  hours?: number;   // 0-23 — this is what we key on
  minutes?: number;
  seconds?: number;
}

interface RawWeatherHour {
  /** google.type.DateTime object (NOT an ISO string) */
  displayDateTime?: RawDateTime;
  temperature?: { degrees?: number };
  wind?: {
    speed?: { value?: number };
    direction?: { cardinal?: string };
  };
  precipitation?: {
    probability?: { percent?: number };
    qpf?: { quantity?: number };
  };
  snowAccumulation?: { quantity?: number };
  weatherCondition?: { description?: { text?: string } };
}

interface RawWeatherResponse {
  forecastHours?: RawWeatherHour[];
}

/** Map of hour string ("07", "08", …) → WeatherSlice */
export type WeatherByHour = Map<string, WeatherSlice>;

/**
 * Fetches up to `pageSize` hours of hourly forecast for the given coordinates.
 *
 * @param lat        Resort latitude
 * @param lng        Resort longitude
 * @param pageSize   Number of hourly slots to fetch (default: 24)
 * @returns Map from two-digit hour string to WeatherSlice, or null on failure.
 */
export async function fetchHourlyWeather(
  lat: number,
  lng: number,
  pageSize = 24
): Promise<WeatherByHour | null> {
  const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
  if (!apiKey) {
    console.warn("[googleWeather] GOOGLE_WEATHER_API_KEY not set — skipping weather");
    return null;
  }

  const url = new URL(WEATHER_API_BASE);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("location.latitude", String(lat));
  url.searchParams.set("location.longitude", String(lng));
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("unitsSystem", "IMPERIAL");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
      console.error(
        `[googleWeather] Weather API responded ${res.status}:`,
        await res.text()
      );
      return null;
    }

    const data = (await res.json()) as RawWeatherResponse;
    const hours = data.forecastHours;
    if (!Array.isArray(hours) || hours.length === 0) {
      console.warn("[googleWeather] No forecastHours in response");
      return null;
    }

    const byHour: WeatherByHour = new Map();

    for (const h of hours) {
      // displayDateTime is a google.type.DateTime object with an `hours` field (0-23).
      const hourNum = h.displayDateTime?.hours;
      if (hourNum === undefined || hourNum === null) continue;
      const hourKey = String(hourNum).padStart(2, "0"); // 9 → "09"

      byHour.set(hourKey, {
        tempF: h.temperature?.degrees ?? null,
        windMph: h.wind?.speed?.value ?? null,
        windDir: h.wind?.direction?.cardinal ?? null,
        precipChance: h.precipitation?.probability?.percent ?? null,
        snowInches: h.snowAccumulation?.quantity ?? null,
        conditionText: h.weatherCondition?.description?.text ?? null,
      });
    }

    return byHour;
  } catch (err) {
    console.error("[googleWeather] Fetch failed:", err);
    return null;
  }
}

/**
 * Given a WeatherByHour map and a HH:MM time string, returns the matching
 * WeatherSlice for that hour, or null if unavailable.
 */
export function getWeatherForTime(
  byHour: WeatherByHour,
  hhMm: string
): WeatherSlice | null {
  const hourKey = hhMm.slice(0, 2);
  return byHour.get(hourKey) ?? null;
}

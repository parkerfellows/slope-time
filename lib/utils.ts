import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WIND_DIR_ABBREVIATIONS: Record<string, string> = {
  NORTH: "N",
  SOUTH: "S",
  EAST: "E",
  WEST: "W",
  NORTHEAST: "NE",
  NORTHWEST: "NW",
  SOUTHEAST: "SE",
  SOUTHWEST: "SW",
};

/** Compact a raw wind direction like "SOUTH_SOUTHEAST" into "SSE" for display. */
export function formatWindDir(raw: string): string {
  const parts = raw
    .split("_")
    .map((word) => WIND_DIR_ABBREVIATIONS[word.toUpperCase()]);
  // Fall back to the raw value if the format is unexpected.
  return parts.every((p) => p !== undefined) ? parts.join("") : raw;
}

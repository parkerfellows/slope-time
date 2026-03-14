/**
 * Scraper for OnTheSnow Utah ski report.
 * URL: https://www.onthesnow.com/utah/skireport
 *
 * Strategy (tried in order):
 *  1. Fetch the page HTML, extract __NEXT_DATA__ JSON, find resort array inside pageProps.
 *  2. Use the __NEXT_DATA__.buildId to call the Next.js internal JSON endpoint
 *     /_next/data/{buildId}/utah/skireport.json which returns pageProps as pure JSON.
 *  3. Regex-scan the raw HTML for data-* attributes or inline JSON objects that
 *     look like resort condition records.
 *
 * Results are cached in-process for 30 minutes.
 */

export interface ResortSnowData {
  name: string;
  /** Snowfall over the past 3 days, inches */
  snowLast3Days: number | null;
  /** Forecast snowfall over the next 3 days, inches */
  snowNext3Days: number | null;
  /** Current base depth, inches */
  baseDepthIn: number | null;
  openTrails: number | null;
  totalTrails: number | null;
  openLifts: number | null;
  totalLifts: number | null;
}

/** Map OnTheSnow name fragments → our internal resort keys */
const NAME_TO_KEY: Array<[string, string]> = [
  ["Deer Valley", "deer-valley"],
  ["Park City", "park-city"],
  ["Snowbird", "snowbird"],
  ["Brighton", "brighton"],
  ["Solitude", "solitude"],
];

export function resortKeyFromName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [fragment, key] of NAME_TO_KEY) {
    if (lower.includes(fragment.toLowerCase())) return key;
  }
  return null;
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

let _cache: { data: Map<string, ResortSnowData>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ─── Main export ─────────────────────────────────────────────────────────────

export async function fetchOnTheSnowData(): Promise<Map<string, ResortSnowData>> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.data;
  }

  try {
    const result = await runStrategies();
    _cache = { data: result, fetchedAt: Date.now() };
    return result;
  } catch (err) {
    console.error("[onTheSnow] Unexpected error:", err);
    return _cache?.data ?? new Map();
  }
}

// ─── Strategy runner ──────────────────────────────────────────────────────────

async function runStrategies(): Promise<Map<string, ResortSnowData>> {
  // Strategy 1 + 2: fetch page HTML, try __NEXT_DATA__ and /_next/data/ endpoint
  const html = await fetchPage("https://www.onthesnow.com/utah/skireport");
  if (!html) {
    console.warn("[onTheSnow] Page fetch failed");
    return new Map();
  }

  const nextData = extractNextData(html);

  if (nextData) {
    // Log structure to help diagnose on first run (only in development)
    if (process.env.NODE_ENV === "development") {
      const topKeys = Object.keys((nextData as Record<string, unknown>).props
        ? ((nextData as Record<string, unknown>).props as Record<string, unknown>)
        : {});
      const ppKeys = Object.keys(
        (((nextData as Record<string, unknown>).props as Record<string, unknown>)
          ?.pageProps ?? {}) as Record<string, unknown>
      );
      console.log("[onTheSnow] __NEXT_DATA__ props keys:", topKeys);
      console.log("[onTheSnow] pageProps keys:", ppKeys);
    }

    // Try parsing resort data directly from __NEXT_DATA__
    const fromNextData = parseResorts(nextData);
    if (fromNextData.size > 0) {
      console.log(`[onTheSnow] Found ${fromNextData.size} resorts via __NEXT_DATA__`);
      return fromNextData;
    }

    // Strategy 2: use buildId to call /_next/data/ JSON endpoint
    const buildId = (nextData as Record<string, unknown>).buildId;
    if (typeof buildId === "string" && buildId) {
      const jsonUrl = `https://www.onthesnow.com/_next/data/${buildId}/utah/skireport.json`;
      console.log(`[onTheSnow] Trying Next.js data endpoint: ${jsonUrl}`);
      const jsonText = await fetchPage(jsonUrl);
      if (jsonText) {
        try {
          const jsonData = JSON.parse(jsonText);
          const fromJson = parseResorts(jsonData);
          if (fromJson.size > 0) {
            console.log(`[onTheSnow] Found ${fromJson.size} resorts via /_next/data/`);
            return fromJson;
          }
          if (process.env.NODE_ENV === "development") {
            console.log("[onTheSnow] /_next/data/ keys:", Object.keys(jsonData ?? {}));
          }
        } catch {
          console.warn("[onTheSnow] Failed to parse /_next/data/ response");
        }
      }
    }
  } else {
    console.warn("[onTheSnow] __NEXT_DATA__ not found in page HTML");
  }

  // Strategy 3: regex scan the HTML for inline JSON objects with resort-like fields
  const fromHtml = scanHtmlForResortData(html);
  if (fromHtml.size > 0) {
    console.log(`[onTheSnow] Found ${fromHtml.size} resorts via HTML regex scan`);
    return fromHtml;
  }

  console.warn("[onTheSnow] All strategies returned no data. OnTheSnow may be loading data client-side.");
  return new Map();
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    if (!res.ok) {
      console.warn(`[onTheSnow] HTTP ${res.status} for ${url}`);
      return null;
    }
    return res.text();
  } catch (err) {
    console.warn(`[onTheSnow] Fetch error for ${url}:`, err);
    return null;
  }
}

// ─── Extract __NEXT_DATA__ ───────────────────────────────────────────────────

function extractNextData(html: string): unknown | null {
  const match = html.match(
    /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    console.warn("[onTheSnow] Failed to parse __NEXT_DATA__ JSON");
    return null;
  }
}

// ─── Strategy 3: regex scan raw HTML for resort JSON blobs ───────────────────

/**
 * Scan the raw HTML for any JSON-like substring that contains a Utah resort
 * name next to snow-related fields. Useful when data is inlined in a
 * <script type="application/json"> or similar tag that isn't __NEXT_DATA__.
 */
function scanHtmlForResortData(html: string): Map<string, ResortSnowData> {
  const map = new Map<string, ResortSnowData>();

  // Find all <script> tag contents and any large JSON-like braces
  const scriptContents: string[] = [];
  const scriptRe = /<script[^>]*>([\s\S]{100,}?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html)) !== null) {
    scriptContents.push(m[1]);
  }

  for (const src of scriptContents) {
    // Look for JSON array/object containing a Utah resort name
    if (
      !/(Deer Valley|Park City|Snowbird|Brighton|Solitude)/i.test(src)
    ) continue;

    // Try to find JSON objects containing resort data
    // Look for patterns like {"name":"Snowbird",...} or {"resortName":"Snowbird",...}
    const objRe = /\{[^{}]{20,5000}\}/g;
    let objMatch: RegExpExecArray | null;
    while ((objMatch = objRe.exec(src)) !== null) {
      try {
        const obj = JSON.parse(objMatch[0]);
        const parsed = parseResortObject(obj);
        if (parsed) {
          const key = resortKeyFromName(parsed.name);
          if (key) map.set(key, parsed);
        }
      } catch {
        // Not valid JSON, skip
      }
    }
  }

  return map;
}

// ─── Parse resort list from Next.js page data ────────────────────────────────

function parseResorts(root: unknown): Map<string, ResortSnowData> {
  const map = new Map<string, ResortSnowData>();
  const list = tryCommonPaths(root) ?? deepSearch(root) ?? [];
  for (const r of list) {
    const key = resortKeyFromName(r.name);
    if (key) map.set(key, r);
  }
  return map;
}

function tryCommonPaths(root: unknown): ResortSnowData[] | null {
  const data = root as Record<string, unknown>;
  const pageProps =
    (data?.props as Record<string, unknown>)?.pageProps as
      | Record<string, unknown>
      | undefined;

  // Also handle bare objects (e.g. the /_next/data/ response is { pageProps: {...} })
  const candidates: Record<string, unknown>[] = [];
  if (pageProps) candidates.push(pageProps);
  if (data?.pageProps && typeof data.pageProps === "object")
    candidates.push(data.pageProps as Record<string, unknown>);

  const candidateKeys = [
    "resorts", "skiReport", "skiReports", "items", "data",
    "resortList", "reportData", "resortData", "skiResorts",
    "resortConditions", "conditions",
  ];

  for (const pp of candidates) {
    for (const key of candidateKeys) {
      const val = pp[key];
      if (Array.isArray(val) && val.length > 0) {
        const parsed = val.map(parseResortObject).filter(Boolean) as ResortSnowData[];
        if (parsed.length > 0) return parsed;
      }
      // One level deeper
      if (val && typeof val === "object" && !Array.isArray(val)) {
        for (const subKey of candidateKeys) {
          const sub = (val as Record<string, unknown>)[subKey];
          if (Array.isArray(sub) && sub.length > 0) {
            const parsed = sub.map(parseResortObject).filter(Boolean) as ResortSnowData[];
            if (parsed.length > 0) return parsed;
          }
        }
      }
    }
  }

  return null;
}

function deepSearch(node: unknown, depth = 0): ResortSnowData[] | null {
  if (depth > 12 || node === null || typeof node !== "object") return null;

  if (Array.isArray(node) && node.length >= 2) {
    const parsed = node.map(parseResortObject).filter(Boolean) as ResortSnowData[];
    if (parsed.length >= 2) return parsed;
  }

  for (const val of Object.values(node as Record<string, unknown>)) {
    const found = deepSearch(val, depth + 1);
    if (found) return found;
  }

  return null;
}

// ─── Parse a single resort object ────────────────────────────────────────────

function parseResortObject(raw: unknown): ResortSnowData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  const name = stringField(obj, ["name", "resortName", "title", "resort_name"]);
  if (!name || !resortKeyFromName(name)) return null;

  const snowLast3Days = inchesField(obj, [
    "snow3Day", "snow_3day", "snowLast3Days", "recentSnow", "snowfall3Day",
    "newSnow72", "newSnow72h", "last3DaySnow", "snow72h", "snowfall72h",
    "precipLast3Days", "last3Days",
  ]);

  const snowNext3Days = inchesField(obj, [
    "forecast3Day", "forecast_3day", "snowForecast3Day", "snowForecast",
    "forecastSnow", "next3DaySnow", "snowForecast72h", "forecast72h",
    "precipNext3Days", "next3Days",
  ]);

  const baseDepthIn = inchesField(obj, [
    "base", "baseDepth", "base_depth", "snowBase", "snowBaseDepth",
    "baseDepthMax", "baseDepthMin", "snowDepth", "depth",
  ]);

  const { open: openTrails, total: totalTrails } = countPair(obj, [
    "openTrails", "open_trails", "openRuns", "open_runs", "trails", "runs",
  ]);

  const { open: openLifts, total: totalLifts } = countPair(obj, [
    "openLifts", "open_lifts", "lifts",
  ]);

  const hasAnyData =
    snowLast3Days !== null ||
    snowNext3Days !== null ||
    baseDepthIn !== null ||
    openTrails !== null ||
    openLifts !== null;

  if (!hasAnyData) return null;

  return {
    name,
    snowLast3Days,
    snowNext3Days,
    baseDepthIn,
    openTrails,
    totalTrails,
    openLifts,
    totalLifts,
  };
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function stringField(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function inchesField(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    const num = toNumber(v);
    if (num === null) continue;
    if (k.toLowerCase().includes("cm") || num > 300) return Math.round(num / 2.54);
    return num;
  }
  return null;
}

function countPair(
  obj: Record<string, unknown>,
  keys: string[]
): { open: number | null; total: number | null } {
  for (const k of keys) {
    const v = obj[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const sub = v as Record<string, unknown>;
      const open = toNumber(sub["open"] ?? sub["openCount"] ?? sub["operating"]);
      const total = toNumber(sub["total"] ?? sub["totalCount"] ?? sub["all"]);
      if (open !== null || total !== null) return { open, total };
    }
    const num = toNumber(v);
    if (num !== null) {
      const totalKey = Object.keys(obj).find(
        (ok) =>
          (ok.toLowerCase().includes("total") || ok.toLowerCase().includes("all")) &&
          ok.toLowerCase().includes(k.replace(/^open/i, "").toLowerCase())
      );
      return { open: num, total: totalKey ? toNumber(obj[totalKey]) : null };
    }
  }
  return { open: null, total: null };
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    if (!isNaN(n)) return n;
  }
  return null;
}

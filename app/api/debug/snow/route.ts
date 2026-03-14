/**
 * GET /api/debug/snow
 *
 * Development-only endpoint. Shows what __NEXT_DATA__ and the /_next/data/
 * endpoint return from OnTheSnow, so we can inspect the actual JSON structure
 * and tune the parser accordingly.
 *
 * Only accessible when NODE_ENV=development.
 */

import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const pageUrl = "https://www.onthesnow.com/utah/skireport";
  let html: string | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(pageUrl, { headers: HEADERS, cache: "no-store" });
    html = res.ok ? await res.text() : null;
    if (!res.ok) fetchError = `HTTP ${res.status}`;
  } catch (e) {
    fetchError = String(e);
  }

  if (!html) {
    return NextResponse.json({ fetchError, html: null });
  }

  // Extract __NEXT_DATA__
  const match = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  let nextData: unknown = null;
  let nextDataError: string | null = null;

  if (match) {
    try {
      nextData = JSON.parse(match[1]);
    } catch (e) {
      nextDataError = String(e);
    }
  }

  const buildId =
    nextData && typeof (nextData as Record<string, unknown>).buildId === "string"
      ? (nextData as Record<string, unknown>).buildId
      : null;

  // Try /_next/data/ endpoint
  let nextJsonData: unknown = null;
  let nextJsonError: string | null = null;
  if (buildId) {
    const jsonUrl = `https://www.onthesnow.com/_next/data/${buildId}/utah/skireport.json`;
    try {
      const res = await fetch(jsonUrl, { headers: HEADERS, cache: "no-store" });
      if (res.ok) {
        nextJsonData = await res.json();
      } else {
        nextJsonError = `HTTP ${res.status}`;
      }
    } catch (e) {
      nextJsonError = String(e);
    }
  }

  // Summarise the pageProps keys so we know where to look
  const pagePropsKeys =
    nextData
      ? Object.keys(
          (
            ((nextData as Record<string, unknown>).props as Record<string, unknown>)
              ?.pageProps ?? {}
          ) as Record<string, unknown>
        )
      : [];

  const nextJsonPagePropsKeys = nextJsonData
    ? Object.keys(
        ((nextJsonData as Record<string, unknown>).pageProps ?? {}) as Record<
          string,
          unknown
        >
      )
    : [];

  // Truncate large values so the response is readable
  const truncate = (v: unknown, maxLen = 500): unknown => {
    const s = JSON.stringify(v);
    if (s.length <= maxLen) return v;
    return s.slice(0, maxLen) + "… [truncated]";
  };

  return NextResponse.json({
    fetchError,
    nextDataFound: !!nextData,
    nextDataError,
    buildId,
    pagePropsKeys,
    // First-level pageProps values (truncated)
    pagePropsPreview: nextData
      ? Object.fromEntries(
          pagePropsKeys.map((k) => [
            k,
            truncate(
              (
                ((nextData as Record<string, unknown>).props as Record<string, unknown>)
                  ?.pageProps as Record<string, unknown>
              )?.[k]
            ),
          ])
        )
      : null,
    nextJsonError,
    nextJsonPagePropsKeys,
    nextJsonPagePropsPreview: nextJsonData
      ? Object.fromEntries(
          nextJsonPagePropsKeys.map((k) => [
            k,
            truncate(
              ((nextJsonData as Record<string, unknown>).pageProps as Record<
                string,
                unknown
              >)?.[k]
            ),
          ])
        )
      : null,
  });
}

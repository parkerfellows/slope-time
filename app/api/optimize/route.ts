import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { PlanRequestSchema } from "@/lib/schema/planRequest";
import { buildMockPlan } from "@/lib/optimization/mockOptimizer";
import { getDriveMinutes } from "@/lib/maps/driveTime";
import { RESORT_ADDRESSES } from "@/lib/resorts/resortAddresses";
import { fetchHourlyWeather, getWeatherForTime } from "@/lib/weather/googleWeather";
import { fetchLiftStatus } from "@/lib/resorts/liftStatus";
import { LIFTIE_RESORT_IDS } from "@/lib/resorts/liftieIds";
import { fetchResortCoords, fetchLiftMetrics } from "@/lib/supabase/resorts";
import type {
  OptimizeResponse,
  OptimizeErrorResponse,
} from "@/lib/schema/planRequest";

export async function POST(
  req: NextRequest
): Promise<NextResponse<OptimizeResponse | OptimizeErrorResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  let planRequest;
  try {
    planRequest = PlanRequestSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors = Object.fromEntries(
        Object.entries(err.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
      );
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          fieldErrors,
        },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unknown validation error" },
      { status: 400 }
    );
  }

  // Resolve destination address; "best-available" defaults to Deer Valley.
  const resortKey =
    planRequest.resort === "best-available" ? "deer-valley" : planRequest.resort;
  const destination = RESORT_ADDRESSES[resortKey];

  // Fan out network calls in parallel — drive time, lift status, resort data from Supabase.
  const liftieId = LIFTIE_RESORT_IDS[resortKey] ?? null;

  const [realDriveMinutes, liftStatusMap, coords, dbLiftMetrics] = await Promise.all([
    destination ? getDriveMinutes(planRequest.startingLocation, destination) : Promise.resolve(null),
    liftieId ? fetchLiftStatus(liftieId) : Promise.resolve(null),
    fetchResortCoords(resortKey),
    fetchLiftMetrics(resortKey),
  ]);

  const plan = buildMockPlan(
    planRequest,
    realDriveMinutes ?? undefined,
    liftStatusMap,
    dbLiftMetrics
  );

  // Attach hourly weather to each timeline entry.
  if (coords) {
    const weatherByHour = await fetchHourlyWeather(coords.lat, coords.lng);
    if (weatherByHour) {
      for (const entry of plan.timeline) {
        entry.weather = getWeatherForTime(weatherByHour, entry.startTime);
      }
    }
  }

  return NextResponse.json({ success: true, plan }, { status: 200 });
}

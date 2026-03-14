"use client";

import {
  Car,
  MountainSnow,
  ArrowUpFromLine,
  Timer,
  AlertTriangle,
  CircleDot,
  Thermometer,
  Wind,
  CloudSnow,
} from "lucide-react";
import type { DayPlan, LiftStatus, TimelineEntry, WeatherSlice } from "@/lib/schema/planRequest";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLORS: Record<string, string> = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  black: "bg-gray-900",
  "double-black": "bg-gray-900",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  green: "Green",
  blue: "Blue",
  black: "Black",
  "double-black": "Double Black",
};

const LIFT_STATUS_STYLES: Record<LiftStatus, string> = {
  open:      "bg-green-100 text-green-800 border-green-200",
  hold:      "bg-amber-100 text-amber-800 border-amber-200",
  scheduled: "bg-blue-100  text-blue-800  border-blue-200",
  closed:    "bg-red-100   text-red-800   border-red-200",
  unknown:   "bg-gray-100  text-gray-600  border-gray-200",
};

const LIFT_STATUS_LABELS: Record<LiftStatus, string> = {
  open:      "Open",
  hold:      "On Hold",
  scheduled: "Scheduled",
  closed:    "Closed",
  unknown:   "Status Unknown",
};

function LiftStatusBadge({ status }: { status: LiftStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium",
        LIFT_STATUS_STYLES[status]
      )}
    >
      {LIFT_STATUS_LABELS[status]}
    </span>
  );
}

function WeatherChip({ weather }: { weather: WeatherSlice }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
      {weather.tempF !== null && (
        <span className="flex items-center gap-0.5">
          <Thermometer className="h-3 w-3" />
          {Math.round(weather.tempF)}°F
        </span>
      )}
      {weather.windMph !== null && (
        <span className="flex items-center gap-0.5">
          <Wind className="h-3 w-3" />
          {Math.round(weather.windMph)} mph
          {weather.windDir ? ` ${weather.windDir}` : ""}
        </span>
      )}
      {weather.precipChance !== null && weather.precipChance > 0 && (
        <span className="flex items-center gap-0.5">
          <CloudSnow className="h-3 w-3" />
          {weather.precipChance}%
          {weather.snowInches !== null && weather.snowInches > 0
            ? ` (${weather.snowInches.toFixed(1)}")`
            : ""}
        </span>
      )}
      {weather.conditionText && (
        <span className="italic">{weather.conditionText}</span>
      )}
    </div>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const isRun = entry.type === "run";
  const isDrive = entry.type === "drive";
  const isLift = entry.type === "lift";

  return (
    <div className="flex gap-4 items-start py-3 border-b border-border last:border-0">
      {/* Icon column */}
      <div className="w-8 flex justify-center pt-0.5 shrink-0">
        {isDrive && <Car className="h-5 w-5 text-muted-foreground" />}
        {isLift && <ArrowUpFromLine className="h-5 w-5 text-primary" />}
        {isRun && <MountainSnow className="h-5 w-5 text-sky-500" />}
        {entry.type === "buffer" && (
          <Timer className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Times */}
      <div className="w-20 shrink-0 text-xs text-muted-foreground pt-0.5">
        {entry.startTime}–{entry.endTime}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{entry.label}</span>
          {isLift && entry.liftStatus && (
            <LiftStatusBadge status={entry.liftStatus} />
          )}
          {isRun && entry.difficulty && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-white",
                DIFFICULTY_COLORS[entry.difficulty]
              )}
            >
              {entry.difficulty === "double-black" && (
                <>
                  <CircleDot className="h-3 w-3" />
                  <CircleDot className="h-3 w-3" />
                </>
              )}
              {DIFFICULTY_LABELS[entry.difficulty]}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 flex gap-3 flex-wrap">
          <span>{entry.durationMinutes} min</span>
          {isRun && entry.verticalFt && (
            <span>{entry.verticalFt.toLocaleString()} ft vert</span>
          )}
          {entry.details && <span>{entry.details}</span>}
        </div>
        {entry.weather && (
          <div className="mt-1">
            <WeatherChip weather={entry.weather} />
          </div>
        )}
      </div>
    </div>
  );
}

export function DayPlanResult({ plan }: { plan: DayPlan }) {
  return (
    <div className="space-y-6">
      {/* Data sources banner */}
      <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-amber-800 text-xs flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          {plan.isMock ? (
            <><strong>Estimated plan</strong> — drive time, lift status, and weather are all estimated.</>
          ) : (
            <><strong>Live data</strong> where available. Lift timing &amp; vertical figures are still estimated — run geometry coming in a later phase.</>
          )}
        </span>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-base">{plan.resortName}</h2>
        <p className="text-sm text-muted-foreground">{plan.summary}</p>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <Stat label="On mountain" value={`${plan.skiTimeMinutes} min`} />
          <Stat label="Runs" value={String(plan.totalRuns)} />
          <Stat
            label="Vertical"
            value={`${plan.totalVerticalFt.toLocaleString()} ft`}
          />
        </div>
      </div>

      {/* Warnings */}
      {plan.warnings.length > 0 && (
        <ul className="space-y-1.5">
          {plan.warnings.map((w, i) => (
            <li
              key={i}
              className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-2 text-yellow-800 text-xs flex items-start gap-2"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {w}
            </li>
          ))}
        </ul>
      )}

      {/* Timeline */}
      <div className="rounded-lg border bg-card divide-y divide-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40">
          <h3 className="font-medium text-sm">Timeline</h3>
        </div>
        <div className="px-4">
          {plan.timeline.map((entry, i) => (
            <TimelineRow key={i} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

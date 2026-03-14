import Link from "next/link";
import {
  MountainSnow,
  Thermometer,
  Wind,
  Snowflake,
  Layers,
  ChevronRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { fetchDashboardData, type ResortDashboardItem } from "@/lib/dashboard/resortDashboardData";

export const metadata = {
  title: "BestLine — Utah Ski Conditions",
  description: "Live lift status, weather, and snow conditions for Utah ski resorts.",
};

export default async function DashboardPage() {
  const { resorts, fetchedAt } = await fetchDashboardData();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b px-4 py-2.5 flex items-center gap-2 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors"
        >
          <MountainSnow className="h-4 w-4 text-primary" />
          BestLine
        </Link>
        <span className="text-muted-foreground text-xs">/</span>
        <span className="text-sm text-muted-foreground">Conditions</span>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/chat"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Conditions Chat
          </Link>
          <Link
            href="/plan"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Plan my day →
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Utah Ski Conditions</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <RefreshCw className="h-3 w-3" />
              Updated {fetchedAt} MT
            </p>
          </div>
          <Link
            href="/plan"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Plan a ski day <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Resort grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resorts.map((resort) => (
            <ResortCard key={resort.key} resort={resort} />
          ))}
        </div>

        {/* Data source footnote */}
        <p className="mt-6 text-xs text-slate-400 text-center">
          Lift status: liftie.info · Weather: Google Weather API · Snow & trails: OnTheSnow.com
        </p>
      </div>
    </main>
  );
}

// ─── Resort Card ──────────────────────────────────────────────────────────────

function ResortCard({ resort }: { resort: ResortDashboardItem }) {
  const { lifts, weather, snow } = resort;

  const operatingLifts = lifts ? lifts.open + lifts.scheduled : null;
  const liftFraction =
    lifts && lifts.total > 0 ? operatingLifts! / lifts.total : null;

  // Card accent color based on lift openness
  const accent =
    liftFraction === null
      ? "border-slate-200"
      : liftFraction >= 0.65
      ? "border-blue-500"
      : liftFraction >= 0.35
      ? "border-amber-400"
      : "border-red-400";

  return (
    <div
      className={`bg-white rounded-2xl border-t-4 ${accent} shadow-sm border border-slate-100 border-t-[4px] flex flex-col overflow-hidden`}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-lg leading-tight">{resort.name}</h2>
          {lifts ? (
            <div className="text-right shrink-0">
              <span className="text-2xl font-extrabold tabular-nums text-slate-800">
                {operatingLifts}
              </span>
              <span className="text-slate-400 font-medium">/{lifts.total}</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">lifts open</p>
            </div>
          ) : (
            <span className="text-xs text-slate-400 pt-1">Lifts unavailable</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          ~{resort.driveFromSlcMin} min from SLC
          {snow?.openTrails != null && (
            <>
              <span className="text-slate-300">·</span>
              <Layers className="h-3 w-3" />
              {snow.openTrails}
              {snow.totalTrails != null && `/${snow.totalTrails}`} trails
            </>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-100 mx-4" />

      {/* ── Weather ── */}
      <div className="px-4 py-3 space-y-1.5">
        <SectionLabel icon={<Thermometer className="h-3 w-3" />} label="Conditions" />
        {weather ? (
          <>
            <div className="flex items-center gap-3">
              {weather.tempF !== null && (
                <span className="text-3xl font-extrabold tabular-nums text-slate-800">
                  {Math.round(weather.tempF)}°
                </span>
              )}
              <div className="min-w-0">
                {weather.conditionText && (
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {weather.conditionText}
                  </p>
                )}
                {weather.windMph !== null && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {weather.windDir ? `${weather.windDir} ` : ""}
                    {weather.windMph} mph
                    {weather.precipChance !== null && weather.precipChance > 10 && (
                      <span className="ml-1 text-blue-500">
                        · {Math.round(weather.precipChance)}% precip
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            {weather.tempLoF !== null &&
              weather.tempHiF !== null &&
              weather.tempLoF !== weather.tempHiF && (
                <p className="text-xs text-slate-400">
                  {weather.tempLoF}–{weather.tempHiF}°F over next 6 hrs
                </p>
              )}
            {weather.snowThisHour !== null && weather.snowThisHour > 0 && (
              <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                <Snowflake className="h-3 w-3" />
                {weather.snowThisHour.toFixed(1)}&quot; falling now
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">Weather data unavailable</p>
        )}
      </div>

      <div className="h-px bg-slate-100 mx-4" />

      {/* ── Lifts ── */}
      <div className="px-4 py-3 space-y-2">
        <SectionLabel label="Lifts" />
        {lifts ? (
          <>
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  liftFraction! >= 0.65
                    ? "bg-blue-500"
                    : liftFraction! >= 0.35
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${Math.round((liftFraction ?? 0) * 100)}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
              <span className="text-slate-700 font-medium">
                {operatingLifts} open
              </span>
              {lifts.hold > 0 && (
                <span className="text-amber-600">{lifts.hold} on hold</span>
              )}
              {lifts.closed > 0 && (
                <span>{lifts.closed} closed</span>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Lift data unavailable</p>
        )}
      </div>

      <div className="h-px bg-slate-100 mx-4" />

      {/* ── Snow ── */}
      <div className="px-4 py-3">
        <SectionLabel icon={<Snowflake className="h-3 w-3" />} label="Snow" />
        {snow && (snow.baseDepthIn !== null || snow.snowLast3Days !== null) ? (
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            <SnowStat label="Base" value={snow.baseDepthIn} unit="in" />
            <SnowStat label="3-day new" value={snow.snowLast3Days} unit="in" />
            <SnowStat label="3-day fcst" value={snow.snowNext3Days} unit="in" />
          </div>
        ) : (
          <p className="text-sm text-slate-400 mt-1">Snow data unavailable</p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          ~{resort.driveFromSlcMin} min from Salt Lake City
        </span>
        <Link
          href={`/plan?resort=${resort.key}`}
          className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
        >
          Plan day <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function SectionLabel({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1">
      {icon}
      {label}
    </p>
  );
}

function SnowStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-slate-800 tabular-nums leading-tight">
        {value !== null ? value : "—"}
      </p>
      {value !== null && (
        <p className="text-[10px] text-slate-500">{unit}</p>
      )}
    </div>
  );
}

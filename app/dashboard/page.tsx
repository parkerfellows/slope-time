import Link from "next/link";
import {
  Thermometer,
  Wind,
  Snowflake,
  ChevronRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { fetchDashboardData, type ResortDashboardItem } from "@/lib/dashboard/resortDashboardData";
import { formatWindDir } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "BestLine · Utah Ski Conditions",
  description: "Live lift status, weather, and snow conditions for Utah ski resorts.",
};

export default async function DashboardPage() {
  const { resorts, fetchedAt } = await fetchDashboardData();

  return (
    <main className="flex min-h-[100dvh] flex-col bg-background">
      <SiteHeader />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Utah Ski Conditions
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Updated {fetchedAt} MT
            </p>
          </div>
          <Link
            href="/plan"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            Plan a ski day <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Resort grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resorts.map((resort, i) => (
            <div
              key={resort.key}
              className="animate-fade-up"
              style={{ "--stagger": `${i * 60}ms` } as React.CSSProperties}
            >
              <ResortCard resort={resort} />
            </div>
          ))}
        </div>

        {/* Data source footnote */}
        <p className="mt-8 text-center text-xs text-muted-foreground/70">
          Lift status from liftie.info. Weather &amp; snow forecast from Google
          Weather API.
        </p>
      </div>

      <SiteFooter />
    </main>
  );
}

// ─── Resort Card ──────────────────────────────────────────────────────────────

function ResortCard({ resort }: { resort: ResortDashboardItem }) {
  const { lifts, weather, snow } = resort;

  const operatingLifts = lifts ? lifts.open + lifts.scheduled : null;
  const liftFraction =
    lifts && lifts.total > 0 ? operatingLifts! / lifts.total : null;

  const barColor =
    liftFraction === null
      ? "bg-muted"
      : liftFraction >= 0.65
      ? "bg-primary"
      : liftFraction >= 0.35
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* ── Header ── */}
      <div className="px-5 pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            {resort.name}
          </h2>
          {lifts ? (
            <div className="shrink-0 text-right">
              <span className="text-2xl font-extrabold tabular-nums">
                {operatingLifts}
              </span>
              <span className="font-medium text-muted-foreground">
                /{lifts.total}
              </span>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                lifts open
              </p>
            </div>
          ) : (
            <span className="pt-1 text-xs text-muted-foreground">
              Lifts unavailable
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          ~{resort.driveFromSlcMin} min from SLC
        </div>
      </div>

      <div className="mx-5 h-px bg-border" />

      {/* ── Weather ── */}
      <div className="space-y-1.5 px-5 py-3">
        <SectionLabel icon={<Thermometer className="h-3 w-3" />} label="Conditions" />
        {weather ? (
          <>
            <div className="flex items-center gap-3">
              {weather.tempF !== null && (
                <span className="text-3xl font-extrabold tabular-nums">
                  {Math.round(weather.tempF)}°
                </span>
              )}
              <div className="min-w-0">
                {weather.conditionText && (
                  <p className="truncate text-sm font-medium">
                    {weather.conditionText}
                  </p>
                )}
                {weather.windMph !== null && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Wind className="h-3 w-3" />
                    {weather.windDir ? `${formatWindDir(weather.windDir)} ` : ""}
                    {weather.windMph} mph
                    {weather.precipChance !== null && weather.precipChance > 10 && (
                      <span className="ml-1 text-primary">
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
                <p className="text-xs text-muted-foreground/80">
                  {weather.tempLoF}-{weather.tempHiF}°F over next 6 hrs
                </p>
              )}
            {weather.snowThisHour !== null && weather.snowThisHour > 0 && (
              <p className="flex items-center gap-1 text-xs font-medium text-primary">
                <Snowflake className="h-3 w-3" />
                {weather.snowThisHour.toFixed(1)}&quot; falling now
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Weather data unavailable</p>
        )}
      </div>

      <div className="mx-5 h-px bg-border" />

      {/* ── Lifts ── */}
      <div className="space-y-2 px-5 py-3">
        <SectionLabel label="Lifts" />
        {lifts ? (
          <>
            {/* Open-lift share */}
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.round((liftFraction ?? 0) * 100)}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {operatingLifts} open
              </span>
              {lifts.hold > 0 && (
                <span className="text-amber-600">{lifts.hold} on hold</span>
              )}
              {lifts.closed > 0 && <span>{lifts.closed} closed</span>}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Lift data unavailable</p>
        )}
      </div>

      <div className="mx-5 h-px bg-border" />

      {/* ── Snow ── */}
      <div className="px-5 py-3">
        <SectionLabel icon={<Snowflake className="h-3 w-3" />} label="Snow" />
        {snow ? (
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <SnowStat label="This hour" value={snow.snowThisHour} unit="in" />
            <SnowStat label="Next 24h fcst" value={snow.snowNext24h} unit="in" />
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Snow data unavailable</p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto flex items-center justify-between border-t bg-muted/40 px-5 py-3">
        <span className="text-xs text-muted-foreground">
          ~{resort.driveFromSlcMin} min from Salt Lake City
        </span>
        <Link
          href={`/plan?resort=${resort.key}`}
          className="flex items-center gap-0.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
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
    <div className="rounded-lg bg-muted/50 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {value !== null ? (
        <>
          <p className="text-lg font-bold leading-tight tabular-nums">{value}</p>
          <p className="text-[10px] text-muted-foreground">{unit}</p>
        </>
      ) : (
        <p className="pt-1 text-xs text-muted-foreground">No data</p>
      )}
    </div>
  );
}

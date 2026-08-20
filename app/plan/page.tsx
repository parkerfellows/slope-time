"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PlanForm } from "@/components/PlanForm";
import { DayPlanResult } from "@/components/DayPlanResult";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { PlanRequest, DayPlan, OptimizeErrorResponse } from "@/lib/schema/planRequest";
import { RESORTS } from "@/lib/schema/planRequest";

// Isolated into its own component so useSearchParams() can be wrapped in Suspense.
function PlanPageInner() {
  const searchParams = useSearchParams();
  const resortParam = searchParams.get("resort");
  const defaultResort = RESORTS.includes(resortParam as typeof RESORTS[number])
    ? (resortParam as typeof RESORTS[number])
    : "best-available";

  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: PlanRequest) {
    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errJson = json as OptimizeErrorResponse;
        setError(errJson.error ?? "Something went wrong. Please try again.");
        return;
      }

      setPlan(json.plan as DayPlan);

      // Scroll results into view on mobile
      setTimeout(() => {
        document
          .getElementById("plan-results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-10 px-4 py-10 sm:px-6">
      {/* Form section */}
      <section className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Plan your ski day
        </h1>
        <p className="mb-6 mt-1.5 text-sm text-muted-foreground">
          Fill in your time window and preferences. We handle the rest.
        </p>
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <PlanForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            defaultResort={defaultResort}
          />
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton mirrors the results layout */}
      {isLoading && <PlanSkeleton />}

      {/* Results section */}
      {plan && (
        <section id="plan-results" className="animate-fade-up scroll-mt-20">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Your day plan</h2>
          <DayPlanResult plan={plan} />
        </section>
      )}
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <div className="h-5 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <Suspense fallback={null}>
        <PlanPageInner />
      </Suspense>
      <SiteFooter />
    </main>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { PlanForm } from "@/components/PlanForm";
import { DayPlanResult } from "@/components/DayPlanResult";
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
      setError("Network error — please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-10">
      {/* Form section */}
      <section>
        <h1 className="text-2xl font-bold mb-1">Plan your ski day</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Fill in your time window and preferences — we&apos;ll handle the
          rest.
        </p>
        <div className="rounded-lg border bg-card p-6">
          <PlanForm onSubmit={handleSubmit} isLoading={isLoading} defaultResort={defaultResort} />
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Results section */}
      {plan && (
        <section id="plan-results">
          <h2 className="text-xl font-bold mb-4">Your day plan</h2>
          <DayPlanResult plan={plan} />
        </section>
      )}
    </div>
  );
}

export default function PlanPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors"
        >
          <MountainSnow className="h-5 w-5 text-primary" />
          BestLine
        </Link>
      </nav>

      <Suspense fallback={null}>
        <PlanPageInner />
      </Suspense>
    </main>
  );
}

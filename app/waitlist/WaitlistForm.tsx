"use client";

import { useActionState } from "react";
import { submitWaitlist, type LeadFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

const initial: LeadFormState = { status: "idle" };

export function WaitlistForm() {
  const [state, action, isPending] = useActionState(submitWaitlist, initial);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-blue-400" />
        <p className="text-white font-semibold text-lg">You&apos;re on the list!</p>
        <p className="text-white/70 text-sm">
          We&apos;ll reach out when cycling mode and other updates ship.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-white/90 text-sm">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/90 text-sm">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
        size="lg"
      >
        {isPending ? "Joining…" : "Notify me"}
      </Button>
    </form>
  );
}

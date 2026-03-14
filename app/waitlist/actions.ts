"use server";

import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address").max(255),
});

export type LeadFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitWaitlist(
  _prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const parsed = LeadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0]?.message ?? "Invalid input.";
    return { status: "error", message: first };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    source: "waitlist",
  });

  if (error) {
    // Postgres unique-violation code
    if (error.code === "23505") {
      return { status: "error", message: "You're already on the list!" };
    }
    console.error("[waitlist] insert error:", error.message);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return { status: "success" };
}

import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 * Uses the same anon key for now; swap for service role key if you need
 * to bypass RLS in server actions or API routes.
 * Never import this in Client Components.
 */
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
}

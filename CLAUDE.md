# CLAUDE.md — SlopeTime (Ski & Bike Day Optimizer)

You are assisting with **SlopeTime**, a web app that optimizes a skier’s or cyclist’s day given a fixed time window. The goal is:  
“Given when I’m free and where I’m starting from, plan the best possible ski or bike session from driveway to driveway.”

Always prioritize: correctness, clarity, and small, reviewable changes over large rewrites.

---

## 1. Project Overview

- **Name:** SlopeTime
- **Goal:** Generate an optimized day plan for skiing (and later road cycling) given:
  - Time window (start/end)
  - Starting location
  - Target resort/area (or “choose best”)
  - User preferences (maximize runs, vertical, difficulty, etc.)
- **Primary platforms:**
  - Web app (desktop & mobile web first)
- **Current focus (MVP):**
  - Utah ski resorts (e.g., Deer Valley, Park City, Snowbird, Brighton, Solitude)
  - Ski mode only
  - Form-based input first, then natural-language input

Keep scope small and incremental. Prefer shipping a simple version of one flow over starting many half-finished features.

---

## 2. Tech Stack & Constraints

Follow these choices unless explicitly changed:

- **Framework:** Next.js 15 (App Router) with **TypeScript**
- **Rendering:** Use Server Components by default; Client Components only when necessary (forms, maps, interactive UI)
- **Styling:** Tailwind CSS + shadcn/ui
- **State management:** React hooks + server actions; avoid heavy client-side state libraries unless truly needed
- **Database & Auth:** Supabase (PostgreSQL, Row-Level Security, built-in auth)
- **APIs / External services:**
  - Google Maps **Routes/Directions** API for driving time
  - (Later) Google Distance Matrix API for multi-resort comparisons
  - Mapbox GL JS for on-mountain / route maps
  - OpenWeatherMap One Call API for hourly forecasts
  - Ski resort data via:
    - OpenSkiMap (resort, lifts, runs geometry)
    - `ski-resort-status` / SkiAPI (lift & run status) where possible
  - (Phase 2+) Strava API + OpenStreetMap routing for cycling
- **AI / LLM:** Anthropic Claude API (use smaller/cheaper models for extraction where possible)
- **Deployment:** Vercel

Environment variables (never hard‑code keys):

- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `GOOGLE_MAPS_API_KEY`
- `OPENWEATHER_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- Add new env vars to `.env.example` whenever they are introduced.

Use pnpm or npm consistently (default: **pnpm**). Do not mix.

---

## 3. High-Level Features & Priorities

Implement features in this order:

1. **Core Ski Planner (MVP)**
   - A form where users specify:
     - Time window (start/end or duration)
     - Starting location (address or city)
     - Target resort (or “let app choose” within a set list)
     - Optimization goal (max runs, max vert, max difficulty, balanced)
     - Ability level (beginner / intermediate / advanced / expert)
     - Terrain preferences (groomers, moguls, trees, bowls, park)
   - Backend logic that:
     - Calculates drive time to selected resort
     - Estimates available on-mountain time
     - Uses a simple greedy algorithm to construct a sequence of lifts/runs
     - Returns a structured plan (timeline of actions)

2. **Weather & Live Status**
   - Integrate OpenWeatherMap to overlay hourly conditions on the plan
   - Pull lift/run status from `ski-resort-status` or SkiAPI where available
   - Add basic parking/lot selection (start with hard-coded data for a few Utah resorts)

3. **Natural Language Input**
   - Allow free-text prompts (e.g., “I have 9–1, leaving from Provo, want steep groomers at Deer Valley”)
   - Use Claude to extract structured parameters into the same schema the form uses
   - Generate a human-readable summary of the plan

4. **Cycling Mode (later)**
   - Time-constrained route planning for road rides
   - Integration with Strava + OSM-based routing

When modifying behavior, keep both ski and future bike modes in mind, but don’t prematurely generalize at the cost of clarity.

---

## 4. Data & Domain Rules

### Ski Domain

- **Resort modeling:**
  - Represent each resort with:
    - Name, region, coordinates
    - Available parking areas (name + coordinates + notes)
  - Lifts and runs:
    - Pull base geometry from OpenSkiMap where possible
    - Each lift/run should have:
      - ID, name, difficulty (for runs), vertical gain/drop estimates
      - Type (chair, gondola, magic carpet, etc.)
      - Approx ride time and typical lap time (initially rough constants per lift)
- **Statuses:**
  - When live lift/run status is unavailable, default to “unknown” rather than assuming open.
  - Never fabricate exact wait times; approximate relative busyness only if clearly derived (e.g., time-of-day heuristics).
- **Optimization:**
  - Use a simple, explainable algorithm at first:
    - Compute total non-ski time (drive out + drive back + buffer).
    - Remaining time is ski time.
    - Filter lifts/runs based on ability level and status.
    - Score potential laps using:
      - Vertical gain
      - Difficulty preference
      - Run type (groomed vs. ungroomed)
    - Fill time greedily, accounting for lift/run durations.
  - Return a structured plan containing:
    - Drive out
    - Sequence of (lift → run) with estimated times
    - Drive back
- **Weather:**
  - Attach hourly weather slices (temperature, wind, precipitation, visibility) to time segments using OpenWeatherMap.
  - If weather data is missing, show “No data” instead of guessing.

### Cycling Domain (Future)

- Use open data for routing instead of relying on proprietary Komoot algorithms.
- Keep Strava integration focused on:
  - User identity and history
  - Segments or typical pace
- Route generation should remain transparent and reproducible.

---

## 5. Code Organization

Preferred directory layout (can be evolved, but keep consistent):

- `app/`
  - `page.tsx` — marketing/landing page
  - `plan/`
    - `page.tsx` — main ski planner UI (form + results)
  - `api/optimize/route.ts` — POST endpoint returning a plan (MVP logic lives here)
  - (Later) `bike/`, `api/bike-optimize/`, etc.
- `lib/`
  - `resorts/` — resort data, OpenSkiMap adapters, lift/run models
  - `optimization/` — ski optimization engine (pure functions)
  - `weather/` — helpers for OpenWeatherMap
  - `maps/` — Google + Mapbox utilities
  - `schema/` — Zod schemas for request/response types
- `components/`
  - UI components (forms, cards, timeline, map wrappers)
- `types/` — shared TypeScript types if they don’t fit into `lib/schema`

Guidelines:

- Prefer **pure, testable functions** in `lib/` over embedding logic in React components.
- Keep **API routes thin**; delegate work to functions in `lib/`.
- Add JSDoc or short comments where domain logic might be non-obvious (e.g., scoring algorithm).

---

## 6. Coding Style & Quality

- Use **TypeScript strict mode**.
- Use modern React patterns:
  - Functional components
  - Hooks
  - Server Components by default in the App Router
- Validate all external input with **Zod** (especially:
  - API request bodies
  - Query params
  - Data from 3rd-party APIs where practical
- Prefer clear, descriptive names over brevity.

When editing existing code:

- Preserve existing patterns unless there is a strong reason to change.
- Avoid large refactors in the same PR/change as feature work.

---

## 7. How to Work With Claude on This Project

When you (Claude) are asked to help:

1. **Read this file first** to understand goals and constraints.
2. **Ask for the latest context** (e.g., key files, current errors) if they are not already visible.
3. When planning larger changes:
   - Propose a **small plan** (3–7 bullet steps) first.
   - Wait for user confirmation before applying broad edits.
4. When generating code:
   - Prefer **targeted edits** to specific files over massive replacements.
   - Clearly mark sections you’re modifying (e.g., with comments in the diff).
5. When introducing new dependencies:
   - Explain why they’re needed.
   - Add them appropriately to `package.json` and any relevant config.

When in doubt about the user’s intent (e.g., ski vs. bike, MVP vs. nice-to-have), **ask a clarifying question** before making assumptions.

---

## 8. Testing & Verification

Even if there is no formal test suite yet:

- For core logic in `lib/optimization`:
  - Include simple unit-style checks (e.g., test harness using Node scripts or Jest when added).
  - Ensure key scenarios:
    - Short time window (e.g., 2 hours) doesn’t overfill plan.
    - Long drive time leaves at least some ski time; otherwise clearly explain “not worth it”.
- For external APIs:
  - Keep integration points small and mockable.
  - Handle error states gracefully (API down, key missing, quota exceeded).
- For calculations:
  - Log or surface intermediate values in development to sanity-check (e.g., drive time, ski time remaining).

If you change core logic, explain briefly **what changed and why** in the PR description or comments.

---

## 9. UX Principles

- Prioritize **clarity** over cleverness.
- Always explain the plan in plain language:
  - “Leave at 7:45 AM, arrive Deer Valley at 8:30 AM, park at Snow Park Lot, ski from 9:00 AM to 12:00 PM.”
- Show **constraints and tradeoffs**:
  - If there is only time for 3–4 runs, say so.
  - If another resort would give more vert, mention it when appropriate (later feature).
- Design mobile-first layouts; many users will check plans on their phones.

---

## 10. Things NOT To Do

- Do **not**:
  - Hard-code API keys in the repo.
  - Invent fake data for lift status, grooming, or wait times without signaling it as placeholder/mock.
  - Over-abstract early; premature generalization between ski and bike modes.
  - Add heavy client-side state libraries unless absolutely necessary.

When generating mock data for early UI:

- Clearly label it as mock in code (`isMock: true`) and comments.
- Keep mock logic easy to strip out later.

---

If any part of this file appears inconsistent with the existing codebase, ask the user whether to update the code to match the guidelines or adjust the guidelines to the reality of the project.

-- ============================================================
-- SlopeTime — initial schema
-- Run this in the Supabase SQL editor (or via supabase CLI).
-- ============================================================

-- Resorts: one row per ski area
create table if not exists public.resorts (
  id          text primary key,          -- slug, e.g. "deer-valley"
  name        text        not null,
  lat         double precision not null,
  lng         double precision not null,
  created_at  timestamptz default now()
);

-- Lifts: one row per lift/run pairing (static config)
create table if not exists public.lifts (
  id                  bigint generated always as identity primary key,
  resort_id           text        not null references public.resorts(id) on delete cascade,
  lift_name           text        not null,
  lift_minutes        integer     not null,
  run_minutes         integer     not null,
  vert_ft             integer     not null,
  difficulty          text        not null check (difficulty in ('green','blue','black','double-black')),
  terrain             text        not null check (terrain in ('groomers','moguls','trees','bowls','park')),
  representative_run  text        not null,
  created_at          timestamptz default now()
);

-- Index for fast per-resort queries
create index if not exists lifts_resort_id_idx on public.lifts(resort_id);

-- Row-Level Security (read-only public access; no auth needed for resort/lift data)
alter table public.resorts enable row level security;
alter table public.lifts    enable row level security;

create policy "Public read resorts" on public.resorts
  for select using (true);

create policy "Public read lifts" on public.lifts
  for select using (true);

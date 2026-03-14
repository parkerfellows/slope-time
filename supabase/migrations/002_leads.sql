-- ============================================================
-- SlopeTime — leads / waitlist table
-- Run in the Supabase SQL editor after 001_init.sql.
-- ============================================================

create table if not exists public.leads (
  id         bigint generated always as identity primary key,
  name       text        not null,
  email      text        not null,
  source     text        not null default 'waitlist',
  created_at timestamptz not null default now(),
  constraint leads_email_unique unique (email)
);

-- Only allow inserts from the public (anon key); no reads/updates/deletes.
alter table public.leads enable row level security;

create policy "Anyone can join waitlist" on public.leads
  for insert with check (true);

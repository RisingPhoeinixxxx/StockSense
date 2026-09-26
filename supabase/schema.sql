-- StockSense real-time cloud state + authentication support.
-- Run this once in Supabase SQL Editor.

create table if not exists public.app_states (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.app_states enable row level security;

drop policy if exists "authenticated users can read StockSense state" on public.app_states;
drop policy if exists "authenticated users can write StockSense state" on public.app_states;

create policy "authenticated users can read StockSense state"
on public.app_states for select
to authenticated
using (true);

create policy "authenticated users can write StockSense state"
on public.app_states for all
to authenticated
using (true)
with check (true);

-- Required for Supabase Realtime database change events.
alter publication supabase_realtime add table public.app_states;

-- Seed row is intentionally not included here. The first authenticated StockSense
-- client creates it from the application's demo state when no cloud state exists.

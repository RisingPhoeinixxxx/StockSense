-- StockSense production Supabase schema
-- Shared inventory state + private per-user profiles.
-- Run the whole script in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  phone text not null default '',
  role text not null default 'Inventory Manager',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "users can read their own profile" on public.profiles;
drop policy if exists "users can insert their own profile" on public.profiles;
drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can read their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name',''), coalesce(new.email,''), '')
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.app_states (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- The production app uses id='default' as the single shared inventory workspace.
-- Legacy per-user rows can remain; they are ignored by the application.
alter table public.app_states add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.app_states add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.app_states enable row level security;
drop policy if exists "authenticated users can read StockSense state" on public.app_states;
drop policy if exists "authenticated users can write StockSense state" on public.app_states;
drop policy if exists "users can read their StockSense state" on public.app_states;
drop policy if exists "users can insert their StockSense state" on public.app_states;
drop policy if exists "users can update their StockSense state" on public.app_states;
drop policy if exists "users can delete their StockSense state" on public.app_states;
drop policy if exists "authenticated users can read shared StockSense state" on public.app_states;
drop policy if exists "authenticated users can insert shared StockSense state" on public.app_states;
drop policy if exists "authenticated users can update shared StockSense state" on public.app_states;

create policy "authenticated users can read shared StockSense state"
on public.app_states for select to authenticated using (id = 'default');
create policy "authenticated users can insert shared StockSense state"
on public.app_states for insert to authenticated with check (id = 'default');
create policy "authenticated users can update shared StockSense state"
on public.app_states for update to authenticated using (id = 'default') with check (id = 'default');

-- Make sure the app's shared row has no owner restriction.
update public.app_states set user_id = null where id = 'default';

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='app_states') then
    alter publication supabase_realtime add table public.app_states;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='profiles') then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;

insert into public.profiles (id, full_name, email, phone)
select id, coalesce(raw_user_meta_data ->> 'full_name',''), coalesce(email,''), ''
from auth.users
on conflict (id) do nothing;

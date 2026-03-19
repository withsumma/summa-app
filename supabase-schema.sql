-- ============================================================
-- SUMMA — Supabase Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================================

-- 1. FUNDS TABLE
-- Stores every fund created through the setup flow
-- Each fund gets a unique slug for its shareable URL (e.g. withsumma.com/fund/help-jason-recover)
create table public.funds (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,

  -- Unique URL slug (auto-generated from title, e.g. "help-jason-recover")
  slug text unique not null,

  -- Links this fund to the user account that created it
  creator_id uuid references auth.users,

  -- Creator info (from setup screens 0-2)
  fund_for text check (fund_for in ('myself', 'someone')) not null,
  first_name text default '',
  last_name text default '',
  recipient_name text default '',

  -- Fund details (from setup screens 3-6)
  title text not null,
  description text default '',
  goal numeric default 0,
  target_date date,
  cover_photo_url text,

  -- Payment methods (from setup screen 7)
  -- Stored as JSON: { "venmo": "JasonMei", "cashapp": "JasonMei", "zelle": "jason@email.com" }
  payment_handles jsonb default '{}'::jsonb,

  -- Aggregated stats (updated by trigger on contributions)
  raised_amount numeric default 0,
  supporter_count integer default 0,

  -- Fund status
  status text default 'active' check (status in ('active', 'paused', 'completed'))
);

-- Index for fast slug lookups (this is the main query path for supporters)
create index idx_funds_slug on public.funds (slug);


-- 2. CONTRIBUTIONS TABLE
-- Records every supporter contribution (screen 15 → "Record payment")
create table public.contributions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,

  -- Which fund this contribution is for
  fund_id uuid references public.funds(id) on delete cascade not null,

  -- Contribution details
  amount numeric not null check (amount > 0),
  payment_method text check (payment_method in ('venmo', 'cashapp', 'zelle', 'cash')) not null,
  message text default '',

  -- Supporter info (anonymous for now, can add auth later)
  supporter_name text default 'Anonymous',

  -- Status tracking
  status text default 'recorded' check (status in ('recorded', 'confirmed', 'rejected'))
);

-- Index for looking up contributions by fund
create index idx_contributions_fund_id on public.contributions (fund_id);


-- 3. TRIGGER: Auto-update fund stats when a contribution is recorded
-- This keeps raised_amount and supporter_count in sync automatically
create or replace function public.update_fund_stats()
returns trigger as $$
begin
  update public.funds
  set
    raised_amount = (
      select coalesce(sum(amount), 0)
      from public.contributions
      where fund_id = coalesce(NEW.fund_id, OLD.fund_id)
        and status != 'rejected'
    ),
    supporter_count = (
      select count(*)
      from public.contributions
      where fund_id = coalesce(NEW.fund_id, OLD.fund_id)
        and status != 'rejected'
    )
  where id = coalesce(NEW.fund_id, OLD.fund_id);

  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

create trigger on_contribution_change
  after insert or update or delete on public.contributions
  for each row execute function public.update_fund_stats();


-- 4. ROW LEVEL SECURITY
-- Funds: anyone can read (supporters need to view), insert is open for now
alter table public.funds enable row level security;

create policy "Anyone can view funds"
  on public.funds for select
  using (true);

create policy "Anyone can create funds"
  on public.funds for insert
  with check (true);

-- Contributions: anyone can read and create (supporter doesn't need auth for MVP)
alter table public.contributions enable row level security;

create policy "Anyone can view contributions"
  on public.contributions for select
  using (true);

create policy "Anyone can record contributions"
  on public.contributions for insert
  with check (true);

create policy "Anyone can update contributions"
  on public.contributions for update
  using (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- myTCteam Database Schema — Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor to initialize the database.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ──────────────────────────────────────────────────────────────────
-- Extends auth.users (created automatically by Supabase Auth)
create table public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  email                   text not null,
  full_name               text,
  company_name            text,
  phone                   text,
  plan                    text not null default 'per_deal' check (plan in ('per_deal','subscription','high_volume')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  subscription_status     text,
  deals_used_this_month   integer not null default 0,
  deals_cap               integer not null default 0,  -- 10 for subscription, 0 = n/a
  is_admin                boolean not null default false,
  created_at              timestamptz not null default now()
);

-- Helper function: checks admin flag without triggering RLS recursion
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select public.is_admin();
$$;

-- RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile"     on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"   on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"   on public.profiles for select using (public.is_admin());
create policy "Admins can update all profiles" on public.profiles for update using (public.is_admin());
create policy "Service role can insert profiles" on public.profiles for insert with check (true);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── App Settings ──────────────────────────────────────────────────────────────
create table public.app_settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- Seed default settings
insert into public.app_settings (key, value) values
  ('closing_fee', '250'),
  ('deadline_reminder_days', '3'),
  ('subscription_cap_warning_threshold', '8');

alter table public.app_settings enable row level security;
create policy "Admins can manage settings" on public.app_settings for all using (
  public.is_admin()
);
create policy "Anyone authenticated can read settings" on public.app_settings for select using (auth.uid() is not null);

-- ─── Deals ─────────────────────────────────────────────────────────────────────
create table public.deals (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references public.profiles(id) on delete restrict,
  property_address      text not null,
  buyer_name            text,
  seller_name           text,
  escrow_officer        text,
  lender_name           text,
  contract_price        numeric(12,2),
  contract_date         date,
  closing_date          date,
  stage                 text not null default 'intake' check (stage in (
                          'intake','active_tracking','pre_closing','closing','closed','fallen_through'
                        )),
  retainer_paid         boolean not null default false,
  retainer_amount       numeric(8,2) not null default 75,
  closing_fee_amount    numeric(8,2) not null default 250,
  closing_fee_paid      boolean not null default false,
  fallen_through_reason text,
  internal_notes        text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.deals enable row level security;
create policy "Clients can view own deals" on public.deals for select using (auth.uid() = client_id);
create policy "Admins can view all deals"  on public.deals for select using (
  public.is_admin()
);
create policy "Clients can insert own deals" on public.deals for insert with check (auth.uid() = client_id);
create policy "Admins can insert deals" on public.deals for insert with check (
  public.is_admin()
);
create policy "Admins can update deals" on public.deals for update using (
  public.is_admin()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger deals_updated_at before update on public.deals
  for each row execute procedure public.set_updated_at();

-- ─── Checklist Items ───────────────────────────────────────────────────────────
create table public.checklist_items (
  id            uuid primary key default uuid_generate_v4(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  stage         text not null check (stage in (
                  'intake','active_tracking','pre_closing','closing','closed','fallen_through'
                )),
  label         text not null,
  completed     boolean not null default false,
  due_date      date,
  completed_at  timestamptz,
  admin_only    boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.checklist_items enable row level security;
-- Clients can see non-admin items on their own deals
create policy "Clients can view checklist items" on public.checklist_items for select using (
  admin_only = false and
  exists (select 1 from public.deals where id = deal_id and client_id = auth.uid())
);
create policy "Admins can manage checklist items" on public.checklist_items for all using (
  public.is_admin()
);

-- ─── Payments ──────────────────────────────────────────────────────────────────
create table public.payments (
  id                        uuid primary key default uuid_generate_v4(),
  client_id                 uuid not null references public.profiles(id) on delete restrict,
  deal_id                   uuid references public.deals(id) on delete set null,
  type                      text not null check (type in ('retainer','closing_fee','subscription')),
  amount                    numeric(10,2) not null,
  status                    text not null default 'pending' check (status in ('pending','paid','refunded','waived')),
  stripe_payment_intent_id  text,
  stripe_invoice_id         text,
  description               text,
  paid_at                   timestamptz,
  created_at                timestamptz not null default now()
);

alter table public.payments enable row level security;
create policy "Clients can view own payments" on public.payments for select using (auth.uid() = client_id);
create policy "Admins can manage payments"    on public.payments for all using (
  public.is_admin()
);
create policy "Service role can insert payments" on public.payments for insert with check (true);

-- ─── Notifications ─────────────────────────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  deal_id     uuid references public.deals(id) on delete set null,
  type        text not null check (type in ('stage_change','deadline_reminder','cap_warning','payment')),
  subject     text not null,
  body        text not null,
  sent        boolean not null default false,
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;
create policy "Admins can manage notifications" on public.notifications for all using (
  public.is_admin()
);
create policy "Service role can insert notifications" on public.notifications for insert with check (true);

-- ─── Helper view: upcoming deadlines ──────────────────────────────────────────
create or replace view public.upcoming_deadlines as
select
  ci.id                          as checklist_item_id,
  ci.label,
  ci.due_date,
  ci.completed,
  ci.stage,
  d.id                           as deal_id,
  d.property_address             as deal_address,
  d.stage                        as deal_stage,
  d.closing_date,
  p.full_name                    as client_name,
  p.email                        as client_email,
  p.id                           as client_id,
  (ci.due_date - current_date)   as days_until
from public.checklist_items ci
join public.deals d on d.id = ci.deal_id
join public.profiles p on p.id = d.client_id
where
  ci.due_date is not null
  and ci.completed = false
  and d.stage not in ('closed','fallen_through')
order by ci.due_date asc;

-- ─── Monthly reset function (call via cron / Edge Function) ───────────────────
create or replace function public.reset_monthly_deal_counts()
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set deals_used_this_month = 0
  where plan = 'subscription';
end;
$$;

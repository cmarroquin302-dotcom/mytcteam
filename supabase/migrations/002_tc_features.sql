-- ============================================================
-- Migration 002: TC Features
-- Tables: documents, deal_contacts, deal_dates, deal_messages
-- Storage bucket: deal-documents
-- ============================================================

-- ── documents ────────────────────────────────────────────────
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references public.deals(id) on delete cascade,
  uploaded_by     uuid not null references public.profiles(id) on delete cascade,
  file_name       text not null,
  file_size       bigint,
  file_type       text,
  storage_path    text not null,
  category        text not null default 'other',
  admin_only      boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.documents enable row level security;

-- Clients see their own deal docs (excluding admin_only)
create policy "clients_read_own_documents" on public.documents
  for select using (
    exists (
      select 1 from public.deals
      where deals.id = documents.deal_id
        and deals.client_id = auth.uid()
    ) and admin_only = false
  );

-- Clients can upload to their own deals
create policy "clients_insert_own_documents" on public.documents
  for insert with check (
    uploaded_by = auth.uid() and
    exists (
      select 1 from public.deals
      where deals.id = deal_id
        and deals.client_id = auth.uid()
    )
  );

-- Admins can do everything
create policy "admins_all_documents" on public.documents
  for all using (public.is_admin()) with check (public.is_admin());


-- ── deal_contacts ─────────────────────────────────────────────
create table if not exists public.deal_contacts (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  role        text not null,
  name        text not null,
  email       text,
  phone       text,
  company     text,
  notes       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.deal_contacts enable row level security;

create policy "clients_read_own_contacts" on public.deal_contacts
  for select using (
    exists (
      select 1 from public.deals
      where deals.id = deal_contacts.deal_id
        and deals.client_id = auth.uid()
    )
  );

create policy "admins_all_contacts" on public.deal_contacts
  for all using (public.is_admin()) with check (public.is_admin());


-- ── deal_dates ────────────────────────────────────────────────
create table if not exists public.deal_dates (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references public.deals(id) on delete cascade,
  label           text not null,
  date_value      date not null,
  category        text not null default 'custom',
  is_contingency  boolean not null default false,
  cleared         boolean not null default false,
  notes           text,
  created_at      timestamptz not null default now()
);

alter table public.deal_dates enable row level security;

create policy "clients_read_own_dates" on public.deal_dates
  for select using (
    exists (
      select 1 from public.deals
      where deals.id = deal_dates.deal_id
        and deals.client_id = auth.uid()
    )
  );

create policy "admins_all_dates" on public.deal_dates
  for all using (public.is_admin()) with check (public.is_admin());


-- ── deal_messages ─────────────────────────────────────────────
create table if not exists public.deal_messages (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

alter table public.deal_messages enable row level security;

-- Clients read messages on their own deals
create policy "clients_read_own_messages" on public.deal_messages
  for select using (
    exists (
      select 1 from public.deals
      where deals.id = deal_messages.deal_id
        and deals.client_id = auth.uid()
    )
  );

-- Clients can send to their own deals
create policy "clients_insert_own_messages" on public.deal_messages
  for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.deals
      where deals.id = deal_id
        and deals.client_id = auth.uid()
    )
  );

-- Admins can do everything
create policy "admins_all_messages" on public.deal_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- Enable realtime for messages
alter publication supabase_realtime add table public.deal_messages;


-- ── Storage: deal-documents bucket ────────────────────────────
-- Run these if the bucket doesn't already exist in your project.
-- (You can also create it in the Supabase dashboard under Storage.)

insert into storage.buckets (id, name, public)
values ('deal-documents', 'deal-documents', false)
on conflict (id) do nothing;

-- Storage RLS: clients can upload/read files for their own deals
create policy "clients_upload_own_deal_docs" on storage.objects
  for insert with check (
    bucket_id = 'deal-documents' and
    auth.uid() is not null and
    exists (
      select 1 from public.deals
      where deals.id::text = (string_to_array(name, '/'))[1]
        and deals.client_id = auth.uid()
    )
  );

create policy "clients_read_own_deal_docs" on storage.objects
  for select using (
    bucket_id = 'deal-documents' and
    exists (
      select 1 from public.deals
      where deals.id::text = (string_to_array(name, '/'))[1]
        and deals.client_id = auth.uid()
    )
  );

create policy "admins_all_storage" on storage.objects
  for all using (
    bucket_id = 'deal-documents' and public.is_admin()
  ) with check (
    bucket_id = 'deal-documents' and public.is_admin()
  );

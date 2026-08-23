-- ═══════════════════════════════════════════════════════════
-- NaijaPass — Full Supabase Schema
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- Then run: supabase/seed.sql (projects + field reports)
-- ═══════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Helpers ───────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Profiles (individual | business | govt | admin) ───────
-- Extends auth.users.
--   individual / business → /dashboard
--   govt                  → /govt   (state portal, one account per state)
--   admin                 → /admin
-- Create this table BEFORE is_admin() — the function references it.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  role text not null default 'individual'
    check (role in ('individual', 'business', 'govt', 'admin')),
  account_status text not null default 'pending'
    check (account_status in ('pending', 'active', 'suspended', 'rejected')),
  state text,
  lga text,
  avatar_url text,
  -- Individual KYC
  kyc_status text not null default 'unverified'
    check (kyc_status in ('unverified', 'pending', 'verified', 'rejected')),
  nin_hash text,
  bvn_hash text,
  -- Business fields
  business_name text,
  business_type text,
  cac_number text,
  tin text,
  -- Government fields — the single state this officer may publish for
  govt_state text,
  department text,
  office_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- `create table if not exists` is a no-op when profiles already exists from an
-- older deploy, so ensure govt columns exist BEFORE functions that reference them.
alter table public.profiles add column if not exists govt_state text;
alter table public.profiles add column if not exists department text;
alter table public.profiles add column if not exists office_title text;

-- Safe to define after profiles exists
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and account_status = 'active'
  );
$$;

-- The state a signed-in government officer is allowed to publish for.
-- Returns null for every other role, which makes is_govt_for() fail closed.
create or replace function public.current_govt_state()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select govt_state from public.profiles
  where id = auth.uid() and role = 'govt' and account_status = 'active';
$$;

create or replace function public.is_govt_for(target_state text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_state is not null
     and target_state = public.current_govt_state();
$$;

-- Reads through projects' own RLS, so policies on child tables can ask
-- "which state owns this project?" without recursing into projects policies.
create or replace function public.project_state(pid text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select state from public.projects where id = pid;
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text := coalesce(new.raw_user_meta_data->>'role', 'individual');
begin
  -- Government and admin accounts are never self-served; they are provisioned
  -- by supabase/govt-accounts.sql or by an existing admin.
  if new_role not in ('individual', 'business') then
    new_role := 'individual';
  end if;

  insert into public.profiles (id, email, full_name, role, phone, state)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new_role,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'state'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Infrastructure projects ───────────────────────────────

create table if not exists public.projects (
  id text primary key,
  title text not null,
  category text not null,
  description text,
  budget_ngn bigint not null default 0,
  budget_label text not null default 'TBA',
  state text not null,
  lga text,
  status text not null default 'In Progress'
    check (status in ('In Progress', 'Completed', 'Planned', 'Stalled')),
  contractor text,
  completion text,
  reports_count integer not null default 0,
  featured boolean not null default false,
  era text not null default 'current'
    check (era in ('current', 'previous', 'legacy')),
  supervising_agency text,
  source_title text,
  source_url text,
  image_url text,
  notes text,
  published boolean not null default true,
  -- State-portal authoring
  submitted_by uuid references public.profiles (id) on delete set null,
  review_status text not null default 'published'
    check (review_status in ('draft', 'published', 'archived')),
  start_date date,
  expected_completion date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ─── Field inspection reports ──────────────────────────────

create table if not exists public.field_reports (
  id text primary key,
  project_id text not null references public.projects (id) on delete cascade,
  title text not null,
  time_label text,
  body text not null,
  location text,
  status text not null default 'In Progress'
    check (status in ('In Progress', 'Delayed', 'Completed', 'Planned')),
  author text,
  likes integer not null default 0,
  image_url text,
  verified boolean not null default true,
  -- Denormalised from the parent project so state officers can be scoped by RLS
  state text,
  submitted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists field_reports_updated_at on public.field_reports;
create trigger field_reports_updated_at
  before update on public.field_reports
  for each row execute function public.set_updated_at();

create or replace function public.sync_field_report_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select state into new.state from public.projects where id = new.project_id;
  return new;
end;
$$;

drop trigger if exists field_reports_sync_state on public.field_reports;
create trigger field_reports_sync_state
  before insert or update of project_id on public.field_reports
  for each row execute function public.sync_field_report_state();

-- ─── Citizen project feedback ──────────────────────────────

create table if not exists public.project_feedback (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.projects (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  user_name text,
  user_email text,
  rating smallint not null check (rating between 1 and 5),
  topic text,
  body text not null,
  visibility text not null default 'public'
    check (visibility in ('public', 'hidden')),
  created_at timestamptz not null default now()
);

-- ─── Business directory ────────────────────────────────────

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  name text not null,
  category text not null,
  subcategory text,
  state text not null,
  lga text,
  address text,
  phone text,
  email text,
  website text,
  description text,
  verified boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'live', 'hidden', 'suspended')),
  cac_number text,
  year_founded text,
  employees text,
  services text[] default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists businesses_updated_at on public.businesses;
create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ─── Marketplace listings ──────────────────────────────────

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles (id) on delete set null,
  business_id uuid references public.businesses (id) on delete set null,
  title text not null,
  category text not null,
  state text not null,
  lga text,
  price numeric,
  currency text not null default 'NGN',
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'live', 'hidden', 'sold', 'expired')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists listings_updated_at on public.listings;
create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ─── Procurement tenders ───────────────────────────────────

create table if not exists public.tenders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  reference text unique,
  mda text,
  state text,
  sector text,
  value numeric,
  currency text not null default 'NGN',
  deadline timestamptz,
  status text not null default 'open'
    check (status in ('open', 'closed', 'awarded', 'cancelled')),
  description text,
  source text,
  published_at timestamptz,
  lga text,
  contact_email text,
  document_url text,
  submitted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tenders_updated_at on public.tenders;
create trigger tenders_updated_at
  before update on public.tenders
  for each row execute function public.set_updated_at();

-- Business procurement: bids + businesses publishing contracts (see business-procurement.sql)
alter table public.tenders add column if not exists publisher_type text
  not null default 'govt';
alter table public.tenders drop constraint if exists tenders_publisher_type_check;
alter table public.tenders add constraint tenders_publisher_type_check
  check (publisher_type in ('govt', 'business', 'federal'));
alter table public.tenders add column if not exists business_id uuid
  references public.businesses (id) on delete set null;

create table if not exists public.tender_bids (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  business_name text not null,
  contact_email text not null,
  proposed_amount numeric,
  currency text not null default 'NGN',
  notes text,
  status text not null default 'submitted'
    check (status in ('draft', 'submitted', 'withdrawn', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tender_id, bidder_id)
);

drop trigger if exists tender_bids_updated_at on public.tender_bids;
create trigger tender_bids_updated_at
  before update on public.tender_bids
  for each row execute function public.set_updated_at();

alter table public.tender_bids enable row level security;

-- ─── State hub content (laws, MDAs, emergency, announcements) ──
-- This is what a state government publishes from /govt/updates.

create table if not exists public.state_content (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  type text not null check (
    type in ('law', 'order', 'mda', 'emergency', 'notice', 'announcement', 'service')
  ),
  title text not null,
  body text,
  contact text,
  phone text,
  url text,
  category text,
  effective_date date,
  published boolean not null default true,
  submitted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists state_content_updated_at on public.state_content;
create trigger state_content_updated_at
  before update on public.state_content
  for each row execute function public.set_updated_at();

-- ─── KYC verification attempts ─────────────────────────────

create table if not exists public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  method text not null check (method in ('nin', 'bvn', 'cac', 'tin')),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'error')),
  provider text,
  provider_ref text,
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Civic chat history ────────────────────────────────────

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  state text,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ─── Admin audit log ───────────────────────────────────────

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
-- Upgrades — makes this file safe to re-run over an older database.
-- `create table if not exists` above is a no-op once a table exists, so
-- anything added after the first deploy has to be applied here too.
-- ═══════════════════════════════════════════════════════════

-- govt_state / department / office_title are added earlier (before
-- current_govt_state()) so re-runs on older DBs don't fail mid-script.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('individual', 'business', 'govt', 'admin'));

alter table public.projects add column if not exists submitted_by uuid
  references public.profiles (id) on delete set null;
alter table public.projects add column if not exists review_status text
  not null default 'published';
alter table public.projects add column if not exists start_date date;
alter table public.projects add column if not exists expected_completion date;
alter table public.projects drop constraint if exists projects_review_status_check;
alter table public.projects add constraint projects_review_status_check
  check (review_status in ('draft', 'published', 'archived'));

alter table public.field_reports add column if not exists state text;
alter table public.field_reports add column if not exists submitted_by uuid
  references public.profiles (id) on delete set null;
update public.field_reports fr
  set state = p.state
  from public.projects p
  where fr.project_id = p.id and fr.state is distinct from p.state;

alter table public.tenders add column if not exists lga text;
alter table public.tenders add column if not exists contact_email text;
alter table public.tenders add column if not exists document_url text;
alter table public.tenders add column if not exists submitted_by uuid
  references public.profiles (id) on delete set null;

alter table public.state_content add column if not exists category text;
alter table public.state_content add column if not exists effective_date date;
alter table public.state_content add column if not exists submitted_by uuid
  references public.profiles (id) on delete set null;
alter table public.state_content drop constraint if exists state_content_type_check;
alter table public.state_content add constraint state_content_type_check
  check (type in ('law', 'order', 'mda', 'emergency', 'notice', 'announcement', 'service'));

-- ─── Row Level Security ────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.field_reports enable row level security;
alter table public.project_feedback enable row level security;
alter table public.businesses enable row level security;
alter table public.listings enable row level security;
alter table public.tenders enable row level security;
alter table public.state_content enable row level security;
alter table public.kyc_verifications enable row level security;
alter table public.chat_messages enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- Projects (public read published; admin write; state officers write own state)
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select using (
    (published = true and review_status = 'published')
    or public.is_admin()
    or public.is_govt_for(state)
  );

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects_govt_insert" on public.projects;
create policy "projects_govt_insert" on public.projects
  for insert with check (public.is_govt_for(state));

drop policy if exists "projects_govt_update" on public.projects;
create policy "projects_govt_update" on public.projects
  for update using (public.is_govt_for(state))
  with check (public.is_govt_for(state));

drop policy if exists "projects_govt_delete" on public.projects;
create policy "projects_govt_delete" on public.projects
  for delete using (public.is_govt_for(state));

-- Field reports
drop policy if exists "field_reports_public_read" on public.field_reports;
create policy "field_reports_public_read" on public.field_reports
  for select using (
    verified = true or public.is_admin() or public.is_govt_for(state)
  );

drop policy if exists "field_reports_admin_write" on public.field_reports;
create policy "field_reports_admin_write" on public.field_reports
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "field_reports_govt_insert" on public.field_reports;
create policy "field_reports_govt_insert" on public.field_reports
  for insert with check (public.is_govt_for(public.project_state(project_id)));

drop policy if exists "field_reports_govt_update" on public.field_reports;
create policy "field_reports_govt_update" on public.field_reports
  for update using (public.is_govt_for(state))
  with check (public.is_govt_for(public.project_state(project_id)));

drop policy if exists "field_reports_govt_delete" on public.field_reports;
create policy "field_reports_govt_delete" on public.field_reports
  for delete using (public.is_govt_for(state));

-- Project feedback
drop policy if exists "feedback_public_read" on public.project_feedback;
create policy "feedback_public_read" on public.project_feedback
  for select using (
    visibility = 'public'
    or auth.uid() = user_id
    or public.is_admin()
    or public.is_govt_for(public.project_state(project_id))
  );

drop policy if exists "feedback_insert_own" on public.project_feedback;
create policy "feedback_insert_own" on public.project_feedback
  for insert with check (auth.uid() = user_id);

drop policy if exists "feedback_admin_all" on public.project_feedback;
create policy "feedback_admin_all" on public.project_feedback
  for all using (public.is_admin()) with check (public.is_admin());

-- A state may hide abusive feedback on its own projects, but never delete it.
drop policy if exists "feedback_govt_moderate" on public.project_feedback;
create policy "feedback_govt_moderate" on public.project_feedback
  for update using (public.is_govt_for(public.project_state(project_id)))
  with check (public.is_govt_for(public.project_state(project_id)));

-- Businesses
drop policy if exists "businesses_public_read" on public.businesses;
create policy "businesses_public_read" on public.businesses
  for select using (status = 'live' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "businesses_owner_insert" on public.businesses;
create policy "businesses_owner_insert" on public.businesses
  for insert with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "businesses_owner_update" on public.businesses;
create policy "businesses_owner_update" on public.businesses
  for update using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "businesses_owner_read" on public.businesses;
create policy "businesses_owner_read" on public.businesses
  for select using (owner_id = auth.uid());

drop policy if exists "businesses_admin_all" on public.businesses;
create policy "businesses_admin_all" on public.businesses
  for all using (public.is_admin()) with check (public.is_admin());

-- A state sees every business registered in its own territory, including
-- pending ones, so it can vet suppliers before awarding contracts.
drop policy if exists "businesses_govt_read" on public.businesses;
create policy "businesses_govt_read" on public.businesses
  for select using (public.is_govt_for(state));

-- Listings
drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read" on public.listings
  for select using (status = 'live' or seller_id = auth.uid() or public.is_admin());

drop policy if exists "listings_seller_insert" on public.listings;
create policy "listings_seller_insert" on public.listings
  for insert with check (seller_id = auth.uid() or public.is_admin());

drop policy if exists "listings_seller_update" on public.listings;
create policy "listings_seller_update" on public.listings
  for update using (seller_id = auth.uid() or public.is_admin());

drop policy if exists "listings_admin_all" on public.listings;
create policy "listings_admin_all" on public.listings
  for all using (public.is_admin());

-- Tenders
drop policy if exists "tenders_public_read" on public.tenders;
create policy "tenders_public_read" on public.tenders
  for select using (true);

drop policy if exists "tenders_admin_write" on public.tenders;
create policy "tenders_admin_write" on public.tenders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tenders_govt_insert" on public.tenders;
create policy "tenders_govt_insert" on public.tenders
  for insert with check (public.is_govt_for(state));

drop policy if exists "tenders_govt_update" on public.tenders;
create policy "tenders_govt_update" on public.tenders
  for update using (public.is_govt_for(state))
  with check (public.is_govt_for(state));

drop policy if exists "tenders_govt_delete" on public.tenders;
create policy "tenders_govt_delete" on public.tenders
  for delete using (public.is_govt_for(state));

drop policy if exists "tenders_business_insert" on public.tenders;
create policy "tenders_business_insert" on public.tenders
  for insert with check (
    submitted_by = auth.uid()
    and publisher_type = 'business'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('business', 'admin')
    )
  );

drop policy if exists "tenders_business_update" on public.tenders;
create policy "tenders_business_update" on public.tenders
  for update using (
    submitted_by = auth.uid() and publisher_type = 'business'
  )
  with check (
    submitted_by = auth.uid() and publisher_type = 'business'
  );

drop policy if exists "tenders_business_delete" on public.tenders;
create policy "tenders_business_delete" on public.tenders
  for delete using (
    submitted_by = auth.uid() and publisher_type = 'business'
  );

-- Tender bids
drop policy if exists "tender_bids_own_read" on public.tender_bids;
create policy "tender_bids_own_read" on public.tender_bids
  for select using (
    bidder_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.tenders t
      where t.id = tender_id and t.submitted_by = auth.uid()
    )
    or public.is_govt_for((select state from public.tenders where id = tender_id))
  );

drop policy if exists "tender_bids_own_insert" on public.tender_bids;
create policy "tender_bids_own_insert" on public.tender_bids
  for insert with check (
    bidder_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('business', 'admin')
    )
  );

drop policy if exists "tender_bids_own_update" on public.tender_bids;
create policy "tender_bids_own_update" on public.tender_bids
  for update using (bidder_id = auth.uid() or public.is_admin())
  with check (bidder_id = auth.uid() or public.is_admin());

drop policy if exists "tender_bids_publisher_update" on public.tender_bids;
create policy "tender_bids_publisher_update" on public.tender_bids
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.tenders t
      where t.id = tender_id and t.submitted_by = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.tenders t
      where t.id = tender_id and t.submitted_by = auth.uid()
    )
  );

-- State content
drop policy if exists "state_content_public_read" on public.state_content;
create policy "state_content_public_read" on public.state_content
  for select using (
    published = true or public.is_admin() or public.is_govt_for(state)
  );

drop policy if exists "state_content_admin_write" on public.state_content;
create policy "state_content_admin_write" on public.state_content
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "state_content_govt_insert" on public.state_content;
create policy "state_content_govt_insert" on public.state_content
  for insert with check (public.is_govt_for(state));

drop policy if exists "state_content_govt_update" on public.state_content;
create policy "state_content_govt_update" on public.state_content
  for update using (public.is_govt_for(state))
  with check (public.is_govt_for(state));

drop policy if exists "state_content_govt_delete" on public.state_content;
create policy "state_content_govt_delete" on public.state_content
  for delete using (public.is_govt_for(state));

-- KYC
drop policy if exists "kyc_own_read" on public.kyc_verifications;
create policy "kyc_own_read" on public.kyc_verifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "kyc_own_insert" on public.kyc_verifications;
create policy "kyc_own_insert" on public.kyc_verifications
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "kyc_admin_all" on public.kyc_verifications;
create policy "kyc_admin_all" on public.kyc_verifications
  for all using (public.is_admin());

-- Chat
drop policy if exists "chat_own_read" on public.chat_messages;
create policy "chat_own_read" on public.chat_messages
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "chat_own_insert" on public.chat_messages;
create policy "chat_own_insert" on public.chat_messages
  for insert with check (user_id = auth.uid());

-- Audit (admin reads everything; any signed-in actor may append its own row)
drop policy if exists "audit_admin_read" on public.audit_logs;
create policy "audit_admin_read" on public.audit_logs
  for select using (public.is_admin() or actor_id = auth.uid());

drop policy if exists "audit_admin_insert" on public.audit_logs;
create policy "audit_admin_insert" on public.audit_logs
  for insert with check (public.is_admin() or actor_id = auth.uid());

-- ─── Indexes ───────────────────────────────────────────────

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_state on public.profiles (state);
create index if not exists idx_projects_state on public.projects (state);
create index if not exists idx_projects_status on public.projects (status);
create index if not exists idx_projects_category on public.projects (category);
create index if not exists idx_field_reports_project on public.field_reports (project_id);
create index if not exists idx_feedback_project on public.project_feedback (project_id);
create index if not exists idx_businesses_state on public.businesses (state);
create index if not exists idx_businesses_status on public.businesses (status);
create unique index if not exists idx_businesses_owner_unique
  on public.businesses (owner_id)
  where owner_id is not null;
create index if not exists idx_listings_status on public.listings (status);
create index if not exists idx_tenders_state on public.tenders (state);
create index if not exists idx_tenders_deadline on public.tenders (deadline);
create index if not exists idx_tender_bids_tender on public.tender_bids (tender_id);
create index if not exists idx_tender_bids_bidder on public.tender_bids (bidder_id);
create index if not exists idx_tenders_publisher on public.tenders (publisher_type);
create index if not exists idx_tenders_submitted_by on public.tenders (submitted_by);
create index if not exists idx_state_content_state on public.state_content (state);
create index if not exists idx_profiles_govt_state on public.profiles (govt_state);
create index if not exists idx_projects_review on public.projects (review_status);
create index if not exists idx_projects_submitted_by on public.projects (submitted_by);
create index if not exists idx_field_reports_state on public.field_reports (state);
create index if not exists idx_state_content_type on public.state_content (state, type);

-- ─── Realtime (optional — also toggle in Dashboard → Replication) ──

do $$
begin
  begin
    alter publication supabase_realtime add table public.projects;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.tenders;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.listings;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.businesses;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.chat_messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.state_content;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.project_feedback;
  exception when duplicate_object then null;
  end;
end $$;

-- ─── Business image storage (run once in Supabase SQL editor) ──

insert into storage.buckets (id, name, public)
values ('business-images', 'business-images', true)
on conflict (id) do update set public = true;

drop policy if exists "business_images_public_read" on storage.objects;
create policy "business_images_public_read" on storage.objects
  for select using (bucket_id = 'business-images');

drop policy if exists "business_images_auth_upload" on storage.objects;
create policy "business_images_auth_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'business-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "business_images_owner_update" on storage.objects;
create policy "business_images_owner_update" on storage.objects
  for update using (
    bucket_id = 'business-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "business_images_owner_delete" on storage.objects;
create policy "business_images_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'business-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── Bootstrap first admin (run AFTER you create the auth user) ──
-- 1. Sign up in the app or Auth → Users with email admin@naijapass.ng
-- 2. Then run:
--
-- update public.profiles
-- set role = 'admin', account_status = 'active', kyc_status = 'verified'
-- where email = 'admin@naijapass.ng';
--
-- ─── Next: the 37 state government logins ──────────────────
-- Run supabase/govt-accounts.sql, then supabase/seed.sql.
-- Business bidding + contract publishing is included above (tender_bids, publisher_type).

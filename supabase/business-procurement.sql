-- Business procurement: bids + allow businesses to publish contracts.
-- Run in Supabase SQL editor.

-- ─── Extra tender columns ──────────────────────────────────
alter table public.tenders add column if not exists publisher_type text
  not null default 'govt';
alter table public.tenders drop constraint if exists tenders_publisher_type_check;
alter table public.tenders add constraint tenders_publisher_type_check
  check (publisher_type in ('govt', 'business', 'federal'));
alter table public.tenders add column if not exists business_id uuid
  references public.businesses (id) on delete set null;

-- ─── Tender bids ───────────────────────────────────────────
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

-- Publishers can accept / reject bids on their own contracts
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

-- ─── Businesses can publish / manage their own tenders ─────
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

create index if not exists idx_tender_bids_tender on public.tender_bids (tender_id);
create index if not exists idx_tender_bids_bidder on public.tender_bids (bidder_id);
create index if not exists idx_tenders_publisher on public.tenders (publisher_type);
create index if not exists idx_tenders_submitted_by on public.tenders (submitted_by);

do $$
begin
  begin
    alter publication supabase_realtime add table public.tender_bids;
  exception when duplicate_object then null;
  end;
end $$;

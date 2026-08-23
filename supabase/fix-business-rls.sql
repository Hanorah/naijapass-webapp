-- Run in Supabase SQL editor if business save fails with RLS errors.

drop policy if exists "businesses_owner_update" on public.businesses;
create policy "businesses_owner_update" on public.businesses
  for update using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "business_images_auth_upload" on storage.objects;
create policy "business_images_auth_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'business-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create unique index if not exists idx_businesses_owner_unique
  on public.businesses (owner_id)
  where owner_id is not null;

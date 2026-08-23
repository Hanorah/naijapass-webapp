-- Fix projects that exist in the DB but stay invisible to the app.
-- Run once in the Supabase SQL editor if the site shows 0 projects
-- while Table Editor shows hundreds of rows.

update public.projects
set published = true,
    review_status = 'published'
where coalesce(published, false) = false
   or review_status is null
   or review_status not in ('draft', 'published', 'archived');

-- Refresh the public-read policy so NULL review_status is treated as published.
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select using (
    (published = true and coalesce(review_status, 'published') = 'published')
    or public.is_admin()
    or public.is_govt_for(state)
  );

-- Case-insensitive state match for government officers.
create or replace function public.is_govt_for(target_state text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_state is not null
     and lower(trim(target_state)) = lower(trim(public.current_govt_state()));
$$;

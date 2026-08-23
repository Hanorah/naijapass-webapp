-- ═══════════════════════════════════════════════════════════
-- NaijaPass — bootstrap the portal administrator
--
-- Prerequisite: run supabase/schema.sql first.
-- Creates admin@naijapass.ng / Admin@NaijaPass2026 and gives it the
-- admin role. Change both values below before running in production.
--
-- Re-running is safe: it resets the password instead of failing.
-- ═══════════════════════════════════════════════════════════

set search_path = public, extensions;

do $$
declare
  user_id    uuid;
  login_mail constant text := 'admin@naijapass.ng';
  login_pass constant text := 'Admin@NaijaPass2026';
begin
  select id into user_id from auth.users where email = login_mail;

  if user_id is null then
    user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      login_mail,
      crypt(login_pass, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Portal Admin","role":"admin","state":"FCT"}'::jsonb,
      now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      user_id::text,
      user_id,
      jsonb_build_object('sub', user_id::text, 'email', login_mail),
      'email',
      now(), now(), now()
    );
  else
    update auth.users
    set encrypted_password = crypt(login_pass, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at         = now()
    where id = user_id;
  end if;

  insert into public.profiles (
    id, email, full_name, role, account_status, state, kyc_status
  ) values (
    user_id, login_mail, 'Portal Admin', 'admin', 'active', 'FCT', 'verified'
  )
  on conflict (id) do update set
    role           = 'admin',
    account_status = 'active',
    kyc_status     = 'verified';
end $$;

select email, role, account_status from public.profiles where role = 'admin';

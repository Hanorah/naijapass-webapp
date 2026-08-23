-- ═══════════════════════════════════════════════════════════
-- NaijaPass — Government (state) portal accounts
--
-- Creates ONE login per state: 36 states + FCT = 37 accounts.
-- Each account can only publish projects, tenders and notices for its
-- own state — enforced in the database by RLS, not just in the UI.
--
-- Prerequisite: run supabase/schema.sql first.
-- Where:        Supabase Dashboard → SQL Editor → New query → Run.
--
-- Re-running this file is safe. It resets the password of any account
-- that already exists instead of failing.
--
-- The last statement prints the full credential list. Copy it, hand each
-- state its own row, and tell them to change the password on first login.
-- ═══════════════════════════════════════════════════════════

set search_path = public, extensions;

do $$
declare
  rec        record;
  user_id    uuid;
  login_mail text;
  login_pass text;
  slug       text;
  -- Change this before running if you want a different shared suffix.
  -- Final password is e.g. Lagos@NaijaPass2026 / CrossRiver@NaijaPass2026
  pass_suffix constant text := '@NaijaPass2026';
begin
  for rec in
    select * from (values
      ('Abia',        'Umuahia',      'Abia State Government'),
      ('Adamawa',     'Yola',         'Adamawa State Government'),
      ('Akwa Ibom',   'Uyo',          'Akwa Ibom State Government'),
      ('Anambra',     'Awka',         'Anambra State Government'),
      ('Bauchi',      'Bauchi',       'Bauchi State Government'),
      ('Bayelsa',     'Yenagoa',      'Bayelsa State Government'),
      ('Benue',       'Makurdi',      'Benue State Government'),
      ('Borno',       'Maiduguri',    'Borno State Government'),
      ('Cross River', 'Calabar',      'Cross River State Government'),
      ('Delta',       'Asaba',        'Delta State Government'),
      ('Ebonyi',      'Abakaliki',    'Ebonyi State Government'),
      ('Edo',         'Benin City',   'Edo State Government'),
      ('Ekiti',       'Ado-Ekiti',    'Ekiti State Government'),
      ('Enugu',       'Enugu',        'Enugu State Government'),
      ('Gombe',       'Gombe',        'Gombe State Government'),
      ('Imo',         'Owerri',       'Imo State Government'),
      ('Jigawa',      'Dutse',        'Jigawa State Government'),
      ('Kaduna',      'Kaduna',       'Kaduna State Government'),
      ('Kano',        'Kano',         'Kano State Government'),
      ('Katsina',     'Katsina',      'Katsina State Government'),
      ('Kebbi',       'Birnin Kebbi', 'Kebbi State Government'),
      ('Kogi',        'Lokoja',       'Kogi State Government'),
      ('Kwara',       'Ilorin',       'Kwara State Government'),
      ('Lagos',       'Ikeja',        'Lagos State Government'),
      ('Nasarawa',    'Lafia',        'Nasarawa State Government'),
      ('Niger',       'Minna',        'Niger State Government'),
      ('Ogun',        'Abeokuta',     'Ogun State Government'),
      ('Ondo',        'Akure',        'Ondo State Government'),
      ('Osun',        'Oshogbo',      'Osun State Government'),
      ('Oyo',         'Ibadan',       'Oyo State Government'),
      ('Plateau',     'Jos',          'Plateau State Government'),
      ('Rivers',      'Port Harcourt','Rivers State Government'),
      ('Sokoto',      'Sokoto',       'Sokoto State Government'),
      ('Taraba',      'Jalingo',      'Taraba State Government'),
      ('Yobe',        'Damaturu',     'Yobe State Government'),
      ('Zamfara',     'Gusau',        'Zamfara State Government'),
      ('FCT',         'Abuja',        'Federal Capital Territory Administration')
    ) as t(state, capital, office)
  loop
    -- 'Cross River' → 'crossriver' → crossriver@govt.naijapass.ng
    slug       := lower(replace(replace(rec.state, ' ', ''), '-', ''));
    login_mail := slug || '@govt.naijapass.ng';
    login_pass := replace(rec.state, ' ', '') || pass_suffix;

    select id into user_id from auth.users where email = login_mail;

    if user_id is null then
      user_id := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        -- GoTrue reads these as non-null strings; leaving them NULL breaks login.
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
        jsonb_build_object(
          'full_name', rec.office,
          'role',      'govt',
          'state',     rec.state
        ),
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
      -- Account already there: just reset the password and re-confirm it.
      update auth.users
      set encrypted_password = crypt(login_pass, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at         = now()
      where id = user_id;
    end if;

    -- handle_new_user() already created a bare profile row on insert.
    -- Promote it to a state government account and lock it to one state.
    insert into public.profiles (
      id, email, full_name, role, account_status,
      state, govt_state, department, office_title, kyc_status
    ) values (
      user_id, login_mail, rec.office, 'govt', 'active',
      rec.state, rec.state, 'Office of the Secretary to the State Government',
      rec.office || ' — ' || rec.capital, 'verified'
    )
    on conflict (id) do update set
      email          = excluded.email,
      full_name      = excluded.full_name,
      role           = 'govt',
      account_status = 'active',
      state          = excluded.state,
      govt_state     = excluded.govt_state,
      -- Keep anything the state already customised in /govt/settings.
      department     = coalesce(profiles.department, excluded.department),
      office_title   = coalesce(profiles.office_title, excluded.office_title),
      kyc_status     = 'verified';
  end loop;
end $$;

-- ─── Your 37 credentials ───────────────────────────────────
-- Password = state name with spaces removed + @NaijaPass2026
-- Sign-in page: /govt/signin   (NOT the public /signin or /signup)

select
  p.govt_state                                       as state,
  p.email                                            as login_email,
  replace(p.govt_state, ' ', '') || '@NaijaPass2026' as password,
  p.full_name                                        as office,
  p.account_status
from public.profiles p
where p.role = 'govt'
order by (p.govt_state = 'FCT'), p.govt_state;

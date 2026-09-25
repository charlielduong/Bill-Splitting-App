insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dev@divi.local', crypt('local-dev-only', gen_salt('bf')), now(), '', '', '', '', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alex@divi.local', crypt('local-dev-only', gen_salt('bf')), now(), '', '', '', '', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sam@divi.local', crypt('local-dev-only', gen_salt('bf')), now(), '', '', '', '', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'taylor@divi.local', crypt('local-dev-only', gen_salt('bf')), now(), '', '', '', '', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jordan@divi.local', crypt('local-dev-only', gen_salt('bf')), now(), '', '', '', '', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'morgan@divi.local', crypt('local-dev-only', gen_salt('bf')), now(), '', '', '', '', '{}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, venmo_username)
values ('00000000-0000-0000-0000-000000000001', 'Charlie', 'charlie')
on conflict (id) do update set display_name = excluded.display_name;

insert into public.profiles (id, display_name)
values
  ('00000000-0000-0000-0000-000000000002', 'Alex'),
  ('00000000-0000-0000-0000-000000000003', 'Sam'),
  ('00000000-0000-0000-0000-000000000004', 'Taylor'),
  ('00000000-0000-0000-0000-000000000005', 'Jordan'),
  ('00000000-0000-0000-0000-000000000006', 'Morgan')
on conflict (id) do nothing;

insert into public.divis (id, title, receipt_date, state, creator_id, payer_id, currency_code, tax_minor_units, tip_minor_units, entered_total_minor_units)
values ('10000000-0000-0000-0000-000000000001', 'Dinner at Barcelona', current_date, 'claiming', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'USD', 592, 1200, 8692)
on conflict (id) do nothing;

insert into public.participants (id, divi_id, user_id, display_name, venmo_username)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Charlie', 'charlie'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Alex', 'alex'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Sam', null),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Taylor', null),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Jordan', null),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'Morgan', null)
on conflict (id) do nothing;

insert into public.receipt_items (id, divi_id, sort_order, name, quantity, amount_minor_units)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 0, 'Patatas bravas', 1, 1400),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 1, 'Paella', 1, 4800),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 2, 'Sparkling water', 1, 700)
on conflict (id) do nothing;

insert into public.item_claims (item_id, participant_id)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003')
on conflict do nothing;

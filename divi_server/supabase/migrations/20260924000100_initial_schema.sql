create extension if not exists "pgcrypto";

create type public.divi_state as enum ('draft', 'claiming', 'finalized', 'settled');
create type public.payment_status as enum ('outstanding', 'partially_paid', 'paid');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone_number text,
  sms_consent_at timestamptz,
  venmo_username text,
  default_currency char(3) not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.divis (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  receipt_date date not null default current_date,
  state public.divi_state not null default 'draft',
  creator_id uuid not null references public.profiles(id),
  payer_id uuid not null references public.profiles(id),
  currency_code char(3) not null default 'USD',
  tax_minor_units integer not null default 0 check (tax_minor_units >= 0),
  tip_minor_units integer not null default 0 check (tip_minor_units >= 0),
  entered_total_minor_units integer not null default 0 check (entered_total_minor_units >= 0),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  divi_id uuid not null references public.divis(id) on delete cascade,
  user_id uuid references public.profiles(id),
  display_name text not null,
  phone_number text,
  sms_consent_at timestamptz,
  venmo_username text,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (divi_id, user_id)
);

create table public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  divi_id uuid not null references public.divis(id) on delete cascade,
  sort_order integer not null,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  amount_minor_units integer not null check (amount_minor_units >= 0),
  created_at timestamptz not null default now()
);

create table public.receipt_adjustments (
  id uuid primary key default gen_random_uuid(),
  divi_id uuid not null references public.divis(id) on delete cascade,
  kind text not null check (kind in ('fee', 'discount')),
  name text not null,
  amount_minor_units integer not null check (amount_minor_units >= 0)
);

create table public.item_claims (
  item_id uuid not null references public.receipt_items(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, participant_id)
);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  divi_id uuid not null references public.divis(id) on delete cascade,
  participant_id uuid not null references public.participants(id),
  items_minor_units integer not null default 0,
  tax_minor_units integer not null default 0,
  tip_minor_units integer not null default 0,
  fees_minor_units integer not null default 0,
  discounts_minor_units integer not null default 0,
  total_minor_units integer not null default 0,
  paid_minor_units integer not null default 0,
  payment_status public.payment_status not null default 'outstanding',
  request_initiated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (divi_id, participant_id)
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  divi_id uuid references public.divis(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  divi_id uuid not null references public.divis(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payment_handoffs (
  id uuid primary key default gen_random_uuid(),
  divi_id uuid not null references public.divis(id) on delete cascade,
  participant_id uuid not null references public.participants(id),
  provider text not null,
  recipient_identifier text,
  amount_minor_units integer not null,
  currency_code char(3) not null,
  label text,
  outcome text not null,
  created_at timestamptz not null default now()
);

create index participants_divi_idx on public.participants(divi_id);
create index receipt_items_divi_idx on public.receipt_items(divi_id, sort_order);
create index activity_events_divi_idx on public.activity_events(divi_id, created_at desc);

create or replace function public.is_divi_member(target_divi uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.divis d where d.id = target_divi and d.creator_id = auth.uid()
  ) or exists (
    select 1 from public.participants p
    where p.divi_id = target_divi and p.user_id = auth.uid() and p.left_at is null
  );
$$;

alter table public.profiles enable row level security;
alter table public.divis enable row level security;
alter table public.participants enable row level security;
alter table public.receipt_items enable row level security;
alter table public.receipt_adjustments enable row level security;
alter table public.item_claims enable row level security;
alter table public.allocations enable row level security;
alter table public.activity_events enable row level security;
alter table public.invitations enable row level security;
alter table public.payment_handoffs enable row level security;

create policy "profiles are self-readable" on public.profiles for select using (id = auth.uid());
create policy "profiles are self-writable" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "members can read divis" on public.divis for select using (public.is_divi_member(id));
create policy "creators manage divis" on public.divis for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "members read participants" on public.participants for select using (public.is_divi_member(divi_id));
create policy "creators manage participants" on public.participants for all using (exists (select 1 from public.divis d where d.id = divi_id and d.creator_id = auth.uid())) with check (exists (select 1 from public.divis d where d.id = divi_id and d.creator_id = auth.uid()));
create policy "members read receipt items" on public.receipt_items for select using (public.is_divi_member(divi_id));
create policy "creators manage receipt items" on public.receipt_items for all using (exists (select 1 from public.divis d where d.id = divi_id and d.creator_id = auth.uid() and d.state = 'draft')) with check (exists (select 1 from public.divis d where d.id = divi_id and d.creator_id = auth.uid() and d.state = 'draft'));
create policy "members read adjustments" on public.receipt_adjustments for select using (public.is_divi_member(divi_id));
create policy "creators manage adjustments" on public.receipt_adjustments for all using (exists (select 1 from public.divis d where d.id = divi_id and d.creator_id = auth.uid() and d.state = 'draft')) with check (exists (select 1 from public.divis d where d.id = divi_id and d.creator_id = auth.uid() and d.state = 'draft'));
create policy "members read claims" on public.item_claims for select using (exists (select 1 from public.receipt_items i where i.id = item_id and public.is_divi_member(i.divi_id)));
create policy "creators manage claims" on public.item_claims for all using (exists (select 1 from public.receipt_items i join public.divis d on d.id = i.divi_id where i.id = item_id and d.creator_id = auth.uid() and d.state = 'claiming')) with check (exists (select 1 from public.receipt_items i join public.divis d on d.id = i.divi_id where i.id = item_id and d.creator_id = auth.uid() and d.state = 'claiming'));
create policy "participants manage own claims" on public.item_claims for all using (exists (select 1 from public.participants p join public.receipt_items i on i.divi_id = p.divi_id where p.id = participant_id and p.user_id = auth.uid() and i.id = item_id)) with check (exists (select 1 from public.participants p join public.receipt_items i on i.divi_id = p.divi_id where p.id = participant_id and p.user_id = auth.uid() and i.id = item_id));
create policy "members read allocations" on public.allocations for select using (public.is_divi_member(divi_id));
create policy "members read activity" on public.activity_events for select using (public.is_divi_member(divi_id));
create policy "members read invitations" on public.invitations for select using (public.is_divi_member(divi_id));
create policy "members read handoffs" on public.payment_handoffs for select using (public.is_divi_member(divi_id));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

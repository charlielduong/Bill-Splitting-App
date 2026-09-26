create table if not exists public.instruments (
  id bigint primary key generated always as identity,
  name text not null
);

grant select on public.instruments to anon;

alter table public.instruments enable row level security;

drop policy if exists "public can read instruments" on public.instruments;
create policy "public can read instruments"
on public.instruments
for select
to anon
using (true);

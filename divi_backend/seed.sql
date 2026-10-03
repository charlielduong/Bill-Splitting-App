insert into public.instruments (name)
values ('violin'), ('viola'), ('cello')
on conflict do nothing;

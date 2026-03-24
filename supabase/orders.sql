create extension if not exists pgcrypto;

create table if not exists public.orders (
  id text primary key,
  email text not null,
  total_usd numeric not null,
  payload jsonb not null,
  saved_from text not null default 'checkout-client',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "public can upsert orders" on public.orders;
create policy "public can upsert orders"
on public.orders
for all
to anon
using (true)
with check (true);

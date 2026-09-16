-- REVELA - Schema Supabase (Postgres)
-- Execute este script no SQL Editor do seu projeto Supabase.

create extension if not exists "pgcrypto";

create table bars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  instagram text,
  owner_whatsapp text,
  stripe_customer_id text,
  created_at timestamp default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid references bars(id) on delete cascade,
  table_number int,
  storage_path text,
  is_approved boolean default true,
  aesthetic_score float,
  filter_used text default 'auto',
  created_at timestamp default now()
);

create table flirts (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid references bars(id) on delete cascade,
  from_table int,
  to_table int,
  message text,
  status text default 'delivered',
  created_at timestamp default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid references bars(id),
  table_a int,
  table_b int,
  expires_at timestamp default now() + interval '30 minutes',
  created_at timestamp default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  from_table int,
  content text,
  created_at timestamp default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid references bars(id) on delete cascade,
  code text unique not null,
  table_number int,
  type text,
  is_used boolean default false,
  created_at timestamp default now()
);

alter publication supabase_realtime add table photos, flirts, coupons;

-- Storage: crie manualmente um bucket público chamado "photos" em
-- Storage > New bucket (marque "Public bucket").

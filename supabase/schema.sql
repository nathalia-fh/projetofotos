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
  access_code text not null default upper(substr(md5(random()::text), 1, 6)),
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

-- Migração idempotente: se o schema já existia sem access_code, aplique:
-- alter table bars add column if not exists access_code text;
-- update bars set access_code = upper(substr(md5(random()::text || id::text), 1, 6)) where access_code is null;
-- alter table bars alter column access_code set default upper(substr(md5(random()::text), 1, 6));
-- alter table bars alter column access_code set not null;

-- Row Level Security: por padrão o Supabase concede acesso total às tabelas
-- via chave anon quando RLS está desligado. Habilite RLS e restrinja o que
-- o app cliente (chave anon, usado no navegador) pode fazer diretamente.
-- Todas as escritas sensíveis (upload de foto, geração/validação de cupom,
-- correio elegante, criação de bar) já passam pelas rotas /api/* usando a
-- service role key, que ignora RLS — então nenhuma política de INSERT/UPDATE
-- para "anon" é necessária.

alter table bars enable row level security;
alter table photos enable row level security;
alter table flirts enable row level security;
alter table coupons enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;

-- Telão, mural e perfil da mesa leem fotos e cupons diretamente do navegador.
create policy "public can read photos" on photos for select using (true);
create policy "public can read coupons" on coupons for select using (true);

-- bars, flirts, matches e messages não são lidos pelo navegador (apenas pelas
-- rotas de servidor com service role), então ficam sem política pública —
-- ou seja, totalmente bloqueados para a chave anon.

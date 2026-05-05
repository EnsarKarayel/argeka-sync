-- ARGEKA CRM SaaS PostgreSQL taslagi
-- Multi-tenant yapida her kayit tenant_id ile ayrilir.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'pro',
  billing_status text not null default 'trialing',
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email citext not null,
  full_name text not null,
  password_hash text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  sector text,
  territory text,
  created_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  full_name text not null,
  email citext,
  phone text,
  created_at timestamptz not null default now()
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  owner_id uuid references users(id) on delete set null,
  title text not null,
  stage text not null default 'new',
  value numeric(14, 2) not null default 0,
  probability integer not null default 20,
  forecast text not null default 'Pipeline',
  source text,
  close_date date,
  next_action text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  owner_id uuid references users(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  provider text not null,
  external_event_id text,
  attendees jsonb not null default '[]',
  agenda jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table action_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  meeting_id uuid references meetings(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  owner_id uuid references users(id) on delete set null,
  title text not null,
  priority text not null default 'Normal',
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table oauth_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  provider text not null,
  scopes text[] not null,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id, provider)
);

create table webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  url text not null,
  secret_ciphertext text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index opportunities_tenant_stage_idx on opportunities (tenant_id, stage);
create index opportunities_tenant_close_date_idx on opportunities (tenant_id, close_date);
create index meetings_tenant_starts_at_idx on meetings (tenant_id, starts_at);
create index action_items_tenant_due_idx on action_items (tenant_id, due_date);
create index sessions_token_hash_idx on sessions (token_hash);
create index sessions_user_idx on sessions (user_id);


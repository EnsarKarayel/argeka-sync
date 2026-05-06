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
  data_scope text not null default 'own',
  hidden_columns text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table app_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  key text not null,
  name text not null,
  data_scope text not null default 'own',
  hidden_columns text[] not null default '{}',
  permissions jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

alter table users add column role_id uuid references app_roles(id) on delete set null;
alter table users add column team_id uuid references teams(id) on delete set null;

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

create table quotes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  owner_id uuid references users(id) on delete set null,
  quote_no text not null,
  title text not null,
  status text not null default 'draft',
  subtotal numeric(14, 2) not null default 0,
  discount numeric(14, 2) not null default 0,
  tax numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, quote_no)
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

create table oauth_app_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  provider text not null,
  client_id text,
  tenant_or_project text,
  scopes text[] not null default '{}',
  redirect_uri text,
  status text not null default 'draft',
  updated_at timestamptz not null default now(),
  unique (tenant_id, provider)
);

create table oauth_authorization_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  provider text not null,
  state text not null unique,
  status text not null default 'created',
  authorize_url text,
  redirect_uri text,
  scopes text[] not null default '{}',
  code_preview text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create table license_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  license_key_hash text,
  customer_name text,
  edition text not null default 'self-hosted',
  status text not null default 'trialing',
  seats integer not null default 5,
  expires_at date,
  activated_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table backup_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  file_name text not null,
  status text not null default 'completed',
  kind text not null default 'backup',
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index opportunities_tenant_stage_idx on opportunities (tenant_id, stage);
create index opportunities_tenant_close_date_idx on opportunities (tenant_id, close_date);
create index accounts_tenant_name_idx on accounts (tenant_id, name);
create index contacts_tenant_account_idx on contacts (tenant_id, account_id);
create index meetings_tenant_starts_at_idx on meetings (tenant_id, starts_at);
create index action_items_tenant_due_idx on action_items (tenant_id, due_date);
create index quotes_tenant_created_idx on quotes (tenant_id, created_at desc);
create index oauth_app_settings_tenant_idx on oauth_app_settings (tenant_id);
create index oauth_authorization_attempts_tenant_idx on oauth_authorization_attempts (tenant_id, created_at desc);
create index sessions_token_hash_idx on sessions (token_hash);
create index sessions_user_idx on sessions (user_id);
create index app_roles_tenant_idx on app_roles (tenant_id);
create index teams_tenant_idx on teams (tenant_id);
create index users_tenant_team_idx on users (tenant_id, team_id);
create index backup_runs_tenant_created_idx on backup_runs (tenant_id, created_at desc);
create index audit_logs_tenant_created_idx on audit_logs (tenant_id, created_at desc);


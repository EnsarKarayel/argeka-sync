const http = require("node:http");
const { createHash, randomBytes, randomUUID } = require("node:crypto");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const port = Number(process.env.PORT || 3000);
const databaseUrl = process.env.DATABASE_URL || "postgres://akis:akis@localhost:5432/akis_crm";
const pool = new Pool({ connectionString: databaseUrl });

function send(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  });
  res.end(JSON.stringify(body));
}

function sendRaw(res, status, contentType, body, headers = {}) {
  res.writeHead(status, {
    "content-type": contentType,
    "access-control-allow-origin": "*",
    ...headers
  });
  res.end(body);
}

const defaultRoles = [
  {
    key: "owner",
    name: "Sistem sahibi",
    dataScope: "all",
    hiddenColumns: [],
    permissions: { admin: true, users: true, license: true, backup: true, export: true }
  },
  {
    key: "business_development",
    name: "İş geliştirme",
    dataScope: "own",
    hiddenColumns: ["forecast", "probability"],
    permissions: { opportunities: true, meetings: true }
  },
  {
    key: "sales_operations",
    name: "Satış operasyon",
    dataScope: "team",
    hiddenColumns: ["note"],
    permissions: { opportunities: true, meetings: true, export: true }
  },
  {
    key: "finance",
    name: "Finans",
    dataScope: "all",
    hiddenColumns: ["nextAction", "note"],
    permissions: { opportunities: true, billing: true, export: true }
  }
];

async function ensureSchema() {
  await pool.query(`
    create table if not exists app_roles (
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

    create table if not exists teams (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      name text not null,
      created_at timestamptz not null default now(),
      unique (tenant_id, name)
    );

    alter table users add column if not exists role_id uuid references app_roles(id) on delete set null;
    alter table users add column if not exists team_id uuid references teams(id) on delete set null;
    alter table users add column if not exists data_scope text not null default 'own';
    alter table users add column if not exists hidden_columns text[] not null default '{}';

    create table if not exists license_settings (
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

    create table if not exists backup_runs (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid references tenants(id) on delete cascade,
      file_name text not null,
      status text not null default 'completed',
      kind text not null default 'backup',
      size_bytes bigint not null default 0,
      created_at timestamptz not null default now()
    );

    create table if not exists audit_logs (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid references tenants(id) on delete cascade,
      user_id uuid references users(id) on delete set null,
      action text not null,
      target_type text not null,
      target_id text,
      metadata jsonb not null default '{}',
      created_at timestamptz not null default now()
    );

    create table if not exists quotes (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      account_id uuid references accounts(id) on delete set null,
      contact_id uuid references contacts(id) on delete set null,
      opportunity_id uuid references opportunities(id) on delete set null,
      owner_id uuid references users(id) on delete set null,
      quote_no text not null,
      title text not null,
      status text not null default 'draft',
      subtotal numeric(14,2) not null default 0,
      discount numeric(14,2) not null default 0,
      tax numeric(14,2) not null default 0,
      total numeric(14,2) not null default 0,
      valid_until date,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (tenant_id, quote_no)
    );

    create table if not exists oauth_app_settings (
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

    create table if not exists oauth_authorization_attempts (
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

    create table if not exists sync_connections (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      name text not null,
      db_type text not null,
      role text not null default 'both',
      connection_url text,
      host text,
      port integer,
      database_name text,
      username text,
      ssl_mode text not null default 'prefer',
      status text not null default 'draft',
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists sync_queries (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      name text not null,
      source_connection_id uuid references sync_connections(id) on delete set null,
      sql_text text not null,
      parameters jsonb not null default '{}',
      status text not null default 'draft',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists sync_jobs (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      name text not null,
      query_id uuid references sync_queries(id) on delete set null,
      target_connection_id uuid references sync_connections(id) on delete set null,
      target_table text not null,
      write_mode text not null default 'insert_only',
      conflict_policy text not null default 'strict',
      schedule_type text not null default 'manual',
      schedule_value text,
      enabled boolean not null default true,
      last_run_at timestamptz,
      next_run_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists sync_column_mappings (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      job_id uuid not null references sync_jobs(id) on delete cascade,
      source_column text not null,
      target_column text not null,
      default_value text,
      transform text not null default 'none',
      required boolean not null default false,
      ordinal integer not null default 0,
      created_at timestamptz not null default now()
    );

    create table if not exists sync_job_runs (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      job_id uuid references sync_jobs(id) on delete set null,
      status text not null default 'queued',
      rows_read integer not null default 0,
      rows_written integer not null default 0,
      rows_skipped integer not null default 0,
      error_message text,
      started_at timestamptz not null default now(),
      finished_at timestamptz
    );

    create table if not exists sync_run_logs (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      run_id uuid references sync_job_runs(id) on delete cascade,
      level text not null default 'info',
      message text not null,
      metadata jsonb not null default '{}',
      created_at timestamptz not null default now()
    );

    create table if not exists sync_demo_source (
      id serial primary key,
      customer_code text not null unique,
      customer_name text not null,
      city text,
      balance numeric(14,2) not null default 0,
      updated_at timestamptz not null default now()
    );

    create table if not exists sync_demo_target (
      id serial primary key,
      code text,
      title text,
      city text,
      balance numeric(14,2),
      loaded_at timestamptz not null default now()
    );

    create index if not exists app_roles_tenant_idx on app_roles (tenant_id);
    create index if not exists teams_tenant_idx on teams (tenant_id);
    create index if not exists users_tenant_team_idx on users (tenant_id, team_id);
    create index if not exists backup_runs_tenant_created_idx on backup_runs (tenant_id, created_at desc);
    create index if not exists audit_logs_tenant_created_idx on audit_logs (tenant_id, created_at desc);
    create index if not exists accounts_tenant_name_idx on accounts (tenant_id, name);
    create index if not exists contacts_tenant_account_idx on contacts (tenant_id, account_id);
    create index if not exists quotes_tenant_created_idx on quotes (tenant_id, created_at desc);
    create index if not exists oauth_app_settings_tenant_idx on oauth_app_settings (tenant_id);
    create index if not exists oauth_authorization_attempts_tenant_idx on oauth_authorization_attempts (tenant_id, created_at desc);
    create index if not exists sync_connections_tenant_idx on sync_connections (tenant_id, db_type);
    create index if not exists sync_queries_tenant_idx on sync_queries (tenant_id, created_at desc);
    create index if not exists sync_jobs_tenant_idx on sync_jobs (tenant_id, enabled);
    create index if not exists sync_job_runs_tenant_idx on sync_job_runs (tenant_id, started_at desc);
    create unique index if not exists sync_demo_source_customer_code_idx on sync_demo_source (customer_code);
  `);

  const tid = await tenantId();
  for (const teamName of ["İş Geliştirme", "Satış Operasyon", "Finans"]) {
    await pool.query(
      `insert into teams (tenant_id, name)
       values ($1, $2)
       on conflict (tenant_id, name) do nothing`,
      [tid, teamName]
    );
  }

  for (const role of defaultRoles) {
    await pool.query(
      `insert into app_roles (tenant_id, key, name, data_scope, hidden_columns, permissions)
       values ($1, $2, $3, $4, $5, $6::jsonb)
       on conflict (tenant_id, key) do update
       set name = excluded.name,
           data_scope = excluded.data_scope,
           hidden_columns = excluded.hidden_columns,
           permissions = excluded.permissions`,
      [tid, role.key, role.name, role.dataScope, role.hiddenColumns, JSON.stringify(role.permissions)]
    );
  }

  await pool.query(
    `update users u
     set role_id = r.id,
         data_scope = case when u.role = 'owner' then 'all' else u.data_scope end
     from app_roles r
     where u.tenant_id = r.tenant_id
       and r.key = case when u.role = 'owner' then 'owner' else 'business_development' end
       and u.role_id is null`
  );

  await pool.query(
    `update users u
     set team_id = t.id
     from teams t
     where u.tenant_id = t.tenant_id
       and t.name = 'İş Geliştirme'
       and u.team_id is null`
  );

  await pool.query(
    `insert into license_settings (tenant_id, customer_name, status, edition, seats)
     values ($1, 'ARGEKA Demo', 'trialing', 'self-hosted', 5)
     on conflict (tenant_id) do nothing`,
    [tid]
  );

  await pool.query(
    `insert into accounts (id, tenant_id, name, sector, territory)
     values
       ('55555555-5555-4555-8555-555555555551', $1, 'Nova Teknoloji', 'Teknoloji', 'TR Marmara'),
       ('55555555-5555-4555-8555-555555555552', $1, 'Atlas Lojistik', 'Lojistik', 'TR İç Anadolu')
     on conflict (id) do nothing`,
    [tid]
  );

  await pool.query(
    `insert into contacts (id, tenant_id, account_id, full_name, email, phone)
     values
       ('66666666-6666-4666-8666-666666666661', $1, '55555555-5555-4555-8555-555555555551', 'Ayşe Yılmaz', 'ayse@novatek.example', '+90 212 000 00 01'),
       ('66666666-6666-4666-8666-666666666662', $1, '55555555-5555-4555-8555-555555555552', 'Mehmet Arslan', 'mehmet@atlas.example', '+90 312 000 00 02')
     on conflict (id) do nothing`,
    [tid]
  );

  const admin = await pool.query(
    "select id from users where tenant_id = $1 order by created_at asc limit 1",
    [tid]
  );
  if (admin.rows[0]) {
    await pool.query(
      `insert into quotes (tenant_id, account_id, contact_id, owner_id, quote_no, title, status, subtotal, discount, tax, total, valid_until, notes)
       values ($1, '55555555-5555-4555-8555-555555555551', '66666666-6666-4666-8666-666666666661', $2, 'ARG-2026-0001', 'Nova Teknoloji CRM başlangıç paketi', 'sent', 84000, 0, 16800, 100800, '2026-05-31', 'Demo sonrası yıllık lisans teklifidir.')
       on conflict (tenant_id, quote_no) do nothing`,
      [tid, admin.rows[0].id]
    );
  }

  await pool.query(
    `insert into sync_demo_source (customer_code, customer_name, city, balance)
     values
       ('C-1001', 'Nova Teknoloji', 'Istanbul', 12500),
       ('C-1002', 'Atlas Lojistik', 'Ankara', 8420),
       ('C-1003', 'Vera Medikal', 'Izmir', 21900)
     on conflict (customer_code) do nothing`
  );

  const existingSync = await pool.query("select id from sync_jobs where tenant_id = $1 limit 1", [tid]);
  if (!existingSync.rows[0]) {
    const internal = await pool.query(
      `insert into sync_connections (tenant_id, name, db_type, role, connection_url, database_name, status, notes)
       values
         ($1, 'Demo Kaynak PostgreSQL', 'postgresql', 'source', 'internal://app', 'akis_crm', 'active', 'Kurulumla gelen ornek kaynak baglanti.'),
         ($1, 'Demo Hedef PostgreSQL', 'postgresql', 'target', 'internal://app', 'akis_crm', 'active', 'Kurulumla gelen ornek hedef baglanti.')
       returning id, role`,
      [tid]
    );
    const sourceId = internal.rows.find((row) => row.role === "source")?.id;
    const targetId = internal.rows.find((row) => row.role === "target")?.id;
    if (sourceId && targetId) {
      const query = await pool.query(
        `insert into sync_queries (tenant_id, name, source_connection_id, sql_text, parameters, status)
         values ($1, 'Demo musteri bakiyesi', $2, 'select customer_code, customer_name, city, balance from sync_demo_source where updated_at >= :last_run_at order by id', '{"last_run_at":"2000-01-01T00:00:00Z"}', 'ready')
         returning id`,
        [tid, sourceId]
      );
      const job = await pool.query(
        `insert into sync_jobs (tenant_id, name, query_id, target_connection_id, target_table, write_mode, conflict_policy, schedule_type, schedule_value, enabled)
         values ($1, 'Demo PostgreSQL -> PostgreSQL aktarim', $2, $3, 'sync_demo_target', 'insert_only', 'strict', 'daily', '02:00', true)
         returning id`,
        [tid, query.rows[0].id, targetId]
      );
      await pool.query(
        `insert into sync_column_mappings (tenant_id, job_id, source_column, target_column, ordinal)
         values
           ($1, $2, 'customer_code', 'code', 1),
           ($1, $2, 'customer_name', 'title', 2),
           ($1, $2, 'city', 'city', 3),
           ($1, $2, 'balance', 'balance', 4)`,
        [tid, job.rows[0].id]
      );
    }
  }
}

function opportunityPayload(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.title,
    stage: row.stage,
    value: Number(row.value || 0),
    probability: row.probability,
    forecast: row.forecast,
    source: row.source,
    owner: row.owner_name || "Sistem",
    ownerId: row.owner_id,
    closeDate: row.close_date,
    nextAction: row.next_action,
    note: row.note,
    createdAt: row.created_at
  };
}

function accountPayload(row) {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    territory: row.territory,
    contactCount: Number(row.contact_count || 0),
    opportunityCount: Number(row.opportunity_count || 0),
    createdAt: row.created_at
  };
}

function contactPayload(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    accountName: row.account_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at
  };
}

function quotePayload(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    accountName: row.account_name,
    contactId: row.contact_id,
    contactName: row.contact_name,
    opportunityId: row.opportunity_id,
    ownerId: row.owner_id,
    owner: row.owner_name || "Sistem",
    quoteNo: row.quote_no,
    title: row.title,
    status: row.status,
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    tax: Number(row.tax || 0),
    total: Number(row.total || 0),
    validUntil: row.valid_until,
    notes: row.notes,
    createdAt: row.created_at
  };
}

function actionPayload(row) {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    opportunityId: row.opportunity_id,
    ownerId: row.owner_id,
    owner: row.owner_name || "Sistem",
    title: row.title,
    priority: row.priority,
    due: row.due_date,
    done: Boolean(row.done),
    createdAt: row.created_at
  };
}

function integrationSettingPayload(row) {
  return {
    id: row.id,
    provider: row.provider,
    clientId: row.client_id,
    tenantOrProject: row.tenant_or_project,
    scopes: row.scopes || [],
    redirectUri: row.redirect_uri,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function oauthAttemptPayload(row) {
  return {
    id: row.id,
    provider: row.provider,
    state: row.state,
    status: row.status,
    authorizeUrl: row.authorize_url,
    redirectUri: row.redirect_uri,
    scopes: row.scopes || [],
    codePreview: row.code_preview,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function syncConnectionPayload(row) {
  return {
    id: row.id,
    name: row.name,
    dbType: row.db_type,
    role: row.role,
    connectionUrl: row.connection_url,
    host: row.host,
    port: row.port,
    databaseName: row.database_name,
    username: row.username,
    sslMode: row.ssl_mode,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function syncQueryPayload(row) {
  return {
    id: row.id,
    name: row.name,
    sourceConnectionId: row.source_connection_id,
    sourceConnectionName: row.source_connection_name,
    sqlText: row.sql_text,
    parameters: row.parameters || {},
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function syncJobPayload(row) {
  return {
    id: row.id,
    name: row.name,
    queryId: row.query_id,
    queryName: row.query_name,
    sourceConnectionName: row.source_connection_name,
    targetConnectionId: row.target_connection_id,
    targetConnectionName: row.target_connection_name,
    targetTable: row.target_table,
    writeMode: row.write_mode,
    conflictPolicy: row.conflict_policy,
    scheduleType: row.schedule_type,
    scheduleValue: row.schedule_value,
    enabled: Boolean(row.enabled),
    lastRunAt: row.last_run_at,
    nextRunAt: row.next_run_at,
    mappingCount: Number(row.mapping_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function syncMappingPayload(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    sourceColumn: row.source_column,
    targetColumn: row.target_column,
    defaultValue: row.default_value,
    transform: row.transform,
    required: Boolean(row.required),
    ordinal: Number(row.ordinal || 0)
  };
}

function syncRunPayload(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobName: row.job_name,
    status: row.status,
    rowsRead: Number(row.rows_read || 0),
    rowsWritten: Number(row.rows_written || 0),
    rowsSkipped: Number(row.rows_skipped || 0),
    errorMessage: row.error_message,
    startedAt: row.started_at,
    finishedAt: row.finished_at
  };
}

function licensePayload(row, userCount = 0) {
  const seats = Number(row?.seats || 5);
  const expiresAt = row?.expires_at || null;
  const expired = expiresAt ? new Date(expiresAt) < new Date(new Date().toISOString().slice(0, 10)) : false;
  const rawStatus = row?.status || "trialing";
  const status = expired ? "expired" : rawStatus;
  const seatsAvailable = Math.max(seats - Number(userCount || 0), 0);
  return {
    customerName: row?.customer_name || "ARGEKA Demo",
    edition: row?.edition || "self-hosted",
    status,
    rawStatus,
    seats,
    usedSeats: Number(userCount || 0),
    seatsAvailable,
    expiresAt,
    activatedAt: row?.activated_at || null,
    updatedAt: row?.updated_at || null,
    canCreateUser: ["active", "trialing"].includes(status) && seatsAvailable > 0,
    warnings: [
      ...(status === "expired" ? ["Lisans süresi doldu."] : []),
      ...(status === "review_required" ? ["Lisans anahtarı inceleme gerektiriyor."] : []),
      ...(seatsAvailable === 0 ? ["Kullanıcı limiti doldu."] : [])
    ]
  };
}

function hasPermission(session, key) {
  return isAdmin(session) || session?.permissions?.[key] === true;
}

function canSeeTenantScope(session) {
  return session?.data_scope === "all";
}

function opportunityAccess(session, tableAlias = "o", startIndex = 2) {
  if (session.data_scope === "all") return { clause: "", params: [] };
  if (session.data_scope === "team" && session.team_id) {
    return {
      clause: `and exists (
        select 1 from users owner_user
        where owner_user.id = ${tableAlias}.owner_id
          and owner_user.team_id = $${startIndex}
      )`,
      params: [session.team_id]
    };
  }
  return { clause: `and ${tableAlias}.owner_id = $${startIndex}`, params: [session.user_id] };
}

async function auditLog(session, action, targetType, targetId = null, metadata = {}) {
  if (!session) return;
  await pool.query(
    `insert into audit_logs (tenant_id, user_id, action, target_type, target_id, metadata)
     values ($1, $2, $3, $4, $5, $6::jsonb)`,
    [session.tenant_id, session.user_id, action, targetType, targetId, JSON.stringify(metadata)]
  );
}

async function licenseSnapshot(tenant) {
  const [license, users] = await Promise.all([
    pool.query(
      `select customer_name, edition, status, seats, expires_at, activated_at, updated_at
       from license_settings
       where tenant_id = $1
       limit 1`,
      [tenant]
    ),
    pool.query("select count(*)::int as count from users where tenant_id = $1", [tenant])
  ]);
  return licensePayload(license.rows[0], users.rows[0]?.count || 0);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function tenantId() {
  const result = await pool.query("select id from tenants order by created_at asc limit 1");
  if (result.rows[0]) return result.rows[0].id;
  const created = await pool.query("insert into tenants (name) values ($1) returning id", ["ARGEKA Demo"]);
  return created.rows[0].id;
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

async function currentSession(req) {
  const token = bearerToken(req);
  if (!token) return null;
  const result = await pool.query(
    `select s.tenant_id, s.user_id, u.email, u.full_name, u.role, u.team_id, u.data_scope, u.hidden_columns,
            r.key as role_key, r.name as role_name, r.permissions,
            tm.name as team_name,
            t.name as tenant_name, t.plan
     from sessions s
     join users u on u.id = s.user_id
     join tenants t on t.id = s.tenant_id
     left join app_roles r on r.id = u.role_id
     left join teams tm on tm.id = u.team_id
     where s.token_hash = $1 and s.expires_at > now()
     limit 1`,
    [tokenHash(token)]
  );
  return result.rows[0] || null;
}

function sessionUser(session) {
  return {
    id: session.user_id,
    email: session.email,
    fullName: session.full_name,
    role: session.role_name || session.role,
    roleKey: session.role_key || session.role,
    teamId: session.team_id,
    teamName: session.team_name,
    dataScope: session.data_scope || "own",
    hiddenColumns: session.hidden_columns || [],
    permissions: session.permissions || {}
  };
}

function isAdmin(session) {
  return session?.role === "owner" || session?.role_key === "owner" || session?.permissions?.admin === true;
}

async function requireAdmin(req, res) {
  const session = await requireSession(req, res);
  if (!session) return null;
  if (!isAdmin(session)) {
    send(res, 403, { error: "forbidden" });
    return null;
  }
  return session;
}

async function requireSession(req, res) {
  const session = await currentSession(req);
  if (!session) {
    send(res, 401, { error: "unauthorized" });
    return null;
  }
  return session;
}

async function login(req, res) {
  const body = await readJson(req);
  const result = await pool.query(
    `select u.id, u.tenant_id, u.email, u.full_name, u.password_hash, u.role, u.team_id, u.data_scope, u.hidden_columns,
            r.key as role_key, r.name as role_name, r.permissions,
            tm.name as team_name,
            t.name as tenant_name, t.plan
     from users u
     join tenants t on t.id = u.tenant_id
     left join app_roles r on r.id = u.role_id
     left join teams tm on tm.id = u.team_id
     where lower(u.email::text) = lower($1)
     order by u.created_at asc
     limit 1`,
    [body.email || ""]
  );
  const user = result.rows[0];
  const demoPasswordOk = user?.email === "admin@akis-crm.local" && body.password === "admin123";
  const passwordOk = demoPasswordOk || (user?.password_hash && bcrypt.compareSync(body.password || "", user.password_hash));
  if (!user || !passwordOk) return send(res, 401, { error: "invalid_credentials" });

  const token = randomBytes(32).toString("hex");
  await pool.query(
    `insert into sessions (tenant_id, user_id, token_hash, expires_at)
     values ($1, $2, $3, now() + interval '14 days')`,
    [user.tenant_id, user.id, tokenHash(token)]
  );
  send(res, 200, {
    token,
    user: sessionUser({
      user_id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      role_key: user.role_key,
      role_name: user.role_name,
      team_id: user.team_id,
      team_name: user.team_name,
      data_scope: user.data_scope,
      hidden_columns: user.hidden_columns,
      permissions: user.permissions
    }),
    tenant: { id: user.tenant_id, name: user.tenant_name, plan: user.plan }
  });
}

async function me(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  send(res, 200, {
    user: sessionUser(session),
    tenant: { id: session.tenant_id, name: session.tenant_name, plan: session.plan }
  });
}

async function adminOverview(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  const [tenantResult, usersResult, rolesResult, teamsResult, licenseResult, backupResult, auditResult, opportunitiesResult, meetingsResult, actionsResult, oauthResult, webhookResult, accountsResult, contactsResult, quotesResult, oauthSettingsResult, oauthAttemptResult] =
    await Promise.all([
      pool.query(
        `select id, name, plan, billing_status, created_at
         from tenants
         where id = $1`,
        [session.tenant_id]
      ),
      pool.query(
        `select u.id, u.email, u.full_name, u.role, u.data_scope, u.hidden_columns, u.created_at,
                r.id as role_id, r.key as role_key, r.name as role_name,
                tm.id as team_id, tm.name as team_name
         from users u
         left join app_roles r on r.id = u.role_id
         left join teams tm on tm.id = u.team_id
         where u.tenant_id = $1
         order by created_at asc`,
        [session.tenant_id]
      ),
      pool.query(
        `select id, key, name, data_scope, hidden_columns, permissions
         from app_roles
         where tenant_id = $1
         order by name asc`,
        [session.tenant_id]
      ),
      pool.query(
        `select id, name
         from teams
         where tenant_id = $1
         order by name asc`,
        [session.tenant_id]
      ),
      pool.query(
        `select customer_name, edition, status, seats, expires_at, activated_at, updated_at
         from license_settings
         where tenant_id = $1
         limit 1`,
        [session.tenant_id]
      ),
      pool.query(
        `select file_name, status, kind, size_bytes, created_at
         from backup_runs
         where tenant_id = $1 or tenant_id is null
         order by created_at desc
         limit 1`,
        [session.tenant_id]
      ),
      pool.query(
        `select a.action, a.target_type, a.target_id, a.metadata, a.created_at, u.full_name
         from audit_logs a
         left join users u on u.id = a.user_id
         where a.tenant_id = $1
         order by a.created_at desc
         limit 10`,
        [session.tenant_id]
      ),
      pool.query("select count(*)::int as count from opportunities where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from meetings where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from action_items where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from oauth_connections where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from webhook_endpoints where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from accounts where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from contacts where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from quotes where tenant_id = $1", [session.tenant_id]),
      pool.query("select count(*)::int as count from oauth_app_settings where tenant_id = $1", [session.tenant_id]),
      pool.query(
        `select id, provider, state, status, authorize_url, redirect_uri, scopes, code_preview, error, created_at, updated_at
         from oauth_authorization_attempts
         where tenant_id = $1
         order by created_at desc
         limit 5`,
        [session.tenant_id]
      )
    ]);
  const licenseInfo = licensePayload(licenseResult.rows[0], usersResult.rows.length);

  send(res, 200, {
    tenant: tenantResult.rows[0],
    users: usersResult.rows.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role_name || user.role,
      roleKey: user.role_key || user.role,
      roleId: user.role_id,
      teamId: user.team_id,
      teamName: user.team_name,
      dataScope: user.data_scope,
      hiddenColumns: user.hidden_columns || [],
      createdAt: user.created_at
    })),
    teams: teamsResult.rows.map((team) => ({
      id: team.id,
      name: team.name
    })),
    roles: rolesResult.rows.map((role) => ({
      id: role.id,
      key: role.key,
      name: role.name,
      dataScope: role.data_scope,
      hiddenColumns: role.hidden_columns || [],
      permissions: role.permissions || {}
    })),
    license: licenseInfo,
    oauthAttempts: oauthAttemptResult.rows.map(oauthAttemptPayload),
    backup: backupResult.rows[0] || null,
    audit: auditResult.rows.map((entry) => ({
      action: entry.action,
      targetType: entry.target_type,
      targetId: entry.target_id,
      metadata: entry.metadata || {},
      user: entry.full_name || "Sistem",
      createdAt: entry.created_at
    })),
    counts: {
      opportunities: opportunitiesResult.rows[0].count,
      meetings: meetingsResult.rows[0].count,
      actions: actionsResult.rows[0].count,
      oauthConnections: oauthResult.rows[0].count,
      webhooks: webhookResult.rows[0].count,
      accounts: accountsResult.rows[0].count,
      contacts: contactsResult.rows[0].count,
      quotes: quotesResult.rows[0].count,
      oauthSettings: oauthSettingsResult.rows[0].count
    },
    install: {
      edition: "self-hosted",
      database: "PostgreSQL",
      webPort: process.env.WEB_PORT || "8080",
      apiPort: String(port),
      backupStatus: backupResult.rows[0]?.status || "planned"
    }
  });
}

async function createAdminUser(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const body = await readJson(req);
  if (!body.email || !body.fullName || !body.password || !body.roleId) {
    return send(res, 400, { error: "missing_fields" });
  }
  if (String(body.password).length < 6) {
    return send(res, 400, { error: "weak_password" });
  }
  const license = await licenseSnapshot(session.tenant_id);
  if (!license.canCreateUser) {
    return send(res, 402, {
      error: "license_limit",
      message: license.warnings[0] || "Lisans yeni kullanıcı oluşturmaya izin vermiyor.",
      license
    });
  }

  const roleResult = await pool.query(
    `select id, key, name, data_scope, hidden_columns
     from app_roles
     where id = $1 and tenant_id = $2
     limit 1`,
    [body.roleId, session.tenant_id]
  );
  const role = roleResult.rows[0];
  if (!role) return send(res, 400, { error: "invalid_role" });

  const teamResult = await pool.query(
    `select id, name
     from teams
     where tenant_id = $1 and ($2::uuid is null or id = $2::uuid)
     order by name asc
     limit 1`,
    [session.tenant_id, body.teamId || null]
  );
  const team = teamResult.rows[0];
  if (!team) return send(res, 400, { error: "invalid_team" });

  const dataScope = body.dataScope || role.data_scope || "own";
  const hiddenColumns = Array.isArray(body.hiddenColumns) ? body.hiddenColumns : role.hidden_columns || [];
  const passwordHash = bcrypt.hashSync(body.password, 10);

  const result = await pool.query(
    `insert into users (tenant_id, email, full_name, password_hash, role, role_id, team_id, data_scope, hidden_columns)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id, email, full_name, role, data_scope, hidden_columns, created_at`,
    [session.tenant_id, body.email, body.fullName, passwordHash, role.key, role.id, team.id, dataScope, hiddenColumns]
  );
  const user = result.rows[0];
  await auditLog(session, "user.created", "user", user.id, {
    email: user.email,
    role: role.key,
    team: team.name,
    dataScope
  });
  send(res, 201, {
    data: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: role.name,
      roleKey: role.key,
      roleId: role.id,
      teamId: team.id,
      teamName: team.name,
      dataScope: user.data_scope,
      hiddenColumns: user.hidden_columns || [],
      createdAt: user.created_at
    }
  });
}

async function activateLicense(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const body = await readJson(req);
  if (!body.licenseKey || !body.customerName) {
    return send(res, 400, { error: "missing_fields" });
  }

  const normalizedKey = String(body.licenseKey).trim();
  const valid = /^ARGEKA-[A-Z0-9-]{8,}$/i.test(normalizedKey);
  const status = valid ? "active" : "review_required";
  const result = await pool.query(
    `insert into license_settings
       (tenant_id, license_key_hash, customer_name, edition, status, seats, expires_at, activated_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, now(), now())
     on conflict (tenant_id) do update
     set license_key_hash = excluded.license_key_hash,
         customer_name = excluded.customer_name,
         edition = excluded.edition,
         status = excluded.status,
         seats = excluded.seats,
         expires_at = excluded.expires_at,
         activated_at = excluded.activated_at,
         updated_at = now()
     returning customer_name, edition, status, seats, expires_at, activated_at, updated_at`,
    [
      session.tenant_id,
      tokenHash(normalizedKey),
      body.customerName,
      body.edition || "self-hosted",
      status,
      Number(body.seats || 5),
      body.expiresAt || null
    ]
  );
  await auditLog(session, "license.updated", "license", session.tenant_id, {
    status,
    edition: body.edition || "self-hosted",
    seats: Number(body.seats || 5)
  });
  send(res, 200, { data: result.rows[0] });
}

async function licenseStatus(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  send(res, 200, { data: await licenseSnapshot(session.tenant_id) });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function exportData(req, res, format) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "export")) {
    return send(res, 403, { error: "forbidden" });
  }

  const [opportunities, users] = await Promise.all([
    pool.query(
      `select id, title, stage, value, probability, forecast, source, close_date, next_action, note, created_at
       from opportunities
       where tenant_id = $1
       order by created_at desc`,
      [session.tenant_id]
    ),
    pool.query(
      `select email, full_name, role, data_scope, hidden_columns, created_at
       from users
       where tenant_id = $1
       order by created_at asc`,
      [session.tenant_id]
    )
  ]);

  if (format === "csv") {
    await auditLog(session, "data.exported", "export", "csv", { format });
    const header = ["id", "title", "stage", "value", "probability", "forecast", "source", "close_date", "next_action"];
    const rows = opportunities.rows.map((row) => header.map((key) => csvEscape(row[key])).join(","));
    return sendRaw(
      res,
      200,
      "text/csv; charset=utf-8",
      [header.join(","), ...rows].join("\r\n"),
      { "content-disposition": 'attachment; filename="argeka-opportunities.csv"' }
    );
  }

  if (format === "sql") {
    await auditLog(session, "data.exported", "export", "sql", { format });
    const statements = opportunities.rows.map((row) => {
      const values = ["id", "title", "stage", "value", "probability", "forecast", "source", "close_date", "next_action", "note"]
        .map((key) => row[key] === null || row[key] === undefined ? "null" : `'${String(row[key]).replaceAll("'", "''")}'`);
      return `insert into opportunities_export (id,title,stage,value,probability,forecast,source,close_date,next_action,note) values (${values.join(",")});`;
    });
    return sendRaw(
      res,
      200,
      "application/sql; charset=utf-8",
      ["-- ARGEKA CRM portable SQL export", ...statements].join("\n"),
      { "content-disposition": 'attachment; filename="argeka-export.sql"' }
    );
  }

  await auditLog(session, "data.exported", "export", "json", { format: "json" });
  return send(res, 200, {
    exportedAt: new Date().toISOString(),
    tenant: session.tenant_id,
    data: {
      opportunities: opportunities.rows,
      users: users.rows
    }
  });
}

async function listAccounts(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const result = await pool.query(
    `select a.id, a.name, a.sector, a.territory, a.created_at,
            count(distinct c.id)::int as contact_count,
            count(distinct o.id)::int as opportunity_count
     from accounts a
     left join contacts c on c.account_id = a.id
     left join opportunities o on o.account_id = a.id
     where a.tenant_id = $1
     group by a.id
     order by a.name asc`,
    [session.tenant_id]
  );
  send(res, 200, { data: result.rows.map(accountPayload) });
}

async function createAccount(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const body = await readJson(req);
  if (!body.name) return send(res, 400, { error: "missing_fields" });
  const result = await pool.query(
    `insert into accounts (tenant_id, name, sector, territory)
     values ($1, $2, $3, $4)
     returning id, name, sector, territory, created_at`,
    [session.tenant_id, body.name, body.sector || null, body.territory || null]
  );
  await auditLog(session, "account.created", "account", result.rows[0].id, { name: result.rows[0].name });
  send(res, 201, { data: accountPayload(result.rows[0]) });
}

async function listContacts(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const result = await pool.query(
    `select c.id, c.account_id, a.name as account_name, c.full_name, c.email, c.phone, c.created_at
     from contacts c
     left join accounts a on a.id = c.account_id
     where c.tenant_id = $1
     order by c.created_at desc`,
    [session.tenant_id]
  );
  send(res, 200, { data: result.rows.map(contactPayload) });
}

async function createContact(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const body = await readJson(req);
  if (!body.fullName) return send(res, 400, { error: "missing_fields" });
  const accountId = body.accountId || null;
  if (accountId) {
    const account = await pool.query("select id from accounts where id = $1 and tenant_id = $2", [accountId, session.tenant_id]);
    if (!account.rows[0]) return send(res, 400, { error: "invalid_account" });
  }
  const result = await pool.query(
    `insert into contacts (tenant_id, account_id, full_name, email, phone)
     values ($1, $2, $3, $4, $5)
     returning id, account_id, full_name, email, phone, created_at`,
    [session.tenant_id, accountId, body.fullName, body.email || null, body.phone || null]
  );
  await auditLog(session, "contact.created", "contact", result.rows[0].id, { fullName: result.rows[0].full_name });
  send(res, 201, { data: contactPayload(result.rows[0]) });
}

async function listQuotes(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const access = opportunityAccess(session, "q", 2);
  const result = await pool.query(
    `select q.id, q.account_id, a.name as account_name, q.contact_id, c.full_name as contact_name,
            q.opportunity_id, q.owner_id, u.full_name as owner_name, q.quote_no, q.title, q.status,
            q.subtotal, q.discount, q.tax, q.total, q.valid_until, q.notes, q.created_at
     from quotes q
     left join accounts a on a.id = q.account_id
     left join contacts c on c.id = q.contact_id
     left join users u on u.id = q.owner_id
     where q.tenant_id = $1 ${access.clause}
     order by q.created_at desc`,
    [session.tenant_id, ...access.params]
  );
  send(res, 200, { data: result.rows.map(quotePayload) });
}

async function createQuote(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const body = await readJson(req);
  if (!body.title) return send(res, 400, { error: "missing_fields" });
  const subtotal = Number(body.subtotal || body.amount || 0);
  const discount = Number(body.discount || 0);
  const tax = Number(body.tax || 0);
  const total = Math.max(subtotal - discount + tax, 0);
  const quoteNo = body.quoteNo || `ARG-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const result = await pool.query(
    `insert into quotes
       (tenant_id, account_id, contact_id, opportunity_id, owner_id, quote_no, title, status, subtotal, discount, tax, total, valid_until, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     returning id, account_id, contact_id, opportunity_id, owner_id, quote_no, title, status, subtotal, discount, tax, total, valid_until, notes, created_at`,
    [
      session.tenant_id,
      body.accountId || null,
      body.contactId || null,
      body.opportunityId || null,
      session.user_id,
      quoteNo,
      body.title,
      body.status || "draft",
      subtotal,
      discount,
      tax,
      total,
      body.validUntil || null,
      body.notes || null
    ]
  );
  await auditLog(session, "quote.created", "quote", result.rows[0].id, {
    quoteNo,
    total
  });
  send(res, 201, { data: quotePayload({ ...result.rows[0], owner_name: session.full_name }) });
}

async function listActions(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "meetings") && !hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const access = opportunityAccess(session, "a", 2);
  const result = await pool.query(
    `select a.id, a.meeting_id, a.opportunity_id, a.owner_id, u.full_name as owner_name,
            a.title, a.priority, a.due_date, a.done, a.created_at
     from action_items a
     left join users u on u.id = a.owner_id
     where a.tenant_id = $1 ${access.clause}
     order by coalesce(a.due_date, current_date + 365) asc, a.created_at desc`,
    [session.tenant_id, ...access.params]
  );
  send(res, 200, { data: result.rows.map(actionPayload) });
}

async function createAction(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "meetings") && !hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const body = await readJson(req);
  if (!body.title) return send(res, 400, { error: "missing_fields" });
  const result = await pool.query(
    `insert into action_items (tenant_id, meeting_id, opportunity_id, owner_id, title, priority, due_date, done)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     returning id, meeting_id, opportunity_id, owner_id, title, priority, due_date, done, created_at`,
    [
      session.tenant_id,
      body.meetingId || null,
      body.opportunityId || null,
      session.user_id,
      body.title,
      body.priority || "Normal",
      body.due || body.dueDate || null,
      Boolean(body.done)
    ]
  );
  await auditLog(session, "action.created", "action", result.rows[0].id, { title: result.rows[0].title });
  send(res, 201, { data: actionPayload({ ...result.rows[0], owner_name: session.full_name }) });
}

async function updateAction(req, res, id) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "meetings") && !hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const body = await readJson(req);
  const access = opportunityAccess(session, "action_items", 3);
  const current = await pool.query(
    `select id from action_items where id = $1 and tenant_id = $2 ${access.clause}`,
    [id, session.tenant_id, ...access.params]
  );
  if (!current.rows[0]) return send(res, 404, { error: "not_found" });
  const result = await pool.query(
    `update action_items
     set done = coalesce($3, done),
         title = coalesce($4, title),
         priority = coalesce($5, priority),
         due_date = coalesce($6, due_date)
     where id = $1 and tenant_id = $2
     returning id, meeting_id, opportunity_id, owner_id, title, priority, due_date, done, created_at`,
    [
      id,
      session.tenant_id,
      body.done === undefined ? null : Boolean(body.done),
      body.title || null,
      body.priority || null,
      body.due || body.dueDate || null
    ]
  );
  await auditLog(session, "action.updated", "action", id, { done: result.rows[0].done });
  send(res, 200, { data: actionPayload(result.rows[0]) });
}

async function listIntegrationSettings(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const result = await pool.query(
    `select id, provider, client_id, tenant_or_project, scopes, redirect_uri, status, updated_at
     from oauth_app_settings
     where tenant_id = $1
     order by provider asc`,
    [session.tenant_id]
  );
  send(res, 200, { data: result.rows.map(integrationSettingPayload) });
}

async function saveIntegrationSetting(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const body = await readJson(req);
  const provider = String(body.provider || "").toLowerCase();
  if (!["gmail", "outlook"].includes(provider)) return send(res, 400, { error: "invalid_provider" });
  const scopes = Array.isArray(body.scopes)
    ? body.scopes
    : String(body.scopes || "").split(/[,\s]+/).map((scope) => scope.trim()).filter(Boolean);
  const redirectUri = body.redirectUri || `https://example.com/oauth/${provider}/callback`;
  const result = await pool.query(
    `insert into oauth_app_settings (tenant_id, provider, client_id, tenant_or_project, scopes, redirect_uri, status, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,now())
     on conflict (tenant_id, provider) do update
     set client_id = excluded.client_id,
         tenant_or_project = excluded.tenant_or_project,
         scopes = excluded.scopes,
         redirect_uri = excluded.redirect_uri,
         status = excluded.status,
         updated_at = now()
     returning id, provider, client_id, tenant_or_project, scopes, redirect_uri, status, updated_at`,
    [
      session.tenant_id,
      provider,
      body.clientId || null,
      body.tenantOrProject || null,
      scopes,
      redirectUri,
      body.status || "draft"
    ]
  );
  await auditLog(session, "integration.oauth_configured", "oauth_app_setting", provider, {
    provider,
    scopes: scopes.length
  });
  send(res, 200, { data: integrationSettingPayload(result.rows[0]) });
}

function oauthProviderDefaults(provider, setting = {}) {
  if (provider === "gmail") {
    return {
      authorizeEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      scopes: setting.scopes?.length ? setting.scopes : [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/contacts.readonly"
      ],
      extra: {
        access_type: "offline",
        prompt: "consent"
      }
    };
  }
  const tenant = setting.tenant_or_project || "common";
  return {
    authorizeEndpoint: `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize`,
    scopes: setting.scopes?.length ? setting.scopes : [
      "offline_access",
      "User.Read",
      "Mail.Read",
      "Calendars.ReadWrite",
      "Contacts.Read"
    ],
    extra: {}
  };
}

async function createOAuthAuthorize(req, res, provider) {
  const session = await requireSession(req, res);
  if (!session) return;
  provider = String(provider || "").toLowerCase();
  if (!["gmail", "outlook"].includes(provider)) return send(res, 400, { error: "invalid_provider" });

  const settingResult = await pool.query(
    `select id, provider, client_id, tenant_or_project, scopes, redirect_uri, status, updated_at
     from oauth_app_settings
     where tenant_id = $1 and provider = $2
     limit 1`,
    [session.tenant_id, provider]
  );
  const setting = settingResult.rows[0];
  if (!setting?.client_id || !setting?.redirect_uri) {
    return send(res, 400, {
      error: "oauth_not_configured",
      message: "Client ID ve Redirect URI kaydedilmeden OAuth linki üretilemez."
    });
  }

  const defaults = oauthProviderDefaults(provider, setting);
  const state = randomBytes(18).toString("hex");
  const params = new URLSearchParams({
    client_id: setting.client_id,
    redirect_uri: setting.redirect_uri,
    response_type: "code",
    scope: defaults.scopes.join(" "),
    state,
    ...defaults.extra
  });
  const authorizeUrl = `${defaults.authorizeEndpoint}?${params.toString()}`;
  const result = await pool.query(
    `insert into oauth_authorization_attempts
       (tenant_id, user_id, provider, state, status, authorize_url, redirect_uri, scopes)
     values ($1,$2,$3,$4,'created',$5,$6,$7)
     returning id, provider, state, status, authorize_url, redirect_uri, scopes, code_preview, error, created_at, updated_at`,
    [session.tenant_id, session.user_id, provider, state, authorizeUrl, setting.redirect_uri, defaults.scopes]
  );
  await auditLog(session, "integration.oauth_authorize_created", "oauth_authorization_attempt", result.rows[0].id, { provider });
  send(res, 201, { data: oauthAttemptPayload(result.rows[0]) });
}

async function oauthCallback(req, res, provider, url) {
  provider = String(provider || "").toLowerCase();
  if (!["gmail", "outlook"].includes(provider)) return send(res, 400, { error: "invalid_provider" });
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  const error = url.searchParams.get("error") || "";
  const status = error ? "error" : code ? "code_received" : "missing_code";
  const codePreview = code ? `${code.slice(0, 8)}...${code.slice(-4)}` : null;
  const result = await pool.query(
    `update oauth_authorization_attempts
     set status = $3,
         code_preview = $4,
         error = $5,
         updated_at = now()
     where state = $1 and provider = $2
     returning id, tenant_id, user_id, provider, state, status, authorize_url, redirect_uri, scopes, code_preview, error, created_at, updated_at`,
    [state, provider, status, codePreview, error || null]
  );
  const attempt = result.rows[0];
  if (attempt?.tenant_id) {
    await pool.query(
      `update oauth_app_settings
       set status = $3, updated_at = now()
       where tenant_id = $1 and provider = $2`,
      [attempt.tenant_id, provider, status === "code_received" ? "code_received" : "error"]
    );
  }
  return sendRaw(
    res,
    200,
    "text/html; charset=utf-8",
    `<!doctype html><meta charset="utf-8"><title>ARGEKA CRM OAuth</title><body style="font-family:system-ui;padding:32px"><h1>OAuth sonucu</h1><p>Sağlayıcı: ${provider}</p><p>Durum: ${status}</p><p>Bu aşamada kod alındı; gerçek token exchange domain/SSL ve client secret hazır olunca açılacak.</p></body>`
  );
}

async function sandboxConnectOAuth(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const body = await readJson(req);
  const provider = String(body.provider || "").toLowerCase();
  if (!["gmail", "outlook"].includes(provider)) return send(res, 400, { error: "invalid_provider" });
  const setting = await pool.query(
    "select id from oauth_app_settings where tenant_id = $1 and provider = $2 limit 1",
    [session.tenant_id, provider]
  );
  if (!setting.rows[0]) return send(res, 400, { error: "oauth_not_configured" });
  const scopes = provider === "gmail"
    ? ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/calendar.events"]
    : ["offline_access", "User.Read", "Mail.Read", "Calendars.ReadWrite"];
  await pool.query(
    `insert into oauth_connections
       (tenant_id, user_id, provider, scopes, access_token_ciphertext, refresh_token_ciphertext, expires_at)
     values ($1,$2,$3,$4,$5,$6,now() + interval '1 hour')
     on conflict (tenant_id, user_id, provider) do update
     set scopes = excluded.scopes,
         access_token_ciphertext = excluded.access_token_ciphertext,
         refresh_token_ciphertext = excluded.refresh_token_ciphertext,
         expires_at = excluded.expires_at`,
    [
      session.tenant_id,
      session.user_id,
      provider,
      scopes,
      `sandbox-access-${randomBytes(12).toString("hex")}`,
      `sandbox-refresh-${randomBytes(12).toString("hex")}`
    ]
  );
  const updated = await pool.query(
    `update oauth_app_settings
     set status = 'connected', updated_at = now()
     where tenant_id = $1 and provider = $2
     returning id, provider, client_id, tenant_or_project, scopes, redirect_uri, status, updated_at`,
    [session.tenant_id, provider]
  );
  await auditLog(session, "integration.oauth_sandbox_connected", "oauth_connection", provider, { provider });
  send(res, 200, { data: integrationSettingPayload(updated.rows[0]) });
}

async function listSyncConnections(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const result = await pool.query(
    `select id, name, db_type, role, connection_url, host, port, database_name, username, ssl_mode, status, notes, created_at, updated_at
     from sync_connections
     where tenant_id = $1
     order by created_at desc`,
    [session.tenant_id]
  );
  send(res, 200, { data: result.rows.map(syncConnectionPayload) });
}

async function createSyncConnection(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const body = await readJson(req);
  if (!body.name || !body.dbType) return send(res, 400, { error: "missing_fields" });
  const result = await pool.query(
    `insert into sync_connections
       (tenant_id, name, db_type, role, connection_url, host, port, database_name, username, ssl_mode, status, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     returning id, name, db_type, role, connection_url, host, port, database_name, username, ssl_mode, status, notes, created_at, updated_at`,
    [
      session.tenant_id,
      body.name,
      body.dbType,
      body.role || "both",
      body.connectionUrl || null,
      body.host || null,
      body.port ? Number(body.port) : null,
      body.databaseName || null,
      body.username || null,
      body.sslMode || "prefer",
      body.status || "draft",
      body.notes || null
    ]
  );
  await auditLog(session, "sync.connection_created", "sync_connection", result.rows[0].id, { dbType: body.dbType });
  send(res, 201, { data: syncConnectionPayload(result.rows[0]) });
}

async function testSyncConnection(req, res, id) {
  const session = await requireSession(req, res);
  if (!session) return;
  const connection = await pool.query(
    "select * from sync_connections where id = $1 and tenant_id = $2 limit 1",
    [id, session.tenant_id]
  );
  const row = connection.rows[0];
  if (!row) return send(res, 404, { error: "not_found" });
  if (row.connection_url === "internal://app" || row.db_type === "postgresql") {
    if (row.connection_url && row.connection_url !== "internal://app") {
      const testPool = new Pool({ connectionString: row.connection_url });
      try {
        await testPool.query("select 1");
      } finally {
        await testPool.end();
      }
    } else {
      await pool.query("select 1");
    }
    await pool.query("update sync_connections set status = 'active', updated_at = now() where id = $1", [id]);
    return send(res, 200, { ok: true, status: "active", message: "PostgreSQL baglantisi calisiyor." });
  }
  await pool.query("update sync_connections set status = 'driver_needed', updated_at = now() where id = $1", [id]);
  return send(res, 200, {
    ok: false,
    status: "driver_needed",
    message: `${row.db_type} connector hazir listede, calisma motoru icin driver/ODBC kurulumu gerekir.`
  });
}

async function listSyncQueries(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const result = await pool.query(
    `select q.id, q.name, q.source_connection_id, c.name as source_connection_name,
            q.sql_text, q.parameters, q.status, q.created_at, q.updated_at
     from sync_queries q
     left join sync_connections c on c.id = q.source_connection_id
     where q.tenant_id = $1
     order by q.created_at desc`,
    [session.tenant_id]
  );
  send(res, 200, { data: result.rows.map(syncQueryPayload) });
}

async function createSyncQuery(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const body = await readJson(req);
  if (!body.name || !body.sourceConnectionId || !body.sqlText) return send(res, 400, { error: "missing_fields" });
  const parameters = typeof body.parameters === "string"
    ? JSON.parse(body.parameters || "{}")
    : body.parameters || {};
  const result = await pool.query(
    `insert into sync_queries (tenant_id, name, source_connection_id, sql_text, parameters, status)
     values ($1,$2,$3,$4,$5::jsonb,$6)
     returning id, name, source_connection_id, sql_text, parameters, status, created_at, updated_at`,
    [session.tenant_id, body.name, body.sourceConnectionId, body.sqlText, JSON.stringify(parameters), body.status || "ready"]
  );
  await auditLog(session, "sync.query_created", "sync_query", result.rows[0].id, { name: body.name });
  send(res, 201, { data: syncQueryPayload(result.rows[0]) });
}

async function previewSyncQuery(req, res, id) {
  const session = await requireSession(req, res);
  if (!session) return;
  const query = await pool.query(
    `select q.*, c.connection_url, c.db_type
     from sync_queries q
     join sync_connections c on c.id = q.source_connection_id
     where q.id = $1 and q.tenant_id = $2`,
    [id, session.tenant_id]
  );
  const row = query.rows[0];
  if (!row) return send(res, 404, { error: "not_found" });
  const { sql, values } = parameterizeSql(row.sql_text, row.parameters || {});
  const sourcePool = connectionPool(row);
  try {
    const result = await sourcePool.query(`${sql} limit 20`, values);
    send(res, 200, { columns: result.fields.map((field) => field.name), data: result.rows });
  } finally {
    if (sourcePool !== pool) await sourcePool.end();
  }
}

async function listSyncJobs(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const result = await pool.query(
    `select j.id, j.name, j.query_id, q.name as query_name, sc.name as source_connection_name,
            j.target_connection_id, tc.name as target_connection_name, j.target_table,
            j.write_mode, j.conflict_policy, j.schedule_type, j.schedule_value, j.enabled,
            j.last_run_at, j.next_run_at, j.created_at, j.updated_at,
            count(m.id)::int as mapping_count
     from sync_jobs j
     left join sync_queries q on q.id = j.query_id
     left join sync_connections sc on sc.id = q.source_connection_id
     left join sync_connections tc on tc.id = j.target_connection_id
     left join sync_column_mappings m on m.job_id = j.id
     where j.tenant_id = $1
     group by j.id, q.name, sc.name, tc.name
     order by j.created_at desc`,
    [session.tenant_id]
  );
  send(res, 200, { data: result.rows.map(syncJobPayload) });
}

async function createSyncJob(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const body = await readJson(req);
  if (!body.name || !body.queryId || !body.targetConnectionId || !body.targetTable) {
    return send(res, 400, { error: "missing_fields" });
  }
  const result = await pool.query(
    `insert into sync_jobs
       (tenant_id, name, query_id, target_connection_id, target_table, write_mode, conflict_policy, schedule_type, schedule_value, enabled)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning id, name, query_id, target_connection_id, target_table, write_mode, conflict_policy, schedule_type, schedule_value, enabled, last_run_at, next_run_at, created_at, updated_at`,
    [
      session.tenant_id,
      body.name,
      body.queryId,
      body.targetConnectionId,
      body.targetTable,
      body.writeMode || "insert_only",
      body.conflictPolicy || "strict",
      body.scheduleType || "manual",
      body.scheduleValue || null,
      body.enabled !== false
    ]
  );
  if (Array.isArray(body.mappings)) {
    await replaceSyncMappings(session.tenant_id, result.rows[0].id, body.mappings);
  }
  await auditLog(session, "sync.job_created", "sync_job", result.rows[0].id, { name: body.name });
  send(res, 201, { data: syncJobPayload(result.rows[0]) });
}

async function listSyncMappings(req, res, jobId) {
  const session = await requireSession(req, res);
  if (!session) return;
  const result = await pool.query(
    `select id, job_id, source_column, target_column, default_value, transform, required, ordinal
     from sync_column_mappings
     where tenant_id = $1 and job_id = $2
     order by ordinal asc, created_at asc`,
    [session.tenant_id, jobId]
  );
  send(res, 200, { data: result.rows.map(syncMappingPayload) });
}

async function saveSyncMappings(req, res, jobId) {
  const session = await requireSession(req, res);
  if (!session) return;
  const body = await readJson(req);
  await replaceSyncMappings(session.tenant_id, jobId, body.mappings || []);
  await auditLog(session, "sync.mappings_saved", "sync_job", jobId, { count: body.mappings?.length || 0 });
  return listSyncMappings(req, res, jobId);
}

async function replaceSyncMappings(tenant, jobId, mappings) {
  await pool.query("delete from sync_column_mappings where tenant_id = $1 and job_id = $2", [tenant, jobId]);
  for (const [index, mapping] of mappings.entries()) {
    if (!mapping.sourceColumn || !mapping.targetColumn) continue;
    await pool.query(
      `insert into sync_column_mappings
         (tenant_id, job_id, source_column, target_column, default_value, transform, required, ordinal)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        tenant,
        jobId,
        mapping.sourceColumn,
        mapping.targetColumn,
        mapping.defaultValue || null,
        mapping.transform || "none",
        Boolean(mapping.required),
        Number(mapping.ordinal || index + 1)
      ]
    );
  }
}

async function listSyncRuns(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  const result = await pool.query(
    `select r.id, r.job_id, j.name as job_name, r.status, r.rows_read, r.rows_written,
            r.rows_skipped, r.error_message, r.started_at, r.finished_at
     from sync_job_runs r
     left join sync_jobs j on j.id = r.job_id
     where r.tenant_id = $1
     order by r.started_at desc
     limit 30`,
    [session.tenant_id]
  );
  send(res, 200, { data: result.rows.map(syncRunPayload) });
}

async function runSyncJob(req, res, jobId) {
  const session = await requireSession(req, res);
  if (!session) return;
  const run = await pool.query(
    "insert into sync_job_runs (tenant_id, job_id, status) values ($1,$2,'running') returning id, started_at",
    [session.tenant_id, jobId]
  );
  const runId = run.rows[0].id;
  try {
    const summary = await executeSyncJob(session.tenant_id, jobId, runId);
    await auditLog(session, "sync.job_run", "sync_job", jobId, summary);
    send(res, 200, { data: summary });
  } catch (error) {
    await pool.query(
      "update sync_job_runs set status = 'failed', error_message = $2, finished_at = now() where id = $1",
      [runId, error.message]
    );
    await syncRunLog(session.tenant_id, runId, "error", error.message);
    send(res, 500, { error: "sync_failed", message: error.message, runId });
  }
}

async function executeSyncJob(tenant, jobId, runId) {
  const jobResult = await pool.query(
    `select j.*, q.sql_text, q.parameters, sc.connection_url as source_url, sc.db_type as source_type,
            tc.connection_url as target_url, tc.db_type as target_type
     from sync_jobs j
     join sync_queries q on q.id = j.query_id
     join sync_connections sc on sc.id = q.source_connection_id
     join sync_connections tc on tc.id = j.target_connection_id
     where j.id = $1 and j.tenant_id = $2`,
    [jobId, tenant]
  );
  const job = jobResult.rows[0];
  if (!job) throw new Error("Aktarim isi bulunamadi.");
  if (!["postgresql"].includes(job.source_type) || !["postgresql"].includes(job.target_type)) {
    throw new Error("Bu connector henuz calisma motoruna baglanmadi. PostgreSQL/Internal demo aktif.");
  }
  const mappings = await pool.query(
    `select source_column, target_column, default_value, transform, required
     from sync_column_mappings
     where tenant_id = $1 and job_id = $2
     order by ordinal asc, created_at asc`,
    [tenant, jobId]
  );
  if (!mappings.rows.length) throw new Error("Kolon eslemesi yok.");

  const sourcePool = connectionPool({ connection_url: job.source_url });
  const targetPool = connectionPool({ connection_url: job.target_url });
  try {
    const parameters = { ...(job.parameters || {}), last_run_at: job.last_run_at || job.parameters?.last_run_at || "2000-01-01T00:00:00Z" };
    const { sql, values } = parameterizeSql(job.sql_text, parameters);
    const source = await sourcePool.query(sql, values);
    let written = 0;
    let skipped = 0;
    if (job.write_mode === "truncate_reload") {
      await targetPool.query(`truncate table ${safeIdentifier(job.target_table)} restart identity`);
    }
    for (const row of source.rows) {
      const built = buildTargetRow(row, mappings.rows, job.conflict_policy);
      if (built.skip) {
        skipped += 1;
        await syncRunLog(tenant, runId, "warn", built.message, { row });
        continue;
      }
      await insertTargetRow(targetPool, job.target_table, built.values, job.write_mode);
      written += 1;
    }
    await pool.query(
      `update sync_job_runs
       set status = 'completed', rows_read = $2, rows_written = $3, rows_skipped = $4, finished_at = now()
       where id = $1`,
      [runId, source.rows.length, written, skipped]
    );
    await pool.query("update sync_jobs set last_run_at = now(), updated_at = now() where id = $1", [jobId]);
    await syncRunLog(tenant, runId, "info", "Aktarim tamamlandi.", { read: source.rows.length, written, skipped });
    return { runId, status: "completed", rowsRead: source.rows.length, rowsWritten: written, rowsSkipped: skipped };
  } finally {
    if (sourcePool !== pool) await sourcePool.end();
    if (targetPool !== pool && targetPool !== sourcePool) await targetPool.end();
  }
}

function connectionPool(connection) {
  if (!connection.connection_url || connection.connection_url === "internal://app") return pool;
  return new Pool({ connectionString: connection.connection_url });
}

function parameterizeSql(sqlText, params) {
  const values = [];
  const sql = String(sqlText).replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, key) => {
    values.push(params[key] ?? null);
    return `$${values.length}`;
  });
  return { sql, values };
}

function buildTargetRow(row, mappings, policy) {
  const values = {};
  for (const mapping of mappings) {
    let value = row[mapping.source_column];
    if (value === undefined || value === null) value = mapping.default_value;
    if ((value === undefined || value === null) && mapping.required) {
      if (policy === "skip_row" || policy === "quarantine") return { skip: true, message: `${mapping.source_column} zorunlu ama bos.` };
      throw new Error(`${mapping.source_column} zorunlu ama kaynakta yok.`);
    }
    if (value === undefined && policy === "strict") throw new Error(`${mapping.source_column} kaynak sonucunda yok.`);
    if (value === undefined) continue;
    values[mapping.target_column] = applyTransform(value, mapping.transform);
  }
  return { values };
}

function applyTransform(value, transform) {
  if (value === null || value === undefined) return value;
  if (transform === "trim") return String(value).trim();
  if (transform === "upper") return String(value).toLocaleUpperCase("tr-TR");
  if (transform === "lower") return String(value).toLocaleLowerCase("tr-TR");
  if (transform === "number") return Number(value || 0);
  return value;
}

async function insertTargetRow(targetPool, table, values, writeMode) {
  const columns = Object.keys(values);
  if (!columns.length) return;
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const suffix = writeMode === "skip_duplicates" ? " on conflict do nothing" : "";
  await targetPool.query(
    `insert into ${safeIdentifier(table)} (${columns.map(safeIdentifier).join(",")}) values (${placeholders.join(",")})${suffix}`,
    columns.map((column) => values[column])
  );
}

function safeIdentifier(value) {
  const text = String(value || "");
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(text)) throw new Error(`Gecersiz SQL tanimlayici: ${text}`);
  return `"${text}"`;
}

async function syncRunLog(tenant, runId, level, message, metadata = {}) {
  await pool.query(
    "insert into sync_run_logs (tenant_id, run_id, level, message, metadata) values ($1,$2,$3,$4,$5::jsonb)",
    [tenant, runId, level, message, JSON.stringify(metadata)]
  );
}

async function listOpportunities(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const access = opportunityAccess(session, "o", 2);
  const params = [session.tenant_id, ...access.params];
  const result = await pool.query(
    `select o.id, o.title, o.stage, o.value, o.probability, o.forecast, o.source, o.close_date,
            o.next_action, o.note, o.owner_id, o.created_at, u.full_name as owner_name
     from opportunities o
     left join users u on u.id = o.owner_id
     where o.tenant_id = $1 ${access.clause}
     order by o.created_at desc`,
    params
  );
  send(res, 200, { data: result.rows.map(opportunityPayload) });
}

async function createOpportunity(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const body = await readJson(req);
  const result = await pool.query(
    `insert into opportunities
      (tenant_id, owner_id, title, stage, value, probability, forecast, source, close_date, next_action, note)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning id, title, stage, value, probability, forecast, source, close_date, next_action, note, owner_id, created_at`,
    [
      session.tenant_id,
      session.user_id,
      body.title || body.company || "Yeni fırsat",
      body.stage || "new",
      Number(body.value || 0),
      Number(body.probability || 20),
      body.forecast || "Pipeline",
      body.source || "API",
      body.closeDate || null,
      body.nextAction || null,
      body.note || null
    ]
  );
  await auditLog(session, "opportunity.created", "opportunity", result.rows[0].id, {
    title: result.rows[0].title,
    value: Number(result.rows[0].value || 0)
  });
  send(res, 201, { data: opportunityPayload({ ...result.rows[0], owner_name: session.full_name }) });
}

async function updateOpportunity(req, res, id) {
  const session = await requireSession(req, res);
  if (!session) return;
  if (!hasPermission(session, "opportunities")) return send(res, 403, { error: "forbidden" });
  const body = await readJson(req);
  const access = opportunityAccess(session, "opportunities", 3);
  const accessParams = [id, session.tenant_id, ...access.params];
  const current = await pool.query(
    `select title, stage, value, probability, forecast, source, close_date, next_action, note, owner_id
     from opportunities
     where id = $1 and tenant_id = $2 ${access.clause}`,
    accessParams
  );
  if (!current.rows[0]) return send(res, 404, { error: "not_found" });
  const existing = current.rows[0];
  const result = await pool.query(
    `update opportunities
     set title = $3, stage = $4, value = $5, probability = $6, forecast = $7,
         source = $8, close_date = $9, next_action = $10, note = $11, updated_at = now()
     where id = $1 and tenant_id = $2
     returning id, title, stage, value, probability, forecast, source, close_date, next_action, note, owner_id, created_at`,
    [
      id,
      session.tenant_id,
      body.title || body.company || existing.title,
      body.stage || existing.stage,
      body.value === undefined ? existing.value : Number(body.value || 0),
      body.probability === undefined ? existing.probability : Number(body.probability || 0),
      body.forecast || existing.forecast,
      body.source || existing.source,
      body.closeDate === undefined ? existing.close_date : body.closeDate,
      body.nextAction === undefined ? existing.next_action : body.nextAction,
      body.note === undefined ? existing.note : body.note
    ]
  );
  await auditLog(session, "opportunity.updated", "opportunity", id, {
    stage: result.rows[0].stage,
    value: Number(result.rows[0].value || 0)
  });
  send(res, 200, { data: opportunityPayload(result.rows[0]) });
}

async function listMeetings(req, res) {
  const session = await currentSession(req);
  const tid = session?.tenant_id || await tenantId();
  const result = await pool.query(
    `select id, title, starts_at, provider, attendees, agenda, created_at
     from meetings
     where tenant_id = $1
     order by starts_at asc`,
    [tid]
  );
  send(res, 200, { data: result.rows });
}

async function createMeeting(req, res) {
  const session = await currentSession(req);
  const tid = session?.tenant_id || await tenantId();
  const body = await readJson(req);
  const result = await pool.query(
    `insert into meetings (id, tenant_id, title, starts_at, provider, attendees, agenda)
     values ($1,$2,$3,$4,$5,$6,$7)
     returning id, title, starts_at, provider, attendees, agenda, created_at`,
    [
      randomUUID(),
      tid,
      body.title || "CRM toplantısı",
      body.startsAt || new Date().toISOString(),
      body.provider || "Google Calendar",
      JSON.stringify(body.attendees || []),
      JSON.stringify(body.agenda || [])
    ]
  );
  send(res, 201, { data: result.rows[0] });
}

async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 204, {});

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/health") {
      await pool.query("select 1");
      return send(res, 200, { ok: true, service: "akis-crm-api" });
    }
    if (req.method === "GET" && url.pathname === "/api/meta") {
      return send(res, 200, { name: "ARGEKA Sync", edition: "self-hosted", api: "0.2.0" });
    }
    if (req.method === "POST" && url.pathname === "/api/auth/login") return login(req, res);
    if (req.method === "GET" && url.pathname === "/api/auth/me") return me(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/overview") return adminOverview(req, res);
    if (req.method === "POST" && url.pathname === "/api/admin/users") return createAdminUser(req, res);
    if (req.method === "POST" && url.pathname === "/api/admin/license") return activateLicense(req, res);
    if (req.method === "GET" && url.pathname === "/api/license/status") return licenseStatus(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/export") return exportData(req, res, url.searchParams.get("format") || "json");
    if (req.method === "GET" && url.pathname === "/api/accounts") return listAccounts(req, res);
    if (req.method === "POST" && url.pathname === "/api/accounts") return createAccount(req, res);
    if (req.method === "GET" && url.pathname === "/api/contacts") return listContacts(req, res);
    if (req.method === "POST" && url.pathname === "/api/contacts") return createContact(req, res);
    if (req.method === "GET" && url.pathname === "/api/quotes") return listQuotes(req, res);
    if (req.method === "POST" && url.pathname === "/api/quotes") return createQuote(req, res);
    if (req.method === "GET" && url.pathname === "/api/actions") return listActions(req, res);
    if (req.method === "POST" && url.pathname === "/api/actions") return createAction(req, res);
    const actionMatch = url.pathname.match(/^\/api\/actions\/([^/]+)$/);
    if (req.method === "PATCH" && actionMatch) return updateAction(req, res, actionMatch[1]);
    if (req.method === "GET" && url.pathname === "/api/integration-settings") return listIntegrationSettings(req, res);
    if (req.method === "POST" && url.pathname === "/api/integration-settings") return saveIntegrationSetting(req, res);
    const oauthAuthorizeMatch = url.pathname.match(/^\/api\/oauth\/authorize\/([^/]+)$/);
    if (req.method === "POST" && oauthAuthorizeMatch) return createOAuthAuthorize(req, res, oauthAuthorizeMatch[1]);
    if (req.method === "POST" && url.pathname === "/api/oauth/sandbox-connect") return sandboxConnectOAuth(req, res);
    const oauthCallbackMatch = url.pathname.match(/^\/oauth\/([^/]+)\/callback$/);
    if (req.method === "GET" && oauthCallbackMatch) return oauthCallback(req, res, oauthCallbackMatch[1], url);
    if (req.method === "GET" && url.pathname === "/api/sync/connections") return listSyncConnections(req, res);
    if (req.method === "POST" && url.pathname === "/api/sync/connections") return createSyncConnection(req, res);
    const syncConnectionTestMatch = url.pathname.match(/^\/api\/sync\/connections\/([^/]+)\/test$/);
    if (req.method === "POST" && syncConnectionTestMatch) return testSyncConnection(req, res, syncConnectionTestMatch[1]);
    if (req.method === "GET" && url.pathname === "/api/sync/queries") return listSyncQueries(req, res);
    if (req.method === "POST" && url.pathname === "/api/sync/queries") return createSyncQuery(req, res);
    const syncQueryPreviewMatch = url.pathname.match(/^\/api\/sync\/queries\/([^/]+)\/preview$/);
    if (req.method === "POST" && syncQueryPreviewMatch) return previewSyncQuery(req, res, syncQueryPreviewMatch[1]);
    if (req.method === "GET" && url.pathname === "/api/sync/jobs") return listSyncJobs(req, res);
    if (req.method === "POST" && url.pathname === "/api/sync/jobs") return createSyncJob(req, res);
    const syncMappingMatch = url.pathname.match(/^\/api\/sync\/jobs\/([^/]+)\/mappings$/);
    if (req.method === "GET" && syncMappingMatch) return listSyncMappings(req, res, syncMappingMatch[1]);
    if (req.method === "POST" && syncMappingMatch) return saveSyncMappings(req, res, syncMappingMatch[1]);
    const syncRunMatch = url.pathname.match(/^\/api\/sync\/jobs\/([^/]+)\/run$/);
    if (req.method === "POST" && syncRunMatch) return runSyncJob(req, res, syncRunMatch[1]);
    if (req.method === "GET" && url.pathname === "/api/sync/runs") return listSyncRuns(req, res);
    if (req.method === "GET" && url.pathname === "/api/opportunities") return listOpportunities(req, res);
    if (req.method === "POST" && url.pathname === "/api/opportunities") return createOpportunity(req, res);
    const opportunityMatch = url.pathname.match(/^\/api\/opportunities\/([^/]+)$/);
    if (req.method === "PATCH" && opportunityMatch) return updateOpportunity(req, res, opportunityMatch[1]);
    if (req.method === "GET" && url.pathname === "/api/meetings") return listMeetings(req, res);
    if (req.method === "POST" && url.pathname === "/api/meetings") return createMeeting(req, res);
    return send(res, 404, { error: "not_found" });
  } catch (error) {
    return send(res, 500, { error: "server_error", message: error.message });
  }
}

ensureSchema()
  .then(() => {
    http.createServer(handler).listen(port, () => {
      console.log(`ARGEKA Sync API listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error("ARGEKA Sync API startup failed", error);
    process.exit(1);
  });


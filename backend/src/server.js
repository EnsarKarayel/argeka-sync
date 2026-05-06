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

    create index if not exists app_roles_tenant_idx on app_roles (tenant_id);
    create index if not exists teams_tenant_idx on teams (tenant_id);
    create index if not exists users_tenant_team_idx on users (tenant_id, team_id);
    create index if not exists backup_runs_tenant_created_idx on backup_runs (tenant_id, created_at desc);
    create index if not exists audit_logs_tenant_created_idx on audit_logs (tenant_id, created_at desc);
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

  const [tenantResult, usersResult, rolesResult, teamsResult, licenseResult, backupResult, auditResult, opportunitiesResult, meetingsResult, actionsResult, oauthResult, webhookResult] =
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
      pool.query("select count(*)::int as count from webhook_endpoints where tenant_id = $1", [session.tenant_id])
    ]);

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
    license: licenseResult.rows[0] || null,
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
      webhooks: webhookResult.rows[0].count
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
      return send(res, 200, { name: "ARGEKA CRM", edition: "hybrid", api: "0.1.0" });
    }
    if (req.method === "POST" && url.pathname === "/api/auth/login") return login(req, res);
    if (req.method === "GET" && url.pathname === "/api/auth/me") return me(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/overview") return adminOverview(req, res);
    if (req.method === "POST" && url.pathname === "/api/admin/users") return createAdminUser(req, res);
    if (req.method === "POST" && url.pathname === "/api/admin/license") return activateLicense(req, res);
    if (req.method === "GET" && url.pathname === "/api/admin/export") return exportData(req, res, url.searchParams.get("format") || "json");
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
      console.log(`ARGEKA CRM API listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error("ARGEKA CRM API startup failed", error);
    process.exit(1);
  });


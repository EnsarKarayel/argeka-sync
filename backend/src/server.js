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
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  });
  res.end(JSON.stringify(body));
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
    closeDate: row.close_date,
    nextAction: row.next_action,
    note: row.note,
    createdAt: row.created_at
  };
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
    `select s.tenant_id, s.user_id, u.email, u.full_name, u.role, t.name as tenant_name, t.plan
     from sessions s
     join users u on u.id = s.user_id
     join tenants t on t.id = s.tenant_id
     where s.token_hash = $1 and s.expires_at > now()
     limit 1`,
    [tokenHash(token)]
  );
  return result.rows[0] || null;
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
    `select u.id, u.tenant_id, u.email, u.full_name, u.password_hash, u.role, t.name as tenant_name, t.plan
     from users u
     join tenants t on t.id = u.tenant_id
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
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    tenant: { id: user.tenant_id, name: user.tenant_name, plan: user.plan }
  });
}

async function me(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;
  send(res, 200, {
    user: { id: session.user_id, email: session.email, fullName: session.full_name, role: session.role },
    tenant: { id: session.tenant_id, name: session.tenant_name, plan: session.plan }
  });
}

async function listOpportunities(req, res) {
  const session = await currentSession(req);
  const tid = session?.tenant_id || await tenantId();
  const result = await pool.query(
    `select id, title, stage, value, probability, forecast, source, close_date, next_action, note, created_at
     from opportunities
     where tenant_id = $1
     order by created_at desc`,
    [tid]
  );
  send(res, 200, { data: result.rows.map(opportunityPayload) });
}

async function createOpportunity(req, res) {
  const session = await currentSession(req);
  const tid = session?.tenant_id || await tenantId();
  const body = await readJson(req);
  const result = await pool.query(
    `insert into opportunities
      (tenant_id, title, stage, value, probability, forecast, source, close_date, next_action, note)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning id, title, stage, value, probability, forecast, source, close_date, next_action, note, created_at`,
    [
      tid,
      body.title || body.company || "Yeni fÄ±rsat",
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
  send(res, 201, { data: opportunityPayload(result.rows[0]) });
}

async function updateOpportunity(req, res, id) {
  const session = await currentSession(req);
  const tid = session?.tenant_id || await tenantId();
  const body = await readJson(req);
  const current = await pool.query(
    `select title, stage, value, probability, forecast, source, close_date, next_action, note
     from opportunities
     where id = $1 and tenant_id = $2`,
    [id, tid]
  );
  if (!current.rows[0]) return send(res, 404, { error: "not_found" });
  const existing = current.rows[0];
  const result = await pool.query(
    `update opportunities
     set title = $3, stage = $4, value = $5, probability = $6, forecast = $7,
         source = $8, close_date = $9, next_action = $10, note = $11, updated_at = now()
     where id = $1 and tenant_id = $2
     returning id, title, stage, value, probability, forecast, source, close_date, next_action, note, created_at`,
    [
      id,
      tid,
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
      body.title || "CRM toplantÄ±sÄ±",
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

http.createServer(handler).listen(port, () => {
  console.log(`ARGEKA CRM API listening on ${port}`);
});


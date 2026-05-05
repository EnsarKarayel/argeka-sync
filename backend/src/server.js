const http = require("node:http");
const { randomUUID } = require("node:crypto");
const { Pool } = require("pg");

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
  const created = await pool.query("insert into tenants (name) values ($1) returning id", ["Akis Demo"]);
  return created.rows[0].id;
}

async function listOpportunities(res) {
  const tid = await tenantId();
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
  const tid = await tenantId();
  const body = await readJson(req);
  const result = await pool.query(
    `insert into opportunities
      (tenant_id, title, stage, value, probability, forecast, source, close_date, next_action, note)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning id, title, stage, value, probability, forecast, source, close_date, next_action, note, created_at`,
    [
      tid,
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
  send(res, 201, { data: opportunityPayload(result.rows[0]) });
}

async function updateOpportunity(req, res, id) {
  const tid = await tenantId();
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

async function listMeetings(res) {
  const tid = await tenantId();
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
  const tid = await tenantId();
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
      return send(res, 200, { name: "Akis CRM", edition: "hybrid", api: "0.1.0" });
    }
    if (req.method === "GET" && url.pathname === "/api/opportunities") return listOpportunities(res);
    if (req.method === "POST" && url.pathname === "/api/opportunities") return createOpportunity(req, res);
    const opportunityMatch = url.pathname.match(/^\/api\/opportunities\/([^/]+)$/);
    if (req.method === "PATCH" && opportunityMatch) return updateOpportunity(req, res, opportunityMatch[1]);
    if (req.method === "GET" && url.pathname === "/api/meetings") return listMeetings(res);
    if (req.method === "POST" && url.pathname === "/api/meetings") return createMeeting(req, res);
    return send(res, 404, { error: "not_found" });
  } catch (error) {
    return send(res, 500, { error: "server_error", message: error.message });
  }
}

http.createServer(handler).listen(port, () => {
  console.log(`Akis CRM API listening on ${port}`);
});

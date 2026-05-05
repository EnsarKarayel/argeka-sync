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
  send(res, 200, { data: result.rows });
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
  send(res, 201, { data: result.rows[0] });
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

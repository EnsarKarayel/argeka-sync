const dbTypes = [
  { id: "postgresql", label: "PostgreSQL", status: "Aktif" },
  { id: "mssql", label: "Microsoft SQL Server", status: "Aktif" },
  { id: "mysql", label: "MySQL / MariaDB", status: "Aktif" },
  { id: "oracle", label: "Oracle", status: "ODBC/driver" },
  { id: "sqlite", label: "SQLite", status: "Planli" },
  { id: "odbc", label: "Generic ODBC", status: "Planli" },
  { id: "csv", label: "CSV / Excel", status: "Planli" },
  { id: "rest", label: "REST API", status: "Planli" },
  { id: "sap_hana", label: "SAP HANA", status: "Planli" },
  { id: "firebird", label: "Firebird", status: "Planli" }
];

const state = {
  session: null,
  apiOnline: false,
  connections: [],
  queries: [],
  jobs: [],
  runs: [],
  schedulerStatus: null,
  selectedConnectionId: null,
  selectedQueryId: null,
  selectedJobId: null,
  mappings: [],
  activity: [],
  adminOverview: null
};

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginMessage: document.querySelector("#loginMessage"),
  accountName: document.querySelector("#accountName"),
  accountMeta: document.querySelector("#accountMeta"),
  logoutButton: document.querySelector("#logoutButton"),
  viewTitle: document.querySelector("#view-title"),
  searchInput: document.querySelector("#searchInput"),
  refreshButton: document.querySelector("#refreshButton"),
  runSelectedJobButton: document.querySelector("#runSelectedJobButton"),
  connectionMetric: document.querySelector("#connectionMetric"),
  jobMetric: document.querySelector("#jobMetric"),
  lastRunMetric: document.querySelector("#lastRunMetric"),
  connectorGrid: document.querySelector("#connectorGrid"),
  activityLog: document.querySelector("#activityLog"),
  clearLocalLogButton: document.querySelector("#clearLocalLogButton"),
  connectionForm: document.querySelector("#connectionForm"),
  connectionDbType: document.querySelector("#connectionDbType"),
  connectionList: document.querySelector("#connectionList"),
  connectionCountPill: document.querySelector("#connectionCountPill"),
  queryForm: document.querySelector("#queryForm"),
  querySourceSelect: document.querySelector("#querySourceSelect"),
  queryList: document.querySelector("#queryList"),
  previewQueryButton: document.querySelector("#previewQueryButton"),
  queryPreview: document.querySelector("#queryPreview"),
  jobForm: document.querySelector("#jobForm"),
  jobQuerySelect: document.querySelector("#jobQuerySelect"),
  jobTargetSelect: document.querySelector("#jobTargetSelect"),
  jobList: document.querySelector("#jobList"),
  jobCountPill: document.querySelector("#jobCountPill"),
  mappingForm: document.querySelector("#mappingForm"),
  mappingJobSelect: document.querySelector("#mappingJobSelect"),
  mappingRows: document.querySelector("#mappingRows"),
  addMappingRowButton: document.querySelector("#addMappingRowButton"),
  scheduleList: document.querySelector("#scheduleList"),
  schedulerStatus: document.querySelector("#schedulerStatus"),
  schedulerTickButton: document.querySelector("#schedulerTickButton"),
  runList: document.querySelector("#runList"),
  refreshRunsButton: document.querySelector("#refreshRunsButton"),
  adminSummary: document.querySelector("#adminSummary"),
  adminUserForm: document.querySelector("#adminUserForm"),
  adminRoleSelect: document.querySelector("#adminRoleSelect"),
  adminTeamSelect: document.querySelector("#adminTeamSelect"),
  adminUserList: document.querySelector("#adminUserList"),
  adminHealth: document.querySelector("#adminHealth"),
  adminPlanPill: document.querySelector("#adminPlanPill"),
  refreshAdminButton: document.querySelector("#refreshAdminButton")
};

function apiUrl(path) {
  return path;
}

async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(apiUrl(path), {
      headers: {
        "content-type": "application/json",
        ...(state.session?.token ? { authorization: `Bearer ${state.session.token}` } : {}),
        ...(options.headers || {})
      },
      signal: controller.signal,
      ...options
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    state.apiOnline = true;
    return response.status === 204 ? null : response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function loadSession() {
  try {
    state.session = JSON.parse(localStorage.getItem("argeka-sync-session") || "null");
  } catch {
    state.session = null;
  }
}

function saveSession(session) {
  state.session = session;
  if (session) localStorage.setItem("argeka-sync-session", JSON.stringify(session));
  else localStorage.removeItem("argeka-sync-session");
}

async function restoreSession() {
  loadSession();
  if (!state.session?.token) return;
  try {
    const payload = await apiRequest("/api/auth/me");
    saveSession({ ...state.session, ...payload });
  } catch {
    saveSession(null);
  }
}

async function startDefaultSession() {
  els.loginMessage.textContent = "Yerel servisle baglanti kuruluyor...";
  try {
    const payload = await apiRequest("/api/auth/local-session", { method: "POST", body: "{}" });
    saveSession(payload);
    await syncAll();
    logActivity("ARGEKA Sync calisma alani hazir.");
    render();
    return true;
  } catch {
    saveSession(null);
    els.loginMessage.textContent = "Servis henuz hazir degil. Docker Desktop aciksa biraz bekleyip tekrar deneyin.";
    render();
    return false;
  }
}

async function syncAll() {
  if (!state.session?.token) return;
  const [connections, queries, jobs, runs, scheduler, overview] = await Promise.all([
    apiRequest("/api/sync/connections"),
    apiRequest("/api/sync/queries"),
    apiRequest("/api/sync/jobs"),
    apiRequest("/api/sync/runs"),
    apiRequest("/api/sync/scheduler/status"),
    apiRequest("/api/admin/overview")
  ]);
  state.connections = connections.data || [];
  state.queries = queries.data || [];
  state.jobs = jobs.data || [];
  state.runs = runs.data || [];
  state.schedulerStatus = scheduler.data || null;
  state.adminOverview = overview;
  state.selectedConnectionId ||= state.connections[0]?.id || null;
  state.selectedQueryId ||= state.queries[0]?.id || null;
  state.selectedJobId ||= state.jobs[0]?.id || null;
  if (state.selectedJobId) await loadMappings(state.selectedJobId);
}

async function loadMappings(jobId) {
  try {
    const payload = await apiRequest(`/api/sync/jobs/${jobId}/mappings`);
    state.mappings = payload.data || [];
  } catch {
    state.mappings = [];
  }
}

function render() {
  renderSession();
  renderDbTypes();
  renderDashboard();
  renderConnections();
  renderQueries();
  renderJobs();
  renderMappings();
  renderSchedule();
  renderRuns();
  renderAdmin();
  renderActivity();
}

function renderSession() {
  const authenticated = Boolean(state.session?.token);
  els.loginScreen.classList.toggle("is-hidden", authenticated);
  els.accountName.textContent = state.session?.tenant?.name || "ARGEKA Sync";
  els.accountMeta.textContent = state.session?.user
    ? `${state.session.user.fullName} · ${state.session.user.role}`
    : "Oturum bekleniyor";
}

function renderDbTypes() {
  els.connectionDbType.innerHTML = dbTypes.map((type) => `<option value="${type.id}">${type.label}</option>`).join("");
  els.connectorGrid.innerHTML = dbTypes.map((type) => `
    <article class="connector-card ${type.status === "Aktif" ? "is-active" : ""}">
      <strong>${escapeHtml(type.label)}</strong>
      <span>${escapeHtml(type.status)}</span>
    </article>
  `).join("");
}

function renderDashboard() {
  els.connectionMetric.textContent = String(state.connections.length);
  els.jobMetric.textContent = String(state.jobs.length);
  const last = state.runs[0];
  els.lastRunMetric.textContent = last ? `${last.status} · ${last.rowsWritten}` : "Yok";
}

function renderConnections() {
  const query = normalizedSearch();
  const rows = filterRows(state.connections, query, ["name", "dbType", "role", "status"]);
  els.connectionCountPill.textContent = `${state.connections.length} kayit`;
  els.connectionList.innerHTML = rows.length ? rows.map((item) => `
    <article class="record-card ${item.id === state.selectedConnectionId ? "is-selected" : ""}" data-connection-id="${item.id}">
      <header>
        <strong>${escapeHtml(item.name)}</strong>
        <span class="source-tag">${escapeHtml(dbTypeLabel(item.dbType))}</span>
      </header>
      <small>${escapeHtml(item.role)} · ${escapeHtml(item.status)} · ${escapeHtml(item.databaseName || item.host || item.connectionUrl || "baglanti detayi yok")}</small>
      <button class="secondary-button" type="button" data-test-connection="${item.id}">Test et</button>
    </article>
  `).join("") : `<div class="empty-state">Baglanti kaydi yok</div>`;
  fillSelect(els.querySourceSelect, state.connections.filter((c) => c.role !== "target"), "Kaynak sec");
  fillSelect(els.jobTargetSelect, state.connections.filter((c) => c.role !== "source"), "Hedef sec");
}

function renderQueries() {
  const query = normalizedSearch();
  const rows = filterRows(state.queries, query, ["name", "sourceConnectionName", "sqlText"]);
  els.queryList.innerHTML = rows.length ? rows.map((item) => `
    <article class="record-card ${item.id === state.selectedQueryId ? "is-selected" : ""}" data-query-id="${item.id}">
      <header>
        <strong>${escapeHtml(item.name)}</strong>
        <span class="source-tag">${escapeHtml(item.status)}</span>
      </header>
      <small>${escapeHtml(item.sourceConnectionName || "Kaynak yok")}</small>
      <code>${escapeHtml(item.sqlText)}</code>
    </article>
  `).join("") : `<div class="empty-state">Sorgu kaydi yok</div>`;
  fillSelect(els.jobQuerySelect, state.queries, "Sorgu sec");
}

function renderJobs() {
  const query = normalizedSearch();
  const rows = filterRows(state.jobs, query, ["name", "queryName", "targetTable", "targetConnectionName"]);
  els.jobCountPill.textContent = `${state.jobs.length} is`;
  els.jobList.innerHTML = rows.length ? rows.map((item) => `
    <article class="record-card ${item.id === state.selectedJobId ? "is-selected" : ""}" data-job-id="${item.id}">
      <header>
        <strong>${escapeHtml(item.name)}</strong>
        <span class="source-tag">${escapeHtml(item.writeMode)}</span>
      </header>
      <small>${escapeHtml(item.sourceConnectionName || "Kaynak")} -> ${escapeHtml(item.targetConnectionName || "Hedef")} · ${escapeHtml(item.targetTable)}</small>
      <small>${escapeHtml(item.scheduleType)} ${escapeHtml(item.scheduleValue || "")} · ${Number(item.mappingCount || 0)} esleme</small>
      <button class="primary-button" type="button" data-run-job="${item.id}">Calistir</button>
    </article>
  `).join("") : `<div class="empty-state">Aktarim isi yok</div>`;
  fillSelect(els.mappingJobSelect, state.jobs, "Aktarim isi sec");
}

function renderMappings() {
  els.mappingJobSelect.value = state.selectedJobId || "";
  const rows = state.mappings.length ? state.mappings : [
    { sourceColumn: "customer_code", targetColumn: "code", transform: "none", defaultValue: "", required: false },
    { sourceColumn: "customer_name", targetColumn: "title", transform: "trim", defaultValue: "", required: true },
    { sourceColumn: "city", targetColumn: "city", transform: "none", defaultValue: "", required: false },
    { sourceColumn: "balance", targetColumn: "balance", transform: "number", defaultValue: "0", required: false }
  ];
  els.mappingRows.innerHTML = rows.map(mappingRowTemplate).join("");
}

function renderSchedule() {
  if (els.schedulerStatus) {
    const status = state.schedulerStatus || {};
    els.schedulerStatus.innerHTML = `
      <span><strong>${status.enabled ? "Aktif" : "Pasif"}</strong> worker</span>
      <span>${Number(status.dueCount || 0)} bekleyen is</span>
      <span>${Math.round(Number(status.intervalMs || 0) / 1000)} sn kontrol</span>
    `;
  }
  els.scheduleList.innerHTML = state.jobs.length ? state.jobs.map((job) => `
    <article class="record-card">
      <header>
        <strong>${escapeHtml(job.name)}</strong>
        <span class="source-tag">${job.enabled ? "Aktif" : "Pasif"}</span>
      </header>
      <small>${escapeHtml(job.scheduleType)} ${escapeHtml(job.scheduleValue || "")} - Son: ${job.lastRunAt ? new Date(job.lastRunAt).toLocaleString("tr-TR") : "Yok"} - Siradaki: ${job.nextRunAt ? new Date(job.nextRunAt).toLocaleString("tr-TR") : "Yok"}</small>
      ${job.lastError ? `<small>Son hata: ${escapeHtml(job.lastError)}</small>` : ""}
    </article>
  `).join("") : `<div class="empty-state">Zamanlanmis is yok</div>`;
}

function renderRuns() {
  els.runList.innerHTML = state.runs.length ? state.runs.map((run) => `
    <article class="record-card">
      <header>
        <strong>${escapeHtml(run.jobName || "Aktarim")}</strong>
        <span class="source-tag">${escapeHtml(run.status)}</span>
      </header>
      <small>Okunan ${run.rowsRead} · Yazilan ${run.rowsWritten} · Atlanan ${run.rowsSkipped}</small>
      <small>${escapeHtml(new Date(run.startedAt).toLocaleString("tr-TR"))}${run.errorMessage ? ` · ${escapeHtml(run.errorMessage)}` : ""}</small>
    </article>
  `).join("") : `<div class="empty-state">Calisma gecmisi yok</div>`;
}

function renderAdmin() {
  const overview = state.adminOverview || {};
  const users = overview.users || [];
  const roles = overview.roles || [];
  const teams = overview.teams || [];
  const license = overview.license || {};
  els.adminPlanPill.textContent = `${license.status || "beta"} · ${license.usedSeats || users.length}/${license.seats || 5}`;
  els.adminSummary.innerHTML = `
    <article><span>Kurulum</span><strong>Self-hosted</strong></article>
    <article><span>DB</span><strong>PostgreSQL</strong></article>
    <article><span>Baglanti</span><strong>${state.connections.length}</strong></article>
    <article><span>Aktarim isi</span><strong>${state.jobs.length}</strong></article>
    <article><span>Run</span><strong>${state.runs.length}</strong></article>
    <article><span>Lisans</span><strong>${escapeHtml(license.status || "beta")}</strong></article>
  `;
  els.adminRoleSelect.innerHTML = roles.map((role) => `<option value="${role.id}">${escapeHtml(role.name)}</option>`).join("");
  els.adminTeamSelect.innerHTML = teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join("");
  els.adminUserList.innerHTML = users.map((user) => `
    <article class="user-row">
      <span class="avatar">${escapeHtml((user.fullName || "A").slice(0, 1).toLocaleUpperCase("tr-TR"))}</span>
      <div><strong>${escapeHtml(user.fullName)}</strong><small>${escapeHtml(user.email)} · ${escapeHtml(user.role)}</small></div>
      <span class="source-tag">${escapeHtml(user.dataScope)}</span>
    </article>
  `).join("");
  els.adminHealth.innerHTML = `
    <article><span>API</span><strong>${state.apiOnline ? "Calisiyor" : "Kontrol"}</strong></article>
    <article><span>Web</span><strong>8080</strong></article>
    <article><span>API Port</span><strong>3000</strong></article>
    <article><span>Scheduler</span><strong>Planli</strong></article>
  `;
}

function renderActivity() {
  els.activityLog.innerHTML = state.activity.slice(-12).reverse().map((entry) => `<li>${escapeHtml(entry)}</li>`).join("");
}

function mappingRowTemplate(mapping = {}) {
  return `
    <div class="mapping-row">
      <input name="sourceColumn" placeholder="kaynak_kolon" value="${escapeHtml(mapping.sourceColumn || "")}">
      <input name="targetColumn" placeholder="hedef_kolon" value="${escapeHtml(mapping.targetColumn || "")}">
      <select name="transform">
        ${["none", "trim", "upper", "lower", "number"].map((item) => `<option value="${item}" ${mapping.transform === item ? "selected" : ""}>${item}</option>`).join("")}
      </select>
      <input name="defaultValue" placeholder="default" value="${escapeHtml(mapping.defaultValue || "")}">
      <label class="inline-check"><input name="required" type="checkbox" ${mapping.required ? "checked" : ""}> Zorunlu</label>
    </div>
  `;
}

function fillSelect(select, items, placeholder) {
  select.innerHTML = [`<option value="">${placeholder}</option>`, ...items.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)].join("");
}

function filterRows(rows, query, keys) {
  if (!query) return rows;
  return rows.filter((row) => keys.map((key) => row[key] || "").join(" ").toLocaleLowerCase("tr-TR").includes(query));
}

function normalizedSearch() {
  return (els.searchInput.value || "").trim().toLocaleLowerCase("tr-TR");
}

function dbTypeLabel(id) {
  return dbTypes.find((type) => type.id === id)?.label || id;
}

function logActivity(message) {
  state.activity.push(`${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - ${message}`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("is-active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === viewId);
  });
  const titles = {
    dashboard: "Dashboard",
    connections: "Baglantilar",
    queries: "Sorgular",
    jobs: "Aktarim Isleri",
    mapping: "Kolon Esleme",
    schedule: "Zamanlama",
    runs: "Calisma Gecmisi",
    admin: "Yonetim"
  };
  els.viewTitle.textContent = titles[viewId] || "ARGEKA Sync";
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
});

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await startDefaultSession();
});

els.logoutButton.addEventListener("click", async () => {
  saveSession(null);
  await startDefaultSession();
});

els.refreshButton.addEventListener("click", async () => {
  await syncAll();
  logActivity("Veriler yenilendi.");
  render();
});

els.searchInput.addEventListener("input", render);

els.connectionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.connectionForm).entries());
  if (!payload.connectionUrl && payload.dbType === "postgresql") payload.connectionUrl = "internal://app";
  try {
    const created = await apiRequest("/api/sync/connections", { method: "POST", body: JSON.stringify(payload) });
    state.connections.unshift(created.data);
    state.selectedConnectionId = created.data.id;
    els.connectionForm.reset();
    logActivity(`${created.data.name} baglantisi kaydedildi.`);
  } catch {
    logActivity("Baglanti kaydedilemedi.");
  }
  render();
});

els.connectionList.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-connection-id]");
  if (card) state.selectedConnectionId = card.dataset.connectionId;
  const test = event.target.closest("[data-test-connection]");
  if (test) {
    try {
      const result = await apiRequest(`/api/sync/connections/${test.dataset.testConnection}/test`, { method: "POST", body: "{}" });
      logActivity(result.message || "Baglanti test edildi.");
      await syncAll();
    } catch {
      logActivity("Baglanti testi basarisiz.");
    }
  }
  render();
});

els.queryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.queryForm).entries());
  try {
    const created = await apiRequest("/api/sync/queries", { method: "POST", body: JSON.stringify(payload) });
    state.queries.unshift(created.data);
    state.selectedQueryId = created.data.id;
    els.queryForm.reset();
    logActivity(`${created.data.name} sorgusu kaydedildi.`);
  } catch {
    logActivity("Sorgu kaydedilemedi. JSON parametreleri kontrol edin.");
  }
  render();
});

els.queryList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-query-id]");
  if (!card) return;
  state.selectedQueryId = card.dataset.queryId;
  render();
});

els.previewQueryButton.addEventListener("click", async () => {
  if (!state.selectedQueryId) return;
  try {
    const preview = await apiRequest(`/api/sync/queries/${state.selectedQueryId}/preview`, { method: "POST", body: "{}" });
    els.queryPreview.innerHTML = renderPreviewTable(preview.columns || [], preview.data || []);
    logActivity("Sorgu onizlemesi alindi.");
  } catch {
    logActivity("Sorgu onizlemesi alinamadi.");
  }
});

els.jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.jobForm).entries());
  try {
    const created = await apiRequest("/api/sync/jobs", { method: "POST", body: JSON.stringify(payload) });
    state.jobs.unshift(created.data);
    state.selectedJobId = created.data.id;
    els.jobForm.reset();
    logActivity(`${created.data.name} aktarim isi kaydedildi.`);
  } catch {
    logActivity("Aktarim isi kaydedilemedi.");
  }
  render();
});

els.jobList.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-job-id]");
  if (card) {
    state.selectedJobId = card.dataset.jobId;
    await loadMappings(state.selectedJobId);
  }
  const run = event.target.closest("[data-run-job]");
  if (run) await runJob(run.dataset.runJob);
  render();
});

els.runSelectedJobButton.addEventListener("click", () => runJob(state.selectedJobId));

async function runJob(jobId) {
  if (!jobId) return;
  try {
    const result = await apiRequest(`/api/sync/jobs/${jobId}/run`, { method: "POST", body: "{}" });
    await syncAll();
    logActivity(`Aktarim tamamlandi: ${result.data.rowsWritten} satir yazildi.`);
  } catch {
    await syncAll();
    logActivity("Aktarim calismasi hata verdi.");
  }
  render();
}

els.mappingJobSelect.addEventListener("change", async () => {
  state.selectedJobId = els.mappingJobSelect.value;
  await loadMappings(state.selectedJobId);
  renderMappings();
});

els.addMappingRowButton.addEventListener("click", () => {
  els.mappingRows.insertAdjacentHTML("beforeend", mappingRowTemplate());
});

els.mappingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const jobId = els.mappingJobSelect.value;
  const mappings = [...els.mappingRows.querySelectorAll(".mapping-row")].map((row, index) => ({
    sourceColumn: row.querySelector('[name="sourceColumn"]').value.trim(),
    targetColumn: row.querySelector('[name="targetColumn"]').value.trim(),
    transform: row.querySelector('[name="transform"]').value,
    defaultValue: row.querySelector('[name="defaultValue"]').value,
    required: row.querySelector('[name="required"]').checked,
    ordinal: index + 1
  })).filter((mapping) => mapping.sourceColumn && mapping.targetColumn);
  try {
    const saved = await apiRequest(`/api/sync/jobs/${jobId}/mappings`, {
      method: "POST",
      body: JSON.stringify({ mappings })
    });
    state.mappings = saved.data || [];
    await syncAll();
    logActivity("Kolon eslemesi kaydedildi.");
  } catch {
    logActivity("Kolon eslemesi kaydedilemedi.");
  }
  render();
});

els.refreshRunsButton.addEventListener("click", async () => {
  await syncAll();
  render();
});

els.schedulerTickButton?.addEventListener("click", async () => {
  try {
    const result = await apiRequest("/api/sync/scheduler/tick", { method: "POST", body: "{}" });
    await syncAll();
    logActivity(`Scheduler calisti: ${result.data.completed} tamamlandi, ${result.data.failed} hata.`);
  } catch {
    logActivity("Scheduler calistirilamadi.");
  }
  render();
});

els.clearLocalLogButton.addEventListener("click", () => {
  state.activity = [];
  renderActivity();
});

els.refreshAdminButton.addEventListener("click", async () => {
  await syncAll();
  render();
});

els.adminUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.adminUserForm).entries());
  payload.hiddenColumns = [];
  try {
    await apiRequest("/api/admin/users", { method: "POST", body: JSON.stringify(payload) });
    els.adminUserForm.reset();
    await syncAll();
    logActivity("Kullanici olusturuldu.");
  } catch {
    logActivity("Kullanici olusturulamadi.");
  }
  render();
});

function renderPreviewTable(columns, rows) {
  if (!rows.length) return `<div class="empty-state">Sorgu sonucunda satir yok</div>`;
  return `
    <div class="table-scroll">
      <table class="opportunity-table">
        <thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function initApp() {
  await restoreSession();
  if (state.session?.token) {
    await syncAll();
    logActivity("ARGEKA Sync hazir.");
    render();
    return;
  }
  render();
  await startDefaultSession();
}

initApp();

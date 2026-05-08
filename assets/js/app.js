const columns = [
  { id: "new", label: "Yeni fÄ±rsat", accent: "#087f74" },
  { id: "contacted", label: "GÃ¶rÃ¼ÅŸme", accent: "#2d5fa8" },
  { id: "proposal", label: "Teklif", accent: "#b7791f" },
  { id: "won", label: "KazanÄ±ldÄ±", accent: "#247a4a" }
];

const initialDeals = [
  {
    id: "deal-1001",
    contact: "AyÅŸe YÄ±lmaz",
    company: "Nova Teknoloji",
    email: "ayse@novatek.example",
    value: 84000,
    stage: "new",
    source: "Gmail",
    owner: "Ensar",
    probability: 25,
    closeDate: "2026-05-18",
    forecast: "Pipeline",
    sector: "Teknoloji",
    territory: "TR Marmara",
    nextAction: "Demo takvimi gÃ¶nder",
    note: "Demo isteÄŸi ve fiyat bilgisi bekliyor.",
    updatedAt: "BugÃ¼n"
  },
  {
    id: "deal-1002",
    contact: "Mehmet Arslan",
    company: "Atlas Lojistik",
    email: "mehmet@atlas.example",
    value: 126000,
    stage: "contacted",
    source: "Outlook",
    owner: "SatÄ±ÅŸ",
    probability: 45,
    closeDate: "2026-05-24",
    forecast: "Best case",
    sector: "Lojistik",
    territory: "TR Ä°Ã§ Anadolu",
    nextAction: "Karar vericiyle toplantÄ±",
    note: "Outlook mesajÄ±ndan otomatik fÄ±rsat aÃ§Ä±ldÄ±.",
    updatedAt: "DÃ¼n"
  },
  {
    id: "deal-1003",
    contact: "Derya KoÃ§",
    company: "Vera Medikal",
    email: "derya@vera.example",
    value: 212000,
    stage: "proposal",
    source: "Web formu",
    owner: "Ensar",
    probability: 70,
    closeDate: "2026-06-03",
    forecast: "Commit",
    sector: "SaÄŸlÄ±k",
    territory: "TR Ege",
    nextAction: "Teklif revizyonu",
    note: "Teklif revizyonu hazÄ±rlanacak.",
    updatedAt: "2 gÃ¼n Ã¶nce"
  },
  {
    id: "deal-1004",
    contact: "Can Demir",
    company: "Mira EndÃ¼stri",
    email: "can@mira.example",
    value: 76000,
    stage: "won",
    source: "API",
    owner: "Operasyon",
    probability: 100,
    closeDate: "2026-05-09",
    forecast: "Closed won",
    sector: "Ãœretim",
    territory: "TR Marmara",
    nextAction: "ERP aktarÄ±mÄ±",
    note: "ERP aktarÄ±mÄ± bekleniyor.",
    updatedAt: "3 gÃ¼n Ã¶nce"
  }
];

const initialMeetings = [
  {
    id: "meeting-1",
    title: "HaftalÄ±k satÄ±ÅŸ komitesi",
    date: "2026-05-06",
    owner: "Ensar",
    attendees: "SatÄ±ÅŸ, Operasyon, Finans",
    agenda: ["Pipeline riski", "Teklif onaylarÄ±", "Tahsilat ve abonelik"]
  },
  {
    id: "meeting-2",
    title: "Nova Teknoloji demo hazÄ±rlÄ±ÄŸÄ±",
    date: "2026-05-07",
    owner: "SatÄ±ÅŸ",
    attendees: "AyÅŸe YÄ±lmaz, Teknik ekip",
    agenda: ["Ä°htiyaÃ§ listesi", "Gmail akÄ±ÅŸÄ±", "Webhook senaryosu"]
  }
];

const initialActions = [
  {
    id: "action-1",
    title: "Nova demo ajandasÄ±nÄ± paylaÅŸ",
    owner: "Ensar",
    due: "2026-05-05",
    priority: "YÃ¼ksek",
    meetingId: "meeting-2",
    done: false
  },
  {
    id: "action-2",
    title: "Teklif ÅŸablonunu gÃ¼ncelle",
    owner: "Finans",
    due: "2026-05-08",
    priority: "Normal",
    meetingId: "meeting-1",
    done: false
  }
];

const initialMinutes = [
  {
    id: "minute-1",
    meetingId: "meeting-1",
    text: "KapanÄ±ÅŸ ihtimali yÃ¼ksek fÄ±rsatlar iÃ§in forecast haftalÄ±k izlenecek."
  }
];

const initialCalendarEvents = [
  {
    id: "event-1",
    title: "Nova Teknoloji demo",
    date: "2026-05-07",
    time: "10:30",
    provider: "Google Calendar",
    attendees: "ayse@novatek.example",
    dealId: "deal-1001"
  },
  {
    id: "event-2",
    title: "Atlas karar verici gÃ¶rÃ¼ÅŸmesi",
    date: "2026-05-08",
    time: "14:00",
    provider: "Outlook Calendar",
    attendees: "mehmet@atlas.example",
    dealId: "deal-1002"
  }
];

const sampleEmails = [
  {
    id: "mail-1",
    from: "elif@riva.example",
    subject: "CRM entegrasyonu iÃ§in gÃ¶rÃ¼ÅŸelim",
    channel: "Gmail",
    preview: "Teklif ve demo takvimi iÃ§in dÃ¶nÃ¼ÅŸ bekliyoruz."
  },
  {
    id: "mail-2",
    from: "finans@kuzey.example",
    subject: "Teklif onayÄ±",
    channel: "Outlook",
    preview: "GÃ¶nderdiÄŸiniz paketi aylÄ±k abonelikle baÅŸlatmak istiyoruz."
  },
  {
    id: "mail-3",
    from: "it@delta.example",
    subject: "Webhook baÄŸlantÄ±sÄ±",
    channel: "API",
    preview: "Yeni fÄ±rsatlarÄ± ERP tarafÄ±na aktarmamÄ±z gerekiyor."
  }
];

const state = {
  deals: [],
  selectedDealId: null,
  apiOnline: false,
  session: null,
  integrations: {
    gmail: false,
    outlook: false,
    googleCalendar: false,
    outlookCalendar: false
  },
  meetings: [],
  selectedMeetingId: null,
  actions: [],
  accounts: [],
  contacts: [],
  quotes: [],
  selectedQuoteId: null,
  tasks: [],
  integrationSettings: [],
  minutes: [],
  calendarEvents: [],
  activity: [],
  adminOverview: null
};

const formatMoney = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0
});

const board = document.querySelector("#board");
const searchInput = document.querySelector("#searchInput");
const detailPanel = document.querySelector("#detailPanel");
const activityLog = document.querySelector("#activityLog");
const billingLog = document.querySelector("#billingLog");
const emailList = document.querySelector("#emailList");
const opportunityTable = document.querySelector("#opportunityTable");
const opportunityTableHead = document.querySelector("#opportunityTableHead");
const meetingList = document.querySelector("#meetingList");
const actionList = document.querySelector("#actionList");
const minuteList = document.querySelector("#minuteList");
const minuteText = document.querySelector("#minuteText");
const calendarAgenda = document.querySelector("#calendarAgenda");
const dealDialog = document.querySelector("#dealDialog");
const dealForm = document.querySelector("#dealForm");
const importFile = document.querySelector("#importFile");
const loginScreen = document.querySelector("#loginScreen");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const adminSummary = document.querySelector("#adminSummary");
const adminUserList = document.querySelector("#adminUserList");
const adminHealth = document.querySelector("#adminHealth");
const adminPlanPill = document.querySelector("#adminPlanPill");
const adminUserForm = document.querySelector("#adminUserForm");
const adminRoleSelect = document.querySelector("#adminRoleSelect");
const adminTeamSelect = document.querySelector("#adminTeamSelect");
const licenseForm = document.querySelector("#licenseForm");
const licenseStatusPill = document.querySelector("#licenseStatusPill");
const adminAuditLog = document.querySelector("#adminAuditLog");
const accountForm = document.querySelector("#accountForm");
const accountList = document.querySelector("#accountList");
const accountCountPill = document.querySelector("#accountCountPill");
const contactForm = document.querySelector("#contactForm");
const contactList = document.querySelector("#contactList");
const contactAccountSelect = document.querySelector("#contactAccountSelect");
const contactCountPill = document.querySelector("#contactCountPill");
const quoteForm = document.querySelector("#quoteForm");
const quoteList = document.querySelector("#quoteList");
const quoteAccountSelect = document.querySelector("#quoteAccountSelect");
const quoteContactSelect = document.querySelector("#quoteContactSelect");
const downloadQuoteButton = document.querySelector("#downloadQuoteButton");
const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const taskOpportunitySelect = document.querySelector("#taskOpportunitySelect");
const openTaskPill = document.querySelector("#openTaskPill");
const oauthSettingsForm = document.querySelector("#oauthSettingsForm");
const oauthSettingsList = document.querySelector("#oauthSettingsList");
const oauthProviderSelect = document.querySelector("#oauthProviderSelect");
const oauthRedirectUri = document.querySelector("#oauthRedirectUri");
const oauthAuthorizeButton = document.querySelector("#oauthAuthorizeButton");
const oauthSandboxButton = document.querySelector("#oauthSandboxButton");
const oauthCheckPanel = document.querySelector("#oauthCheckPanel");
const licenseCheckPanel = document.querySelector("#licenseCheckPanel");
const databaseConfig = {
  name: "argeka-sync-db",
  version: 1,
  store: "records",
  key: "state"
};

function apiUrl(path) {
  return path;
}

async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
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

function renderSession() {
  const authenticated = Boolean(state.session?.token);
  loginScreen.classList.toggle("is-hidden", authenticated);
  document.querySelector("#accountName").textContent = state.session?.tenant?.name || "ARGEKA Demo";
  document.querySelector("#accountMeta").textContent = state.session?.user
    ? `${state.session.user.fullName} Â· ${state.session.user.role}`
    : "Oturum bekleniyor";
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

function apiOpportunityToDeal(item) {
  return {
    id: item.id,
    contact: item.contact || "CRM kaydÄ±",
    company: item.company || item.title || "FÄ±rsat",
    email: item.email || "kayit@argeka.local",
    value: Number(item.value || 0),
    stage: item.stage || "new",
    source: item.source || "API",
    owner: item.owner || "Sistem",
    probability: Number(item.probability || 20),
    closeDate: item.closeDate ? String(item.closeDate).slice(0, 10) : "Planlanacak",
    forecast: item.forecast || "Pipeline",
    sector: item.sector || "Genel",
    territory: item.territory || "TR",
    nextAction: item.nextAction || "Ä°lk temas",
    note: item.note || "",
    updatedAt: "API"
  };
}

function dealToApiOpportunity(deal) {
  return {
    title: deal.company || deal.title,
    company: deal.company,
    stage: deal.stage,
    value: Number(deal.value || 0),
    probability: Number(deal.probability || 20),
    forecast: deal.forecast || "Pipeline",
    source: deal.source || "Web",
    closeDate: deal.closeDate && deal.closeDate !== "Planlanacak" ? deal.closeDate : null,
    nextAction: deal.nextAction || null,
    note: deal.note || null
  };
}

async function syncOpportunitiesFromApi() {
  try {
    const payload = await apiRequest("/api/opportunities");
    const apiDeals = Array.isArray(payload?.data) ? payload.data.map(apiOpportunityToDeal) : [];
    if (apiDeals.length) {
      state.deals = apiDeals;
      state.selectedDealId = apiDeals.some((deal) => deal.id === state.selectedDealId)
        ? state.selectedDealId
        : apiDeals[0].id;
      logActivity("FÄ±rsatlar PostgreSQL API Ã¼zerinden yÃ¼klendi.");
    }
  } catch {
    state.apiOnline = false;
    logActivity("API baÄŸlantÄ±sÄ± yok, yerel veriyle devam ediliyor.");
  }
}

async function syncAdminOverview() {
  if (!state.session?.token) {
    state.adminOverview = null;
    return;
  }

  try {
    state.adminOverview = await apiRequest("/api/admin/overview");
  } catch {
    state.adminOverview = null;
  }
}

async function createOpportunityOnApi(deal) {
  const payload = await apiRequest("/api/opportunities", {
    method: "POST",
    body: JSON.stringify(dealToApiOpportunity(deal))
  });
  return payload?.data ? apiOpportunityToDeal(payload.data) : null;
}

async function syncBusinessDataFromApi() {
  if (!state.session?.token) return;
  try {
    const [accounts, contacts, quotes, tasks, integrationSettings] = await Promise.all([
      apiRequest("/api/accounts"),
      apiRequest("/api/contacts"),
      apiRequest("/api/quotes"),
      apiRequest("/api/actions"),
      apiRequest("/api/integration-settings")
    ]);
    state.accounts = Array.isArray(accounts?.data) ? accounts.data : [];
    state.contacts = Array.isArray(contacts?.data) ? contacts.data : [];
    state.quotes = Array.isArray(quotes?.data) ? quotes.data : [];
    state.selectedQuoteId = state.quotes.some((quote) => quote.id === state.selectedQuoteId)
      ? state.selectedQuoteId
      : state.quotes[0]?.id || null;
    state.tasks = Array.isArray(tasks?.data) ? tasks.data : [];
    state.integrationSettings = Array.isArray(integrationSettings?.data) ? integrationSettings.data : [];
    logActivity("MÃ¼ÅŸteri, teklif ve gÃ¶rev verileri PostgreSQL Ã¼zerinden yÃ¼klendi.");
  } catch {
    state.apiOnline = false;
    logActivity("Ek modÃ¼l verileri iÃ§in API baÄŸlantÄ±sÄ± bekleniyor.");
  }
}

async function createAccountOnApi(account) {
  const payload = await apiRequest("/api/accounts", {
    method: "POST",
    body: JSON.stringify(account)
  });
  return payload?.data || null;
}

async function createContactOnApi(contact) {
  const payload = await apiRequest("/api/contacts", {
    method: "POST",
    body: JSON.stringify(contact)
  });
  return payload?.data || null;
}

async function createQuoteOnApi(quote) {
  const payload = await apiRequest("/api/quotes", {
    method: "POST",
    body: JSON.stringify(quote)
  });
  return payload?.data || null;
}

async function createTaskOnApi(task) {
  const payload = await apiRequest("/api/actions", {
    method: "POST",
    body: JSON.stringify(task)
  });
  return payload?.data || null;
}

async function updateTaskOnApi(taskId, patch) {
  const payload = await apiRequest(`/api/actions/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
  return payload?.data || null;
}

async function saveIntegrationSettingOnApi(setting) {
  const payload = await apiRequest("/api/integration-settings", {
    method: "POST",
    body: JSON.stringify(setting)
  });
  return payload?.data || null;
}

async function createOAuthAuthorizeOnApi(provider) {
  const payload = await apiRequest(`/api/oauth/authorize/${provider}`, {
    method: "POST",
    body: JSON.stringify({})
  });
  return payload?.data || null;
}

async function sandboxConnectOAuthOnApi(provider) {
  const payload = await apiRequest("/api/oauth/sandbox-connect", {
    method: "POST",
    body: JSON.stringify({ provider })
  });
  return payload?.data || null;
}

async function syncLicenseStatusFromApi() {
  const payload = await apiRequest("/api/license/status");
  return payload?.data || null;
}

async function createAdminUserOnApi(user) {
  const payload = await apiRequest("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(user)
  });
  return payload?.data || null;
}

async function activateLicenseOnApi(license) {
  const payload = await apiRequest("/api/admin/license", {
    method: "POST",
    body: JSON.stringify(license)
  });
  return payload?.data || null;
}

async function updateOpportunityOnApi(deal) {
  if (!state.apiOnline || String(deal.id).startsWith("deal-")) return;
  await apiRequest(`/api/opportunities/${deal.id}`, {
    method: "PATCH",
    body: JSON.stringify(dealToApiOpportunity(deal))
  });
}

function openDatabase() {
  if (!("indexedDB" in window)) return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(databaseConfig.name, databaseConfig.version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(databaseConfig.store)) {
        db.createObjectStore(databaseConfig.store);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function readPersistedState() {
  const db = await openDatabase();
  if (!db) {
    const saved = localStorage.getItem("argeka-sync-state");
    return saved ? JSON.parse(saved) : null;
  }

  return new Promise((resolve) => {
    const tx = db.transaction(databaseConfig.store, "readonly");
    const store = tx.objectStore(databaseConfig.store);
    const request = store.get(databaseConfig.key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function writePersistedState(value) {
  const db = await openDatabase();
  localStorage.setItem("argeka-sync-state", JSON.stringify(value));
  if (!db) return;

  const tx = db.transaction(databaseConfig.store, "readwrite");
  tx.objectStore(databaseConfig.store).put(value, databaseConfig.key);
}

async function loadState() {
  const saved = await readPersistedState();
  if (!saved) {
    state.deals = initialDeals;
    state.selectedDealId = initialDeals[0].id;
    state.meetings = initialMeetings;
    state.selectedMeetingId = initialMeetings[0].id;
    state.actions = initialActions;
    state.accounts = [];
    state.contacts = [];
    state.quotes = [];
    state.selectedQuoteId = null;
    state.tasks = [];
    state.integrationSettings = [];
    state.minutes = initialMinutes;
    state.calendarEvents = initialCalendarEvents;
    state.activity = ["MVP Ã§alÄ±ÅŸma alanÄ± hazÄ±rlandÄ±."];
    return;
  }

  try {
    const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
    state.deals = Array.isArray(parsed.deals) ? parsed.deals : initialDeals;
    state.selectedDealId = parsed.selectedDealId || state.deals[0]?.id || null;
    state.integrations = {
      gmail: Boolean(parsed.integrations?.gmail),
      outlook: Boolean(parsed.integrations?.outlook),
      googleCalendar: Boolean(parsed.integrations?.googleCalendar),
      outlookCalendar: Boolean(parsed.integrations?.outlookCalendar)
    };
    state.meetings = Array.isArray(parsed.meetings) ? parsed.meetings : initialMeetings;
    state.selectedMeetingId = parsed.selectedMeetingId || state.meetings[0]?.id || null;
    state.actions = Array.isArray(parsed.actions) ? parsed.actions : initialActions;
    state.accounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
    state.contacts = Array.isArray(parsed.contacts) ? parsed.contacts : [];
    state.quotes = Array.isArray(parsed.quotes) ? parsed.quotes : [];
    state.selectedQuoteId = parsed.selectedQuoteId || state.quotes[0]?.id || null;
    state.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    state.integrationSettings = Array.isArray(parsed.integrationSettings) ? parsed.integrationSettings : [];
    state.minutes = Array.isArray(parsed.minutes) ? parsed.minutes : initialMinutes;
    state.calendarEvents = Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : initialCalendarEvents;
    state.activity = Array.isArray(parsed.activity) ? parsed.activity : [];
  } catch {
    state.deals = initialDeals;
    state.selectedDealId = initialDeals[0].id;
    state.meetings = initialMeetings;
    state.selectedMeetingId = initialMeetings[0].id;
    state.actions = initialActions;
    state.accounts = [];
    state.contacts = [];
    state.quotes = [];
    state.selectedQuoteId = null;
    state.tasks = [];
    state.integrationSettings = [];
    state.minutes = initialMinutes;
    state.calendarEvents = initialCalendarEvents;
    state.activity = ["KayÄ±tlÄ± veri okunamadÄ±, Ã¶rnek veri yÃ¼klendi."];
  }
}

function saveState() {
  writePersistedState(state);
}

function render() {
  renderSession();
  renderBoard();
  renderDetail();
  renderMetrics();
  renderOpportunityTable();
  renderCustomers();
  renderQuotes();
  renderTasks();
  renderMeetings();
  renderCalendar();
  renderIntegrations();
  renderEmails();
  renderAdmin();
  renderActivity();
  saveState();
}

function renderBoard() {
  const query = searchInput.value.trim().toLocaleLowerCase("tr-TR");
  board.innerHTML = "";

  columns.forEach((column) => {
    const columnDeals = state.deals.filter((deal) => {
      if (deal.stage !== column.id) return false;
      if (!query) return true;
      return [deal.contact, deal.company, deal.email, deal.source, deal.owner]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(query);
    });

    const columnElement = document.createElement("section");
    columnElement.className = "column";
    columnElement.dataset.stage = column.id;
    columnElement.innerHTML = `
      <div class="column-header">
        <strong>${column.label}</strong>
        <span class="count">${columnDeals.length}</span>
      </div>
      <div class="card-stack"></div>
    `;

    columnElement.addEventListener("dragover", handleDragOver);
    columnElement.addEventListener("dragleave", handleDragLeave);
    columnElement.addEventListener("drop", handleDrop);

    const stack = columnElement.querySelector(".card-stack");
    columnDeals.forEach((deal) => stack.appendChild(createDealCard(deal, column.accent)));
    board.appendChild(columnElement);
  });
}

function createDealCard(deal, accent) {
  const card = document.createElement("article");
  card.className = "deal-card";
  card.draggable = true;
  card.dataset.id = deal.id;
  card.style.borderLeftColor = accent;
  if (deal.id === state.selectedDealId) card.classList.add("is-selected");

  card.innerHTML = `
    <div class="card-top">
      <strong>${escapeHtml(deal.company)}</strong>
      <span class="card-value">${formatMoney.format(deal.value)}</span>
    </div>
    <span>${escapeHtml(deal.contact)}</span>
    <small>${escapeHtml(deal.email)}</small>
    <div class="card-footer">
      <span class="source-tag">${escapeHtml(deal.source)}</span>
      <small>%${Number(deal.probability || 0)}</small>
    </div>
  `;

  card.addEventListener("click", () => {
    state.selectedDealId = deal.id;
    render();
  });
  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", deal.id);
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));
  return card;
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("is-over");
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("is-over");
}

function handleDrop(event) {
  event.preventDefault();
  const stage = event.currentTarget.dataset.stage;
  const dealId = event.dataTransfer.getData("text/plain");
  const deal = state.deals.find((item) => item.id === dealId);
  event.currentTarget.classList.remove("is-over");
  if (!deal || deal.stage === stage) return;

  const previous = columns.find((column) => column.id === deal.stage)?.label || deal.stage;
  const next = columns.find((column) => column.id === stage)?.label || stage;
  deal.stage = stage;
  deal.updatedAt = "Az Ã¶nce";
  state.selectedDealId = deal.id;
  logActivity(`${deal.company} taÅŸÄ±ndÄ±: ${previous} â†’ ${next}.`);
  updateOpportunityOnApi(deal).catch(() => {
    state.apiOnline = false;
    logActivity("AÅŸama deÄŸiÅŸimi yerelde kaldÄ±, API senkronu sonra denenecek.");
    render();
  });
  render();
}

function renderDetail() {
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  if (!deal) {
    detailPanel.className = "detail-panel empty-state";
    detailPanel.textContent = "Bir fÄ±rsat seÃ§in";
    return;
  }

  detailPanel.className = "detail-panel";
  const hidden = currentHiddenColumns();
  const detailRows = [
    ["contact", "KiÅŸi", deal.contact],
    ["email", "E-posta", deal.email],
    ["value", "DeÄŸer", formatMoney.format(deal.value)],
    ["probability", "OlasÄ±lÄ±k", `%${Number(deal.probability || 0)}`],
    ["closeDate", "KapanÄ±ÅŸ", deal.closeDate || "Planlanacak"],
    ["forecast", "Forecast", deal.forecast || "Pipeline"],
    ["sector", "SektÃ¶r", deal.sector || "Genel"],
    ["territory", "BÃ¶lge", deal.territory || "TR"],
    ["source", "Kaynak", deal.source],
    ["owner", "Sahip", deal.owner || "-"],
    ["nextAction", "Sonraki", deal.nextAction || "-"],
    ["note", "Not", deal.note || "-"]
  ].filter(([key]) => !hidden.has(key));
  detailPanel.innerHTML = `
    <h2>${escapeHtml(deal.company)}</h2>
    <dl>
      ${detailRows.map(([, label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
    </dl>
  `;
}

function renderOpportunityTable() {
  const hidden = currentHiddenColumns();
  const tableColumns = [
    { key: "company", label: "FÄ±rsat" },
    { key: "stage", label: "AÅŸama" },
    { key: "probability", label: "OlasÄ±lÄ±k" },
    { key: "closeDate", label: "KapanÄ±ÅŸ" },
    { key: "forecast", label: "Forecast" },
    { key: "owner", label: "Sorumlu" }
  ].filter((column) => !hidden.has(column.key));

  opportunityTableHead.innerHTML = tableColumns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
  opportunityTable.innerHTML = "";
  state.deals.forEach((deal) => {
    const row = document.createElement("tr");
    row.dataset.tableDeal = deal.id;
    row.classList.toggle("is-selected", deal.id === state.selectedDealId);
    const cellMap = {
      company: `<strong>${escapeHtml(deal.company)}</strong><br><small>${escapeHtml(deal.contact)}</small>`,
      stage: escapeHtml(getStageLabel(deal.stage)),
      probability: `
        <span class="probability-bar">
          <span><i style="width: ${Math.min(Number(deal.probability || 0), 100)}%"></i></span>
          <b>%${Number(deal.probability || 0)}</b>
        </span>`,
      closeDate: escapeHtml(deal.closeDate || "Planlanacak"),
      forecast: `<span class="source-tag">${escapeHtml(deal.forecast || "Pipeline")}</span>`,
      owner: escapeHtml(deal.owner || "-")
    };
    row.innerHTML = tableColumns.map((column) => `<td>${cellMap[column.key]}</td>`).join("");
    opportunityTable.appendChild(row);
  });
}

function currentHiddenColumns() {
  return new Set(state.session?.user?.hiddenColumns || []);
}

function getStageLabel(stage) {
  return columns.find((column) => column.id === stage)?.label || stage;
}

function renderMetrics() {
  const total = state.deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  const open = state.deals.filter((deal) => deal.stage !== "won").length;
  const connected = Object.values(state.integrations).filter(Boolean).length;

  document.querySelector("#totalValue").textContent = formatMoney.format(total);
  document.querySelector("#openDeals").textContent = String(open);
  document.querySelector("#connectedChannels").textContent = String(connected);
}

function renderCustomers() {
  if (!accountList || !contactList) return;
  accountCountPill.textContent = `${state.accounts.length} kayÄ±t`;
  contactCountPill.textContent = `${state.contacts.length} kayÄ±t`;
  const accountOptions = [
    `<option value="">Firma seÃ§</option>`,
    ...state.accounts.map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}</option>`)
  ].join("");
  contactAccountSelect.innerHTML = accountOptions;
  quoteAccountSelect.innerHTML = accountOptions;
  quoteContactSelect.innerHTML = [
    `<option value="">KiÅŸi seÃ§</option>`,
    ...state.contacts.map((contact) => `<option value="${escapeHtml(contact.id)}">${escapeHtml(contact.fullName)}${contact.accountName ? ` Â· ${escapeHtml(contact.accountName)}` : ""}</option>`)
  ].join("");

  accountList.innerHTML = state.accounts.length
    ? state.accounts.map((account) => `
        <article class="record-card">
          <header>
            <strong>${escapeHtml(account.name)}</strong>
            <span class="source-tag">${escapeHtml(account.territory || "BÃ¶lge yok")}</span>
          </header>
          <small>${escapeHtml(account.sector || "SektÃ¶r yok")} Â· ${Number(account.contactCount || 0)} kiÅŸi Â· ${Number(account.opportunityCount || 0)} fÄ±rsat</small>
        </article>
      `).join("")
    : `<div class="empty-state">HenÃ¼z firma kaydÄ± yok</div>`;

  contactList.innerHTML = state.contacts.length
    ? state.contacts.map((contact) => `
        <article class="record-card">
          <header>
            <strong>${escapeHtml(contact.fullName)}</strong>
            <span class="source-tag">${escapeHtml(contact.accountName || "BaÄŸÄ±msÄ±z")}</span>
          </header>
          <small>${escapeHtml(contact.email || "E-posta yok")} Â· ${escapeHtml(contact.phone || "Telefon yok")}</small>
        </article>
      `).join("")
    : `<div class="empty-state">HenÃ¼z kiÅŸi kaydÄ± yok</div>`;
}

function renderQuotes() {
  if (!quoteList) return;
  quoteList.innerHTML = state.quotes.length
    ? state.quotes.map((quote) => `
        <article class="record-card quote-card ${quote.id === state.selectedQuoteId ? "is-selected" : ""}" data-quote-id="${escapeHtml(quote.id)}">
          <header>
            <strong>${escapeHtml(quote.title)}</strong>
            <span class="source-tag">${escapeHtml(quote.quoteNo || "Teklif")}</span>
          </header>
          <small>${escapeHtml(quote.accountName || "Firma seÃ§ilmedi")} Â· ${escapeHtml(statusLabel(quote.status))} Â· ${quote.validUntil ? escapeHtml(String(quote.validUntil).slice(0, 10)) : "SÃ¼re yok"}</small>
          <div class="quote-total">${formatMoney.format(Number(quote.total || 0))}</div>
        </article>
      `).join("")
    : `<div class="empty-state">HenÃ¼z teklif yok</div>`;
}

function renderTasks() {
  if (!taskList) return;
  const openTasks = state.tasks.filter((task) => !task.done);
  openTaskPill.textContent = `${openTasks.length} aÃ§Ä±k`;
  taskOpportunitySelect.innerHTML = [
    `<option value="">FÄ±rsat seÃ§me</option>`,
    ...state.deals.map((deal) => `<option value="${escapeHtml(deal.id)}">${escapeHtml(deal.company)}</option>`)
  ].join("");
  taskList.innerHTML = state.tasks.length
    ? state.tasks.map((task) => `
        <article class="task-card ${task.done ? "is-done" : ""}">
          <label class="task-check">
            <input type="checkbox" data-task-done="${escapeHtml(task.id)}" ${task.done ? "checked" : ""}>
            <span>
              <strong>${escapeHtml(task.title)}</strong>
              <small>${escapeHtml(task.owner || "Sistem")} Â· ${escapeHtml(task.priority || "Normal")} Â· ${task.due ? escapeHtml(String(task.due).slice(0, 10)) : "Termin yok"}</small>
            </span>
          </label>
        </article>
      `).join("")
    : `<div class="empty-state">HenÃ¼z gÃ¶rev yok</div>`;
}

function renderIntegrations() {
  setIntegrationStatus("gmail", state.integrations.gmail);
  setIntegrationStatus("outlook", state.integrations.outlook);
  renderOAuthSettings();
}

function renderOAuthSettings() {
  if (!oauthSettingsForm || !oauthSettingsList) return;
  oauthRedirectUri.value = defaultRedirectUri(oauthProviderSelect.value);
  oauthSettingsList.innerHTML = state.integrationSettings.length
    ? state.integrationSettings.map((setting) => `
        <article class="oauth-row">
          <strong>${escapeHtml(setting.provider === "gmail" ? "Gmail" : "Outlook")}</strong>
          <small>${escapeHtml(setting.status || "draft")} Â· ${escapeHtml(setting.redirectUri || defaultRedirectUri(setting.provider))}</small>
          <span class="source-tag">${Number(setting.scopes?.length || 0)} scope</span>
        </article>
      `).join("")
    : `<div class="empty-state">OAuth uygulama ayarÄ± bekleniyor</div>`;
  const attempts = state.adminOverview?.oauthAttempts || [];
  oauthCheckPanel.innerHTML = attempts.length
    ? `
      <div class="oauth-result">
        <strong>Son OAuth denemeleri</strong>
        ${attempts.slice(0, 3).map((attempt) => `
          <small>${escapeHtml(attempt.provider)} Â· ${escapeHtml(attempt.status)} Â· ${escapeHtml(new Date(attempt.createdAt).toLocaleString("tr-TR"))}</small>
          ${attempt.authorizeUrl ? `<a class="secondary-button oauth-link" href="${escapeHtml(attempt.authorizeUrl)}" target="_blank" rel="noreferrer">OAuth ekranÄ±nÄ± aÃ§</a>` : ""}
        `).join("")}
      </div>
    `
    : `<div class="oauth-result"><strong>Local OAuth hazÄ±r</strong><small>Ã–nce ayarÄ± kaydedip yetki linki hazÄ±rlayÄ±n.</small></div>`;
}

function defaultRedirectUri(provider) {
  const origin = window.location.origin && window.location.origin !== "null"
    ? window.location.origin
    : "https://crm.argeka.com";
  return `${origin}/oauth/${provider}/callback`;
}

function statusLabel(status) {
  return {
    draft: "Taslak",
    sent: "GÃ¶nderildi",
    accepted: "Kabul edildi",
    rejected: "Reddedildi"
  }[status] || status || "Taslak";
}

function renderLicenseCheck(license, fallbackUsers = 0) {
  if (!licenseCheckPanel) return;
  const used = Number(license?.usedSeats ?? fallbackUsers);
  const seats = Number(license?.seats || 5);
  const available = Number(license?.seatsAvailable ?? Math.max(seats - used, 0));
  const status = license?.status || "trialing";
  const warnings = Array.isArray(license?.warnings) ? license.warnings : [];
  licenseCheckPanel.innerHTML = `
    <div class="license-meter">
      <div>
        <strong>${escapeHtml(licenseStatusLabel(status))}</strong>
        <small>${used}/${seats} kullanÄ±cÄ± Â· ${available} boÅŸ koltuk</small>
      </div>
      <span class="pill ${status === "active" || status === "trialing" ? "success" : ""}">${escapeHtml(status)}</span>
    </div>
    ${warnings.length ? `<ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : `<small>Lisans yeni kullanÄ±cÄ± ve modÃ¼l kontrolleri iÃ§in uygun.</small>`}
  `;
}

function licenseStatusLabel(status) {
  return {
    active: "Lisans aktif",
    trialing: "Deneme sÃ¼rÃ¼mÃ¼",
    review_required: "Ä°nceleme gerekli",
    expired: "SÃ¼resi doldu"
  }[status] || "Lisans durumu";
}

function setIntegrationStatus(key, connected) {
  const status = document.querySelector(`#${key}Status`);
  const button = document.querySelector(`[data-connect="${key}"]`);
  status.textContent = connected ? "BaÄŸlÄ±" : "BaÄŸlÄ± deÄŸil";
  status.classList.toggle("is-connected", connected);
  button.textContent = connected ? "BaÄŸlantÄ±yÄ± yenile" : `${key === "gmail" ? "Gmail" : "Outlook"} baÄŸla`;
}

function renderEmails() {
  emailList.innerHTML = "";
  sampleEmails.forEach((email) => {
    const item = document.createElement("article");
    item.className = "email-item";
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(email.subject)}</strong>
        <span class="source-tag">${escapeHtml(email.channel)}</span>
      </header>
      <small>${escapeHtml(email.from)}</small>
      <p>${escapeHtml(email.preview)}</p>
      <button class="secondary-button" type="button" data-email-id="${email.id}">FÄ±rsata dÃ¶nÃ¼ÅŸtÃ¼r</button>
    `;
    emailList.appendChild(item);
  });
}

function renderMeetings() {
  const selected = state.meetings.find((meeting) => meeting.id === state.selectedMeetingId) || state.meetings[0];
  if (selected) state.selectedMeetingId = selected.id;

  meetingList.innerHTML = "";
  state.meetings.forEach((meeting) => {
    const card = document.createElement("article");
    card.className = "meeting-card";
    card.classList.toggle("is-selected", meeting.id === state.selectedMeetingId);
    card.dataset.meetingId = meeting.id;
    card.innerHTML = `
      <header>
        <strong>${escapeHtml(meeting.title)}</strong>
        <span class="source-tag">${escapeHtml(meeting.date)}</span>
      </header>
      <small>${escapeHtml(meeting.attendees)}</small>
      <ul>${meeting.agenda.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    `;
    meetingList.appendChild(card);
  });

  minuteList.innerHTML = "";
  state.minutes
    .filter((minute) => minute.meetingId === state.selectedMeetingId)
    .slice()
    .reverse()
    .forEach((minute) => {
      const item = document.createElement("li");
      item.textContent = minute.text;
      minuteList.appendChild(item);
    });

  actionList.innerHTML = "";
  state.actions
    .filter((action) => action.meetingId === state.selectedMeetingId)
    .forEach((action) => {
      const card = document.createElement("article");
      card.className = "action-card";
      card.innerHTML = `
        <header>
          <strong>${escapeHtml(action.title)}</strong>
          <span class="source-tag">${escapeHtml(action.priority)}</span>
        </header>
        <small>${escapeHtml(action.owner)} Â· ${escapeHtml(action.due)}</small>
      `;
      actionList.appendChild(card);
    });
}

function renderCalendar() {
  calendarAgenda.innerHTML = "";
  document.querySelectorAll("[data-calendar-connect]").forEach((button) => {
    const key = button.dataset.calendarConnect;
    button.textContent = state.integrations[key]
      ? `${button.textContent.replace(" izni", "").replace(" baÄŸlÄ±", "")} baÄŸlÄ±`
      : button.textContent.replace(" baÄŸlÄ±", " izni");
  });

  state.calendarEvents
    .slice()
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .forEach((event) => {
      const deal = state.deals.find((item) => item.id === event.dealId);
      const item = document.createElement("article");
      item.className = "calendar-event";
      item.innerHTML = `
        <time datetime="${escapeHtml(`${event.date}T${event.time}`)}">
          <strong>${escapeHtml(event.time)}</strong>
          <span>${escapeHtml(event.date)}</span>
        </time>
        <div>
          <strong>${escapeHtml(event.title)}</strong>
          <small>${escapeHtml(event.provider)} Â· ${escapeHtml(event.attendees || "KatÄ±lÄ±mcÄ± yok")}</small>
          <span>${escapeHtml(deal ? deal.company : "CRM etkinliÄŸi")}</span>
        </div>
      `;
      calendarAgenda.appendChild(item);
    });
}

function renderActivity() {
  activityLog.innerHTML = "";
  state.activity.slice(-12).reverse().forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    activityLog.appendChild(item);
  });
}

function renderAdmin() {
  if (!adminSummary || !adminUserList || !adminHealth) return;

  const overview = state.adminOverview;
  const tenant = overview?.tenant || state.session?.tenant || {
    name: "ARGEKA Demo",
    plan: "pro",
    billing_status: "trialing"
  };
  const counts = overview?.counts || {
    opportunities: state.deals.length,
    meetings: state.meetings.length,
    actions: state.actions.length,
    oauthConnections: Object.values(state.integrations).filter(Boolean).length,
    webhooks: 0
  };
  const users = overview?.users || (state.session?.user ? [state.session.user] : []);
  const install = overview?.install || {
    edition: "self-hosted",
    database: state.apiOnline ? "PostgreSQL" : "Yerel demo",
    webPort: "8080",
    apiPort: "3000",
    backupStatus: "planned"
  };
  const roles = overview?.roles || [];
  const teams = overview?.teams || [];
  const license = overview?.license || null;
  const backup = overview?.backup || null;
  const audit = overview?.audit || [];

  adminPlanPill.textContent = `${tenant.plan || "pro"} Â· ${tenant.billing_status || "trialing"}`;
  if (licenseStatusPill) {
    licenseStatusPill.textContent = license?.status || "trialing";
    licenseStatusPill.classList.toggle("success", license?.status === "active");
  }
  if (adminRoleSelect) {
    adminRoleSelect.innerHTML = roles.length
      ? roles.map((role) => `<option value="${escapeHtml(role.id)}">${escapeHtml(role.name)} Â· ${escapeHtml(scopeLabel(role.dataScope))}</option>`).join("")
      : `<option value="">Rol bekleniyor</option>`;
  }
  if (adminTeamSelect) {
    adminTeamSelect.innerHTML = teams.length
      ? teams.map((team) => `<option value="${escapeHtml(team.id)}">${escapeHtml(team.name)}</option>`).join("")
      : `<option value="">Ekip bekleniyor</option>`;
  }
  if (licenseForm && license) {
    licenseForm.elements.customerName.value = license.customer_name || license.customerName || "";
    licenseForm.elements.edition.value = license.edition || "self-hosted";
    licenseForm.elements.seats.value = license.seats || 5;
    licenseForm.elements.expiresAt.value = license.expires_at || license.expiresAt ? String(license.expires_at || license.expiresAt).slice(0, 10) : "";
  }
  renderLicenseCheck(license, users.length);
  adminSummary.innerHTML = `
    <article>
      <span>Firma</span>
      <strong>${escapeHtml(tenant.name || "ARGEKA Demo")}</strong>
    </article>
    <article>
      <span>FÄ±rsat</span>
      <strong>${Number(counts.opportunities || 0)}</strong>
    </article>
    <article>
      <span>ToplantÄ±</span>
      <strong>${Number(counts.meetings || 0)}</strong>
    </article>
    <article>
      <span>Aksiyon</span>
      <strong>${Number(counts.actions || 0)}</strong>
    </article>
    <article>
      <span>Lisans</span>
      <strong>${escapeHtml(license?.status || "Deneme")}</strong>
    </article>
    <article>
      <span>KullanÄ±cÄ± limiti</span>
      <strong>${Number(license?.usedSeats || users.length || 0)} / ${Number(license?.seats || 5)}</strong>
    </article>
  `;

  adminUserList.innerHTML = users.length
    ? users.map((user) => `
        <article class="user-row">
          <span class="avatar">${escapeHtml((user.fullName || user.email || "A").slice(0, 1).toLocaleUpperCase("tr-TR"))}</span>
          <div>
            <strong>${escapeHtml(user.fullName || "KullanÄ±cÄ±")}</strong>
            <small>${escapeHtml(user.email || "-")} Â· ${escapeHtml(user.teamName || "Ekipsiz")} Â· ${escapeHtml(scopeLabel(user.dataScope))}</small>
          </div>
          <span class="source-tag">${escapeHtml(user.role || "member")}</span>
        </article>
      `).join("")
    : `<div class="empty-state">KullanÄ±cÄ± kaydÄ± bekleniyor</div>`;

  adminHealth.innerHTML = `
    <article>
      <span>API</span>
      <strong>${state.apiOnline ? "Ã‡alÄ±ÅŸÄ±yor" : "Kontrol gerekli"}</strong>
    </article>
    <article>
      <span>VeritabanÄ±</span>
      <strong>${escapeHtml(install.database)}</strong>
    </article>
    <article>
      <span>DaÄŸÄ±tÄ±m</span>
      <strong>${escapeHtml(install.edition)}</strong>
    </article>
    <article>
      <span>OAuth</span>
      <strong>${Number(counts.oauthConnections || 0)}</strong>
    </article>
    <article>
      <span>Webhook</span>
      <strong>${Number(counts.webhooks || 0)}</strong>
    </article>
    <article>
      <span>Yedek</span>
      <strong>${backup ? escapeHtml(new Date(backup.created_at || backup.createdAt).toLocaleString("tr-TR")) : "Bekliyor"}</strong>
    </article>
  `;

  if (adminAuditLog) {
    adminAuditLog.innerHTML = audit.length
      ? audit.map((entry) => `
          <li>
            ${escapeHtml(new Date(entry.createdAt).toLocaleString("tr-TR"))}
            - ${escapeHtml(entry.user)} Â· ${escapeHtml(auditLabel(entry.action))}
          </li>
        `).join("")
      : "<li>HenÃ¼z iÅŸlem kaydÄ± yok.</li>";
  }
}

function scopeLabel(scope) {
  return {
    own: "Kendi kayÄ±tlarÄ±",
    team: "Ekip kayÄ±tlarÄ±",
    all: "TÃ¼m firma"
  }[scope] || "Kendi kayÄ±tlarÄ±";
}

function auditLabel(action) {
  return {
    "user.created": "kullanÄ±cÄ± oluÅŸturdu",
    "license.updated": "lisans gÃ¼ncelledi",
    "data.exported": "veri dÄ±ÅŸa aktardÄ±",
    "opportunity.created": "fÄ±rsat oluÅŸturdu",
    "opportunity.updated": "fÄ±rsat gÃ¼ncelledi",
    "account.created": "firma oluÅŸturdu",
    "contact.created": "kiÅŸi oluÅŸturdu",
    "quote.created": "teklif oluÅŸturdu",
    "action.created": "gÃ¶rev oluÅŸturdu",
    "action.updated": "gÃ¶rev gÃ¼ncelledi",
    "integration.oauth_configured": "OAuth ayarÄ± kaydetti"
  }[action] || action;
}

async function addDeal(deal) {
  const newDeal = {
    ...deal,
    id: `deal-${Date.now()}`,
    stage: deal.stage || "new",
    updatedAt: "Az Ã¶nce",
    value: Number(deal.value || 0),
    probability: Number(deal.probability || 20),
    closeDate: deal.closeDate || "Planlanacak",
    forecast: deal.forecast || "Pipeline",
    sector: deal.sector || "Genel",
    territory: deal.territory || "TR",
    nextAction: deal.nextAction || "Ä°lk temas"
  };
  state.deals.unshift(newDeal);
  state.selectedDealId = newDeal.id;
  logActivity(`${deal.company} iÃ§in yeni fÄ±rsat aÃ§Ä±ldÄ±.`);
  render();
  try {
    const apiDeal = await createOpportunityOnApi(newDeal);
    if (apiDeal) {
      Object.assign(newDeal, {
        ...apiDeal,
        contact: newDeal.contact,
        email: newDeal.email,
        owner: newDeal.owner,
        sector: newDeal.sector,
        territory: newDeal.territory
      });
      state.selectedDealId = newDeal.id;
      logActivity(`${newDeal.company} PostgreSQL API'ye kaydedildi.`);
      render();
    }
  } catch {
    state.apiOnline = false;
    logActivity(`${newDeal.company} yerelde kaydedildi, API baÄŸlantÄ±sÄ± bekleniyor.`);
    render();
  }
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
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === viewId);
  });
  const titleMap = {
    customers: "MÃ¼ÅŸteriler",
    pipeline: "Pipeline",
    quotes: "Teklifler",
    tasks: "GÃ¶revler",
    meetings: "ToplantÄ±lar",
    calendar: "Takvim",
    inbox: "E-posta",
    integrations: "Entegrasyon",
    billing: "Abonelik",
    distribution: "DaÄŸÄ±tÄ±m",
    admin: "YÃ¶netim"
  };
  document.querySelector("#view-title").textContent = titleMap[viewId] || "ARGEKA Sync";
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "GiriÅŸ yapÄ±lÄ±yor...";
  const formData = new FormData(loginForm);
  try {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    saveSession(payload);
    loginMessage.textContent = "GiriÅŸ baÅŸarÄ±lÄ±.";
    await syncOpportunitiesFromApi();
    await syncBusinessDataFromApi();
    await syncAdminOverview();
    render();
  } catch {
    saveSession(null);
    loginMessage.textContent = "GiriÅŸ baÅŸarÄ±sÄ±z.";
    render();
  }
});

document.querySelector("#logoutButton").addEventListener("click", () => {
  saveSession(null);
  state.adminOverview = null;
  render();
});

document.querySelector("#refreshAdminButton").addEventListener("click", async () => {
  await syncAdminOverview();
  logActivity("YÃ¶netim Ã¶zeti yenilendi.");
  render();
});

adminUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(adminUserForm);
  const hiddenColumns = formData.getAll("hiddenColumns");
  const payload = Object.fromEntries(formData.entries());
  payload.hiddenColumns = hiddenColumns;
  try {
    await createAdminUserOnApi(payload);
    adminUserForm.reset();
    await syncAdminOverview();
    logActivity(`${payload.fullName} kullanÄ±cÄ±sÄ± manuel oluÅŸturuldu.`);
  } catch (error) {
    logActivity(error.message?.includes("402")
      ? "KullanÄ±cÄ± oluÅŸturulamadÄ±: lisans kullanÄ±cÄ± limiti veya lisans durumu uygun deÄŸil."
      : "KullanÄ±cÄ± oluÅŸturulamadÄ±, rol ve e-posta bilgisini kontrol edin.");
  }
  render();
});

licenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(licenseForm).entries());
  try {
    await activateLicenseOnApi(payload);
    await syncAdminOverview();
    const license = await syncLicenseStatusFromApi();
    if (state.adminOverview) state.adminOverview.license = license;
    logActivity("Lisans bilgisi kaydedildi.");
  } catch {
    logActivity("Lisans kaydedilemedi.");
  }
  render();
});

document.querySelector("#downloadJsonExportButton").addEventListener("click", () => downloadAdminExport("json"));
document.querySelector("#downloadCsvExportButton").addEventListener("click", () => downloadAdminExport("csv"));
document.querySelector("#downloadSqlExportButton").addEventListener("click", () => downloadAdminExport("sql"));

accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(accountForm).entries());
  try {
    const account = await createAccountOnApi(payload);
    if (account) state.accounts.unshift(account);
    accountForm.reset();
    logActivity(`${payload.name} firma kaydÄ± oluÅŸturuldu.`);
  } catch {
    logActivity("Firma kaydÄ± oluÅŸturulamadÄ±.");
  }
  render();
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(contactForm).entries());
  try {
    const contact = await createContactOnApi(payload);
    if (contact) state.contacts.unshift(contact);
    contactForm.reset();
    logActivity(`${payload.fullName} kiÅŸi kaydÄ± oluÅŸturuldu.`);
  } catch {
    logActivity("KiÅŸi kaydÄ± oluÅŸturulamadÄ±.");
  }
  render();
});

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(quoteForm).entries());
  try {
    const quote = await createQuoteOnApi(payload);
    if (quote) {
      state.quotes.unshift(quote);
      state.selectedQuoteId = quote.id;
    }
    quoteForm.reset();
    logActivity(`${payload.title} iÃ§in teklif oluÅŸturuldu.`);
  } catch {
    logActivity("Teklif oluÅŸturulamadÄ±.");
  }
  render();
});

quoteList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-quote-id]");
  if (!card) return;
  state.selectedQuoteId = card.dataset.quoteId;
  render();
});

downloadQuoteButton.addEventListener("click", () => {
  const quote = state.quotes.find((item) => item.id === state.selectedQuoteId) || state.quotes[0];
  if (!quote) return;
  const content = [
    "ARGEKA Sync TEKLIF",
    `Teklif No: ${quote.quoteNo || quote.id}`,
    `Firma: ${quote.accountName || "-"}`,
    `Baslik: ${quote.title}`,
    `Durum: ${statusLabel(quote.status)}`,
    `Ara toplam: ${formatMoney.format(Number(quote.subtotal || 0))}`,
    `Indirim: ${formatMoney.format(Number(quote.discount || 0))}`,
    `Vergi: ${formatMoney.format(Number(quote.tax || 0))}`,
    `Toplam: ${formatMoney.format(Number(quote.total || 0))}`,
    `Gecerlilik: ${quote.validUntil ? String(quote.validUntil).slice(0, 10) : "-"}`,
    "",
    quote.notes || ""
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${quote.quoteNo || "argeka-teklif"}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
  logActivity("Teklif Ã§Ä±ktÄ±sÄ± indirildi.");
  render();
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(taskForm).entries());
  try {
    const task = await createTaskOnApi(payload);
    if (task) state.tasks.unshift(task);
    taskForm.reset();
    logActivity(`${payload.title} gÃ¶revi oluÅŸturuldu.`);
  } catch {
    logActivity("GÃ¶rev oluÅŸturulamadÄ±.");
  }
  render();
});

taskList.addEventListener("change", async (event) => {
  const checkbox = event.target.closest("[data-task-done]");
  if (!checkbox) return;
  const task = state.tasks.find((item) => item.id === checkbox.dataset.taskDone);
  if (!task) return;
  task.done = checkbox.checked;
  try {
    const updated = await updateTaskOnApi(task.id, { done: task.done });
    if (updated) Object.assign(task, updated);
    logActivity(`${task.title} gÃ¶revi gÃ¼ncellendi.`);
  } catch {
    logActivity("GÃ¶rev durumu API'ye kaydedilemedi.");
  }
  render();
});

oauthProviderSelect.addEventListener("change", renderOAuthSettings);

oauthAuthorizeButton.addEventListener("click", async () => {
  const provider = oauthProviderSelect.value;
  try {
    const attempt = await createOAuthAuthorizeOnApi(provider);
    if (!state.adminOverview) state.adminOverview = {};
    state.adminOverview.oauthAttempts = [attempt, ...(state.adminOverview.oauthAttempts || [])];
    oauthCheckPanel.innerHTML = `
      <div class="oauth-result">
        <strong>Yetki linki hazÄ±r</strong>
        <small>${escapeHtml(attempt.redirectUri)}</small>
        <a class="secondary-button oauth-link" href="${escapeHtml(attempt.authorizeUrl)}" target="_blank" rel="noreferrer">OAuth ekranÄ±nÄ± aÃ§</a>
      </div>
    `;
    logActivity(`${provider === "gmail" ? "Gmail" : "Outlook"} OAuth yetki linki hazÄ±rlandÄ±.`);
  } catch {
    logActivity("OAuth yetki linki Ã¼retilemedi. Client ID ve redirect URI kaydÄ±nÄ± kontrol edin.");
  }
  render();
});

oauthSandboxButton.addEventListener("click", async () => {
  const provider = oauthProviderSelect.value;
  try {
    const setting = await sandboxConnectOAuthOnApi(provider);
    const existingIndex = state.integrationSettings.findIndex((item) => item.provider === setting.provider);
    if (existingIndex >= 0) state.integrationSettings.splice(existingIndex, 1, setting);
    else state.integrationSettings.push(setting);
    state.integrations[provider] = true;
    await syncAdminOverview();
    logActivity(`${provider === "gmail" ? "Gmail" : "Outlook"} sandbox baÄŸlantÄ±sÄ± aktif edildi.`);
  } catch {
    logActivity("Sandbox baÄŸlantÄ±sÄ± aÃ§Ä±lamadÄ±. Ã–nce OAuth ayarÄ±nÄ± kaydedin.");
  }
  render();
});

oauthSettingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(oauthSettingsForm).entries());
  try {
    const setting = await saveIntegrationSettingOnApi(payload);
    const existingIndex = state.integrationSettings.findIndex((item) => item.provider === setting.provider);
    if (existingIndex >= 0) state.integrationSettings.splice(existingIndex, 1, setting);
    else state.integrationSettings.push(setting);
    state.integrations[setting.provider] = setting.status === "connected" || setting.status === "ready";
    logActivity(`${setting.provider === "gmail" ? "Gmail" : "Outlook"} OAuth ayarÄ± kaydedildi.`);
  } catch {
    logActivity("OAuth ayarÄ± kaydedilemedi. YÃ¶netici yetkisi gerekebilir.");
  }
  render();
});

document.querySelector("#newDealButton").addEventListener("click", () => {
  dealForm.reset();
  dealDialog.showModal();
});

dealForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const formData = new FormData(dealForm);
  addDeal(Object.fromEntries(formData.entries()));
  dealDialog.close();
});

searchInput.addEventListener("input", renderBoard);

opportunityTable.addEventListener("click", (event) => {
  const row = event.target.closest("[data-table-deal]");
  if (!row) return;
  state.selectedDealId = row.dataset.tableDeal;
  render();
});

document.querySelector("#duplicateButton").addEventListener("click", () => {
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  if (!deal) return;
  addDeal({
    ...deal,
    company: `${deal.company} kopya`,
    note: `${deal.note || ""} Kopyalanan kayÄ±t.`
  });
});

document.querySelector("#bridgeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  if (!deal) {
    logActivity("GÃ¶nderim iÃ§in fÄ±rsat seÃ§ilmedi.");
    render();
    return;
  }
  const target = document.querySelector("#bridgeTarget").value;
  const endpoint = document.querySelector("#bridgeEndpoint").value || "taslak uÃ§ nokta";
  logActivity(`${deal.company} verisi ${target} hedefine gÃ¶nderildi: ${endpoint}.`);
  render();
});

document.querySelector("#receiveButton").addEventListener("click", () => {
  addDeal({
    contact: "Yeni API KiÅŸisi",
    company: "Webhook KaydÄ±",
    email: "lead@webhook.example",
    value: 59000,
    source: document.querySelector("#bridgeTarget").value,
    owner: "Otomasyon",
    note: "Veri kÃ¶prÃ¼sÃ¼nden alÄ±nan Ã¶rnek kayÄ±t."
  });
});

document.querySelectorAll("[data-connect]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.connect;
    state.integrations[key] = true;
    logActivity(`${key === "gmail" ? "Gmail" : "Outlook"} baÄŸlantÄ±sÄ± taslak olarak etkinleÅŸti.`);
    render();
  });
});

document.querySelectorAll("[data-calendar-connect]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.calendarConnect;
    state.integrations[key] = true;
    logActivity(`${key === "googleCalendar" ? "Google Calendar" : "Outlook Calendar"} izni taslak olarak etkinleÅŸti.`);
    render();
  });
});

document.querySelector("#syncInboxButton").addEventListener("click", () => {
  logActivity("E-posta senkronizasyonu Ã§alÄ±ÅŸtÄ±rÄ±ldÄ±.");
  render();
});

emailList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-email-id]");
  if (!button) return;
  const email = sampleEmails.find((item) => item.id === button.dataset.emailId);
  if (!email) return;
  const domain = email.from.split("@")[1]?.split(".")[0] || "Yeni firma";
  addDeal({
    contact: email.from.split("@")[0],
    company: domain.charAt(0).toLocaleUpperCase("tr-TR") + domain.slice(1),
    email: email.from,
    value: 45000,
    source: email.channel,
    owner: "E-posta",
    note: email.preview
  });
});

meetingList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-meeting-id]");
  if (!card) return;
  state.selectedMeetingId = card.dataset.meetingId;
  render();
});

document.querySelector("#addMinuteButton").addEventListener("click", () => {
  const text = minuteText.value.trim();
  if (!text) return;
  state.minutes.push({
    id: `minute-${Date.now()}`,
    meetingId: state.selectedMeetingId,
    text
  });
  minuteText.value = "";
  logActivity("ToplantÄ± tutanaÄŸÄ± gÃ¼ncellendi.");
  render();
});

document.querySelector("#actionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  state.actions.push({
    id: `action-${Date.now()}`,
    meetingId: state.selectedMeetingId,
    done: false,
    ...Object.fromEntries(formData.entries())
  });
  event.currentTarget.reset();
  logActivity("Yeni aksiyon maddesi eklendi.");
  render();
});

document.querySelector("#createMeetingDealButton").addEventListener("click", () => {
  const meeting = state.meetings.find((item) => item.id === state.selectedMeetingId);
  if (!meeting) return;
  addDeal({
    contact: meeting.owner,
    company: meeting.title,
    email: "toplanti@argeka.local",
    value: 35000,
    source: "ToplantÄ±",
    owner: meeting.owner,
    probability: 30,
    forecast: "Pipeline",
    nextAction: "ToplantÄ± aksiyonlarÄ±nÄ± takip et",
    note: meeting.agenda.join(", ")
  });
  switchView("pipeline");
});

document.querySelector("#calendarForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  state.calendarEvents.push({
    id: `event-${Date.now()}`,
    dealId: deal?.id || null,
    ...Object.fromEntries(formData.entries())
  });
  event.currentTarget.reset();
  logActivity("Takvim etkinliÄŸi CRM kaydÄ±na eklendi.");
  render();
});

document.querySelector("#createDealCalendarButton").addEventListener("click", () => {
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  if (!deal) return;
  state.calendarEvents.push({
    id: `event-${Date.now()}`,
    title: `${deal.company} satÄ±ÅŸ gÃ¶rÃ¼ÅŸmesi`,
    date: deal.closeDate && deal.closeDate !== "Planlanacak" ? deal.closeDate : "2026-05-12",
    time: "11:00",
    provider: deal.source === "Outlook" ? "Outlook Calendar" : "Google Calendar",
    attendees: deal.email,
    dealId: deal.id
  });
  logActivity(`${deal.company} iÃ§in takvim etkinliÄŸi oluÅŸturuldu.`);
  render();
});

document.querySelector("#downloadIcsButton").addEventListener("click", () => {
  const event = state.calendarEvents[0];
  if (!event) return;
  const ics = createIcs(event);
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "argeka-sync-toplanti.ics";
  anchor.click();
  URL.revokeObjectURL(url);
  logActivity("iOS uyumlu Ã¶rnek ICS dosyasÄ± hazÄ±rlandÄ±.");
  render();
});

function createIcs(event) {
  const compactDate = event.date.replaceAll("-", "");
  const compactTime = event.time.replace(":", "") + "00";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ARGEKA Sync//TR",
    "BEGIN:VEVENT",
    `UID:${event.id}@argeka.local`,
    `DTSTAMP:${compactDate}T${compactTime}`,
    `DTSTART:${compactDate}T${compactTime}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.provider} Ã¼zerinden CRM toplantÄ±sÄ±`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

document.querySelector("#saveRuleButton").addEventListener("click", () => {
  const trigger = document.querySelector("#ruleTrigger").value;
  const action = document.querySelector("#ruleAction").value;
  logActivity(`Kural kaydedildi: ${trigger} â†’ ${action}.`);
  render();
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  const item = document.createElement("li");
  item.textContent = "Checkout oturumu iÃ§in backend uÃ§ noktasÄ± tasarlanacak.";
  billingLog.prepend(item);
  logActivity("Ã–deme sayfasÄ± hazÄ±rlama isteÄŸi oluÅŸturuldu.");
  render();
});

document.querySelector("#clearLogButton").addEventListener("click", () => {
  state.activity = [];
  render();
});

document.querySelector("#exportButton").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "argeka-sync-veri.json";
  anchor.click();
  URL.revokeObjectURL(url);
  logActivity("CRM verisi JSON olarak dÄ±ÅŸa aktarÄ±ldÄ±.");
  render();
});

document.querySelector("#importButton").addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async () => {
  const file = importFile.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed.deals)) throw new Error("deals dizisi yok");
    state.deals = parsed.deals;
    state.selectedDealId = parsed.selectedDealId || parsed.deals[0]?.id || null;
    state.integrations = parsed.integrations || state.integrations;
    state.meetings = parsed.meetings || state.meetings;
    state.selectedMeetingId = parsed.selectedMeetingId || state.meetings[0]?.id || null;
    state.actions = parsed.actions || state.actions;
    state.accounts = parsed.accounts || state.accounts;
    state.contacts = parsed.contacts || state.contacts;
    state.quotes = parsed.quotes || state.quotes;
    state.selectedQuoteId = parsed.selectedQuoteId || state.quotes[0]?.id || null;
    state.tasks = parsed.tasks || state.tasks;
    state.integrationSettings = parsed.integrationSettings || state.integrationSettings;
    state.minutes = parsed.minutes || state.minutes;
    state.calendarEvents = parsed.calendarEvents || state.calendarEvents;
    state.activity = parsed.activity || [];
    logActivity("JSON verisi iÃ§e aktarÄ±ldÄ±.");
    render();
  } catch {
    logActivity("Ä°Ã§e aktarma baÅŸarÄ±sÄ±z oldu.");
    render();
  } finally {
    importFile.value = "";
  }
});

async function downloadAdminExport(format) {
  try {
    const response = await fetch(apiUrl(`/api/admin/export?format=${format}`), {
      headers: state.session?.token ? { authorization: `Bearer ${state.session.token}` } : {}
    });
    if (!response.ok) throw new Error("export failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `argeka-sync-export.${format === "json" ? "json" : format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    logActivity(`${format.toLocaleUpperCase("tr-TR")} aktarÄ±m dosyasÄ± hazÄ±rlandÄ±.`);
  } catch {
    logActivity("AktarÄ±m dosyasÄ± oluÅŸturulamadÄ±.");
  }
  render();
}

function cleanSensitiveQueryParams() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("password") && !url.searchParams.has("email")) return;
  url.searchParams.delete("password");
  url.searchParams.delete("email");
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

async function initApp() {
  cleanSensitiveQueryParams();
  await restoreSession();
  await loadState();
  if (state.session?.token) {
    await syncOpportunitiesFromApi();
    await syncBusinessDataFromApi();
    await syncAdminOverview();
  }
  render();
}

initApp();

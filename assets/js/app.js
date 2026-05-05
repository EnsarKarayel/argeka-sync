const columns = [
  { id: "new", label: "Yeni fırsat", accent: "#087f74" },
  { id: "contacted", label: "Görüşme", accent: "#2d5fa8" },
  { id: "proposal", label: "Teklif", accent: "#b7791f" },
  { id: "won", label: "Kazanıldı", accent: "#247a4a" }
];

const initialDeals = [
  {
    id: "deal-1001",
    contact: "Ayşe Yılmaz",
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
    nextAction: "Demo takvimi gönder",
    note: "Demo isteği ve fiyat bilgisi bekliyor.",
    updatedAt: "Bugün"
  },
  {
    id: "deal-1002",
    contact: "Mehmet Arslan",
    company: "Atlas Lojistik",
    email: "mehmet@atlas.example",
    value: 126000,
    stage: "contacted",
    source: "Outlook",
    owner: "Satış",
    probability: 45,
    closeDate: "2026-05-24",
    forecast: "Best case",
    sector: "Lojistik",
    territory: "TR İç Anadolu",
    nextAction: "Karar vericiyle toplantı",
    note: "Outlook mesajından otomatik fırsat açıldı.",
    updatedAt: "Dün"
  },
  {
    id: "deal-1003",
    contact: "Derya Koç",
    company: "Vera Medikal",
    email: "derya@vera.example",
    value: 212000,
    stage: "proposal",
    source: "Web formu",
    owner: "Ensar",
    probability: 70,
    closeDate: "2026-06-03",
    forecast: "Commit",
    sector: "Sağlık",
    territory: "TR Ege",
    nextAction: "Teklif revizyonu",
    note: "Teklif revizyonu hazırlanacak.",
    updatedAt: "2 gün önce"
  },
  {
    id: "deal-1004",
    contact: "Can Demir",
    company: "Mira Endüstri",
    email: "can@mira.example",
    value: 76000,
    stage: "won",
    source: "API",
    owner: "Operasyon",
    probability: 100,
    closeDate: "2026-05-09",
    forecast: "Closed won",
    sector: "Üretim",
    territory: "TR Marmara",
    nextAction: "ERP aktarımı",
    note: "ERP aktarımı bekleniyor.",
    updatedAt: "3 gün önce"
  }
];

const initialMeetings = [
  {
    id: "meeting-1",
    title: "Haftalık satış komitesi",
    date: "2026-05-06",
    owner: "Ensar",
    attendees: "Satış, Operasyon, Finans",
    agenda: ["Pipeline riski", "Teklif onayları", "Tahsilat ve abonelik"]
  },
  {
    id: "meeting-2",
    title: "Nova Teknoloji demo hazırlığı",
    date: "2026-05-07",
    owner: "Satış",
    attendees: "Ayşe Yılmaz, Teknik ekip",
    agenda: ["İhtiyaç listesi", "Gmail akışı", "Webhook senaryosu"]
  }
];

const initialActions = [
  {
    id: "action-1",
    title: "Nova demo ajandasını paylaş",
    owner: "Ensar",
    due: "2026-05-05",
    priority: "Yüksek",
    meetingId: "meeting-2",
    done: false
  },
  {
    id: "action-2",
    title: "Teklif şablonunu güncelle",
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
    text: "Kapanış ihtimali yüksek fırsatlar için forecast haftalık izlenecek."
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
    title: "Atlas karar verici görüşmesi",
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
    subject: "CRM entegrasyonu için görüşelim",
    channel: "Gmail",
    preview: "Teklif ve demo takvimi için dönüş bekliyoruz."
  },
  {
    id: "mail-2",
    from: "finans@kuzey.example",
    subject: "Teklif onayı",
    channel: "Outlook",
    preview: "Gönderdiğiniz paketi aylık abonelikle başlatmak istiyoruz."
  },
  {
    id: "mail-3",
    from: "it@delta.example",
    subject: "Webhook bağlantısı",
    channel: "API",
    preview: "Yeni fırsatları ERP tarafına aktarmamız gerekiyor."
  }
];

const state = {
  deals: [],
  selectedDealId: null,
  integrations: {
    gmail: false,
    outlook: false,
    googleCalendar: false,
    outlookCalendar: false
  },
  meetings: [],
  selectedMeetingId: null,
  actions: [],
  minutes: [],
  calendarEvents: [],
  activity: []
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
const meetingList = document.querySelector("#meetingList");
const actionList = document.querySelector("#actionList");
const minuteList = document.querySelector("#minuteList");
const minuteText = document.querySelector("#minuteText");
const calendarAgenda = document.querySelector("#calendarAgenda");
const dealDialog = document.querySelector("#dealDialog");
const dealForm = document.querySelector("#dealForm");
const importFile = document.querySelector("#importFile");
const databaseConfig = {
  name: "akis-crm-db",
  version: 1,
  store: "records",
  key: "state"
};

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
    const saved = localStorage.getItem("akis-crm-state");
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
  localStorage.setItem("akis-crm-state", JSON.stringify(value));
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
    state.minutes = initialMinutes;
    state.calendarEvents = initialCalendarEvents;
    state.activity = ["MVP çalışma alanı hazırlandı."];
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
    state.minutes = Array.isArray(parsed.minutes) ? parsed.minutes : initialMinutes;
    state.calendarEvents = Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : initialCalendarEvents;
    state.activity = Array.isArray(parsed.activity) ? parsed.activity : [];
  } catch {
    state.deals = initialDeals;
    state.selectedDealId = initialDeals[0].id;
    state.meetings = initialMeetings;
    state.selectedMeetingId = initialMeetings[0].id;
    state.actions = initialActions;
    state.minutes = initialMinutes;
    state.calendarEvents = initialCalendarEvents;
    state.activity = ["Kayıtlı veri okunamadı, örnek veri yüklendi."];
  }
}

function saveState() {
  writePersistedState(state);
}

function render() {
  renderBoard();
  renderDetail();
  renderMetrics();
  renderOpportunityTable();
  renderMeetings();
  renderCalendar();
  renderIntegrations();
  renderEmails();
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
  deal.updatedAt = "Az önce";
  state.selectedDealId = deal.id;
  logActivity(`${deal.company} taşındı: ${previous} → ${next}.`);
  render();
}

function renderDetail() {
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  if (!deal) {
    detailPanel.className = "detail-panel empty-state";
    detailPanel.textContent = "Bir fırsat seçin";
    return;
  }

  detailPanel.className = "detail-panel";
  detailPanel.innerHTML = `
    <h2>${escapeHtml(deal.company)}</h2>
    <dl>
      <dt>Kişi</dt><dd>${escapeHtml(deal.contact)}</dd>
      <dt>E-posta</dt><dd>${escapeHtml(deal.email)}</dd>
      <dt>Değer</dt><dd>${formatMoney.format(deal.value)}</dd>
      <dt>Olasılık</dt><dd>%${Number(deal.probability || 0)}</dd>
      <dt>Kapanış</dt><dd>${escapeHtml(deal.closeDate || "Planlanacak")}</dd>
      <dt>Forecast</dt><dd>${escapeHtml(deal.forecast || "Pipeline")}</dd>
      <dt>Sektör</dt><dd>${escapeHtml(deal.sector || "Genel")}</dd>
      <dt>Bölge</dt><dd>${escapeHtml(deal.territory || "TR")}</dd>
      <dt>Kaynak</dt><dd>${escapeHtml(deal.source)}</dd>
      <dt>Sahip</dt><dd>${escapeHtml(deal.owner || "-")}</dd>
      <dt>Sonraki</dt><dd>${escapeHtml(deal.nextAction || "-")}</dd>
      <dt>Not</dt><dd>${escapeHtml(deal.note || "-")}</dd>
    </dl>
  `;
}

function renderOpportunityTable() {
  opportunityTable.innerHTML = "";
  state.deals.forEach((deal) => {
    const row = document.createElement("tr");
    row.dataset.tableDeal = deal.id;
    row.classList.toggle("is-selected", deal.id === state.selectedDealId);
    row.innerHTML = `
      <td><strong>${escapeHtml(deal.company)}</strong><br><small>${escapeHtml(deal.contact)}</small></td>
      <td>${escapeHtml(getStageLabel(deal.stage))}</td>
      <td>
        <span class="probability-bar">
          <span><i style="width: ${Math.min(Number(deal.probability || 0), 100)}%"></i></span>
          <b>%${Number(deal.probability || 0)}</b>
        </span>
      </td>
      <td>${escapeHtml(deal.closeDate || "Planlanacak")}</td>
      <td><span class="source-tag">${escapeHtml(deal.forecast || "Pipeline")}</span></td>
      <td>${escapeHtml(deal.owner || "-")}</td>
    `;
    opportunityTable.appendChild(row);
  });
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

function renderIntegrations() {
  setIntegrationStatus("gmail", state.integrations.gmail);
  setIntegrationStatus("outlook", state.integrations.outlook);
}

function setIntegrationStatus(key, connected) {
  const status = document.querySelector(`#${key}Status`);
  const button = document.querySelector(`[data-connect="${key}"]`);
  status.textContent = connected ? "Bağlı" : "Bağlı değil";
  status.classList.toggle("is-connected", connected);
  button.textContent = connected ? "Bağlantıyı yenile" : `${key === "gmail" ? "Gmail" : "Outlook"} bağla`;
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
      <button class="secondary-button" type="button" data-email-id="${email.id}">Fırsata dönüştür</button>
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
        <small>${escapeHtml(action.owner)} · ${escapeHtml(action.due)}</small>
      `;
      actionList.appendChild(card);
    });
}

function renderCalendar() {
  calendarAgenda.innerHTML = "";
  document.querySelectorAll("[data-calendar-connect]").forEach((button) => {
    const key = button.dataset.calendarConnect;
    button.textContent = state.integrations[key]
      ? `${button.textContent.replace(" izni", "").replace(" bağlı", "")} bağlı`
      : button.textContent.replace(" bağlı", " izni");
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
          <small>${escapeHtml(event.provider)} · ${escapeHtml(event.attendees || "Katılımcı yok")}</small>
          <span>${escapeHtml(deal ? deal.company : "CRM etkinliği")}</span>
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

function addDeal(deal) {
  state.deals.unshift({
    ...deal,
    id: `deal-${Date.now()}`,
    stage: deal.stage || "new",
    updatedAt: "Az önce",
    value: Number(deal.value || 0),
    probability: Number(deal.probability || 20),
    closeDate: deal.closeDate || "Planlanacak",
    forecast: deal.forecast || "Pipeline",
    sector: deal.sector || "Genel",
    territory: deal.territory || "TR",
    nextAction: deal.nextAction || "İlk temas"
  });
  state.selectedDealId = state.deals[0].id;
  logActivity(`${deal.company} için yeni fırsat açıldı.`);
  render();
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
    pipeline: "Pipeline",
    meetings: "Toplantılar",
    calendar: "Takvim",
    inbox: "E-posta",
    integrations: "Entegrasyon",
    billing: "Abonelik"
  };
  document.querySelector("#view-title").textContent = titleMap[viewId] || "Akis CRM";
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
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
    note: `${deal.note || ""} Kopyalanan kayıt.`
  });
});

document.querySelector("#bridgeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  if (!deal) {
    logActivity("Gönderim için fırsat seçilmedi.");
    render();
    return;
  }
  const target = document.querySelector("#bridgeTarget").value;
  const endpoint = document.querySelector("#bridgeEndpoint").value || "taslak uç nokta";
  logActivity(`${deal.company} verisi ${target} hedefine gönderildi: ${endpoint}.`);
  render();
});

document.querySelector("#receiveButton").addEventListener("click", () => {
  addDeal({
    contact: "Yeni API Kişisi",
    company: "Webhook Kaydı",
    email: "lead@webhook.example",
    value: 59000,
    source: document.querySelector("#bridgeTarget").value,
    owner: "Otomasyon",
    note: "Veri köprüsünden alınan örnek kayıt."
  });
});

document.querySelectorAll("[data-connect]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.connect;
    state.integrations[key] = true;
    logActivity(`${key === "gmail" ? "Gmail" : "Outlook"} bağlantısı taslak olarak etkinleşti.`);
    render();
  });
});

document.querySelectorAll("[data-calendar-connect]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.calendarConnect;
    state.integrations[key] = true;
    logActivity(`${key === "googleCalendar" ? "Google Calendar" : "Outlook Calendar"} izni taslak olarak etkinleşti.`);
    render();
  });
});

document.querySelector("#syncInboxButton").addEventListener("click", () => {
  logActivity("E-posta senkronizasyonu çalıştırıldı.");
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
  logActivity("Toplantı tutanağı güncellendi.");
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
    email: "toplanti@akis-crm.local",
    value: 35000,
    source: "Toplantı",
    owner: meeting.owner,
    probability: 30,
    forecast: "Pipeline",
    nextAction: "Toplantı aksiyonlarını takip et",
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
  logActivity("Takvim etkinliği CRM kaydına eklendi.");
  render();
});

document.querySelector("#createDealCalendarButton").addEventListener("click", () => {
  const deal = state.deals.find((item) => item.id === state.selectedDealId);
  if (!deal) return;
  state.calendarEvents.push({
    id: `event-${Date.now()}`,
    title: `${deal.company} satış görüşmesi`,
    date: deal.closeDate && deal.closeDate !== "Planlanacak" ? deal.closeDate : "2026-05-12",
    time: "11:00",
    provider: deal.source === "Outlook" ? "Outlook Calendar" : "Google Calendar",
    attendees: deal.email,
    dealId: deal.id
  });
  logActivity(`${deal.company} için takvim etkinliği oluşturuldu.`);
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
  anchor.download = "akis-crm-toplanti.ics";
  anchor.click();
  URL.revokeObjectURL(url);
  logActivity("iOS uyumlu örnek ICS dosyası hazırlandı.");
  render();
});

function createIcs(event) {
  const compactDate = event.date.replaceAll("-", "");
  const compactTime = event.time.replace(":", "") + "00";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Akis CRM//TR",
    "BEGIN:VEVENT",
    `UID:${event.id}@akis-crm.local`,
    `DTSTAMP:${compactDate}T${compactTime}`,
    `DTSTART:${compactDate}T${compactTime}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.provider} üzerinden CRM toplantısı`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

document.querySelector("#saveRuleButton").addEventListener("click", () => {
  const trigger = document.querySelector("#ruleTrigger").value;
  const action = document.querySelector("#ruleAction").value;
  logActivity(`Kural kaydedildi: ${trigger} → ${action}.`);
  render();
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  const item = document.createElement("li");
  item.textContent = "Checkout oturumu için backend uç noktası tasarlanacak.";
  billingLog.prepend(item);
  logActivity("Ödeme sayfası hazırlama isteği oluşturuldu.");
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
  anchor.download = "akis-crm-veri.json";
  anchor.click();
  URL.revokeObjectURL(url);
  logActivity("CRM verisi JSON olarak dışa aktarıldı.");
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
    state.minutes = parsed.minutes || state.minutes;
    state.calendarEvents = parsed.calendarEvents || state.calendarEvents;
    state.activity = parsed.activity || [];
    logActivity("JSON verisi içe aktarıldı.");
    render();
  } catch {
    logActivity("İçe aktarma başarısız oldu.");
    render();
  } finally {
    importFile.value = "";
  }
});

async function initApp() {
  await loadState();
  render();
}

initApp();

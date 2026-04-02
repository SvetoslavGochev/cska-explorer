const LOCAL_CACHE_KEY = "cska_explorer_root_cache_v1";
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000;

const FALLBACK_DATA = {
  source: { note: "Fallback data loaded." },
  standings: [],
  cska: {
    nextMatches: [],
    lastResults: [],
    squad: {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: []
    }
  }
};

function isValidPayload(payload) {
  return Boolean(payload && Array.isArray(payload.standings) && payload.standings.length);
}

function renderStandings(standings) {
  const body = document.querySelector("#standingsTable tbody");
  body.innerHTML = "";

  standings.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.rank ?? "-"}</td>
      <td>${row.team ?? "-"}</td>
      <td>${row.mp ?? "-"}</td>
      <td>${row.w ?? "-"}</td>
      <td>${row.d ?? "-"}</td>
      <td>${row.l ?? "-"}</td>
      <td>${row.gf ?? "-"}:${row.ga ?? "-"}</td>
      <td><strong>${row.pts ?? "-"}</strong></td>
    `;
    body.appendChild(tr);
  });
}

function renderMatches(id, rows, formatter) {
  const list = document.getElementById(id);
  list.innerHTML = "";

  rows.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = formatter(m);
    list.appendChild(li);
  });
}

function renderSquad(squad) {
  const groups = [
    ["Вратари", squad.goalkeepers || []],
    ["Защитници", squad.defenders || []],
    ["Халфове", squad.midfielders || []],
    ["Нападатели", squad.forwards || []]
  ];

  const root = document.getElementById("squadGrid");
  root.innerHTML = "";

  groups.forEach(([title, players]) => {
    const wrap = document.createElement("div");
    wrap.className = "squad-group";

    const heading = document.createElement("h3");
    heading.textContent = title;
    wrap.appendChild(heading);

    const ul = document.createElement("ul");
    ul.className = "list";
    players.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = player;
      ul.appendChild(li);
    });

    wrap.appendChild(ul);
    root.appendChild(wrap);
  });
}

function render(payload, fromCache) {
  renderStandings(payload.standings || []);

  renderMatches(
    "nextMatches",
    payload.cska?.nextMatches || [],
    (m) => `${m.date} ${m.time} | ${m.home} - ${m.away}`
  );

  renderMatches(
    "lastResults",
    payload.cska?.lastResults || [],
    (m) => `${m.date} | ${m.home} ${m.score} ${m.away}`
  );

  renderSquad(payload.cska?.squad || FALLBACK_DATA.cska.squad);

  const sourceNote = document.getElementById("sourceNote");
  const statusLine = document.getElementById("statusLine");

  sourceNote.textContent = payload.source?.note || "";
  statusLine.textContent = fromCache
    ? "Показани са данни от локалния кеш (без нова заявка)."
    : "Показани са последните данни.";
}

async function fetchFreshData() {
  try {
    const res = await fetch("data/bootstrap-data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No bootstrap data");
    const payload = await res.json();
    if (!isValidPayload(payload)) throw new Error("Invalid payload");
    return payload;
  } catch {
    return FALLBACK_DATA;
  }
}

async function init() {
  const now = Date.now();
  const cachedRaw = localStorage.getItem(LOCAL_CACHE_KEY);

  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (cached.expiresAt > now && isValidPayload(cached.payload)) {
        render(cached.payload, true);
      }
    } catch {
      localStorage.removeItem(LOCAL_CACHE_KEY);
    }
  }

  const fresh = await fetchFreshData();
  if (isValidPayload(fresh)) {
    localStorage.setItem(
      LOCAL_CACHE_KEY,
      JSON.stringify({ payload: fresh, expiresAt: now + LOCAL_CACHE_TTL_MS })
    );
  }

  render(fresh, false);
}

init();

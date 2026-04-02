const LOCAL_CACHE_KEY = "cska_explorer_root_cache_v3";
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

const TEAM_LOGOS = {
  "Левски София": "https://static.flashscore.com/res/image/data/hOa8FKR0-zeLrkjui.png",
  "Лудогорец": "https://static.flashscore.com/res/image/data/KG84D6Rq-Kjkd1Ayp.png",
  "ЦСКА 1948": "https://static.flashscore.com/res/image/data/CrPTEUT0-dIoxO1fK.png",
  "ЦСКА София": "https://static.flashscore.com/res/image/data/MZmpVA7k-nTkb2fj6.png",
  "Черно море": "https://static.flashscore.com/res/image/data/GrK5iugT-tjkFB7mQ.png",
  "Арда": "https://static.flashscore.com/res/image/data/UwKU0w86-8huEu0wU.png",
  "Ботев Пловдив": "https://static.flashscore.com/res/image/data/KKH0khRq-UVZMFjiK.png",
  "Локомотив Пловдив": "https://static.flashscore.com/res/image/data/zNR5wyBN-CrHFHNPj.png",
  "Локомотив София": "https://static.flashscore.com/res/image/data/KbTwOMkC-0xN9676E.png",
  "Славия София": "https://static.flashscore.com/res/image/data/IgY8NX7k-rXOMwTEr.png",
  "Ботев Враца": "https://static.flashscore.com/res/image/data/nku6ne8k-vTHHOmI9.png",
  "Добруджа": "https://static.flashscore.com/res/image/data/Y1cNNK5k-bspvajO9.png",
  "Спартак Варна": "https://static.flashscore.com/res/image/data/6TetCWBN-boO56d81.png",
  "Берое": "https://static.flashscore.com/res/image/data/xpH48q86-fmfS2lRL.png",
  "Септември София": "https://static.flashscore.com/res/image/data/G8c1lpgT-Oj0MPYxU.png",
  "Монтана": "https://static.flashscore.com/res/image/data/QLieRNR0-COvJNbKS.png",
};

const FULL_EFBET_TEAMS = [
  "Левски София",
  "Лудогорец",
  "ЦСКА 1948",
  "ЦСКА София",
  "Черно море",
  "Арда",
  "Ботев Пловдив",
  "Локомотив Пловдив",
  "Локомотив София",
  "Славия София",
  "Добруджа",
  "Спартак Варна",
  "Берое",
  "Септември София",
  "Монтана",
  "Ботев Враца"
];

function isValidPayload(payload) {
  return Boolean(payload && Array.isArray(payload.standings) && payload.standings.length);
}

function getTeamLogo(team) {
  return TEAM_LOGOS[team] || "";
}

function buildFullStandings(standings) {
  const byTeam = new Map((standings || []).map((row) => [row.team, row]));
  const maxKnownRank = Math.max(0, ...((standings || []).map((r) => Number(r.rank) || 0)));
  let nextRank = maxKnownRank + 1;

  return FULL_EFBET_TEAMS.map((team) => {
    const existing = byTeam.get(team);
    if (existing) return existing;

    const row = {
      rank: nextRank,
      team,
      mp: "-",
      w: "-",
      d: "-",
      l: "-",
      gf: "-",
      ga: "-",
      gd: "-",
      pts: "-"
    };
    nextRank += 1;
    return row;
  });
}

function renderStandings(standings) {
  const body = document.querySelector("#standingsTable tbody");
  body.innerHTML = "";

  standings.forEach((row) => {
    const logo = getTeamLogo(row.team);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.rank ?? "-"}</td>
      <td>
        <div class="team-cell">
          ${logo ? `<img class="team-logo" src="${logo}" alt="${row.team}" loading="lazy" />` : ""}
          <span title="${row.team ?? "-"}">${row.team ?? "-"}</span>
        </div>
      </td>
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
    li.innerHTML = formatter(m);
    list.appendChild(li);
  });
}

function matchMarkup(match, withScore) {
  const homeLogo = getTeamLogo(match.home);
  const awayLogo = getTeamLogo(match.away);

  return `
    <div class="match-item">
      <div class="match-meta">${match.date} ${match.time || ""}</div>
      <div class="match-lineup">
        <span class="team-chip" title="${match.home}">${homeLogo ? `<img class="team-logo" src="${homeLogo}" alt="${match.home}" loading="lazy" />` : ""}${match.home}</span>
        <span class="vs-chip">${withScore ? match.score : "-"}</span>
        <span class="team-chip" title="${match.away}">${awayLogo ? `<img class="team-logo" src="${awayLogo}" alt="${match.away}" loading="lazy" />` : ""}${match.away}</span>
      </div>
    </div>
  `;
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
  const fullStandings = buildFullStandings(payload.standings || []);
  renderStandings(fullStandings);

  renderMatches(
    "nextMatches",
    payload.cska?.nextMatches || [],
    (m) => matchMarkup(m, false)
  );

  renderMatches(
    "lastResults",
    payload.cska?.lastResults || [],
    (m) => matchMarkup(m, true)
  );

  renderSquad(payload.cska?.squad || FALLBACK_DATA.cska.squad);

  const sourceNote = document.getElementById("sourceNote");
  const statusLine = document.getElementById("statusLine");

  const baseNote = payload.source?.note || "";
  sourceNote.textContent = `${baseNote} В таблицата липсващите статистики се допълват с "-".`.trim();
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

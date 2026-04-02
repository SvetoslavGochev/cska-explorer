const LOCAL_CACHE_KEY = "cska_explorer_root_cache_v10";
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
  "Локо Пловдив",
  "Локо София",
  "Славия София",
  "Добруджа",
  "Спартак Варна",
  "Берое",
  "Септември София",
  "Монтана",
  "Ботев Враца"
];

const TEAM_NAME_ALIASES = {
  "Локо Пловдив": "Локомотив Пловдив",
  "Локо София": "Локомотив София"
};

function isValidPayload(payload) {
  return Boolean(payload && Array.isArray(payload.standings) && payload.standings.length);
}

function normalizeTeamName(team) {
  return TEAM_NAME_ALIASES[team] || team;
}

function getTeamLogo(team) {
  return TEAM_LOGOS[normalizeTeamName(team)] || "";
}

function buildFullStandings(standings) {
  const byTeam = new Map(
    (standings || []).map((row) => [normalizeTeamName(row.team), row])
  );
  const maxKnownRank = Math.max(0, ...((standings || []).map((r) => Number(r.rank) || 0)));
  let nextRank = maxKnownRank + 1;

  return FULL_EFBET_TEAMS.map((team) => {
    const existing = byTeam.get(team);
    if (existing) {
      return {
        ...existing,
        team
      };
    }

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

function sortStandingsByRank(standings) {
  return [...(standings || [])].sort((left, right) => {
    const leftRank = Number(left?.rank) || Number.MAX_SAFE_INTEGER;
    const rightRank = Number(right?.rank) || Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}

function renderStandings(standings) {
  const body = document.querySelector("#standingsTable tbody");
  body.innerHTML = "";

  sortStandingsByRank(standings).forEach((row) => {
    const logo = getTeamLogo(row.team);
    const tr = document.createElement("tr");
    const rank = Number(row.rank);
    if (rank === 1) tr.classList.add("zone-champion");
    else if (rank === 2) tr.classList.add("zone-ucl");
    else if (rank === 3) tr.classList.add("zone-uel");
    else if (rank >= 4 && rank <= 5) tr.classList.add("zone-uecl");
    else if (rank === 14) tr.classList.add("zone-playoff");
    else if (rank >= 15) tr.classList.add("zone-rel");
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
      const name = typeof player === "object" ? player.name : player;
      const num  = typeof player === "object" ? player.number : null;
      const matches = Number(typeof player === "object" ? player.matches : NaN);
      const goals = Number(typeof player === "object" ? player.goals : NaN);
      const assists = Number(typeof player === "object" ? player.assists : NaN);
      const hattricks = Number(typeof player === "object" ? player.hattricks : NaN);
      const savesPerMatch = Number(typeof player === "object" ? player.savesPerMatch : NaN);
      const penaltiesSaved = Number(typeof player === "object" ? player.penaltiesSaved : NaN);
      const goalPerMatch = Number.isFinite(matches) && matches > 0 && Number.isFinite(goals)
        ? (goals / matches).toFixed(2)
        : "-";
      const safeMatches = Number.isFinite(matches) ? matches : "-";
      const safeGoals = Number.isFinite(goals) ? goals : "-";
      const safeAssists = Number.isFinite(assists) ? assists : "-";
      const safeHattricks = Number.isFinite(hattricks) ? hattricks : 0;
      const impactScore =
        (Number.isFinite(matches) ? matches * 0.25 : 0) +
        (Number.isFinite(assists) ? assists * 0.5 : 0) +
        (Number.isFinite(goals) ? goals * 1 : 0) +
        (safeHattricks * 2);

      li.innerHTML = `
        ${num != null ? `<span class="jersey-num">${num}</span>` : ""}
        <div class="player-meta">
          <span class="player-name">${name}</span>
          <span class="player-stats">
            <span class="stat-chip"><span class="stat-label">Мачове</span><span class="stat-value">${safeMatches}</span></span>
            <span class="stat-chip"><span class="stat-label">Голове</span><span class="stat-value">${safeGoals}</span></span>
            <span class="stat-chip"><span class="stat-label">Асист.</span><span class="stat-value">${safeAssists}</span></span>
            <span class="stat-chip"><span class="stat-label">Г/М</span><span class="stat-value">${goalPerMatch}</span></span>
            ${title === "Вратари" ? `<span class="stat-chip"><span class="stat-label">Спасяв./М</span><span class="stat-value">${Number.isFinite(savesPerMatch) ? savesPerMatch.toFixed(2) : "-"}</span></span>` : ""}
            ${title === "Вратари" ? `<span class="stat-chip"><span class="stat-label">Спас. дузпи</span><span class="stat-value">${Number.isFinite(penaltiesSaved) ? penaltiesSaved : "-"}</span></span>` : ""}
            <span class="stat-chip"><span class="stat-label">КПД</span><span class="stat-value">${impactScore > 0 ? impactScore.toFixed(2) : "-"}</span></span>
          </span>
        </div>
      `;
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

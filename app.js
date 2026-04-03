const LOCAL_CACHE_KEY = "cska_explorer_root_cache_v10";
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000;
const LANGUAGE_KEY = "cska_site_language";

const I18N = {
  bg: {
    standingsTitle: "Efbet Лига - Класиране",
    thTeam: "Отбор",
    thMP: "М",
    thW: "П",
    thD: "Р",
    thL: "З",
    thGD: "ГР",
    thPTS: "Т",
    legendChampion: "Шампион / КЛ",
    legendUcl: "КЛ квалификации",
    legendUel: "ЛЕ квалификации",
    legendUecl: "КЛЕ квалификации",
    legendPlayoff: "Бараж",
    legendRel: "Изпадане",
    sourcePrefix: "Източник:",
    nextMatchesTitle: "Следващи мачове на ЦСКА",
    todayMatchesTitle: "Мачове днес",
    lastResultsTitle: "Последни резултати",
    squadTitle: "Състав на ЦСКА София",
    groupGoalkeepers: "Вратари",
    groupDefenders: "Защитници",
    groupMidfielders: "Халфове",
    groupForwards: "Нападатели",
    statMatches: "Мачове",
    statGoals: "Голове",
    statAssists: "Асист.",
    statGoalsPerMatch: "Г/М",
    statSavesPerMatch: "Спасяв./М",
    statPenaltiesSaved: "Спас. дузпи",
    statImpact: "КПД",
    impactFormula: "КПД = (Мачове x 0.25) + (Асист. x 0.5) + (Голове x 1) + (Хеттрици x 2).",
    sourceRefreshLabel: "Обновяване:",
    sourceValidationLabel: "Валидиране:",
    sourceMissingStatsLabel: "Липсващи данни:",
    sourceImpactLabel: "Формула КПД:",
    warnStandingsFallback: "Класиране (fallback)",
    warnLastResultsFallback: "Последни резултати (fallback)",
    warnNextMatchesFallback: "Следващи мачове (fallback)",
    warnStandingsFetchFailed: "Класиране (грешка при заявка)",
    warnLastResultsFetchFailed: "Последни резултати (грешка при заявка)",
    warnNextMatchesFetchFailed: "Следващи мачове (грешка при заявка)",
    footerDisclaimer: "Този сайт е създаден с учебна цел. Данните са информативни и е възможно да има разминавания при автоматичното обновяване.",
    sourceMissingStats: "В таблицата липсващите статистики се допълват с \"-\".",
    statusFromCache: "Показани са данни от локалния кеш (без нова заявка).",
    statusLatest: "Показани са последните данни.",
    noMatchesToday: "Няма мачове за днес",
    stadiumLabel: "Стадион:",
    foundedLabel: "Основан:",
    cskaNotes: "Форма:"
  },
  en: {
    standingsTitle: "Efbet League - Standings",
    thTeam: "Team",
    thMP: "MP",
    thW: "W",
    thD: "D",
    thL: "L",
    thGD: "GD",
    thPTS: "PTS",
    legendChampion: "Champion / UCL",
    legendUcl: "UCL qualification",
    legendUel: "UEL qualification",
    legendUecl: "UECL qualification",
    legendPlayoff: "Playoff",
    legendRel: "Relegation",
    sourcePrefix: "Source:",
    nextMatchesTitle: "Upcoming CSKA Matches",
    todayMatchesTitle: "Matches Today",
    lastResultsTitle: "Recent Results",
    squadTitle: "CSKA Sofia Squad",
    groupGoalkeepers: "Goalkeepers",
    groupDefenders: "Defenders",
    groupMidfielders: "Midfielders",
    groupForwards: "Forwards",
    statMatches: "Matches",
    statGoals: "Goals",
    statAssists: "Assists",
    statGoalsPerMatch: "G/Match",
    statSavesPerMatch: "Saves/Match",
    statPenaltiesSaved: "Pens Saved",
    statImpact: "Impact",
    impactFormula: "Impact = (Matches x 0.25) + (Assists x 0.5) + (Goals x 1) + (Hattricks x 2).",
    sourceRefreshLabel: "Refresh:",
    sourceValidationLabel: "Validation:",
    sourceMissingStatsLabel: "Missing data:",
    sourceImpactLabel: "Impact formula:",
    warnStandingsFallback: "Standings (fallback)",
    warnLastResultsFallback: "Last results (fallback)",
    warnNextMatchesFallback: "Next matches (fallback)",
    warnStandingsFetchFailed: "Standings (fetch failed)",
    warnLastResultsFetchFailed: "Last results (fetch failed)",
    warnNextMatchesFetchFailed: "Next matches (fetch failed)",
    footerDisclaimer: "This site was created for educational purposes. The data is informational and discrepancies may occur during automatic updates.",
    sourceMissingStats: "Missing statistics are shown as \"-\" in the table.",
    statusFromCache: "Showing data from local cache (without a new request).",
    statusLatest: "Showing the latest data.",
    noMatchesToday: "No matches today",
    stadiumLabel: "Stadium:",
    foundedLabel: "Founded:",
    cskaNotes: "Form:"
  }
};

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "bg";
let lastPayload = null;
let lastFromCache = false;

function t(key) {
  return I18N[currentLanguage]?.[key] || I18N.bg[key] || key;
}

function applyLanguageUI() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const selected = btn.dataset.lang === currentLanguage;
    btn.classList.toggle("is-active", selected);
    btn.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function setupLanguageSwitch() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosen = btn.dataset.lang === "en" ? "en" : "bg";
      if (chosen === currentLanguage) return;
      currentLanguage = chosen;
      localStorage.setItem(LANGUAGE_KEY, chosen);
      applyLanguageUI();
      if (lastPayload) {
        render(lastPayload, lastFromCache);
      }
    });
  });
}

function localizeValidationWarning(rawWarning) {
  const warning = String(rawWarning || "").trim().toLowerCase();
  const warningMap = {
    "standings fallback kept": t("warnStandingsFallback"),
    "lastresults fallback kept": t("warnLastResultsFallback"),
    "nextmatches fallback kept": t("warnNextMatchesFallback"),
    "standings fetch failed": t("warnStandingsFetchFailed"),
    "lastresults fetch failed": t("warnLastResultsFetchFailed"),
    "nextmatches fetch failed": t("warnNextMatchesFetchFailed")
  };

  return warningMap[warning] || rawWarning;
}

function parseValidationWarnings(note) {
  const match = String(note || "").match(/validation \(([^)]+)\)/i);
  if (!match || !match[1]) {
    return [];
  }
  return match[1].split(",").map((item) => item.trim()).filter(Boolean);
}

function renderSourceNote(baseNote) {
  const sourceNote = document.getElementById("sourceNote");
  if (!sourceNote) return;

  sourceNote.innerHTML = "";

  const lines = [];
  lines.push(`${t("sourceMissingStatsLabel")} ${t("sourceMissingStats")}`);
  lines.push(`${t("sourceImpactLabel")} ${t("impactFormula")}`);

  lines.forEach((line) => {
    const row = document.createElement("span");
    row.className = "source-note-line";
    row.textContent = line;
    sourceNote.appendChild(row);
  });
}

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

const TEAM_NAME_ALIASES = {
  "Локо Пловдив": "Локомотив Пловдив",
  "Локо София": "Локомотив София"
};

const TEAM_DISPLAY_ALIASES = {
  "Локомотив Пловдив": "Локо Пловдив",
  "Локомотив София": "Локо София"
};

function isValidPayload(payload) {
  return Boolean(payload && Array.isArray(payload.standings) && payload.standings.length);
}

function normalizeTeamName(team) {
  return TEAM_NAME_ALIASES[team] || team;
}

function formatTeamDisplayName(team) {
  return TEAM_DISPLAY_ALIASES[team] || team;
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
          <span class="standings-team-bubble" title="${row.team ?? "-"}">${formatTeamDisplayName(row.team ?? "-")}</span>
        </div>
      </td>
      <td><span class="standings-stat-bubble">${row.mp ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.w ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.d ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.l ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.gf ?? "-"}:${row.ga ?? "-"}</span></td>
      <td><span class="standings-stat-bubble standings-stat-bubble-strong">${row.pts ?? "-"}</span></td>
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
  const extra = [match.round, match.venue].filter(Boolean).join(" · ");

  return `
    <div class="match-item">
      <div class="match-meta">${match.date}${match.time ? ` ${match.time}` : ""}${extra ? `<span class="match-sub">${extra}</span>` : ""}</div>
      <div class="match-lineup">
        <span class="team-chip" title="${match.home}">${homeLogo ? `<img class="team-logo" src="${homeLogo}" alt="${match.home}" loading="lazy" />` : ""}${match.home}</span>
        <span class="vs-chip">${withScore ? match.score : "-"}</span>
        <span class="team-chip" title="${match.away}">${awayLogo ? `<img class="team-logo" src="${awayLogo}" alt="${match.away}" loading="lazy" />` : ""}${match.away}</span>
      </div>
    </div>
  `;
}

function todayKey() {
  return new Date().toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit"
  }).replace(/\//g, ".");
}

function buildTodayMatchesRows(cska) {
  const explicitTodayMatches = Array.isArray(cska?.todayMatches) ? cska.todayMatches : [];
  if (explicitTodayMatches.length > 0) {
    return explicitTodayMatches;
  }

  const key = todayKey();
  const fromNext = (cska?.nextMatches || [])
    .filter((m) => String(m?.date || "") === key)
    .map((m) => ({ ...m, kind: "next" }));
  const fromLast = (cska?.lastResults || [])
    .filter((m) => String(m?.date || "") === key)
    .map((m) => ({ ...m, kind: "last" }));

  return [...fromNext, ...fromLast];
}

function renderSquad(squad) {
  const groups = [
    { key: "groupGoalkeepers", players: squad.goalkeepers || [], isGoalkeeper: true },
    { key: "groupDefenders", players: squad.defenders || [], isGoalkeeper: false },
    { key: "groupMidfielders", players: squad.midfielders || [], isGoalkeeper: false },
    { key: "groupForwards", players: squad.forwards || [], isGoalkeeper: false }
  ];

  const root = document.getElementById("squadGrid");
  root.innerHTML = "";

  groups.forEach((group) => {
    const wrap = document.createElement("div");
    wrap.className = "squad-group";

    const heading = document.createElement("h3");
    heading.textContent = t(group.key);
    wrap.appendChild(heading);

    const ul = document.createElement("ul");
    ul.className = "list";
    group.players.forEach((player) => {
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
            <span class="stat-chip"><span class="stat-label">${t("statMatches")}</span><span class="stat-value">${safeMatches}</span></span>
            <span class="stat-chip"><span class="stat-label">${t("statGoals")}</span><span class="stat-value">${safeGoals}</span></span>
            <span class="stat-chip"><span class="stat-label">${t("statAssists")}</span><span class="stat-value">${safeAssists}</span></span>
            <span class="stat-chip"><span class="stat-label">${t("statGoalsPerMatch")}</span><span class="stat-value">${goalPerMatch}</span></span>
            ${group.isGoalkeeper ? `<span class="stat-chip"><span class="stat-label">${t("statSavesPerMatch")}</span><span class="stat-value">${Number.isFinite(savesPerMatch) ? savesPerMatch.toFixed(2) : "-"}</span></span>` : ""}
            ${group.isGoalkeeper ? `<span class="stat-chip"><span class="stat-label">${t("statPenaltiesSaved")}</span><span class="stat-value">${Number.isFinite(penaltiesSaved) ? penaltiesSaved : "-"}</span></span>` : ""}
            <span class="stat-chip"><span class="stat-label">${t("statImpact")}</span><span class="stat-value">${impactScore > 0 ? impactScore.toFixed(2) : "-"}</span></span>
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
  lastPayload = payload;
  lastFromCache = fromCache;

  const fullStandings = buildFullStandings(payload.standings || []);
  renderStandings(fullStandings);

  renderMatches(
    "nextMatches",
    payload.cska?.nextMatches || [],
    (m) => matchMarkup(m, false)
  );

  const todayRows = buildTodayMatchesRows(payload.cska || {});
  renderMatches(
    "todayMatches",
    todayRows.length > 0 ? todayRows : [{ empty: true }],
    (m) => {
      if (m.empty) {
        return `<div class="match-item"><div class="match-meta">${t("noMatchesToday")}</div></div>`;
      }
      return matchMarkup(m, Boolean(m?.score) || m?.kind === "last");
    }
  );

  renderMatches(
    "lastResults",
    payload.cska?.lastResults || [],
    (m) => matchMarkup(m, true)
  );

  const formStripEl = document.getElementById("formStrip");
  if (formStripEl) {
    const lastR = (payload.cska?.lastResults || []).slice(0, 5);
    const dots = lastR.map((m) => {
      const parts = String(m.score || "").split(":");
      const hs = parseInt(parts[0]);
      const as = parseInt(parts[1]);
      if (isNaN(hs) || isNaN(as)) return "?";
      const isHome = /ЦСКА|CSKA/i.test(String(m.home || ""));
      const diff = isHome ? hs - as : as - hs;
      return diff > 0 ? "W" : diff === 0 ? "D" : "L";
    });
    formStripEl.innerHTML = dots.length
      ? `<span class="form-label">${t("cskaNotes")}</span>` + dots.map((r) => `<span class="form-dot form-${r}">${r}</span>`).join("")
      : "";
  }

  renderSquad(payload.cska?.squad || FALLBACK_DATA.cska.squad);

  const teamInfoBarEl = document.getElementById("teamInfoBar");
  if (teamInfoBarEl) {
    const ti = payload.cska?.teamInfo;
    if (ti?.stadium) {
      const parts = [`${t("stadiumLabel")} ${ti.stadium}`];
      if (ti.foundedYear) parts.push(`${t("foundedLabel")} ${ti.foundedYear}`);
      teamInfoBarEl.textContent = parts.join("  ·  ");
    } else {
      teamInfoBarEl.textContent = "";
    }
  }

  const sourceNote = document.getElementById("sourceNote");
  const statusLine = document.getElementById("statusLine");

  const baseNote = payload.source?.note || "";
  renderSourceNote(baseNote);
  statusLine.textContent = fromCache
    ? t("statusFromCache")
    : t("statusLatest");
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
  applyLanguageUI();
  setupLanguageSwitch();

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

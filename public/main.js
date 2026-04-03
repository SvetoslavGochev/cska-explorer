const LOCAL_CACHE_KEY = "cska_site_cache_v3";
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000;
const LANGUAGE_KEY = "cska_site_language";

const I18N = {
  bg: {
    navStandings: "Класиране",
    navMatches: "Мачове",
    navSquad: "Състав",
    heroSubtitle: "Всичко важно за ЦСКА и Efbet Лига на едно място.",
    miniRows: "Редове в класиране",
    miniNextMatch: "Следващ мач",
    miniPlayers: "Футболисти в списък",
    miniUpdated: "Последно авто-обновяване",
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
    sourceMissingStats: "В таблицата липсващите статистики се допълват с \"-\".",
    warnStandingsFallback: "Класиране (fallback)",
    warnLastResultsFallback: "Последни резултати (fallback)",
    warnNextMatchesFallback: "Следващи мачове (fallback)",
    warnStandingsFetchFailed: "Класиране (грешка при заявка)",
    warnLastResultsFetchFailed: "Последни резултати (грешка при заявка)",
    warnNextMatchesFetchFailed: "Следващи мачове (грешка при заявка)",
    noData: "Няма данни",
    statusFromCache: "Показани са данни от локалния кеш (без нова заявка).",
    statusFromServer: "Показани са последните данни от сървъра.",
    errLoadData: "Неуспешно зареждане на данни",
    errInvalidData: "Получени са невалидни/повредени данни. Пробвай форсирано опресняване.",
    errPrefix: "Грешка:",
    noMatchesToday: "Няма мачове за днес"
  },
  en: {
    navStandings: "Standings",
    navMatches: "Matches",
    navSquad: "Squad",
    heroSubtitle: "Everything important about CSKA and the Efbet League in one place.",
    miniRows: "Standings Rows",
    miniNextMatch: "Next Match",
    miniPlayers: "Players Listed",
    miniUpdated: "Last Auto Update",
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
    sourceMissingStats: "Missing statistics are shown as \"-\" in the table.",
    warnStandingsFallback: "Standings (fallback)",
    warnLastResultsFallback: "Last results (fallback)",
    warnNextMatchesFallback: "Next matches (fallback)",
    warnStandingsFetchFailed: "Standings (fetch failed)",
    warnLastResultsFetchFailed: "Last results (fetch failed)",
    warnNextMatchesFetchFailed: "Next matches (fetch failed)",
    noData: "No data",
    statusFromCache: "Showing data from local cache (without a new request).",
    statusFromServer: "Showing the latest data from the server.",
    errLoadData: "Failed to load data",
    errInvalidData: "Received invalid/corrupted data. Try forced refresh.",
    errPrefix: "Error:",
    noMatchesToday: "No matches today"
  }
};

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "bg";
let lastRenderedPayload = null;
let lastRenderedFromLocalCache = false;

function t(key) {
  return I18N[currentLanguage]?.[key] || I18N.bg[key] || key;
}

function getLocale() {
  return currentLanguage === "en" ? "en-GB" : "bg-BG";
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
      if (lastRenderedPayload) {
        render(lastRenderedPayload, lastRenderedFromLocalCache);
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

function isValidPayload(payload) {
  if (!payload || !Array.isArray(payload.standings) || payload.standings.length === 0) {
    return false;
  }

  const firstTeam = String(payload.standings[0]?.team || "");
  if (!firstTeam || firstTeam.includes("����")) {
    return false;
  }

  return true;
}

async function loadData(force = false) {
  const now = Date.now();
  const cachedRaw = localStorage.getItem(LOCAL_CACHE_KEY);

  if (!force && cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (cached.expiresAt > now && isValidPayload(cached.payload)) {
        render(cached.payload, true);
        return;
      }
    } catch (_) {
      // Ignore broken local cache and refetch.
    }

    localStorage.removeItem(LOCAL_CACHE_KEY);
  }

  const endpoint = force ? "/api/data?refresh=1" : "/api/data";
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(t("errLoadData"));
  }

  const payload = await res.json();
  if (!isValidPayload(payload)) {
    throw new Error(t("errInvalidData"));
  }

  localStorage.setItem(
    LOCAL_CACHE_KEY,
    JSON.stringify({ payload, expiresAt: now + LOCAL_CACHE_TTL_MS })
  );
  render(payload, false);
}

function normalizeTeamName(team) {
  if (team === "Локо Пловдив") return "Локомотив Пловдив";
  if (team === "Локо София") return "Локомотив София";
  return team;
}

function formatTeamDisplayName(team) {
  if (team === "Локомотив Пловдив") return "Локо Пловдив";
  if (team === "Локомотив София") return "Локо София";
  return team;
}

function render(data, fromLocalCache) {
  lastRenderedPayload = data;
  lastRenderedFromLocalCache = fromLocalCache;

  const updatedAtEl = document.getElementById("updatedAt");
  const cacheInfoEl = document.getElementById("cacheInfo");
  if (updatedAtEl) {
    updatedAtEl.textContent = `${new Date(data.updatedAt).toLocaleString(getLocale())}`;
  }
  if (cacheInfoEl) {
    cacheInfoEl.textContent = `Кеш: ${data.cache?.source || "unknown"}`;
  }

  const standingsBody = document.querySelector("#standingsTable tbody");
  standingsBody.innerHTML = "";
  [...(data.standings || [])]
    .sort((left, right) => {
      const leftRank = Number(left?.rank) || Number.MAX_SAFE_INTEGER;
      const rightRank = Number(right?.rank) || Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    })
    .forEach((row) => {
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
      <td><span class="standings-team-bubble">${formatTeamDisplayName(row.team ?? "-")}</span></td>
      <td><span class="standings-stat-bubble">${row.mp ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.w ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.d ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.l ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.gf ?? "-"}:${row.ga ?? "-"}</span></td>
      <td><span class="standings-stat-bubble standings-stat-bubble-strong">${row.pts ?? "-"}</span></td>
    `;
    standingsBody.appendChild(tr);
    });

  const nextMatches = document.getElementById("nextMatches");
  nextMatches.innerHTML = "";
  (data.cska?.nextMatches || []).forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${m.date} ${m.time} | ${m.home} - ${m.away}`;
    nextMatches.appendChild(li);
  });

  const todayKey = new Date().toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit"
  }).replace(/\//g, ".");

  const todayMatches = document.getElementById("todayMatches");
  const explicitTodayMatches = Array.isArray(data.cska?.todayMatches) ? data.cska.todayMatches : [];
  const derivedTodayFromNext = (data.cska?.nextMatches || [])
    .filter((m) => String(m?.date || "") === todayKey)
    .map((m) => ({ ...m, kind: "next" }));
  const derivedTodayFromLast = (data.cska?.lastResults || [])
    .filter((m) => String(m?.date || "") === todayKey)
    .map((m) => ({ ...m, kind: "last" }));
  const mergedTodayMatches = explicitTodayMatches.length > 0
    ? explicitTodayMatches
    : [...derivedTodayFromNext, ...derivedTodayFromLast];

  todayMatches.innerHTML = "";
  if (mergedTodayMatches.length === 0) {
    const li = document.createElement("li");
    li.textContent = t("noMatchesToday");
    todayMatches.appendChild(li);
  } else {
    mergedTodayMatches.forEach((m) => {
      const li = document.createElement("li");
      const isResult = Boolean(m?.score) || m?.kind === "last";
      li.textContent = isResult
        ? `${m.date} | ${m.home} ${m.score ?? "-"} ${m.away}`
        : `${m.date} ${m.time || ""} | ${m.home} - ${m.away}`;
      todayMatches.appendChild(li);
    });
  }

  const lastResults = document.getElementById("lastResults");
  lastResults.innerHTML = "";
  (data.cska?.lastResults || []).forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${m.date} | ${m.home} ${m.score} ${m.away}`;
    lastResults.appendChild(li);
  });

  const squadGrid = document.getElementById("squadGrid");
  squadGrid.innerHTML = "";
  const squad = data.cska?.squad || {};
  const groups = [
    { key: "groupGoalkeepers", players: squad.goalkeepers || [], isGoalkeeper: true },
    { key: "groupDefenders", players: squad.defenders || [], isGoalkeeper: false },
    { key: "groupMidfielders", players: squad.midfielders || [], isGoalkeeper: false },
    { key: "groupForwards", players: squad.forwards || [], isGoalkeeper: false }
  ];

  groups.forEach((group) => {
    const wrap = document.createElement("div");
    wrap.className = "squad-group";
    wrap.innerHTML = `<h3>${t(group.key)}</h3>`;
    const ul = document.createElement("ul");
    ul.className = "list";
    group.players.forEach((p) => {
      const li = document.createElement("li");
      const name = typeof p === "object" ? p.name : p;
      const num = typeof p === "object" ? p.number : null;
      const matches = Number(typeof p === "object" ? p.matches : NaN);
      const goals = Number(typeof p === "object" ? p.goals : NaN);
      const assists = Number(typeof p === "object" ? p.assists : NaN);
      const hattricks = Number(typeof p === "object" ? p.hattricks : NaN);
      const savesPerMatch = Number(typeof p === "object" ? p.savesPerMatch : NaN);
      const penaltiesSaved = Number(typeof p === "object" ? p.penaltiesSaved : NaN);
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
    squadGrid.appendChild(wrap);
  });

  const allPlayersCount = groups.reduce((acc, group) => acc + group.players.length, 0);
  const nextMatch = data.cska?.nextMatches?.[0];

  const statRows = document.getElementById("statRows");
  const statNext = document.getElementById("statNext");
  const statPlayers = document.getElementById("statPlayers");
  const statAutoUpdated = document.getElementById("statAutoUpdated");

  if (statRows) {
    statRows.textContent = String((data.standings || []).length);
  }
  if (statNext) {
    statNext.textContent = nextMatch
      ? `${nextMatch.home} - ${nextMatch.away}`
      : t("noData");
  }
  if (statPlayers) {
    statPlayers.textContent = String(allPlayersCount);
  }
  if (statAutoUpdated) {
    const updatedAt = data?.updatedAt ? new Date(data.updatedAt) : null;
    const source = data?.cache?.source ? ` (${data.cache.source})` : "";
    statAutoUpdated.textContent = updatedAt && !Number.isNaN(updatedAt.getTime())
      ? `${updatedAt.toLocaleString(getLocale())}${source}`
      : t("noData");
  }

  const baseSourceNote = data.source?.note || "";
  renderSourceNote(baseSourceNote);
  document.getElementById("statusLine").textContent = fromLocalCache
    ? t("statusFromCache")
    : t("statusFromServer");
}

async function init() {
  applyLanguageUI();
  setupLanguageSwitch();

  const refreshBtn = document.getElementById("refreshBtn");
  const hardRefreshBtn = document.getElementById("hardRefreshBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await loadData(false);
    });
  }

  if (hardRefreshBtn) {
    hardRefreshBtn.addEventListener("click", async () => {
      await loadData(true);
    });
  }

  try {
    await loadData(false);
  } catch (err) {
    document.getElementById("statusLine").textContent = `${t("errPrefix")} ${err.message}`;
  }
}

init();

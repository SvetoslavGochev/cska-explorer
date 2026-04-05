// Показване на версията във footer-а

import { APP_VERSION, I18N, TEAM_LOGOS, TEAM_NAME_ALIASES, normalizeTeamName, getTeamLogo, formatTeamDisplayName, t } from "./common.js";

function setAppVersion() {
  const el = document.getElementById("appVersion");
  if (el) {
    el.textContent = APP_VERSION;
  }
  const mainVer = document.getElementById("mainVersion");
  if (mainVer) {
    mainVer.textContent = APP_VERSION;
  }
  if (typeof console !== "undefined") {
    console.log(`CSKA Explorer version: ${APP_VERSION}`);
  }
}

const LOCAL_CACHE_KEY = "cska_site_cache_v4";
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000;
const LANGUAGE_KEY = "cska_site_language";

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "bg";
let lastRenderedPayload = null;
let lastRenderedFromLocalCache = false;

function getLocale() {
  return currentLanguage === "en" ? "en-GB" : "bg-BG";
}

function getCountryInitials(countryName) {
  const value = String(countryName || "").trim();
  if (!value) return "";
  const normalized = value.toLowerCase();
  if (normalized.includes("централноафрикан")) return "ЦАР";
  const parts = value
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(0, 3).map((part) => part[0]).join("").toUpperCase();
  }
  const single = parts[0] || value;
  return single.slice(0, 2).toUpperCase();
}

function getPlayerCountryCodeHtml(player) {
  if (!player || typeof player !== "object") return "";
  const code = getCountryInitials(player.countryName);
  if (!code) return "";
  const countryName = String(player.countryName || "").trim();
  const title = countryName || code;
  return `<span class="player-country-code" title="${title}">${code}</span>`;
}

function getPlayerFlagHtml(player) {
  if (!player || typeof player !== "object") return "";
  const flagUrl = String(player.countryFlagUrl || "").trim();
  if (!flagUrl) return "";
  const countryName = String(player.countryName || "").trim();
  const alt = countryName || "flag";
  return `<img class="player-flag" src="${flagUrl}" alt="${alt}" loading="lazy" decoding="async" />`;
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

function formatTeamDisplayName(team) {
  return team;
}

function normalizeTeamName(team) {
  return TEAM_NAME_ALIASES[team] || team;
}

function getTeamLogo(team) {
  return TEAM_LOGOS[normalizeTeamName(team)] || "";
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
    standingsBody.appendChild(tr);
    });

  const nextMatches = document.getElementById("nextMatches");
  nextMatches.innerHTML = "";
  (data.cska?.nextMatches || []).forEach((m) => {
    const li = document.createElement("li");
    const extra = [m.round, m.venue].filter(Boolean).join(" · ");
    li.innerHTML = `<span class="match-line-date">${m.date}${m.time ? ` ${m.time}` : ""}</span>${extra ? `<span class="match-sub">${extra}</span>` : ""}<span class="match-line-teams">${m.home} – ${m.away}</span>`;
    nextMatches.appendChild(li);
  });

  const todayKey = new Date().toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit"
  }).replace(/\//g, ".");


    const todayMatches = document.getElementById("todayMatches");
    todayMatches.innerHTML = '';
    (data.cska?.todayMatches || []).forEach(m => {
      const li = document.createElement('li');
      li.textContent = `${m.date} ${m.time || ''} — ${m.home} vs ${m.away}`;
      todayMatches.appendChild(li);
    });
    if (!data.cska?.todayMatches?.length) todayMatches.innerHTML = '<li>Няма мачове днес</li>';

  const lastResults = document.getElementById("lastResults");
  lastResults.innerHTML = "";
  (data.cska?.lastResults || []).forEach((m) => {
    const li = document.createElement("li");
    const extra = [m.round, m.venue].filter(Boolean).join(" · ");
    li.innerHTML = `<span class="match-line-date">${m.date}</span>${extra ? `<span class="match-sub">${extra}</span>` : ""}<span class="match-line-teams">${m.home} <strong>${m.score}</strong> ${m.away}</span>`;
    lastResults.appendChild(li);
  });

  const formStripEl = document.getElementById("formStrip");
  if (formStripEl) {
    const lastR = (data.cska?.lastResults || []).slice(0, 5);
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
      const flagHtml = getPlayerFlagHtml(p);
      const countryCodeHtml = getPlayerCountryCodeHtml(p);
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
          <span class="player-name"><span class="player-name-wrap">${flagHtml}<span>${name}</span>${countryCodeHtml}</span></span>
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

  const teamInfoBarEl = document.getElementById("teamInfoBar");
  if (teamInfoBarEl) {
    const ti = data.cska?.teamInfo;
    if (ti?.stadium) {
      const parts = [`${t("stadiumLabel")} ${ti.stadium}`];
      if (ti.foundedYear) parts.push(`${t("foundedLabel")} ${ti.foundedYear}`);
      teamInfoBarEl.textContent = parts.join("  ·  ");
    } else {
      teamInfoBarEl.textContent = "";
    }
  }
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

setAppVersion();
init();

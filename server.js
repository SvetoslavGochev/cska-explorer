const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const DAILY_REFRESH_LIMIT = Number(process.env.DAILY_REFRESH_LIMIT || 30);
const AUTO_REFRESH_MINUTES = Number(process.env.AUTO_REFRESH_MINUTES || 45);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 12000);
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const BULGARIAN_LEAGUE_ID = "4626";
const CSKA_TEAM_ID = "134088";

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const CACHE_FILE = path.join(DATA_DIR, "live-cache.json");
const BOOTSTRAP_FILE = path.join(DATA_DIR, "bootstrap-data.json");
const BUDGET_FILE = path.join(DATA_DIR, "request-budget.json");

const TEAM_NAME_MAP = {
  "Arda Kardzhali": "Арда",
  "Beroe": "Берое",
  "Botev Plovdiv": "Ботев Пловдив",
  "Botev Vratsa": "Ботев Враца",
  "CSKA 1948": "ЦСКА 1948",
  "CSKA Sofia": "ЦСКА София",
  "Cherno More": "Черно море",
  "Dobrudzha Dobrich": "Добруджа",
  "Levski Sofia": "Левски София",
  "Lokomotiv Plovdiv": "Локо Пловдив",
  "Lokomotiv Sofia": "Локо София",
  "Ludogorets Razgrad": "Лудогорец",
  "Montana": "Монтана",
  "Septemvri Sofia": "Септември София",
  "Slavia Sofia": "Славия София",
  "Spartak Varna": "Спартак Варна"
};

const EXPECTED_TEAM_KEYS = ["ЦСКА София", "CSKA Sofia", "ЦСКА"];
const KNOWN_EFBET_TEAMS = new Set([
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
  "Ботев Враца",
  "Добруджа",
  "Спартак Варна",
  "Берое",
  "Септември София",
  "Монтана"
]);

const refreshState = {
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastReason: null,
  lastError: null,
  lastUsedFallback: false,
  lastWarnings: []
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getSeasonKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  if (month >= 7) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function translateTeamName(name) {
  const raw = String(name || "").trim();
  return TEAM_NAME_MAP[raw] || raw || "-";
}

function containsExpectedTeam(teamName) {
  const value = String(teamName || "").toLowerCase();
  return EXPECTED_TEAM_KEYS.some((key) => value.includes(String(key).toLowerCase()));
}

function isLikelyEfbetStandings(rows) {
  if (!Array.isArray(rows) || rows.length < 10) {
    return false;
  }

  const hits = rows.reduce((count, row) => {
    return KNOWN_EFBET_TEAMS.has(String(row?.team || "").trim()) ? count + 1 : count;
  }, 0);

  return hits >= 6;
}

function isLikelyCskaMatches(rows) {
  if (!Array.isArray(rows) || rows.length < 3) {
    return false;
  }

  return rows.some((event) => {
    return containsExpectedTeam(event?.home) || containsExpectedTeam(event?.away);
  });
}

function formatEventDate(dateValue) {
  if (!dateValue) return "-";
  const [year, month, day] = String(dateValue).split("-");
  if (!year || !month || !day) return String(dateValue);
  return `${day}.${month}`;
}

function formatEventTime(timeValue) {
  if (!timeValue) return "";
  const time = String(timeValue).split("+")[0].slice(0, 5);
  return /^\d{2}:\d{2}$/.test(time) ? time : "";
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CSKA-Explorer/1.0"
      }
    });
    if (!response.ok) {
      throw new Error(`Upstream ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CSKA-Explorer/1.0"
      }
    });
    if (!response.ok) {
      throw new Error(`Upstream ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractFlashscoreSquadStats(html) {
  const statsByName = new Map();
  const rowRegex = /<div class="lineupTable__row">[\s\S]*?lineupTable__cell--jersey">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--name"[^>]*>\s*([^<]+?)\s*<\/a>[\s\S]*?lineupTable__cell--matchesPlayed">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--goal">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--assist">\s*(\d+)\s*<\/div>/g;

  let match = rowRegex.exec(html);
  while (match) {
    const number = toNumber(match[1], NaN);
    const name = String(match[2] || "").trim();
    const matches = toNumber(match[3], 0);
    const goals = toNumber(match[4], 0);
    const assists = toNumber(match[5], 0);

    if (name && Number.isFinite(number)) {
      const prev = statsByName.get(name);
      if (!prev || matches > prev.matches) {
        statsByName.set(name, { number, matches, goals, assists });
      }
    }

    match = rowRegex.exec(html);
  }

  return statsByName;
}

function extractEfbetTodayMatches(html) {
  const nextRoundMatch = String(html || "").match(/<span class="next_round">([\s\S]*?)<\/span>/i);
  if (!nextRoundMatch || !nextRoundMatch[1]) {
    return [];
  }

  const todayKey = (() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
  })();

  const snippet = nextRoundMatch[1];
  const itemRegex = /(?:(\d{2}\.\d{2})\.\s*)?<a[^>]*>([^<]+?)\s-\s([^<]+?)<\/a>/gi;
  const parsed = [];
  let currentDate = "";
  let match = itemRegex.exec(snippet);

  while (match) {
    if (match[1]) {
      currentDate = match[1];
    }

    const home = String(match[2] || "").trim();
    const away = String(match[3] || "").trim();
    if (currentDate && home && away) {
      parsed.push({
        date: currentDate,
        time: "",
        home,
        away
      });
    }

    match = itemRegex.exec(snippet);
  }

  return parsed.filter((event) => event.date === todayKey).map((event) => ({
    date: event.date,
    time: event.time,
    home: translateTeamName(event.home),
    away: translateTeamName(event.away)
  }));
}

function mergeSquadStats(existingSquad, statsByName) {
  const groups = ["goalkeepers", "defenders", "midfielders", "forwards"];
  const merged = {};

  groups.forEach((group) => {
    const players = Array.isArray(existingSquad?.[group]) ? existingSquad[group] : [];
    merged[group] = players.map((player) => {
      if (!player || typeof player !== "object") {
        return player;
      }
      const name = String(player.name || "").trim();
      const scraped = name ? statsByName.get(name) : null;
      if (!scraped) {
        return player;
      }
      return {
        ...player,
        number: scraped.number,
        matches: scraped.matches,
        goals: scraped.goals,
        assists: scraped.assists
      };
    });
  });

  return merged;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readBudget() {
  const today = getDateKey();

  if (!fs.existsSync(BUDGET_FILE)) {
    return { date: today, used: 0, limit: DAILY_REFRESH_LIMIT };
  }

  const budget = readJson(BUDGET_FILE);
  if (budget.date !== today) {
    return { date: today, used: 0, limit: DAILY_REFRESH_LIMIT };
  }

  return {
    date: budget.date,
    used: Number(budget.used || 0),
    limit: DAILY_REFRESH_LIMIT
  };
}

function writeBudget(budget) {
  ensureDataDir();
  writeJson(BUDGET_FILE, budget);
}

function markRefreshAttempt(reason) {
  refreshState.lastAttemptAt = new Date().toISOString();
  refreshState.lastReason = reason;
}

function markRefreshSuccess(reason, payload) {
  const warnings = Array.isArray(payload?.source?.validation?.warnings)
    ? payload.source.validation.warnings
    : [];

  refreshState.lastSuccessAt = new Date().toISOString();
  refreshState.lastReason = reason;
  refreshState.lastError = null;
  refreshState.lastWarnings = warnings;
  refreshState.lastUsedFallback = warnings.length > 0;
}

function markRefreshFailure(reason, error) {
  refreshState.lastReason = reason;
  refreshState.lastError = String(error?.message || error || "unknown error");
}

function getHealthSnapshot() {
  const now = Date.now();
  const cache = readCache();
  const budget = getBudgetSnapshot();
  const isFresh = Boolean(cache?.expiresAt && cache.expiresAt > now);
  const payload = cache?.payload || null;
  const validation = payload?.source?.validation || { warnings: [], usedFallback: false };

  return {
    status: "ok",
    now: new Date(now).toISOString(),
    autoRefresh: {
      enabled: Number.isFinite(AUTO_REFRESH_MINUTES) && AUTO_REFRESH_MINUTES > 0,
      intervalMinutes: Math.max(5, AUTO_REFRESH_MINUTES)
    },
    cache: {
      exists: Boolean(payload),
      isFresh,
      createdAt: cache?.createdAt ? new Date(cache.createdAt).toISOString() : null,
      expiresAt: cache?.expiresAt ? new Date(cache.expiresAt).toISOString() : null,
      updatedAt: payload?.updatedAt || null,
      sourceNote: payload?.source?.note || null,
      standingsCount: Array.isArray(payload?.standings) ? payload.standings.length : 0,
      nextMatchesCount: Array.isArray(payload?.cska?.nextMatches) ? payload.cska.nextMatches.length : 0,
      lastResultsCount: Array.isArray(payload?.cska?.lastResults) ? payload.cska.lastResults.length : 0
    },
    validation: {
      warnings: Array.isArray(validation.warnings) ? validation.warnings : [],
      usedFallback: Boolean(validation.usedFallback)
    },
    budget: {
      date: budget.date,
      used: budget.used,
      limit: budget.limit,
      remaining: Math.max(budget.limit - budget.used, 0)
    },
    refresh: { ...refreshState }
  };
}

function tryConsumeRefreshBudget() {
  const budget = readBudget();
  if (budget.used >= budget.limit) {
    writeBudget(budget);
    return { allowed: false, budget };
  }

  const next = {
    ...budget,
    used: budget.used + 1
  };
  writeBudget(next);
  return { allowed: true, budget: next };
}

function getBudgetSnapshot() {
  const budget = readBudget();
  writeBudget(budget);
  return budget;
}

function getMime(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

function withCacheMeta(payload, source, budget) {
  const used = Number(budget?.used || 0);
  const limit = Number(budget?.limit || DAILY_REFRESH_LIMIT);

  return {
    ...payload,
    cache: {
      source,
      ttlMinutes: Math.floor(CACHE_TTL_MS / 60000),
      refreshBudget: {
        date: budget?.date || getDateKey(),
        used,
        limit,
        remaining: Math.max(limit - used, 0)
      }
    }
  };
}

async function buildFreshPayloadFromSource() {
  const fallback = readJson(BOOTSTRAP_FILE);
  const season = getSeasonKey();
  const warnings = [];

  const [standingsResult, resultsResult, upcomingResult, squadPageResult, standingsPageResult] = await Promise.allSettled([
    fetchJson(`${SPORTSDB_BASE}/lookuptable.php?l=${BULGARIAN_LEAGUE_ID}&s=${season}`),
    fetchJson(`${SPORTSDB_BASE}/eventslast.php?id=${CSKA_TEAM_ID}`),
    fetchJson(`${SPORTSDB_BASE}/eventsnext.php?id=${CSKA_TEAM_ID}`),
    fetchText(fallback?.source?.squadUrl || "https://www.flashscore.bg/team/cska-sofia/0xFNNECi/squad/"),
    fetchText(fallback?.source?.standingsUrl || "https://www.flashscore.bg/soccer/bulgaria/efbet/#/ID1TwQHr/standings/overall/")
  ]);

  const nextPayload = {
    ...fallback,
    updatedAt: new Date().toISOString(),
    source: {
      ...(fallback.source || {}),
      note: "Automatic server refresh: standings + CSKA matches + squad stats."
    }
  };

  if (standingsResult.status === "fulfilled" && Array.isArray(standingsResult.value?.table)) {
    const parsedStandings = standingsResult.value.table
      .map((row) => ({
        rank: toNumber(row.intRank, 0),
        team: translateTeamName(row.strTeam),
        mp: toNumber(row.intPlayed, 0),
        w: toNumber(row.intWin, 0),
        d: toNumber(row.intDraw, 0),
        l: toNumber(row.intLoss, 0),
        gf: toNumber(row.intGoalsFor, 0),
        ga: toNumber(row.intGoalsAgainst, 0),
        gd: toNumber(row.intGoalDifference, 0),
        pts: toNumber(row.intPoints, 0)
      }))
      .filter((row) => row.rank > 0)
      .sort((a, b) => a.rank - b.rank);

    if (isLikelyEfbetStandings(parsedStandings)) {
      nextPayload.standings = parsedStandings;
    } else {
      warnings.push("standings fallback kept");
      nextPayload.standings = Array.isArray(fallback.standings) ? fallback.standings : [];
    }
  } else {
    warnings.push("standings fetch failed");
    nextPayload.standings = Array.isArray(fallback.standings) ? fallback.standings : [];
  }

  if (!nextPayload.cska) {
    nextPayload.cska = { team: "ЦСКА София", nextMatches: [], lastResults: [], squad: {} };
  }

  if (!Array.isArray(nextPayload.cska.todayMatches)) {
    nextPayload.cska.todayMatches = [];
  }

  if (resultsResult.status === "fulfilled" && Array.isArray(resultsResult.value?.results)) {
    const parsedLastResults = resultsResult.value.results.slice(0, 5).map((event) => ({
      date: formatEventDate(event.dateEvent),
      home: translateTeamName(event.strHomeTeam),
      away: translateTeamName(event.strAwayTeam),
      score: `${event.intHomeScore ?? "-"}:${event.intAwayScore ?? "-"}`
    }));

    if (isLikelyCskaMatches(parsedLastResults)) {
      nextPayload.cska.lastResults = parsedLastResults;
    } else {
      warnings.push("lastResults fallback kept");
      nextPayload.cska.lastResults = Array.isArray(fallback?.cska?.lastResults)
        ? fallback.cska.lastResults
        : [];
    }
  } else {
    warnings.push("lastResults fetch failed");
    nextPayload.cska.lastResults = Array.isArray(fallback?.cska?.lastResults)
      ? fallback.cska.lastResults
      : [];
  }

  if (upcomingResult.status === "fulfilled" && Array.isArray(upcomingResult.value?.events)) {
    const parsedNextMatches = upcomingResult.value.events.slice(0, 5).map((event) => ({
      date: formatEventDate(event.dateEvent),
      time: formatEventTime(event.strTime),
      home: translateTeamName(event.strHomeTeam),
      away: translateTeamName(event.strAwayTeam)
    }));

    if (isLikelyCskaMatches(parsedNextMatches)) {
      nextPayload.cska.nextMatches = parsedNextMatches;
    } else {
      warnings.push("nextMatches fallback kept");
      nextPayload.cska.nextMatches = Array.isArray(fallback?.cska?.nextMatches)
        ? fallback.cska.nextMatches
        : [];
    }
  } else {
    warnings.push("nextMatches fetch failed");
    nextPayload.cska.nextMatches = Array.isArray(fallback?.cska?.nextMatches)
      ? fallback.cska.nextMatches
      : [];
  }

  if (squadPageResult.status === "fulfilled") {
    const statsByName = extractFlashscoreSquadStats(squadPageResult.value);
    nextPayload.cska.squad = mergeSquadStats(nextPayload.cska.squad || fallback.cska?.squad || {}, statsByName);
  }

  if (standingsPageResult.status === "fulfilled") {
    const todayMatches = extractEfbetTodayMatches(standingsPageResult.value);
    nextPayload.cska.todayMatches = todayMatches;
  }

  if (warnings.length > 0) {
    nextPayload.source.note = `Automatic server refresh with validation (${warnings.join(", ")}).`;
  } else {
    nextPayload.source.note = "Automatic server refresh: standings + CSKA matches + squad stats.";
  }

  nextPayload.source.validation = {
    warnings,
    usedFallback: warnings.length > 0
  };

  return nextPayload;
}

function writeCache(payload, now) {
  ensureDataDir();
  writeJson(CACHE_FILE, {
    payload,
    createdAt: now,
    expiresAt: now + CACHE_TTL_MS
  });
}

function readCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    return null;
  }

  const cache = readJson(CACHE_FILE);
  if (!cache?.payload) {
    return null;
  }

  return cache;
}

async function getCachedData(forceRefresh) {
  const now = Date.now();
  const cache = readCache();
  const budgetSnapshot = getBudgetSnapshot();
  const hasCache = Boolean(cache?.payload);
  const isCacheFresh = Boolean(cache && cache.expiresAt > now);

  if (!forceRefresh && isCacheFresh) {
    return withCacheMeta(cache.payload, "server-cache", budgetSnapshot);
  }

  markRefreshAttempt(forceRefresh ? "api-force" : "api-refresh");

  const budgetDecision = tryConsumeRefreshBudget();
  if (!budgetDecision.allowed) {
    if (hasCache) {
      return withCacheMeta(cache.payload, "stale-cache-budget-exhausted", budgetDecision.budget);
    }

    // Absolute fallback if there is no cache yet.
    const payload = await buildFreshPayloadFromSource();
    writeCache(payload, now);
    markRefreshSuccess("api-refresh-budget-exhausted-no-cache", payload);
    return withCacheMeta(payload, "bootstrap-no-cache-budget-exhausted", budgetDecision.budget);
  }

  try {
    const payload = await buildFreshPayloadFromSource();
    writeCache(payload, now);
    writeJson(BOOTSTRAP_FILE, payload);
    markRefreshSuccess(forceRefresh ? "api-force" : "api-refresh", payload);
    const source = forceRefresh ? "forced-refresh" : "refresh-within-budget";
    return withCacheMeta(payload, source, budgetDecision.budget);
  } catch (error) {
    markRefreshFailure(forceRefresh ? "api-force" : "api-refresh", error);
    if (hasCache) {
      return withCacheMeta(cache.payload, "stale-cache-refresh-failed", budgetDecision.budget);
    }

    const payload = await buildFreshPayloadFromSource();
    writeCache(payload, now);
    markRefreshSuccess("api-refresh-fallback-build", payload);
    return withCacheMeta(payload, "bootstrap-refresh-failed", budgetDecision.budget);
  }
}

let autoRefreshRunning = false;

async function runAutoRefresh(reason) {
  if (autoRefreshRunning) {
    return;
  }

  autoRefreshRunning = true;
  try {
    markRefreshAttempt(`auto-${reason}`);
    const budgetDecision = tryConsumeRefreshBudget();
    if (!budgetDecision.allowed) {
      console.log(`[auto-refresh] skipped (${reason}) - budget exhausted`);
      return;
    }

    const payload = await buildFreshPayloadFromSource();
    const now = Date.now();
    writeCache(payload, now);
    writeJson(BOOTSTRAP_FILE, payload);
    markRefreshSuccess(`auto-${reason}`, payload);
    console.log(`[auto-refresh] completed (${reason}) at ${new Date().toISOString()}`);
  } catch (error) {
    markRefreshFailure(`auto-${reason}`, error);
    console.error(`[auto-refresh] failed (${reason}):`, error.message);
  } finally {
    autoRefreshRunning = false;
  }
}

function startAutoRefreshLoop() {
  if (!Number.isFinite(AUTO_REFRESH_MINUTES) || AUTO_REFRESH_MINUTES <= 0) {
    console.log("[auto-refresh] disabled");
    return;
  }

  const intervalMs = Math.max(5, AUTO_REFRESH_MINUTES) * 60 * 1000;
  setInterval(() => {
    runAutoRefresh("interval");
  }, intervalMs);

  setTimeout(() => {
    runAutoRefresh("startup");
  }, 15000);

  console.log(`[auto-refresh] enabled every ${Math.max(5, AUTO_REFRESH_MINUTES)} minutes`);
}
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function serveStatic(req, res) {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";

  const safePath = path.normalize(reqPath).replace(/^\\+/, "");
  const fullPath = path.join(PUBLIC_DIR, safePath);

  if (!fullPath.startsWith(PUBLIC_DIR) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": getMime(fullPath) });
  fs.createReadStream(fullPath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/data") {
    (async () => {
      try {
      const refresh = url.searchParams.get("refresh") === "1";
      const data = await getCachedData(refresh);
      sendJson(res, 200, data);
      } catch (err) {
      sendJson(res, 500, { error: "Cannot load data", details: err.message });
      }
    })();
    return;
  }

  if (url.pathname === "/api/budget") {
    try {
      const budget = getBudgetSnapshot();
      sendJson(res, 200, {
        date: budget.date,
        used: budget.used,
        limit: budget.limit,
        remaining: Math.max(budget.limit - budget.used, 0)
      });
    } catch (err) {
      sendJson(res, 500, { error: "Cannot load budget", details: err.message });
    }
    return;
  }

  if (url.pathname === "/api/health") {
    try {
      sendJson(res, 200, getHealthSnapshot());
    } catch (err) {
      sendJson(res, 500, { error: "Cannot load health", details: err.message });
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`CSKA site running on http://localhost:${PORT}`);
  startAutoRefreshLoop();
});

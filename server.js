const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const DAILY_REFRESH_LIMIT = Number(process.env.DAILY_REFRESH_LIMIT || 15);
const AUTO_REFRESH_MINUTES = Number(process.env.AUTO_REFRESH_MINUTES || 45);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 12000);
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const BULGARIAN_LEAGUE_ID = "4626";
const CSKA_TEAM_ID = "134088";
const SPORTAL_FOOTBALL_BASE = "https://football.cache.proxy.sportal365.com";
const SPORTAL_AUTH = "Basic ZWZiZXQuY29tOktYVWM5dWZ6WEFNQWZBQXVqOTROWlphRXlWYUxpZmt0";
const SPORTAL_CSKA_SOFIA_TEAM_ID = "17";

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
  "Lokomotiv Plovdiv": "Локомотив Пловдив",
  "Lokomotiv Sofia": "Локомотив София",
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
  "Локомотив Пловдив",
  "Локомотив София",
  "Славия София",
  "Ботев Враца",
  "Добруджа",
  "Спартак Варна",
  "Берое",
  "Септември София",
  "Монтана"
]);

const KNOWN_BULGARIAN_MATCH_TEAMS = new Set([
  ...KNOWN_EFBET_TEAMS,
  "България"
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

function normalizePersonName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPersonNameTokens(name) {
  const normalized = normalizePersonName(name);
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
}

function getPersonTokenKey(name) {
  return getPersonNameTokens(name).sort().join("|");
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
  if (!Array.isArray(rows) || rows.length < 3) {
    return false;
  }

  const hits = rows.reduce((count, row) => {
    return KNOWN_EFBET_TEAMS.has(String(row?.team || "").trim()) ? count + 1 : count;
  }, 0);

  // Accept if at least 60% of rows are known Efbet teams (min 3 hits)
  const required = Math.max(3, Math.min(6, Math.ceil(rows.length * 0.6)));
  return hits >= required;
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

function normalizeEfbetLeagueTeamName(name) {
  const raw = String(name || "").trim();
  const map = {
    "ПФК Левски": "Левски София",
    "ПФК Левски": "Левски София",
    "ПФК Лудогорец 1945": "Лудогорец",
    "ФК Централен Спортен Клуб на Армията 1948": "ЦСКА 1948",
    "ПРОФЕСИОНАЛЕН ФУТБОЛЕН КЛУБ ЦСКА ЕАД": "ЦСКА София",
    "ПФК ЧЕРНО МОРЕ АД": "Черно море",
    "ПФК ЛОКОМОТИВ ПЛОВДИВ 1926 АД": "Локомотив Пловдив",
    "ПФК Арда Кърджали 1924": "Арда",
    "ПФК Славия 1913": "Славия София",
    "ПФК Ботев Враца": "Ботев Враца",
    "ФУТБОЛЕН КЛУБ ЛОКОМОТИВ СОФИЯ 1929 ЕАД": "Локомотив София",
    "ПФК Ботев АД": "Ботев Пловдив",
    "ФУТБОЛЕН КЛУБ ДОБРУДЖА 1919": "Добруджа",
    "ФУТБОЛЕН КЛУБ СПАРТАК 1918": "Спартак Варна",
    "ПФК Берое - Стара Загора": "Берое",
    "ПФК Септември Сф": "Септември София",
    "ПФК Монтана 1921": "Монтана",
    "Левски София": "Левски София",
    "Лудогорец": "Лудогорец",
    "ЦСКА 1948": "ЦСКА 1948",
    "ЦСКА": "ЦСКА София",
    "ЦСКА София": "ЦСКА София",
    "Черно море": "Черно море",
    "Локомотив Пловдив": "Локомотив Пловдив",
    "Арда": "Арда",
    "Славия": "Славия София",
    "Славия София": "Славия София",
    "Ботев Враца": "Ботев Враца",
    "Локомотив София": "Локомотив София",
    "Ботев Пловдив": "Ботев Пловдив",
    "Добруджа": "Добруджа",
    "Спартак Варна": "Спартак Варна",
    "Берое": "Берое",
    "Септември София": "Септември София",
    "Монтана": "Монтана"
  };
  if (map[raw]) return map[raw];
  return translateTeamName(raw);
}

async function fetchSportalJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CSKA-Explorer/1.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "bg",
        "Referer": "https://efbetleague.com/",
        "X-Project": "sportal.bg",
        "Authorization": SPORTAL_AUTH
      }
    });
    if (!response.ok) {
      throw new Error(`Sportal upstream ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchEfbetLeagueStandingsFull() {
  const latestSeason = await fetchSportalJson(`${SPORTAL_FOOTBALL_BASE}/tournaments/1/seasons/latest`);
  const stages = Array.isArray(latestSeason?.stages) ? latestSeason.stages : [];
  const mainStage = stages.find((stage) => stage?.live) || stages[0] || null;

  if (!mainStage?.id) {
    throw new Error("Sportal stage id not found");
  }

  const stageId = String(mainStage.id);
  const readStandingPage = async (offset) => {
    const stageData = await fetchSportalJson(
      `${SPORTAL_FOOTBALL_BASE}/tournaments/seasons/stages/${stageId}?expand=standing.rules,standing.form.events&language_code=bg&row_offset=${offset}`
    );

    if (Array.isArray(stageData?.standing)) {
      return stageData.standing;
    }
    return [];
  };

  const allRows = [];
  const seenKeys = new Set();
  const pageSize = 5;
  for (let offset = 0; offset <= 30; offset += pageSize) {
    const pageRows = await readStandingPage(offset);
    if (!Array.isArray(pageRows) || pageRows.length === 0) {
      break;
    }

    let newRows = 0;
    pageRows.forEach((row) => {
      const key = `${toNumber(row?.rank, 0)}|${String(row?.team?.name || row?.team || "").trim()}`;
      if (seenKeys.has(key)) {
        return;
      }
      seenKeys.add(key);
      allRows.push(row);
      newRows += 1;
    });

    // Stop if endpoint keeps returning duplicate rows for higher offsets.
    if (newRows === 0) {
      break;
    }

    if (allRows.length >= 16) {
      break;
    }

    if (pageRows.length < pageSize) {
      break;
    }
  }

  const standingRows = allRows.length > 0
    ? allRows
    : (Array.isArray(mainStage?.standing) ? mainStage.standing : []);

  return standingRows
    .map((row) => ({
      rank: toNumber(row?.rank, 0),
      team: normalizeEfbetLeagueTeamName(row?.team?.name || row?.team),
      mp: toNumber(row?.played, 0),
      w: toNumber(row?.wins, 0),
      d: toNumber(row?.draws, 0),
      l: toNumber(row?.defeits ?? row?.defeats, 0),
      gf: toNumber(row?.goals_for, 0),
      ga: toNumber(row?.goals_against, 0),
      gd: toNumber(row?.goals_for, 0) - toNumber(row?.goals_against, 0),
      pts: toNumber(row?.points, 0)
    }))
    .filter((row) => row.rank > 0 && row.team)
    .sort((a, b) => a.rank - b.rank);
}

function mapSportalPositionToSquadGroup(position) {
  const value = String(position || "").toLowerCase();
  if (value === "goalkeeper") return "goalkeepers";
  if (value === "defender") return "defenders";
  if (value === "forward") return "forwards";
  if (value === "midfielder") return "midfielders";
  return "midfielders";
}

function sortSquadGroup(players) {
  return [...players].sort((a, b) => {
    const na = Number.isFinite(Number(a?.number)) ? Number(a.number) : Number.POSITIVE_INFINITY;
    const nb = Number.isFinite(Number(b?.number)) ? Number(b.number) : Number.POSITIVE_INFINITY;
    if (na !== nb) return na - nb;
    return String(a?.name || "").localeCompare(String(b?.name || ""), "bg");
  });
}

async function fetchSportalTeamSquad(teamId) {
  const rows = await fetchSportalJson(
    `${SPORTAL_FOOTBALL_BASE}/teams/${encodeURIComponent(String(teamId || ""))}/players?language_code=bg`
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const activeRows = rows.filter((row) => row?.active === true);
  const sourceRows = activeRows.length > 0 ? activeRows : rows;
  const grouped = {
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    forwards: []
  };

  sourceRows.forEach((row) => {
    const player = row?.player;
    const name = String(player?.name || player?.full_name || player?.short_name || "").trim();
    if (!name) {
      return;
    }

    const numberValue = toNumber(row?.shirt_number, NaN);
    const playerEntry = {
      name,
      number: Number.isFinite(numberValue) ? numberValue : null,
      matches: 0,
      goals: 0,
      assists: 0
    };

    const group = mapSportalPositionToSquadGroup(player?.position);

    if (group === "goalkeepers") {
      playerEntry.savesPerMatch = null;
      playerEntry.penaltiesSaved = null;
    }

    grouped[group].push(playerEntry);
  });

  return {
    goalkeepers: sortSquadGroup(grouped.goalkeepers),
    defenders: sortSquadGroup(grouped.defenders),
    midfielders: sortSquadGroup(grouped.midfielders),
    forwards: sortSquadGroup(grouped.forwards)
  };
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

function extractBulgariaTodayMatches(html) {
  const todayKey = (() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
  })();

  const raw = String(html || "");
  const itemRegex = /(?:(\d{2}\.\d{2})\.\s*)?<a href="\/match\/soccer\/[^"]+"[^>]*>([^<]+?)\s-\s([^<]+?)<\/a>/gi;
  const parsed = [];
  let currentDate = "";
  let match = itemRegex.exec(raw);

  while (match) {
    if (match[1]) {
      currentDate = match[1];
    }

    const home = translateTeamName(String(match[2] || "").trim());
    const away = translateTeamName(String(match[3] || "").trim());
    const likelyBulgarianMatch =
      KNOWN_BULGARIAN_MATCH_TEAMS.has(home) ||
      KNOWN_BULGARIAN_MATCH_TEAMS.has(away);

    if (currentDate && likelyBulgarianMatch) {
      parsed.push({
        date: currentDate,
        time: "",
        home,
        away
      });
    }

    match = itemRegex.exec(raw);
  }

  const seen = new Set();
  return parsed
    .filter((event) => event.date === todayKey)
    .filter((event) => {
      const key = `${event.date}|${event.home}|${event.away}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function mergeSquadStats(existingSquad, statsByName) {
  const groups = ["goalkeepers", "defenders", "midfielders", "forwards"];
  const merged = {};

  const statsEntries = Array.from(statsByName.entries()).map(([name, value]) => {
    return {
      rawName: String(name || "").trim(),
      normalized: normalizePersonName(name),
      tokenKey: getPersonTokenKey(name),
      tokens: getPersonNameTokens(name),
      value
    };
  });

  const byNormalized = new Map();
  const byTokenKey = new Map();
  const singleTokenToEntries = new Map();

  statsEntries.forEach((entry) => {
    if (entry.normalized && !byNormalized.has(entry.normalized)) {
      byNormalized.set(entry.normalized, entry.value);
    }
    if (entry.tokenKey && !byTokenKey.has(entry.tokenKey)) {
      byTokenKey.set(entry.tokenKey, entry.value);
    }

    if (entry.tokens.length === 1) {
      const token = entry.tokens[0];
      const list = singleTokenToEntries.get(token) || [];
      list.push(entry.value);
      singleTokenToEntries.set(token, list);
    }
  });

  const findStatsForPlayerName = (name) => {
    const normalized = normalizePersonName(name);
    if (!normalized) return null;

    const direct = byNormalized.get(normalized);
    if (direct) return direct;

    const tokenKey = getPersonTokenKey(name);
    if (tokenKey && byTokenKey.has(tokenKey)) {
      return byTokenKey.get(tokenKey);
    }

    const tokens = getPersonNameTokens(name);
    for (const token of tokens) {
      const candidates = singleTokenToEntries.get(token) || [];
      if (candidates.length === 1) {
        return candidates[0];
      }
    }

    return null;
  };

  groups.forEach((group) => {
    const players = Array.isArray(existingSquad?.[group]) ? existingSquad[group] : [];
    merged[group] = players.map((player) => {
      if (!player || typeof player !== "object") {
        return player;
      }
      const name = String(player.name || "").trim();
      const scraped = name ? findStatsForPlayerName(name) : null;
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

  const [standingsResult, resultsResult, upcomingResult, squadPageResult, standingsPageResult, bulgariaPageResult, teamInfoResult] = await Promise.allSettled([
    fetchJson(`${SPORTSDB_BASE}/lookuptable.php?l=${BULGARIAN_LEAGUE_ID}&s=${season}`),
    fetchJson(`${SPORTSDB_BASE}/eventslast.php?id=${CSKA_TEAM_ID}`),
    fetchJson(`${SPORTSDB_BASE}/eventsnext.php?id=${CSKA_TEAM_ID}`),
    fetchText(fallback?.source?.squadUrl || "https://www.flashscore.bg/team/cska-sofia/0xFNNECi/squad/"),
    fetchText(fallback?.source?.standingsUrl || "https://www.flashscore.bg/soccer/bulgaria/efbet/#/ID1TwQHr/standings/overall/"),
    fetchText("https://www.flashscore.bg/soccer/bulgaria/"),
    fetchJson(`${SPORTSDB_BASE}/searchteams.php?t=CSKA+Sofia`)
  ]);

  const nextPayload = {
    ...fallback,
    updatedAt: new Date().toISOString(),
    source: {
      ...(fallback.source || {}),
      note: "Automatic server refresh: standings + CSKA matches + squad stats."
    }
  };

  let fullEfbetStandings = [];
  try {
    fullEfbetStandings = await fetchEfbetLeagueStandingsFull();
  } catch (_) {
    fullEfbetStandings = [];
  }

  if (Array.isArray(fullEfbetStandings) && fullEfbetStandings.length >= 12) {
    nextPayload.standings = fullEfbetStandings;
  } else if (standingsResult.status === "fulfilled" && Array.isArray(standingsResult.value?.table)) {
    const parseStandingsTable = (table) => table
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

    const parsedStandings = parseStandingsTable(standingsResult.value.table);

    if (isLikelyEfbetStandings(parsedStandings)) {
      nextPayload.standings = parsedStandings;
    } else {
      // Try previous season as fallback if current is incomplete
      const prevSeason = (() => {
        const [y1] = season.split("-").map(Number);
        return `${y1 - 1}-${y1}`;
      })();
      try {
        const prevData = await fetchJson(`${SPORTSDB_BASE}/lookuptable.php?l=${BULGARIAN_LEAGUE_ID}&s=${prevSeason}`);
        const prevParsed = Array.isArray(prevData?.table) ? parseStandingsTable(prevData.table) : [];
        if (isLikelyEfbetStandings(prevParsed)) {
          nextPayload.standings = prevParsed;
          warnings.push(`standings from ${prevSeason} (current season incomplete)`);
        } else {
          warnings.push("standings fallback kept");
          nextPayload.standings = Array.isArray(fallback.standings) ? fallback.standings : parsedStandings;
        }
      } catch (_) {
        warnings.push("standings fallback kept");
        nextPayload.standings = Array.isArray(fallback.standings) && fallback.standings.length > 0
          ? fallback.standings
          : parsedStandings;
      }
    }
  } else {
    warnings.push("standings fetch failed");
    nextPayload.standings = Array.isArray(fallback.standings) ? fallback.standings : [];
  }

  if (!nextPayload.cska) {
    nextPayload.cska = { team: "ЦСКА София", nextMatches: [], lastResults: [], squad: {} };
  }

  try {
    const sportalSquad = await fetchSportalTeamSquad(SPORTAL_CSKA_SOFIA_TEAM_ID);
    if (
      sportalSquad &&
      ["goalkeepers", "defenders", "midfielders", "forwards"].some(
        (group) => Array.isArray(sportalSquad[group]) && sportalSquad[group].length > 0
      )
    ) {
      nextPayload.cska.squad = sportalSquad;
    } else {
      warnings.push("sportal squad fallback kept");
      nextPayload.cska.squad = nextPayload.cska.squad || fallback?.cska?.squad || {};
    }
  } catch (_) {
    warnings.push("sportal squad fetch failed");
    nextPayload.cska.squad = nextPayload.cska.squad || fallback?.cska?.squad || {};
  }

  if (!Array.isArray(nextPayload.cska.todayMatches)) {
    nextPayload.cska.todayMatches = [];
  }

  if (resultsResult.status === "fulfilled" && Array.isArray(resultsResult.value?.results)) {
    const rawResults = resultsResult.value.results
      .filter((e) => String(e.idLeague) === BULGARIAN_LEAGUE_ID)
      .slice(0, 5)
      .map((event) => ({
        date: formatEventDate(event.dateEvent),
        home: translateTeamName(event.strHomeTeam),
        away: translateTeamName(event.strAwayTeam),
        score: `${event.intHomeScore ?? "-"}:${event.intAwayScore ?? "-"}`,
        round: event.intRound ? `Кр. ${event.intRound}` : "",
        venue: event.strVenue || "",
        competition: event.strLeague || ""
      }));

    if (isLikelyCskaMatches(rawResults)) {
      nextPayload.cska.lastResults = rawResults;
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
    const rawNext = upcomingResult.value.events
      .filter((e) => String(e.idLeague) === BULGARIAN_LEAGUE_ID)
      .slice(0, 5)
      .map((event) => ({
        date: formatEventDate(event.dateEvent),
        time: formatEventTime(event.strTime),
        home: translateTeamName(event.strHomeTeam),
        away: translateTeamName(event.strAwayTeam),
        round: event.intRound ? `Кр. ${event.intRound}` : "",
        venue: event.strVenue || "",
        competition: event.strLeague || ""
      }));

    if (isLikelyCskaMatches(rawNext)) {
      nextPayload.cska.nextMatches = rawNext;
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

  if (bulgariaPageResult.status === "fulfilled") {
    const broaderTodayMatches = extractBulgariaTodayMatches(bulgariaPageResult.value);
    const merged = [...(nextPayload.cska.todayMatches || []), ...broaderTodayMatches];
    const unique = [];
    const seen = new Set();
    merged.forEach((event) => {
      const key = `${event.date}|${event.home}|${event.away}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      unique.push(event);
    });
    nextPayload.cska.todayMatches = unique;
  }

  // Inject kick-off times from SportsDB eventsround into todayMatches
  // Determine current round from standings (max games played = completed rounds)
  const nextRound = (() => {
    if (standingsResult.status === "fulfilled" && Array.isArray(standingsResult.value?.table)) {
      const maxPlayed = standingsResult.value.table.reduce((max, row) => Math.max(max, toNumber(row.intPlayed, 0)), 0);
      if (maxPlayed > 0) return maxPlayed + 1;
    }
    // Fallback: try CSKA-specific event round numbers
    const fromNext = upcomingResult.status === "fulfilled"
      ? (upcomingResult.value?.events || []).find((e) => String(e.idLeague) === BULGARIAN_LEAGUE_ID)?.intRound
      : null;
    if (fromNext) return Number(fromNext);
    const fromLast = resultsResult.status === "fulfilled"
      ? (resultsResult.value?.results || []).find((e) => String(e.idLeague) === BULGARIAN_LEAGUE_ID)?.intRound
      : null;
    return fromLast ? Number(fromLast) + 1 : null;
  })();

  if (nextRound) {
    try {
      const roundData = await fetchJson(`${SPORTSDB_BASE}/eventsround.php?id=${BULGARIAN_LEAGUE_ID}&r=${nextRound}&s=${season}`);
      const todayKey = (() => {
        const now = new Date();
        return `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}`;
      })();
      // Normalize team name for matching: lowercase, strip spaces/punctuation
      const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, "").replace(/[^a-zа-я0-9]/g, "");
      const roundTimeMap = new Map();
      (roundData?.events || []).forEach((e) => {
        if (formatEventDate(e.dateEvent) !== todayKey) return;
        const h = norm(translateTeamName(e.strHomeTeam));
        const a = norm(translateTeamName(e.strAwayTeam));
        const t = formatEventTime(e.strTime);
        if (h && a && t) roundTimeMap.set(`${h}|${a}`, t);
      });
      if (roundTimeMap.size > 0) {
        nextPayload.cska.todayMatches = (nextPayload.cska.todayMatches || []).map((m) => ({
          ...m,
          time: roundTimeMap.get(`${norm(m.home)}|${norm(m.away)}`) || m.time
        }));
      }
    } catch (_) {
      // Time enrichment is best-effort; skip silently
    }
  }

  if (teamInfoResult.status === "fulfilled" && Array.isArray(teamInfoResult.value?.teams)) {
    const teamData = teamInfoResult.value.teams.find(
      (t) => String(t.idTeam) === CSKA_TEAM_ID
    );
    if (teamData) {
      nextPayload.cska.teamInfo = {
        stadium: teamData.strStadium || "",
        foundedYear: teamData.intFormedYear || "",
        country: teamData.strCountry || "Bulgaria",
        badge: teamData.strTeamBadge || ""
      };
    }
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
      console.log(`[budget] exhausted - returning stale cache`);
      return withCacheMeta(cache.payload, "stale-cache-budget-exhausted", budgetDecision.budget);
    }

    // No cache yet and budget exhausted - use bootstrap data instead of fresh API call
    const fallback = readJson(BOOTSTRAP_FILE);
    console.log(`[budget] exhausted and no cache - using bootstrap data`);
    return withCacheMeta(fallback, "bootstrap-budget-exhausted", budgetDecision.budget);
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
      console.log(`[auto-refresh] skipped (${reason}) - budget exhausted. Using cache if available.`);
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

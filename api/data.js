const bootstrapData = require("../data/bootstrap-data.json");
const { SPORTAL_AUTH } = require("../lib/sportal-config");

const SPORTAL_BASE = "https://football.cache.proxy.sportal365.com";
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const LEAGUE_ID = "4626";
const CACHE_TTL_MS = 5 * 60 * 1000;
const PREMIER_LEAGUE_CACHE_TTL_MS = 10 * 60 * 1000;
const SERIE_A_CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 9000;
const STATE_KEY = Symbol.for("cska-explorer.standings-api-state");
const ALLOWED_ORIGINS = new Set([
  "https://svetoslavgochev.github.io",
  "https://cska-explorer.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);
const INTERNATIONAL_LEAGUES = {
  "premier-league": { tournamentId: 3, name: "Висша лига", englishName: "Premier League", teamCount: 20, cacheTtlMs: PREMIER_LEAGUE_CACHE_TTL_MS },
  "serie-a": { tournamentId: 7, name: "Серия А", englishName: "Serie A", teamCount: 20, cacheTtlMs: SERIE_A_CACHE_TTL_MS },
  bundesliga: { tournamentId: 6, name: "Бундеслига", englishName: "Bundesliga", teamCount: 18, cacheTtlMs: SERIE_A_CACHE_TTL_MS },
  "la-liga": { tournamentId: 5, name: "Ла Лига", englishName: "La Liga", teamCount: 20, cacheTtlMs: SERIE_A_CACHE_TTL_MS },
  "ligue-1": { tournamentId: 8, name: "Лига 1", englishName: "Ligue 1", teamCount: 18, cacheTtlMs: SERIE_A_CACHE_TTL_MS }
};

const TEAM_NAMES = {
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
  "Spartak Varna": "Спартак Варна",
  "Левски": "Левски София",
  "ЦСКА": "ЦСКА София",
  "Ботев (Пловдив)": "Ботев Пловдив",
  "Ботев (Враца)": "Ботев Враца",
  "Арда (Кърджали)": "Арда",
  "Спартак (Варна)": "Спартак Варна",
  "Дунав (Русе)": "Дунав Русе",
  "Локомотив (Пловдив)": "Локомотив Пловдив",
  "Локомотив (София)": "Локомотив София",
  "Септември (София)": "Септември София"
};

const KNOWN_TEAMS = new Set([
  "Левски София", "Лудогорец", "ЦСКА 1948", "ЦСКА София", "Черно море",
  "Арда", "Ботев Пловдив", "Локомотив Пловдив", "Локомотив София",
  "Славия София", "Ботев Враца", "Добруджа", "Спартак Варна", "Берое",
  "Септември София", "Монтана"
]);

const state = globalThis[STATE_KEY] || (globalThis[STATE_KEY] = {
  lastGoodPayload: null,
  lastSuccessAt: 0,
  inFlight: null,
  lastAttemptAt: 0,
  leagueCaches: {}
});
state.leagueCaches ||= {};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function firstNumber(row, keys, fallback = 0) {
  for (const key of keys) {
    const value = row?.[key];
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeTeamName(value) {
  const raw = String(value?.name || value?.short_name || value || "").trim();
  return TEAM_NAMES[raw] || raw;
}

function isLikelyLeagueTable(rows) {
  if (!Array.isArray(rows) || rows.length < 12) return false;
  const hits = rows.filter((row) => KNOWN_TEAMS.has(row.team)).length;
  const required = Math.max(6, Math.ceil(rows.length * 0.6));
  const hasCska = rows.some((row) => row.team === "ЦСКА София");
  const ranks = new Set(rows.map((row) => row.rank));
  return hits >= required && hasCska && ranks.size === rows.length;
}

function normalizeSportalRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const gf = firstNumber(row, ["goals_for", "goals_scored", "gf"]);
      const ga = firstNumber(row, ["goals_against", "goals_conceded", "ga"]);
      return {
        rank: firstNumber(row, ["rank", "position", "place"]),
        team: normalizeTeamName(row?.team),
        mp: firstNumber(row, ["played", "matches_played", "played_matches"]),
        w: firstNumber(row, ["wins", "won"]),
        d: firstNumber(row, ["draws", "drawn"]),
        l: firstNumber(row, ["defeits", "defeats", "losses", "lost"]),
        gf,
        ga,
        gd: gf - ga,
        pts: firstNumber(row, ["points", "pts", "total_points"])
      };
    })
    .filter((row) => row.rank > 0 && row.team)
    .sort((a, b) => a.rank - b.rank);
}

function normalizeSportsDbRows(table) {
  return (Array.isArray(table) ? table : [])
    .map((row) => ({
      rank: firstNumber(row, ["intRank", "rank", "position"]),
      team: normalizeTeamName(row?.strTeam || row?.team),
      mp: firstNumber(row, ["intPlayed", "played"]),
      w: firstNumber(row, ["intWin", "wins"]),
      d: firstNumber(row, ["intDraw", "draws"]),
      l: firstNumber(row, ["intLoss", "losses"]),
      gf: firstNumber(row, ["intGoalsFor", "goals_for"]),
      ga: firstNumber(row, ["intGoalsAgainst", "goals_against"]),
      gd: firstNumber(row, ["intGoalDifference", "goal_difference"]),
      pts: firstNumber(row, ["intPoints", "points", "pts"])
    }))
    .filter((row) => row.rank > 0 && row.team)
    .sort((a, b) => a.rank - b.rank);
}

async function fetchJson(url, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CSKA-Explorer/1.0", ...headers }
    });
    if (!response.ok) throw new Error(`Upstream request failed (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSportalStandings() {
  const headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "bg",
    "Referer": "https://efbetleague.com/",
    "X-Project": "sportal.bg",
    "Authorization": SPORTAL_AUTH
  };
  const latest = await fetchJson(`${SPORTAL_BASE}/tournaments/1/seasons/latest`, headers);
  const stages = Array.isArray(latest?.stages) ? latest.stages : [];
  const stage = stages.find((item) => item?.live) || stages[0];
  if (!stage?.id) throw new Error("Sportal live stage was not found");

  const pages = await Promise.all([0, 5, 10, 15].map(async (offset) => {
    const data = await fetchJson(
      `${SPORTAL_BASE}/tournaments/seasons/stages/${encodeURIComponent(String(stage.id))}?expand=standing.rules,standing.form.events&language_code=bg&row_offset=${offset}`,
      headers
    );
    return Array.isArray(data?.standing) ? data.standing : [];
  }));
  const sourceRows = pages.flat();
  const uniqueRows = [...new Map(sourceRows.map((row) => [
    `${firstNumber(row, ["rank", "position", "place"])}|${normalizeTeamName(row?.team)}`,
    row
  ])).values()];
  const parsed = normalizeSportalRows(uniqueRows.length ? uniqueRows : stage.standing);
  if (!isLikelyLeagueTable(parsed)) throw new Error("Sportal standings failed validation");
  return parsed;
}

function isValidInternationalStandings(rows, expectedTeamCount = 20) {
  if (!Array.isArray(rows) || rows.length !== expectedTeamCount) return false;
  const ranks = new Set(rows.map((row) => row.rank));
  const teams = new Set(rows.map((row) => row.team.toLowerCase()));
  return ranks.size === rows.length && teams.size === rows.length &&
    rows.every((row) => row.rank > 0 && row.rank <= rows.length && row.team && Number.isFinite(row.pts));
}

async function fetchInternationalStandings(tournamentId, leagueName, expectedTeamCount) {
  const headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "bg",
    "Referer": "https://www.sportal.bg/",
    "X-Project": "sportal.bg",
    "Authorization": SPORTAL_AUTH
  };
  const latest = await fetchJson(`${SPORTAL_BASE}/tournaments/${tournamentId}/seasons/latest`, headers);
  const stages = Array.isArray(latest?.stages) ? latest.stages : [];
  const stage = stages.find((item) => item?.live) || stages[0];
  if (!stage?.id) throw new Error(`${leagueName} live stage was not found`);

  const pages = await Promise.all([0, 5, 10, 15].map(async (offset) => {
    const data = await fetchJson(
      `${SPORTAL_BASE}/tournaments/seasons/stages/${encodeURIComponent(String(stage.id))}?expand=standing.rules,standing.form.events&language_code=bg&row_offset=${offset}`,
      headers
    );
    return Array.isArray(data?.standing) ? data.standing : [];
  }));
  const sourceRows = pages.flat();
  const uniqueRows = [...new Map(sourceRows.map((row) => [
    `${firstNumber(row, ["rank", "position", "place"])}|${normalizeTeamName(row?.team)}`,
    row
  ])).values()];
  const rows = normalizeSportalRows(uniqueRows.length ? uniqueRows : stage.standing);
  if (!isValidInternationalStandings(rows, expectedTeamCount)) {
    throw new Error(`${leagueName} standings failed validation`);
  }
  return { rows, season: latest.name || stage.name || "" };
}

function internationalLeagueStalePayload(payload, warnings, league) {
  return {
    ...payload,
    source: {
      ...payload.source,
      note: `Showing the last valid ${league.englishName} standings snapshot; live refresh failed.`,
      validation: {
        ...payload.source.validation,
        warnings,
        usedFallback: true,
        standingsUpdated: false
      }
    }
  };
}

async function getInternationalLeaguePayload(leagueId, forceRefresh) {
  const league = INTERNATIONAL_LEAGUES[leagueId];
  const cache = state.leagueCaches[leagueId] || (state.leagueCaches[leagueId] = {
    lastGoodPayload: null,
    lastSuccessAt: 0,
    inFlight: null
  });
  if (!forceRefresh && cache.lastGoodPayload && Date.now() - cache.lastSuccessAt < league.cacheTtlMs) {
    return { payload: cache.lastGoodPayload, fresh: true, source: "memory-cache" };
  }
  if (cache.inFlight) return cache.inFlight;

  const pending = (async () => {
    try {
      const { rows, season } = await fetchInternationalStandings(league.tournamentId, league.englishName, league.teamCount);
      const updatedAt = new Date().toISOString();
      return {
        payload: {
          league: { id: leagueId, name: league.name, season },
          standings: rows,
          updatedAt,
          source: {
            standingsUpdatedAt: updatedAt,
            note: `${league.englishName} standings refreshed from Sportal.`,
            validation: { warnings: [], usedFallback: false, standingsUpdated: true, standingsProvider: "sportal" }
          }
        },
        fresh: true,
        source: "live-refresh"
      };
    } catch (error) {
      const warnings = [`Sportal: ${error.message}`];
      if (cache.lastGoodPayload) {
        return { payload: internationalLeagueStalePayload(cache.lastGoodPayload, warnings, league), fresh: false, source: "stale-fallback" };
      }
      throw error;
    }
  })();

  cache.inFlight = pending;
  try {
    const result = await pending;
    if (result.fresh) {
      cache.lastGoodPayload = result.payload;
      cache.lastSuccessAt = Date.now();
    }
    return result;
  } finally {
    if (cache.inFlight === pending) cache.inFlight = null;
  }
}

function getSeasonKey(date = new Date()) {
  const year = date.getUTCFullYear();
  return date.getUTCMonth() + 1 >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

async function fetchSportsDbStandings() {
  const season = getSeasonKey();
  const data = await fetchJson(`${SPORTSDB_BASE}/lookuptable.php?l=${LEAGUE_ID}&s=${season}`);
  const rows = normalizeSportsDbRows(data?.table);
  if (!isLikelyLeagueTable(rows)) throw new Error("TheSportsDB standings failed validation");
  return rows;
}

function withStandings(payload, standings, provider, warnings = []) {
  const updated = clone(payload || {});
  updated.standings = standings;
  updated.updatedAt = new Date().toISOString();
  updated.source = {
    ...(updated.source || {}),
    standingsUpdatedAt: updated.updatedAt,
    note: `Live standings refreshed from ${provider}.`,
    validation: {
      warnings,
      usedFallback: warnings.length > 0,
      standingsUpdated: true,
      standingsProvider: provider
    }
  };
  return updated;
}

async function refreshPayload() {
  const warnings = [];
  try {
    const standings = await fetchSportalStandings();
    return {
      payload: withStandings(state.lastGoodPayload || bootstrapData, standings, "sportal"),
      refreshed: true,
      warnings
    };
  } catch (error) {
    warnings.push(`Sportal: ${error.message}`);
  }

  try {
    const standings = await fetchSportsDbStandings();
    return {
      payload: withStandings(state.lastGoodPayload || bootstrapData, standings, "thesportsdb", warnings),
      refreshed: true,
      warnings
    };
  } catch (error) {
    warnings.push(`TheSportsDB: ${error.message}`);
  }

  return { payload: state.lastGoodPayload || bootstrapData, refreshed: false, warnings };
}

function stalePayload(payload, warnings) {
  const stale = clone(payload || bootstrapData);
  stale.source = {
    ...(stale.source || {}),
    note: "Showing the last valid standings snapshot; live refresh failed.",
    validation: {
      ...(stale.source?.validation || {}),
      warnings,
      usedFallback: true,
      standingsUpdated: false,
      standingsProvider: stale.source?.validation?.standingsProvider || "snapshot"
    }
  };
  return stale;
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function getPayload(forceRefresh) {
  if (!forceRefresh && state.lastGoodPayload && Date.now() - state.lastSuccessAt < CACHE_TTL_MS) {
    return { payload: state.lastGoodPayload, fresh: true, source: "memory-cache" };
  }
  if (state.inFlight) return state.inFlight;

  const pending = (async () => {
    const result = await refreshPayload();
    if (!result.refreshed) {
      return {
        payload: stalePayload(result.payload, result.warnings),
        fresh: false,
        source: "stale-fallback"
      };
    }

    return { payload: result.payload, fresh: true, source: "live-refresh" };
  })();

  state.inFlight = pending;
  state.lastAttemptAt = Date.now();
  try {
    const result = await pending;
    if (result.fresh) {
      state.lastGoodPayload = result.payload;
      state.lastSuccessAt = Date.now();
    }
    return result;
  } finally {
    if (state.inFlight === pending) state.inFlight = null;
  }
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const forceRefresh = String(req.query?.refresh || "") === "1";
  const requestedLeague = String(req.query?.league || "");
  if (requestedLeague && !INTERNATIONAL_LEAGUES[requestedLeague]) {
    res.status(404).json({ error: "Unknown league" });
    return;
  }
  const cronSecret = process.env.CRON_SECRET;
  if (
    forceRefresh && cronSecret &&
    req.headers.authorization !== `Bearer ${cronSecret}`
  ) {
    res.status(401).json({ error: "Unauthorized refresh request" });
    return;
  }

  try {
    if (requestedLeague) {
      const league = INTERNATIONAL_LEAGUES[requestedLeague];
      const result = await getInternationalLeaguePayload(requestedLeague, forceRefresh);
      res.setHeader("Cache-Control", forceRefresh
        ? "no-store"
        : (result.fresh
          ? `public, s-maxage=${Math.floor(league.cacheTtlMs / 1000)}, stale-while-revalidate=1200`
          : "public, s-maxage=60, stale-while-revalidate=300"));
      res.status(200).json({
        ...result.payload,
        cache: {
          source: result.source,
          ttlMinutes: Math.floor(league.cacheTtlMs / 60000),
          refreshedAt: state.leagueCaches[requestedLeague]?.lastSuccessAt
            ? new Date(state.leagueCaches[requestedLeague].lastSuccessAt).toISOString()
            : null
        }
      });
      return;
    }

    const result = await getPayload(forceRefresh);
    const response = {
      ...result.payload,
      cache: {
        source: result.source,
        ttlMinutes: Math.floor(CACHE_TTL_MS / 60000),
        refreshedAt: state.lastSuccessAt ? new Date(state.lastSuccessAt).toISOString() : null
      }
    };
    res.setHeader("Cache-Control", forceRefresh
      ? "no-store"
      : (result.fresh ? "public, s-maxage=300, stale-while-revalidate=600" : "public, s-maxage=60, stale-while-revalidate=300"));
    res.status(200).json(response);
  } catch (error) {
    console.error("[api/data] refresh failed:", error.message || error);
    if (requestedLeague && INTERNATIONAL_LEAGUES[requestedLeague]) {
      const league = INTERNATIONAL_LEAGUES[requestedLeague];
      res.setHeader("Cache-Control", "no-store");
      res.status(503).json({
        league: { id: requestedLeague, name: league.name },
        standings: [],
        source: { validation: { standingsUpdated: false, warnings: [String(error.message || error)] } },
        error: `${league.englishName} standings are temporarily unavailable`
      });
      return;
    }
    const fallback = stalePayload(state.lastGoodPayload || bootstrapData, [String(error.message || error)]);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(fallback);
  }
};

module.exports._test = { isLikelyLeagueTable, isValidInternationalStandings, normalizeSportalRows, normalizeSportsDbRows, state };
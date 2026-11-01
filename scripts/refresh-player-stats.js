const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BOOTSTRAP_PATH = path.join(ROOT, "data", "bootstrap-data.json");
const REFRESH_LOG_PATH = path.join(ROOT, "data", "refresh-log.ndjson");

const SPORTAL_URL = "https://football.cache.proxy.sportal365.com/teams/17/players?language_code=bg";
const { SPORTAL_AUTH } = require("../lib/sportal-config");
const MIN_ROSTER_PLAYERS = 18;
const MIN_FLASHSCORE_ROWS = 10;
const MIN_MATCHED_PLAYERS = 10;
const DEFAULT_REFRESH_HOURS = 6;

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenKey(value) {
  return normalizeName(value)
    .split(" ")
    .filter(Boolean)
    .sort()
    .join("|");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function fetchText(url, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CSKA-Explorer/1.0",
        ...headers
      }
    });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) ${url}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, headers = {}) {
  const text = await fetchText(url, headers);
  return JSON.parse(text);
}

function extractFlashscoreStats(html) {
  const rows = [];
  const rowRegex = /<div class="lineupTable__row">[\s\S]*?lineupTable__cell--jersey">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--name"[^>]*>\s*(?:<a[^>]*>)?\s*([^<]+?)\s*<\/a>[\s\S]*?lineupTable__cell--matchesPlayed">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--goal">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--assist">\s*(\d+)\s*<\/div>/gi;

  let match = rowRegex.exec(html);
  while (match) {
    rows.push({
      number: Number(match[1]),
      name: String(match[2] || "").trim(),
      matches: Number(match[3]),
      goals: Number(match[4]),
      assists: Number(match[5])
    });
    match = rowRegex.exec(html);
  }

  return rows;
}

function buildStatsIndex(rows) {
  const byNorm = new Map();
  const byToken = new Map();
  const singleTokenMap = new Map();

  rows.forEach((row) => {
    const norm = normalizeName(row.name);
    const key = tokenKey(row.name);

    if (norm && !byNorm.has(norm)) {
      byNorm.set(norm, row);
    }

    if (key && !byToken.has(key)) {
      byToken.set(key, row);
    }

    const tokens = norm.split(" ").filter(Boolean);
    if (tokens.length === 1) {
      const token = tokens[0];
      const list = singleTokenMap.get(token) || [];
      list.push(row);
      singleTokenMap.set(token, list);
    }
  });

  return { byNorm, byToken, singleTokenMap };
}

function findStatsForName(name, index) {
  const norm = normalizeName(name);
  if (!norm) return null;

  if (index.byNorm.has(norm)) {
    return index.byNorm.get(norm);
  }

  const key = tokenKey(name);
  if (key && index.byToken.has(key)) {
    return index.byToken.get(key);
  }

  const tokens = norm.split(" ").filter(Boolean);
  for (const token of tokens) {
    const candidates = index.singleTokenMap.get(token) || [];
    if (candidates.length === 1) {
      return candidates[0];
    }
  }

  return null;
}

function mapPositionToGroup(position) {
  const value = String(position || "").toLowerCase();
  if (["goalkeeper", "keeper", "goalkeepers"].includes(value)) return "goalkeepers";
  if (["defender", "defence", "defense", "defenders"].includes(value)) return "defenders";
  if (["forward", "striker", "forwards"].includes(value)) return "forwards";
  return "midfielders";
}

function buildSquad(sportalRows, statsRows, previousSquad = {}) {
  const statsIndex = buildStatsIndex(statsRows);
  const previousPlayers = ["goalkeepers", "defenders", "midfielders", "forwards"]
    .flatMap((group) => Array.isArray(previousSquad?.[group]) ? previousSquad[group] : []);
  const previousStatsIndex = buildStatsIndex(previousPlayers);
  const activeRows = sportalRows.filter((row) => row?.active === true);
  const sourceRows = activeRows.length > 0 ? activeRows : sportalRows;

  const grouped = {
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    forwards: []
  };

  sourceRows.forEach((row) => {
    const player = row?.player;
    if (!player) return;

    const name = String(player?.name || player?.full_name || player?.short_name || "").trim();
    if (!name) return;

    const group = mapPositionToGroup(player?.position);
    const country = typeof player?.country === "object" ? player.country : {};

    const entry = {
      name,
      number: Number.isFinite(Number(row?.shirt_number)) ? Number(row.shirt_number) : null,
      countryName: String(country?.name || "").trim() || null,
      countryFlagUrl: String(country?.url_flag || "").trim() || null,
      matches: 0,
      goals: 0,
      assists: 0
    };

    const stats = findStatsForName(name, statsIndex);
    const previousStats = findStatsForName(name, previousStatsIndex);
    if (stats) {
      entry.number = Number.isFinite(Number(stats.number)) ? Number(stats.number) : entry.number;
      entry.matches = Number.isFinite(Number(stats.matches)) ? Number(stats.matches) : 0;
      entry.goals = Number.isFinite(Number(stats.goals)) ? Number(stats.goals) : 0;
      entry.assists = Number.isFinite(Number(stats.assists)) ? Number(stats.assists) : 0;
    } else if (previousStats) {
      entry.matches = Number.isFinite(Number(previousStats.matches)) ? Number(previousStats.matches) : 0;
      entry.goals = Number.isFinite(Number(previousStats.goals)) ? Number(previousStats.goals) : 0;
      entry.assists = Number.isFinite(Number(previousStats.assists)) ? Number(previousStats.assists) : 0;
    }

    if (group === "goalkeepers") {
      entry.savesPerMatch = null;
      entry.penaltiesSaved = null;
    }

    grouped[group].push(entry);
  });

  Object.keys(grouped).forEach((group) => {
    grouped[group].sort((a, b) => {
      const an = Number.isFinite(Number(a?.number)) ? Number(a.number) : Number.POSITIVE_INFINITY;
      const bn = Number.isFinite(Number(b?.number)) ? Number(b.number) : Number.POSITIVE_INFINITY;
      if (an !== bn) return an - bn;
      return String(a?.name || "").localeCompare(String(b?.name || ""), "bg");
    });
  });

  return grouped;
}

function getActiveSportalRows(rows) {
  const active = rows.filter((row) => row?.active === true);
  return active.length > 0 ? active : rows;
}

function countMatchedPlayers(sportalRows, statsRows) {
  const index = buildStatsIndex(statsRows);
  return getActiveSportalRows(sportalRows).filter((row) => {
    const player = row?.player;
    const name = String(player?.name || player?.full_name || player?.short_name || "").trim();
    return name && findStatsForName(name, index);
  }).length;
}

function validateSportalRoster(sportalRows) {
  const validSportalRows = Array.isArray(sportalRows) ? sportalRows : [];
  const activeRows = getActiveSportalRows(validSportalRows);
  const playerCount = activeRows.filter((row) => row?.player?.name || row?.player?.full_name || row?.player?.short_name).length;
  const errors = [];
  if (playerCount < MIN_ROSTER_PLAYERS) {
    errors.push(`Sportal roster too small (${playerCount}; minimum ${MIN_ROSTER_PLAYERS})`);
  }
  return { valid: errors.length === 0, errors, playerCount };
}

function validateFlashscoreStats(sportalRows, statsRows) {
  const validSportalRows = Array.isArray(sportalRows) ? sportalRows : [];
  const validStatsRows = Array.isArray(statsRows) ? statsRows : [];
  const matchedPlayers = countMatchedPlayers(validSportalRows, validStatsRows);
  const errors = [];

  if (validStatsRows.length < MIN_FLASHSCORE_ROWS) {
    errors.push(`Flashscore rows too few (${validStatsRows.length}; minimum ${MIN_FLASHSCORE_ROWS})`);
  }
  if (matchedPlayers < MIN_MATCHED_PLAYERS) {
    errors.push(`Flashscore name matches too few (${matchedPlayers}; minimum ${MIN_MATCHED_PLAYERS})`);
  }

  return { valid: errors.length === 0, errors, statsRows: validStatsRows.length, matchedPlayers };
}

function validateSquadRefresh(sportalRows, statsRows) {
  const roster = validateSportalRoster(sportalRows);
  const stats = validateFlashscoreStats(sportalRows, statsRows);
  return {
    valid: roster.valid && stats.valid,
    errors: [...roster.errors, ...stats.errors],
    playerCount: roster.playerCount,
    statsRows: stats.statsRows,
    matchedPlayers: stats.matchedPlayers
  };
}

function appendRefreshLog(row) {
  fs.appendFileSync(REFRESH_LOG_PATH, JSON.stringify(row) + "\n", "utf8");
}

async function refreshPlayerStats({ force = false, dryRun = false, now = new Date() } = {}) {
  const payload = readJson(BOOTSTRAP_PATH);
  const refreshHours = Math.max(1, Number(process.env.SQUAD_REFRESH_HOURS || DEFAULT_REFRESH_HOURS));
  const lastSquadRefresh = payload?.source?.squadUpdatedAt || payload?.updatedAt;
  const lastSquadRefreshMs = Date.parse(lastSquadRefresh || "");
  const due = !Number.isFinite(lastSquadRefreshMs)
    || now.getTime() - lastSquadRefreshMs >= refreshHours * 60 * 60 * 1000;

  if (!force && !due) {
    return {
      skipped: true,
      reason: "not-due",
      lastSquadRefresh: lastSquadRefresh || null,
      refreshHours
    };
  }

  const squadUrl = payload?.source?.squadUrl || "https://www.flashscore.bg/team/cska-sofia/0xFNNECi/squad/";

  const [sportalResult, flashscoreResult] = await Promise.allSettled([
    fetchJson(SPORTAL_URL, {
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "bg",
      "Referer": "https://efbetleague.com/",
      "X-Project": "sportal.bg",
      "Authorization": SPORTAL_AUTH
    }),
    fetchText(squadUrl)
  ]);
  if (sportalResult.status === "rejected") {
    throw new Error(`Sportal roster fetch failed: ${sportalResult.reason?.message || sportalResult.reason}`);
  }

  const sportalRows = Array.isArray(sportalResult.value) ? sportalResult.value : [];
  const rosterValidation = validateSportalRoster(sportalRows);
  if (!rosterValidation.valid) {
    throw new Error(`Squad roster rejected: ${rosterValidation.errors.join("; ")}`);
  }

  const flashscoreHtml = flashscoreResult.status === "fulfilled" ? flashscoreResult.value : "";
  const statsRows = extractFlashscoreStats(flashscoreHtml);
  const statsValidation = validateFlashscoreStats(sportalRows, statsRows);
  const previousStatsUpdatedAt = payload?.source?.playerStatsUpdatedAt || null;
  const squad = buildSquad(
    sportalRows,
    statsValidation.valid ? statsRows : [],
    payload?.cska?.squad || {}
  );
  const refreshedAt = now.toISOString();
  const validationWarnings = [
    ...(flashscoreResult.status === "rejected"
      ? [`Flashscore fetch failed: ${flashscoreResult.reason?.message || flashscoreResult.reason}`]
      : []),
    ...statsValidation.errors
  ];
  const candidate = {
    ...payload,
    cska: {
      ...(payload.cska || {}),
      squad
    },
    updatedAt: refreshedAt,
    source: {
      ...(payload.source || {}),
      squadUpdatedAt: refreshedAt,
      playerStatsUpdatedAt: statsValidation.valid ? refreshedAt : previousStatsUpdatedAt,
      squadRefresh: {
        provider: "sportal+flashscore",
        rosterPlayers: rosterValidation.playerCount,
        flashscoreRows: statsValidation.statsRows,
        matchedPlayers: statsValidation.matchedPlayers,
        statsUpdated: statsValidation.valid,
        warnings: validationWarnings
      }
    }
  };

  const players = [
    ...squad.goalkeepers,
    ...squad.defenders,
    ...squad.midfielders,
    ...squad.forwards
  ];

  const summary = {
    timestamp: refreshedAt,
    source: "scripts/refresh-player-stats.js",
    players: players.length,
    withFlags: players.filter((p) => p.countryFlagUrl).length,
    withMatches: players.filter((p) => Number(p.matches) > 0).length,
    statsRowsFromFlashscore: statsRows.length,
    matchedPlayers: statsValidation.matchedPlayers,
    statsUpdated: statsValidation.valid,
    warnings: validationWarnings,
    updatedAt: candidate.updatedAt
  };

  if (!dryRun) {
    // Persist only after the roster passes validation; invalid stats stay at their last validated values.
    writeJson(BOOTSTRAP_PATH, candidate);
    appendRefreshLog(summary);
  }
  return { skipped: false, dryRun, summary };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const result = await refreshPlayerStats({
    force: args.has("--force") || !args.has("--if-due"),
    dryRun: args.has("--dry-run")
  });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error("refresh-player-stats failed:", error.message || error);
    process.exit(1);
  });
}

module.exports = {
  buildSquad,
  countMatchedPlayers,
  extractFlashscoreStats,
  refreshPlayerStats,
  validateFlashscoreStats,
  validateSportalRoster,
  validateSquadRefresh
};

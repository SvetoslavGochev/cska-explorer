const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BOOTSTRAP_PATH = path.join(ROOT, "data", "bootstrap-data.json");
const REFRESH_LOG_PATH = path.join(ROOT, "data", "refresh-log.ndjson");

const SPORTAL_URL = "https://football.cache.proxy.sportal365.com/teams/17/players?language_code=bg";
const SPORTAL_AUTH = "Basic ZWZiZXQuY29tOktYVWM5dWZ6WEFNQWZBQXVqOTROWlphRXlWYUxpZmt0";

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
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CSKA-Explorer/1.0",
      ...headers
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) ${url}`);
  }
  return await response.text();
}

async function fetchJson(url, headers = {}) {
  const text = await fetchText(url, headers);
  return JSON.parse(text);
}

function extractFlashscoreStats(html) {
  const rows = [];
  const rowRegex = /<div class="lineupTable__row">[\s\S]*?lineupTable__cell--jersey">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--name"[^>]*>\s*([^<]+?)\s*<\/a>[\s\S]*?lineupTable__cell--matchesPlayed">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--goal">\s*(\d+)\s*<\/div>[\s\S]*?lineupTable__cell--assist">\s*(\d+)\s*<\/div>/gi;

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
  if (value === "goalkeeper" || value === "keeper") return "goalkeepers";
  if (value === "defender") return "defenders";
  if (value === "forward") return "forwards";
  return "midfielders";
}

function buildSquad(sportalRows, statsRows) {
  const statsIndex = buildStatsIndex(statsRows);
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
    if (stats) {
      entry.number = Number.isFinite(Number(stats.number)) ? Number(stats.number) : entry.number;
      entry.matches = Number.isFinite(Number(stats.matches)) ? Number(stats.matches) : 0;
      entry.goals = Number.isFinite(Number(stats.goals)) ? Number(stats.goals) : 0;
      entry.assists = Number.isFinite(Number(stats.assists)) ? Number(stats.assists) : 0;
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

function appendRefreshLog(row) {
  fs.appendFileSync(REFRESH_LOG_PATH, JSON.stringify(row) + "\n", "utf8");
}

(async () => {
  const payload = readJson(BOOTSTRAP_PATH);
  const squadUrl = payload?.source?.squadUrl || "https://www.flashscore.bg/team/cska-sofia/0xFNNECi/squad/";

  const [sportalRows, flashscoreHtml] = await Promise.all([
    fetchJson(SPORTAL_URL, {
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "bg",
      "Referer": "https://efbetleague.com/",
      "X-Project": "sportal.bg",
      "Authorization": SPORTAL_AUTH
    }),
    fetchText(squadUrl)
  ]);

  const statsRows = extractFlashscoreStats(flashscoreHtml);
  const squad = buildSquad(Array.isArray(sportalRows) ? sportalRows : [], statsRows);

  payload.cska = payload.cska || {};
  payload.cska.squad = squad;
  payload.updatedAt = new Date().toISOString();

  writeJson(BOOTSTRAP_PATH, payload);

  const players = [
    ...squad.goalkeepers,
    ...squad.defenders,
    ...squad.midfielders,
    ...squad.forwards
  ];

  const summary = {
    timestamp: new Date().toISOString(),
    source: "scripts/refresh-player-stats.js",
    players: players.length,
    withFlags: players.filter((p) => p.countryFlagUrl).length,
    withMatches: players.filter((p) => Number(p.matches) > 0).length,
    statsRowsFromFlashscore: statsRows.length,
    updatedAt: payload.updatedAt
  };

  appendRefreshLog(summary);
  console.log(JSON.stringify(summary, null, 2));
})().catch((error) => {
  console.error("refresh-player-stats failed:", error.message || error);
  process.exit(1);
});

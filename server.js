const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const DAILY_REFRESH_LIMIT = Number(process.env.DAILY_REFRESH_LIMIT || 20);

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const CACHE_FILE = path.join(DATA_DIR, "live-cache.json");
const BOOTSTRAP_FILE = path.join(DATA_DIR, "bootstrap-data.json");
const BUDGET_FILE = path.join(DATA_DIR, "request-budget.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
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

function buildFreshPayloadFromSource() {
  // Placeholder source fetch: for now this reuses extracted bootstrap data.
  const fallback = readJson(BOOTSTRAP_FILE);
  return {
    ...fallback,
    updatedAt: new Date().toISOString()
  };
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

function getCachedData(forceRefresh) {
  const now = Date.now();
  const cache = readCache();
  const budgetSnapshot = getBudgetSnapshot();
  const hasCache = Boolean(cache?.payload);
  const isCacheFresh = Boolean(cache && cache.expiresAt > now);

  if (!forceRefresh && isCacheFresh) {
    return withCacheMeta(cache.payload, "server-cache", budgetSnapshot);
  }

  const budgetDecision = tryConsumeRefreshBudget();
  if (!budgetDecision.allowed) {
    if (hasCache) {
      return withCacheMeta(cache.payload, "stale-cache-budget-exhausted", budgetDecision.budget);
    }

    // Absolute fallback if there is no cache yet.
    const payload = buildFreshPayloadFromSource();
    writeCache(payload, now);
    return withCacheMeta(payload, "bootstrap-no-cache-budget-exhausted", budgetDecision.budget);
  }

  try {
    const payload = buildFreshPayloadFromSource();
    writeCache(payload, now);
    const source = forceRefresh ? "forced-refresh" : "refresh-within-budget";
    return withCacheMeta(payload, source, budgetDecision.budget);
  } catch (_) {
    if (hasCache) {
      return withCacheMeta(cache.payload, "stale-cache-refresh-failed", budgetDecision.budget);
    }

    const payload = buildFreshPayloadFromSource();
    writeCache(payload, now);
    return withCacheMeta(payload, "bootstrap-refresh-failed", budgetDecision.budget);
  }
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
    try {
      const refresh = url.searchParams.get("refresh") === "1";
      const data = getCachedData(refresh);
      sendJson(res, 200, data);
    } catch (err) {
      sendJson(res, 500, { error: "Cannot load data", details: err.message });
    }
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

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`CSKA site running on http://localhost:${PORT}`);
});

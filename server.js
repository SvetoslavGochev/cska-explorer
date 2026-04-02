const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const CACHE_TTL_MS = 30 * 60 * 1000;

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const CACHE_FILE = path.join(DATA_DIR, "live-cache.json");
const BOOTSTRAP_FILE = path.join(DATA_DIR, "bootstrap-data.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getMime(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

function withCacheMeta(payload, source) {
  return {
    ...payload,
    cache: {
      source,
      ttlMinutes: Math.floor(CACHE_TTL_MS / 60000)
    }
  };
}

function getCachedData(forceRefresh) {
  const now = Date.now();

  if (!forceRefresh && fs.existsSync(CACHE_FILE)) {
    const cache = readJson(CACHE_FILE);
    if (cache.expiresAt > now && cache.payload) {
      return withCacheMeta(cache.payload, "server-cache");
    }
  }

  const fallback = readJson(BOOTSTRAP_FILE);
  const payload = {
    ...fallback,
    updatedAt: new Date().toISOString()
  };

  writeJson(CACHE_FILE, {
    payload,
    createdAt: now,
    expiresAt: now + CACHE_TTL_MS
  });

  return withCacheMeta(payload, forceRefresh ? "forced-refresh" : "bootstrap-refreshed");
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

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`CSKA site running on http://localhost:${PORT}`);
});

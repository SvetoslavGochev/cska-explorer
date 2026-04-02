const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const BETSAPI_KEY = String(process.env.BETSAPI_KEY || "").trim();
const BETSAPI_BASE_URL = String(process.env.BETSAPI_BASE_URL || "https://api.b365api.com/v1").trim();
const CSKA_TEAM_ID = String(process.env.CSKA_TEAM_ID || "44156").trim();

app.use(cors());
app.use(express.json());

function requireApiKey(res) {
  if (BETSAPI_KEY) {
    return true;
  }

  res.status(500).json({
    ok: false,
    error: "Missing BETSAPI_KEY in environment.",
  });
  return false;
}

function buildUrl(path, params = {}) {
  const url = new URL(path, BETSAPI_BASE_URL.endsWith("/") ? BETSAPI_BASE_URL : `${BETSAPI_BASE_URL}/`);
  url.searchParams.set("token", BETSAPI_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function upstreamGet(path, params = {}) {
  const url = buildUrl(path, params);
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error || `Upstream HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "cska-betsapi-proxy",
    configured: Boolean(BETSAPI_KEY),
    baseUrl: BETSAPI_BASE_URL,
    teamId: CSKA_TEAM_ID,
  });
});

app.get("/api/cska/upcoming", async (_req, res) => {
  if (!requireApiKey(res)) return;

  try {
    const data = await upstreamGet("/events/upcoming", { team_id: CSKA_TEAM_ID, sport_id: 1 });
    res.json({ ok: true, source: "betsapi", data });
  } catch (error) {
    res.status(502).json({ ok: false, error: error.message });
  }
});

app.get("/api/cska/results", async (_req, res) => {
  if (!requireApiKey(res)) return;

  try {
    const data = await upstreamGet("/events/end", { team_id: CSKA_TEAM_ID, sport_id: 1 });
    res.json({ ok: true, source: "betsapi", data });
  } catch (error) {
    res.status(502).json({ ok: false, error: error.message });
  }
});

app.get("/api/cska/odds", async (req, res) => {
  if (!requireApiKey(res)) return;

  const eventId = String(req.query.event_id || "").trim();
  if (!eventId) {
    res.status(400).json({ ok: false, error: "Missing query parameter: event_id" });
    return;
  }

  try {
    const data = await upstreamGet("/event/odds", { event_id: eventId, source: "bet365" });
    res.json({ ok: true, source: "betsapi", data });
  } catch (error) {
    res.status(502).json({ ok: false, error: error.message });
  }
});

app.get("/api/cska/raw", async (req, res) => {
  if (!requireApiKey(res)) return;

  const endpoint = String(req.query.endpoint || "").trim();
  if (!endpoint) {
    res.status(400).json({ ok: false, error: "Missing query parameter: endpoint" });
    return;
  }

  const params = { ...req.query };
  delete params.endpoint;

  try {
    const data = await upstreamGet(endpoint, params);
    res.json({ ok: true, source: "betsapi", data });
  } catch (error) {
    res.status(502).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`BetsAPI proxy running on http://localhost:${PORT}`);
});

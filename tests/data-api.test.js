const assert = require("node:assert/strict");
const handler = require("../api/data");
const { persistLiveStandings } = require("../scripts/persist-live-standings");

const teams = [
  "ЦСКА София", "Левски София", "ЦСКА 1948", "Лудогорец", "Ботев Пловдив",
  "Арда", "Спартак Варна", "Славия София", "Дунав Русе", "Ботев Враца",
  "Черно море", "Локомотив Пловдив", "Локомотив София", "Септември София",
  "Берое", "Монтана"
];

function makeSportalRows(offset) {
  return teams.slice(offset, offset + 5).map((name, index) => {
    const rank = offset + index + 1;
    return {
      rank,
      team: { name },
      played: 12,
      wins: 8,
      draws: 2,
      defeats: 2,
      goals_for: 20,
      goals_against: 10,
      points: 26 - rank
    };
  });
}

function invoke(query = {}) {
  const headers = {};
  const response = {
    statusCode: 0,
    body: null,
    setHeader(name, value) { headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; }
  };
  return handler({ method: "GET", query, headers: { origin: "https://svetoslavgochev.github.io" } }, response)
    .then(() => ({ response, headers }));
}

(async () => {
  const state = handler._test.state;
  state.lastGoodPayload = null;
  state.lastSuccessAt = 0;
  state.inFlight = null;

  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const value = String(url);
    if (value.includes("/seasons/latest")) {
      return { ok: true, json: async () => ({ stages: [{ id: 7001, live: true }] }) };
    }
    if (value.includes("/tournaments/seasons/stages/")) {
      const offset = Number(new URL(value).searchParams.get("row_offset"));
      return { ok: true, json: async () => ({ standing: makeSportalRows(offset) }) };
    }
    throw new Error(`Unexpected fetch URL: ${value}`);
  };

  try {
    const { response, headers } = await invoke();
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.source.validation.standingsUpdated, true);
    assert.equal(response.body.source.validation.standingsProvider, "sportal");
    assert.equal(response.body.standings.length, 16);
    assert.equal(headers["Access-Control-Allow-Origin"], "https://svetoslavgochev.github.io");
    assert.match(headers["Cache-Control"], /s-maxage=300/);

    global.fetch = async () => { throw new Error("provider offline"); };
    const stale = await invoke({ refresh: "1" });
    assert.equal(stale.response.statusCode, 200);
    assert.equal(stale.response.body.source.validation.standingsUpdated, false);
    assert.equal(stale.response.body.cache.source, "stale-fallback");
    assert.equal(stale.response.body.standings.length, 16);
    assert.equal(stale.headers["Cache-Control"], "no-store");

    assert.throws(() => persistLiveStandings(stale.response.body, {}), /validated live standings/);
    const livePayload = await invoke();
    const currentPayload = { standings: [], cska: { squad: { defenders: [] } } };
    const persisted = persistLiveStandings(livePayload.response.body, currentPayload);
    assert.equal(persisted.changed, true);
    assert.equal(persisted.payload.standings.length, 16);
    assert.deepEqual(persisted.payload.cska, currentPayload.cska);
    assert.equal(persistLiveStandings(livePayload.response.body, persisted.payload).changed, false);
  } finally {
    global.fetch = originalFetch;
    state.lastGoodPayload = null;
    state.lastSuccessAt = 0;
    state.inFlight = null;
  }

  console.log("Standings API tests passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
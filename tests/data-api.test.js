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

const premierLeagueTeams = [
  "Арсенал", "Манчестър Сити", "Ливърпул", "Челси", "Тотнъм",
  "Нюкасъл", "Астън Вила", "Манчестър Юнайтед", "Брайтън", "Уест Хям",
  "Кристъл Палас", "Брентфорд", "Фулъм", "Борнемут", "Евертън",
  "Нотингам Форест", "Лийдс", "Съндърланд", "Бърнли", "Уулвърхемптън"
];

function makePremierLeagueRows(offset) {
  return premierLeagueTeams.slice(offset, offset + 5).map((name, index) => {
    const rank = offset + index + 1;
    return {
      rank,
      team: { name },
      played: 9,
      wins: 6,
      draws: 2,
      defeats: 1,
      goals_for: 18,
      goals_against: 8,
      points: 20 - rank
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
  state.leagueCaches = {};

  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const value = String(url);
    if (value.includes("/tournaments/3/seasons/latest")) {
      return { ok: true, json: async () => ({ name: "2026/2027", stages: [{ id: 7003, live: false }] }) };
    }
    if (value.includes("/seasons/latest")) {
      return { ok: true, json: async () => ({ stages: [{ id: 7001, live: true }] }) };
    }
    if (value.includes("/tournaments/seasons/stages/")) {
      const offset = Number(new URL(value).searchParams.get("row_offset"));
      const rows = value.includes("/7003?") ? makePremierLeagueRows(offset) : makeSportalRows(offset);
      return { ok: true, json: async () => ({ standing: rows }) };
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

    const premier = await invoke({ league: "premier-league" });
    assert.equal(premier.response.statusCode, 200);
    assert.equal(premier.response.body.league.id, "premier-league");
    assert.equal(premier.response.body.league.season, "2026/2027");
    assert.equal(premier.response.body.source.validation.standingsUpdated, true);
    assert.equal(premier.response.body.standings.length, 20);
    assert.equal(premier.response.body.standings[0].team, "Арсенал");
    assert.match(premier.headers["Cache-Control"], /s-maxage=600/);

    global.fetch = async () => { throw new Error("provider offline"); };
    const stalePremier = await invoke({ league: "premier-league", refresh: "1" });
    assert.equal(stalePremier.response.statusCode, 200);
    assert.equal(stalePremier.response.body.source.validation.standingsUpdated, false);
    assert.equal(stalePremier.response.body.cache.source, "stale-fallback");
    assert.equal(stalePremier.response.body.standings.length, 20);

    const stale = await invoke({ refresh: "1" });
    assert.equal(stale.response.statusCode, 200);
    assert.equal(stale.response.body.source.validation.standingsUpdated, false);
    assert.equal(stale.response.body.cache.source, "stale-fallback");
    assert.equal(stale.response.body.standings.length, 16);
    assert.equal(stale.headers["Cache-Control"], "no-store");

    assert.throws(() => persistLiveStandings(stale.response.body, {}), /validated live standings/);
    const livePayload = await invoke();
    const currentPayload = {
      updatedAt: "2026-10-30T18:51:45.689Z",
      source: { squadUpdatedAt: "2026-10-30T18:00:00.000Z", playerStatsUpdatedAt: "2026-10-29T12:00:00.000Z" },
      standings: [],
      cska: { squad: { defenders: [] } }
    };
    const persisted = persistLiveStandings(livePayload.response.body, currentPayload);
    assert.equal(persisted.changed, true);
    assert.equal(persisted.payload.standings.length, 16);
    assert.deepEqual(persisted.payload.cska, currentPayload.cska);
    assert.equal(persisted.payload.source.standingsUpdatedAt, livePayload.response.body.updatedAt);
    assert.equal(persisted.payload.source.squadUpdatedAt, currentPayload.source.squadUpdatedAt);
    assert.equal(persisted.payload.source.playerStatsUpdatedAt, currentPayload.source.playerStatsUpdatedAt);
    assert.equal(persistLiveStandings(livePayload.response.body, persisted.payload).changed, false);
  } finally {
    global.fetch = originalFetch;
    state.lastGoodPayload = null;
    state.lastSuccessAt = 0;
    state.inFlight = null;
    state.leagueCaches = {};
  }

  console.log("Standings API tests passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
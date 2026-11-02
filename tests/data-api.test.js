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

const premierLeagueEnglishTeams = [
  "Arsenal", "Manchester City", "Liverpool", "Chelsea", "Tottenham Hotspur",
  "Newcastle United", "Aston Villa", "Manchester United", "Brighton & Hove Albion", "West Ham United",
  "Crystal Palace", "Brentford", "Fulham", "Bournemouth", "Everton",
  "Nottingham Forest", "Leeds United", "Sunderland", "Burnley", "Wolverhampton Wanderers"
];

function makePremierLeagueRows(offset, language = "bg") {
  const teamsForLanguage = language === "en" ? premierLeagueEnglishTeams : premierLeagueTeams;
  return teamsForLanguage.slice(offset, offset + 5).map((name, index) => {
    const rank = offset + index + 1;
    return {
      rank,
      team: { name, url_logo: `https://sportal365images.com/assets/premier-${rank}.png` },
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

const serieATeams = [
  "Лацио", "Интер", "Рома", "Комо", "Ювентус", "Милан", "Наполи", "Аталанта",
  "Болоня", "Фиорентина", "Торино", "Удинезе", "Сасуоло", "Каляри", "Парма",
  "Дженоа", "Верона", "Лече", "Пиза", "Кремонезе"
];

function makeSerieARows(offset) {
  return serieATeams.slice(offset, offset + 5).map((name, index) => {
    const rank = offset + index + 1;
    return {
      rank,
      team: { name },
      played: 10,
      wins: 7,
      draws: 2,
      defeats: 1,
      goals_for: 21,
      goals_against: 8,
      points: 23 - rank
    };
  });
}

const bundesligaTeams = [
  "Байерн (Мюнхен)", "Борусия (Дортмунд)", "Фрайбург", "Вердер (Бремен)",
  "РБ Лайпциг", "Байер (Леверкузен)", "Щутгарт", "Айнтрахт (Франкфурт)",
  "Хофенхайм", "Майнц", "Волфсбург", "Аугсбург", "Борусия (Мьонхенгладбах)",
  "Унион Берлин", "Кьолн", "Хамбургер", "Санкт Паули", "Хайденхайм"
];

function makeBundesligaRows(offset) {
  return bundesligaTeams.slice(offset, offset + 5).map((name, index) => {
    const rank = offset + index + 1;
    return {
      rank,
      team: { name },
      played: 8,
      wins: 5,
      draws: 2,
      defeats: 1,
      goals_for: 16,
      goals_against: 7,
      points: 18 - rank
    };
  });
}

const laLigaTeams = [
  "FC Barcelona", "Atletico Madrid", "Real Madrid", "Real Betis", "Villarreal",
  "Athletic Club", "Real Sociedad", "Valencia", "Sevilla", "Girona",
  "Getafe", "Osasuna", "Celta Vigo", "Mallorca", "Espanyol",
  "Rayo Vallecano", "Alaves", "Elche", "Levante", "Oviedo"
];

function makeLaLigaRows(offset) {
  return laLigaTeams.slice(offset, offset + 5).map((name, index) => {
    const rank = offset + index + 1;
    return {
      rank,
      team: { name },
      played: 11,
      wins: 7,
      draws: 2,
      defeats: 2,
      goals_for: 22,
      goals_against: 10,
      points: 23 - rank
    };
  });
}

const ligue1Teams = [
  "Пари Сен Жермен", "Лил", "Лион", "Париж ФК", "Рен", "Марсилия",
  "Монако", "Ница", "Ланс", "Лориан", "Тулуза", "Страсбург",
  "Оксер", "Брест", "Анже", "Троа", "Льо Ман", "Льо Авър"
];

function makeLigue1Rows(offset) {
  return ligue1Teams.slice(offset, offset + 5).map((name, index) => {
    const rank = offset + index + 1;
    return {
      rank,
      team: { name },
      played: 10,
      wins: 6,
      draws: 2,
      defeats: 2,
      goals_for: 18,
      goals_against: 9,
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
    if (value.includes("/tournaments/7/seasons/latest")) {
      return { ok: true, json: async () => ({ name: "2026/2027", stages: [{ id: 7007, live: false }] }) };
    }
    if (value.includes("/tournaments/6/seasons/latest")) {
      return { ok: true, json: async () => ({ name: "2026/2027", stages: [{ id: 7006, live: false }] }) };
    }
    if (value.includes("/tournaments/5/seasons/latest")) {
      return { ok: true, json: async () => ({ name: "2026/2027", stages: [{ id: 7005, live: false }] }) };
    }
    if (value.includes("/tournaments/8/seasons/latest")) {
      return { ok: true, json: async () => ({ name: "2026/2027", stages: [{ id: 7008, live: false }] }) };
    }
    if (value.includes("/seasons/latest")) {
      return { ok: true, json: async () => ({ stages: [{ id: 7001, live: true }] }) };
    }
    if (value.includes("/tournaments/seasons/stages/")) {
      const offset = Number(new URL(value).searchParams.get("row_offset"));
      const rows = value.includes("/7003?")
        ? makePremierLeagueRows(offset, new URL(value).searchParams.get("language_code"))
        : value.includes("/7007?")
          ? makeSerieARows(offset)
          : value.includes("/7006?")
            ? makeBundesligaRows(offset)
            : value.includes("/7005?")
              ? makeLaLigaRows(offset)
              : value.includes("/7008?")
                ? makeLigue1Rows(offset)
          : makeSportalRows(offset);
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
    assert.equal(premier.response.body.standings[0].logo, "https://sportal365images.com/assets/premier-1.png");
    assert.match(premier.headers["Cache-Control"], /s-maxage=600/);

    const premierEnglish = await invoke({ league: "premier-league", lang: "en" });
    assert.equal(premierEnglish.response.statusCode, 200);
    assert.equal(premierEnglish.response.body.league.name, "Premier League");
    assert.equal(premierEnglish.response.body.standings.length, 20);
    assert.equal(premierEnglish.response.body.standings[0].team, "Arsenal");
    assert.equal(premierEnglish.response.body.standings[0].logo, "https://sportal365images.com/assets/premier-1.png");

    const serieA = await invoke({ league: "serie-a" });
    assert.equal(serieA.response.statusCode, 200);
    assert.equal(serieA.response.body.league.id, "serie-a");
    assert.equal(serieA.response.body.league.season, "2026/2027");
    assert.equal(serieA.response.body.source.validation.standingsUpdated, true);
    assert.equal(serieA.response.body.standings.length, 20);
    assert.equal(serieA.response.body.standings[0].team, "Лацио");
    assert.match(serieA.headers["Cache-Control"], /s-maxage=600/);

    const bundesliga = await invoke({ league: "bundesliga" });
    assert.equal(bundesliga.response.statusCode, 200);
    assert.equal(bundesliga.response.body.league.id, "bundesliga");
    assert.equal(bundesliga.response.body.league.season, "2026/2027");
    assert.equal(bundesliga.response.body.source.validation.standingsUpdated, true);
    assert.equal(bundesliga.response.body.standings.length, 18);
    assert.equal(bundesliga.response.body.standings[0].team, "Байерн (Мюнхен)");
    assert.match(bundesliga.headers["Cache-Control"], /s-maxage=600/);

    const laLiga = await invoke({ league: "la-liga" });
    assert.equal(laLiga.response.statusCode, 200);
    assert.equal(laLiga.response.body.league.id, "la-liga");
    assert.equal(laLiga.response.body.league.season, "2026/2027");
    assert.equal(laLiga.response.body.source.validation.standingsUpdated, true);
    assert.equal(laLiga.response.body.standings.length, 20);
    assert.equal(laLiga.response.body.standings[0].team, "FC Barcelona");
    assert.match(laLiga.headers["Cache-Control"], /s-maxage=600/);

    const ligue1 = await invoke({ league: "ligue-1" });
    assert.equal(ligue1.response.statusCode, 200);
    assert.equal(ligue1.response.body.league.id, "ligue-1");
    assert.equal(ligue1.response.body.league.season, "2026/2027");
    assert.equal(ligue1.response.body.source.validation.standingsUpdated, true);
    assert.equal(ligue1.response.body.standings.length, 18);
    assert.equal(ligue1.response.body.standings[0].team, "Пари Сен Жермен");
    assert.match(ligue1.headers["Cache-Control"], /s-maxage=600/);

    global.fetch = async () => { throw new Error("provider offline"); };
    const stalePremier = await invoke({ league: "premier-league", refresh: "1" });
    assert.equal(stalePremier.response.statusCode, 200);
    assert.equal(stalePremier.response.body.source.validation.standingsUpdated, false);
    assert.equal(stalePremier.response.body.cache.source, "stale-fallback");
    assert.equal(stalePremier.response.body.standings.length, 20);

    const stalePremierEnglish = await invoke({ league: "premier-league", lang: "en", refresh: "1" });
    assert.equal(stalePremierEnglish.response.statusCode, 200);
    assert.equal(stalePremierEnglish.response.body.source.validation.standingsUpdated, false);
    assert.equal(stalePremierEnglish.response.body.cache.source, "stale-fallback");
    assert.equal(stalePremierEnglish.response.body.standings[0].team, "Arsenal");

    const staleSerieA = await invoke({ league: "serie-a", refresh: "1" });
    assert.equal(staleSerieA.response.statusCode, 200);
    assert.equal(staleSerieA.response.body.source.validation.standingsUpdated, false);
    assert.equal(staleSerieA.response.body.cache.source, "stale-fallback");
    assert.equal(staleSerieA.response.body.standings.length, 20);

    const staleBundesliga = await invoke({ league: "bundesliga", refresh: "1" });
    assert.equal(staleBundesliga.response.statusCode, 200);
    assert.equal(staleBundesliga.response.body.source.validation.standingsUpdated, false);
    assert.equal(staleBundesliga.response.body.cache.source, "stale-fallback");
    assert.equal(staleBundesliga.response.body.standings.length, 18);

    const staleLaLiga = await invoke({ league: "la-liga", refresh: "1" });
    assert.equal(staleLaLiga.response.statusCode, 200);
    assert.equal(staleLaLiga.response.body.source.validation.standingsUpdated, false);
    assert.equal(staleLaLiga.response.body.cache.source, "stale-fallback");
    assert.equal(staleLaLiga.response.body.standings.length, 20);

    const staleLigue1 = await invoke({ league: "ligue-1", refresh: "1" });
    assert.equal(staleLigue1.response.statusCode, 200);
    assert.equal(staleLigue1.response.body.source.validation.standingsUpdated, false);
    assert.equal(staleLigue1.response.body.cache.source, "stale-fallback");
    assert.equal(staleLigue1.response.body.standings.length, 18);

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
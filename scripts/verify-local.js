async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CSKA-Explorer/1.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) ${url}`);
  }
  return await response.json();
}

(async () => {
  const health = await fetchJson("http://localhost:3000/api/health");
  const data = await fetchJson("http://localhost:3000/api/data?force=0");

  const squad = data?.cska?.squad || {};
  const players = [
    ...(Array.isArray(squad.goalkeepers) ? squad.goalkeepers : []),
    ...(Array.isArray(squad.defenders) ? squad.defenders : []),
    ...(Array.isArray(squad.midfielders) ? squad.midfielders : []),
    ...(Array.isArray(squad.forwards) ? squad.forwards : [])
  ];

  const report = {
    healthNow: health?.now || null,
    healthCacheUpdatedAt: health?.cache?.updatedAt || null,
    healthCacheSourceNote: health?.cache?.sourceNote || null,
    dataUpdatedAt: data?.updatedAt || null,
    cacheSource: data?.cache?.source || null,
    players: players.length,
    goalkeepers: (squad.goalkeepers || []).length,
    withFlags: players.filter((p) => p?.countryFlagUrl).length,
    withMatches: players.filter((p) => Number(p?.matches) > 0).length
  };

  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error("verify-local failed:", error.message || error);
  process.exit(1);
});

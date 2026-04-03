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
  const data = await fetchJson("https://svetoslavgochev.github.io/cska-explorer/data/bootstrap-data.json");
  const squad = data?.cska?.squad || {};
  const players = [
    ...(Array.isArray(squad.goalkeepers) ? squad.goalkeepers : []),
    ...(Array.isArray(squad.defenders) ? squad.defenders : []),
    ...(Array.isArray(squad.midfielders) ? squad.midfielders : []),
    ...(Array.isArray(squad.forwards) ? squad.forwards : [])
  ];

  const report = {
    liveUpdatedAt: data?.updatedAt || null,
    players: players.length,
    goalkeepers: (squad.goalkeepers || []).length,
    defenders: (squad.defenders || []).length,
    midfielders: (squad.midfielders || []).length,
    forwards: (squad.forwards || []).length,
    withFlags: players.filter((p) => p?.countryFlagUrl).length,
    withMatches: players.filter((p) => Number(p?.matches) > 0).length,
    withCountryCode: players.filter((p) => p?.countryName).length
  };

  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error("verify-live failed:", error.message || error);
  process.exit(1);
});

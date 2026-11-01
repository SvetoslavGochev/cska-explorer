const fs = require("node:fs");

function persistLiveStandings(response, currentPayload) {
  if (response?.source?.validation?.standingsUpdated !== true) {
    throw new Error("API response does not contain validated live standings");
  }
  if (!Array.isArray(response.standings) || response.standings.length < 12) {
    throw new Error("API returned an incomplete standings table");
  }

  const currentStandings = JSON.stringify(currentPayload?.standings || []);
  const latestStandings = JSON.stringify(response.standings);
  if (currentStandings === latestStandings) {
    return { changed: false, payload: currentPayload };
  }

  const source = {
    ...(response.source || {}),
    ...(currentPayload?.source || {}),
    validation: response.source?.validation || currentPayload?.source?.validation,
    standingsUpdatedAt: response.updatedAt || new Date().toISOString(),
    squadUpdatedAt: currentPayload?.source?.squadUpdatedAt || currentPayload?.updatedAt || null,
    playerStatsUpdatedAt: currentPayload?.source?.playerStatsUpdatedAt || null
  };

  return {
    changed: true,
    payload: {
      ...currentPayload,
      standings: response.standings,
      updatedAt: response.updatedAt || new Date().toISOString(),
      source: {
        ...source,
        note: response.source?.note || "Live standings updated by scheduled API refresh."
      }
    }
  };
}

if (require.main === module) {
  const [responsePath, bootstrapPath] = process.argv.slice(2);
  if (!responsePath || !bootstrapPath) {
    console.error("Usage: node scripts/persist-live-standings.js <api-response.json> <bootstrap-data.json>");
    process.exit(2);
  }

  try {
    const response = JSON.parse(fs.readFileSync(responsePath, "utf8"));
    const current = JSON.parse(fs.readFileSync(bootstrapPath, "utf8"));
    const result = persistLiveStandings(response, current);
    if (result.changed) {
      fs.writeFileSync(bootstrapPath, `${JSON.stringify(result.payload, null, 2)}\n`, "utf8");
      console.log(`Persisted ${result.payload.standings.length} validated standings rows.`);
    } else {
      console.log("Standings are unchanged; keeping the existing snapshot.");
    }
  } catch (error) {
    console.error("Could not persist live standings:", error.message || error);
    process.exit(1);
  }
}

module.exports = { persistLiveStandings };
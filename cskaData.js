// No-token sports data demo script (Browser or Node 18+)
// Run with: node cskaData.js

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const TEAM_NAME = "CSKA Sofia";

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} - Public API error`);
  }

  return data;
}

async function getTeam(teamName = TEAM_NAME) {
  const data = await apiGet(`/searchteams.php?t=${encodeURIComponent(teamName)}`);
  const candidates = (data.teams || []).filter((team) => team.strSport === "Soccer");

  if (!candidates.length) {
    return null;
  }

  const scored = await Promise.all(
    candidates.slice(0, 6).map(async (team) => {
      const [playersData, lastMatchesData] = await Promise.all([
        apiGet(`/lookup_all_players.php?id=${team.idTeam}`),
        apiGet(`/eventslast.php?id=${team.idTeam}`),
      ]);

      const players = playersData.player || [];
      const matches = lastMatchesData.results || [];

      return {
        team,
        score: players.length * 10 + matches.length,
      };
    })
  );

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.team || candidates[0];
}

async function getPlayers(teamId) {
  const data = await apiGet(`/lookup_all_players.php?id=${teamId}`);
  return data.player || [];
}

async function getLastMatches(teamId) {
  const data = await apiGet(`/eventslast.php?id=${teamId}`);
  return data.results || [];
}

async function getNextMatches(teamId) {
  const data = await apiGet(`/eventsnext.php?id=${teamId}`);
  return data.events || [];
}

function isTeamMatch(match, teamName) {
  const selected = String(teamName || "").trim().toLowerCase();
  return [match.strHomeTeam, match.strAwayTeam].some(
    (team) => String(team || "").trim().toLowerCase() === selected
  );
}

async function printTeamAndSquad(teamName = TEAM_NAME) {
  const team = await getTeam(teamName);
  if (!team) {
    throw new Error(`No team found for: ${teamName}`);
  }

  const players = await getPlayers(team.idTeam);
  const matches = await getLastMatches(team.idTeam);
  const nextMatches = (await getNextMatches(team.idTeam)).filter((match) =>
    isTeamMatch(match, team.strTeam)
  );

  console.log("\nTeam info:");
  console.log("Name:", team.strTeam || "N/A");
  console.log("Founded:", team.intFormedYear || "N/A");
  console.log("League:", team.strLeague || "N/A");
  console.log("Stadium:", team.strStadium || "N/A");
  console.log("Website:", team.strWebsite || "N/A");

  console.log("\nSquad:");
  players.slice(0, 20).forEach((player, i) => {
    console.log(`${i + 1}. ${player.strPlayer} (${player.strPosition || "Unknown"})`);
  });

  console.log("\nLast matches:");
  matches.slice(0, 5).forEach((m, i) => {
    const score = `${m.intHomeScore ?? "?"}:${m.intAwayScore ?? "?"}`;
    console.log(`${i + 1}. ${m.strHomeTeam} vs ${m.strAwayTeam} (${score})`);
  });

  console.log("\nNext matches:");
  if (!nextMatches.length) {
    console.log("No reliable upcoming matches were returned by the API.");
  } else {
    nextMatches.slice(0, 5).forEach((m, i) => {
      console.log(`${i + 1}. ${m.strHomeTeam} vs ${m.strAwayTeam} (${m.dateEvent || "TBD"})`);
    });
  }
}

async function run() {
  try {
    await printTeamAndSquad();
  } catch (error) {
    console.error("Request failed:", error.message);
    console.error("Tip: Check internet connectivity or try a different team name.");
  }
}

run();

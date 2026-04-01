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
  return data.teams?.[0] || null;
}

async function getPlayers(teamId) {
  const data = await apiGet(`/lookup_all_players.php?id=${teamId}`);
  return data.player || [];
}

async function getLastMatches(teamId) {
  const data = await apiGet(`/eventslast.php?id=${teamId}`);
  return data.results || [];
}

async function printTeamAndSquad(teamName = TEAM_NAME) {
  const team = await getTeam(teamName);
  if (!team) {
    throw new Error(`No team found for: ${teamName}`);
  }

  const players = await getPlayers(team.idTeam);
  const matches = await getLastMatches(team.idTeam);

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

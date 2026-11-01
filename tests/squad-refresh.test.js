const assert = require("node:assert/strict");
const {
  buildSquad,
  extractFlashscoreStats,
  validateFlashscoreStats,
  validateSquadRefresh
} = require("../scripts/refresh-player-stats");

const teams = Array.from({ length: 20 }, (_, index) => ({
  active: true,
  shirt_number: index + 1,
  player: {
    name: `Player ${index + 1}`,
    position: index < 3 ? "goalkeeper" : index < 9 ? "defender" : index < 15 ? "midfielder" : "forward",
    country: { name: "Bulgaria", url_flag: "https://example.test/flag.png" }
  }
}));

function makeRow(index) {
  return `<div class="lineupTable__row"><div class="lineupTable__cell--jersey">${index + 1}</div><div class="lineupTable__cell--name"><a>Player ${index + 1}</a></div><div class="lineupTable__cell--matchesPlayed">${index + 10}</div><div class="lineupTable__cell--goal">${index % 3}</div><div class="lineupTable__cell--assist">${index % 2}</div></div>`;
}

const html = Array.from({ length: 12 }, (_, index) => makeRow(index)).join("\n");
const statsRows = extractFlashscoreStats(html);
const validation = validateSquadRefresh(teams, statsRows);
assert.equal(statsRows.length, 12);
assert.equal(validation.valid, true);
assert.equal(validation.matchedPlayers, 12);

const previousSquad = {
  goalkeepers: [],
  defenders: [],
  midfielders: [],
  forwards: [{ name: "Player 20", matches: 8, goals: 2, assists: 1 }]
};
const squad = buildSquad(teams, statsRows, previousSquad);
const preservedPlayer = squad.forwards.find((player) => player.name === "Player 20");
assert.deepEqual(
  { matches: preservedPlayer.matches, goals: preservedPlayer.goals, assists: preservedPlayer.assists },
  { matches: 8, goals: 2, assists: 1 }
);

const rejected = validateSquadRefresh(teams, []);
assert.equal(rejected.valid, false);
assert.ok(rejected.errors.some((message) => message.includes("Flashscore rows too few")));
assert.ok(rejected.errors.some((message) => message.includes("name matches too few")));
assert.equal(validateFlashscoreStats(teams, []).valid, false);
const rosterWithLastStats = buildSquad(teams, [], previousSquad);
const retainedStats = rosterWithLastStats.forwards.find((player) => player.name === "Player 20");
assert.equal(retainedStats.matches, 8);
assert.equal(retainedStats.goals, 2);
assert.equal(retainedStats.assists, 1);

console.log("Squad refresh tests passed.");

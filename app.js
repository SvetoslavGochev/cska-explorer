const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";

const teamNameInput = document.getElementById("team-name");
const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const clubCard = document.getElementById("club-card");
const squadList = document.getElementById("squad-list");
const matchesList = document.getElementById("matches-list");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.classList.remove("ok", "error");
  if (type) {
    statusEl.classList.add(type);
  }

  // Keep UI clean: show status only when there is an error.
  statusEl.classList.toggle("hidden", type !== "error");
}

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} при заявка към публичния източник.`);
  }
  return response.json();
}

function renderClub(team) {
  const founded = team.intFormedYear || "Няма данни";
  const venue = team.strStadium || "Няма данни";
  const location = team.strLocation || "Няма данни";
  const website = team.strWebsite || "";
  const description = team.strDescriptionEN || "Няма налично описание.";

  clubCard.classList.remove("empty");
  clubCard.innerHTML = `
    <p><strong>Клуб:</strong> ${team.strTeam || "Няма данни"}</p>
    <p><strong>Основан:</strong> ${founded}</p>
    <p><strong>Стадион:</strong> ${venue}</p>
    <p><strong>Локация:</strong> ${location}</p>
    <p><strong>Държава:</strong> ${team.strCountry || "Няма данни"}</p>
    <p><strong>Уебсайт:</strong> ${
      website
        ? `<a href="https://${website.replace(/^https?:\/\//, "")}" target="_blank" rel="noreferrer">${website}</a>`
        : "Няма данни"
    }</p>
    <p><strong>Описание:</strong> ${description.slice(0, 320)}...</p>
  `;
}

function renderSquad(players = []) {
  if (!players.length) {
    squadList.innerHTML = '<li class="empty">Няма налични данни за състава.</li>';
    return;
  }

  squadList.innerHTML = players
    .slice(0, 25)
    .map((player, idx) => {
      const position = player.strPosition || "Неуточнена позиция";
      return `<li>${idx + 1}. ${player.strPlayer} (${position})</li>`;
    })
    .join("");
}

function getOutcome(match, teamName) {
  const home = (match.strHomeTeam || "").toLowerCase();
  const away = (match.strAwayTeam || "").toLowerCase();
  const selected = (teamName || "").toLowerCase();
  const homeScore = Number(match.intHomeScore);
  const awayScore = Number(match.intAwayScore);

  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
    return { key: "draw", label: "N/A" };
  }

  if (home === selected) {
    if (homeScore > awayScore) return { key: "win", label: "Победа" };
    if (homeScore < awayScore) return { key: "loss", label: "Загуба" };
    return { key: "draw", label: "Равен" };
  }

  if (away === selected) {
    if (awayScore > homeScore) return { key: "win", label: "Победа" };
    if (awayScore < homeScore) return { key: "loss", label: "Загуба" };
    return { key: "draw", label: "Равен" };
  }

  return { key: "draw", label: "Равен" };
}

function renderMatches(matches = [], selectedTeamName = "") {
  if (!matches.length) {
    matchesList.innerHTML = '<li class="empty">Няма налични данни за мачове.</li>';
    return;
  }

  matchesList.innerHTML = matches
    .slice(0, 8)
    .map((match, idx) => {
      const home = match.strHomeTeam || "?";
      const away = match.strAwayTeam || "?";
      const score = `${match.intHomeScore ?? "?"}:${match.intAwayScore ?? "?"}`;
      const date = match.dateEvent || "Няма дата";
      const outcome = getOutcome(match, selectedTeamName);
      return `<li class="match-item match-${outcome.key}">${idx + 1}. ${home} vs ${away} (${score}) - ${date} <span class="match-badge">${outcome.label}</span></li>`;
    })
    .join("");
}

async function fetchTeamData(teamName) {
  const teamSearch = await apiGet(`/searchteams.php?t=${encodeURIComponent(teamName)}`);
  if (!teamSearch.teams || !teamSearch.teams.length) {
    throw new Error("Няма намерен отбор с това име.");
  }

  const candidates = teamSearch.teams.filter((t) => t.strSport === "Soccer").slice(0, 6);

  // Pick the most useful candidate when search returns many teams with similar names.
  const scored = await Promise.all(
    candidates.map(async (team) => {
      const [playersData, matchesData] = await Promise.all([
        apiGet(`/lookup_all_players.php?id=${team.idTeam}`),
        apiGet(`/eventslast.php?id=${team.idTeam}`),
      ]);

      const players = playersData.player || [];
      const matches = matchesData.results || [];
      return {
        team,
        players,
        matches,
        score: players.length * 10 + matches.length,
      };
    })
  );

  scored.sort((a, b) => b.score - a.score);
  let best = scored[0];

  if (!best) {
    throw new Error("Не е открит подходящ отбор.");
  }

  // Fallback 1: search players by team name if roster endpoint is empty.
  if (!best.players.length) {
    const playersByName = await apiGet(
      `/searchplayers.php?t=${encodeURIComponent(best.team.strTeam || teamName)}`
    );
    best.players = playersByName.player || [];
  }

  // Fallback 2: if no last matches are available, try next matches endpoint.
  if (!best.matches.length) {
    const nextMatches = await apiGet(`/eventsnext.php?id=${best.team.idTeam}`);
    best.matches = nextMatches.events || [];
  }

  return {
    team: best.team,
    players: best.players,
    matches: best.matches,
  };
}

async function loadData() {
  const teamName = teamNameInput.value.trim();

  if (!teamName) {
    setStatus("Моля въведи име на отбор.", "error");
    return;
  }

  setStatus("Зареждане на данни...", "");

  try {
    const teamData = await fetchTeamData(teamName);
    renderClub(teamData.team);
    renderSquad(teamData.players);
    renderMatches(teamData.matches, teamData.team.strTeam);

    const name = teamData.team.strTeam || "Клуб";
    setStatus(
      `Данните за ${name} са заредени: ${teamData.players.length} играчи, ${teamData.matches.length} мача.`,
      "ok"
    );
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Грешка при мрежова заявка. Ако си отворил файла през file://, пусни го през локален сървър."
        : `Грешка: ${error.message}`;
    setStatus(message, "error");
    clubCard.classList.add("empty");
    clubCard.textContent = "Неуспешно зареждане на клубната информация.";
    renderSquad([]);
    renderMatches([]);
  }
}

function init() {
  loadBtn.addEventListener("click", loadData);
}

init();

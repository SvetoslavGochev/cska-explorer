const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";

const teamNameInput = document.getElementById("team-name");
const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const clubCard = document.getElementById("club-card");
const squadList = document.getElementById("squad-list");
const matchesList = document.getElementById("matches-list");
const nextMatchesList = document.getElementById("next-matches-list");
const summaryGrid = document.getElementById("summary-grid");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatText(value, fallback = "Няма данни") {
  const trimmed = String(value ?? "").trim();
  return trimmed ? escapeHtml(trimmed) : fallback;
}

function safeMediaUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function setLoadingState(isLoading) {
  loadBtn.disabled = isLoading;
  loadBtn.textContent = isLoading ? "Зареждане..." : "Зареди данни";
  loadBtn.classList.toggle("is-loading", isLoading);
  clubCard.setAttribute("aria-busy", String(isLoading));
  squadList.setAttribute("aria-busy", String(isLoading));
  matchesList.setAttribute("aria-busy", String(isLoading));
  nextMatchesList.setAttribute("aria-busy", String(isLoading));
  summaryGrid.setAttribute("aria-busy", String(isLoading));

  if (!isLoading) {
    return;
  }

  clubCard.className = "club-card loading-state";
  clubCard.innerHTML = `
    <div class="club-loading-lines" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p>Зареждам клубната информация...</p>
  `;
  squadList.innerHTML = '<li class="empty loading-item">Зареждам състава...</li>';
  matchesList.innerHTML = '<li class="empty loading-item">Зареждам мачовете...</li>';
  nextMatchesList.innerHTML = '<li class="empty loading-item">Зареждам следващите мачове...</li>';
  summaryGrid.innerHTML = `
    <article><span>Играчите</span><strong>...</strong></article>
    <article><span>Последни мачове</span><strong>...</strong></article>
    <article><span>Голове</span><strong>...</strong></article>
    <article><span>Форма</span><strong>...</strong></article>
  `;
}

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
  const founded = formatText(team.intFormedYear);
  const venue = formatText(team.strStadium);
  const location = formatText(team.strLocation);
  const website = team.strWebsite || "";
  const description = formatText(
    (team.strDescriptionEN || "").slice(0, 420),
    "Няма налично описание."
  );
  const badge = safeMediaUrl(team.strBadge);
  const banner = safeMediaUrl(team.strTeamBanner || team.strTeamFanart1 || team.strFanart1);
  const league = formatText(team.strLeague);
  const country = formatText(team.strCountry);
  const capacity = formatText(team.intStadiumCapacity);
  const keywords = formatText(team.strKeywords, "Футбол, България, ЦСКА");
  const teamName = formatText(team.strTeam, "Няма данни");
  const stadiumThumb = safeMediaUrl(team.strStadiumThumb);

  clubCard.classList.remove("empty");
  clubCard.classList.remove("loading-state");
  clubCard.innerHTML = `
    <div class="club-hero">
      <div class="club-identity">
        ${badge ? `<img class="club-badge" src="${badge}" alt="Емблема на ${teamName}" />` : ""}
        <div>
          <p class="club-kicker">Клубен профил</p>
          <h3>${teamName}</h3>
          <p class="club-summary">${league} • ${country}</p>
        </div>
      </div>
      ${banner ? `<img class="club-banner" src="${banner}" alt="Банер на ${teamName}" />` : ""}
    </div>
    <div class="fact-grid">
      <article>
        <span>Основан</span>
        <strong>${founded}</strong>
      </article>
      <article>
        <span>Стадион</span>
        <strong>${venue}</strong>
      </article>
      <article>
        <span>Капацитет</span>
        <strong>${capacity}</strong>
      </article>
      <article>
        <span>Локация</span>
        <strong>${location}</strong>
      </article>
    </div>
    <div class="club-copy">
      <p><strong>Държава:</strong> ${country}</p>
      <p><strong>Ключови думи:</strong> ${keywords}</p>
      <p><strong>Уебсайт:</strong> ${
      website
        ? `<a href="https://${website.replace(/^https?:\/\//, "")}" target="_blank" rel="noreferrer">${escapeHtml(website)}</a>`
        : "Няма данни"
    }</p>
      <p><strong>Описание:</strong> ${description}${description.endsWith(".") ? "" : "..."}</p>
    </div>
    ${stadiumThumb ? `<img class="club-stadium" src="${stadiumThumb}" alt="Стадион на ${teamName}" />` : ""}
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
      const position = formatText(player.strPosition, "Неуточнена позиция");
      const playerName = formatText(player.strPlayer, "Неизвестен играч");
      const number = formatText(player.strNumber, "-");
      return `<li><span class="list-index">${idx + 1}.</span> <span class="player-name">${playerName}</span> <span class="player-meta">#${number} • ${position}</span></li>`;
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

function matchIncludesTeam(match, teamName) {
  const selected = (teamName || "").trim().toLowerCase();
  if (!selected) {
    return false;
  }

  return [match.strHomeTeam, match.strAwayTeam].some(
    (team) => (team || "").trim().toLowerCase() === selected
  );
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
      return `<li class="match-item match-${outcome.key}"><span class="list-index">${idx + 1}.</span><div class="match-copy"><strong>${escapeHtml(home)} vs ${escapeHtml(away)}</strong><span>${escapeHtml(score)} • ${escapeHtml(date)}</span></div><span class="match-badge">${escapeHtml(outcome.label)}</span></li>`;
    })
    .join("");
}

function renderNextMatches(matches = []) {
  if (!matches.length) {
    nextMatchesList.innerHTML = '<li class="empty">Няма налични данни за предстоящи мачове.</li>';
    return;
  }

  nextMatchesList.innerHTML = matches
    .slice(0, 5)
    .map((match, idx) => {
      const home = formatText(match.strHomeTeam, "?");
      const away = formatText(match.strAwayTeam, "?");
      const date = formatText(match.dateEvent, "Няма дата");
      const time = formatText(match.strTimeLocal || match.strTime, "Час TBD");
      return `<li class="match-item upcoming-match"><span class="list-index">${idx + 1}.</span><div class="match-copy"><strong>${home} vs ${away}</strong><span>${date} • ${time}</span></div><span class="match-badge upcoming-badge">Предстои</span></li>`;
    })
    .join("");
}

function summarizeMatches(matches = [], selectedTeamName = "") {
  return matches.reduce(
    (summary, match) => {
      const outcome = getOutcome(match, selectedTeamName);
      const home = (match.strHomeTeam || "").toLowerCase();
      const away = (match.strAwayTeam || "").toLowerCase();
      const selected = (selectedTeamName || "").toLowerCase();
      const homeScore = Number(match.intHomeScore);
      const awayScore = Number(match.intAwayScore);

      if (Number.isFinite(homeScore) && Number.isFinite(awayScore)) {
        if (home === selected) {
          summary.goalsFor += homeScore;
          summary.goalsAgainst += awayScore;
        } else if (away === selected) {
          summary.goalsFor += awayScore;
          summary.goalsAgainst += homeScore;
        }
      }

      if (outcome.key === "win") summary.form.push("W");
      if (outcome.key === "draw") summary.form.push("D");
      if (outcome.key === "loss") summary.form.push("L");
      return summary;
    },
    { goalsFor: 0, goalsAgainst: 0, form: [] }
  );
}

function renderSummary(players = [], matches = [], selectedTeamName = "") {
  const summary = summarizeMatches(matches, selectedTeamName);
  const form = summary.form.slice(0, 5).join(" ") || "Няма данни";

  summaryGrid.innerHTML = `
    <article>
      <span>Играчите</span>
      <strong>${players.length || 0}</strong>
    </article>
    <article>
      <span>Последни мачове</span>
      <strong>${matches.length || 0}</strong>
    </article>
    <article>
      <span>Голове</span>
      <strong>${summary.goalsFor}:${summary.goalsAgainst}</strong>
    </article>
    <article>
      <span>Форма</span>
      <strong>${form}</strong>
    </article>
  `;
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
      const [playersData, matchesData, nextMatchesData] = await Promise.all([
        apiGet(`/lookup_all_players.php?id=${team.idTeam}`),
        apiGet(`/eventslast.php?id=${team.idTeam}`),
        apiGet(`/eventsnext.php?id=${team.idTeam}`),
      ]);

      const players = playersData.player || [];
      const matches = matchesData.results || [];
      const nextMatches = (nextMatchesData.events || []).filter((match) =>
        matchIncludesTeam(match, team.strTeam || teamName)
      );
      return {
        team,
        players,
        matches,
        nextMatches,
        score: players.length * 10 + matches.length + nextMatches.length,
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

  if (!best.nextMatches?.length) {
    const nextMatches = await apiGet(`/eventsnext.php?id=${best.team.idTeam}`);
    best.nextMatches = (nextMatches.events || []).filter((match) =>
      matchIncludesTeam(match, best.team.strTeam || teamName)
    );
  }

  return {
    team: best.team,
    players: best.players,
    matches: best.matches,
    nextMatches: best.nextMatches || [],
  };
}

async function loadData() {
  const teamName = teamNameInput.value.trim();

  if (!teamName) {
    setStatus("Моля въведи име на отбор.", "error");
    return;
  }

  setStatus("Зареждане на данни...", "");
  setLoadingState(true);

  try {
    const teamData = await fetchTeamData(teamName);
    renderClub(teamData.team);
    renderSquad(teamData.players);
    renderMatches(teamData.matches, teamData.team.strTeam);
    renderNextMatches(teamData.nextMatches);
    renderSummary(teamData.players, teamData.matches, teamData.team.strTeam);

    const name = teamData.team.strTeam || "Клуб";
    setStatus(
      `Данните за ${name} са заредени: ${teamData.players.length} играчи, ${teamData.matches.length} последни мача и ${teamData.nextMatches.length} предстоящи.`,
      "ok"
    );
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Грешка при мрежова заявка. Ако си отворил файла през file://, пусни го през локален сървър."
        : `Грешка: ${error.message}`;
    setStatus(message, "error");
    clubCard.classList.add("empty");
    clubCard.classList.remove("loading-state");
    clubCard.textContent = "Неуспешно зареждане на клубната информация.";
    renderSquad([]);
    renderMatches([]);
    renderNextMatches([]);
    renderSummary([], [], "");
  } finally {
    setLoadingState(false);
  }
}

function init() {
  loadBtn.addEventListener("click", loadData);
  teamNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadData();
    }
  });
  loadData();
}

init();

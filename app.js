const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";

const teamNameInput = document.getElementById("team-name");
const loadBtn = document.getElementById("load-btn");
const playerSearchInput = document.getElementById("player-search");
const playerSuggestions = document.getElementById("player-suggestions");
const searchPlayerBtn = document.getElementById("search-player-btn");
const statusEl = document.getElementById("status");
const clubCard = document.getElementById("club-card");
const squadList = document.getElementById("squad-list");
const matchesList = document.getElementById("matches-list");
const nextMatchesList = document.getElementById("next-matches-list");
const dataQualityEl = document.getElementById("data-quality");
const summaryGrid = document.getElementById("summary-grid");
const standingsCard = document.getElementById("standings-card");
const playerCard = document.getElementById("player-card");
const heroStats = document.getElementById("hero-stats");

let currentTeamData = null;
let playerNameIndex = [];

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

function normalizeName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function formatFormSequence(form) {
  const compact = String(form ?? "").trim();
  return compact ? compact.split("").join(" ") : "Няма данни";
}

function getSeasonCandidates(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const splitSeason = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

  return [...new Set([splitSeason, String(year), String(year - 1)])];
}

function setPlayerSearchLoading(isLoading) {
  searchPlayerBtn.disabled = isLoading;
  searchPlayerBtn.textContent = isLoading ? "Търсене..." : "Профил";
}

function refreshPlayerAutocomplete(players = []) {
  const names = [...new Set(players.map((player) => String(player.strPlayer || "").trim()).filter(Boolean))];
  playerNameIndex = names.sort((a, b) => a.localeCompare(b, "bg"));

  if (!playerSuggestions) {
    return;
  }

  playerSuggestions.innerHTML = playerNameIndex
    .map((name) => `<option value="${escapeHtml(name)}"></option>`)
    .join("");
}

function findPlayerSuggestion(fragment) {
  const query = normalizeName(fragment);
  if (query.length < 2) {
    return null;
  }

  return playerNameIndex.find((name) => normalizeName(name).startsWith(query)) || null;
}

function handlePlayerAutocompleteInput(event) {
  if (event.isComposing) {
    return;
  }

  const typed = playerSearchInput.value;
  const caret = playerSearchInput.selectionStart ?? typed.length;

  if (caret !== typed.length) {
    return;
  }

  if (typed.length < 2) {
    return;
  }

  if (event.inputType && event.inputType.startsWith("delete")) {
    return;
  }

  const suggestion = findPlayerSuggestion(typed);
  if (!suggestion || normalizeName(suggestion) === normalizeName(typed)) {
    return;
  }

  playerSearchInput.value = suggestion;
  playerSearchInput.setSelectionRange(typed.length, suggestion.length);
}

function setLoadingState(isLoading) {
  loadBtn.disabled = isLoading;
  loadBtn.textContent = isLoading ? "Зареждане..." : "Зареди данни";
  loadBtn.classList.toggle("is-loading", isLoading);
  clubCard.setAttribute("aria-busy", String(isLoading));
  squadList.setAttribute("aria-busy", String(isLoading));
  matchesList.setAttribute("aria-busy", String(isLoading));
  nextMatchesList.setAttribute("aria-busy", String(isLoading));
  dataQualityEl.setAttribute("aria-busy", String(isLoading));
  summaryGrid.setAttribute("aria-busy", String(isLoading));
  standingsCard.setAttribute("aria-busy", String(isLoading));
  playerCard.setAttribute("aria-busy", String(isLoading));
  heroStats.setAttribute("aria-busy", String(isLoading));

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
  dataQualityEl.className = "data-quality";
  dataQualityEl.textContent = "API quality: анализирам данните...";
  summaryGrid.innerHTML = `
    <article><span>Играчите</span><strong>...</strong></article>
    <article><span>Последни мачове</span><strong>...</strong></article>
    <article><span>Голове</span><strong>...</strong></article>
    <article><span>Форма</span><strong>...</strong></article>
  `;
  standingsCard.className = "standings-card empty";
  standingsCard.textContent = "Зареждам класирането...";
  playerCard.className = "player-card empty";
  playerCard.textContent = "Зареждам профила на играч...";
  heroStats.innerHTML = `
    <article><span>Позиция</span><strong>...</strong></article>
    <article><span>Точки</span><strong>...</strong></article>
    <article><span>Играчите</span><strong>...</strong></article>
    <article><span>Форма</span><strong>...</strong></article>
  `;
}

function getDataQualityLabel(quality = {}) {
  const level = quality.level || "limited";
  if (level === "high") {
    return "API quality: high";
  }
  if (level === "medium") {
    return "API quality: medium";
  }
  return "API quality: limited";
}

function renderDataQuality(quality = {}) {
  const level = quality.level || "limited";
  dataQualityEl.className = `data-quality data-quality-${level}`;
  const details = quality.details ? ` - ${quality.details}` : "";
  dataQualityEl.textContent = `${getDataQualityLabel(quality)}${details}`;
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

function renderHeroStats(team = null, standing = null, players = [], matches = []) {
  if (!team) {
    heroStats.innerHTML = `
      <article><span>Позиция</span><strong>-</strong></article>
      <article><span>Точки</span><strong>-</strong></article>
      <article><span>Играчите</span><strong>-</strong></article>
      <article><span>Форма</span><strong>-</strong></article>
    `;
    return;
  }

  const summary = summarizeMatches(matches, team.strTeam);
  heroStats.innerHTML = `
    <article>
      <span>Позиция</span>
      <strong>${standing?.intRank ? `#${standing.intRank}` : "-"}</strong>
    </article>
    <article>
      <span>Точки</span>
      <strong>${standing?.intPoints || "-"}</strong>
    </article>
    <article>
      <span>Играчите</span>
      <strong>${players.length || 0}</strong>
    </article>
    <article>
      <span>Форма</span>
      <strong>${standing?.strForm ? formatFormSequence(standing.strForm) : summary.form.slice(0, 5).join(" ") || "Няма данни"}</strong>
    </article>
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

function buildDataQuality(nextMatches = [], fallbackMatches = []) {
  if (nextMatches.length >= 3) {
    return {
      level: "high",
      details: `потвърдени ${nextMatches.length} предстоящи мача`,
    };
  }

  if (nextMatches.length > 0) {
    return {
      level: "medium",
      details: `налични са само ${nextMatches.length} потвърдени мача`,
    };
  }

  if (fallbackMatches.length > 0) {
    return {
      level: "limited",
      details: "няма потвърден следващ мач; показани са последни 3 срещи",
    };
  }

  return {
    level: "limited",
    details: "API не върна достатъчно надеждни данни",
  };
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

function renderNextMatches(matches = [], fallbackMatches = []) {
  if (matches.length) {
    nextMatchesList.innerHTML = matches
      .slice(0, 5)
      .map((match, idx) => {
        const home = formatText(match.strHomeTeam, "?");
        const away = formatText(match.strAwayTeam, "?");
        const date = formatText(match.dateEvent, "Няма дата");
        const time = formatText(match.strTimeLocal || match.strTime, "Час TBD");
        return `<li class="match-item upcoming-match"><span class="list-index">${idx + 1}.</span><div class="match-copy"><strong>${home} vs ${away}</strong><span>${date} • ${time}</span></div><span class="match-badge confirmed-badge">Потвърден</span></li>`;
      })
      .join("");
    return;
  }

  if (!fallbackMatches.length) {
    nextMatchesList.innerHTML = '<li class="empty">Няма налични данни за предстоящи мачове.</li>';
    return;
  }

  nextMatchesList.innerHTML = [
    '<li class="empty">Няма потвърден следващ официален мач от API. Показани са последни 3 срещи:</li>',
    ...fallbackMatches.slice(0, 3).map((match, idx) => {
      const home = formatText(match.strHomeTeam, "?");
      const away = formatText(match.strAwayTeam, "?");
      const score = `${match.intHomeScore ?? "?"}:${match.intAwayScore ?? "?"}`;
      const date = formatText(match.dateEvent, "Няма дата");
      return `<li class="match-item"><span class="list-index">${idx + 1}.</span><div class="match-copy"><strong>${home} vs ${away}</strong><span>${escapeHtml(score)} • ${date}</span></div><span class="match-badge fallback-badge">Fallback</span></li>`;
    }),
  ].join("");
}

function renderStandings(table = [], currentTeam = null) {
  if (!table.length) {
    standingsCard.className = "standings-card empty";
    standingsCard.textContent = "Няма налични данни за класирането в момента.";
    return;
  }

  const currentTeamId = String(currentTeam?.idTeam || "");
  const currentTeamName = currentTeam?.strTeam || "";
  const leaders = table.slice(0, 5);
  const currentRow = table.find(
    (row) =>
      String(row.idTeam || "") === currentTeamId || normalizeName(row.strTeam) === normalizeName(currentTeamName)
  );
  const visibleRows = leaders.slice();

  if (currentRow && !leaders.some((row) => String(row.idTeam || "") === String(currentRow.idTeam || ""))) {
    visibleRows.push(currentRow);
  }

  standingsCard.className = "standings-card";
  standingsCard.innerHTML = `
    <div class="standings-list">
      ${visibleRows
        .map((row) => {
          const isCurrent =
            String(row.idTeam || "") === currentTeamId ||
            normalizeName(row.strTeam) === normalizeName(currentTeamName);
          const badge = safeMediaUrl(row.strBadge);
          return `
            <article class="standing-row ${isCurrent ? "is-current" : ""}">
              <span class="standing-rank">#${escapeHtml(row.intRank || "-")}</span>
              ${badge ? `<img class="standing-badge" src="${badge}" alt="Емблема на ${formatText(row.strTeam, "Отбор")}" />` : ""}
              <div class="standing-copy">
                <strong>${formatText(row.strTeam, "Отбор")}</strong>
                <span>${escapeHtml(row.intPlayed || "0")} мача • ${escapeHtml(row.intGoalDifference || "0")} голова разлика</span>
              </div>
              <span class="standing-points">${escapeHtml(row.intPoints || "0")} т.</span>
            </article>
          `;
        })
        .join("")}
    </div>
    <p class="standings-note">Сезон: ${escapeHtml(table[0]?.strSeason || "Няма данни")} • Форма на ЦСКА: ${currentRow?.strForm ? formatFormSequence(currentRow.strForm) : "Няма данни"}</p>
  `;
}

function renderPlayerCard(player = null, teamName = "") {
  if (!player) {
    playerCard.className = "player-card empty";
    playerCard.textContent = teamName
      ? `Няма намерен играч в отбора ${teamName}.`
      : "Търси играч, за да видиш профила му.";
    return;
  }

  const playerName = formatText(player.strPlayer, "Неизвестен играч");
  const image = safeMediaUrl(player.strThumb || player.strCutout || player.strRender || player.strFanart1);
  const bio = formatText((player.strDescriptionEN || "").slice(0, 340), "Няма налична кратка биография.");

  playerCard.className = "player-card";
  playerCard.innerHTML = `
    <div class="player-hero">
      ${image ? `<img class="player-photo" src="${image}" alt="Снимка на ${playerName}" />` : ""}
      <div>
        <p class="club-kicker">Избран играч</p>
        <h3>${playerName}</h3>
        <p class="club-summary">${formatText(player.strPosition, "Позиция неизвестна")} • ${formatText(player.strNationality, "Националност неизвестна")}</p>
      </div>
    </div>
    <div class="fact-grid player-facts">
      <article>
        <span>Номер</span>
        <strong>${formatText(player.strNumber, "-")}</strong>
      </article>
      <article>
        <span>Роден</span>
        <strong>${formatText(player.dateBorn, "Няма данни")}</strong>
      </article>
      <article>
        <span>Ръст</span>
        <strong>${formatText(player.strHeight, "Няма данни")}</strong>
      </article>
      <article>
        <span>Тегло</span>
        <strong>${formatText(player.strWeight, "Няма данни")}</strong>
      </article>
    </div>
    <p class="player-bio">${bio}${bio.endsWith(".") ? "" : "..."}</p>
  `;
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

async function fetchStandings(team) {
  if (!team?.idLeague) {
    return { table: [], standing: null };
  }

  for (const season of getSeasonCandidates()) {
    const data = await apiGet(`/lookuptable.php?l=${encodeURIComponent(team.idLeague)}&s=${encodeURIComponent(season)}`);
    const table = data.table || [];

    if (!table.length) {
      continue;
    }

    const standing =
      table.find((row) => String(row.idTeam || "") === String(team.idTeam || "")) ||
      table.find((row) => normalizeName(row.strTeam) === normalizeName(team.strTeam));

    return { table, standing };
  }

  return { table: [], standing: null };
}

async function fetchPlayerProfile(query = "", teamData = currentTeamData) {
  if (!teamData?.team) {
    return null;
  }

  const players = teamData.players || [];
  const normalizedQuery = normalizeName(query);
  let rosterMatch = null;

  if (normalizedQuery) {
    rosterMatch =
      players.find((player) => normalizeName(player.strPlayer) === normalizedQuery) ||
      players.find((player) => normalizeName(player.strPlayer).includes(normalizedQuery));
  } else {
    rosterMatch = players[0] || null;
  }

  if (rosterMatch?.idPlayer) {
    const details = await apiGet(`/lookupplayer.php?id=${encodeURIComponent(rosterMatch.idPlayer)}`);
    return details.players?.[0] || rosterMatch;
  }

  if (!normalizedQuery) {
    return rosterMatch;
  }

  const search = await apiGet(`/searchplayers.php?p=${encodeURIComponent(query)}`);
  const candidate = (search.player || []).find(
    (player) =>
      String(player.idTeam || "") === String(teamData.team.idTeam || "") ||
      normalizeName(player.strTeam) === normalizeName(teamData.team.strTeam)
  );

  if (candidate?.idPlayer) {
    const details = await apiGet(`/lookupplayer.php?id=${encodeURIComponent(candidate.idPlayer)}`);
    return details.players?.[0] || candidate;
  }

  return candidate || null;
}

async function searchPlayer() {
  if (!currentTeamData) {
    setStatus("Първо зареди отбор, за да търсиш играч.", "error");
    return;
  }

  setPlayerSearchLoading(true);

  try {
    const player = await fetchPlayerProfile(playerSearchInput.value.trim(), currentTeamData);
    renderPlayerCard(player, currentTeamData.team?.strTeam || "");
  } catch (error) {
    renderPlayerCard(null, currentTeamData.team?.strTeam || "");
    setStatus(`Грешка при търсене на играч: ${error.message}`, "error");
  } finally {
    setPlayerSearchLoading(false);
  }
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
      const fallbackMatches = matches.slice(0, 3);
      const nextMatches = (nextMatchesData.events || []).filter((match) =>
        matchIncludesTeam(match, team.strTeam || teamName)
      );
      return {
        team,
        players,
        matches,
        fallbackMatches,
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

  best.fallbackMatches = (best.matches || []).slice(0, 3);
  const dataQuality = buildDataQuality(best.nextMatches || [], best.fallbackMatches || []);

  return {
    team: best.team,
    players: best.players,
    matches: best.matches,
    fallbackMatches: best.fallbackMatches || [],
    nextMatches: best.nextMatches || [],
    dataQuality,
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
    const [standingsData, featuredPlayer] = await Promise.all([
      fetchStandings(teamData.team),
      fetchPlayerProfile(playerSearchInput.value.trim(), teamData),
    ]);

    currentTeamData = teamData;
    refreshPlayerAutocomplete(teamData.players);
    renderClub(teamData.team);
    renderSquad(teamData.players);
    renderMatches(teamData.matches, teamData.team.strTeam);
    renderNextMatches(teamData.nextMatches, teamData.fallbackMatches);
    renderDataQuality(teamData.dataQuality);
    renderSummary(teamData.players, teamData.matches, teamData.team.strTeam);
    renderStandings(standingsData.table, teamData.team);
    renderPlayerCard(featuredPlayer, teamData.team.strTeam);
    renderHeroStats(teamData.team, standingsData.standing, teamData.players, teamData.matches);

    const name = teamData.team.strTeam || "Клуб";
    setStatus(
      `Данните за ${name} са заредени: ${teamData.players.length} играчи, ${teamData.matches.length} последни мача и ${teamData.nextMatches.length} потвърдени предстоящи (${getDataQualityLabel(teamData.dataQuality).replace("API quality: ", "")}).`,
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
    currentTeamData = null;
    refreshPlayerAutocomplete([]);
    renderSquad([]);
    renderMatches([]);
    renderNextMatches([], []);
    renderDataQuality({ level: "limited", details: "данните не могат да бъдат потвърдени" });
    renderSummary([], [], "");
    renderStandings([], null);
    renderPlayerCard(null, "");
    renderHeroStats();
  } finally {
    setLoadingState(false);
  }
}

function init() {
  loadBtn.addEventListener("click", loadData);
  searchPlayerBtn.addEventListener("click", searchPlayer);
  playerSearchInput.addEventListener("input", handlePlayerAutocompleteInput);
  teamNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadData();
    }
  });
  playerSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchPlayer();
    }
  });
  refreshPlayerAutocomplete([]);
  loadData();
}

init();

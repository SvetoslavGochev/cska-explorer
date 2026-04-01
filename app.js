const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const FLASHSCORE_TEAM_MIRROR_URL = "https://r.jina.ai/http://www.flashscore.bg/team/cska-sofia/0xFNNECi/";
const FLASHSCORE_SQUAD_MIRROR_URL = "https://r.jina.ai/http://www.flashscore.bg/team/cska-sofia/0xFNNECi/squad/";
const FCCSKA_MIRROR_URL = "https://r.jina.ai/http://www.fccska.com/";
const CACHE_TTL_MS = 5 * 60 * 60 * 1000;
const CACHE_VERSION = "v2";

const teamNameInput = document.getElementById("team-name");
const loadBtn = document.getElementById("load-btn");
const refreshBtn = document.getElementById("refresh-btn");
const playerSearchInput = document.getElementById("player-search");
const playerSuggestions = document.getElementById("player-suggestions");
const searchPlayerBtn = document.getElementById("search-player-btn");
const statusEl = document.getElementById("status");
const sourceMetaEl = document.getElementById("source-meta");
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

const CURRENT_LANG = document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "bg";
const UI_TEXT = {
  bg: {
    loadBtn: "Зареди данни",
    refreshBtn: "Обнови сега",
    loadingBtn: "Зареждане...",
    refreshingBtn: "Обновяване...",
    profileBtn: "Профил",
    searchingBtn: "Търсене...",
    loadingStatus: "Зареждане на данни...",
    enterTeamName: "Моля въведи име на отбор.",
    networkError:
      "Грешка при мрежова заявка. Ако си отворил файла през file://, пусни го през локален сървър.",
    profileKicker: "Клубен профил",
    founded: "Основан",
    stadium: "Стадион",
    capacity: "Капацитет",
    location: "Локация",
    country: "Държава",
    keywords: "Ключови думи",
    website: "Уебсайт",
    description: "Описание",
    noData: "Няма данни",
    noDescription: "Няма налично описание.",
    noSquadData: "Няма налични данни за състава.",
    noMatchesData: "Няма налични данни за мачове.",
    noUpcomingData: "Няма налични данни за предстоящи мачове.",
    noStandingsData: "Няма налични данни за класирането в момента.",
    unknownPosition: "Неуточнена позиция",
    unknownPlayer: "Неизвестен играч",
    noDate: "Няма дата",
    timeTBD: "Час TBD",
    win: "Победа",
    draw: "Равен",
    loss: "Загуба",
    pending: "Потвърден",
    fallback: "Fallback",
    playerSearchNeedsTeam: "Първо зареди отбор, за да търсиш играч.",
    playerSearchError: "Грешка при търсене на играч",
    noPlayerInTeam: "Няма намерен играч в отбора",
    noPlayerPrompt: "Търси играч, за да видиш профила му.",
    selectedPlayer: "Избран играч",
    number: "Номер",
    born: "Роден",
    height: "Ръст",
    weight: "Тегло",
    noBio: "Няма налична кратка биография.",
    players: "Играчите",
    lastMatches: "Последни мачове",
    goals: "Голове",
    form: "Форма",
    season: "Сезон",
    teamFormPrefix: "Форма на",
    apiQualityPrefix: "API quality",
    qualityHigh: "high",
    qualityMedium: "medium",
    qualityLimited: "limited",
    qualityAnalyzing: "API quality: анализирам данните...",
    qualityWaiting: "API quality: изчаква данни...",
    fallbackUpcomingNotice:
      "Няма потвърден следващ официален мач от API. Показани са последни 3 срещи:",
    cacheFreshUsed: "Заредени са кеширани данни (до 5 часа).",
    cacheStaleUsed: "Няма връзка с API. Показани са последните кеширани данни.",
    sourceFccskaUsed: "API е недостъпен. Показан е резервен профил от fccska.com.",
    sourceFlashscoreUsed: "API е недостъпен. Показани са резервни мачове от flashscore.bg.",
    sourceLabelApi: "източник: TheSportsDB",
    sourceLabelCache: "източник: local cache",
    sourceLabelFlashscore: "източник: flashscore mirror",
    sourceLabelFccska: "източник: fccska mirror",
    lastUpdatedPrefix: "Последно обновяване",
    unknownUpdateTime: "неизвестно",
  },
  en: {
    loadBtn: "Load Data",
    refreshBtn: "Refresh Now",
    loadingBtn: "Loading...",
    refreshingBtn: "Refreshing...",
    profileBtn: "Profile",
    searchingBtn: "Searching...",
    loadingStatus: "Loading data...",
    enterTeamName: "Please enter a team name.",
    networkError:
      "Network request failed. If you opened via file://, run the app through a local server.",
    profileKicker: "Club Profile",
    founded: "Founded",
    stadium: "Stadium",
    capacity: "Capacity",
    location: "Location",
    country: "Country",
    keywords: "Keywords",
    website: "Website",
    description: "Description",
    noData: "No data",
    noDescription: "No description available.",
    noSquadData: "No squad data available.",
    noMatchesData: "No match data available.",
    noUpcomingData: "No upcoming matches available.",
    noStandingsData: "No standings data available right now.",
    unknownPosition: "Position unknown",
    unknownPlayer: "Unknown player",
    noDate: "No date",
    timeTBD: "Time TBD",
    win: "Win",
    draw: "Draw",
    loss: "Loss",
    pending: "Confirmed",
    fallback: "Fallback",
    playerSearchNeedsTeam: "Load a team first before searching players.",
    playerSearchError: "Player search error",
    noPlayerInTeam: "No player found in team",
    noPlayerPrompt: "Search for a player to view profile details.",
    selectedPlayer: "Selected Player",
    number: "Number",
    born: "Born",
    height: "Height",
    weight: "Weight",
    noBio: "No short biography available.",
    players: "Players",
    lastMatches: "Last Matches",
    goals: "Goals",
    form: "Form",
    season: "Season",
    teamFormPrefix: "Form for",
    apiQualityPrefix: "API quality",
    qualityHigh: "high",
    qualityMedium: "medium",
    qualityLimited: "limited",
    qualityAnalyzing: "API quality: analyzing data...",
    qualityWaiting: "API quality: waiting for data...",
    fallbackUpcomingNotice:
      "No confirmed upcoming official match from API. Showing last 3 fixtures instead:",
    cacheFreshUsed: "Loaded cached data (up to 5 hours old).",
    cacheStaleUsed: "API is unavailable. Showing latest cached snapshot.",
    sourceFccskaUsed: "API is unavailable. Showing backup club profile from fccska.com.",
    sourceFlashscoreUsed: "API is unavailable. Showing backup fixtures from flashscore.bg.",
    sourceLabelApi: "source: TheSportsDB",
    sourceLabelCache: "source: local cache",
    sourceLabelFlashscore: "source: flashscore mirror",
    sourceLabelFccska: "source: fccska mirror",
    lastUpdatedPrefix: "Last updated",
    unknownUpdateTime: "unknown",
  },
};

const UI = UI_TEXT[CURRENT_LANG];

function teamDescriptionForLang(team) {
  if (CURRENT_LANG === "en") {
    return formatText((team.strDescriptionEN || "").slice(0, 420), UI.noDescription);
  }

  const teamName = team.strTeam || "Отборът";
  const normalized = normalizeName(teamName);
  if (normalized === "cska sofia" || normalized === "цска") {
    return escapeHtml(
      "ЦСКА София е сред водещите клубове в българския футбол, с богата история, силна фенска култура и сериозно присъствие в националните турнири и европейските кампании."
    );
  }

  const description = `${teamName} е футболен клуб от ${team.strCountry || "неизвестна държава"}, който се състезава в ${team.strLeague || "национално първенство"}. Основан е през ${team.intFormedYear || "неизвестна година"} и домакинства на ${team.strStadium || "своя стадион"} в ${team.strLocation || "своя град"}.`;
  return escapeHtml(description);
}

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

function getCacheKey(teamName) {
  return `cska-explorer:${CACHE_VERSION}:${normalizeName(teamName)}`;
}

function saveTeamSnapshot(teamName, snapshot) {
  try {
    localStorage.setItem(getCacheKey(teamName), JSON.stringify(snapshot));
  } catch {
    // Ignore storage write failures (private mode/quota) and continue.
  }
}

function readTeamSnapshot(teamName) {
  try {
    const raw = localStorage.getItem(getCacheKey(teamName));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || !parsed?.teamData?.team) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isSnapshotFresh(snapshot) {
  if (!snapshot?.savedAt) {
    return false;
  }
  return Date.now() - snapshot.savedAt <= CACHE_TTL_MS;
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return UI.unknownUpdateTime;
  }

  return date.toLocaleString(CURRENT_LANG === "en" ? "en-GB" : "bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveSourceLabel(source) {
  if (source === "sportsdb") {
    return UI.sourceLabelApi;
  }
  if (source === "flashscore") {
    return UI.sourceLabelFlashscore;
  }
  if (source === "fccska") {
    return UI.sourceLabelFccska;
  }
  return UI.sourceLabelCache;
}

function setSourceMeta(savedAt, sourceLabel) {
  if (!sourceMetaEl) {
    return;
  }

  const timeLabel = savedAt ? formatTimestamp(savedAt) : UI.unknownUpdateTime;
  const sourcePart = sourceLabel ? ` • ${sourceLabel}` : "";
  sourceMetaEl.textContent = `${UI.lastUpdatedPrefix}: ${timeLabel}${sourcePart}`;
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
  searchPlayerBtn.textContent = isLoading ? UI.searchingBtn : UI.profileBtn;
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
  loadBtn.textContent = isLoading ? UI.loadingBtn : UI.loadBtn;
  loadBtn.classList.toggle("is-loading", isLoading);
  if (refreshBtn) {
    refreshBtn.disabled = isLoading;
    refreshBtn.textContent = isLoading ? UI.refreshingBtn : UI.refreshBtn;
    refreshBtn.classList.toggle("is-loading", isLoading);
  }
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
  nextMatchesList.innerHTML = `<li class="empty loading-item">${
    CURRENT_LANG === "en" ? "Loading upcoming matches..." : "Зареждам следващите мачове..."
  }</li>`;
  dataQualityEl.className = "data-quality";
  dataQualityEl.textContent = UI.qualityAnalyzing;
  summaryGrid.innerHTML = `
    <article><span>${UI.players}</span><strong>...</strong></article>
    <article><span>${UI.lastMatches}</span><strong>...</strong></article>
    <article><span>${UI.goals}</span><strong>...</strong></article>
    <article><span>${UI.form}</span><strong>...</strong></article>
  `;
  standingsCard.className = "standings-card empty";
  standingsCard.textContent =
    CURRENT_LANG === "en" ? "Loading standings..." : "Зареждам класирането...";
  playerCard.className = "player-card empty";
  playerCard.textContent =
    CURRENT_LANG === "en" ? "Loading player profile..." : "Зареждам профила на играч...";
  heroStats.innerHTML = `
    <article><span>${CURRENT_LANG === "en" ? "Position" : "Позиция"}</span><strong>...</strong></article>
    <article><span>${CURRENT_LANG === "en" ? "Points" : "Точки"}</span><strong>...</strong></article>
    <article><span>${UI.players}</span><strong>...</strong></article>
    <article><span>${UI.form}</span><strong>...</strong></article>
  `;
}

function getDataQualityLabel(quality = {}) {
  const level = quality.level || "limited";
  if (level === "high") {
    return `${UI.apiQualityPrefix}: ${UI.qualityHigh}`;
  }
  if (level === "medium") {
    return `${UI.apiQualityPrefix}: ${UI.qualityMedium}`;
  }
  return `${UI.apiQualityPrefix}: ${UI.qualityLimited}`;
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
  const founded = formatText(team.intFormedYear, UI.noData);
  const venue = formatText(team.strStadium, UI.noData);
  const location = formatText(team.strLocation, UI.noData);
  const website = team.strWebsite || "";
  const description = teamDescriptionForLang(team);
  const badge = safeMediaUrl(team.strBadge);
  const banner = safeMediaUrl(team.strTeamBanner || team.strTeamFanart1 || team.strFanart1);
  const league = formatText(team.strLeague, UI.noData);
  const country = formatText(team.strCountry, UI.noData);
  const capacity = formatText(team.intStadiumCapacity, UI.noData);
  const keywords = formatText(team.strKeywords, CURRENT_LANG === "en" ? "Football" : "Футбол, България, ЦСКА");
  const teamName = formatText(team.strTeam, UI.noData);
  const stadiumThumb = safeMediaUrl(team.strStadiumThumb);

  clubCard.classList.remove("empty");
  clubCard.classList.remove("loading-state");
  clubCard.innerHTML = `
    <div class="club-hero">
      <div class="club-identity">
        ${badge ? `<img class="club-badge" src="${badge}" alt="Емблема на ${teamName}" />` : ""}
        <div>
          <p class="club-kicker">${UI.profileKicker}</p>
          <h3>${teamName}</h3>
          <p class="club-summary">${league} • ${country}</p>
        </div>
      </div>
      ${banner ? `<img class="club-banner" src="${banner}" alt="Банер на ${teamName}" />` : ""}
    </div>
    <div class="fact-grid">
      <article>
        <span>${UI.founded}</span>
        <strong>${founded}</strong>
      </article>
      <article>
        <span>${UI.stadium}</span>
        <strong>${venue}</strong>
      </article>
      <article>
        <span>${UI.capacity}</span>
        <strong>${capacity}</strong>
      </article>
      <article>
        <span>${UI.location}</span>
        <strong>${location}</strong>
      </article>
    </div>
    <div class="club-copy">
      <p><strong>${UI.country}:</strong> ${country}</p>
      <p><strong>${UI.keywords}:</strong> ${keywords}</p>
      <p><strong>${UI.website}:</strong> ${
      website
        ? `<a href="https://${website.replace(/^https?:\/\//, "")}" target="_blank" rel="noreferrer">${escapeHtml(website)}</a>`
        : UI.noData
    }</p>
      <p><strong>${UI.description}:</strong> ${description}${description.endsWith(".") ? "" : "..."}</p>
    </div>
    ${stadiumThumb ? `<img class="club-stadium" src="${stadiumThumb}" alt="Стадион на ${teamName}" />` : ""}
  `;
}

function renderHeroStats(team = null, standing = null, players = [], matches = []) {
  if (!team) {
    heroStats.innerHTML = `
      <article><span>${CURRENT_LANG === "en" ? "Position" : "Позиция"}</span><strong>-</strong></article>
      <article><span>${CURRENT_LANG === "en" ? "Points" : "Точки"}</span><strong>-</strong></article>
      <article><span>${UI.players}</span><strong>-</strong></article>
      <article><span>${UI.form}</span><strong>-</strong></article>
    `;
    return;
  }

  const summary = summarizeMatches(matches, team.strTeam);
  heroStats.innerHTML = `
    <article>
      <span>${CURRENT_LANG === "en" ? "Position" : "Позиция"}</span>
      <strong>${standing?.intRank ? `#${standing.intRank}` : "-"}</strong>
    </article>
    <article>
      <span>${CURRENT_LANG === "en" ? "Points" : "Точки"}</span>
      <strong>${standing?.intPoints || "-"}</strong>
    </article>
    <article>
      <span>${UI.players}</span>
      <strong>${players.length || 0}</strong>
    </article>
    <article>
      <span>${UI.form}</span>
      <strong>${standing?.strForm ? formatFormSequence(standing.strForm) : summary.form.slice(0, 5).join(" ") || "Няма данни"}</strong>
    </article>
  `;
}

function renderSquad(players = []) {
  if (!players.length) {
    squadList.innerHTML = `<li class="empty">${UI.noSquadData}</li>`;
    return;
  }

  squadList.innerHTML = players
    .slice(0, 25)
    .map((player, idx) => {
      const position = formatText(player.strPosition, UI.unknownPosition);
      const playerName = formatText(player.strPlayer, UI.unknownPlayer);
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
    if (homeScore > awayScore) return { key: "win", label: UI.win };
    if (homeScore < awayScore) return { key: "loss", label: UI.loss };
    return { key: "draw", label: UI.draw };
  }

  if (away === selected) {
    if (awayScore > homeScore) return { key: "win", label: UI.win };
    if (awayScore < homeScore) return { key: "loss", label: UI.loss };
    return { key: "draw", label: UI.draw };
  }

  return { key: "draw", label: UI.draw };
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
      details:
        CURRENT_LANG === "en"
          ? `${nextMatches.length} confirmed upcoming fixtures`
          : `потвърдени ${nextMatches.length} предстоящи мача`,
    };
  }

  if (nextMatches.length > 0) {
    return {
      level: "medium",
      details:
        CURRENT_LANG === "en"
          ? `only ${nextMatches.length} confirmed fixtures are available`
          : `налични са само ${nextMatches.length} потвърдени мача`,
    };
  }

  if (fallbackMatches.length > 0) {
    return {
      level: "limited",
      details:
        CURRENT_LANG === "en"
          ? "no confirmed next match; showing last 3 fixtures"
          : "няма потвърден следващ мач; показани са последни 3 срещи",
    };
  }

  return {
    level: "limited",
    details:
      CURRENT_LANG === "en"
        ? "API did not return enough reliable data"
        : "API не върна достатъчно надеждни данни",
  };
}

function renderAll(teamData, standingsData = { table: [], standing: null }, featuredPlayer = null) {
  currentTeamData = teamData;
  refreshPlayerAutocomplete(teamData.players || []);
  renderClub(teamData.team || {});
  renderSquad(teamData.players || []);
  renderMatches(teamData.matches || [], teamData.team?.strTeam || "");
  renderNextMatches(teamData.nextMatches || [], teamData.fallbackMatches || []);
  renderDataQuality(teamData.dataQuality || { level: "limited" });
  renderSummary(teamData.players || [], teamData.matches || [], teamData.team?.strTeam || "");
  renderStandings(standingsData?.table || [], teamData.team || null);
  renderPlayerCard(featuredPlayer, teamData.team?.strTeam || "");
  renderHeroStats(teamData.team || null, standingsData?.standing || null, teamData.players || [], teamData.matches || []);
}

async function fetchFccskaSnapshot(teamName) {
  const response = await fetch(FCCSKA_MIRROR_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while loading fccska mirror`);
  }

  const text = await response.text();
  const compact = text.replace(/\s+/g, " ").trim();
  const mentionIdx = compact.toLowerCase().indexOf("цска");
  const excerpt = mentionIdx >= 0 ? compact.slice(mentionIdx, mentionIdx + 380) : compact.slice(0, 380);

  return {
    team: {
      strTeam: teamName,
      strLeague: "efbet Liga",
      strCountry: "Bulgaria",
      intFormedYear: "1948",
      strLocation: "Sofia",
      strWebsite: "www.fccska.com",
      strDescriptionEN: excerpt,
    },
    players: [],
    matches: [],
    fallbackMatches: [],
    nextMatches: [],
    dataQuality: {
      level: "limited",
      details: UI.sourceLabelFccska,
    },
  };
}

function parseFlashscoreUpcomingFromText(text) {
  const summaryMatch = String(text || "").match(
    /Следващи мачове:\s*([\s\S]*?)(?:Покажи още|Топ\s*\[футбол\]|Flashscore\.bg|$)/i
  );
  if (!summaryMatch) {
    return [];
  }

  const summaryText = summaryMatch[1].replace(/\s+/g, " ").trim();

  const rawList = summaryText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

  return rawList
    .map((item) => {
      const parts = item.match(/^(\d{2}\.\d{2})\.\s+(.+?)\s+-\s+(.+)$/);
      if (!parts) {
        return null;
      }

      const [, dayMonth, home, away] = parts;
      const [day, month] = dayMonth.split(".");
      const year = new Date().getFullYear();
      const awayClean = away
        .replace(/\s*(Покажи още|Топ\s*\[футбол\]).*$/i, "")
        .trim();
      return {
        strHomeTeam: home.trim(),
        strAwayTeam: awayClean,
        dateEvent: `${year}-${month}-${day}`,
        strTime: "",
      };
    })
    .filter(Boolean);
}

function mapFlashscorePosition(label) {
  const normalized = String(label || "").trim().toLowerCase();
  if (normalized === "вратари") {
    return CURRENT_LANG === "en" ? "Goalkeeper" : "Вратар";
  }
  if (normalized === "защитници") {
    return CURRENT_LANG === "en" ? "Defender" : "Защитник";
  }
  if (normalized === "халфове") {
    return CURRENT_LANG === "en" ? "Midfielder" : "Халф";
  }
  if (normalized === "нападатели") {
    return CURRENT_LANG === "en" ? "Forward" : "Нападател";
  }
  if (normalized === "треньор") {
    return CURRENT_LANG === "en" ? "Coach" : "Треньор";
  }
  return UI.unknownPosition;
}

function parseFlashscoreSquadFromText(text) {
  const source = String(text || "");
  const startIdx = source.search(/\bВратари\b/i);
  const endCandidates = [
    source.search(/##\s*Последни\s+новини/i),
    source.search(/##\s*Предстоящи/i),
    source.search(/##\s*Последни/i),
    source.search(/##\s*Трансфери/i),
  ].filter((idx) => idx > startIdx);
  const endIdx = endCandidates.length ? Math.min(...endCandidates) : source.length;
  const segment = startIdx >= 0 ? source.slice(startIdx, endIdx) : source;
  const lines = segment.split(/\r?\n/);
  const headingPattern = /^(Вратари|Защитници|Халфове|Нападатели|Треньор)$/i;
  const playerPattern = /^\[(.+?)\]\(https?:\/\/www\.flashscore\.bg\/player\//i;
  const players = [];
  const seen = new Set();
  let currentGroup = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const heading = line.match(headingPattern);
    if (heading) {
      currentGroup = heading[1];
      continue;
    }

    const player = line.match(playerPattern);
    if (!player) {
      continue;
    }

    const name = player[1].trim();
    const key = normalizeName(name);
    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    players.push({
      strPlayer: name,
      strPosition: mapFlashscorePosition(currentGroup),
      strNumber: "-",
    });
  }

  return players;
}

async function fetchFlashscoreSnapshot(teamName) {
  const [teamResponse, squadResponse] = await Promise.all([
    fetch(FLASHSCORE_TEAM_MIRROR_URL),
    fetch(FLASHSCORE_SQUAD_MIRROR_URL),
  ]);
  if (!teamResponse.ok) {
    throw new Error(`HTTP ${teamResponse.status} while loading flashscore team mirror`);
  }
  if (!squadResponse.ok) {
    throw new Error(`HTTP ${squadResponse.status} while loading flashscore squad mirror`);
  }

  const [text, squadText] = await Promise.all([teamResponse.text(), squadResponse.text()]);
  const upcoming = parseFlashscoreUpcomingFromText(text);
  const squad = parseFlashscoreSquadFromText(squadText);
  const excerptStart = text.toLowerCase().indexOf("футбол, българия: цска");
  const excerpt =
    excerptStart >= 0
      ? text.slice(excerptStart, excerptStart + 380).replace(/\s+/g, " ").trim()
      : text.slice(0, 380).replace(/\s+/g, " ").trim();

  return {
    team: {
      strTeam: teamName,
      strLeague: "efbet Liga",
      strCountry: "Bulgaria",
      intFormedYear: "1948",
      strLocation: "Sofia",
      strStadium: "Нац. стадион \"Васил Левски\"",
      intStadiumCapacity: "43230",
      strWebsite: "www.flashscore.bg",
      strDescriptionEN: excerpt,
    },
    players: squad,
    matches: [],
    fallbackMatches: [],
    nextMatches: upcoming,
    source: "flashscore",
    dataQuality: {
      level: upcoming.length ? "medium" : "limited",
      details: UI.sourceLabelFlashscore,
    },
  };
}

async function fetchPrimaryTeamData(teamName) {
  try {
    return await fetchFlashscoreSnapshot(teamName);
  } catch {
    const apiData = await fetchTeamData(teamName);
    return { ...apiData, source: "sportsdb" };
  }
}

function renderMatches(matches = [], selectedTeamName = "") {
  if (!matches.length) {
    matchesList.innerHTML = `<li class="empty">${UI.noMatchesData}</li>`;
    return;
  }

  matchesList.innerHTML = matches
    .slice(0, 8)
    .map((match, idx) => {
      const home = match.strHomeTeam || "?";
      const away = match.strAwayTeam || "?";
      const score = `${match.intHomeScore ?? "?"}:${match.intAwayScore ?? "?"}`;
      const date = match.dateEvent || UI.noDate;
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
        const date = formatText(match.dateEvent, UI.noDate);
        const time = formatText(match.strTimeLocal || match.strTime, UI.timeTBD);
        return `<li class="match-item upcoming-match"><span class="list-index">${idx + 1}.</span><div class="match-copy"><strong>${home} vs ${away}</strong><span>${date} • ${time}</span></div><span class="match-badge confirmed-badge">${UI.pending}</span></li>`;
      })
      .join("");
    return;
  }

  if (!fallbackMatches.length) {
    nextMatchesList.innerHTML = `<li class="empty">${UI.noUpcomingData}</li>`;
    return;
  }

  nextMatchesList.innerHTML = [
    `<li class="empty">${UI.fallbackUpcomingNotice}</li>`,
    ...fallbackMatches.slice(0, 3).map((match, idx) => {
      const home = formatText(match.strHomeTeam, "?");
      const away = formatText(match.strAwayTeam, "?");
      const score = `${match.intHomeScore ?? "?"}:${match.intAwayScore ?? "?"}`;
      const date = formatText(match.dateEvent, UI.noDate);
      return `<li class="match-item"><span class="list-index">${idx + 1}.</span><div class="match-copy"><strong>${home} vs ${away}</strong><span>${escapeHtml(score)} • ${date}</span></div><span class="match-badge fallback-badge">${UI.fallback}</span></li>`;
    }),
  ].join("");
}

function renderStandings(table = [], currentTeam = null) {
  if (!table.length) {
    standingsCard.className = "standings-card empty";
    standingsCard.textContent = UI.noStandingsData;
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
              ${
                badge
                  ? `<img class="standing-badge" src="${badge}" alt="${
                      CURRENT_LANG === "en" ? "Badge for" : "Емблема на"
                    } ${formatText(row.strTeam, UI.noData)}" />`
                  : ""
              }
              <div class="standing-copy">
                <strong>${formatText(row.strTeam, UI.noData)}</strong>
                <span>${escapeHtml(row.intPlayed || "0")} ${CURRENT_LANG === "en" ? "played" : "мача"} • ${escapeHtml(row.intGoalDifference || "0")} ${CURRENT_LANG === "en" ? "goal diff" : "голова разлика"}</span>
              </div>
              <span class="standing-points">${escapeHtml(row.intPoints || "0")} ${CURRENT_LANG === "en" ? "pts" : "т."}</span>
            </article>
          `;
        })
        .join("")}
    </div>
    <p class="standings-note">${UI.season}: ${escapeHtml(table[0]?.strSeason || UI.noData)} • ${UI.teamFormPrefix} ${escapeHtml(currentTeamName || "team")}: ${currentRow?.strForm ? formatFormSequence(currentRow.strForm) : UI.noData}</p>
  `;
}

function renderPlayerCard(player = null, teamName = "") {
  if (!player) {
    playerCard.className = "player-card empty";
    playerCard.textContent = teamName
      ? `${UI.noPlayerInTeam} ${teamName}.`
      : UI.noPlayerPrompt;
    return;
  }

  const playerName = formatText(player.strPlayer, UI.unknownPlayer);
  const image = safeMediaUrl(player.strThumb || player.strCutout || player.strRender || player.strFanart1);
  const bio = formatText((player.strDescriptionEN || "").slice(0, 340), UI.noBio);

  playerCard.className = "player-card";
  playerCard.innerHTML = `
    <div class="player-hero">
      ${image ? `<img class="player-photo" src="${image}" alt="Снимка на ${playerName}" />` : ""}
      <div>
        <p class="club-kicker">${UI.selectedPlayer}</p>
        <h3>${playerName}</h3>
        <p class="club-summary">${formatText(player.strPosition, UI.unknownPosition)} • ${formatText(player.strNationality, UI.noData)}</p>
      </div>
    </div>
    <div class="fact-grid player-facts">
      <article>
        <span>${UI.number}</span>
        <strong>${formatText(player.strNumber, "-")}</strong>
      </article>
      <article>
        <span>${UI.born}</span>
        <strong>${formatText(player.dateBorn, UI.noData)}</strong>
      </article>
      <article>
        <span>${UI.height}</span>
        <strong>${formatText(player.strHeight, UI.noData)}</strong>
      </article>
      <article>
        <span>${UI.weight}</span>
        <strong>${formatText(player.strWeight, UI.noData)}</strong>
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
  const form = summary.form.slice(0, 5).join(" ") || UI.noData;

  summaryGrid.innerHTML = `
    <article>
      <span>${UI.players}</span>
      <strong>${players.length || 0}</strong>
    </article>
    <article>
      <span>${UI.lastMatches}</span>
      <strong>${matches.length || 0}</strong>
    </article>
    <article>
      <span>${UI.goals}</span>
      <strong>${summary.goalsFor}:${summary.goalsAgainst}</strong>
    </article>
    <article>
      <span>${UI.form}</span>
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
    setStatus(UI.playerSearchNeedsTeam, "error");
    return;
  }

  setPlayerSearchLoading(true);

  try {
    const player = await fetchPlayerProfile(playerSearchInput.value.trim(), currentTeamData);
    renderPlayerCard(player, currentTeamData.team?.strTeam || "");
  } catch (error) {
    renderPlayerCard(null, currentTeamData.team?.strTeam || "");
    setStatus(`${UI.playerSearchError}: ${error.message}`, "error");
  } finally {
    setPlayerSearchLoading(false);
  }
}

async function fetchTeamData(teamName) {
  const teamSearch = await apiGet(`/searchteams.php?t=${encodeURIComponent(teamName)}`);
  if (!teamSearch.teams || !teamSearch.teams.length) {
    throw new Error(CURRENT_LANG === "en" ? "No team found with this name." : "Няма намерен отбор с това име.");
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
    throw new Error(CURRENT_LANG === "en" ? "No suitable team candidate found." : "Не е открит подходящ отбор.");
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

async function loadData(options = {}) {
  const { forceRefresh = false } = options;
  const teamName = teamNameInput.value.trim();

  if (!teamName) {
    setStatus(UI.enterTeamName, "error");
    return;
  }

  const cachedSnapshot = readTeamSnapshot(teamName);
  if (!forceRefresh && cachedSnapshot && isSnapshotFresh(cachedSnapshot) && cachedSnapshot.source === "flashscore") {
    renderAll(
      cachedSnapshot.teamData,
      cachedSnapshot.standingsData || { table: [], standing: null },
      cachedSnapshot.featuredPlayer || null
    );
    setSourceMeta(cachedSnapshot.savedAt, `${UI.sourceLabelCache} (${resolveSourceLabel(cachedSnapshot.source)})`);
    setStatus(`${UI.cacheFreshUsed} (${UI.sourceLabelCache})`, "ok");
    return;
  }

  setStatus(UI.loadingStatus, "");
  setLoadingState(true);

  try {
    const teamData = await fetchPrimaryTeamData(teamName);
    let standingsData = { table: [], standing: null };
    let featuredPlayer = null;

    try {
      standingsData = await fetchStandings(teamData.team);
    } catch {
      standingsData = { table: [], standing: null };
    }

    try {
      featuredPlayer = await fetchPlayerProfile(playerSearchInput.value.trim(), teamData);
    } catch {
      featuredPlayer = null;
    }

    renderAll(teamData, standingsData, featuredPlayer);

    const resolvedSource = teamData.source || "sportsdb";
    const now = Date.now();

    saveTeamSnapshot(teamName, {
      savedAt: now,
      source: resolvedSource,
      teamData,
      standingsData,
      featuredPlayer,
    });
    setSourceMeta(now, resolveSourceLabel(resolvedSource));

    const name = teamData.team.strTeam || "Клуб";
    const sourceLabel = resolveSourceLabel(resolvedSource);
    setStatus(
      CURRENT_LANG === "en"
        ? `Data for ${name} loaded: ${teamData.players.length} players, ${teamData.matches.length} last matches and ${teamData.nextMatches.length} confirmed upcoming fixtures (${getDataQualityLabel(teamData.dataQuality).replace(`${UI.apiQualityPrefix}: `, "")}; ${sourceLabel}).`
        : `Данните за ${name} са заредени: ${teamData.players.length} играчи, ${teamData.matches.length} последни мача и ${teamData.nextMatches.length} потвърдени предстоящи (${getDataQualityLabel(teamData.dataQuality).replace(`${UI.apiQualityPrefix}: `, "")}; ${sourceLabel}).`,
      "ok"
    );
  } catch (error) {
    const staleSnapshot = cachedSnapshot;
    if (staleSnapshot) {
      renderAll(
        staleSnapshot.teamData,
        staleSnapshot.standingsData || { table: [], standing: null },
        staleSnapshot.featuredPlayer || null
      );
      setSourceMeta(staleSnapshot.savedAt, `${UI.sourceLabelCache} (${resolveSourceLabel(staleSnapshot.source)})`);
      setStatus(`${UI.cacheStaleUsed} (${UI.sourceLabelCache})`, "ok");
      return;
    }

    try {
      try {
        const flashscoreData = await fetchFlashscoreSnapshot(teamName);
        renderAll(flashscoreData, { table: [], standing: null }, null);
        saveTeamSnapshot(teamName, {
          savedAt: Date.now(),
          source: "flashscore",
          teamData: flashscoreData,
          standingsData: { table: [], standing: null },
          featuredPlayer: null,
        });
        setSourceMeta(Date.now(), UI.sourceLabelFlashscore);
        setStatus(UI.sourceFlashscoreUsed, "ok");
        return;
      } catch {
        const fccskaData = await fetchFccskaSnapshot(teamName);
        renderAll(fccskaData, { table: [], standing: null }, null);
        saveTeamSnapshot(teamName, {
          savedAt: Date.now(),
          source: "fccska",
          teamData: fccskaData,
          standingsData: { table: [], standing: null },
          featuredPlayer: null,
        });
        setSourceMeta(Date.now(), UI.sourceLabelFccska);
        setStatus(UI.sourceFccskaUsed, "ok");
        return;
      }
    } catch {
      const message =
        error instanceof TypeError
          ? UI.networkError
          : `${CURRENT_LANG === "en" ? "Error" : "Грешка"}: ${error.message}`;
      setStatus(message, "error");
      clubCard.classList.add("empty");
      clubCard.classList.remove("loading-state");
      clubCard.textContent =
        CURRENT_LANG === "en"
          ? "Failed to load club information."
          : "Неуспешно зареждане на клубната информация.";
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
      setSourceMeta(null, "");
    }
  } finally {
    setLoadingState(false);
  }
}

function init() {
  loadBtn.addEventListener("click", () => loadData({ forceRefresh: false }));
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => loadData({ forceRefresh: true }));
  }
  searchPlayerBtn.addEventListener("click", searchPlayer);
  playerSearchInput.addEventListener("input", handlePlayerAutocompleteInput);
  teamNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadData({ forceRefresh: false });
    }
  });
  playerSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchPlayer();
    }
  });
  setSourceMeta(null, "");
  refreshPlayerAutocomplete([]);
  loadData({ forceRefresh: false });
}

init();

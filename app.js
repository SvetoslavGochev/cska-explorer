// Визуализира състава на ЦСКА в елемент с id "squadGrid"
const PLAYER_FLAG_BY_NAME = {
  "Евтимов Димитър": "🇧🇬",
  "Лапоухов Фьодор": "🇧🇾",
  "Николов Даниел": "🇧🇬",
  "Гбамен Жан-Филип": "🇨🇮",
  "Иванов Теодор": "🇧🇬",
  "Йорданов Андрей": "🇧🇬",
  "Лапеня Адриан": "🇪🇸",
  "Мартино Анхело": "🇦🇷",
  "Пастор": "🇧🇷",
  "Родригес Факундо": "🇦🇷",
  "Тунчев Алекс": "🇧🇬",
  "Ебонг Макс": "🇧🇾",
  "Ето'о Джеймс": "🇨🇲",
  "Жордао Бруно": "🇵🇹",
  "Илиев Yulian": "🇧🇬",
  "Каймаканов Васил": "🇧🇬",
  "Николов Алесандро": "🇧🇬",
  "Панайотов Петко": "🇧🇬",
  "Сенси Стефано": "🇮🇹",
  "Соле Исак": "🇨🇫",
  "Уору Тамиму": "🌍",
  "Чорбаджийски Георги Бранков": "🇧🇬",
  "Брахими Мохамед": "🇫🇷",
  "Годой Леандро": "🇦🇷",
  "Додай Кевин": "🇦🇱",
  "Живков Радослав": "🇧🇬",
  "Лео Перейра": "🇧🇷",
  "Пиедраита Алехандро": "🇨🇴",
  "Питас Йоанис": "🇨🇾",
  "Фаетон Матиас": "🇫🇷",
  "Жоел Цвартс": "🇳🇱"
};

const PLAYER_NAME_EN_BY_BG = {
  "Евтимов Димитър": "Dimitar Evtimov",
  "Лапоухов Фьодор": "Fyodor Lapoukhov",
  "Николов Даниел": "Daniel Nikolov",
  "Гбамен Жан-Филип": "Jean-Philippe Gbamin",
  "Иванов Теодор": "Teodor Ivanov",
  "Йорданов Андрей": "Andrey Yordanov",
  "Лапеня Адриан": "Adrian Lapeña",
  "Мартино Анхело": "Angelo Martino",
  "Пастор": "David Pastor",
  "Родригес Факундо": "Facundo Rodriguez",
  "Тунчев Алекс": "Alex Tunchev",
  "Ебонг Макс": "Max Ebong",
  "Ето'о Джеймс": "James Eto'o",
  "Жордао Бруно": "Bruno Jordao",
  "Илиев Yulian": "Yulian Iliev",
  "Каймаканов Васил": "Vasil Kaymakanov",
  "Николов Алесандро": "Alessandro Nikolov",
  "Панайотов Петко": "Petko Panayotov",
  "Сенси Стефано": "Stefano Sensi",
  "Соле Исак": "Isaac Solet",
  "Уору Тамиму": "Tamimu Owaru",
  "Чорбаджийски Георги Бранков": "Georgi Brankov Chorbadzhiyski",
  "Брахими Мохамед": "Mohamed Brahimi",
  "Годой Леандро": "Leandro Godoy",
  "Додай Кевин": "Kevin Dodaj",
  "Живков Радослав": "Radoslav Zhivkov",
  "Лео Перейра": "Leo Pereira",
  "Пиедраита Алехандро": "Alejandro Piedrahita",
  "Питас Йоанис": "Ioannis Pittas",
  "Фаетон Матиас": "Mathias Phaeton",
  "Жоел Цвартс": "Joel Zwarts"
};

const PLAYER_METADATA_KEYS = Object.keys(PLAYER_FLAG_BY_NAME);

function normalizePlayerTokens(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

const ROLE_BY_GROUP = {
  bg: {
    goalkeepers: "Вратар",
    defenders: "Защитник",
    midfielders: "Халф",
    forwards: "Нападател"
  },
  en: {
    goalkeepers: "Goalkeeper",
    defenders: "Defender",
    midfielders: "Midfielder",
    forwards: "Forward"
  }
};

const LATEST_SQUAD_OVERRIDES = [
  { name: "Цварц Жоел", aliases: ["Жоел Цварц", "Жоел Цвартс"], flag: "🇳🇱", roleBg: "Нападател", roleEn: "Forward", matches: 9, goals: 5, assists: 1, hattricks: 0, impact: "7.50" },
  { name: "Лео Перейра", aliases: ["Лео Перейра"], flag: "🇧🇷", roleBg: "Нападател / Крило", roleEn: "Forward / Winger", matches: 6, goals: 1, assists: 1, hattricks: 0, impact: "3.00" },
  { name: "Питас Йоанис", aliases: ["Йоанис Питас"], flag: "🇨🇾", roleBg: "Нападател", roleEn: "Forward", matches: 9, goals: 2, assists: 2, hattricks: 0 },
  { name: "Родригес Факундо", aliases: ["Факундо Родригес"], flag: "🇦🇷", roleBg: "Защитник", roleEn: "Defender", matches: 9, goals: 1, assists: 0, hattricks: 0, impact: "3.00" },
  { name: "Жордао Бруно", aliases: ["Бруно Жордао"], flag: "🇵🇹", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 8, goals: 1, assists: 0, hattricks: 0, impact: "2.75" },
  { name: "Сенси Стефано", aliases: ["Стефано Сенси"], flag: "🇮🇹", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 7, goals: 2, assists: 1, hattricks: 0, impact: "4.25" },
  { name: "Годой Леандро", aliases: ["Леандро Годой", "Сантяго Годой"], flag: "🇦🇷", roleBg: "Нападател", roleEn: "Forward", matches: 6, goals: 3, assists: 0, hattricks: 0 },
  { name: "Брахими Мохамед", aliases: ["Мохамед Брахими"], flag: "🇫🇷", roleBg: "Нападател / Крило", roleEn: "Forward / Winger", matches: 8, goals: 0, assists: 1, hattricks: 0, impact: "2.25" },
  { name: "Мартино Анжело", aliases: ["Анжело Мартино"], flag: "🇦🇷", roleBg: "Защитник", roleEn: "Defender", matches: 7, goals: 0, assists: 0, hattricks: 0, impact: "1.50" },
  { name: "Дейвид Пастор", aliases: ["Пастор", "Дейвид Пастор"], flag: "🇧🇷", roleBg: "Защитник", roleEn: "Defender", matches: 7, goals: 0, assists: 1, hattricks: 0, impact: "2.25" },
  { name: "Ето'о Джеймс", aliases: ["Джеймс Ето'о"], flag: "🇨🇲", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 8, goals: 0, assists: 0, hattricks: 0, impact: "1.75" },
  { name: "Иванов Теодор", aliases: ["Теодор Иванов"], flag: "🇧🇬", roleBg: "Защитник", roleEn: "Defender", matches: 7, goals: 0, assists: 0, hattricks: 0, impact: "1.75" },
  { name: "Лапоухов Фьодор", aliases: ["Фьодор Лапоухов"], flag: "🇧🇾", roleBg: "Вратар", roleEn: "Goalkeeper", matches: 8, goals: 0, assists: 1, hattricks: 0, impact: "2.25" },
  { name: "Жан-Филип Гбамин", aliases: ["Жан-Филип Гбамен", "Гбамин Жан-Филип"], flag: "🇨🇮", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 7, goals: 0, assists: 0, hattricks: 0, impact: "1.50" },
  { name: "Ебонг Макс", aliases: ["Макс Ебонг"], flag: "🇧🇾", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 6, goals: 1, assists: 0, hattricks: 0, impact: "2.25" },
  { name: "Панайотов Петко", aliases: ["Петко Панайотов"], flag: "🇧🇬", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 5, goals: 0, assists: 0, hattricks: 0, impact: "1.00" },
  { name: "Соле Исак", aliases: ["Исак Соле"], flag: "🇨🇫", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 5, goals: 1, assists: 0, hattricks: 0 },
  { name: "Пиедраита Алехандро", aliases: ["Алехандро Пиедраита"], flag: "🇨🇴", roleBg: "Нападател / Крило", roleEn: "Forward / Winger", matches: 3, goals: 0, assists: 0, hattricks: 0, impact: "0.75" },
  { name: "Уору Тамиму", aliases: ["Тамиму Уору"], flag: "🇧🇯", roleBg: "Защитник", roleEn: "Defender", matches: 2, goals: 0, assists: 0, hattricks: 0, impact: "0.50" },
  { name: "Евтимов Димитър", aliases: ["Димитър Евтимов"], flag: "🇧🇬", roleBg: "Вратар", roleEn: "Goalkeeper", matches: 1, goals: 0, assists: 1, hattricks: 0, impact: "0.75" },
  { name: "Йорданов Андрей", aliases: ["Андрей Йорданов"], flag: "🇧🇬", roleBg: "Защитник", roleEn: "Defender", matches: 3, goals: 0, assists: 0, hattricks: 0, impact: "0.50" },
  { name: "Лапеня Адриан", aliases: ["Адриан Лапеня"], flag: "🇪🇸", roleBg: "Защитник", roleEn: "Defender", matches: 0, goals: 0, assists: 0, hattricks: 0, impact: "0.00" },
  { name: "Николов Даниел", aliases: ["Даниел Николов"], flag: "🇧🇬", roleBg: "Вратар", roleEn: "Goalkeeper", matches: 0, goals: 0, assists: 0, hattricks: 0, impact: "0.00" },
  { name: "Тунчев Алекс", aliases: ["Алекс Тунчев"], flag: "🇧🇬", roleBg: "Защитник", roleEn: "Defender", matches: 0, goals: 0, assists: 0, hattricks: 0, impact: "0.00" },
  { name: "Чорбаджийски Георги", aliases: ["Георги Чорбаджийски", "Чорбаджийски Георги Бранков"], flag: "🇧🇬", roleBg: "Полузащитник", roleEn: "Midfielder", matches: 0, goals: 0, assists: 0, hattricks: 0, impact: "0.00" },
  { name: "Додай Кевин", aliases: ["Кевин Додай"], flag: "🇦🇱", roleBg: "Нападател", roleEn: "Forward", matches: 0, goals: 0, assists: 0, hattricks: 0, impact: "0.00" },
  { name: "Каймаканов Васил", aliases: ["Васил Каймаканов"], flag: "🇧🇬", roleBg: "Нападател", roleEn: "Forward", matches: 0, goals: 0, assists: 0, hattricks: 0, impact: "0.00" }
];

const LATEST_SQUAD_ORDER = new Map(
  LATEST_SQUAD_OVERRIDES.map((row, index) => [normalizePlayerName(row.name), index])
);

function normalizePlayerName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function isTokenSubset(leftTokens, rightTokens) {
  if (!leftTokens.length || !rightTokens.length) return false;
  return leftTokens.every((token) => rightTokens.includes(token));
}

function resolvePlayerMetadataKey(name) {
  const safeName = String(name || "").trim();
  if (!safeName) return "";
  if (PLAYER_FLAG_BY_NAME[safeName] || PLAYER_NAME_EN_BY_BG[safeName]) {
    return safeName;
  }

  const nameTokens = normalizePlayerTokens(safeName);
  if (!nameTokens.length) return "";

  for (const candidate of PLAYER_METADATA_KEYS) {
    const candidateTokens = normalizePlayerTokens(candidate);
    if (
      isTokenSubset(candidateTokens, nameTokens) ||
      isTokenSubset(nameTokens, candidateTokens)
    ) {
      return candidate;
    }
  }

  return "";
}

function getPlayerDisplayName(name) {
  const safeName = String(name || "").trim();
  if (!safeName) return "-";
  if (currentLanguage === "en") {
    const metadataKey = resolvePlayerMetadataKey(safeName);
    return PLAYER_NAME_EN_BY_BG[metadataKey] || safeName;
  }
  return safeName;
}

function getPlayerFlag(name) {
  const metadataKey = resolvePlayerMetadataKey(name);
  return PLAYER_FLAG_BY_NAME[metadataKey] || "🌍";
}

function renderSquad(squad) {
  const squadGridEl = document.getElementById("squadGrid");
  if (!squadGridEl) return;
  if (!squad || typeof squad !== "object") {
    squadGridEl.innerHTML = "";
    setupSquadSectionNavigation();
    return;
  }
  const squadGroups = ["goalkeepers", "defenders", "midfielders", "forwards"];
  const hasPlayers = squadGroups.some((groupKey) => Array.isArray(squad[groupKey]) && squad[groupKey].length);
  if (!hasPlayers) {
    squadGridEl.innerHTML = "";
    setupSquadSectionNavigation();
    return;
  }
  const renderPlayerCard = (p) => {
    const matches = Number.isFinite(Number(p.matches)) ? Number(p.matches) : 0;
    const goals = Number.isFinite(Number(p.goals)) ? Number(p.goals) : 0;
    const assists = Number.isFinite(Number(p.assists)) ? Number(p.assists) : 0;
    const hattricks = Number.isFinite(Number(p.hattricks)) ? Number(p.hattricks) : 0;
    const impactRaw = (matches * 0.25) + (assists * 0.5) + (goals * 1) + (hattricks * 2);
    const impact = Number.isInteger(impactRaw) ? String(impactRaw) : impactRaw.toFixed(2);
    const rawName = String(p.name || "").trim();
    const displayName = getPlayerDisplayName(rawName);
    const flag = getPlayerFlag(rawName);

    return `
      <article class="squad-player">
        <h3 class="squad-player-name"><span class="squad-player-flag" aria-hidden="true">${flag}</span>${displayName}</h3>
        <div class="squad-player-stats">
          <span class="squad-stat"><b>${t("statMatches")}</b> ${matches}</span>
          <span class="squad-stat"><b>${t("statGoals")}</b> ${goals}</span>
          <span class="squad-stat"><b>${t("statAssists")}</b> ${assists}</span>
          <span class="squad-stat"><b>${t("statImpact")}</b> ${impact}</span>
        </div>
      </article>
    `;
  };

  squadGridEl.innerHTML = squadGroups.map((groupKey) => {
    const players = Array.isArray(squad[groupKey]) ? squad[groupKey] : [];
    if (!players.length) return "";

    return `
      <section class="squad-group section-anchor" id="squad-group-${groupKey}">
        <h3>${t(`group${groupKey.charAt(0).toUpperCase()}${groupKey.slice(1)}`)}</h3>
        <div class="squad-group-grid">
          ${players.map(renderPlayerCard).join("\n")}
        </div>
      </section>
    `;
  }).join("\n");

  setupSquadSectionNavigation();
}
const LOCAL_CACHE_KEY = "cska_explorer_root_cache_v10";
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000;
const LANGUAGE_KEY = "cska_site_language";
const CSKA_SUPPORT_WALLET = "0xfca710eC5eB0FB036157Bb1E114BADc2310efE37";
const CSKA_PARTNER_INSTAGRAM_URL = (window.CSKA_PARTNER_INSTAGRAM_URL || "https://www.instagram.com/").trim();
const CSKA_PARTNER_FACEBOOK_URL = (window.CSKA_PARTNER_FACEBOOK_URL || "https://www.facebook.com/").trim();
const CSKA_PARTNER_X_URL = (window.CSKA_PARTNER_X_URL || "https://x.com/").trim();
const DATA_API_URL = (() => {
  const explicit = String(window.CSKA_DATA_API_URL || "").trim();
  if (/your-backend-url/i.test(explicit)) return "";
  if (!explicit) return "";
  if (/\/api\/data\/?$/i.test(explicit)) return explicit.replace(/\/$/, "");
  return `${explicit.replace(/\/$/, "")}/api/data`;
})();

const I18N = {
  bg: {
    standingsTitle: "Efbet Лига - Класиране",
    thTeam: "Отбор",
    thMP: "М",
    thW: "П",
    thD: "Р",
    thL: "З",
    thGD: "ГР",
    thPTS: "Т",
    legendChampion: "Шампион / КЛ",
    legendUcl: "КЛ квалификации",
    legendUel: "ЛЕ квалификации",
    legendUecl: "КЛЕ квалификации",
    legendPlayoff: "Бараж",
    legendRel: "Изпадане",
    sourcePrefix: "Източник:",
    nextMatchesTitle: "Следващи мачове на ЦСКА",
    todayMatchesTitle: "Мачове днес",
    lastResultsTitle: "Последни резултати",
    squadTitle: "Състав на ЦСКА",
    cskaAnalysisTitle: "Анализ на играта на ЦСКА след 17 официални мача (Сезон 2026/27)",
    groupGoalkeepers: "Вратари",
    groupDefenders: "Защитници",
    groupMidfielders: "Халфове",
    groupForwards: "Нападатели",
    squadNavGoalkeepers: "ВР",
    squadNavDefenders: "ЗАЩ",
    squadNavMidfielders: "ХАЛФ",
    squadNavForwards: "НАП",
    analysisDashboardTitle: "Мини Opta: ключови графики",
    analysisImpactChartTitle: "КПД на играчите",
    analysisImpactChartHint: "Топ играчи по КПД формулата на сайта.",
    analysisGoalsChartTitle: "Голове по мачове",
    analysisGoalsChartHint: "Последни резултати на ЦСКА, когато мачовата история е налична.",
    analysisGoalsFallback: "Ще покажем графика по мачове, когато има налични последни резултати в източника.",
    analysisFormChartTitle: "Форма през сезона",
    analysisFormChartHint: "W/D/L timeline и точки на мач според наличните мачове.",
    analysisFormFallback: "Няма пълна серия от последни мачове, затова показваме сезонното W/D/L разпределение.",
    analysisNoData: "Няма достатъчно данни",
    analysisResultWin: "П",
    analysisResultDraw: "Р",
    analysisResultLoss: "З",
    analysisPpmLabel: "Точки/мач",
    analysisGoalsLabel: "Голове",
    analysisSeasonFormLabel: "Сезонна форма",
    statMatches: "Мачове",
    statGoals: "Голове",
    statAssists: "Асист.",
    statGoalsPerMatch: "Г/М",
    statSavesPerMatch: "Спасяв./М",
    statPenaltiesSaved: "Спас. дузпи",
    statImpact: "КПД",
    impactFormula: "КПД = (Мачове x 0.25) + (Асист. x 0.5) + (Голове x 1) + (Хеттрици x 2).",
    sourceRefreshLabel: "Обновяване:",
    sourceValidationLabel: "Валидиране:",
    sourceMissingStatsLabel: "Липсващи данни:",
    sourceImpactLabel: "Формула КПД:",
    warnStandingsFallback: "Класиране (fallback)",
    warnLastResultsFallback: "Последни резултати (fallback)",
    warnNextMatchesFallback: "Следващи мачове (fallback)",
    warnStandingsFetchFailed: "Класиране (грешка при заявка)",
    warnLastResultsFetchFailed: "Последни резултати (грешка при заявка)",
    warnNextMatchesFetchFailed: "Следващи мачове (грешка при заявка)",
    footerDisclaimer: "Този сайт е създаден с учебна цел. Данните са информативни и е възможно да има разминавания при автоматичното обновяване.",
    legendsTitle: "Легенди на ЦСКА",
    stoichkovSubtitle: "🔴 Христо Стоичков — Аналитичен профил на най-голямата легенда на ЦСКА",
    projectsTitle: "🌐 Още наши проекти",
    projectsSubtitle: "Разгледай и други наши интерактивни уеб сайтове.",
    projectPingTitle: "� Game Explorer",
    projectPingDesc: "Бърза мини игра с изчистен интерфейс и динамичен геймплей.",
    projectNorwayTitle: "🧭 Norway Explorer",
    projectNorwayDesc: "Кратък пътеводител за Норвегия с полезна информация и бърз преглед.",
    projectIndonesiaTitle: "🇮🇩 Indonesia Explorer",
    projectIndonesiaDesc: "Интерактивен сайт за градове, природа, животни и полезни статии.",
    projectVisitBtn: "Посети",
    heroLinkFoundation: "Фондация",
    heroLinkShop: "Магазин",
    heroLinkStadium: "Стадион",
    heroLinkFanRegistration: "Фен регистрация",
    sectionNavLabel: "Бърза навигация",
    navStandings: "Класиране",
    navSquad: "Състав на ЦСКА",
    navAnalysis: "Анализ на играта",
    navLegends: "Легенди на ЦСКА",
    legendsNavLabel: "Избери легенда",
    legendNavHristo: "Христо Стоичков",
    legendNavBerbatov: "Димитър Бербатов",
    legendNavZhekov: "Петър Жеков",
    legendNavDjeki: "Георги Димитров – „Джеки“",
    legendNavStoycho: "Стойчо Младенов",
    partnerLinksLabel: "Партньорски линкове",
    cskaPartnerTitle: "Партньорство с CSKA Explorer",
    cskaPartnerText: "Представете вашите спортни услуги пред аудитория от 20,000+ преданни фенове. Ние ще включим вашата оферта в нашите експертни анализи и специализирани статии. За успешни партньорства предлагаме комисионен модел от 10% за всяка регистрация или покупка, направена чрез нашите линкове.",
    cskaPartnerCta: "Свържи се с нас",
    cskaPartnerPaypalCta: "PayPal Подкрепа",
    cskaPartnerWalletLabel: "MetaMask адрес за подкрепа:",
    cskaPartnerWalletCopy: "Копирай адрес",
    cskaPartnerWalletCopied: "Копирано",
    cskaPartnerWalletHint: "Изпращай само през съвместима EVM мрежа.",
    cskaPartnerContactHint: "Пиши ни директно през социалните мрежи за партньорства.",
    sourceMissingStats: "В таблицата липсващите статистики се допълват с \"-\".",
    statusFromCache: "Показани са данни от локалния кеш (без нова заявка).",
    statusLatest: "Показани са последните данни.",
    noMatchesToday: "Няма мачове за днес",
    stadiumLabel: "Стадион:",
    foundedLabel: "Основан:",
    cskaNotes: "Форма:"
  },
  en: {
    standingsTitle: "Efbet League - Standings",
    thTeam: "Team",
    thMP: "MP",
    thW: "W",
    thD: "D",
    thL: "L",
    thGD: "GD",
    thPTS: "PTS",
    legendChampion: "Champion / UCL",
    legendUcl: "UCL qualification",
    legendUel: "UEL qualification",
    legendUecl: "UECL qualification",
    legendPlayoff: "Playoff",
    legendRel: "Relegation",
    sourcePrefix: "Source:",
    nextMatchesTitle: "Upcoming CSKA Matches",
    todayMatchesTitle: "Matches Today",
    lastResultsTitle: "Recent Results",
    squadTitle: "CSKA Sofia Squad",
    cskaAnalysisTitle: "CSKA Game Analysis After 17 Official Matches (Season 2026/27)",
    groupGoalkeepers: "Goalkeepers",
    groupDefenders: "Defenders",
    groupMidfielders: "Midfielders",
    groupForwards: "Forwards",
    squadNavGoalkeepers: "GK",
    squadNavDefenders: "DF",
    squadNavMidfielders: "MF",
    squadNavForwards: "FW",
    analysisDashboardTitle: "Mini Opta: key charts",
    analysisImpactChartTitle: "Player Impact",
    analysisImpactChartHint: "Top players by the site's impact formula.",
    analysisGoalsChartTitle: "Goals by Match",
    analysisGoalsChartHint: "CSKA recent results when match history is available.",
    analysisGoalsFallback: "A match-by-match goals chart will appear when recent results are available from the source.",
    analysisFormChartTitle: "Season Form",
    analysisFormChartHint: "W/D/L timeline and points per match based on available results.",
    analysisFormFallback: "Recent match history is incomplete, so we are showing the season W/D/L distribution instead.",
    analysisNoData: "Not enough data",
    analysisResultWin: "W",
    analysisResultDraw: "D",
    analysisResultLoss: "L",
    analysisPpmLabel: "Pts/Match",
    analysisGoalsLabel: "Goals",
    analysisSeasonFormLabel: "Season form",
    statMatches: "Matches",
    statGoals: "Goals",
    statAssists: "Assists",
    statGoalsPerMatch: "G/Match",
    statSavesPerMatch: "Saves/Match",
    statPenaltiesSaved: "Pens Saved",
    statImpact: "Impact",
    impactFormula: "Impact = (Matches x 0.25) + (Assists x 0.5) + (Goals x 1) + (Hattricks x 2).",
    sourceRefreshLabel: "Refresh:",
    sourceValidationLabel: "Validation:",
    sourceMissingStatsLabel: "Missing data:",
    sourceImpactLabel: "Impact formula:",
    warnStandingsFallback: "Standings (fallback)",
    warnLastResultsFallback: "Last results (fallback)",
    warnNextMatchesFallback: "Next matches (fallback)",
    warnStandingsFetchFailed: "Standings (fetch failed)",
    warnLastResultsFetchFailed: "Last results (fetch failed)",
    warnNextMatchesFetchFailed: "Next matches (fetch failed)",
    footerDisclaimer: "This site was created for educational purposes. The data is informational and discrepancies may occur during automatic updates.",
    legendsTitle: "Legends of CSKA",
    stoichkovSubtitle: "🔴 Hristo Stoichkov — Analytical profile of CSKA’s greatest legend",
    projectsTitle: "🌐 More Projects",
    projectsSubtitle: "Explore our other interactive websites.",
    projectPingTitle: "� Game Explorer",
    projectPingDesc: "A fast mini game with a clean interface and dynamic gameplay.",
    projectNorwayTitle: "🧭 Norway Explorer",
    projectNorwayDesc: "A short Norway guide with useful information and quick facts.",
    projectIndonesiaTitle: "🇮🇩 Indonesia Explorer",
    projectIndonesiaDesc: "An interactive site about cities, nature, wildlife, and useful articles.",
    projectVisitBtn: "Visit",
    heroLinkFoundation: "Foundation",
    heroLinkShop: "Shop",
    heroLinkStadium: "Stadium",
    heroLinkFanRegistration: "Fan Registration",
    sectionNavLabel: "Quick Navigation",
    navStandings: "Standings",
    navSquad: "CSKA Squad",
    navAnalysis: "Match Analysis",
    navLegends: "CSKA Legends",
    legendsNavLabel: "Pick a legend",
    legendNavHristo: "Hristo Stoichkov",
    legendNavBerbatov: "Dimitar Berbatov",
    legendNavZhekov: "Petar Zhekov",
    legendNavDjeki: "Georgi Dimitrov – Djeki",
    legendNavStoycho: "Stoycho Mladenov",
    partnerLinksLabel: "Partner Links",
    cskaPartnerTitle: "Partnership with CSKA Explorer",
    cskaPartnerText: "Present your sports services to an audience of 20,000+ dedicated fans. We will include your offer in our expert analyses and specialized articles. For successful partnerships, we offer a commission model of 10% for each registration or purchase made through our links.",
    cskaPartnerCta: "Contact us",
    cskaPartnerPaypalCta: "Support via PayPal",
    cskaPartnerWalletLabel: "MetaMask support address:",
    cskaPartnerWalletCopy: "Copy address",
    cskaPartnerWalletCopied: "Copied",
    cskaPartnerWalletHint: "Send only on a compatible EVM network.",
    cskaPartnerContactHint: "For partnerships, message us directly on social media.",
    sourceMissingStats: "Missing statistics are shown as \"-\" in the table.",
    statusFromCache: "Showing data from local cache (without a new request).",
    statusLatest: "Showing the latest data.",
    noMatchesToday: "No matches today",
    stadiumLabel: "Stadium:",
    foundedLabel: "Founded:",
    cskaNotes: "Form:"
  }
};

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "bg";
let lastPayload = null;
let lastFromCache = false;
let squadSectionObserver = null;
let mainSectionObserver = null;

const SQUAD_SECTION_IDS = [
  "squad-group-goalkeepers",
  "squad-group-defenders",
  "squad-group-midfielders",
  "squad-group-forwards"
];

const MAIN_SECTION_IDS = [
  "standings-section",
  "squad-section",
  "analysis-section",
  "legends-section"
];

const ANALYSIS_CONTENT = {
  bg: `
    <p>След изиграването на общо <b>17 официални мача</b> (8 в Европа + 9 в Първа лига), профилът на ЦСКА за сезон 2026/27 вече е ясно оформен. Отборът е преминал през тежки европейски квалификации, стабилен старт в първенството и показва ясно изграден стил: <b>силна защита, ефективна атака и тактическа гъвкавост</b>.</p>

    <h3>1. Офанзивна продукция – стабилност и клиничност</h3>
    <ul>
      <li><b>Голове:</b> ЦСКА вече е отбелязал <b>24 гола в 17 официални двубоя</b>, което означава средно около <b>1.4 гола на мач</b> в по-тежкия период на европейските квалификации и около <b>2+ гола на мач</b> в първенството.</li>
      <li><b>Клиничност:</b> Отборът показва способност да реализира качествени положения, да създава възможности и да затваря срещи с различни стилове на игра.</li>
      <li><b>Най-силен мач:</b> <b>5:0 срещу Ботев Враца</b> остава най-ясният пример за офанзивна увереност и доминиране.</li>
    </ul>

    <h3>2. Тактическа гъвкавост – адаптация според съперника</h3>
    <ul>
      <li><b>Европа:</b> срещу Макаби Тел Авив и Карабах се играе в по-организиран, по-сигурен и защитен модел; това е характерно за квалификационни мачове с високо напрежение.</li>
      <li><b>Първа лига:</b> в срещите срещу по-слаби опоненти ЦСКА преминава към по-агресивен натиск, повече контрол и по-голям офанзивен натиск.</li>
      <li><b>Извод:</b> Отборът може да сменя стила си според съперника – това е ключов актив за дълъг сезон.</li>
    </ul>

    <h3>3. Защитна стабилност – най-силният компонент</h3>
    <ul>
      <li><b>Допуснати голове:</b> до този момент защитата остава стабилна, с добра организация и ритъм в центъра на терена.</li>
      <li><b>Състояние:</b> отборът допуска сравнително малко позиции, а при зададените действия и статичните ситуации остава дисциплиниран.</li>
      <li><b>Извод:</b> Защитата е един от най-силните елементи на ЦСКА — трябва обаче да се следи дисциплината, защото в напрежение има моменти на риск и агресия.</li>
    </ul>

    <h3>4. Психологически профил – устойчивост след Европа</h3>
    <ul>
      <li><b>Европейския график:</b> има тежки мачове, нулеви срещи и поражения, но отборът не се „счупва“ в психологията и реакцията.</li>
      <li><b>Първенство:</b> ЦСКА запазва силна форма, стабилна концентрация и увереност в следващите срещи.</li>
      <li><b>Извод:</b> Отборът показва характер, спокойно реагира на тежки моменти и не изглежда психически отслабнал след европейските елиминации.</li>
    </ul>

    <h3>5. Хронологична структура на сезона</h3>
    <ul>
      <li><b>Европа – 8 мача:</b> Дери Сити (2 мача), Карабах (2 мача), Макаби Тел Авив (2 мача), ОФИ (2 мача).</li>
      <li><b>Първа лига – 9 мача:</b> силен старт, стабилни победи и натиск в момента на най-силната форма.</li>
      <li><b>Резултат:</b> отборът се е научил как да играе под напрежение, как да се адаптира и как да запази сериозност при различни сценарии.</li>
    </ul>

    <p class="analysis-verdict"><b>Финален извод:</b> След 17 официални мача ЦСКА изглежда като <b>зрял, балансиран и стабилен отбор</b>. Има силна защита, ефективна атака, тактическа гъвкавост и психологическа устойчивост. Първенството върви силно, а европейският опит ще е ценен за следващия етап на развитие. Това е отбор, който вече има ясна идентичност и реалистични амбиции.</p>
  `,
  en: `
    <p>After the first 10 official matches of the season, CSKA's statistical profile has become much clearer. The team came through a demanding European test in which pragmatism, iron discipline, and tactical patience in defense proved decisive for the final outcome.</p>

    <h3>1. Attacking Efficiency and Final Phase</h3>
    <ul>
      <li><b>Total goals scored:</b> 19 goals in 10 official matches, an average of 1.90 goals per game.</li>
      <li><b>Clinical finishing from limited chances:</b> In the second leg against Maccabi Tel Aviv, CSKA scored 1 goal from only 3 shots on target, once again highlighting the team's efficiency in decisive moments.</li>
      <li><b>Takeaway:</b> Even when the team does not dominate territorially, it remains dangerous through quick transitions and efficient use of its few clear openings.</li>
    </ul>

    <h3>2. Game Control and Match Dynamics</h3>
    <ul>
      <li><b>Possession:</b> Against Maccabi Tel Aviv, CSKA recorded 35% possession versus 65% for the opponent, which slightly lowered the season average but confirmed a clear game plan based on a compact block and protecting the lead.</li>
      <li><b>Resistance under pressure:</b> 2 blocked shots, 5 saves or missed attempts by the opponent near goal, and 2 corners won illustrate the scale of the attacking pressure the team had to absorb.</li>
      <li><b>Takeaway:</b> CSKA showed maturity and tactical flexibility, accepting a deeper position when the match demanded it without losing compactness between the lines.</li>
    </ul>

    <h3>3. Defensive Stability, Duels, and Aggression</h3>
    <ul>
      <li><b>Goals conceded:</b> 8 goals conceded in 10 matches, which means an average of 0.80 goals allowed per game.</li>
      <li><b>Physical battle and tactical fouls:</b> Against Maccabi Tel Aviv, CSKA committed 22 fouls compared to 12 by the opponent, a clear sign of concentration in breaking up dangerous attacks and disrupting the rival's rhythm.</li>
      <li><b>Discipline under pressure:</b> Despite the demanding nature of the match, the team stayed under control with 3 yellow cards and no red card.</li>
    </ul>

    <h3>4. Updated Key Conclusions After 10 Matches</h3>
    <ul>
      <li><b>Character and tournament experience:</b> The success against Maccabi shows that CSKA has not only football quality, but also the psychological resilience to close out difficult European ties.</li>
      <li><b>Adaptability to different styles:</b> The team can switch from dominance and control in domestic matches to organized off-ball play against stronger attacking opponents.</li>
      <li><b>The cost of the battle:</b> The high number of fouls reflects collective sacrifice, but it is also something the coaching staff will need to monitor because of accumulated official cautions.</li>
    </ul>

    <p class="analysis-verdict"><b>Summary:</b> With 19 goals scored in 10 official matches and a serious European hurdle cleared, CSKA continues to build the image of a tactically flexible, highly competitive, and pragmatic team with a clear tournament identity.</p>
  `
};

function t(key) {
  return I18N[currentLanguage]?.[key] || I18N.bg[key] || key;
}

function renderAnalysisContent() {
  const analysisContent = document.getElementById("analysisContent");
  if (!analysisContent) return;
  analysisContent.innerHTML = ANALYSIS_CONTENT[currentLanguage] || ANALYSIS_CONTENT.bg;
}

function getAllSquadPlayers(squad) {
  return ["goalkeepers", "defenders", "midfielders", "forwards"]
    .flatMap((groupKey) => Array.isArray(squad?.[groupKey]) ? squad[groupKey] : []);
}

function computePlayerImpact(player) {
  const matches = Number(player?.matches) || 0;
  const goals = Number(player?.goals) || 0;
  const assists = Number(player?.assists) || 0;
  const hattricks = Number(player?.hattricks) || 0;
  const impact = (matches * 0.25) + (assists * 0.5) + goals + (hattricks * 2);
  return Number(impact.toFixed(2));
}

function getCskaStandingRow(standings) {
  return (standings || []).find((row) => normalizeTeamName(row?.team) === "ЦСКА София") || null;
}

function parseGoalsFromScore(score) {
  const match = String(score || "").match(/^(\d+)\s*:\s*(\d+)$/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function buildRecentResultsSeries(lastResults) {
  return (Array.isArray(lastResults) ? lastResults : [])
    .map((match, index) => {
      const parsedScore = parseGoalsFromScore(match?.score);
      const normalizedHome = normalizeTeamName(match?.home);
      const normalizedAway = normalizeTeamName(match?.away);
      const isCskaHome = normalizedHome === "ЦСКА София";
      const isCskaAway = normalizedAway === "ЦСКА София";
      if (!parsedScore || (!isCskaHome && !isCskaAway)) return null;

      const cskaGoals = isCskaHome ? parsedScore.home : parsedScore.away;
      const opponentGoals = isCskaHome ? parsedScore.away : parsedScore.home;
      let resultKey = "draw";
      if (cskaGoals > opponentGoals) resultKey = "win";
      else if (cskaGoals < opponentGoals) resultKey = "loss";

      const opponentName = isCskaHome ? match.away : match.home;
      const shortRound = String(match?.round || "").trim() || `${index + 1}`;
      return {
        label: shortRound,
        opponent: opponentName,
        goals: cskaGoals,
        conceded: opponentGoals,
        resultKey,
        score: match.score,
        date: match.date || ""
      };
    })
    .filter(Boolean)
    .reverse();
}

function buildTrendSvg(values, width, height, strokeColor, fillColor) {
  const safeValues = values.filter((value) => Number.isFinite(value));
  if (!safeValues.length) return "";
  const maxValue = Math.max(...safeValues, 1);
  const stepX = safeValues.length === 1 ? 0 : width / (safeValues.length - 1);
  const points = safeValues.map((value, index) => {
    const x = safeValues.length === 1 ? width / 2 : index * stepX;
    const y = height - ((value / maxValue) * (height - 16)) - 8;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), value };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - 4} L ${points[0].x} ${height - 4} Z`;

  return `
    <svg class="analysis-trend-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <path d="${areaPath}" fill="${fillColor}"></path>
      <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
      ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="${strokeColor}"></circle>`).join("")}
    </svg>
  `;
}

function renderAnalysisDashboard(payload) {
  const dashboard = document.getElementById("analysisDashboard");
  if (!dashboard) return;

  const squadPlayers = getAllSquadPlayers(payload?.cska?.squad);
  const topImpactPlayers = squadPlayers
    .map((player) => ({
      name: getPlayerDisplayName(player?.name),
      impact: computePlayerImpact(player)
    }))
    .filter((player) => player.impact > 0)
    .sort((left, right) => right.impact - left.impact)
    .slice(0, 8);

  const impactMax = Math.max(...topImpactPlayers.map((player) => player.impact), 1);
  const impactMarkup = topImpactPlayers.length
    ? topImpactPlayers.map((player) => `
        <div class="analysis-bar-row">
          <div class="analysis-bar-meta">
            <span class="analysis-bar-label">${player.name}</span>
            <span class="analysis-bar-value">${player.impact.toFixed(2)}</span>
          </div>
          <div class="analysis-bar-track"><span class="analysis-bar-fill" style="width:${(player.impact / impactMax) * 100}%"></span></div>
        </div>
      `).join("")
    : `<p class="analysis-chart-fallback">${t("analysisNoData")}</p>`;

  const recentResults = buildRecentResultsSeries(payload?.cska?.lastResults);
  const goalsMarkup = recentResults.length
    ? (() => {
        const goalValues = recentResults.map((match) => match.goals);
        const goalMax = Math.max(...goalValues, 1);
        const trendSvg = buildTrendSvg(goalValues, 320, 120, "#b0121a", "rgba(176,18,26,0.16)");
        return `
          <div class="analysis-goals-chart">
            <div class="analysis-trend-wrap">${trendSvg}</div>
            <div class="analysis-goal-bars">
              ${recentResults.map((match) => `
                <div class="analysis-goal-col">
                  <span class="analysis-goal-value">${match.goals}</span>
                  <span class="analysis-goal-bar" style="height:${Math.max(18, (match.goals / goalMax) * 90)}px"></span>
                  <span class="analysis-goal-label">${match.label}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      })()
    : `<p class="analysis-chart-fallback">${t("analysisGoalsFallback")}</p>`;

  const cskaStanding = getCskaStandingRow(payload?.standings || []);
  const formMarkup = recentResults.length
    ? (() => {
        let runningPoints = 0;
        const ppmValues = recentResults.map((match, index) => {
          runningPoints += match.resultKey === "win" ? 3 : match.resultKey === "draw" ? 1 : 0;
          return Number((runningPoints / (index + 1)).toFixed(2));
        });
        const ppmSvg = buildTrendSvg(ppmValues, 320, 96, "#1f7a3d", "rgba(31,122,61,0.16)");
        return `
          <div class="analysis-form-timeline">
            ${recentResults.map((match) => `
              <span class="analysis-form-chip analysis-form-chip-${match.resultKey}" title="${match.date} ${match.score} vs ${match.opponent}">${t(`analysisResult${match.resultKey.charAt(0).toUpperCase()}${match.resultKey.slice(1)}`)}</span>
            `).join("")}
          </div>
          <div class="analysis-trend-caption">${t("analysisPpmLabel")}</div>
          <div class="analysis-trend-wrap analysis-trend-wrap-compact">${ppmSvg}</div>
        `;
      })()
    : cskaStanding
      ? (() => {
          const total = Math.max((Number(cskaStanding.w) || 0) + (Number(cskaStanding.d) || 0) + (Number(cskaStanding.l) || 0), 1);
          const ppm = Number((((Number(cskaStanding.pts) || 0) / (Number(cskaStanding.mp) || total || 1)).toFixed(2)));
          return `
            <p class="analysis-chart-fallback">${t("analysisFormFallback")}</p>
            <div class="analysis-season-summary">
              <div class="analysis-season-bars">
                <span class="analysis-season-segment analysis-season-segment-win" style="width:${((Number(cskaStanding.w) || 0) / total) * 100}%"></span>
                <span class="analysis-season-segment analysis-season-segment-draw" style="width:${((Number(cskaStanding.d) || 0) / total) * 100}%"></span>
                <span class="analysis-season-segment analysis-season-segment-loss" style="width:${((Number(cskaStanding.l) || 0) / total) * 100}%"></span>
              </div>
              <div class="analysis-season-meta">
                <span>${t("analysisResultWin")}: ${cskaStanding.w}</span>
                <span>${t("analysisResultDraw")}: ${cskaStanding.d}</span>
                <span>${t("analysisResultLoss")}: ${cskaStanding.l}</span>
                <span>${t("analysisPpmLabel")}: ${ppm}</span>
              </div>
            </div>
          `;
        })()
      : `<p class="analysis-chart-fallback">${t("analysisNoData")}</p>`;

  dashboard.innerHTML = `
    <div class="analysis-dashboard-head">
      <h3>${t("analysisDashboardTitle")}</h3>
    </div>
    <div class="analysis-dashboard-grid">
      <article class="analysis-widget analysis-widget-impact">
        <div class="analysis-widget-head">
          <h4>${t("analysisImpactChartTitle")}</h4>
          <p>${t("analysisImpactChartHint")}</p>
        </div>
        <div class="analysis-bars">${impactMarkup}</div>
      </article>
      <article class="analysis-widget analysis-widget-goals">
        <div class="analysis-widget-head">
          <h4>${t("analysisGoalsChartTitle")}</h4>
          <p>${t("analysisGoalsChartHint")}</p>
        </div>
        ${goalsMarkup}
      </article>
      <article class="analysis-widget analysis-widget-form wide-panel">
        <div class="analysis-widget-head">
          <h4>${t("analysisFormChartTitle")}</h4>
          <p>${t("analysisFormChartHint")}</p>
        </div>
        ${formMarkup}
      </article>
    </div>
  `;
}

function setActiveSquadGroup(activeId) {
  const fallbackId = SQUAD_SECTION_IDS.find((id) => document.getElementById(id)) || "";
  const safeActiveId = SQUAD_SECTION_IDS.includes(activeId) ? activeId : fallbackId;

  document.querySelectorAll(".squad-nav-link").forEach((link) => {
    const selected = link.getAttribute("href") === `#${safeActiveId}`;
    link.classList.toggle("is-active", selected);
    link.setAttribute("aria-current", selected ? "true" : "false");
  });
}

function setActiveMainSection(activeId) {
  const fallbackId = MAIN_SECTION_IDS.find((id) => document.getElementById(id)) || "";
  const safeActiveId = MAIN_SECTION_IDS.includes(activeId) ? activeId : fallbackId;

  document.querySelectorAll(".page-nav-link").forEach((link) => {
    const selected = link.getAttribute("href") === `#${safeActiveId}`;
    link.classList.toggle("is-active", selected);
    link.setAttribute("aria-current", selected ? "true" : "false");
  });
}

function updateStickyNavigationOffsets() {
  const root = document.documentElement;
  const stickyNavWrap = document.querySelector(".page-nav-sticky-wrap");
  const squadNavWrap = document.querySelector(".squad-nav-wrap");

  if (stickyNavWrap) {
    const stickyHeight = Math.ceil(stickyNavWrap.getBoundingClientRect().height);
    root.style.setProperty("--sticky-master-height", `${Math.max(stickyHeight, 48)}px`);
  }

  if (squadNavWrap) {
    const squadHeight = Math.ceil(squadNavWrap.getBoundingClientRect().height);
    root.style.setProperty("--sticky-squad-height", `${Math.max(squadHeight, 44)}px`);
  }
}

function setupMainSectionNavigation() {
  const navLinks = Array.from(document.querySelectorAll(".page-nav-link"));
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    if (link.dataset.activeBound === "true") return;
    link.dataset.activeBound = "true";
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      setActiveMainSection(href.slice(1));
    });
  });

  if (mainSectionObserver) {
    mainSectionObserver.disconnect();
  }

  const targets = MAIN_SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  if (!targets.length) {
    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    return;
  }

  setActiveMainSection(targets[0].id);

  mainSectionObserver = new IntersectionObserver((entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

    if (!visibleEntries.length) return;

    const topEntry = visibleEntries[0];
    if (topEntry?.target?.id) {
      setActiveMainSection(topEntry.target.id);
    }
  }, {
    root: null,
    threshold: [0.2, 0.45, 0.7],
    rootMargin: "-20% 0px -58% 0px"
  });

  targets.forEach((target) => mainSectionObserver.observe(target));
}

function setupSquadSectionNavigation() {
  const navLinks = Array.from(document.querySelectorAll(".squad-nav-link"));
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    if (link.dataset.activeBound === "true") return;
    link.dataset.activeBound = "true";
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      setActiveSquadGroup(href.slice(1));
    });
  });

  if (squadSectionObserver) {
    squadSectionObserver.disconnect();
  }

  const targets = SQUAD_SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  if (!targets.length) {
    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    return;
  }

  setActiveSquadGroup(targets[0].id);

  squadSectionObserver = new IntersectionObserver((entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

    if (!visibleEntries.length) return;

    const topEntry = visibleEntries[0];
    if (topEntry?.target?.id) {
      setActiveSquadGroup(topEntry.target.id);
    }
  }, {
    root: null,
    threshold: [0.2, 0.45, 0.7],
    rootMargin: "-18% 0px -60% 0px"
  });

  targets.forEach((target) => squadSectionObserver.observe(target));
}

const LEGEND_PROFILE_KEY = "cska_legends_profile";
const LEGEND_PROFILES = {
  "hristo-stoichkov": {
    bg: {
      subtitle: "Най-емблематичната фигура на ЦСКА и един от най-големите български футболисти в историята.",
      intro: "Христо Стоичков е най-емблематичният български футболист и най-яркият представител на школата на ЦСКА. Неговата кариера е пример за комбинация от талант, характер, агресия, дисциплина и непримиримост — качества, които го превръщат в световна звезда и в символ на българския футбол.",
      conclusionTitle: "7. Заключение",
      cards: [
        {
          title: "1. Ранни години и път към ЦСКА",
          body: `Стоичков е роден на 8 февруари 1966 г. в Пловдив. Започва в местни клубове, но истинският му пробив идва след преминаването в ЦСКА през 1988 г.
          <ul>
            <li>изключителна скорост</li>
            <li>мощен удар с левия крак</li>
            <li>агресивен стил</li>
            <li>умение да играе под напрежение</li>
          </ul>
          Това го прави идеален за философията на ЦСКА — клуб, който винаги е разчитал на силни характери.`
        },
        {
          title: "2. Кариера в ЦСКА — статистика и влияние",
          body: `Мачове: 119<br>Голове: 81<br>Трофеи: 3 титли + 4 купи
          <p>Стоичков не е просто голмайстор — той е играч, който променя динамиката на мача. Неговите силни страни са пресиране, експлозивност, завършващ удар и психологическа устойчивост.</p>
          <p>ЦСКА печели мачове благодарение на неговата агресия и лидерство.</p>`
        },
        {
          title: "3. Европейският пробив — Барселона и „Dream Team“",
          body: `През 1990 г. Стоичков преминава в Барселона, където попада под ръководството на Йохан Кройф. Там се превръща в част от легендарния „Dream Team“.
          <p>Шампионска лига: 1992<br>4 титли Испания<br>Златна топка: 1994</p>
          Стоичков става ключов елемент в тактиката на Кройф: диагонални пробиви, пространство за Ромарио и непрекъснат интензитет.`
        },
        {
          title: "4. Национален отбор — върхът на българския футбол",
          body: `На Световното първенство през 1994 г. Стоичков е голмайстор с 6 гола, а България достига 4-то място — най-големият успех в историята ни.
          <ul>
            <li>лидер на терена</li>
            <li>играч, който носи мачове сам</li>
            <li>психологически мотор на отбора</li>
          </ul>
          Без Стоичков България не би постигнала този резултат.`
        },
        {
          title: "5. Стил на игра — технически и тактически анализ",
          body: `<strong>Технически качества:</strong> мощен удар, бърз дрибъл, отлична игра един на един, прецизност при статични положения.<br><br>
          <strong>Тактически качества:</strong> намира празни пространства, агресивно пресиране, игра между линиите, силна връзка с партньорите в атака.<br><br>
          <strong>Психологически профил:</strong> изключителна мотивация, непримиримост, лидерство, способност да играе под огромно напрежение.`
        },
        {
          title: "6. Наследство и влияние върху ЦСКА",
          body: `Стоичков е не просто легенда — той е икона. Неговото влияние върху ЦСКА е многопластово: поставя клуба на европейската карта, вдъхновява поколения играчи, създава стандарт за борбеност и остава символ на червения дух.
          <p>За феновете на ЦСКА той е повече от футболист — той е част от идентичността на клуба.</p>`
        }
      ],
      conclusion: "Христо Стоичков е най-голямата легенда на ЦСКА и най-успешният български футболист. Кариерата му е пример за талант, характер и непримиримост. Той остава вечен символ на клуба и на българския футбол."
    },
    en: {
      subtitle: "Analytical profile of CSKA's greatest legend.",
      intro: "Hristo Stoichkov is the most iconic Bulgarian footballer and the brightest product of the CSKA school. His career blends talent, character, aggression, discipline, and relentlessness — qualities that turned him into a world star and a symbol of Bulgarian football.",
      conclusionTitle: "7. Conclusion",
      cards: [
        {
          title: "1. Early Years and Road to CSKA",
          body: `Stoichkov was born on 8 February 1966 in Plovdiv. He started in local clubs, but his real breakthrough came after joining CSKA in 1988.
          <ul>
            <li>outstanding speed</li>
            <li>powerful left-footed shot</li>
            <li>aggressive style</li>
            <li>ability to perform under pressure</li>
          </ul>
          That made him a perfect fit for CSKA's philosophy — a club that has always relied on strong personalities.`
        },
        {
          title: "2. CSKA Career — Statistics and Influence",
          body: `Matches: 119<br>Goals: 81<br>Trophies: 3 league titles + 4 cups
          <p>Stoichkov was more than a goalscorer — he was a player who changed the rhythm of a match. His major strengths were pressing, explosiveness, finishing, and psychological resilience.</p>
          <p>CSKA won matches thanks to his aggression and leadership.</p>`
        },
        {
          title: "3. European Breakthrough — Barcelona and the Dream Team",
          body: `In 1990, Stoichkov moved to Barcelona under Johan Cruyff and became part of the legendary Dream Team.
          <p>Champions League: 1992<br>4 La Liga titles<br>Ballon d'Or: 1994</p>
          Stoichkov became a key piece in Cruyff's system through diagonal runs, creating space for Romario, and relentless intensity.`
        },
        {
          title: "4. National Team — The Peak of Bulgarian Football",
          body: `At the 1994 FIFA World Cup, Stoichkov finished as top scorer with 6 goals, while Bulgaria reached fourth place — the greatest achievement in the country's history.
          <ul>
            <li>leader on the pitch</li>
            <li>a player who could carry matches alone</li>
            <li>the team's psychological engine</li>
          </ul>
          Without Stoichkov, Bulgaria would not have reached that level.`
        },
        {
          title: "5. Playing Style — Technical and Tactical Analysis",
          body: `<strong>Technical qualities:</strong> powerful shot, quick dribble, excellent one-on-one play, precision from set pieces.<br><br>
          <strong>Tactical qualities:</strong> finds open spaces, presses aggressively, operates between the lines, and connects strongly with attacking teammates.<br><br>
          <strong>Psychological profile:</strong> exceptional motivation, relentlessness, leadership, and the ability to perform under enormous pressure.`
        },
        {
          title: "6. Legacy and Influence on CSKA",
          body: `Stoichkov is not just a legend — he is an icon. His influence on CSKA is multilayered: he put the club on the European map, inspired generations of players, set the standard for fighting spirit, and remains a symbol of the red identity.
          <p>For CSKA supporters, he is more than a footballer — he is part of the club's identity.</p>`
        }
      ],
      conclusion: "Hristo Stoichkov is CSKA's greatest legend and Bulgaria's most successful footballer. His career is an example of talent, character, and relentlessness. He remains an eternal symbol of the club and of Bulgarian football."
    }
  },
  "dimitar-berbatov": {
    bg: {
      subtitle: "Най-елегантният голмайстор, израснал в школата на ЦСКА.",
      intro: "Димитър Бербатов е един от най‑талантливите и технични български футболисти в историята. Продукт на школата на ЦСКА, той е пример за комбинация от класа, интелект, техника и хладнокръвие — качества, които го превърнаха в световна звезда и в символ на българския футбол на най-високо ниво.",
      conclusionTitle: "7. Заключение",
      cards: [
        { title: "1. Ранни години и път към ЦСКА", body: `Бербатов е роден на 30 януари 1981 г. в Благоевград. Започва в Пирин, но истинският му пробив идва след преминаването в ЦСКА през 1998 г., където школата и методиката на клуба оформят неговия стил:<ul><li>изключителна техника</li><li>елегантен контрол на топката</li><li>хладнокръвие в завършващата фаза</li><li>интелигентно движение без топка</li></ul>Още като юноша се откроява като играч с „европейски“ профил — спокоен, прецизен, различен.` },
        { title: "2. Кариера в ЦСКА — статистика и влияние", body: `Мачове: 65<br>Голове: 38<br>Трофеи: Купа на България (1999)<p>Бербатов не е просто нападател — той е играч, който променя философията на атаката. Неговите силни страни в ЦСКА:</p><ul><li>техничен завършващ удар</li><li>игра с гръб към вратата</li><li>перфектен първи контрол</li><li>спокойствие под напрежение</li></ul><p>ЦСКА печели мачове благодарение на неговата класа и способност да решава ситуации с едно докосване.</p>` },
        { title: "3. Европейският пробив — Байер Леверкузен, Тотнъм, Манчестър Юнайтед", body: `След ЦСКА Бербатов преминава в Байер Леверкузен, където се превръща в един от най‑силните нападатели в Бундеслигата.<p>След това следват:</p><p><strong>Тотнъм</strong><br>- превръща се в един от най-елегантните нападатели във Висшата лига<br>- печели сърцата на феновете с техника и интелигентност</p><p><strong>Манчестър Юнайтед</strong><br>- Шампион на Англия: 2 пъти<br>- Голмайстор на Висшата лига: 2010/11<br>- хеттрик срещу Ливърпул<br>- играч с уникален стил, който съчетава класа и ефективност</p><p>Бербатов става част от елита на европейския футбол — не чрез сила, а чрез изкуство.</p>` },
        { title: "4. Национален отбор — лидер и голмайстор", body: `Голове: 48 (най‑резултатният български национал)<br>Мачове: 78<p>Бербатов е лидер чрез спокойствие, техника и интелект. Той е играч, който носи мачове сам, без да повишава тон — само чрез класа.</p>` },
        { title: "5. Стил на игра — технически и тактически анализ", body: `<strong>Технически качества:</strong><ul><li>феноменален първи контрол</li><li>прецизност при завършващ удар</li><li>елегантен дрибъл</li><li>игра с гръб към вратата</li><li>уникална визия за играта</li></ul><strong>Тактически качества:</strong><ul><li>умение да забавя или ускорява атаката</li><li>перфектно позициониране</li><li>игра между линиите</li><li>създаване на пространство за партньорите</li></ul><strong>Психологически профил:</strong><ul><li>спокойствие</li><li>увереност</li><li>интелект</li><li>липса на паника в ключови моменти</li></ul>Бербатов е нападател, който не просто бележи — той създава стил.` },
        { title: "6. Наследство и влияние върху ЦСКА", body: `Бербатов остава символ на това, което школата на ЦСКА може да създаде: играч с европейска класа, техника и интелект.<p>За феновете на ЦСКА той е пример за талант, развит по правилния начин, дисциплина, спокойствие и футболна елегантност. Той е доказателство, че ЦСКА е клуб, който ражда световни звезди.</p>` }
      ],
      conclusion: "Димитър Бербатов е един от най‑елегантните и технични нападатели в историята на българския футбол. Продукт на школата на ЦСКА, той остава символ на класа, интелект и спокойствие — качества, които го превърнаха в световна звезда и в легенда на българския футбол."
    },
    en: {
      subtitle: "The most elegant goalscorer to emerge from the CSKA academy.",
      intro: "Dimitar Berbatov is one of the most talented and technically gifted Bulgarian footballers in history. A product of CSKA's academy, he represents a blend of class, intelligence, technique, and composure — qualities that made him a global star and a symbol of Bulgarian football at the highest level.",
      conclusionTitle: "7. Conclusion",
      cards: [
        { title: "1. Early Years and Road to CSKA", body: `Berbatov was born on 30 January 1981 in Blagoevgrad. He started at Pirin, but his real breakthrough came after joining CSKA in 1998, where the club's academy and methodology shaped his style:<ul><li>outstanding technique</li><li>elegant ball control</li><li>calm finishing</li><li>intelligent off-ball movement</li></ul>Even as a youngster, he stood out as a player with a truly European profile — calm, precise, and different.` },
        { title: "2. CSKA Career — Statistics and Influence", body: `Matches: 65<br>Goals: 38<br>Trophies: Bulgarian Cup (1999)<p>Berbatov was not just a striker — he changed the philosophy of attack. His main strengths at CSKA were:</p><ul><li>technical finishing</li><li>playing with his back to goal</li><li>a perfect first touch</li><li>composure under pressure</li></ul><p>CSKA won matches thanks to his class and his ability to decide situations with a single touch.</p>` },
        { title: "3. European Breakthrough — Bayer Leverkusen, Tottenham, Manchester United", body: `After CSKA, Berbatov moved to Bayer Leverkusen, where he became one of the Bundesliga's top strikers.<p>Then came:</p><p><strong>Tottenham</strong><br>- became one of the most elegant strikers in the Premier League<br>- won fans over with technique and intelligence</p><p><strong>Manchester United</strong><br>- English champion: 2 times<br>- Premier League top scorer: 2010/11<br>- hat-trick against Liverpool<br>- a player with a unique style combining class and efficiency</p><p>Berbatov entered the European elite not through power, but through artistry.</p>` },
        { title: "4. National Team — Leader and Goalscorer", body: `Goals: 48 (Bulgaria's all-time top scorer)<br>Matches: 78<p>Berbatov led through calmness, technique, and intelligence. He was a player who could carry matches without raising his voice — only through class.</p>` },
        { title: "5. Playing Style — Technical and Tactical Analysis", body: `<strong>Technical qualities:</strong><ul><li>phenomenal first touch</li><li>precise finishing</li><li>elegant dribbling</li><li>back-to-goal play</li><li>unique vision</li></ul><strong>Tactical qualities:</strong><ul><li>ability to slow down or accelerate attacks</li><li>perfect positioning</li><li>operating between the lines</li><li>creating space for teammates</li></ul><strong>Psychological profile:</strong><ul><li>calmness</li><li>confidence</li><li>intelligence</li><li>lack of panic in key moments</li></ul>Berbatov was a striker who did not just score — he created style.` },
        { title: "6. Legacy and Influence on CSKA", body: `Berbatov remains a symbol of what the CSKA academy can produce: a player with European class, technique, and football intelligence.<p>For CSKA supporters, he is an example of talent developed the right way, discipline, calmness, and football elegance. He proves that CSKA is a club that creates world stars.</p>` }
      ],
      conclusion: "Dimitar Berbatov is one of the most elegant and technically refined strikers in Bulgarian football history. A product of the CSKA academy, he remains a symbol of class, intelligence, and composure — qualities that turned him into a world star and a Bulgarian legend."
    }
  },
  "petar-zhekov": {
    bg: {
      subtitle: "Най-големият голмайстор в историята на българския футбол.",
      intro: "Петър Жеков е легенда, която стои над статистиката — той е човекът, който превърна гола в изкуство. Най‑резултатният български нападател за всички времена.",
      conclusionTitle: "7. Заключение",
      cards: [
        { title: "1. Ранни години и път към ЦСКА", body: `Роден на 10 октомври 1944 г. в Симеоновград. След силни сезони в Берое преминава в ЦСКА през 1968 г.` },
        { title: "2. Кариера в ЦСКА — статистика и влияние", body: `<strong>Мачове:</strong> 200+<br><strong>Голове:</strong> 150+<br><strong>Трофеи:</strong> 3 титли, 2 купи<br><strong>Златна обувка:</strong> 1969<br>Жеков е нападател, който бележи от всякакви позиции.` },
        { title: "3. Европейски успехи", body: `Един от най‑страховитите нападатели в Европа в края на 60‑те и началото на 70‑те.` },
        { title: "4. Национален отбор", body: `Участник на Световното първенство 1970.<br>Голмайстор на България за всички времена.` },
        { title: "5. Стил на игра", body: `<ul><li>убийствен удар</li><li>перфектно позициониране</li><li>хищнически инстинкт</li><li>играч, който бележи без да му трябва много пространство</li></ul>` },
        { title: "6. Наследство", body: `Жеков остава вечен символ на гола в ЦСКА.` }
      ],
      conclusion: "Петър Жеков остава вечен символ на гола в ЦСКА и на голмайсторската класа в българския футбол."
    },
    en: {
      subtitle: "The greatest goalscorer in the history of Bulgarian football.",
      intro: "Petar Zhekov is a legend who stands above statistics — the man who turned scoring into an art. He remains Bulgaria's most prolific striker of all time.",
      conclusionTitle: "7. Conclusion",
      cards: [
        { title: "1. Early Years and Road to CSKA", body: `Born on 10 October 1944 in Simeonovgrad. After strong seasons with Beroe, he joined CSKA in 1968.` },
        { title: "2. CSKA Career — Statistics and Influence", body: `<strong>Matches:</strong> 200+<br><strong>Goals:</strong> 150+<br><strong>Trophies:</strong> 3 league titles, 2 cups<br><strong>European Golden Shoe:</strong> 1969<br>Zhekov was a striker who could score from any position.` },
        { title: "3. European Success", body: `One of the most feared strikers in Europe in the late 1960s and early 1970s.` },
        { title: "4. National Team", body: `Played at the 1970 FIFA World Cup.<br>Bulgaria's all-time top goalscorer.` },
        { title: "5. Playing Style", body: `<ul><li>lethal shot</li><li>perfect positioning</li><li>predatory instinct</li><li>a player who scored without needing much space</li></ul>` },
        { title: "6. Legacy", body: `Zhekov remains an eternal symbol of goals for CSKA.` }
      ],
      conclusion: "Petar Zhekov remains an eternal symbol of scoring for CSKA and of pure goalscoring class in Bulgarian football."
    }
  },
  "georgi-dimitrov-djeki": {
    bg: {
      subtitle: "Аналитичен профил на капитана, който въплъщаваше духа на ЦСКА.",
      intro: "Георги Димитров – Джеки е един от най‑великите защитници в историята на българския футбол и емблематичен капитан на ЦСКА. Той е символ на стабилност, характер, лидерство и непреклонност — качества, които го превръщат в гръбнака на отбора през 70‑те и 80‑те години.",
      conclusionTitle: "7. Заключение",
      cards: [
        { title: "1. Ранни години и път към ЦСКА", body: `Роден на 14 януари 1959 г. в Стара Загора, Джеки започва в Берое, но истинският му разцвет идва след трансфера в ЦСКА през 1979 г.<ul><li>феноменален тайминг в единоборствата</li><li>изключителна игра с глава</li><li>лидерски качества</li><li>спокойствие под напрежение</li></ul>Той бързо се превръща в естествения капитан на отбора.` },
        { title: "2. Кариера в ЦСКА — статистика и влияние", body: `<strong>Мачове:</strong> 250+<br><strong>Трофеи:</strong> 4 титли, 4 купи<br><strong>Европейски успехи:</strong> два пъти четвъртфинал в КЕШ<p>Джеки е защитник, който диктува темпото на целия отбор.</p><ul><li>перфектно позициониране</li><li>лидерство в трудни моменти</li><li>умение да организира защитата</li><li>спокойствие и авторитет</li></ul>` },
        { title: "3. Национален отбор", body: `Капитан на България на Световното първенство 1986.<br>Един от най‑уважаваните български футболисти в Европа.` },
        { title: "4. Стил на игра", body: `<ul><li>силен, но интелигентен защитник</li><li>безупречен в единоборствата</li><li>отличен във въздуха</li><li>лидер, който говори малко, но тежи много</li></ul>` },
        { title: "5. Наследство", body: `Джеки остава символ на капитанството в ЦСКА. За феновете той е пример за чест, характер и непреклонност.` }
      ],
      conclusion: "Георги Димитров – Джеки е символ на капитанството в ЦСКА и пример за чест, характер и непреклонност."
    },
    en: {
      subtitle: "Analytical profile of the captain who embodied the spirit of CSKA.",
      intro: "Georgi Dimitrov – Djeki is one of the greatest defenders in Bulgarian football history and an iconic captain of CSKA. He became a symbol of stability, character, leadership, and resilience — qualities that made him the backbone of the team throughout the 1970s and 1980s.",
      conclusionTitle: "6. Conclusion",
      cards: [
        { title: "1. Early Years and Road to CSKA", body: `Born on 14 January 1959 in Stara Zagora, Djeki started at Beroe, but his true rise came after his transfer to CSKA in 1979.<ul><li>phenomenal timing in duels</li><li>excellent heading ability</li><li>leadership qualities</li><li>calmness under pressure</li></ul>He quickly became the natural captain of the team.` },
        { title: "2. CSKA Career — Statistics and Influence", body: `<strong>Matches:</strong> 250+<br><strong>Trophies:</strong> 4 league titles, 4 cups<br><strong>European achievements:</strong> two European Cup quarter-finals<p>Djeki was a defender who dictated the tempo of the whole team.</p><ul><li>perfect positioning</li><li>leadership in difficult moments</li><li>ability to organize the defence</li><li>calmness and authority</li></ul>` },
        { title: "3. National Team", body: `Captain of Bulgaria at the 1986 FIFA World Cup.<br>One of the most respected Bulgarian footballers in Europe.` },
        { title: "4. Playing Style", body: `<ul><li>strong but intelligent defender</li><li>flawless in duels</li><li>excellent in the air</li><li>a leader who spoke little but carried huge weight</li></ul>` },
        { title: "5. Legacy", body: `Djeki remains a symbol of captaincy at CSKA. For the supporters, he stands for honour, character, and resilience.` }
      ],
      conclusion: "Georgi Dimitrov – Djeki remains a symbol of captaincy at CSKA and an example of honour, character, and resilience."
    }
  },
  "stoycho-mladenov": {
    bg: {
      subtitle: "Аналитичен профил на човека, който победи Ливърпул и стана легенда два пъти — като играч и треньор.",
      intro: "Стойчо Младенов е една от най‑ярките фигури в историята на ЦСКА — голмайстор, лидер, треньор, символ на червения дух. Той е човекът, който два пъти остави следа: на терена и на скамейката.",
      conclusionTitle: "7. Заключение",
      cards: [
        { title: "1. Ранни години и път към ЦСКА", body: `Роден на 12 април 1957 г. в Петрич.<br>След силни сезони в Берое преминава в ЦСКА през 1980 г.<br><br>Още в първите мачове показва:<ul><li>мощен удар</li><li>невероятен нюх за гол</li><li>агресивност в наказателното поле</li><li>лидерски качества</li></ul>` },
        { title: "2. Кариера в ЦСКА — статистика и влияние", body: `<strong>Мачове:</strong> 180+<br><strong>Голове:</strong> 100+<br><strong>Трофеи:</strong> 3 титли, 2 купи<br>Най‑емблематичният момент: <strong>Голът срещу Ливърпул през 1982 г.</strong>, който изпраща ЦСКА на полуфинал в КЕШ.` },
        { title: "3. Европейски пробив", body: `Младенов е един от най‑страховитите нападатели в Европа в началото на 80‑те. Комбинира сила, техника и хищнически инстинкт.` },
        { title: "4. Национален отбор", body: `Участник на Световното първенство 1986.<br>Един от най‑резултатните български нападатели за времето си.` },
        { title: "5. Стил на игра", body: `<ul><li>мощен и директен</li><li>отличен завършващ удар</li><li>играч, който не се крие</li><li>лидер, който носи мачове сам</li></ul>` },
        { title: "6. Наследство", body: `Като треньор печели титла през 2008 г. За феновете е символ на борбеност, чест и непримиримост.` }
      ],
      conclusion: "Стойчо Младенов е символ на борбеност, чест и непримиримост — легенда два пъти, като играч и като треньор."
    },
    en: {
      subtitle: "Analytical profile of the man who beat Liverpool and became a legend twice — as a player and as a coach.",
      intro: "Stoycho Mladenov is one of the brightest figures in CSKA history — a goalscorer, leader, coach, and symbol of the club's fighting spirit. He left his mark twice: first on the pitch and later from the bench.",
      conclusionTitle: "7. Conclusion",
      cards: [
        { title: "1. Early Years and Road to CSKA", body: `Born on 12 April 1957 in Petrich.<br>After strong seasons with Beroe, he joined CSKA in 1980.<br><br>From his first matches he showed:<ul><li>a powerful shot</li><li>outstanding instinct for goals</li><li>aggression in the penalty area</li><li>leadership qualities</li></ul>` },
        { title: "2. CSKA Career — Statistics and Influence", body: `<strong>Matches:</strong> 180+<br><strong>Goals:</strong> 100+<br><strong>Trophies:</strong> 3 league titles, 2 cups<br>Most iconic moment: <strong>the goal against Liverpool in 1982</strong>, which sent CSKA to the European Cup semi-final.` },
        { title: "3. European Breakthrough", body: `Mladenov was one of the most feared strikers in Europe in the early 1980s. He combined power, technique, and a predatory instinct.` },
        { title: "4. National Team", body: `Played at the 1986 FIFA World Cup.<br>One of Bulgaria's most productive strikers of his era.` },
        { title: "5. Playing Style", body: `<ul><li>powerful and direct</li><li>excellent finishing</li><li>a player who never hid</li><li>a leader who could carry matches alone</li></ul>` },
        { title: "6. Legacy", body: `As a coach, he won the league title in 2008. For supporters, he remains a symbol of fighting spirit, honour, and relentlessness.` }
      ],
      conclusion: "Stoycho Mladenov is a symbol of fight, honour, and relentlessness — a legend twice over, as a player and as a coach."
    }
  }
};

let currentLegendId = (() => {
  const storedLegendId = localStorage.getItem(LEGEND_PROFILE_KEY);
  if (storedLegendId === "lubo-penev") return "hristo-stoichkov";
  return storedLegendId || "hristo-stoichkov";
})();

function legendProfileHTML(profile) {
  const localizedProfile = profile[currentLanguage] || profile.bg;
  const cards = localizedProfile.cards.map((card, index) => {
    const wideClass = index >= 4 ? " wide-panel" : "";
    return `
      <article class="stoychkov-panel${wideClass}">
        <h3>${card.title}</h3>
        <div class="legend-body">${card.body}</div>
      </article>
    `;
  }).join("\n");

  return `
    <div class="stoychkov-profile">
      <div class="stoychkov-header">
        <p class="section-subtitle">${localizedProfile.subtitle}</p>
      </div>
      <div class="stoychkov-intro">
        <p>${localizedProfile.intro}</p>
      </div>

      <div class="stoychkov-grid">
        ${cards}
      </div>

      <div class="stoychkov-conclusion">
        <h3>${localizedProfile.conclusionTitle}</h3>
        <p>${localizedProfile.conclusion}</p>
      </div>
    </div>
  `;
}

function renderLegendProfile() {
  const container = document.getElementById("legendProfile");
  if (!container) return;

  const profile = LEGEND_PROFILES[currentLegendId] || LEGEND_PROFILES["hristo-stoichkov"];
  container.innerHTML = legendProfileHTML(profile);

  document.querySelectorAll(".legend-switch-btn").forEach((btn) => {
    const selected = btn.dataset.legend === currentLegendId;
    btn.classList.toggle("is-active", selected);
    btn.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function setupLegendProfileSwitcher() {
  document.querySelectorAll(".legend-switch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.legend;
      if (!selected || selected === currentLegendId) return;
      currentLegendId = selected;
      localStorage.setItem(LEGEND_PROFILE_KEY, selected);
      renderLegendProfile();
    });
  });

  renderLegendProfile();
}

function applyLanguageUI() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.setAttribute("placeholder", t(key));
    }
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const selected = btn.dataset.lang === currentLanguage;
    btn.classList.toggle("is-active", selected);
    btn.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  const walletLabel = document.getElementById("cskaPartnerWalletLabel");
  const walletAddress = document.getElementById("cskaPartnerWalletAddress");
  const walletCopy = document.getElementById("cskaPartnerWalletCopy");
  const walletHint = document.getElementById("cskaPartnerWalletHint");
  const instagramLink = document.getElementById("cskaPartnerInstagram");
  const facebookLink = document.getElementById("cskaPartnerFacebook");
  const xLink = document.getElementById("cskaPartnerX");

  if (walletLabel) walletLabel.textContent = t("cskaPartnerWalletLabel");
  if (walletAddress) walletAddress.textContent = CSKA_SUPPORT_WALLET;
  if (walletCopy) {
    walletCopy.textContent = t("cskaPartnerWalletCopy");
    walletCopy.dataset.defaultLabel = t("cskaPartnerWalletCopy");
  }
  if (walletHint) walletHint.textContent = t("cskaPartnerWalletHint");
  if (instagramLink) instagramLink.href = CSKA_PARTNER_INSTAGRAM_URL;
  if (facebookLink) facebookLink.href = CSKA_PARTNER_FACEBOOK_URL;
  if (xLink) xLink.href = CSKA_PARTNER_X_URL;

  renderAnalysisContent();
  renderLegendProfile();

  requestAnimationFrame(updateStickyNavigationOffsets);
}

function setupLanguageSwitch() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosen = btn.dataset.lang === "en" ? "en" : "bg";
      if (chosen === currentLanguage) return;
      currentLanguage = chosen;
      localStorage.setItem(LANGUAGE_KEY, chosen);
      applyLanguageUI();
      if (lastPayload) {
        render(lastPayload, lastFromCache);
      }
    });
  });
}

function setupPartnershipButton() {}

function setupPartnershipWalletCopy() {
  const walletCopy = document.getElementById("cskaPartnerWalletCopy");
  if (walletCopy) {
    walletCopy.addEventListener("click", copyCskaPartnerWalletAddress);
  }
}

function copyCskaPartnerWalletAddress() {
  const walletCopy = document.getElementById("cskaPartnerWalletCopy");
  if (!walletCopy) {
    return;
  }

  const defaultLabel = walletCopy.dataset.defaultLabel || t("cskaPartnerWalletCopy");
  const copiedLabel = t("cskaPartnerWalletCopied");

  function onSuccess() {
    walletCopy.textContent = copiedLabel;
    setTimeout(() => {
      walletCopy.textContent = defaultLabel;
    }, 1400);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(CSKA_SUPPORT_WALLET).then(onSuccess).catch(() => {
      copyCskaWalletFallback(onSuccess);
    });
    return;
  }

  copyCskaWalletFallback(onSuccess);
}

function copyCskaWalletFallback(onSuccess) {
  const textArea = document.createElement("textarea");
  textArea.value = CSKA_SUPPORT_WALLET;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const copied = document.execCommand("copy");
    if (copied) {
      onSuccess();
    }
  } catch (_) {
  }

  document.body.removeChild(textArea);
}

function localizeValidationWarning(rawWarning) {
  const warning = String(rawWarning || "").trim().toLowerCase();
  const warningMap = {
    "standings fallback kept": t("warnStandingsFallback"),
    "lastresults fallback kept": t("warnLastResultsFallback"),
    "nextmatches fallback kept": t("warnNextMatchesFallback"),
    "standings fetch failed": t("warnStandingsFetchFailed"),
    "lastresults fetch failed": t("warnLastResultsFetchFailed"),
    "nextmatches fetch failed": t("warnNextMatchesFetchFailed")
  };

  return warningMap[warning] || rawWarning;
}

function parseValidationWarnings(note) {
  const match = String(note || "").match(/validation \(([^)]+)\)/i);
  if (!match || !match[1]) {
    return [];
  }
  return match[1].split(",").map((item) => item.trim()).filter(Boolean);
}

function renderSourceNote(baseNote) {
  const sourceNote = document.getElementById("sourceNote");
  if (!sourceNote) return;

  sourceNote.innerHTML = "";

  const lines = [];
  lines.push(`${t("sourceMissingStatsLabel")} ${t("sourceMissingStats")}`);
  lines.push(`${t("sourceImpactLabel")} ${t("impactFormula")}`);

  lines.forEach((line) => {
    const row = document.createElement("span");
    row.className = "source-note-line";
    row.textContent = line;
    sourceNote.appendChild(row);
  });
}

function showError(message) {
  const statusLine = document.getElementById("statusLine");
  if (!statusLine) return;
  statusLine.textContent = message || t("errLoadData");
  statusLine.classList.add("status-error");
  statusLine.classList.remove("status-ok");
}

const FALLBACK_DATA = {
  source: { note: "Fallback data loaded." },
  standings: [],
  cska: {
    nextMatches: [],
    lastResults: [],
    todayMatches: [],
    squad: {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: []
    }
  }
};

const TEAM_LOGOS = {
  "Левски София": "https://static.flashscore.com/res/image/data/hOa8FKR0-zeLrkjui.png",
  "Лудогорец": "https://static.flashscore.com/res/image/data/KG84D6Rq-Kjkd1Ayp.png",
  "ЦСКА 1948": "https://static.flashscore.com/res/image/data/CrPTEUT0-dIoxO1fK.png",
  "ЦСКА София": "https://static.flashscore.com/res/image/data/MZmpVA7k-nTkb2fj6.png",
  "Черно море": "https://static.flashscore.com/res/image/data/GrK5iugT-tjkFB7mQ.png",
  "Арда": "https://static.flashscore.com/res/image/data/UwKU0w86-8huEu0wU.png",
  "Ботев Пловдив": "https://static.flashscore.com/res/image/data/KKH0khRq-UVZMFjiK.png",
  "Локомотив Пловдив": "https://static.flashscore.com/res/image/data/zNR5wyBN-CrHFHNPj.png",
  "Локомотив София": "https://static.flashscore.com/res/image/data/KbTwOMkC-0xN9676E.png",
  "Славия София": "https://static.flashscore.com/res/image/data/IgY8NX7k-rXOMwTEr.png",
  "Ботев Враца": "https://static.flashscore.com/res/image/data/nku6ne8k-vTHHOmI9.png",
  "Добруджа": "https://static.flashscore.com/res/image/data/Y1cNNK5k-bspvajO9.png",
  "Спартак Варна": "https://static.flashscore.com/res/image/data/6TetCWBN-boO56d81.png",
  "Берое": "https://static.flashscore.com/res/image/data/xpH48q86-fmfS2lRL.png",
  "Септември София": "https://static.flashscore.com/res/image/data/G8c1lpgT-Oj0MPYxU.png",
  "Монтана": "https://static.flashscore.com/res/image/data/QLieRNR0-COvJNbKS.png",
};

const TEAM_NAME_ALIASES = {
  "Левски": "Левски София",
  "ЦСКА": "ЦСКА София",
  "Локо Пловдив": "Локомотив Пловдив",
  "Локо София": "Локомотив София",
  "Локомотив (Пловдив)": "Локомотив Пловдив",
  "Локомотив (София)": "Локомотив София",
  "Арда (Кърджали)": "Арда",
  "Ботев (Враца)": "Ботев Враца",
  "Ботев (Пловдив)": "Ботев Пловдив",
  "Спартак (Варна)": "Спартак Варна",
  "Септември (София)": "Септември София"
};

function isValidPayload(payload) {
  return Boolean(payload && Array.isArray(payload.standings) && payload.standings.length);
}

function normalizeTeamName(team) {
  return TEAM_NAME_ALIASES[team] || team;
}

function formatTeamDisplayName(team) {
  const normalized = normalizeTeamName(team);
  const logo = getTeamLogo(team);
  let displayName = normalized;
  // Ако е ЦСКА, винаги изписвай "ЦСКА"
  if (normalized === 'ЦСКА София' || team === 'ЦСКА') {
    displayName = 'ЦСКА';
  }
  return logo ? `<img src="${logo}" alt="${displayName}" style="height:1em;vertical-align:middle;margin-right:0.3em">${displayName}` : displayName;
}

function getTeamLogo(team) {
  return TEAM_LOGOS[normalizeTeamName(team)] || "";
}

function sortStandingsByRank(standings) {
  return [...(standings || [])].sort((left, right) => {
    const leftRank = Number(left?.rank) || Number.MAX_SAFE_INTEGER;
    const rightRank = Number(right?.rank) || Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}

function renderStandings(standings) {
  const body = document.querySelector("#standingsTable tbody");
  body.innerHTML = "";

  sortStandingsByRank(standings).forEach((row) => {
    const logo = getTeamLogo(row.team);
    const tr = document.createElement("tr");
    const rank = Number(row.rank);
    if (rank === 1) tr.classList.add("zone-champion");
    else if (rank === 2) tr.classList.add("zone-ucl");
    else if (rank === 3) tr.classList.add("zone-uel");
    else if (rank >= 4 && rank <= 5) tr.classList.add("zone-uecl");
    else if (rank === 14) tr.classList.add("zone-playoff");
    else if (rank >= 15) tr.classList.add("zone-rel");
    tr.innerHTML = `
      <td>${row.rank ?? "-"}</td>
      <td>
        <div class="team-cell">
          <span class="standings-team-bubble" title="${row.team ?? "-"}">${formatTeamDisplayName(row.team ?? "-")}</span>
        </div>
      </td>
      <td><span class="standings-stat-bubble standings-stat-bubble-strong">${row.pts ?? "-"}</span></td>
    `;
    body.appendChild(tr);
  });
}

function renderMatches(id, rows, formatter) {
  const list = document.getElementById(id);
  list.innerHTML = "";

  rows.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = formatter(m);
    list.appendChild(li);
  });
}

function matchMarkup(match, withScore) {
  const homeLogo = getTeamLogo(match.home);
  const awayLogo = getTeamLogo(match.away);
  const extra = [match.round, match.venue].filter(Boolean).join(" · ");

  return `
    <div class="match-item">
      <div class="match-meta">${match.date}${match.time ? ` ${match.time}` : ""}${extra ? `<span class="match-sub">${extra}</span>` : ""}</div>
      <div class="match-lineup">
        <span class="team-chip" title="${match.home}">${homeLogo ? `<img class="team-logo" src="${homeLogo}" alt="${match.home}" loading="lazy" />` : ""}${match.home}</span>
        <span class="vs-chip">${withScore ? match.score : "-"}</span>
        <span class="team-chip" title="${match.away}">${awayLogo ? `<img class="team-logo" src="${awayLogo}" alt="${match.away}" loading="lazy" />` : ""}${match.away}</span>
      </div>
    </div>
  `;
}

function todayKey() {
  return new Date().toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit"
  }).replace(/\//g, ".");
}

function buildTodayMatchesRows(cska) {
  const explicitTodayMatches = Array.isArray(cska?.todayMatches) ? cska.todayMatches : [];
  return explicitTodayMatches;
}

function render(payload, fromCache) {
  lastPayload = payload;
  lastFromCache = fromCache;

  renderStandings(payload.standings || []);

  renderSquad(payload.cska?.squad || FALLBACK_DATA.cska.squad);
  renderAnalysisDashboard(payload);

  const teamInfoBarEl = document.getElementById("teamInfoBar");
  if (teamInfoBarEl) {
    const ti = payload.cska?.teamInfo;
    if (ti?.stadium) {
      const parts = [`${t("stadiumLabel")} ${ti.stadium}`];
      if (ti.foundedYear) parts.push(`${t("foundedLabel")} ${ti.foundedYear}`);
      teamInfoBarEl.textContent = parts.join("  ·  ");
    } else {
      teamInfoBarEl.textContent = "";
    }
  }

  const sourceNote = document.getElementById("sourceNote");
  const statusLine = document.getElementById("statusLine");

  const baseNote = payload.source?.note || "";
  renderSourceNote(baseNote);
  statusLine.classList.remove("status-error");
  statusLine.textContent = fromCache
    ? t("statusFromCache")
    : t("statusLatest");

  requestAnimationFrame(updateStickyNavigationOffsets);
}

async function fetchFreshData() {
  const candidates = [];

  if (DATA_API_URL) {
    candidates.push(async () => {
      const res = await fetch(DATA_API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("No live API data");
      const payload = await res.json();
      if (!payload || typeof payload !== "object") throw new Error("Invalid live API payload");
      return payload;
    });
  }

  candidates.push(async () => {
    const res = await fetch("data/bootstrap-data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No bootstrap data");
    const payload = await res.json();
    if (!payload || typeof payload !== "object") throw new Error("Invalid bootstrap payload");
    return payload;
  });

  for (const getPayload of candidates) {
    try {
      return await getPayload();
    } catch (_) {
      // Try next source in chain.
    }
  }

  return FALLBACK_DATA;
}

async function loadAndRender({ forceRefresh = false } = {}) {
  const now = Date.now();
  const cachedRaw = localStorage.getItem(LOCAL_CACHE_KEY);

  if (!forceRefresh && cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (cached.expiresAt > now && isValidPayload(cached.payload)) {
        render(cached.payload, true);
      }
    } catch {
      localStorage.removeItem(LOCAL_CACHE_KEY);
    }
  }

  let fresh = null;

  if (forceRefresh && DATA_API_URL) {
    try {
      const sep = DATA_API_URL.includes("?") ? "&" : "?";
      const refreshUrl = `${DATA_API_URL}${sep}refresh=1`;
      const res = await fetch(refreshUrl, { cache: "no-store" });
      if (res.ok) {
        const payload = await res.json();
        if (payload && typeof payload === "object") {
          fresh = payload;
        }
      }
    } catch (_) {
      // Fall back to normal chain below.
    }
  }

  if (!fresh) {
    fresh = await fetchFreshData();
  }

  if (isValidPayload(fresh)) {
    localStorage.setItem(
      LOCAL_CACHE_KEY,
      JSON.stringify({ payload: fresh, expiresAt: now + LOCAL_CACHE_TTL_MS })
    );
  }

  render(fresh, false);
}

async function init() {
  applyLanguageUI();
  setupLanguageSwitch();
  setupPartnershipWalletCopy();
  setupMainSectionNavigation();
  setupSquadSectionNavigation();
  setupLegendProfileSwitcher();
  updateStickyNavigationOffsets();
  window.addEventListener("resize", updateStickyNavigationOffsets);
  await loadAndRender({ forceRefresh: false });
}

init();

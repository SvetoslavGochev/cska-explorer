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
    return;
  }
  // Обединява всички групи (вратари, защитници и т.н.) в един масив
  const allPlayers = Object.values(squad).flat();
  if (!allPlayers.length) {
    squadGridEl.innerHTML = "";
    return;
  }
  squadGridEl.innerHTML = allPlayers.map((p) => {
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
  }).join("\n");
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
  await loadAndRender({ forceRefresh: false });
}

init();

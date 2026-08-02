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
  "Цварц Жоел": "🇨🇭"
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
  "Цварц Жоел": "Joel Cwarz"
};

const PLAYER_ROLE_BY_NAME = {
  bg: {
    "Евтимов Димитър": "Вратар",
    "Лапоухов Фьодор": "Вратар",
    "Николов Даниел": "Вратар",
    "Гбамен Жан-Филип": "Защитник",
    "Иванов Теодор": "Защитник",
    "Йорданов Андрей": "Защитник",
    "Лапеня Адриан": "Защитник",
    "Мартино Анхело": "Защитник",
    "Пастор": "Защитник",
    "Родригес Факундо": "Защитник",
    "Тунчев Алекс": "Защитник",
    "Ебонг Макс": "Халф",
    "Ето'о Джеймс": "Халф",
    "Жордао Бруно": "Халф",
    "Илиев Yulian": "Халф",
    "Каймаканов Васил": "Халф",
    "Николов Алесандро": "Халф",
    "Панайотов Петко": "Халф",
    "Сенси Стефано": "Халф",
    "Соле Исак": "Халф",
    "Уору Тамиму": "Халф",
    "Чорбаджийски Георги Бранков": "Халф",
    "Брахими Мохамед": "Нападател",
    "Годой Леандро": "Нападател",
    "Додай Кевин": "Нападател",
    "Живков Радослав": "Нападател",
    "Лео Перейра": "Нападател",
    "Пиедраита Алехандро": "Нападател",
    "Питас Йоанис": "Нападател",
    "Фаетон Матиас": "Нападател",
    "Цварц Жоел": "Нападател"
  },
  en: {
    "Евтимов Димитър": "Goalkeeper",
    "Лапоухов Фьодор": "Goalkeeper",
    "Николов Даниел": "Goalkeeper",
    "Гбамен Жан-Филип": "Defender",
    "Иванов Теодор": "Defender",
    "Йорданов Андрей": "Defender",
    "Лапеня Адриан": "Defender",
    "Мартино Анхело": "Defender",
    "Пастор": "Defender",
    "Родригес Факундо": "Defender",
    "Тунчев Алекс": "Defender",
    "Ебонг Макс": "Midfielder",
    "Ето'о Джеймс": "Midfielder",
    "Жордао Бруно": "Midfielder",
    "Илиев Yulian": "Midfielder",
    "Каймаканов Васил": "Midfielder",
    "Николов Алесандро": "Midfielder",
    "Панайотов Петко": "Midfielder",
    "Сенси Стефано": "Midfielder",
    "Соле Исак": "Midfielder",
    "Уору Тамиму": "Midfielder",
    "Чорбаджийски Георги Бранков": "Midfielder",
    "Брахими Мохамед": "Forward",
    "Годой Леандро": "Forward",
    "Додай Кевин": "Forward",
    "Живков Радослав": "Forward",
    "Лео Перейра": "Forward",
    "Пиедраита Алехандро": "Forward",
    "Питас Йоанис": "Forward",
    "Фаетон Матиас": "Forward",
    "Цварц Жоел": "Forward"
  }
};

function getPlayerDisplayName(name) {
  const safeName = String(name || "").trim();
  if (!safeName) return "-";
  if (currentLanguage === "en") {
    return PLAYER_NAME_EN_BY_BG[safeName] || safeName;
  }
  return safeName;
}

function renderSquad(squad) {
  const squadGridEl = document.getElementById("squadGrid");
  if (!squadGridEl) return;
  if (!squad || typeof squad !== "object") {
    squadGridEl.innerHTML = "";
    return;
  }

  const allPlayers = Object.values(squad).flat().filter(Boolean);
  if (!allPlayers.length) {
    squadGridEl.innerHTML = "";
    return;
  }

  const rows = allPlayers.map((p) => {
    const matches = Number.isFinite(Number(p.matches)) ? Number(p.matches) : 0;
    const goals = Number.isFinite(Number(p.goals)) ? Number(p.goals) : 0;
    const assists = Number.isFinite(Number(p.assists)) ? Number(p.assists) : 0;
    const hattricks = Number.isFinite(Number(p.hattricks)) ? Number(p.hattricks) : 0;
    const impactRaw = (matches * 0.25) + (assists * 0.5) + (goals * 1) + (hattricks * 2);
    const impact = impactRaw.toFixed(2);
    const rawName = String(p.name || "").trim();
    const displayName = getPlayerDisplayName(rawName);
    const flag = PLAYER_FLAG_BY_NAME[rawName] || "🌍";
    const role = PLAYER_ROLE_BY_NAME[currentLanguage]?.[rawName] || PLAYER_ROLE_BY_NAME.bg[rawName] || "—";
    return {
      matches,
      goals,
      assists,
      hattricks,
      impact,
      rawName,
      displayName,
      flag,
      role
    };
  }).sort((a, b) => Number(b.impact) - Number(a.impact) || a.displayName.localeCompare(b.displayName));

  const headers = currentLanguage === "en"
    ? ["Nationality", "Player", "Position / Role", "Matches", "Goals", "Assists", "Hattricks", "Impact"]
    : ["Националност", "Играч", "Позиция / Роля", "Мачове", "Голове", "Асист.", "Хеттрици", "КПД"];

  const rowsHtml = rows.map((player, index) => {
    const isTopImpact = index < 3;
    return `
      <tr class="${isTopImpact ? "top-impact" : ""}">
        <td><span class="squad-player-flag" aria-hidden="true">${player.flag}</span></td>
        <td>${player.displayName}</td>
        <td>${player.role}</td>
        <td>${player.matches}</td>
        <td>${player.goals}</td>
        <td>${player.assists}</td>
        <td>${player.hattricks}</td>
        <td>${player.impact}</td>
      </tr>
    `;
  }).join("\n");

  squadGridEl.innerHTML = `
    <div class="squad-table-wrap">
      <table class="squad-table">
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
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
    cskaAnalysisTitle: "📊 Анализ на играта на ЦСКА",
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
    cskaAnalysisTitle: "📊 CSKA Game Analysis",
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

function t(key) {
  return I18N[currentLanguage]?.[key] || I18N.bg[key] || key;
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

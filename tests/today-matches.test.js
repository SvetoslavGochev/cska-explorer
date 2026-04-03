/**
 * Тест за заявките и парсването на "Мачове днес"
 *
 * Изпълнение:  node tests/today-matches.test.js
 * Изпълнение с жива заявка:  node tests/today-matches.test.js --live
 *
 * Покрива:
 *  1. extractEfbetTodayMatches  – единичен тест с примерен HTML
 *  2. extractBulgariaTodayMatches – единичен тест с примерен HTML
 *  3. Логиката за обединяване и деdup на двата масива
 *  4. (незадължително) Жива заявка към /api/data и проверка на схемата
 */

"use strict";

const assert = require("assert");
const http = require("http");

// ─── Помощни функции ─────────────────────────────────────────────────────────

function pass(label) {
  console.log(`  ✓  ${label}`);
}

function fail(label, err) {
  console.error(`  ✗  ${label}`);
  console.error(`     ${err && err.message ? err.message : err}`);
  process.exitCode = 1;
}

function section(title) {
  console.log(`\n── ${title} ─────────────────────────`);
}

// ─── Зависимости, копирани от server.js ──────────────────────────────────────

const TEAM_NAME_MAP = {
  "Arda Kardzhali": "Арда",
  "Beroe": "Берое",
  "Botev Plovdiv": "Ботев Пловдив",
  "Botev Vratsa": "Ботев Враца",
  "CSKA 1948": "ЦСКА 1948",
  "CSKA Sofia": "ЦСКА София",
  "Cherno More": "Черно море",
  "Dobrudzha Dobrich": "Добруджа",
  "Levski Sofia": "Левски София",
  "Lokomotiv Plovdiv": "Локомотив Пловдив",
  "Lokomotiv Sofia": "Локомотив София",
  "Ludogorets Razgrad": "Лудогорец",
  "Montana": "Монтана",
  "Septemvri Sofia": "Септември София",
  "Slavia Sofia": "Славия София",
  "Spartak Varna": "Спартак Варна"
};

const KNOWN_EFBET_TEAMS = new Set([
  "Левски София", "Лудогорец", "ЦСКА 1948", "ЦСКА София", "Черно море",
  "Арда", "Ботев Пловдив", "Локомотив Пловдив", "Локомотив София", "Славия София",
  "Ботев Враца", "Добруджа", "Спартак Варна", "Берое", "Септември София", "Монтана"
]);

const KNOWN_BULGARIAN_MATCH_TEAMS = new Set([
  ...KNOWN_EFBET_TEAMS,
  "България"
]);

function translateTeamName(name) {
  const raw = String(name || "").trim();
  return TEAM_NAME_MAP[raw] || raw || "-";
}

// Версии на функциите с инжектирана дата (параметър `now`), идентична логика
// на server.js — промяната е единствено за тестване.

function extractEfbetTodayMatches(html, now = new Date()) {
  const nextRoundMatch = String(html || "").match(/<span class="next_round">([\s\S]*?)<\/span>/i);
  if (!nextRoundMatch || !nextRoundMatch[1]) return [];

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const todayKey = `${day}.${month}`;

  const snippet = nextRoundMatch[1];
  const itemRegex = /(?:(\d{2}\.\d{2})\.\s*)?<a[^>]*>([^<]+?)\s-\s([^<]+?)<\/a>/gi;
  const parsed = [];
  let currentDate = "";
  let match = itemRegex.exec(snippet);

  while (match) {
    if (match[1]) currentDate = match[1];
    const home = String(match[2] || "").trim();
    const away = String(match[3] || "").trim();
    if (currentDate && home && away) {
      parsed.push({ date: currentDate, time: "", home, away });
    }
    match = itemRegex.exec(snippet);
  }

  return parsed
    .filter((e) => e.date === todayKey)
    .map((e) => ({
      date: e.date,
      time: e.time,
      home: translateTeamName(e.home),
      away: translateTeamName(e.away)
    }));
}

function extractBulgariaTodayMatches(html, now = new Date()) {
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const todayKey = `${day}.${month}`;

  const raw = String(html || "");
  const itemRegex = /(?:(\d{2}\.\d{2})\.\s*)?<a href="\/match\/soccer\/[^"]+"[^>]*>([^<]+?)\s-\s([^<]+?)<\/a>/gi;
  const parsed = [];
  let currentDate = "";
  let match = itemRegex.exec(raw);

  while (match) {
    if (match[1]) currentDate = match[1];
    const home = translateTeamName(String(match[2] || "").trim());
    const away = translateTeamName(String(match[3] || "").trim());
    const likelyBulgarianMatch =
      KNOWN_BULGARIAN_MATCH_TEAMS.has(home) || KNOWN_BULGARIAN_MATCH_TEAMS.has(away);
    if (currentDate && likelyBulgarianMatch) {
      parsed.push({ date: currentDate, time: "", home, away });
    }
    match = itemRegex.exec(raw);
  }

  const seen = new Set();
  return parsed
    .filter((e) => e.date === todayKey)
    .filter((e) => {
      const key = `${e.date}|${e.home}|${e.away}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function mergeAndDedup(efbetMatches, bulgariaMatches) {
  const merged = [...efbetMatches, ...bulgariaMatches];
  const unique = [];
  const seen = new Set();
  merged.forEach((e) => {
    const key = `${e.date}|${e.home}|${e.away}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(e);
    }
  });
  return unique;
}

// ─── Помощна функция за HTML шаблони ─────────────────────────────────────────

function dateKey(date = new Date()) {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ─── 1. extractEfbetTodayMatches ─────────────────────────────────────────────

section("1. extractEfbetTodayMatches");

const TODAY = new Date();
const TODAY_KEY = dateKey(TODAY);
const YESTERDAY_KEY = dateKey(new Date(TODAY.getTime() - 86400000));
const TOMORROW_KEY = dateKey(new Date(TODAY.getTime() + 86400000));

// 1a. Липсва span next_round → празен масив
try {
  const result = extractEfbetTodayMatches("<html>без ритм</html>", TODAY);
  assert.deepStrictEqual(result, []);
  pass("Без <span class=\"next_round\"> → []");
} catch (e) { fail("Без <span class=\"next_round\"> → []", e); }

// 1b. Мач за днес се връща
try {
  const html = `<span class="next_round">${TODAY_KEY}. <a href="/x">ЦСКА София - Левски София</a></span>`;
  const result = extractEfbetTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 1, "Трябва 1 мач");
  assert.strictEqual(result[0].home, "ЦСКА София");
  assert.strictEqual(result[0].away, "Левски София");
  assert.strictEqual(result[0].date, TODAY_KEY);
  pass("Мач за днес се връща (same date)");
} catch (e) { fail("Мач за днес се връща", e); }

// 1c. Мач от вчера се игнорира
try {
  const html = `<span class="next_round">${YESTERDAY_KEY}. <a href="/x">ЦСКА София - Берое</a></span>`;
  const result = extractEfbetTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 0, "Вчерашен мач не трябва да се връща");
  pass("Вчерашен мач се игнорира");
} catch (e) { fail("Вчерашен мач се игнорира", e); }

// 1d. Смесени дати – само днешните се връщат
try {
  const html = `<span class="next_round">
    ${YESTERDAY_KEY}. <a href="/a">Арда - Берое</a>
    ${TODAY_KEY}. <a href="/b">ЦСКА София - Лудогорец</a>
    ${TOMORROW_KEY}. <a href="/c">Ботев Пловдив - Арда</a>
  </span>`;
  const result = extractEfbetTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].home, "ЦСКА София");
  pass("Само днешни мачове при смесени дати");
} catch (e) { fail("Само днешни мачове при смесени дати", e); }

// 1e. Превод на английски имена
try {
  const html = `<span class="next_round">${TODAY_KEY}. <a href="/x">CSKA Sofia - Ludogorets Razgrad</a></span>`;
  const result = extractEfbetTodayMatches(html, TODAY);
  assert.strictEqual(result[0].home, "ЦСКА София");
  assert.strictEqual(result[0].away, "Лудогорец");
  pass("Превод на английски имена на отбори");
} catch (e) { fail("Превод на английски имена на отбори", e); }

// 1f. Няколко мача за днес
try {
  const html = `<span class="next_round">
    ${TODAY_KEY}. <a href="/a">ЦСКА София - Арда</a>
    <a href="/b">Левски София - Берое</a>
  </span>`;
  const result = extractEfbetTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 2, "Трябва 2 мача за днес");
  pass("Няколко мача за днес");
} catch (e) { fail("Няколко мача за днес", e); }

// ─── 2. extractBulgariaTodayMatches ──────────────────────────────────────────

section("2. extractBulgariaTodayMatches");

// 2a. Нито един /match/soccer/ линк → []
try {
  const result = extractBulgariaTodayMatches("<html>нищо</html>", TODAY);
  assert.deepStrictEqual(result, []);
  pass("Без /match/soccer/ линкове → []");
} catch (e) { fail("Без /match/soccer/ линкове → []", e); }

// 2b. Мач с познат отбор за днес се връща
try {
  const html = `${TODAY_KEY}. <a href="/match/soccer/bg/cska-levski-123">ЦСКА София - Левски София</a>`;
  const result = extractBulgariaTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].home, "ЦСКА София");
  pass("Мач с познат отбор за днес");
} catch (e) { fail("Мач с познат отбор за днес", e); }

// 2c. Непознат отбор се игнорира
try {
  const html = `${TODAY_KEY}. <a href="/match/soccer/en/man-utd-arsenal-999">Man Utd - Arsenal</a>`;
  const result = extractBulgariaTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 0, "Непознат отбор не трябва да се включва");
  pass("Непознат отбор се игнорира");
} catch (e) { fail("Непознат отбор се игнорира", e); }

// 2d. Дублирани записи се премахват
try {
  const html = `${TODAY_KEY}. <a href="/match/soccer/a/x">ЦСКА София - Левски София</a>
    <a href="/match/soccer/a/y">ЦСКА София - Левски София</a>`;
  const result = extractBulgariaTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 1, "Дублиран мач трябва да се покаже веднъж");
  pass("Дублирани записи се премахват");
} catch (e) { fail("Дублирани записи се премахват", e); }

// 2e. Вчерашен мач се игнорира
try {
  const html = `${YESTERDAY_KEY}. <a href="/match/soccer/a/x">ЦСКА София - Арда</a>`;
  const result = extractBulgariaTodayMatches(html, TODAY);
  assert.strictEqual(result.length, 0);
  pass("Вчерашен мач се игнорира");
} catch (e) { fail("Вчерашен мач се игнорира", e); }

// ─── 3. Обединяване и dedup ───────────────────────────────────────────────────

section("3. Обединяване и dedup на двата масива");

// 3a. Без припокриване → всички се включват
try {
  const efbet = [{ date: TODAY_KEY, time: "", home: "ЦСКА София", away: "Левски София" }];
  const bulgaria = [{ date: TODAY_KEY, time: "", home: "Лудогорец", away: "Берое" }];
  const result = mergeAndDedup(efbet, bulgaria);
  assert.strictEqual(result.length, 2);
  pass("Без припокриване → 2 уникални мача");
} catch (e) { fail("Без припокриване", e); }

// 3b. Пълен дубликат се премахва
try {
  const match = { date: TODAY_KEY, time: "", home: "ЦСКА София", away: "Левски София" };
  const result = mergeAndDedup([match], [{ ...match }]);
  assert.strictEqual(result.length, 1);
  pass("Пълен дубликат се премахва → 1 мач");
} catch (e) { fail("Пълен дубликат се премахва", e); }

// 3c. Ред на efbet мачовете се запазва (те идват преди в масива)
try {
  const efbet = [{ date: TODAY_KEY, time: "", home: "ЦСКА София", away: "Арда" }];
  const bulgaria = [
    { date: TODAY_KEY, time: "", home: "ЦСКА София", away: "Арда" },
    { date: TODAY_KEY, time: "", home: "Берое", away: "Ботев Пловдив" }
  ];
  const result = mergeAndDedup(efbet, bulgaria);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].home, "ЦСКА София", "Efbet мачът трябва да е пръв");
  pass("Ред от efbet се запазва; само Bulgaria-unique се добавят");
} catch (e) { fail("Ред от efbet се запазва", e); }

// 3d. Празни входове → []
try {
  assert.deepStrictEqual(mergeAndDedup([], []), []);
  pass("mergeAndDedup([], []) → []");
} catch (e) { fail("mergeAndDedup([], []) → []", e); }

// ─── 4. Жива заявка към /api/data (само с --live) ──────────────────────────

if (process.argv.includes("--live")) {
  section("4. Жива заявка към /api/data");

  const PORT = process.env.PORT || 3000;

  function getLiveData() {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${PORT}/api/data`, { timeout: 15000 }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error("Невалиден JSON от /api/data")); }
        });
      });
      req.on("error", reject);
      req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
    });
  }

  getLiveData()
    .then((data) => {
      // 4a. Полето todayMatches съществува
      try {
        assert.ok(
          data && data.cska && Object.prototype.hasOwnProperty.call(data.cska, "todayMatches"),
          "data.cska.todayMatches трябва да съществува"
        );
        pass("data.cska.todayMatches съществува");
      } catch (e) { fail("data.cska.todayMatches съществува", e); }

      // 4b. todayMatches е масив
      try {
        assert.ok(Array.isArray(data.cska.todayMatches), "todayMatches трябва да е масив");
        pass(`todayMatches е масив (${data.cska.todayMatches.length} мача днес)`);
      } catch (e) { fail("todayMatches е масив", e); }

      // 4c. Всеки запис има задължителните полета
      try {
        data.cska.todayMatches.forEach((m, i) => {
          assert.ok(typeof m.date === "string" && m.date.length, `[${i}].date`);
          assert.ok(typeof m.home === "string" && m.home.length, `[${i}].home`);
          assert.ok(typeof m.away === "string" && m.away.length, `[${i}].away`);
          assert.ok("time" in m, `[${i}].time присъства`);
        });
        pass("Всеки запис има date, time, home, away");
      } catch (e) { fail("Схема на запис", e); }

      // 4d. Без дубликати
      try {
        const keys = data.cska.todayMatches.map((m) => `${m.date}|${m.home}|${m.away}`);
        const unique = new Set(keys);
        assert.strictEqual(keys.length, unique.size, "Не трябва да има дублирани мачове");
        pass("Без дублирани мачове в живите данни");
      } catch (e) { fail("Без дублирани мачове", e); }

      console.log("\n  Данни на todayMatches:");
      if (data.cska.todayMatches.length === 0) {
        console.log("  (Няма мачове за днес в данните)");
      } else {
        data.cska.todayMatches.forEach((m) => {
          console.log(`  ${m.date} ${m.time || "--:--"}  ${m.home} - ${m.away}`);
        });
      }

      printSummary();
    })
    .catch((err) => {
      fail("Жива заявка към /api/data се провали", err);
      console.log("  Уверете се, че сървърът работи (node server.js) и опитайте отново.");
      printSummary();
    });
} else {
  printSummary();
}

// ─── Обобщение ────────────────────────────────────────────────────────────────

function printSummary() {
  const code = process.exitCode || 0;
  console.log(code === 0
    ? "\nВСИЧКИ ТЕСТОВЕ ПРЕМИНАХА ✓"
    : "\nНЯКОИ ТЕСТОВЕ ПРОПАДНАХА ✗"
  );
  if (!process.argv.includes("--live")) {
    console.log('Подсказка: добавете --live флаг за жива заявка (сървърът трябва да е стартиран)');
  }
}

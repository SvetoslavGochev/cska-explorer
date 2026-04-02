const LOCAL_CACHE_KEY = "cska_site_cache_v3";
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000;

function isValidPayload(payload) {
  if (!payload || !Array.isArray(payload.standings) || payload.standings.length === 0) {
    return false;
  }

  const firstTeam = String(payload.standings[0]?.team || "");
  if (!firstTeam || firstTeam.includes("����")) {
    return false;
  }

  return true;
}

async function loadData(force = false) {
  const now = Date.now();
  const cachedRaw = localStorage.getItem(LOCAL_CACHE_KEY);

  if (!force && cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (cached.expiresAt > now && isValidPayload(cached.payload)) {
        render(cached.payload, true);
        return;
      }
    } catch (_) {
      // Ignore broken local cache and refetch.
    }

    localStorage.removeItem(LOCAL_CACHE_KEY);
  }

  const endpoint = force ? "/api/data?refresh=1" : "/api/data";
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Неуспешно зареждане на данни");
  }

  const payload = await res.json();
  if (!isValidPayload(payload)) {
    throw new Error("Получени са невалидни/повредени данни. Пробвай форсирано опресняване.");
  }

  localStorage.setItem(
    LOCAL_CACHE_KEY,
    JSON.stringify({ payload, expiresAt: now + LOCAL_CACHE_TTL_MS })
  );
  render(payload, false);
}

function normalizeTeamName(team) {
  if (team === "Локо Пловдив") return "Локомотив Пловдив";
  if (team === "Локо София") return "Локомотив София";
  return team;
}

function render(data, fromLocalCache) {
  const updatedAtEl = document.getElementById("updatedAt");
  const cacheInfoEl = document.getElementById("cacheInfo");
  if (updatedAtEl) {
    updatedAtEl.textContent = `Обновено: ${new Date(data.updatedAt).toLocaleString("bg-BG")}`;
  }
  if (cacheInfoEl) {
    cacheInfoEl.textContent = `Кеш: ${data.cache?.source || "unknown"}`;
  }

  const standingsBody = document.querySelector("#standingsTable tbody");
  standingsBody.innerHTML = "";
  [...(data.standings || [])]
    .sort((left, right) => {
      const leftRank = Number(left?.rank) || Number.MAX_SAFE_INTEGER;
      const rightRank = Number(right?.rank) || Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    })
    .forEach((row) => {
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
      <td><span class="standings-team-bubble">${row.team ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.mp ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.w ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.d ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.l ?? "-"}</span></td>
      <td><span class="standings-stat-bubble">${row.gf ?? "-"}:${row.ga ?? "-"}</span></td>
      <td><span class="standings-stat-bubble standings-stat-bubble-strong">${row.pts ?? "-"}</span></td>
    `;
    standingsBody.appendChild(tr);
    });

  const nextMatches = document.getElementById("nextMatches");
  nextMatches.innerHTML = "";
  (data.cska?.nextMatches || []).forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${m.date} ${m.time} | ${m.home} - ${m.away}`;
    nextMatches.appendChild(li);
  });

  const lastResults = document.getElementById("lastResults");
  lastResults.innerHTML = "";
  (data.cska?.lastResults || []).forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${m.date} | ${m.home} ${m.score} ${m.away}`;
    lastResults.appendChild(li);
  });

  const squadGrid = document.getElementById("squadGrid");
  squadGrid.innerHTML = "";
  const squad = data.cska?.squad || {};
  const groups = [
    ["Вратари", squad.goalkeepers || []],
    ["Защитници", squad.defenders || []],
    ["Халфове", squad.midfielders || []],
    ["Нападатели", squad.forwards || []]
  ];

  groups.forEach(([title, players]) => {
    const wrap = document.createElement("div");
    wrap.className = "squad-group";
    wrap.innerHTML = `<h3>${title}</h3>`;
    const ul = document.createElement("ul");
    ul.className = "list";
    players.forEach((p) => {
      const li = document.createElement("li");
      const name = typeof p === "object" ? p.name : p;
      const num = typeof p === "object" ? p.number : null;
      const matches = Number(typeof p === "object" ? p.matches : NaN);
      const goals = Number(typeof p === "object" ? p.goals : NaN);
      const assists = Number(typeof p === "object" ? p.assists : NaN);
      const hattricks = Number(typeof p === "object" ? p.hattricks : NaN);
      const savesPerMatch = Number(typeof p === "object" ? p.savesPerMatch : NaN);
      const penaltiesSaved = Number(typeof p === "object" ? p.penaltiesSaved : NaN);
      const goalPerMatch = Number.isFinite(matches) && matches > 0 && Number.isFinite(goals)
        ? (goals / matches).toFixed(2)
        : "-";
      const safeMatches = Number.isFinite(matches) ? matches : "-";
      const safeGoals = Number.isFinite(goals) ? goals : "-";
      const safeAssists = Number.isFinite(assists) ? assists : "-";
      const safeHattricks = Number.isFinite(hattricks) ? hattricks : 0;
      const impactScore =
        (Number.isFinite(matches) ? matches * 0.25 : 0) +
        (Number.isFinite(assists) ? assists * 0.5 : 0) +
        (Number.isFinite(goals) ? goals * 1 : 0) +
        (safeHattricks * 2);

      li.innerHTML = `
        ${num != null ? `<span class="jersey-num">${num}</span>` : ""}
        <div class="player-meta">
          <span class="player-name">${name}</span>
          <span class="player-stats">
            <span class="stat-chip"><span class="stat-label">Мачове</span><span class="stat-value">${safeMatches}</span></span>
            <span class="stat-chip"><span class="stat-label">Голове</span><span class="stat-value">${safeGoals}</span></span>
            <span class="stat-chip"><span class="stat-label">Асист.</span><span class="stat-value">${safeAssists}</span></span>
            <span class="stat-chip"><span class="stat-label">Г/М</span><span class="stat-value">${goalPerMatch}</span></span>
            ${title === "Вратари" ? `<span class="stat-chip"><span class="stat-label">Спасяв./М</span><span class="stat-value">${Number.isFinite(savesPerMatch) ? savesPerMatch.toFixed(2) : "-"}</span></span>` : ""}
            ${title === "Вратари" ? `<span class="stat-chip"><span class="stat-label">Спас. дузпи</span><span class="stat-value">${Number.isFinite(penaltiesSaved) ? penaltiesSaved : "-"}</span></span>` : ""}
            <span class="stat-chip"><span class="stat-label">КПД</span><span class="stat-value">${impactScore > 0 ? impactScore.toFixed(2) : "-"}</span></span>
          </span>
        </div>
      `;
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    squadGrid.appendChild(wrap);
  });

  const allPlayersCount = groups.reduce((acc, group) => acc + group[1].length, 0);
  const nextMatch = data.cska?.nextMatches?.[0];

  const statRows = document.getElementById("statRows");
  const statNext = document.getElementById("statNext");
  const statPlayers = document.getElementById("statPlayers");
  const statAutoUpdated = document.getElementById("statAutoUpdated");

  if (statRows) {
    statRows.textContent = String((data.standings || []).length);
  }
  if (statNext) {
    statNext.textContent = nextMatch
      ? `${nextMatch.home} - ${nextMatch.away}`
      : "Няма данни";
  }
  if (statPlayers) {
    statPlayers.textContent = String(allPlayersCount);
  }
  if (statAutoUpdated) {
    const updatedAt = data?.updatedAt ? new Date(data.updatedAt) : null;
    const source = data?.cache?.source ? ` (${data.cache.source})` : "";
    statAutoUpdated.textContent = updatedAt && !Number.isNaN(updatedAt.getTime())
      ? `${updatedAt.toLocaleString("bg-BG")}${source}`
      : "Няма данни";
  }

  document.getElementById("sourceNote").textContent = data.source?.note || "";
  document.getElementById("statusLine").textContent = fromLocalCache
    ? "Показани са данни от локалния кеш (без нова заявка)."
    : "Показани са последните данни от сървъра.";
}

async function init() {
  const refreshBtn = document.getElementById("refreshBtn");
  const hardRefreshBtn = document.getElementById("hardRefreshBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await loadData(false);
    });
  }

  if (hardRefreshBtn) {
    hardRefreshBtn.addEventListener("click", async () => {
      await loadData(true);
    });
  }

  try {
    await loadData(false);
  } catch (err) {
    document.getElementById("statusLine").textContent = `Грешка: ${err.message}`;
  }
}

init();

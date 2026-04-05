// Визуализира състава на ЦСКА София в елемент с id "squadGrid"
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
  squadGridEl.innerHTML = allPlayers.map(p =>
    `<div class=\"squad-player\">${p.name} <span class=\"squad-pos\">${p.position || ''}</span></div>`
  ).join("\n");
}

// ...existing code from app.js appended below renderSquad...

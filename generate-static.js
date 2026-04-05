// Node.js script to generate a static HTML file with live data
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'public', 'index.html');
const dataPath = path.join(__dirname, 'data', 'bootstrap-data.json');
const outputPath = path.join(__dirname, 'public', 'index-static.html');

function renderStandings(standings) {
  return standings.map(row =>
    `<tr><td>${row.rank ?? '-'}</td><td>${row.team}</td><td>${row.mp}</td><td>${row.w}</td><td>${row.d}</td><td>${row.l}</td><td>${row.gf}:${row.ga}</td><td>${row.pts}</td></tr>`
  ).join('\n');
}

function renderTodayMatches(todayMatches) {
  if (!todayMatches || todayMatches.length === 0) {
    return '<li>Няма мачове днес</li>';
  }
  return todayMatches.map(m =>
    `<li>${m.date} ${m.time || ''} — ${m.home} vs ${m.away}</li>`
  ).join('\n');
}

function renderNextMatches(nextMatches) {
  if (!nextMatches || nextMatches.length === 0) return '';
  return nextMatches.map(m =>
    `<li>${m.date} ${m.time || ''} — ${m.home} vs ${m.away}</li>`
  ).join('\n');
}

function renderLastResults(lastResults) {
  if (!lastResults || lastResults.length === 0) return '';
  return lastResults.map(m =>
    `<li>${m.date}: ${m.home} ${m.score || '-'} ${m.away}</li>`
  ).join('\n');
}

function renderSquad(squad) {
  if (!squad || typeof squad !== 'object') return '';
  // Flatten all groups (goalkeepers, defenders, etc.) into a single array
  const allPlayers = Object.values(squad).flat();
  if (!allPlayers.length) return '';
  return allPlayers.map(p =>
    `<div class="squad-player">${p.name} <span class="squad-pos">${p.position || ''}</span></div>`
  ).join('\n');
}

function main() {
  const template = fs.readFileSync(templatePath, 'utf8');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Standings
  const standingsHtml = renderStandings(data.standings);
  // Today matches
  const todayMatchesHtml = renderTodayMatches(data.cska?.todayMatches || []);
  // Next matches
  const nextMatchesHtml = renderNextMatches(data.cska?.nextMatches || []);
  // Last results
  const lastResultsHtml = renderLastResults(data.cska?.lastResults || []);
  // Squad
  const squadHtml = renderSquad(data.cska?.squad || []);

  // Replace placeholders in template
  let output = template
    .replace('<tbody></tbody>', `<tbody>\n${standingsHtml}\n</tbody>`)
    .replace('<ul id="todayMatches"></ul>', `<ul id="todayMatches">\n${todayMatchesHtml}\n</ul>`)
    .replace('<ul class="list" id="nextMatches"></ul>', `<ul class="list" id="nextMatches">\n${nextMatchesHtml}\n</ul>`)
    .replace('<ul class="list" id="lastResults"></ul>', `<ul class="list" id="lastResults">\n${lastResultsHtml}\n</ul>`)
    .replace('<div class="squad-grid" id="squadGrid"></div>', `<div class="squad-grid" id="squadGrid">\n${squadHtml}\n</div>`)
    .replace('<p id="statAutoUpdated" class="small-stat">-</p>', `<p id="statAutoUpdated" class="small-stat">${data.updatedAt}</p>`);

  fs.writeFileSync(outputPath, output, 'utf8');
  console.log('Static HTML generated at', outputPath);
}

main();

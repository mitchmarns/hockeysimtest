import { teams, loadTeamsFromLocalStorage, loadPlayers } from './team.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  loadTeamsFromLocalStorage();  // Ensure teams are loaded from LocalStorage
  displayTeamLines();  // Display lines for each team
});

function displayTeamLines() {
  const teamsContainer = document.getElementById('lines-container');
  
  teams.forEach((team) => {
    const teamLinesDiv = document.getElementById(`${team.name}-lines`);
    teamLinesDiv.innerHTML = `
      <h4>Forwards</h4>
      ${generateLineSlots(team, 'Forward', 4, ['LW', 'C', 'RW'])}
      <h4>Defense</h4>
      ${generateLineSlots(team, 'Defense', 3, ['LD', 'RD'])}
      <h4>Goalies</h4>
      ${generateGoalieSlots(team)}
    `;
  });
}

function generateLineSlots(team, category, linesCount, positions) {
  let html = '';
  for (let i = 1; i <= linesCount; i++) {
    const line = category === 'Forward' ? team.lines.forwards[i - 1] : team.lines.defense[i - 1];
    html += `
      <div class="line">
        ${positions.map(pos => {
          const playerId = line[pos];
          const player = team.players.find(p => p.id === playerId);
          return `
            <div class="player-slot" data-team="${team.name}" data-line="${category} Line ${i}" data-role="${pos}">
              ${player ? `
                <div class="player-slot" data-player-id="${player.id}">
                  <img src="${player.image}" alt="${player.name}" />
                  <span>${player.name}</span>
                  <button class="remove-btn" onclick="removePlayerFromLine('${team.name}', '${category}', ${i}, '${pos}')">Remove</button>
                  <div>
                    <label>Injured</label>
                    <input type="checkbox" class="injured-toggle" ${player.injured ? 'checked' : ''} onclick="toggleInjuryStatus(${player.id})">
                  </div>
                  <div>
                    <label>Healthy Scratch</label>
                    <input type="checkbox" class="healthy-scratch-toggle" ${player.healthyScratch ? 'checked' : ''} onclick="toggleHealthyScratch(${player.id})">
                  </div>
                </div>` : ''}
            </div>`;
        }).join('')}
      </div>`;
  }
  return html;
}

function generateGoalieSlots(team) {
  return ['Starter', 'Backup'].map(role => {
    const playerId = team.lines.goalies[role];
    const player = team.players.find(p => p.id === playerId);
    return `
      <div class="player-slot" data-team="${team.name}" data-role="${role}">
        ${player ? `
          <div class="player-slot" data-player-id="${player.id}">
            <img src="${player.image}" alt="${player.name}" />
            <span>${player.name}</span>
            <button class="remove-btn" onclick="removePlayerFromLine('${team.name}', 'Goalie', 1, '${role}')">Remove</button>
          </div>` : ''}
      </div>`;
  }).join('');
}

function removePlayerFromLine(teamName, category, lineNumber, position) {
  const team = teams.find(t => t.name === teamName);
  const line = category === 'Forward' ? team.lines.forwards[lineNumber - 1] : team.lines.defense[lineNumber - 1];

  // Remove player from line
  line[position] = null;

  // Update the team lines
  localStorage.setItem('teams', JSON.stringify(teams));
  displayTeamLines(); // Re-render the lines
}

function toggleInjuryStatus(playerId) {
  const player = teams.flatMap(t => t.players).find(p => p.id === playerId);
  if (player) {
    player.injured = !player.injured;
    localStorage.setItem('playersData', JSON.stringify(playersData));
    displayTeamLines();
  }
}

function toggleHealthyScratch(playerId) {
  const player = teams.flatMap(t => t.players).find(p => p.id === playerId);
  if (player) {
    player.healthyScratch = !player.healthyScratch;
    localStorage.setItem('playersData', JSON.stringify(playersData));
    displayTeamLines();
  }
}

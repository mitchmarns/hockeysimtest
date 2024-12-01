import { teams, loadTeamsFromLocalStorage, loadPlayers } from './team.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  loadTeamsFromLocalStorage();  // Ensure teams are loaded from LocalStorage
  displayUnassignedPlayers();   // Display unassigned players
  displayTeamLines();  // Display lines for each team
});

function displayUnassignedPlayers() {
  const unassignedPlayersContainer = document.getElementById('unassigned-players');
  const unassignedPlayers = getUnassignedPlayers();

  unassignedPlayersContainer.innerHTML = unassignedPlayers.map(player => {
    return `
      <div class="player-slot" draggable="true" data-player-id="${player.id}" id="player-${player.id}">
        <img src="${player.image}" alt="${player.name}" />
        <span>${player.name}</span>
      </div>
    `;
  }).join('');

  // Add drag events to unassigned players
  const playerElements = document.querySelectorAll('.player-slot');
  playerElements.forEach(player => {
    player.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('player-id', player.dataset.playerId);
    });
  });
}

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
    // Set up drop targets for each line slot
    const lineSlots = teamLinesDiv.querySelectorAll('.line div');
    lineSlots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
      });
      slot.addEventListener('drop', (e) => {
        const playerId = e.dataTransfer.getData('player-id');
        const player = getPlayerById(playerId);
        if (player && !player.team) {
          assignPlayerToLine(playerId, team, slot);
        }
      });
    });
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

function getUnassignedPlayers() {
  return teams.flatMap(team => team.players).filter(player => !player.team);
}

function getPlayerById(playerId) {
  return teams.flatMap(team => team.players).find(p => p.id === playerId);
}

function assignPlayerToLine(playerId, team, slot) {
  const position = slot.dataset.role;
  const category = slot.dataset.line.split(' ')[0]; // Forward or Defense

  let line;
  if (category === 'Forward') {
    line = team.lines.forwards.find(f => f[position] === null);
  } else {
    line = team.lines.defense.find(f => f[position] === null);
  }

  if (line) {
    line[position] = playerId;
    const player = getPlayerById(playerId);
    player.team = team.name;
    player.assigned = true;

    // Save updated teams and players to localStorage
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('playersData', JSON.stringify(playersData));

    // Re-render lines and player bank
    displayTeamLines();
    displayUnassignedPlayers();
  }
}

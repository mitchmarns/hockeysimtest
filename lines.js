import { teams } from './team.js';

let playersData = { players: [] };

export async function loadPlayers() {
  try {
    const savedPlayers = localStorage.getItem('playersData');
    
    if (savedPlayers) {
      const data = JSON.parse(savedPlayers);
      playersData.players = data.players || [];
      console.log('Players loaded from localStorage:', playersData);
    } else {
      const response = await fetch('./players.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      playersData.players = data.players || [];

      localStorage.setItem('playersData', JSON.stringify(playersData));
      console.log('Players loaded from players.json:', playersData);
    }

    // Ensure players have a lineAssigned property for the unassigned check
    playersData.players.forEach(player => {
      if (!player.hasOwnProperty('lineAssigned')) {
        player.lineAssigned = null; // Default to null if not set
      }
    });

    if (!Array.isArray(playersData.players)) {
      throw new Error('playersData.players is not an array');
    }
  } catch (error) {
    console.error('Error loading player data:', error);
  }
}

function loadTeamsFromLocalStorage() {
  try {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      const parsedTeams = JSON.parse(savedTeams);
      parsedTeams.forEach(team => {
        // Ensure each team has valid player references
        team.players.forEach(player => {
          const playerInData = getPlayerById(player.id);
          if (!playerInData) {
            console.warn(`Player with ID ${player.id} is missing from playersData.`);
            team.players = team.players.filter(p => p.id !== player.id);
          }
        });
      });
    }
  } catch (error) {
    console.error('Error loading teams:', error);
  }
}

export function getUnassignedPlayers() {
  return playersData.players.filter(player => !player.lineAssigned);
}

function displayUnassignedPlayers() {
  const unassignedPlayersContainer = document.getElementById('unassigned-players');
  const unassignedPlayers = getUnassignedPlayers();

  if (unassignedPlayers.length === 0) {
    unassignedPlayersContainer.innerHTML = '<p>All players are assigned to lines.</p>';
    return;
  }

  unassignedPlayersContainer.innerHTML = unassignedPlayers.map(player => `
    <div class="player-slot" data-player-id="${player.id}" id="player-${player.id}" draggable="true">
      <img src="${player.image}" alt="${player.name}" />
      <span>${player.name}</span>
      <div>
        <label>Injured</label>
        <input type="checkbox" class="injured-toggle" ${player.injured ? 'checked' : ''} onclick="toggleInjuryStatus(${player.id})">
      </div>
    </div>
  `).join('');

  attachDragEvents();
}

function attachDragEvents() {
  const playerElements = document.querySelectorAll('.player-slot');
  playerElements.forEach(player => {
    player.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('player-id', player.dataset.playerId);
    });
  });
}

function getPlayerById(playerId) {
  return playersData.players.find(player => player.id === parseInt(playerId, 10));
}

function assignPlayerToLine(playerId, team, slot) {
  const player = getPlayerById(playerId);
  if (!player) {
    console.error(`Player with ID ${playerId} not found.`);
    return;
  }

  const lineCategory = slot.dataset.line;
  const role = slot.dataset.role;

  let lineIndex;
  if (lineCategory.includes('Forward')) {
    lineIndex = parseInt(lineCategory.split(' ')[1], 10) - 1; // Extract line number
    if (!team.lines.forwards[lineIndex]) {
      console.error(`Line index ${lineIndex} is out of range for team ${team.name}`);
      return;
    }
    team.lines.forwards[lineIndex][role] = playerId;
  } else if (lineCategory.includes('Defense')) {
    lineIndex = parseInt(lineCategory.split(' ')[1], 10) - 1;
    if (!team.lines.defense[lineIndex]) {
      console.error(`Line index ${lineIndex} is out of range for team ${team.name}`);
      return;
    }
    team.lines.defense[lineIndex][role] = playerId;
  } else if (lineCategory === 'Goalie') {
    team.lines.goalies[role] = playerId;
  } else {
    console.error(`Unknown line category: ${lineCategory}`);
    return;
  }

  // Mark player as assigned
  player.lineAssigned = { team: team.name, lineCategory, role };

  // Update the local storage
  localStorage.setItem('teams', JSON.stringify(teams));
  localStorage.setItem('playersData', JSON.stringify(playersData));

  // Refresh the UI
  displayUnassignedPlayers();
  displayTeamLines();
}

function displayTeamLines() {
  const teamsContainer = document.getElementById('lines-container');

  teams.forEach(team => {
    const teamLinesDiv = document.getElementById(`${team.name}-lines`);
    teamLinesDiv.innerHTML = `
      <h4>Forwards</h4>
      ${generateLineSlots(team, 'Forward', 4, ['LW', 'C', 'RW'])}
      <h4>Defense</h4>
      ${generateLineSlots(team, 'Defense', 3, ['LD', 'RD'])}
      <h4>Goalies</h4>
      ${generateGoalieSlots(team)}
    `;

    const lineSlots = teamLinesDiv.querySelectorAll('.line div');
    lineSlots.forEach(slot => {
      slot.addEventListener('dragover', (e) => e.preventDefault());
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        const playerId = e.dataTransfer.getData('player-id');
        if (playerId) assignPlayerToLine(playerId, team, slot);
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
                <img src="${player.image}" alt="${player.name}" />
                <span>${player.name}</span>
                <button class="remove-btn" onclick="removePlayerFromLine('${team.name}', '${category}', ${i}, '${pos}')">Remove</button>
              ` : ''}
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
          <img src="${player.image}" alt="${player.name}" />
          <span>${player.name}</span>
          <button class="remove-btn" onclick="removePlayerFromLine('${team.name}', 'Goalie', 1, '${role}')">Remove</button>
        ` : ''}
      </div>`;
  }).join('');
}

function removePlayerFromLine(teamName, category, lineNumber, position) {
  const team = teams.find(t => t.name === teamName);
  const line = category === 'Forward' ? team.lines.forwards[lineNumber - 1] : team.lines.defense[lineNumber - 1];

  const playerId = line[position];
  const player = getPlayerById(playerId);

  if (player) player.lineAssigned = null;

  line[position] = null;
  localStorage.setItem('teams', JSON.stringify(teams));
  displayTeamLines();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  loadTeamsFromLocalStorage();
  displayUnassignedPlayers();
  displayTeamLines();
});

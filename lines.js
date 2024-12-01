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

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  loadTeamsFromLocalStorage();  // Ensure teams are loaded from LocalStorage
  displayUnassignedPlayers();   // Display unassigned players
  displayTeamLines();  // Display lines for each team
});

function loadTeamsFromLocalStorage() {
  try {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      const teams = JSON.parse(savedTeams);
      teams.forEach(team => {
        // Ensure each team has valid player references
        team.players.forEach(player => {
          const playerInData = getPlayerById(player.id);
          if (!playerInData) {
            console.warn(`Player with ID ${player.id} is missing from playersData.`);
            // Optionally, remove this player from the team or handle it differently
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
  // Ensure players that do not have a valid lineAssigned are returned as unassigned
  return playersData.players.filter(player => !player.lineAssigned);
}

function displayUnassignedPlayers() {
  const unassignedPlayersContainer = document.getElementById('unassigned-players');
  const unassignedPlayers = getUnassignedPlayers();

  if (unassignedPlayers.length === 0) {
    console.log('No players unassigned to lines.');
    unassignedPlayersContainer.innerHTML = '<p>All players are assigned to lines.</p>';
    return;
  }

  unassignedPlayersContainer.innerHTML = unassignedPlayers.map(player => {
    return `
      <div class="player-slot" data-player-id="${player.id}" id="player-${player.id}">
        <img src="${player.image}" alt="${player.name}" />
        <span>${player.name}</span>
        <div>
          <label>Injured</label>
          <input type="checkbox" class="injured-toggle" ${player.injured ? 'checked' : ''} onclick="toggleInjuryStatus(${player.id})">
        </div>
        <div>
          <label>Healthy Scratch</label>
          <input type="checkbox" class="healthy-scratch-toggle" ${player.healthyScratch ? 'checked' : ''} onclick="toggleHealthyScratch(${player.id})">
        </div>
      </div>
    `;
  }).join('');
  
// Re-attach drag events to unassigned players
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
        e.preventDefault();
        const playerId = e.dataTransfer.getData('player-id');
        
        if (playerId) {
          assignPlayerToLine(playerId, team, slot); // Call the assignment function
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

  // Find the player to remove
  const playerId = line[position];
  const player = getPlayerById(playerId);

  if (player) {
    player.lineAssigned = null; // Reset line assignment
    player.assigned = false;
  }

  // Remove player from line
  line[position] = null;

  // Save updated teams and players to localStorage
  localStorage.setItem('teams', JSON.stringify(teams));
  localStorage.setItem('playersData', JSON.stringify(playersData));

  // Re-render lines and unassigned players
  displayTeamLines();
  displayUnassignedPlayers();
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

function assignPlayerToLine(playerId, team, slot) {
  const position = slot.dataset.role;
  const category = slot.dataset.line.split(' ')[0]; // Forward, Defense, or Goalie

  let line;
  if (category === 'Forward') {
    line = team.lines.forwards; // Get the forwards line
  } else if (category === 'Defense') {
    line = team.lines.defense; // Get the defense line
  } else if (category === 'Goalie') {
    line = team.lines.goalies; // Goalie line is a direct object
  }

  // Check if the player exists in playersData
  const player = getPlayerById(playerId);
  if (player && line) {
    // Assign player to line
    line.forEach((l, index) => {
      if (l[position] === null) {
        line[index][position] = playerId; // Assign player to this slot
      }
    });


    // Update the player's assignment status
    player.lineAssigned = { team: team.name, category, line: position }; // Store assignment details
    player.assigned = true;

    // Remove the player from the unassigned players list
    const unassignedPlayers = getUnassignedPlayers();
    const index = unassignedPlayers.findIndex(p => p.id === playerId);
    if (index > -1) {
      unassignedPlayers.splice(index, 1);
    }

    // Save updated teams and players to localStorage
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('playersData', JSON.stringify(playersData));

    // Re-render lines and player bank
    displayTeamLines();
    displayUnassignedPlayers();

    // Dynamically update the dropped slot with the player's information
    slot.innerHTML = `
      <img src="${player.image}" alt="${player.name}" />
      <span>${player.name}</span>
      <button class="remove-btn" onclick="removePlayerFromLine('${team.name}', '${category}', ${lineIndex}, '${position}')">Remove</button>
      <div>
        <label>Injured</label>
        <input type="checkbox" class="injured-toggle" ${player.injured ? 'checked' : ''} onclick="toggleInjuryStatus(${player.id})">
      </div>
      <div>
        <label>Healthy Scratch</label>
        <input type="checkbox" class="healthy-scratch-toggle" ${player.healthyScratch ? 'checked' : ''} onclick="toggleHealthyScratch(${player.id})">
      </div>
    `;
  } else {
    console.error('Player or line not found!');
  }}



function updateSlotWithPlayer(slot, player) {
  // Find the specific slot where the player was dropped
  const playerSlot = slot.querySelector('.player-slot');

  // If the slot does not already contain the player, insert the player
  if (!playerSlot) {
    const playerElement = document.createElement('div');
    playerElement.classList.add('player-slot');
    playerElement.setAttribute('data-player-id', player.id);

    playerElement.innerHTML = `
      <img src="${player.image}" alt="${player.name}" />
      <span>${player.name}</span>
      <button class="remove-btn" onclick="removePlayerFromLine('${player.lineAssigned.team}', '${player.lineAssigned.category}', ${player.lineAssigned.line}, '${slot.dataset.role}')">Remove</button>
      <div>
        <label>Injured</label>
        <input type="checkbox" class="injured-toggle" ${player.injured ? 'checked' : ''} onclick="toggleInjuryStatus(${player.id})">
      </div>
      <div>
        <label>Healthy Scratch</label>
        <input type="checkbox" class="healthy-scratch-toggle" ${player.healthyScratch ? 'checked' : ''} onclick="toggleHealthyScratch(${player.id})">
      </div>
    `;
    
    slot.appendChild(playerElement); // Add the player to the slot
  }
}

function getPlayerById(playerId) {
  // Check if player exists in the playersData array
  return playersData.players.find(player => player.id === parseInt(playerId));
}

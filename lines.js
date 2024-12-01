import { loadPlayers, loadTeamsFromLocalStorage, teams } from './team.js';

let playersData = { players: [] };

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  loadTeamsFromLocalStorage();
  initializeTeamLines();
  displayAvailablePlayers();
  displayTeamLines();
  enableDragAndDrop();
});

// lines structure loaded
function initializeTeamLines() {
  teams.forEach(team => {
    if (!team.lines) {
      team.lines = {
        forwards: Array(4).fill(null).map(() => ({ LW: null, C: null, RW: null })),
        defense: Array(3).fill(null).map(() => ({ LD: null, RD: null })),
        goalies: { Starter: null, Backup: null },
      };
    }
  });
}

// display available players
function displayAvailablePlayers() {
  const container = document.getElementById('available-players-list');
  container.innerHTML = '';

    teams.forEach(team => {
    team.players.forEach(player => {
      if (!player.team || !player.line) { 
        const playerBox = document.createElement('div');
        playerBox.className = `player ${player.injured ? 'injured' : ''} ${player.healthyScratch ? 'scratch' : ''}`;
        
        // Disable dragging for injured or scratched players
        if (player.injured || player.healthyScratch) {
          playerBox.setAttribute('draggable', 'false');
        } else {
          playerBox.setAttribute('draggable', 'true');
        }
        
        playerBox.dataset.id = player.id;
        playerBox.dataset.team = team.name;
        playerBox.innerHTML = `
          <img src="${player.image}" alt="${player.name}" />
          <span>${player.name} - ${player.team} ${player.position}</span>
          <div class="player-actions">
            <label class="toggle">
            <input type="checkbox" class="injured-toggle" data-id="${player.id}" ${player.injured ? 'checked' : ''}>
              <span class="slider"></span>
              <span class="text-label">Injured</span>
            </label>
            <label class="toggle">
              <input type="checkbox" class="scratch-toggle" data-id="${player.id}" ${player.healthyScratch ? 'checked' : ''}>
              <span class="slider"></span>
              <span class="text-label">Scratch</span>
            </label>
          </div>
        `;
        container.appendChild(playerBox);
      }
    });
  });
}

// display team lines and populate slots with assigned players
function displayTeamLines() {
  teams.forEach(team => {
    const teamLines = document.getElementById(`${team.name}-lines`);

    teamLines.innerHTML = ''; 
    teamLines.innerHTML += `
      <div>
        <h4>Forward Lines</h4>
        ${generateLineSlots(team, 'Forward', 4, ['LW', 'C', 'RW'])}
      </div>
      <div>
        <h4>Defense Lines</h4>
        ${generateLineSlots(team, 'Defense', 3, ['LD', 'RD'])}
      </div>
      <div>
        <h4>Goalies</h4>
        <div class="lines">
          ${['Starter', 'Backup'].map(role => {
            const playerId = team.lines.goalies[role];
            const player = players.find(p => p.id === playerId);
            return `
              <div class="player-slot" data-team="${team.name}" data-role="${role}">
                ${player ? `
                  <div class="player-slot" data-player-id="${player.id}">
                    <img src="${player.image}" alt="${player.name}" />
                    <span>${player.name}</span>
                    <button class="remove-btn">Remove</button>
                  </div>
                  ` : ''}
              </div>
              `;
          }).join('')}
        </div>
      </div>
      `;
  });
}

// generate slots
function generateLineSlots(team, category, linesCount, positions) {
  let html = '';
  for (let i = 1; i <= linesCount; i++) {
  const line = category === 'Forward' ? team.lines.forwards[i - 1] : team.lines.defense[i - 1];
    html += `
      <div class="line">
        ${positions.map(pos => {
          const playerId = line[pos];
          const player = players.find(p => p.id === playerId);
          return `
            <div class="player-slot" data-team="${team.name}" data-line="${category} Line ${i}" data-role="${pos}">
              ${player ? `
                <div class="player-slot" data-player-id="${player.id}">
                  <img src="${player.image}" alt="${player.name}" />
                  <span>${player.name}</span>
                  <button class="remove-btn">Remove</button>
                </div>` : ''}
            </div>`;
        }).join('')}
      </div>`;
  }
  return html;
}

// remove button
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('remove-btn')) {
    const playerElement = e.target.closest('.player-slot');
    if (!playerElement) return;

    const playerId = parseInt(playerElement.dataset.playerId);
    const player = teams.flatMap(t => t.players).find(p => p.id === playerId);

     if (player) {
         console.error(`Player with ID ${playerId} not found.`);
      return; // Exit if the player is not found
    }

    // Remove player from the line
    const { teamName, line, role } = player.line || {};
    const team = teams.find((t) => t.name === teamName);

    if (team && line) {
      if (line.includes('Forward')) {
        const lineIndex = parseInt(line.split(' ')[2]) - 1;
        if (team.lines.forwards[lineIndex]) {
          team.lines.forwards[lineIndex][role] = null;
        }
      } else if (line.includes('Defense')) {
        const lineIndex = parseInt(line.split(' ')[2]) - 1;
        if (team.lines.defense[lineIndex]) {
          team.lines.defense[lineIndex][role] = null;
        }
      } else if (line === 'Goalie Line') {
        if (team.lines.goalies[role] !== undefined) {
          team.lines.goalies[role] = null;
        }
      }
    }

        // Remove player from the team assignment
          player.line = null;
          player.assigned = false;
          
          // Move the player back to available players
          displayAvailablePlayers();
          displayTeamLines();

          // Update localStorage
          localStorage.setItem('teams', JSON.stringify(teams));
    }
});
        
// toggle button
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('injured-toggle')) {
    const playerId = parseInt(e.target.dataset.id);
    const player = teams.flatMap(t => t.players).find(p => p.id === playerId);

    if (player) {
      player.injured = e.target.checked;
      if (player.injured) {
        player.healthyScratch = false; // Ensure it's not both injured and scratched
        player.line = null; // Remove the player from any assigned line
      }

      // Update localStorage and re-render
      localStorage.setItem('teams', JSON.stringify(teams));
      displayAvailablePlayers();
      displayTeamLines();
    }
  } else if (e.target.classList.contains('scratch-toggle')) {
    const playerId = parseInt(e.target.dataset.id);
    const player = teams.flatMap((t) => t.players).find((p) => p.id === playerId);

    if (player) {
      player.healthyScratch = e.target.checked;
      if (player.healthyScratch) {
        player.injured = false; // Ensure it's not both scratched and injured
        player.line = null; // Remove the player from any assigned line
      }

      // Update localStorage and re-render
      localStorage.setItem('teams', JSON.stringify(teams));
      displayAvailablePlayers();
      displayTeamLines();
    }
  }
});


// drag start
document.addEventListener('dragstart', e => {
  const playerBox = e.target.closest('.player');
  if (playerBox) {
    const playerId = playerBox.dataset.id;
    const player = teams.flatMap((t) => t.players).find((p) => p.id == playerId);

    // Check if the player is injured or scratched
    if (player && (player.injured || player.healthyScratch)) {
      e.preventDefault(); // Prevent dragging the player
      return; // Exit early so that the player isn't dragged
    }

    e.dataTransfer.setData('playerId', playerId);
    e.dataTransfer.setData('playerTeam', playerBox.dataset.team);
  }
});

// drag and drop functionality
function enableDragAndDrop() {
  const container = document.getElementById('lines-container');
  if (!container) {
    console.error('Container not found in the DOM');
    return;
  }

  // Handle dragover
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const slot = e.target.closest('.player-slot');
    if (!slot) return;

    const slotTeam = slot.dataset.team;
    const draggedTeam = e.dataTransfer.getData('playerTeam');
    if (slotTeam === draggedTeam) {
      slot.classList.add('dragover');
    }
  });

  // Handle dragleave
  container.addEventListener('dragleave', (e) => {
    const slot = e.target.closest('.player-slot');
    if (slot) slot.classList.remove('dragover');
  });

  // Handle drop
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    const slot = e.target.closest('.player-slot');
    if (!slot) return;

    slot.classList.remove('dragover');

    const playerId = parseInt(e.dataTransfer.getData('playerId'));
    if (isNaN(playerId)) {
      console.error('Invalid playerId');
      return;
    }

    const player = teams.flatMap((t) => t.players).find((p) => p.id === playerId);
    if (!player) {
      console.error('Player not found');
      return;
    }

    // Prevent drop if player is injured or scratched
    if (player.injured || player.healthyScratch) {
      alert('This player cannot be placed on lines because they are injured or scratched.');
      return;
    }

    const teamName = slot.dataset.team;
    const role = slot.dataset.role;
    const line = slot.dataset.line;
    const team = teams.find((t) => t.name === teamName);

    if (!team) {
      console.error(`Team "${teamName}" not found.`);
      return;
    }

    if (line) {
      const lineParts = line.split(' ');
      let lineNumber = parseInt(lineParts[2]) - 1;

      if (line.includes('Forward')) {
        team.lines.forwards[lineNumber][role] = player.id;
      } else if (line.includes('Defense')) {
        team.lines.defense[lineNumber][role] = player.id;
      }
    } else if (role === 'Starter' || role === 'Backup') {
      team.lines.goalies[role] = player.id;
    }
});
    // Update player's status
    player.line = { teamName, role, line: line || 'Goalie Line' };
    player.assigned = true;
    player.team = teamName;

    // Remove player from available players list
    displayAvailablePlayers();

    // Update slot UI
    const playerSlot = document.createElement('div');
    playerSlot.classList.add('player-slot');
    playerSlot.innerHTML = `
      <img src="${player.image}" alt="${player.name}" />
      <span>${player.name}</span>
      <button class="remove-btn">Remove</button>
    `;
    slot.innerHTML = '';
    slot.appendChild(playerSlot);

    // Handle remove button
    playerSlot.querySelector('.remove-btn').addEventListener('click', () => {
      slot.innerHTML = ''; // Clear the slot
      player.line = null; // Update player status
      player.assigned = false;
      player.team = null;
      displayAvailablePlayers(); // Refresh available players
      localStorage.setItem('teams', JSON.stringify(teams)); // Save changes
    });
  
          // Save to localStorage and refresh display
          localStorage.setItem('teams', JSON.stringify(teams));
  }

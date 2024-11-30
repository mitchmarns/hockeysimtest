import { loadPlayers, loadTeamsFromLocalStorage, teams } from './team.js';

let players = [];

async function fetchPlayers() {
  try {
    const response = await fetch('players.json');
    players = await response.json();
  } catch (error) {
    console.error('Error loading players:', error);
  }
}

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
    if (!teamLines) return;

    teamLines.innerHTML = `
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
                  </div>` : ''}
              </div>`;
          }).join('')}
        </div>
      </div>`;
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

// remove button clicks
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('remove-btn')) {
    const playerSlot = e.target.closest('.player-slot');
    const playerId = parseInt(playerSlot.dataset.playerId, 10);

    const player = players.find(p => p.id === playerId);
    if (!player) return;

        // Remove player from the team assignment
          player.line = null;
          player.assigned = false;
          

          localStorage.setItem('teams', JSON.stringify(teams));
          displayAvailablePlayers();
          displayTeamLines();
  }
});
        
// Toggle injured and scratch statuses
document.addEventListener('change', e => {
  const toggleType = e.target.classList.contains('injured-toggle') ? 'injured' : 'healthyScratch';
  const playerId = parseInt(e.target.dataset.id, 10);
  const player = players.find(p => p.id === playerId);

  if (!player) return;

  player[toggleType] = e.target.checked;
  if (toggleType === 'injured' && player.injured) player.healthyScratch = false;
  if (toggleType === 'healthyScratch' && player.healthyScratch) player.injured = false;

  player.line = null; // Clear assignment if toggled
  localStorage.setItem('teams', JSON.stringify(teams));
  displayAvailablePlayers();
  displayTeamLines();
});


// Drag and drop functionality
function enableDragAndDrop() {
  const container = document.getElementById('lines-container');

  container.addEventListener('dragstart', e => {
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
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    const slot = e.target.closest('.player-slot');
    if (slot) slot.classList.add('dragover');
  });

  container.addEventListener('dragleave', e => {
    const slot = e.target.closest('.player-slot');
    if (slot) slot.classList.remove('dragover');
  });

  container.addEventListener('drop', e => {
    e.preventDefault();
    const slot = e.target.closest('.player-slot');
    if (!slot) return;

    const playerId = parseInt(e.dataTransfer.getData('playerId'), 10);
    const player = players.find(p => p.id === playerId);
    const teamName = slot.dataset.team;
    const role = slot.dataset.role;

    const team = teams.find(t => t.name === teamName);
    if (!player || !team) return;

    if (role === 'Starter' || role === 'Backup') {
      team.lines.goalies[role] = playerId;
    } else {
      const [category, line] = slot.dataset.line.split(' Line ');
      const lineIndex = parseInt(line, 10) - 1;
      team.lines[category.toLowerCase()][lineIndex][role] = playerId;
    }

    player.line = { teamName, role };
    player.team = teamName;

    localStorage.setItem('teams', JSON.stringify(teams));
    displayAvailablePlayers();
    displayTeamLines();
  });
  });
}

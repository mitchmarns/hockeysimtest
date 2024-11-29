import { loadPlayers, loadTeamsFromLocalStorage, teams } from './team.js';

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
        playerBox.className = 'player';
        playerBox.setAttribute('draggable', 'true');
        playerBox.dataset.id = player.id;
        playerBox.dataset.team = team.name;
        playerBox.innerHTML = `
          <img src="${player.image}" alt="${player.name}" />
          <span>${player.name} - ${player.team} ${player.position}</span>
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

    // Clear existing content
    teamLines.innerHTML = '';

    // Add Forward Lines
    const forwardLinesContainer = document.createElement('div');
    forwardLinesContainer.innerHTML = `
      <h4>Forward Lines</h4>
      ${generateLineSlots(team, 'Forward', 4, ['LW', 'C', 'RW'])}
    `;
    teamLines.appendChild(forwardLinesContainer);

    // Add Defense Lines
    const defenseLinesContainer = document.createElement('div');
    defenseLinesContainer.innerHTML = `
      <h4>Defense Lines</h4>
      ${generateLineSlots(team, 'Defense', 3, ['LD', 'RD'])}
    `;
    teamLines.appendChild(defenseLinesContainer);

// Add Goalie Line
    const goalieLineContainer = document.createElement('div');
    goalieLineContainer.innerHTML = `
      <h4>Goalies</h4>
      <div class="lines">
        ${['Starter', 'Backup'].map(role => {
          const assignedPlayerId = team.lines.goalies[role];
          const assignedPlayer = assignedPlayerId
            ? team.players.find(p => p.id === assignedPlayerId)
            : null;

          return `
            <div class="player-slot" data-team="${team.name}" data-role="${role}">
              ${assignedPlayer ? `
                <img src="${assignedPlayer.image}" alt="${assignedPlayer.name}" /><br>
                <span>${assignedPlayer.name}</span>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
    teamLines.appendChild(goalieLineContainer);
  });
}

// generate slots
function generateLineSlots(team, category, linesCount, positions) {
  let html = '';
  for (let i = 1; i <= linesCount; i++) {
    html += `<div class="line">
      ${positions.map(pos => {
        const lineNumber = i - 1; // Convert to 0-based index
        const assignedPlayerId =
          category === 'Forward' ? team.lines.forwards[lineNumber][pos] :
          category === 'Defense' ? team.lines.defense[lineNumber][pos] :
          null;

        const assignedPlayer = assignedPlayerId
          ? team.players.find(p => p.id === assignedPlayerId)
          : null;

        return `
          <div class="player-slot" data-team="${team.name}" data-line="${category} Line ${i}" data-role="${pos}">
            ${assignedPlayer ? `
              <img src="${assignedPlayer.image}" alt="${assignedPlayer.name}" /><br>
              <span>${assignedPlayer.name}</span>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>`;
  }
  return html;
}

// drag start
document.addEventListener('dragstart', e => {
  const playerBox = e.target.closest('.player');
  if (playerBox) {
    e.dataTransfer.setData('playerId', playerBox.dataset.id);
    e.dataTransfer.setData('playerTeam', playerBox.dataset.team);
  }
});

// drag and drop functionality
function enableDragAndDrop() {
  const slotElements = document.querySelectorAll('.player-slot');

  // drag and drop
  slotElements.forEach(slot => {
    slot.addEventListener('dragover', e => {
      e.preventDefault();
      const slotTeam = slot.dataset.team;
      const draggedTeam = e.dataTransfer.getData('playerTeam');

      // Allow drop only if the team matches
      if (slotTeam === draggedTeam) {
        slot.classList.add('dragover');
      }
    });

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('dragover');
    });

    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('dragover');

      const playerId = parseInt(e.dataTransfer.getData('playerId'));
      const player = teams.flatMap(t => t.players).find(p => p.id === playerId);

      if (player) {
        const teamName = slot.dataset.team;
        const role = slot.dataset.role;
        const line = slot.dataset.line;

        const team = teams.find(t => t.name === teamName);

      if (!team) {
        console.error(`Team "${teamName}" not found.`);
        return;
      }
        
      if (line) {
        // forward and defense lines
        const lineParts = line.split(' '); 
        let lineNumber = NaN;
        
        if (lineParts.length === 3 && !isNaN(parseInt(lineParts[2]))) {
          lineNumber = parseInt(lineParts[2]) - 1; // Convert to 0-based index
        }

        if (isNaN(lineNumber)) {
          console.error(`Invalid line number format for line: "${line}"`);
          return; // Exit early if the line number is invalid
        }

        if (line.includes('Forward')) {
          if (team.lines.forwards[lineNumber]) {
            team.lines.forwards[lineNumber][role] = player.id; 
          } else {
            console.error(`Line number ${lineNumber} does not exist in team ${teamName}`);
            }
          } else if (line.includes('Defense')) {
            if (team.lines.defense[lineNumber]) {
              team.lines.defense[lineNumber][role] = player.id; 
            } else {
              console.error(`Line number ${lineNumber} does not exist in team ${teamName}`);
            }
          }
        } else if (role === 'Starter' || role === 'Backup') {
            // goalie lines
            if (team.lines.goalies[role] !== undefined) {
              team.lines.goalies[role] = player.id;
            } else {
              console.error(`Invalid goalie role: "${role}"`);
              return;
            }
          }

        // Clear previous slot
          if (player.line) {
            const previousSlot = document.querySelector(`[data-player-id="${player.id}"]`);
            if (previousSlot) {
              previousSlot.innerHTML = '';  // Clear previous assignment
            }
          }

        player.line = { teamName, role, line: line || 'Goalie Line' }; 
        player.assigned = true;

        // Update slot UI
        slot.innerHTML = `
          <div class="player">
            <img src="${player.image}" alt="${player.name}" />
            <span>${player.name}</span>
          </div>
        `;
      }

          // Save to localStorage and refresh display
          localStorage.setItem('teams', JSON.stringify(teams));
          
          displayAvailablePlayers();
          displayTeamLines();
        });
    });
}

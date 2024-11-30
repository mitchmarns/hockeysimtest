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
        playerBox.className = `player ${player.injured ? 'injured' : ''} ${player.healthyScratch ? 'scratch' : ''}`;
        playerBox.setAttribute('draggable', 'true');
        playerBox.dataset.id = player.id;
        playerBox.dataset.team = team.name;
        playerBox.innerHTML = `
          <img src="${player.image}" alt="${player.name}" />
          <span>${player.name} - ${player.team} ${player.position}</span>
          <div class="player-actions">
            <label class="toggle">
              <input type="checkbox" class="injured-toggle" data-id="${player.id}" ${player.injured ? 'checked' : ''}>
              <span class="slider"></span> Injured
            </label>
            <label class="toggle">
              <input type="checkbox" class="scratch-toggle" data-id="${player.id}" ${player.healthyScratch ? 'checked' : ''}>
              <span class="slider"></span> Scratch
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
            <div class="player-slot" data-player-id="${assignedPlayer.id}">
              <img src="${assignedPlayer.image}" alt="${assignedPlayer.name}" /><br>
              <span>${assignedPlayer.name}</span><br>
              <button class="remove-btn">Remove</button>
            </div>
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
            <div class="player-slot" data-player-id="${assignedPlayer.id}">
              <img src="${assignedPlayer.image}" alt="${assignedPlayer.name}" /><br>
              <span>${assignedPlayer.name}</span><br>
              <button class="remove-btn">Remove</button>
            </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>`;
  }
  return html;
}

// remove button
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('injured-toggle')) {
    const playerElement = e.target.closest('.player');
    const playerId = parseInt(playerElement.dataset.id);
    const player = teams.flatMap(t => t.players).find(p => p.id === playerId);

  if (e.target && e.target.classList.contains('remove-btn')) {
    const playerElement = e.target.closest('.player-slot');
    if (!playerElement) return;
    
    const playerId = parseInt(playerElement.dataset.playerId);
    const player = teams.flatMap(t => t.players).find(p => p.id === playerId);

    if (player) {
      // Find the team the player belongs to
      const team = teams.find(t => t.name === player.team);

      if (team) {
        // Remove the player from the line (clear the assigned position)
        if (player.line) {
          const { line, role } = player.line;
          
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
          } else if (line.includes('Goalie')) {
            if (team.lines.goalies[role] !== undefined) {
              team.lines.goalies[role] = null;
            }
          }
    // toggle button
          document.addEventListener('change', (e) => {
  if (e.target.classList.contains('injured-toggle')) {
    const playerId = parseInt(e.target.dataset.id);
    const player = teams.flatMap(t => t.players).find(p => p.id === playerId);

    if (player) {
      player.injured = e.target.checked;
      player.healthyScratch = false; // Ensure it’s not both injured and a scratch
      displayAvailablePlayers();
      displayTeamLines();
      localStorage.setItem('teams', JSON.stringify(teams));
    }
  } else if (e.target.classList.contains('scratch-toggle')) {
    const playerId = parseInt(e.target.dataset.id);
    const player = teams.flatMap(t => t.players).find(p => p.id === playerId);

    if (player) {
      player.healthyScratch = e.target.checked;
      player.injured = false; // Ensure it’s not both a scratch and injured
      displayAvailablePlayers();
      displayTeamLines();
      localStorage.setItem('teams', JSON.stringify(teams));
    }
  }
});

          // Remove player from the team assignment
          player.line = null;
          player.assigned = false;
          
          // Move the player back to available players
          displayAvailablePlayers();
          displayTeamLines();

          // Update localStorage
          localStorage.setItem('teams', JSON.stringify(teams));
        }
      }
    }
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
  const container = document.getElementById('lines-container');

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
    const player = teams.flatMap((t) => t.players).find((p) => p.id === playerId);

    if (player) {
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
        let lineNumber = NaN;

        if (lineParts.length === 3 && !isNaN(parseInt(lineParts[2]))) {
          lineNumber = parseInt(lineParts[2]) - 1; // Convert to 0-based index
        }

        if (isNaN(lineNumber)) {
          console.error(`Invalid line number format for line: "${line}"`);
          return;
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
        if (team.lines.goalies[role] !== undefined) {
          team.lines.goalies[role] = player.id;
        } else {
          console.error(`Invalid goalie role: "${role}"`);
          return;
        }
      }

      // Update player's status
      player.line = { teamName, role, line: line || 'Goalie Line' };
      player.assigned = true;
      player.team = teamName;

      // Remove player from available players list
      displayAvailablePlayers();

      // Update slot UI
      slot.innerHTML = `
        <div class="player-slot">
          <img src="${player.image}" alt="${player.name}" />
          <span>${player.name}</span>
          <button class="remove-btn">Remove</button>
          <button class="injured-toggle">${assignedPlayer.injured ? 'Mark Healthy' : 'Mark Injured'}</button>
        <button class="scratch-toggle">${assignedPlayer.healthyScratch ? 'Remove Scratch' : 'Mark Scratch'}</button>
        </div>
      `;
      

          // Save to localStorage and refresh display
          localStorage.setItem('teams', JSON.stringify(teams));
        }
    });
}
    });

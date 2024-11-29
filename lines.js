import { loadPlayers, loadTeamsFromLocalStorage, teams } from './team.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  loadTeamsFromLocalStorage();
  displayAvailablePlayers();
  displayTeamLines();
  enableDragAndDrop();
});

function displayAvailablePlayers() {
  const container = document.getElementById('available-players-list');
  container.innerHTML = '';

  // display unassigned players
  teams.forEach(team => {
    team.players.forEach(player => {
      if (!player.line) { 
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
        <div class="player-slot" data-team="${team.name}" data-role="Starter"></div>
        <div class="player-slot" data-team="${team.name}" data-role="Backup"></div>
      </div>
    `;
    teamLines.appendChild(goalieLineContainer);
  });
}

function generateLineSlots(team, category, linesCount, positions) {
  let html = '';
  for (let i = 1; i <= linesCount; i++) {
    html += `<div class="line">
      ${positions.map(pos => `
        <div class="player-slot" data-team="${team.name}" data-line="${category} Line ${i}" data-role="${pos}"></div>
      `).join('')}
    </div>`;
  }
  return html;
}

function enableDragAndDrop() {
  const slotElements = document.querySelectorAll('.player-slot');

  // Drag and drop functionality for each player
  document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('player')) {
      e.dataTransfer.setData('playerId', e.target.dataset.id);
      e.dataTransfer.setData('playerTeam', e.target.dataset.team); // Store the team name
    }
  });

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

      const playerId = e.dataTransfer.getData('playerId');
      const player = teams.flatMap(t => t.players).find(p => p.id === parseInt(playerId));

      if (player) {
        const teamName = slot.dataset.team;
        const role = slot.dataset.role;
        const line = slot.dataset.line;

        // Ensure the drop matches the team
        if (player.team === teamName) {
          // Assign the player to the line
          player.line = { teamName, role, line };

          // Update the `lines` structure in `teams`
          const team = teams.find(t => t.name === teamName);
          if (team) {
            if (line.includes('Forward')) {
              const lineNumber = parseInt(line.split(' ')[1]) - 1; // Get line index (0-based)
              team.lines.forwards[lineNumber][role] = player.id; // Assign player to role
            } else if (line.includes('Defense')) {
              const lineNumber = parseInt(line.split(' ')[1]) - 1;
              team.lines.defense[lineNumber][role] = player.id;
            } else if (role === 'Starter' || role === 'Backup') {
              team.lines.goalies[role] = player.id;
            }
          }

          // Find the corresponding slot and add the player
          slot.innerHTML = `
            <img src="${player.image}" alt="${player.name}" />
            <span>${player.name}</span>
          `;
          
          slot.setAttribute('data-player-id', player.id);

          // Save to localStorage and refresh display
          localStorage.setItem('teams', JSON.stringify(teams));
          
          displayAvailablePlayers();
          displayTeamLines();
        } else {
          alert('This player does not belong to the selected team.');
        }
      }
    });
  });
}

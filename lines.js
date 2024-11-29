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

  teams.forEach(team => {
    team.players.forEach(player => {
      if (!player.line) { // Player isn't assigned to a line
        const playerBox = document.createElement('div');
        playerBox.className = 'player';
        playerBox.setAttribute('draggable', 'true');
        playerBox.dataset.id = player.id;
        playerBox.innerHTML = `
          <img src="${player.image}" alt="${player.name}" />
          <span>${player.name} - ${player.position}</span>
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
  // Handle player drag-start
  document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('player')) {
      e.dataTransfer.setData('playerId', e.target.dataset.id);
    }
  });

  // Handle drag-over and drop on player slots
  document.addEventListener('dragover', e => {
    if (e.target.classList.contains('player-slot')) {
      e.preventDefault();
    }
  });

  document.addEventListener('drop', e => {
    if (e.target.classList.contains('player-slot')) {
      e.preventDefault();

      const playerId = e.dataTransfer.getData('playerId');
      const player = teams.flatMap(t => t.players).find(p => p.id === parseInt(playerId));

      if (player) {
        const teamName = e.target.dataset.team;
        const role = e.target.dataset.role;
        const line = e.target.dataset.line;

        // Assign player to the line
        player.line = { teamName, role, line };

        // Save updated teams to localStorage and refresh UI
        localStorage.setItem('teams', JSON.stringify(teams));
        displayAvailablePlayers();
        displayTeamLines();
      }
    }
  });
}

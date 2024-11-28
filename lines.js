// lines.js
import { loadPlayers, getAvailablePlayers, assignPlayerToTeam, teams } from './team.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  displayTeams();
  setUpEventListeners();
});

function displayTeams() {
  const container = document.getElementById('teams-container');
  container.innerHTML = ''; // Clear container before displaying

  teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team');
    teamDiv.id = `team-${team.name}`;

    const teamHeading = document.createElement('h2');
    teamHeading.innerText = team.name;
    teamDiv.appendChild(teamHeading);

    const lineContainer = document.createElement('div');
    lineContainer.classList.add('lines');
    ['First Line', 'Second Line', 'Third Line', 'Fourth Line'].forEach(line => {
      const lineDiv = createLineDiv(line, team.players);
      lineContainer.appendChild(lineDiv);
    });

    teamDiv.appendChild(lineContainer);
    container.appendChild(teamDiv);
  });
}

function createLineDiv(lineName, players) {
  const lineDiv = document.createElement('div');
  lineDiv.classList.add('line');
  lineDiv.id = `line-${lineName}`;

  const lineTitle = document.createElement('h3');
  lineTitle.innerText = lineName;
  lineDiv.appendChild(lineTitle);

  const lineList = document.createElement('div');
  lineList.classList.add('line-list');
  lineDiv.appendChild(lineList);

  // Add draggable player elements to the line
  players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.setAttribute('draggable', true);
    playerDiv.dataset.playerId = player.id;
    playerDiv.dataset.teamName = player.team;
    playerDiv.dataset.lineName = lineName;

    playerDiv.innerText = `${player.name} - ${player.position}`;
    lineList.appendChild(playerDiv);
  });

  return lineDiv;
}

function setUpEventListeners() {
  const lines = document.querySelectorAll('.line-list');
  lines.forEach(line => {
    line.addEventListener('dragover', (e) => {
      e.preventDefault(); // Allow drop
    });

    line.addEventListener('drop', (e) => {
      const draggedPlayer = document.querySelector('.dragging');
      if (draggedPlayer) {
        const playerId = draggedPlayer.dataset.playerId;
        const newLine = e.target.closest('.line').id.replace('line-', '');

        assignPlayerToLine(playerId, newLine);
        displayTeams(); // Re-render teams after assigning player to a line
      }
    });
  });

  const players = document.querySelectorAll('.player');
  players.forEach(player => {
    player.addEventListener('dragstart', () => {
      player.classList.add('dragging');
    });

    player.addEventListener('dragend', () => {
      player.classList.remove('dragging');
    });
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', resetLineAssignments);

  // Save button
  document.getElementById('save-btn').addEventListener('click', saveLineAssignments);
}

function assignPlayerToLine(playerId, lineName) {
  // Find the player and update the line assignment in the team
  const player = playersData.players.find(p => p.id === playerId);
  if (player) {
    player.line = lineName; // Store line assignment in player object

    // Find the team this player belongs to
    const team = teams.find(t => t.name === player.team);
    if (team) {
      // Re-sort the team's players based on their line assignment (optional)
      team.players.sort((a, b) => (a.line > b.line ? 1 : -1));
    }
  }
}

function saveLineAssignments() {
  // Save the current state of teams to localStorage
  localStorage.setItem('teams', JSON.stringify(teams));
  console.log('Line assignments saved');
}

function resetLineAssignments() {
  // Reset all line assignments
  playersData.players.forEach(player => {
    delete player.line; // Remove line assignment
  });
  displayTeams(); // Re-render teams with no line assignments
}

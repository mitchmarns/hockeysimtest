import { loadPlayers, getAvailablePlayers, assignPlayerToTeam, loadTeamsFromLocalStorage } from './team.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  loadTeamsFromLocalStorage();
  displayAvailablePlayers();
  displayTeams();

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('assign-btn')) {
      const playerId = parseInt(e.target.dataset.id);
      const teamName = e.target.dataset.team;
      assignPlayerToTeam(playerId, teamName);
      displayAvailablePlayers();
      displayTeams();
    }
  });
});

function displayAvailablePlayers() {
  const container = document.getElementById('available-players');
  container.innerHTML = '';
  const players = getAvailablePlayers();
  players.forEach(player => {
    container.innerHTML += `
      <div class="player">
        ${player.name} - ${player.position}
        <button class="assign-btn" data-id="${player.id}" data-team="Rangers">Rangers</button>
        <button class="assign-btn" data-id="${player.id}" data-team="Devils">Devils</button>
        <button class="assign-btn" data-id="${player.id}" data-team="Islanders">Islanders</button>
        <button class="assign-btn" data-id="${player.id}" data-team="Sabres">Sabres</button>
      </div>`;
  });
}

function displayTeams() {
  const teamsContainer = document.getElementById('teams-container');
  teamsContainer.innerHTML = '';  // Clear existing content

  teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team');
    
    const teamName = document.createElement('h3');
    teamName.textContent = team.name;
    teamDiv.appendChild(teamName);
    
    team.players.forEach(player => {
      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player');
      playerDiv.innerHTML = `
        <span>${player.name} - ${player.position}</span>
      `;
      teamDiv.appendChild(playerDiv);
    });
    
    teamsContainer.appendChild(teamDiv);
  });
}

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

// Function to display teams and their players
function displayTeams() {
  const teamsContainer = document.getElementById('teams');

  if (!Array.isArray(teams)) {
    console.error('Teams is not an array:', teams);
    return;
  }
  
  // Iterate over the teams
  teams.forEach(team => {
    const teamDiv = document.getElementById(team.name); // Get the div for each team
    if (!teamDiv) {
      console.error(`Team div for ${team.name} not found`);
      return;
    }
    teamDiv.innerHTML = `<h3>${team.name}</h3>`; // Add the team name
    
    // Add each player's name and position to the team's div
    team.players.forEach(player => {
      teamDiv.innerHTML += `
        <div class="player">
          <span>${player.name} - ${player.position}</span>
        </div>`;
    });
  });
}

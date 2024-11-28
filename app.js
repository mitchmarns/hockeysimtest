import { loadPlayers, getAvailablePlayers, assignPlayerToTeam} from './team.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayers();
  displayAvailablePlayers();

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('assign-btn')) {
      const playerId = parseInt(e.target.dataset.id);
      const teamName = e.target.dataset.team;
      assignPlayerToTeam(playerId, teamName);
      displayAvailablePlayers();
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

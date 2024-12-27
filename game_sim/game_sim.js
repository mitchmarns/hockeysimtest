import { loadPlayersFromStorage, savePlayersToStorage } from './data.js';
import { groupPlayersByTeam } from './teams.js';
import { simulateGame } from './simulation.js';
import { displayGameLog, startGameSimulation } from './ui.js';

const players = loadPlayersFromStorage();
const teams = {
  Rangers: { name: "Rangers", players: [], lines: [] },
  Devils: { name: "Devils", players: [], lines: [] },
  Islanders: { name: "Islanders", players: [], lines: [] },
  Sabres: { name: "Sabres", players: [], lines: [] }
};

document.getElementById('start-game').addEventListener('click', () => {
  // Get the selected teams
  const homeTeamName = document.getElementById('home-team').value;
  const awayTeamName = document.getElementById('away-team').value;

  // Get the actual team objects
  const homeTeam = teams[homeTeamName];
  const awayTeam = teams[awayTeamName];

  // Call the simulation function and display the game log
  const gameLog = startGameSimulation(homeTeam, awayTeam);
  displayGameLog(gameLog); // Ensure you have the function to display the log
});

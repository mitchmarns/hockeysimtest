import { loadPlayersFromStorage, savePlayersToStorage } from './data.js';
import { groupPlayersByTeam } from './teams.js';
import { simulateGame } from './simulation.js';
import { displayGameLog } from './ui.js';

const players = loadPlayersFromStorage();
const teams = groupPlayersByTeam(players);

// Start the simulation
document.getElementById('start-game').addEventListener('click', () => {
  const lineAssignments = {}; // Load or prepare line assignments
  const { gameLog } = simulateGame(teams['Rangers'], teams['Islanders'], lineAssignments);
  displayGameLog(gameLog);
});

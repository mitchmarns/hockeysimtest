import { loadPlayersFromStorage, savePlayersToStorage } from './data.js';
import { groupPlayersByTeam } from './teams.js';
import { simulateGame } from './simulation.js';
import { displayGameLog } from './ui.js';

const players = loadPlayersFromStorage();
const teams = groupPlayersByTeam(players);

// Select a random team and simulate a game
document.getElementById('start-game').addEventListener('click', () => {
  const teamNames = Object.keys(teams);  // Get all available teams: Rangers, Devils, Islanders, Sabres

  // Randomly select two distinct teams for the game
  const homeTeamIndex = Math.floor(Math.random() * teamNames.length);
  let awayTeamIndex;
  do {
    awayTeamIndex = Math.floor(Math.random() * teamNames.length);
  } while (awayTeamIndex === homeTeamIndex);

  const homeTeamName = teamNames[homeTeamIndex];
  const awayTeamName = teamNames[awayTeamIndex];

  const homeTeam = teams[homeTeamName];
  const awayTeam = teams[awayTeamName];

  console.log(`Game between ${homeTeamName} and ${awayTeamName}`);

  const lineAssignments = {};  // Prepare or load line assignments
  const { gameLog } = simulateGame(homeTeam, awayTeam, lineAssignments);

  // Display the game log
  displayGameLog(gameLog);
});

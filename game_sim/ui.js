import { simulateGame } from './game_sim.js';

export const displayGameLog = (gameLog) => {
  const gameLogOutput = document.getElementById('game-log-output');
  gameLogOutput.innerHTML = gameLog.map(play => `<p>${play}</p>`).join('');
};

export const startGameSimulation = (homeTeam, awayTeam) => {
  const gameLog = simulateGame(homeTeam, awayTeam);
  return gameLog;  // Return the game log for display
};

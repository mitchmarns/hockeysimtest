export const displayGameLog = (gameLog) => {
  const gameOutput = document.getElementById('game-output');
  gameOutput.innerHTML = gameLog.map(play => `<p>${play}</p>`).join('');
};

export const startGameSimulation = (homeTeam, awayTeam) => {
  // Run the simulation
  const gameLog = simulateGame(homeTeam, awayTeam);  // Get game log from simulateGame

  // Display the game log
  displayGameLog(gameLog);
};

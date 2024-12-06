export const displayGameLog = (gameLog) => {
  const gameOutput = document.getElementById('game-output');
  gameOutput.innerHTML = gameLog.map(play => `<p>${play}</p>`).join('');
};

export const startGameSimulation = (teams, lineAssignments) => {
  // Setup home and away teams
  // Run simulation and display log
};

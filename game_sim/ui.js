export const displayGameLog = (gameLog) => {
  const gameOutput = document.getElementById('game-output');
  
  if (gameLog && gameLog.length > 0) {  
    gameOutput.innerHTML = gameLog.map(play => `<p>${play}</p>`).join('');
  } else {
    gameOutput.innerHTML = '<p>No game log available.</p>';
    console.error('Game Log is undefined or empty');
  }
};

export const startGameSimulation = (homeTeam, awayTeam) => {
  // Ensure simulateGame returns the gameLog
  const gameLog = simulateGame(homeTeam, awayTeam); 

  // Pass the gameLog to displayGameLog
  if (gameLog && gameLog.length) {  
    displayGameLog(gameLog);  
  } else {
    console.error('Game Log is undefined or empty');
  }
};

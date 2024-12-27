// Function to handle a goal being scored
export const handleGoal = (scorer, team, gameLog, scores) => {
  if (!scores) {
    console.error('Scores object is undefined');
    return;
  }

  // Update the score for the home or away team
  if (team === 'home') {
    scores.home += 1;
    gameLog.push(`${scorer.name} scores for Home Team!`);
  } else if (team === 'away') {
    scores.away += 1;
    gameLog.push(`${scorer.name} scores for Away Team!`);
  }

  // Add assists for the goal
  addAssist(team, scorer, gameLog);
};

// Function to handle assists
export const addAssist = (team, scorer, gameLog) => {
  // Ensure team object has players and filter out the scorer
  const eligiblePlayers = team.players.filter(player => player.id !== scorer.id);
  
  if (eligiblePlayers.length > 0) {
    // Pick a random player to be the assister
    const assister = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    gameLog.push(`${assister.name} assisted on the goal by ${scorer.name}.`);
  }
};

export const handleGoal = (scorer, team, gameLog, scores) => {
  scores[team === 'home' ? 'home' : 'away'] += 1;
  gameLog.push(`${scorer.name} scores for ${team === 'home' ? homeTeam.name : awayTeam.name}!`);
  addAssist(team, scorer, gameLog);
};

export const addAssist = (team, scorer, gameLog) => {
  const eligiblePlayers = team.players.filter(player => player.id !== scorer.id);
  if (eligiblePlayers.length > 0) {
    const assister = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    gameLog.push(`${assister.name} assisted on the goal by ${scorer.name}.`);
  }
};

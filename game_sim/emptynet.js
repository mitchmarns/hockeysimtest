export const handleEmptyNet = (team, elapsedTime, scores, gameLog) => {
  if (elapsedTime >= 58 && scores[team === homeTeam ? 'home' : 'away'] < scores[team === homeTeam ? 'away' : 'home']) {
    team.lines.goalies.starter = null; // Pull goalie
    team.extraAttacker = getRandomEligiblePlayer(team); // Add extra attacker
    gameLog.push(`${team.name} pulls their goalie for an extra attacker!`);
  }
};

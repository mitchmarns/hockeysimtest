// Handle injury event
export const handleInjuryEvent = (team, eventLog, injuredPlayers) => {
  const injuredPlayer = team.players[Math.floor(Math.random() * team.players.length)];
  const injurySeverity = Math.floor(Math.random() * 3) + 1;

  const recoveryTime = injurySeverity === 1 ? 5 * 60 :
    injurySeverity === 2 ? 10 * 60 : 20 * 60;

  injuredPlayers[injuredPlayer.id] = {
    player: injuredPlayer,
    recoveryEndTime: Date.now() + recoveryTime * 1000,
  };

  eventLog.push(`${injuredPlayer.name} was injured and is out for ${recoveryTime / 60} minutes!`);
  return eventLog;
};

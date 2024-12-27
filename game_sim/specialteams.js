export const adjustForSpecialTeams = (team, penalizedPlayers) => {
  const activePenalties = Object.values(penalizedPlayers).filter(p => p.player.team === team.name);
  if (activePenalties.length > 0) {
    return team.lines.penaltyKillUnits[0]; // Example: Use the first penalty kill unit
  } else {
    return team.lines.forwardLines[0]; // Example: Use the first forward line
  }
};

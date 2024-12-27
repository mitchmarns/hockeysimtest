export const adjustForSpecialTeams = (team, penalizedPlayers) => {
  // Ensure penalizedPlayers is an object and check for active penalties for the team
  const activePenalties = Object.values(penalizedPlayers).filter(p => p.player && p.player.team === team.name);

  if (activePenalties.length > 0) {
    // There are active penalties, return the first penalty kill unit
    return team.lines.penaltyKillUnits[0]; // Example: Use the first penalty kill unit
  } else {
    // No active penalties, return the first forward line
    return team.lines.forwardLines[0]; // Example: Use the first forward line
  }
};

export const adjustForSpecialTeams = (team, penalizedPlayers) => {
  // Get the list of active penalized players for the current team
  const activePenalties = Object.values(penalizedPlayers).filter(p => p.player.team === team.name);
  
  // If there are any active penalties, use the penalty kill units
  if (activePenalties.length > 0) {
    return team.lines.penaltyKillUnits.map(unit => {
      // Check if any player is assigned to each slot
      return unit; // Return the unit (you can add specific logic for which unit to use based on the situation)
    });
  } else {
    // If there are no penalties, use the powerplay units (example: powerplay unit 2)
    return team.lines.powerplayUnits.map(unit => {
      return unit; // Return the powerplay unit (again, adjust this as per your logic)
    });
  }
};

export const adjustForSpecialTeams = (team, penalizedPlayers) => {
  // Ensure penaltyKillUnits and powerplayUnits exist in the team object
  if (!team.lines.penaltyKillUnits) {
    team.lines.penaltyKillUnits = [
      { F1: null, F2: null, D1: null, D2: null },
      { F1: null, F2: null, D1: null, D2: null }
    ];
  }

  if (!team.lines.powerplayUnits) {
    team.lines.powerplayUnits = [
      { LW: null, C: null, RW: null, LD: null, RD: null },
      { LW: null, C: null, RW: null, LD: null, RD: null }
    ];
  }

  // Get the list of active penalized players for the current team
  const activePenalties = Object.values(penalizedPlayers).filter(p => p.player.team === team.name);
  
  // If there are active penalties, return the penalty kill units
  if (activePenalties.length > 0) {
    return team.lines.penaltyKillUnits.map((unit, index) => {
      // Here you can add logic to adjust the unit depending on the penalty situation
      console.log(`Penalty Kill Unit ${index + 1}:`, unit);
      return unit; // Return the unit (you may need to customize this further)
    });
  } else {
    // If there are no active penalties, return the powerplay units
    return team.lines.powerplayUnits.map((unit, index) => {
      // Here you can add logic to adjust the powerplay unit based on team strategy
      console.log(`Powerplay Unit ${index + 1}:`, unit);
      return unit; // Return the powerplay unit (customize this as needed)
    });
  }
};


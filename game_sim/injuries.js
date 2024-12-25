// Handle injury event
export const handleInjuryEvent = (team, eventLog) => {
  // Define injury types and recovery ranges (in minutes)
  const injuryTypes = [
    { type: "Bruise", severity: 1, recoveryRange: [5, 20] },  // Short-term
    { type: "Sprain", severity: 2, recoveryRange: [60, 120] }, // Medium-term
    { type: "Fracture", severity: 3, recoveryRange: [240, 480] }, // Long-term
    { type: "Concussion", severity: 4, recoveryRange: [720, 1440] }, // Multi-game
  ];

// Filter eligible players who are not already injured
  const eligiblePlayers = team.players.filter(player => !player.injured);
  if (eligiblePlayers.length === 0) {
    eventLog.push(`No eligible players for injury event on ${team.name}.`);
    return;
  }

  // Select a random player and injury type
  const injuredPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
  const injury = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];

  // Calculate recovery time in minutes and set the injury status
  const recoveryTimeInMinutes = Math.floor(
    Math.random() * (injury.recoveryRange[1] - injury.recoveryRange[0]) + injury.recoveryRange[0]
  );
  injuredPlayer.injured = true;
  injuredPlayer.recoveryTime = Date.now() + recoveryTimeInMinutes * 60 * 1000; // Store as a timestamp
  injuredPlayer.injuryType = injury.type;

  // Log the injury event
  eventLog.push(
    `${injuredPlayer.name} suffered a ${injury.type} (Severity ${injury.severity}) and will be out for ${recoveryTimeInMinutes} minutes!`
  );

  return eventLog;
};

export const updateInjuryStatuses = (team, eventLog) => {
  const now = Date.now();

  team.players.forEach(player => {
    if (player.injured && player.recoveryTime <= now) {
      player.injured = false;
      delete player.recoveryTime; // Clean up unnecessary properties
      delete player.injuryType;
      
      // Remove from injuredPlayers map
      delete injuredPlayers[player.id];
      
      eventLog.push(`${player.name} has recovered and is ready to play!`);
    }
  });

  return eventLog;
};

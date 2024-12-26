// Handle injury event
export const handleInjuryEvent = (team, eventLog) => {
  // Define injury types and recovery ranges (in games)
  const injuryTypes = [
    { type: "Bruise", severity: 1, recoveryRange: [1, 2] }, // Short-term
    { type: "Sprain", severity: 2, recoveryRange: [3, 5] }, // Medium-term
    { type: "Fracture", severity: 3, recoveryRange: [6, 10] }, // Long-term
    { type: "Concussion", severity: 4, recoveryRange: [11, 20] }, // Multi-game
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

  // Calculate recovery time in games
  const recoveryGames = Math.floor(
    Math.random() * (injury.recoveryRange[1] - injury.recoveryRange[0]) + injury.recoveryRange[0]
  );
  
  injuredPlayer.injured = true;
  injuredPlayer.recoveryGames = recoveryGames; 
  injuredPlayer.injuryType = injury.type;

  console.log(`[DEBUG] Injured Player:`, injuredPlayer);

  // Persist updated team data to localStorage
  saveTeamData(team);

  // Log the injury event
  eventLog.push(
    `${injuredPlayer.name} suffered a ${injury.type} (Severity ${injury.severity}) and will be out for ${recoveryGames} games!`
  );

  return eventLog;
};

// Update injury statuses and handle player recovery
export const updateInjuryStatuses = (team, eventLog) => {
  team.players.forEach(player => {
    if (player.injured) {
      player.recoveryGames -= 1; // Decrement recovery games after each game
      if (player.recoveryGames <= 0) {
        player.injured = false;
        delete player.recoveryGames; // Clean up unnecessary properties
        delete player.injuryType;

        // Log recovery event
        eventLog.push(`${player.name} has recovered and is ready to play!`);
      }
    }
  });

  // Persist updated team data to localStorage
  saveTeamData(team);

  return eventLog;
};

// Save updated team data to localStorage
export const saveTeamData = (team) => {
  const teams = JSON.parse(localStorage.getItem("teams")) || [];
  const teamIndex = teams.findIndex(t => t.name === team.name);
  if (teamIndex !== -1) {
    teams[teamIndex] = team; // Update the specific team
  } else {
    teams.push(team); // Add team if not already in storage
  }
  localStorage.setItem("teams", JSON.stringify(teams));
};

// Load team data from localStorage
export const loadTeamData = (teamName) => {
  const teams = JSON.parse(localStorage.getItem("teams")) || [];
  return teams.find(t => t.name === teamName) || null;
};

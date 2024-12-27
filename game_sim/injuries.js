// Handle injury event
export const handleInjuryEvent = (team, eventLog) => {
// Define injury types and recovery ranges (in games)
const injuryTypes = [
  { type: "Bruised Ribs", severity: 1, recoveryRange: [1, 2], weight: 30 },
  { type: "Charley Horse", severity: 1, recoveryRange: [1, 2], weight: 25 },
  { type: "Cut or Laceration", severity: 1, recoveryRange: [1, 3], weight: 20 },
  { type: "Sprained Ankle", severity: 2, recoveryRange: [3, 5], weight: 15 },
  { type: "Shoulder Strain", severity: 2, recoveryRange: [3, 6], weight: 10 },
  { type: "Hip Pointer", severity: 2, recoveryRange: [3, 5], weight: 10 },
  { type: "Fractured Finger", severity: 3, recoveryRange: [6, 8], weight: 8 },
  { type: "Broken Nose", severity: 3, recoveryRange: [6, 10], weight: 7 },
  { type: "MCL Sprain", severity: 3, recoveryRange: [7, 10], weight: 6 },
  { type: "Concussion", severity: 4, recoveryRange: [11, 20], weight: 5 },
  { type: "Separated Shoulder", severity: 4, recoveryRange: [12, 18], weight: 4 },
  { type: "Broken Collarbone", severity: 4, recoveryRange: [14, 20], weight: 3 },
  { type: "ACL Tear", severity: 5, recoveryRange: [20, 82], weight: 2 },
  { type: "Achilles Rupture", severity: 5, recoveryRange: [30, 82], weight: 1 },
  { type: "Fractured Vertebrae", severity: 5, recoveryRange: [40, 82], weight: 1 }
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
  if (!eventLog) eventLog = [];  // Fallback check, though initializing in the calling function is preferred
  
  team.players.forEach(player => {
    if (player.injured) {
      player.recoveryGames -= 1;
      if (player.recoveryGames <= 0) {
        player.injured = false;
        delete player.recoveryGames;
        delete player.injuryType;

        // Log recovery event
        eventLog.push(`${player.name} has recovered and is ready to play!`);
      }
    }
  });

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

export const PENALTY_DURATIONS = {
  "Minor": 2 * 60,
  "Major": 5 * 60,
  "Double Minor": 4 * 60,
  "Misconduct": 10 * 60,
  "Game Misconduct": -1,
  "Match": -1
};

export const PENALTY_WEIGHTS = {
  "Hooking": 15,
  "Tripping": 15,
  "Slashing": 10,
  "Boarding": 8,
  "Cross-Checking": 8,
  "High-Sticking": 10,
  "Roughing": 12,
  "Interference": 10,
  "Holding": 12,
  "Unsportsmanlike Conduct": 3,
  "Fighting": 4,
  "Match": 1, // Rare
  "Game Misconduct": 1 // Rare
};

export const PENALTY_TYPE_MAP = {
  "Hooking": "Minor",
  "Tripping": "Minor",
  "Slashing": "Minor",
  "Boarding": "Minor",
  "Cross-Checking": "Minor",
  "High-Sticking": "Double Minor", // If blood is drawn
  "Roughing": "Minor",
  "Interference": "Minor",
  "Holding": "Minor",
  "Unsportsmanlike Conduct": "Minor",
  "Fighting": "Major",
  "Match": "Match",
  "Game Misconduct": "Game Misconduct"
};

export const getRandomPenaltyType = () => {
  const totalWeight = Object.values(PENALTY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const [penaltyType, weight] of Object.entries(PENALTY_WEIGHTS)) {
    cumulativeWeight += weight;
    if (randomValue < cumulativeWeight) {
      return penaltyType;
    }
  }
  return "Hooking"; // Default fallback
};

// Handle penalty event
export const handlePenaltyEvent = (team, eventLog, penalizedPlayers) => {
  // Select a random player
  const eligiblePlayers = team.players.filter(player => !penalizedPlayers[player.id]); // Avoid already penalized players
  if (eligiblePlayers.length === 0) {
    eventLog.push(`No eligible players on ${team.name} for a penalty.`);
    return eventLog;
  }

  const penalizedPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
  const infraction = getRandomPenaltyType();
  const penaltyType = PENALTY_TYPE_MAP[infraction];
  let penaltyDuration = PENALTY_DURATIONS[penaltyType];

  if (penaltyType === "Game Misconduct" || penaltyType === "Match") {
    // Ejected players
    penalizedPlayers[penalizedPlayer.id] = {
      player: penalizedPlayer,
      penaltyEndTime: -1, // Indefinite
    };
    eventLog.push(`${penalizedPlayer.name} committed ${infraction} (${penaltyType}) and is ejected from the game!`);
  } else {
    // Standard penalties
    penalizedPlayers[penalizedPlayer.id] = {
      player: penalizedPlayer,
      penaltyEndTime: Date.now() + penaltyDuration * 1000,
    };
    eventLog.push(
      `${penalizedPlayer.name} committed ${infraction} (${penaltyType}) for ${penaltyDuration / 60} minutes!`
    );
  }

  return eventLog;
};

export const updatePenaltyStatuses = (penalizedPlayers, eventLog) => {
  const currentTime = Date.now();

  for (const playerId in penalizedPlayers) {
    const penaltyInfo = penalizedPlayers[playerId];
    if (penaltyInfo.penaltyEndTime > 0 && currentTime >= penaltyInfo.penaltyEndTime) {
      delete penalizedPlayers[playerId]; // Remove penalty
      eventLog.push(`${penaltyInfo.player.name} has served their penalty and is back on the ice.`);
    }
  }

  return eventLog;
};

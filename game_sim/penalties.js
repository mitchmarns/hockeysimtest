export const PENALTY_DURATIONS = {
  "Minor": 2 * 60,
  "Major": 5 * 60,
  "Double Minor": 4 * 60,
  "Misconduct": 10 * 60,
  "Game Misconduct": -1,
  "Match": -1
};

export const PENALTY_WEIGHTS = {
  "Minor": 70,
  "Double Minor": 15,
  "Major": 10,
  "Misconduct": 3,
  "Game Misconduct": 1,
  "Match": 1
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
  return "Minor";
};

// Handle penalty event
export const handlePenaltyEvent = (team, eventLog, penalizedPlayers) => {
  const penalizedPlayer = team.players[Math.floor(Math.random() * team.players.length)];
  const penaltyType = getRandomPenaltyType();
  let penaltyDuration = PENALTY_DURATIONS[penaltyType];

  if (penaltyType === "Game Misconduct" || penaltyType === "Match") {
    penalizedPlayers[penalizedPlayer.id] = {
      player: penalizedPlayer,
      penaltyEndTime: -1,
    };
    eventLog.push(`${penalizedPlayer.name} took a ${penaltyType} and is ejected from the game!`);
  } else {
    penalizedPlayers[penalizedPlayer.id] = {
      player: penalizedPlayer,
      penaltyEndTime: Date.now() + penaltyDuration * 1000,
    };
    eventLog.push(`${penalizedPlayer.name} took a ${penaltyType} for ${penaltyDuration / 60} minutes!`);
  }

  return eventLog;
};

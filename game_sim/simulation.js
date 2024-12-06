import { handlePenaltyEvent } from './penalties.js';
import { handleInjuryEvent } from './injuries.js';
import { calculateAverageSkill } from './teams.js';

export const simulateGame = (homeTeam, awayTeam, lineAssignments) => {
  const gameLog = [];
  const scores = { home: 0, away: 0 };

  // Define penalized players and injured players storage
  const penalizedPlayers = {};
  const injuredPlayers = {};

  // Simulate 3 periods
  for (let i = 1; i <= 3; i++) {
    gameLog.push(`--- Period ${i} ---`);

    const numEvents = Math.floor(Math.random() * 10) + 5;
    for (let j = 0; j < numEvents; j++) {
      const eventType = Math.random();

      if (eventType < 0.2) {
        // Handle Penalty Event
        handlePenaltyEvent(homeTeam, gameLog, penalizedPlayers);
      } else if (eventType < 0.4) {
        // Handle Injury Event
        handleInjuryEvent(awayTeam, gameLog, injuredPlayers);
      } else if (eventType < 0.7) {
        // Simulate Shots/Goals
        simulateNormalPlay(homeTeam, awayTeam, gameLog, scores);
      } else {
        gameLog.push('A neutral play occurred.');
      }
    }
  }

  if (scores.home === scores.away) {
    gameLog.push('Game tied! Overtime starts.');
  }

  return { gameLog, scores };
};

// Simulate normal game events like shots, passes, and goals
const simulateNormalPlay = (homeTeam, awayTeam, gameLog, scores) => {
  const shootingTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
  const scoringChance = Math.random();

  if (scoringChance > 0.7) {
    const scorer = shootingTeam.players[Math.floor(Math.random() * shootingTeam.players.length)];
    const goalScored = Math.random() > 0.5;

    if (goalScored) {
      if (shootingTeam === homeTeam) {
        scores.home += 1;
      } else {
        scores.away += 1;
      }
      gameLog.push(`${scorer.name} scores a goal for ${shootingTeam.name}!`);
    } else {
      gameLog.push(`${scorer.name} took a shot but missed.`);
    }
  }
};

  return { gameLog, scores };
};

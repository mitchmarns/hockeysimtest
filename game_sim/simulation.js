import { handlePenaltyEvent } from './penalties.js';
import { handleInjuryEvent } from './injuries.js';
import { calculateAverageSkill } from './teams.js';

// Main game simulation
export const simulateGame = (homeTeam, awayTeam, lineAssignments) => {
  const gameLog = [];
  const scores = { home: 0, away: 0 };

  // Simulate 3 periods
  for (let i = 1; i <= 3; i++) {
    gameLog.push(`--- Period ${i} ---`);

    const numEvents = Math.floor(Math.random() * 10) + 5;
    for (let j = 0; j < numEvents; j++) {
      const eventType = Math.random();

      if (eventType < 0.3) {
        gameLog = handlePenaltyEvent(homeTeam, gameLog);
      } else if (eventType < 0.6) {
        gameLog = handleInjuryEvent(awayTeam, gameLog);
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

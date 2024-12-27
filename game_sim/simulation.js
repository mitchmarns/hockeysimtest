import { handleInjuryEvent, updateInjuryStatuses } from './injuries.js';
import { handlePenaltyEvent, updatePenaltyStatuses } from './penalties.js';
import { handleGoal, addAssist } from './goals.js';
import { getRandomEvent } from './events.js';
import { simulateShotOutcome } from './helpers.js';
import { adjustForSpecialTeams } from './specialteams.js';
import { handleEmptyNet } from './emptynet.js';
import { GameState } from './gamestate.js';
import { groupPlayersByTeam, calculateAverageSkill } from './teams.js';

// Simulate one period of the game
const simulatePeriod = (homeTeam, awayTeam, eventLog, penalizedPlayers, gameState) => {
  let periodLog = [];

  // Handle injuries and penalties
  periodLog = handleInjuryEvent(homeTeam, periodLog);
  periodLog = handleInjuryEvent(awayTeam, periodLog);
  
  // Handle penalties
  periodLog = handlePenaltyEvent(homeTeam, periodLog, penalizedPlayers);
  periodLog = handlePenaltyEvent(awayTeam, periodLog, penalizedPlayers);

  // Simulate goals, shots, and other events
  const homeTeamAverageSkill = calculateAverageSkill(homeTeam, 'speed');
  const awayTeamAverageSkill = calculateAverageSkill(awayTeam, 'speed');

  const homeShots = Math.floor(Math.random() * 10) + homeTeamAverageSkill;  // Random shots adjusted by team skill
  const awayShots = Math.floor(Math.random() * 10) + awayTeamAverageSkill;

  let homeGoals = 0;
  let awayGoals = 0;

  // Simulate shots on goal
  for (let i = 0; i < homeShots; i++) {
    if (simulateShotOutcome(homeTeam, awayTeam)) {
      homeGoals++;
      handleGoal(homeTeam, homeGoals, eventLog);
      addAssist(homeTeam, homeGoals, eventLog);
    }
  }

  for (let i = 0; i < awayShots; i++) {
    if (simulateShotOutcome(awayTeam, homeTeam)) {
      awayGoals++;
      handleGoal(awayTeam, awayGoals, eventLog);
      addAssist(awayTeam, awayGoals, eventLog);
    }
  }

  periodLog.push(`${homeTeam.name} scored ${homeGoals} goals.`);
  periodLog.push(`${awayTeam.name} scored ${awayGoals} goals.`);

  // Handle special teams (adjust for penalties)
  adjustForSpecialTeams(homeTeam, awayTeam, penalizedPlayers, eventLog);

  // Handle empty net situations
  handleEmptyNet(homeTeam, awayTeam, eventLog);

  eventLog.push(...periodLog);

  return { homeGoals, awayGoals, eventLog };
};

// Simulate a full game between two teams
export const simulateGame = (homeTeam, awayTeam) => {
  const eventLog = [];
  const penalizedPlayers = {}; // Keep track of penalized players
  const gameState = new GameState(); // Manage game state (score, time, etc.)

  let homeScore = 0;
  let awayScore = 0;

  // Simulate 3 periods
  for (let i = 1; i <= 3; i++) {
    eventLog.push(`\n--- Period ${i} ---`);
    const { homeGoals, awayGoals, newEventLog } = simulatePeriod(homeTeam, awayTeam, eventLog, penalizedPlayers, gameState);

    homeScore += homeGoals;
    awayScore += awayGoals;

    // Update injury statuses after each period
    eventLog.push(...updateInjuryStatuses(homeTeam, newEventLog));
    eventLog.push(...updateInjuryStatuses(awayTeam, newEventLog));

    // Update penalty statuses after each period
    eventLog.push(...updatePenaltyStatuses(penalizedPlayers, newEventLog));
  }

  // Final score and game log
  eventLog.push(`\nFinal Score: ${homeTeam.name} ${homeScore} - ${awayTeam.name} ${awayScore}`);
  
  // Handle random event (e.g., fight, fan interference)
  eventLog.push(getRandomEvent());

  return eventLog;
};

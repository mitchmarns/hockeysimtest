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
const simulatePeriod = (homeTeam, awayTeam, gameLog, penalizedPlayers, gameState) => {
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
    const scorer = homeTeam.players[Math.floor(Math.random() * homeTeam.players.length)]; // Example scorer selection
    if (simulateShotOutcome(homeTeam, awayTeam)) {
      homeGoals++;
      handleGoal(scorer, homeTeam, gameLog, scores);
      addAssist(homeTeam, homeGoals, gameLog);
    }
  }

  for (let i = 0; i < awayShots; i++) {
    const scorer = awayTeam.players[Math.floor(Math.random() * awayTeam.players.length)]; // Example scorer selection
    if (simulateShotOutcome(awayTeam, homeTeam)) {
      awayGoals++;
      handleGoal(scorer, awayTeam, gameLog, scores);
      addAssist(awayTeam, awayGoals, gameLog);
    }
  }

  periodLog.push(`${homeTeam.name} scored ${homeGoals} goals.`);
  periodLog.push(`${awayTeam.name} scored ${awayGoals} goals.`);

  // Handle special teams (adjust for penalties)
  adjustForSpecialTeams(homeTeam, penalizedPlayers, gameLog);
  adjustForSpecialTeams(awayTeam, penalizedPlayers, gameLog);

  // Handle empty net situations
  handleEmptyNet(homeTeam, awayTeam, gameLog);

  gameLog.push(...periodLog);

  return { homeGoals, awayGoals, gameLog };
};

// Simulate a full game between two teams
export const simulateGame = (homeTeam, awayTeam) => {
  let homeScore = 0;
  let awayScore = 0;
  const gameLog = [];
  const penalizedPlayers = {}; // Keep track of penalized players
  const gameState = new GameState(); // Manage game state (score, time, etc.)

  // Simulate 3 periods
  for (let i = 1; i <= 3; i++) {
    gameLog.push(`\n--- Period ${i} ---`);
    const { homeGoals, awayGoals, newGameLog } = simulatePeriod(homeTeam, awayTeam, gameLog, penalizedPlayers, gameState);

    homeScore += homeGoals;
    awayScore += awayGoals;

    // Update injury statuses after each period
    gameLog.push(...updateInjuryStatuses(homeTeam, newGameLog));
    gameLog.push(...updateInjuryStatuses(awayTeam, newGameLog));

    // Update penalty statuses after each period
    gameLog.push(...updatePenaltyStatuses(penalizedPlayers, newGameLog));
  }

  // Final score and game log
  gameLog.push(`\nFinal Score: ${homeTeam.name} ${homeScore} - ${awayTeam.name} ${awayScore}`);
  
  // Handle random event (e.g., fight, fan interference)
  gameLog.push(getRandomEvent());

  return gameLog;
};

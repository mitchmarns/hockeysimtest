import { loadTeamsFromStorage } from './data.js';
import { handleInjuryEvent, updateInjuryStatuses } from './injuries.js';
import { handlePenaltyEvent, updatePenaltyStatuses } from './penalties.js';
import { handleGoal, addAssist } from './goals.js';
import { getRandomEvent } from './events.js';
import { simulateShotOutcome } from './helpers.js';
import { adjustForSpecialTeams } from './specialteams.js';
import { handleEmptyNet } from './emptynet.js';
import { GameState } from './gamestate.js';
import { groupPlayersByTeam, calculateAverageSkill } from './teams.js';

// Parse the localStorage data
const teams = loadTeamsFromStorage();
teams.forEach(team => {
  console.log(`Team: ${team.name}`);
  console.log('Lines:', team.lines);
});
const lineAssignments = JSON.parse(localStorage.getItem('lineAssignments') || '{}');
const allPlayers = JSON.parse(localStorage.getItem('players') || '[]'); // Assuming 'players' contains all player data

// Populate teams with assigned players
teams.forEach(team => {
  team.players = []; // Clear any existing players

  // Loop through lineAssignments and find players for this team
  for (const [lineKey, playerId] of Object.entries(lineAssignments)) {
    const [teamName] = lineKey.split('-');
    if (teamName === team.name) {
      const player = allPlayers.find(p => p.id === parseInt(playerId));
      if (player) {
        team.players.push(player); // Add player object to the team
      }
    }
  }
});

// Save updated teams back to localStorage
localStorage.setItem('teams', JSON.stringify(teams));

// Simulate one period of the game
const simulatePeriod = (homeTeam, awayTeam, gameLog, penalizedPlayers, gameState) => {
  let periodLog = [];
  let homeGoals = 0;
  let awayGoals = 0;

  let eventLog = [];

  // Handle injuries and penalties
  eventLog = handleInjuryEvent(homeTeam, eventLog);
  eventLog = handleInjuryEvent(awayTeam, eventLog);

  // Handle penalties
  periodLog = handlePenaltyEvent(homeTeam, periodLog, penalizedPlayers);
  periodLog = handlePenaltyEvent(awayTeam, periodLog, penalizedPlayers);

  // Simulate goals, shots, and other events
  const homeTeamAverageSkill = calculateAverageSkill(homeTeam, 'speed');
  const awayTeamAverageSkill = calculateAverageSkill(awayTeam, 'speed');

  const homeShots = Math.floor(Math.random() * 10) + homeTeamAverageSkill;  // Random shots adjusted by team skill
  const awayShots = Math.floor(Math.random() * 10) + awayTeamAverageSkill;

  // Simulate shots on goal for home team
  for (let i = 0; i < homeShots; i++) {
    const scorer = homeTeam.players[Math.floor(Math.random() * homeTeam.players.length)]; // Example scorer selection
    if (simulateShotOutcome(homeTeam, awayTeam)) {
      homeGoals++;  // Increment home goals
      handleGoal(scorer, homeTeam, gameLog, { home: homeGoals, away: awayGoals }); // Pass the updated score
      addAssist(homeTeam, scorer, gameLog);  // Corrected: pass scorer, not homeGoals
    }
  }

  // Simulate shots on goal for away team
  for (let i = 0; i < awayShots; i++) {
    const scorer = awayTeam.players[Math.floor(Math.random() * awayTeam.players.length)]; // Example scorer selection
    if (simulateShotOutcome(awayTeam, homeTeam)) {
      awayGoals++;  // Increment away goals
      handleGoal(scorer, awayTeam, gameLog, { home: homeGoals, away: awayGoals }); // Pass the updated score
      addAssist(awayTeam, scorer, gameLog);  // Corrected: pass scorer, not awayGoals
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
  let gameLog = [];
  const penalizedPlayers = {}; // Keep track of penalized players
  const gameState = new GameState(); // Manage game state (score, time, etc.)

  // Simulate 3 periods
  for (let i = 1; i <= 3; i++) {
    gameLog.push(`\n--- Period ${i} ---`);
    
    // Destructure the return from simulatePeriod and use `gameLog` as the updated log
    const { homeGoals, awayGoals, gameLog: newGameLog } = simulatePeriod(
      homeTeam,
      awayTeam,
      gameLog,
      penalizedPlayers,
      gameState
    );

    homeScore += homeGoals;
    awayScore += awayGoals;

    // Update the gameLog with the newGameLog from the current period
    gameLog = newGameLog;

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

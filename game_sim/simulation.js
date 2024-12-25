import { handlePenaltyEvent } from './penalties.js';
import { handleInjuryEvent, updateInjuryStatuses } from './injuries.js';
import { calculateAverageSkill } from './teams.js';

export const simulateGame = (homeTeam, awayTeam) => {
  const gameLog = [];
  const scores = { home: 0, away: 0 };

  // Constants
  const SHIFT_DURATION = 2; // Shift duration in minutes
  const PERIOD_DURATION = 20; // Each period is 20 minutes
  const OVERTIME_DURATION = 5; // Overtime period (sudden death)

  console.log(`Game starting between ${homeTeam.name} and ${awayTeam.name}`);

  // Track penalized and injured players
  const penalizedPlayers = {};
  const injuredPlayers = {};

  // Update injury statuses before the game
  updateInjuryStatuses(homeTeam, gameLog);
  updateInjuryStatuses(awayTeam, gameLog);

  // Simulate regulation periods
  for (let period = 1; period <= 3; period++) {
    gameLog.push(`--- Period ${period} ---`);
    simulatePeriod(homeTeam, awayTeam, PERIOD_DURATION, SHIFT_DURATION, gameLog, scores, penalizedPlayers, injuredPlayers);
  }

  // Check for tie after regulation
  if (scores.home === scores.away) {
    gameLog.push(`--- Regulation Ends in a Tie ---`);
    gameLog.push(`Score: ${homeTeam.name} ${scores.home} - ${awayTeam.name} ${scores.away}`);
    gameLog.push(`--- Overtime ---`);

    const overtimeResult = simulateOvertime(homeTeam, awayTeam, OVERTIME_DURATION, gameLog, scores, penalizedPlayers, injuredPlayers);
    if (overtimeResult.overtimeWinner) {
      gameLog.push(`${overtimeResult.overtimeWinner.name} wins the game in overtime!`);
    } else {
      gameLog.push(`No goals in overtime. The game ends in a tie!`);
    }
  }

  // Final score
  gameLog.push(`--- Final Score ---`);
  gameLog.push(`${homeTeam.name}: ${scores.home}`);
  gameLog.push(`${awayTeam.name}: ${scores.away}`);

  if (scores.home > scores.away) {
    gameLog.push(`${homeTeam.name} wins the game!`);
  } else if (scores.away > scores.home) {
    gameLog.push(`${awayTeam.name} wins the game!`);
  } else {
    gameLog.push(`The game ends in a tie.`);
  }

  return { gameLog, scores };
};

// Simulate a single period
const simulatePeriod = (homeTeam, awayTeam, periodDuration, shiftDuration, gameLog, scores, penalizedPlayers, injuredPlayers) => {
  let elapsedTime = 0;

  while (elapsedTime < periodDuration) {
    const eventDuration = Math.random() * 1.5; // Random event duration (up to 1.5 minutes)
    elapsedTime += eventDuration;

    // Rotate lines if shift ends
    if (Math.floor(elapsedTime / shiftDuration) > Math.floor((elapsedTime - eventDuration) / shiftDuration)) {
      rotateLines(homeTeam);
      rotateLines(awayTeam);
      gameLog.push(`Line changes for both teams at ${elapsedTime.toFixed(2)} minutes.`);
    }

    // Simulate an event
    const eventType = Math.random();
    if (eventType < 0.1) { // 10% chance of penalties
      console.log(`Penalty event triggered at ${elapsedTime.toFixed(2)} minutes`);
      handlePenaltyEvent(homeTeam, gameLog, penalizedPlayers);
    } else if (eventType < 0.15) { // 5% chance of injuries
      console.log(`Injury event triggered at ${elapsedTime.toFixed(2)} minutes`);
      handleInjuryEvent(awayTeam, gameLog);
    } else {
      simulateNormalPlay(homeTeam, awayTeam, gameLog, scores);
    }
  }
};

// Simulate overtime (sudden death)
const simulateOvertime = (homeTeam, awayTeam, overtimeDuration, gameLog, scores, penalizedPlayers, injuredPlayers) => {
  let elapsedTime = 0;

  while (elapsedTime < overtimeDuration) {
    const eventDuration = Math.random() * 1.5;
    elapsedTime += eventDuration;

    const eventType = Math.random();
    if (eventType < 0.1) {
      handlePenaltyEvent(homeTeam, gameLog, penalizedPlayers);
    } else if (eventType < 0.05) {
      handleInjuryEvent(awayTeam, gameLog, injuredPlayers);
    } else {
      const result = simulateOvertimePlay(homeTeam, awayTeam, gameLog);
      if (result.winner) {
        scores[result.winner === homeTeam ? 'home' : 'away'] += 1;
        return { overtimeWinner: result.winner };
      }
    }
  }

  return { overtimeWinner: null };
};

// Rotate lines for a team
export const rotateLines = (team) => {
  const forwardLines = team.lines.forwardLines || [];
  const defenseLines = team.lines.defenseLines || [];

  if (forwardLines.length > 0) {
    team.currentForwardLine = (team.currentForwardLine + 1) % forwardLines.length || 0;
  }

  if (defenseLines.length > 0) {
    team.currentDefenseLine = (team.currentDefenseLine + 1) % defenseLines.length || 0;
  }

  console.log(`Rotated lines for ${team.name}: Forward Line ${team.currentForwardLine}, Defense Line ${team.currentDefenseLine}`);
};

// Simulate overtime play
const simulateOvertimePlay = (homeTeam, awayTeam, gameLog) => {
  const shootingTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
  const defendingTeam = shootingTeam === homeTeam ? awayTeam : homeTeam;

  const scorer = getRandomEligiblePlayer(shootingTeam);
  const goalie = defendingTeam?.lines?.goalies?.starter;

  if (!scorer || !goalie) {
    gameLog.push('Error: Missing players for overtime.');
    return { winner: null };
  }

  const shotSuccess = calculateShotOutcome(scorer, goalie);
  if (shotSuccess) {
    gameLog.push(`${scorer.name} scores in overtime for ${shootingTeam.name}!`);
    return { winner: shootingTeam };
  } else {
    gameLog.push(`${scorer.name} shoots, but ${goalie.name} makes the save!`);
    return { winner: null };
  }
};

// Simulate normal game events like shots, passes, and goals
const simulateNormalPlay = (homeTeam, awayTeam, gameLog, scores) => {
  const shootingTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
  const defendingTeam = shootingTeam === homeTeam ? awayTeam : homeTeam;

  const scorer = getRandomEligiblePlayer(shootingTeam);
  const goalie = defendingTeam?.lines?.goalies?.starter;

  if (!scorer || !goalie) {
    gameLog.push('Error: Missing players for normal play.');
    return;
  }

  const shotSuccess = calculateShotOutcome(scorer, goalie);
  if (shotSuccess) {
    if (shootingTeam === homeTeam) scores.home += 1;
    else scores.away += 1;

    gameLog.push(`${scorer.name} scores for ${shootingTeam.name}!`);
    addAssist(shootingTeam, scorer, gameLog);
  } else {
    gameLog.push(`${scorer.name} shoots, but ${goalie.name} makes the save!`);
  }
};

// Calculate shot outcome
const calculateShotOutcome = (scorer, goalie) => {
  const shooterSkill = scorer.skills.wristShotAccuracy * 0.3
    + scorer.skills.wristShotPower * 0.2
    + scorer.skills.speed * 0.2
    + scorer.skills.hockeyIQ * 0.1;

  const goalieSkill = goalie.skills.glove * 0.3
    + goalie.skills.reflexes * 0.3
    + goalie.skills.positioning * 0.2
    + goalie.skills.agility * 0.2;

  const shotChance = shooterSkill / (shooterSkill + goalieSkill * 1.5);
  return Math.random() < shotChance;
};

// Get a random eligible player
const getRandomEligiblePlayer = (team) => {
  const eligiblePlayers = team.players.filter(player => player.position !== 'Starter' && player.position !== 'Backup' && !player.injured);
  return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)] || null;
};

// Add assist
const addAssist = (team, scorer, gameLog) => {
  const eligiblePlayers = team.players.filter(player => player.id !== scorer.id);
  if (eligiblePlayers.length > 0) {
    const assister = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    gameLog.push(`${assister.name} assisted on the goal by ${scorer.name}.`);
  }
};

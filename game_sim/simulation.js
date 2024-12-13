import { handlePenaltyEvent } from './penalties.js';
import { handleInjuryEvent, updateInjuryStatuses } from './injuries.js';
import { calculateAverageSkill } from './teams.js';

export const simulateGame = (homeTeam, awayTeam, lineAssignments) => {
  const gameLog = [];
  const scores = { home: 0, away: 0 };

  // Constants
  const SHIFT_DURATION = 2; // Shift duration in minutes
  const PERIOD_DURATION = 20; // Each period is 20 minutes
  const OVERTIME_DURATION = 5; // Overtime period (sudden death)

  // Helper Variables
let currentForwardLineHome = 0;
let currentDefenseLineHome = 0;
let currentForwardLineAway = 0;
let currentDefenseLineAway = 0;

  console.log(`Game starting between ${homeTeam.name} and ${awayTeam.name}`);

  // Define penalized players and injured players storage
  const penalizedPlayers = {};
  const injuredPlayers = {};

  // Update injury statuses before the game starts
  updateInjuryStatuses(homeTeam, gameLog);
  updateInjuryStatuses(awayTeam, gameLog);

  // Simulate regulation periods
  for (let period = 1; period <= 3; period++) {
    gameLog.push(`--- Period ${period} ---`);

    // Update injuries at the start of each period
    updateInjuryStatuses(homeTeam, gameLog);
    updateInjuryStatuses(awayTeam, gameLog);
    
    simulatePeriod(
      homeTeam,
      awayTeam,
      PERIOD_DURATION,
      SHIFT_DURATION,
      gameLog,
      scores,
      penalizedPlayers,
      injuredPlayers,
      currentForwardLineHome,
      currentDefenseLineHome,
      currentForwardLineAway,
      currentDefenseLineAway
    );
  }

  // Check for tie after regulation
  if (scores.home === scores.away) {
    gameLog.push(`--- Regulation Ends in a Tie ---`);
    gameLog.push(`Score: ${homeTeam.name} ${scores.home} - ${awayTeam.name} ${scores.away}`);
    gameLog.push(`--- Overtime ---`);

    // Simulate Overtime
    const result = simulateOvertime(
      homeTeam,
      awayTeam,
      OVERTIME_DURATION,
      gameLog,
      scores,
      penalizedPlayers,
      injuredPlayers,
      currentForwardLineHome,
      currentDefenseLineHome,
      currentForwardLineAway,
      currentDefenseLineAway
    );

    if (result.overtimeWinner) {
      gameLog.push(`${result.overtimeWinner.name} wins the game in overtime!`);
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
    if (elapsedTime % shiftDuration < eventDuration) {
      rotateLines(homeTeam);
      rotateLines(awayTeam);
      gameLog.push(`Line changes for both teams at ${elapsedTime.toFixed(2)} minutes.`);
    }

    // Simulate an event
    const eventType = Math.random();
    if (eventType < 0.2) {
      handlePenaltyEvent(homeTeam, gameLog, penalizedPlayers);
    } else if (eventType < 0.1) {
      handleInjuryEvent(awayTeam, gameLog, injuredPlayers);
    } else {
      simulateNormalPlay(homeTeam, awayTeam, gameLog, scores);
    }
  }
};

// Simulate overtime (sudden death)
const simulateOvertime = (homeTeam, awayTeam, gameLog, scores) => {
  let elapsedTime = 0;
  const overtimeWinner = null;

  while (elapsedTime < OVERTIME_DURATION) {
    const eventDuration = Math.random() * 1.5;
    elapsedTime += eventDuration;

    const eventType = Math.random();
    if (eventType < 0.2) {
      handlePenaltyEvent(homeTeam, gameLog, {});
    } else if (eventType < 0.1) {
      handleInjuryEvent(awayTeam, gameLog, {});
    } else {
      const result = simulateOvertimePlay(homeTeam, awayTeam, gameLog);
      if (result.winner) {
        scores[result.winner === homeTeam ? "home" : "away"] += 1;
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

  if (forwardLines.length === 0 || defenseLines.length === 0) {
    console.error(`Team ${team.name} has no valid lines to rotate.`);
    return;
  }

  // Cycle forward and defense lines
  team.currentForwardLine = (team.currentForwardLine + 1) % forwardLines.length;
  team.currentDefenseLine = (team.currentDefenseLine + 1) % defenseLines.length;

  console.log(`Rotated lines for ${team.name}: Forward Line ${team.currentForwardLine}, Defense Line ${team.currentDefenseLine}`);
};

// Simulate overtime play
const simulateOvertimePlay = (homeTeam, awayTeam, gameLog) => {
  const shootingTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
  const defendingTeam = shootingTeam === homeTeam ? awayTeam : homeTeam;

  const scorer = shootingTeam.players.find(player => player.position !== 'Starter' && player.position !== 'Backup');
  const goalie = defendingTeam.lines.goalies.starter;

  if (!scorer || !goalie) {
    gameLog.push(`Error: Missing players for overtime.`);
    return { winner: null };
  }

  const shooterSkill = scorer.skills.wristShotAccuracy * 0.3 
                     + scorer.skills.wristShotPower * 0.2 
                     + scorer.skills.speed * 0.2 
                     + scorer.skills.hockeyIQ * 0.1;
  const goalieSkill = goalie.skills.glove * 0.3 
                    + goalie.skills.reflexes * 0.3 
                    + goalie.skills.positioning * 0.2 
                    + goalie.skills.agility * 0.2;

  const shotSuccessChance = shooterSkill / (shooterSkill + goalieSkill);
  const shotOutcome = Math.random() < shotSuccessChance;

  if (shotOutcome) {
    gameLog.push(`${scorer.name} shoots and scores!`);
    addAssist(shootingTeam, scorer, gameLog);
    return { winner: shootingTeam };
  } else {
    gameLog.push(`${scorer.name} shoots, but ${goalie.name} makes a save!`);
    return { winner: null };
  }
};

// Simulate normal game events like shots, passes, and goals
const simulateNormalPlay = (homeTeam, awayTeam, gameLog, scores) => {
  if (!homeTeam || !awayTeam) return;
  
  const shootingTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
  const defendingTeam = shootingTeam === homeTeam ? awayTeam : homeTeam;
  const goalie = defendingTeam?.lines?.goalies?.starter;

  if (!shootingTeam?.players?.length || !defendingTeam?.players?.length) {
    console.error('One of the teams does not have valid players.');
    return;
  }

  // exclude goalies & injured
  const eligibleScorers = shootingTeam.players.filter(player => 
    player.position !== 'Starter' && player.position !== 'Backup' && !player.injured
  );

  if (!eligibleScorers.length) {
    console.error(`${shootingTeam.name} has no eligible scorers.`);
    return;
  }
  
  const scorer = eligibleScorers[Math.floor(Math.random() * eligibleScorers.length)];
  const defender = defendingTeam.players[Math.floor(Math.random() * defendingTeam.players.length)];

  if (!scorer?.skills || typeof scorer.skills.wristShotAccuracy !== 'number') {
    console.error('Invalid scorer or scorer skills:', scorer);
    return;
  }

  if (!goalie?.skills || typeof goalie.skills.glove !== 'number') {
    console.error('Invalid goalie or goalie skills:', goalie);
    return;
  }

  // Defensive play chance
  const defenseSkill = defender.skills.stickChecking * 0.4 + defender.skills.defense * 0.6;
  const defenseEffectiveness = defenseSkill / 150;
  const blockOrTurnover = Math.random() < defenseEffectiveness;

  if (blockOrTurnover) {
    gameLog.push(`${defender.name} blocks the shot or forces a turnover!`);
    return; // No shot occurs if defense is successful
  }

  // Shooter and goalie skills
  const shooterSkill = scorer.skills.wristShotAccuracy * 0.3 
                     + scorer.skills.wristShotPower * 0.3 
                     + scorer.skills.slapShotAccuracy * 0.2 
                     + scorer.skills.slapShotPower * 0.1;
                     + scorer.skills.speed * 0.1
                     + scorer.skills.hockeyIQ * 0.1;
  const goalieSkill = goalie.skills.glove * 0.2 
                    + goalie.skills.legs * 0.2 
                    + goalie.skills.positioning * 0.2 
                    + goalie.skills.reflexes * 0.2
                    + goalie.skills.agility * 0.2;

  const shotSuccessChance = shooterSkill / (shooterSkill + goalieSkill * 1.5);
  const baselineSaveChance = 0.2;
  const shotOutcome = Math.random() < shotSuccessChance;

   if (shotOutcome) {
      if (shootingTeam === homeTeam) scores.home += 1;
      else scores.away += 1;
  
      gameLog.push(`${scorer.name} scores a goal for ${shootingTeam.name}!`);
      addAssist(shootingTeam, scorer, gameLog);
    } else {
      gameLog.push(`${scorer.name} took a shot, but ${goalie.name} makes a save!`);
    }
  };

// Helper function to simulate assists
const addAssist = (team, scorer, gameLog) => {
  const eligiblePlayers = team.players.filter(player => player.id !== scorer.id);
  if (eligiblePlayers.length > 0) {
    const assister = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    gameLog.push(`${assister.name} assisted on the goal by ${scorer.name}.`);
  }
};

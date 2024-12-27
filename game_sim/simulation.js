import { handlePenaltyEvent, updatePenaltyStatuses } from './penalties.js';
import { handleInjuryEvent, updateInjuryStatuses, saveTeamData } from './injuries.js';
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
  const penalizedPlayers = {
    home: {},
    away: {}
  };
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
      // Add the shootout after a tie in overtime
      const shootoutResult = simulateShootout(homeTeam, awayTeam);
      gameLog.push(`Shootout results:`);
      gameLog.push(`${homeTeam.name} ${shootoutResult.homeGoals} - ${awayTeam.name} ${shootoutResult.awayGoals}`);
      if (shootoutResult.winner) {
        gameLog.push(`${shootoutResult.winner} wins the shootout and the game!`);
      } else {
        gameLog.push(`The shootout ends in a tie!`);
      }
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
    const eventDuration = Math.random() * 2.5; // Random event duration up to 2.5 minutes
    elapsedTime += eventDuration;

    // Rotate lines if a shift ends
    if (Math.floor(elapsedTime / shiftDuration) > Math.floor((elapsedTime - eventDuration) / shiftDuration)) {
      rotateLines(homeTeam);
      rotateLines(awayTeam);
      gameLog.push(`Line changes for both teams at ${elapsedTime.toFixed(2)} minutes.`);
    }

const eventType = Math.random();
    if (eventType < 0.1) { // 10% chance of penalty
      handlePenaltyEvent(homeTeam, gameLog, penalizedPlayers.home);
    } else if (eventType < 0.15) { // 5% chance of injury
      handleInjuryEvent(awayTeam, gameLog);
      saveTeamData(awayTeam);
    } else if (eventType < 0.25) { // 10% chance for a turnover
      if (handleTurnover(homeTeam, awayTeam, gameLog)) {
        continue; // Skip the rest of the event if a turnover occurs
      }
    } else if (eventType < 0.35) { // 10% chance for a hit
      simulateHit(homeTeam, gameLog);
    } else if (eventType < 0.45) { // 10% chance for a breakaway
      simulateBreakaway(homeTeam, awayTeam, gameLog, scores);
    } else { // Remaining chance for normal play
      simulateNormalPlay(homeTeam, awayTeam, gameLog, scores);
    }

    // Update penalties
    updatePenaltyStatuses(penalizedPlayers.home, gameLog);
    updatePenaltyStatuses(penalizedPlayers.away, gameLog);

    // Handle empty net scenario if applicable
    handleEmptyNet(homeTeam, elapsedTime, scores, gameLog);
    handleEmptyNet(awayTeam, elapsedTime, scores, gameLog);
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
      handlePenaltyEvent(homeTeam, gameLog, penalizedPlayers.home);
    } else if (eventType < 0.03) {
      handleInjuryEvent(awayTeam, gameLog, injuredPlayers);
    } else if (eventType < 0.1) { // 10% chance for a breakaway
      simulateBreakaway(homeTeam, awayTeam, gameLog, scores);
    } else if (eventType < 0.2) { // 10% chance for a faceoff
      simulateFaceoff(homeTeam, awayTeam, gameLog);
    } else {
      const result = simulateOvertimePlay(homeTeam, awayTeam, gameLog);
      if (result.winner) {
        scores[result.winner === homeTeam ? 'home' : 'away'] += 1;
        return { overtimeWinner: result.winner };
      }
    }

    // Handle empty net situation
    handleEmptyNet(homeTeam, elapsedTime, scores, gameLog);
    handleEmptyNet(awayTeam, elapsedTime, scores, gameLog);
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

  // Check for breakaway
  simulateBreakaway(shootingTeam, defendingTeam, gameLog, scores);

  const shotSuccess = calculateShotOutcome(scorer, goalie);
  if (shotSuccess) {
    scores[shootingTeam === homeTeam ? 'home' : 'away'] += 1;
    gameLog.push(`${scorer.name} scores for ${shootingTeam.name}!`);
    addAssist(shootingTeam, scorer, gameLog);
  } else {
    gameLog.push(`${scorer.name} shoots, but ${goalie.name} makes the save!`);
  }

  // Handle empty net scenario
  handleEmptyNet(homeTeam, 0, scores, gameLog); // Use 0 for time as we're in normal play
  handleEmptyNet(awayTeam, 0, scores, gameLog);
};

// Calculate shot outcome
const calculateShotOutcome = (scorer, goalie, isBreakaway = false) => {
  const shooterSkill = scorer.skills.wristShotAccuracy * 0.3
    + scorer.skills.wristShotPower * 0.2
    + scorer.skills.speed * 0.3 // Increased weight for speed on breakaways
    + (isBreakaway ? scorer.skills.deking * 0.2 : scorer.skills.hockeyIQ * 0.1);

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

const adjustLinesForSpecialTeams = (team, penalizedPlayers) => {
  const activePenalties = Object.values(penalizedPlayers).filter(p => p.player.team === team.name);
  if (activePenalties.length > 0) {
    // Use penalty kill lines for the team with active penalties
    return team.lines.penaltyKillUnits[0]; // Example: Use the first penalty kill unit
  } else {
    return team.lines.forwardLines[0]; // Example: Use the first forward line
  }
};

const handleTurnover = (teamWithPuck, defendingTeam, gameLog) => {
  const turnoverChance = Math.random(); // Random chance for a turnover
  if (turnoverChance < 0.2) { // 20% chance of turnover
    const playerLosingPuck = getRandomEligiblePlayer(teamWithPuck);
    const playerGainingPuck = getRandomEligiblePlayer(defendingTeam);

    if (playerLosingPuck && playerGainingPuck) {
      gameLog.push(`${playerLosingPuck.name} loses the puck to ${playerGainingPuck.name}.`);
      return true; // Turnover occurred
    }
  }
  return false; // No turnover
};

const simulateHit = (defendingTeam, gameLog) => {
  const hitChance = Math.random();
  if (hitChance < 0.1) { // 10% chance of a hit
    const hitter = getRandomEligiblePlayer(defendingTeam);
    const target = getRandomEligiblePlayer(defendingTeam); // Could target opponent or mishit
    if (hitter && target) {
      gameLog.push(`${hitter.name} delivers a hit to ${target.name}.`);
      if (Math.random() < 0.05) { // 5% chance of penalty due to hit
        handlePenaltyEvent(defendingTeam, gameLog, penalizedPlayers);
      }
    }
  }
};

const simulateFaceoff = (homeTeam, awayTeam, gameLog) => {
  const homeCenter = homeTeam.lines.forwardLines[0].C; // Current center
  const awayCenter = awayTeam.lines.forwardLines[0].C;

  if (!homeCenter || !awayCenter) {
    gameLog.push("Error: Missing players for faceoff.");
    return homeTeam; // Default possession
  }

  const homeFaceoffSkill = homeCenter.skills.faceoffs || 50;
  const awayFaceoffSkill = awayCenter.skills.faceoffs || 50;

  const homeWinChance = homeFaceoffSkill / (homeFaceoffSkill + awayFaceoffSkill);
  const winner = Math.random() < homeWinChance ? homeTeam : awayTeam;

  gameLog.push(`${winner.name} wins the faceoff.`);
  return winner;
};

const simulateBreakaway = (shootingTeam, defendingTeam, gameLog, scores) => {
  const breakawayChance = Math.random();
  if (breakawayChance < 0.05) { // 5% chance of breakaway
    const scorer = getRandomEligiblePlayer(shootingTeam);
    const goalie = defendingTeam?.lines?.goalies?.starter;

    if (scorer && goalie) {
      gameLog.push(`${scorer.name} breaks away for a one-on-one with ${goalie.name}!`);
      const shotSuccess = calculateShotOutcome(scorer, goalie, true); // True for breakaway modifier
      if (shotSuccess) {
        scores[shootingTeam === homeTeam ? 'home' : 'away'] += 1;
        gameLog.push(`${scorer.name} scores on the breakaway!`);
        addAssist(shootingTeam, scorer, gameLog);
      } else {
        gameLog.push(`${goalie.name} makes a spectacular save on the breakaway!`);
      }
    }
  }
};

const handleEmptyNet = (team, gameTime, scores, gameLog) => {
  if (gameTime >= 58 && scores[team === homeTeam ? 'home' : 'away'] < scores[team === homeTeam ? 'away' : 'home']) {
    team.lines.goalies.starter = null; // Pull goalie
    team.extraAttacker = getRandomEligiblePlayer(team); // Add extra attacker
    gameLog.push(`${team.name} pulls their goalie for an extra attacker!`);
  }
};

const simulateShootout = (homeTeam, awayTeam) => {
  const maxRounds = 5; // The maximum rounds for the shootout
  let homeGoals = 0;
  let awayGoals = 0;

  let round = 0;
  
  // Function to simulate a player's shot on goal
  const simulateShot = (player) => {
    // A simple random chance to determine if the shot is a goal, based on player's shooting skill
    const skill = player.skills.shot; // Assume skill has a "shot" attribute
    const chance = Math.random() * 100; // Random number between 0 and 100
    
    return chance < skill; // If the random number is less than the player's skill, it's a goal
  };

  // Alternate shots between home and away teams
  while (round < maxRounds && homeGoals === awayGoals) {
    // Home team shot
    const homePlayer = homeTeam.players[Math.floor(Math.random() * homeTeam.players.length)];
    if (simulateShot(homePlayer)) {
      homeGoals++;
    }

    // Away team shot
    const awayPlayer = awayTeam.players[Math.floor(Math.random() * awayTeam.players.length)];
    if (simulateShot(awayPlayer)) {
      awayGoals++;
    }

    round++;
  }

  // Determine the winner
  let winner = null;
  if (homeGoals > awayGoals) {
    winner = homeTeam.name;
  } else if (awayGoals > homeGoals) {
    winner = awayTeam.name;
  }

  // Output the results of the shootout
  return {
    homeGoals,
    awayGoals,
    winner
  };
};


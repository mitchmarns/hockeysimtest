import { handlePenaltyEvent } from './penalties.js';
import { handleInjuryEvent } from './injuries.js';
import { calculateAverageSkill } from './teams.js';

export const simulateGame = (homeTeam, awayTeam, lineAssignments) => {
  const gameLog = [];
  const scores = { home: 0, away: 0 };

  console.log(`Game starting between ${homeTeam.name} and ${awayTeam.name}`);

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
      } else if (eventType < 0.1) {
        // Handle Injury Event
        handleInjuryEvent(awayTeam, gameLog, injuredPlayers);
      } else if (eventType < 0.7) {
        // Simulate Shots/Goals
        simulateNormalPlay(homeTeam, awayTeam, gameLog, scores);
      } else {
        const shootingTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
        const defendingTeam = shootingTeam === homeTeam ? awayTeam : homeTeam;

        const goalie = defendingTeam.lines.goalies.starter;
        if (!goalie) {
          gameLog.push(`Error: ${defendingTeam.name} does not have a valid goalie.`);
          return { gameLog, scores };
        }

        gameLog.push(`${shootingTeam.name} attempts a shot against ${goalie.name}`);
      }
    }
  }
  // Check for tie after regulation
  if (scores.home === scores.away) {
    gameLog.push(`--- Regulation Ends in a Tie ---`);
    gameLog.push(`Score: ${homeTeam.name} ${scores.home} - ${awayTeam.name} ${scores.away}`);
    
    // Simulate Overtime
    gameLog.push(`--- Overtime ---`);
    let overtimeWinner = null;
    const maxOvertimeEvents = Math.floor(Math.random() * 5) + 5;

    for (let j = 0; j < maxOvertimeEvents; j++) {
      const eventType = Math.random();

      if (eventType < 0.2) {
        handlePenaltyEvent(homeTeam, gameLog, penalizedPlayers);
      } else if (eventType < 0.1) {
        handleInjuryEvent(awayTeam, gameLog, injuredPlayers);
      } else {
        const result = simulateOvertimePlay(homeTeam, awayTeam, gameLog);
        if (result.winner) {
          scores[result.winner === homeTeam ? 'home' : 'away'] += 1;
          overtimeWinner = result.winner;
          gameLog.push(`${result.winner.name} scores in overtime to win the game!`);
          break; // Sudden death
        }
      }
    }

    if (!overtimeWinner) {
      gameLog.push(`No goals in overtime. The game ends in a tie!`);
    }
  }
  
  // Add final score to the game log
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

  const shooterSkill = scorer.skills.wristShotAccuracy * 0.4 
                     + scorer.skills.wristShotPower * 0.3 
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

  // Filter eligible shooters (exclude goalies)
  const eligibleScorers = shootingTeam.players.filter(player => 
    player.position !== 'Starter' && player.position !== 'Backup'
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
  const defenseChance = defender.skills.stickChecking * 0.3 + defender.skills.defense * 0.2;
  const blockOrTurnover = Math.random() < defenseChance / 100;

  if (blockOrTurnover) {
    gameLog.push(`${defender.name} blocks the shot or forces a turnover!`);
    return; // No shot occurs if defense is successful
  }

  // Shooter and goalie skills
  const shooterSkill = scorer.skills.wristShotAccuracy * 0.4 
                     + scorer.skills.wristShotPower * 0.4 
                     + scorer.skills.slapShotAccuracy * 0.2 
                     + scorer.skills.slapShotPower * 0.1;
                     + scorer.skills.speed * 0.1
                     + scorer.skills.hockeyIQ * 0.1;
  const goalieSkill = goalie.skills.glove * 0.2 
                    + goalie.skills.legs * 0.2 
                    + goalie.skills.positioning * 0.2 
                    + goalie.skills.reflexes * 0.2
                    + goalie.skills.agility * 0.2;

  const shotSuccessChance = shooterSkill / (shooterSkill + goalieSkill);
  const shotOutcome = Math.random() < shotSuccessChance;

   if (shotOutcome) {
      if (shootingTeam === homeTeam) scores.home += 1;
      else scores.away += 1;
  
      gameLog.push(`${scorer.name} scores a goal for ${shootingTeam.name}!`);
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


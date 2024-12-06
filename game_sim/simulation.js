import { handlePenaltyEvent } from './penalties.js';
import { handleInjuryEvent } from './injuries.js';
import { calculateAverageSkill } from './teams.js';

export const simulateGame = (homeTeam, awayTeam, lineAssignments) => {
  const gameLog = [];
  const scores = { home: 0, away: 0 };

  if (!homeTeam || !awayTeam) {
    console.error('One or both teams are undefined.');
    console.error('Home Team:', homeTeam);
    console.error('Away Team:', awayTeam);
    return { gameLog, scores };
  }

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

  return { gameLog, scores };
};

// Simulate normal game events like shots, passes, and goals
const simulateNormalPlay = (homeTeam, awayTeam, gameLog, scores) => {
  if (!homeTeam || !awayTeam) return;
  
  const shootingTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
  const defendingTeam = shootingTeam === homeTeam ? awayTeam : homeTeam;

  if (!shootingTeam?.players?.length || !defendingTeam?.players?.length) {
    console.error('One of the teams does not have valid players.');
    return;
  }
  
  const defendingGoalie = defendingTeam.lines.goalies.starter;
  
  if (!defendingGoalie) {
    gameLog.push(`Error: ${defendingTeam.name} does not have a valid goalie.`);
    return;
  }

  // Choose shooter and defender
  const scorer = shootingTeam.players[Math.floor(Math.random() * shootingTeam.players.length)];
  const defender = defendingTeam.players[Math.floor(Math.random() * defendingTeam.players.length)];

  if (!scorer || !defender) {
    gameLog.push('Error: Missing shooter or defender.');
    return;
  }

  // Defensive play chance
  const defenseChance = defender.skills.stick * 0.3 + defender.skills.speed * 0.2;
  const blockOrTurnover = Math.random() < defenseChance / 100;

  if (blockOrTurnover) {
    gameLog.push(`${defender.name} blocks the shot or forces a turnover!`);
    return; // No shot occurs if defense is successful
  }

  // Calculate shot accuracy
  const shooterSkill = scorer.skills.speed * 0.5 + scorer.skills.stick * 0.5;
  const goalieSkill = goalie.skills.glove * 0.5 + goalie.skills.legs * 0.5;

  const shotSuccessChance = (shooterSkill - goalieSkill + 50) / 100; // Normalize to 0-1 range
  const shotOutcome = Math.random() < shotSuccessChance;

   if (shotOutcome) {
      if (shootingTeam === homeTeam) scores.home += 1;
      else scores.away += 1;
  
      gameLog.push(`${shooter.name} scores a goal for ${shootingTeam.name}!`);
    } else {
      gameLog.push(`${shooter.name} took a shot, but ${goalie.name} makes a save!`);
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


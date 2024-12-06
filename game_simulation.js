// Load players from localStorage
const loadPlayersFromStorage = () => {
    const playersData = localStorage.getItem("playersData"); 
    if (playersData) {
        try {
            return JSON.parse(playersData).players || []; 
        } catch (error) {
            console.error("Error parsing players data from localStorage", error);
            return [];  
        }
    }
    return [];  
};

// Group players by team
const groupPlayersByTeam = (players) => {
  const teams = {};  
  players.forEach(player => {
    if (player.team && player.team.trim()) { 
      if (!teams[player.team]) {  
        teams[player.team] = { name: player.team, players: [] };  
      }
      teams[player.team].players.push(player);  
    }
  });
  return teams;
};

// Load players and group them by team
const players = loadPlayersFromStorage();
const teams = groupPlayersByTeam(players);

// Load line assignments from localStorage
const lineAssignments = JSON.parse(localStorage.getItem('lineAssignments')) || {};

function getLineAssignments(teamName) {
    return (lineAssignments && lineAssignments[teamName]) || [];
}

let gameLog = []; // Store play-by-play logs
let scores = { home: 0, away: 0 }; // Track scores
let injuries = []; // Track injured players
let penalties = []; // Track penalties
let penalizedPlayers = {};  // Track players currently serving penalties
let injuredPlayers = {};    // Track injured players and their recovery

// Random event helpers
const getRandomInt = (max) => Math.floor(Math.random() * max);

// Helper to calculate player skill
const calculateAverageSkill = (player) => {
  return (player.skills.glove + player.skills.stick + player.skills.legs + player.skills.speed) / 4;
};

// Goalie save check
const goalieSaveCheck = (goalie, shooter) => {
  const shooterSkill = calculateAverageSkill(shooter);
  const goalieSkill = calculateAverageSkill(goalie);
  const saveChance = goalieSkill / (goalieSkill + shooterSkill);
    
  return Math.random() < saveChance; //
};

// Penalty durations
const PENALTY_DURATIONS = {
  "Minor": 2 * 60,       // 2 minutes
  "Major": 5 * 60,       // 5 minutes
  "Double Minor": 4 * 60, // 4 minutes
  "Misconduct": 10 * 60,  // 10 minutes
  "Game Misconduct": -1,  // Player is ejected (no specific time duration)
  "Match": -1             // Player is ejected (no specific time duration)
};

// possible penalty types
const PENALTY_TYPES = [
  "Minor",
  "Major",
  "Double Minor",
  "Misconduct",
  "Game Misconduct",
  "Match"
];

// Weighted probabilities for penalties
const PENALTY_WEIGHTS = {
  "Minor": 70,       // 70% chance
  "Double Minor": 15, // 15% chance
  "Major": 10,       // 10% chance
  "Misconduct": 3,   // 3% chance
  "Game Misconduct": 1, // 1% chance
  "Match": 1         // 1% chance
};

// Select a penalty type based on the weights
function getRandomPenaltyType() {
  const totalWeight = Object.values(PENALTY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const randomValue = getRandomInt(totalWeight);
  let cumulativeWeight = 0;

  for (const [penaltyType, weight] of Object.entries(PENALTY_WEIGHTS)) {
    cumulativeWeight += weight;
    if (randomValue < cumulativeWeight) {
      return penaltyType;
    }
  }
  return "Minor"; // Default to Minor if something goes wrong
}

// Random penalty event
function handlePenaltyEvent(team, eventLog) {
  const penalizedPlayer = team.players[getRandomInt(team.players.length)];
  const penaltyType = getRandomPenaltyType();
  let penaltyDuration = PENALTY_DURATIONS[penaltyType];
  
  // If the penalty is for misconduct or game/match misconduct, the player is ejected
  if (penaltyType === "Game Misconduct" || penaltyType === "Match") {
    penalizedPlayers[penalizedPlayer.id] = {
      player: penalizedPlayer,
      penaltyEndTime: -1,  // No penalty time; player is ejected
    };
    eventLog.push(`${penalizedPlayer.name} took a ${penaltyType} and is ejected from the game!`);
  } else {
    // For minor, major, double minor, or misconduct, track penalty duration
    penalizedPlayers[penalizedPlayer.id] = {
      player: penalizedPlayer,
      penaltyEndTime: Date.now() + penaltyDuration * 1000,  // store the end time of the penalty
    };
    eventLog.push(`${penalizedPlayer.name} took a ${penaltyType} for ${penaltyDuration / 60} minutes!`);
  }
  
  return eventLog;
}

// Filter out penalized players when selecting a shooter
function getEligiblePlayers(team) {
  return team.players.filter(player => !penalizedPlayers[player.id]);
}

// Check if a player is still penalized (based on the current game time)
function checkForPenaltyExpiry() {
  const currentTime = Date.now();
  Object.keys(penalizedPlayers).forEach(playerId => {
    const penalty = penalizedPlayers[playerId];
    if (penalty.penaltyEndTime !== -1 && currentTime >= penalty.penaltyEndTime) {
      // The penalty has expired, remove the player from the penalized list
      const player = penalty.player;
      delete penalizedPlayers[playerId];
      console.log(`${player.name}'s penalty has expired, they are now eligible to play again.`);
    }
    // If the penalty is a game or match misconduct, player is ejected, no time to check for expiry
  });
}

// Injury event with severity
function handleInjuryEvent(team, eventLog) {
  const injuredPlayer = team.players[getRandomInt(team.players.length)];
  
  // Random injury severity (1: minor, 2: moderate, 3: serious)
  const injurySeverity = getRandomInt(3) + 1;
  
  // Set recovery time based on injury severity
  let recoveryTime;
  switch (injurySeverity) {
    case 1: recoveryTime = 60 * 5;  // 5 minutes for minor injury
      break;
    case 2: recoveryTime = 60 * 10;  // 10 minutes for moderate injury
      break;
    case 3: recoveryTime = 60 * 20;  // 20 minutes for serious injury
      break;
  }

  // Add the injured player to the injured players list with the recovery time
  injuredPlayers[injuredPlayer.id] = {
    player: injuredPlayer,
    recoveryEndTime: Date.now() + recoveryTime * 1000,  // store the end time of the injury
  };

  eventLog.push(`${injuredPlayer.name} was injured and is out for ${recoveryTime / 60} minutes!`);
  return eventLog;
}

// Check if an injured player has recovered (based on the current game time)
function checkForPlayerRecovery() {
  const currentTime = Date.now();
  Object.keys(injuredPlayers).forEach(playerId => {
    const injury = injuredPlayers[playerId];
    if (currentTime >= injury.recoveryEndTime) {
      // The injury recovery is complete, remove the player from the injured list
      const player = injury.player;
      delete injuredPlayers[playerId];
      console.log(`${player.name} has recovered and is available to play again.`);
    }
  });
}

// Handle goal event
const handleGoalEvent = (scoringTeamName, lineAssignments, homeTeam, awayTeam) => {
  const forwardLineNumber = getRandomInt(4) + 1;  // Randomly select a forward line
  const lineKeys = ["LW", "C", "RW"].map(
    pos => `${scoringTeamName}-forward-${forwardLineNumber}-${pos}`
  );
  const linePlayerIDs = lineKeys.map(key => lineAssignments[key]).filter(id => id);

  if (linePlayerIDs.length === 0) {
    console.warn(`No active line found for team: ${scoringTeamName}`);
    return null;
  }

  const scoringTeam = scoringTeamName === homeTeam.name ? homeTeam : awayTeam;
  const players = linePlayerIDs
    .map(id => scoringTeam.players.find(player => player.id == id))
    .filter(player => player && !penalizedPlayers[player.id]);

  const scorer = players[getRandomInt(players.length)];
  let assist1 = null;
  let assist2 = null;

  // Randomly determine assists
  if (players.length > 1 && Math.random() < 0.7) {
    do {
      assist1 = players[getRandomInt(players.length)];
    } while (assist1 === scorer);
  }
  if (players.length > 2 && assist1 && Math.random() < 0.5) {
    do {
      assist2 = players[getRandomInt(players.length)];
    } while (assist2 === scorer || assist2 === assist1);
  }

  const goalie = scoringTeamName === homeTeam.name 
    ? awayTeam.players.find(player => player.position === "Starter") 
    : homeTeam.players.find(player => player.position === "Starter");

  if (goalieSaveCheck(goalie, scorer)) {
    return `Save by ${goalie.name}, no goal scored.`;
  } else {
    let playDescription = `Goal scored by ${scorer.name}`;
    if (assist1) playDescription += `, assisted by ${assist1.name}`;
    if (assist2) playDescription += ` and ${assist2.name}`;
    return playDescription;
  }
};

// Simulate period with early exit for overtime
const simulatePeriod = (homeTeam, awayTeam, isOvertime = false) => {
  let plays = [];
  const maxEvents = getRandomInt(6) + 7;  // Random number of events between 10 and 25
  let periodGoals = 0;  // Track the goals scored in this period

  for (let i = 0; i < maxEvents; i++) {
    const event = Math.random();
    
    if (event < 0.1) {
      // Handle penalty event
      if (Math.random() < 0.5) {
        plays = handlePenaltyEvent(homeTeam, plays);
      } else {
        plays = handlePenaltyEvent(awayTeam, plays);
      }
    } else if (event < 0.5) {
      // Goal event
      const scoringTeamName = Math.random() < 0.5 ? homeTeam.name : awayTeam.name;
      const goalPlay = handleGoalEvent(scoringTeamName, lineAssignments, homeTeam, awayTeam);
      
      if (goalPlay) {
        plays.push(goalPlay);
        if (scoringTeamName === homeTeam.name) {
          scores.home++;
        } else {
          scores.away++;
        }
        periodGoals++;  // Increment period goal counter

        // If it's overtime, end the game after a goal
        if (isOvertime) {
          break;
        }
      }
    } else if (event < 0.7) {
      // Handle injury event
      if (Math.random() < 0.5) {
        plays = handleInjuryEvent(homeTeam, plays);
      } else {
        plays = handleInjuryEvent(awayTeam, plays);
      }
    } else {
      // Neutral play
      plays.push("A neutral play occurred.");
    }
    // Periodically check for expired penalties or recovered players
    checkForPenaltyExpiry();
    checkForPlayerRecovery();
  }

  return plays;
};

// Main game simulation
const simulateGame = () => {
  gameLog = [];  // Reset game log
  scores = { home: 0, away: 0 };  // Reset scores
  
  const teamNames = Object.keys(teams); // Get an array of team names
  let homeTeamName, awayTeamName;

  // Loop until home and away teams are different
  do {
    homeTeamName = teamNames[getRandomInt(teamNames.length)];
    awayTeamName = teamNames[getRandomInt(teamNames.length)];
  } while (homeTeamName === awayTeamName);  // Ensure home and away teams are different

  const homeTeam = teams[homeTeamName];
  const awayTeam = teams[awayTeamName];

  gameLog.push(`Game start: ${homeTeamName} vs. ${awayTeamName}`);
    
  for (let i = 1; i <= 3; i++) {
    gameLog.push(`--- Period ${i} ---`);
    gameLog = gameLog.concat(simulatePeriod(homeTeam, awayTeam));
  }
  gameLog.push(`End of regulation: ${homeTeamName} ${scores.home} - ${scores.away} ${awayTeamName}`);
  
  // Check for tie and add overtime if needed
  if (scores.home === scores.away) {
    gameLog.push("Game is tied, starting overtime!");
    let overtimePeriod = simulatePeriod(homeTeam, awayTeam, true);  // Pass 'true' to simulate overtime
    gameLog.push(`--- Overtime ---`);
    gameLog = gameLog.concat(overtimePeriod);

    if (scores.home > scores.away) {
      gameLog.push(`${homeTeamName} wins in overtime! Final Score: ${scores.home} - ${scores.away}`);
    } else {
      gameLog.push(`${awayTeamName} wins in overtime! Final Score: ${scores.away} - ${scores.home}`);
    }
  } else {
    if (scores.home > scores.away) {
      gameLog.push(`${homeTeamName} wins! Final Score: ${scores.home} - ${scores.away}`);
    } else {
      gameLog.push(`${awayTeamName} wins! Final Score: ${scores.away} - ${scores.home}`);
    }
  }

  // Display the final game log
  displayGameLog();
};

// Display the game log
const displayGameLog = () => {
  const gameOutput = document.getElementById('game-output');
  gameOutput.innerHTML = gameLog.map(play => `<p>${play}</p>`).join('');
};

// Start the game
document.getElementById('start-game').addEventListener('click', simulateGame);

// Start the game
document.getElementById('start-game').addEventListener('click', simulateGame);

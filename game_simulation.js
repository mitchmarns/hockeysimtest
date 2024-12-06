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
  const saveChance = goalieSkill - shooterSkill;
  const randomChance = Math.random() * 100;
  const goalThreshold = 50 + (saveChance * 2);  
  
  return randomChance > goalThreshold; 
};

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
    .filter(player => player);

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
  const maxEvents = getRandomInt(15) + 10;  // Random number of events between 10 and 25
  let periodGoals = 0;  // Track the goals scored in this period

  for (let i = 0; i < maxEvents; i++) {
    const event = Math.random();
    
    if (event < 0.2) {
      // Penalty event
      const team = Math.random() < 0.5 ? homeTeam : awayTeam;
      const penalizedPlayer = team.players[getRandomInt(team.players.length)];
      plays.push(`${penalizedPlayer.name} took a penalty!`);
      penalties.push(penalizedPlayer);
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
      // Injury event
      const team = Math.random() < 0.5 ? homeTeam : awayTeam;
      const injuredPlayer = team.players[getRandomInt(team.players.length)];
      plays.push(`${injuredPlayer.name} was injured and is out of the game!`);
      injuries.push(injuredPlayer);
    } else {
      // Neutral play
      plays.push("A neutral play occurred.");
    }
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

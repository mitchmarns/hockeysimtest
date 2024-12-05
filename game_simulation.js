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
function groupPlayersByTeam(players) {
  const teams = {};  
  players.forEach(player => {
    if (player.team) {  
      if (!teams[player.team]) {  
        teams[player.team] = { name: player.team, players: [] };  // Add 'players' as an array
      }
      teams[player.team].players.push(player);  // Add player to the team's 'players' array
    }
  });
  return teams;
}

// Load players and group them by team
const players = loadPlayersFromStorage();
const teams = groupPlayersByTeam(players);


function getLineAssignments(teamName) {
    const lineAssignments = JSON.parse(localStorage.getItem('lineAssignments'));
    return (lineAssignments && lineAssignments[teamName]) || [];
}

let gameLog = []; // Store play-by-play logs
let scores = { home: 0, away: 0 }; // Track scores
let injuries = []; // Track injured players
let penalties = []; // Track penalties

// Random event helpers
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function calculateSkill(player) {
  return (player.skills.glove + player.skills.stick + player.skills.legs + player.skills.speed) / 8;
}

function goalieSaveCheck(goalie, shooter) {
  const shooterSkill = (shooter.skills.glove + shooter.skills.stick + shooter.skills.legs + shooter.skills.speed) / 4;
  const goalieSkill = (goalie.skills.glove + goalie.skills.stick + goalie.skills.legs + goalie.skills.speed) / 4;

  const saveChance = goalieSkill - shooterSkill; // Positive means goalie is more likely to save
  const randomChance = Math.random() * 100; // Random number between 0 and 100
  
  return randomChance < saveChance; // If saveChance is greater than the random value, goalie saves
}

// Simulate period
function simulatePeriod(homeTeam, awayTeam) {
  let plays = [];
  for (let i = 0; i < 10; i++) { // Simulate 20 "events" in a period
    const event = Math.random();
    
    if (event < 0.2) {
      // Penalty event
      const team = Math.random() < 0.5 ? homeTeam : awayTeam;
      const penalizedPlayer = team.players[getRandomInt(team.players.length)];
      plays.push(`${penalizedPlayer.name} took a penalty!`);
      penalties.push(penalizedPlayer);
    } else if (event < 0.6) {
      // Goal event
      const scoringTeamName = Math.random() < 0.5 ? homeTeam.name : awayTeam.name;
      const lineAssignments = JSON.parse(localStorage.getItem('lineAssignments')) || {};

        // Extract players for the first forward line of the scoring team
          const lineKeys = ["LW", "C", "RW"].map(
            pos => `${scoringTeamName}-forward-1-${pos}`
          );
          const linePlayerIDs = lineKeys.map(key => lineAssignments[key]).filter(id => id);
        
          if (linePlayerIDs.length > 0) {
            const scoringTeam = scoringTeamName === homeTeam.name ? homeTeam : awayTeam;
        
            // Find player objects by IDs
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

            // Now find the goalie
            const goalie = scoringTeamName === homeTeam.name ? awayTeam.players.find(player => player.position === "Starter") : homeTeam.players.find(player => player.position === "Starter");
        
            // Goal check (goalie save or goal scored)
            if (goalieSaveCheck(goalie, scorer)) {
              plays.push(`Save by ${goalie.name}, no goal scored.`);
            } else {  
            // Generate play description
            let playDescription = `Goal scored by ${scorer.name}`;
            if (assist1) playDescription += `, assisted by ${assist1.name}`;
            if (assist2) playDescription += ` and ${assist2.name}`;
            plays.push(playDescription);
        
            // Update scores
            if (scoringTeamName === homeTeam.name) {
              scores.home++;
            } else {
              scores.away++;
            }
            }
          } else {
            console.warn(`No active line found for team: ${scoringTeamName}`);
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
}

// Main game simulation
function simulateGame() {
  gameLog = [];  
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
  gameLog.push(`Final Score: ${homeTeamName} ${scores.home} - ${scores.away} ${awayTeamName}`);
  displayGameLog();
}

// Display the game log
function displayGameLog() {
  const gameOutput = document.getElementById('game-output');
  gameOutput.innerHTML = gameLog.map(play => `<p>${play}</p>`).join('');
}

// Start the game
document.getElementById('start-game').addEventListener('click', simulateGame);

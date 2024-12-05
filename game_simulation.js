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
  return (player.skills.glove + player.skills.stick + player.skills.legs + player.skills.speed) / 4;
}

// Simulate period
function simulatePeriod(homeTeam, awayTeam) {
  let plays = [];
  for (let i = 0; i < 20; i++) { // Simulate 20 "events" in a period
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
      const activeLine = lineAssignments[scoringTeamName]?.forwardLines?.[0]; // Use first forward line as active line
      
      if (activeLine) {
        const linePlayers = [
          activeLine.LW,
          activeLine.C,
          activeLine.RW
        ].filter(playerId => playerId); // Remove null or undefined slots
        
        // Retrieve player data by IDs
        const players = linePlayers.map(playerId => 
          scoringTeam.players.find(player => player.id === playerId)
        ).filter(player => player); // Ensure all players are valid
    
        if (players.length > 0) {
          const scorer = players[getRandomInt(players.length)];
          let assist1 = null;
          let assist2 = null;
    
          // Determine assists
          if (players.length > 1 && Math.random() < 0.7) { // Ensure at least one assist
            do {
              assist1 = players[getRandomInt(players.length)];
            } while (assist1 === scorer);
          }
          if (players.length > 2 && assist1 && Math.random() < 0.5) { // Ensure secondary assist
            do {
              assist2 = players[getRandomInt(players.length)];
            } while (assist2 === scorer || assist2 === assist1);
          }
    
          // Construct play description
          let playDescription = `Goal scored by ${scorer.name}`;
          if (assist1) {
            playDescription += `, assisted by ${assist1.name}`;
            if (assist2) {
              playDescription += ` and ${assist2.name}`;
            }
          }
          plays.push(playDescription);
    
          // Update scores
          if (scoringTeamName === homeTeam.name) {
            scores.home++;
          } else {
            scores.away++;
          }
        } else {
          console.error("Active line has no valid players:", activeLine);
        }
      } else {
        console.error("No active line found for team:", scoringTeamName);
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

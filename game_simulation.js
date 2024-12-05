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
                teams[player.team] = [];
            }
            teams[player.team].push(player);  
        }
    });
    return teams;  // Return the teams object with grouped players
}

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
      const scoringTeam = Math.random() < 0.5 ? homeTeam : awayTeam;
      const scorer = scoringTeam.players[getRandomInt(scoringTeam.players.length)];
      const assist1 = scoringTeam.players[getRandomInt(scoringTeam.players.length)];
      const assist2 = scoringTeam.players[getRandomInt(scoringTeam.players.length)];
      plays.push(`Goal scored by ${scorer.name}, assisted by ${assist1.name} and ${assist2.name}`);
      if (scoringTeam === homeTeam) {
        scores.home++;
      } else {
        scores.away++;
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
  const homeTeam = teams[getRandomInt(teams.length)];
  const awayTeam = teams[getRandomInt(teams.length)];

  if (homeTeam === awayTeam) return simulateGame(); // Avoid home and away being the same

  gameLog.push(`Game start: ${homeTeam.name} vs. ${awayTeam.name}`);
  for (let i = 1; i <= 3; i++) {
    gameLog.push(`--- Period ${i} ---`);
    gameLog = gameLog.concat(simulatePeriod(homeTeam, awayTeam));
  }
  gameLog.push(`Final Score: ${homeTeam.name} ${scores.home} - ${scores.away} ${awayTeam.name}`);
  displayGameLog();
}

// Display the game log
function displayGameLog() {
  const gameOutput = document.getElementById('game-output');
  gameOutput.innerHTML = gameLog.map(play => `<p>${play}</p>`).join('');
}

// Start the game
document.getElementById('start-game').addEventListener('click', simulateGame);

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

// Setup game: Select two random teams
function setupGame(teams) {
    const teamNames = Object.keys(teams);  // Get the names of the teams
    const teamAName = teamNames[Math.floor(Math.random() * teamNames.length)];  // Randomly select team A
    let teamBName;
    do {
        teamBName = teamNames[Math.floor(Math.random() * teamNames.length)];  // Randomly select team B, ensuring it's not the same as team A
    } while (teamBName === teamAName);

    // Return both teams with their respective players
    return { 
        teamA: { name: teamAName, players: teams[teamAName] },
        teamB: { name: teamBName, players: teams[teamBName] }
    };
}

// Simulate the game
function simulateGame() {
    const players = loadPlayersFromStorage();
    const teams = groupPlayersByTeam(players);

    if (Object.keys(teams).length < 2) {
        alert("At least two teams with players are required for a simulation.");
        return;
    }

    const { teamA, teamB } = setupGame(teams);
    let teamAScore = 0;
    let teamBScore = 0;
    const gameLog = [`${teamA.name} vs. ${teamB.name}`];

    // Initialize cumulative scores object
    let cumulativeScores = { teamA: 0, teamB: 0 };

    // Simulate 3 periods
    for (let period = 1; period <= 3; period++) {
        const { teamAScore: periodAScore, teamBScore: periodBScore, log, cumulativeScores: updatedCumulativeScores } = simulatePeriod(teamA, teamB, period, cumulativeScores);
        teamAScore += periodAScore;
        teamBScore += periodBScore;
        gameLog.push(...log);

        // Handle penalties and injuries
        gameLog.push(simulatePenalties(teamA, teamB));
        const injuryLogA = handleInjuries(teamA);
        const injuryLogB = handleInjuries(teamB);
        gameLog.push(...injuryLogA, ...injuryLogB);
    }

    // Determine the winner based on the regular period scores
    const winner = teamAScore > teamBScore ? teamA.name : teamB.name;
    gameLog.push(`Final Score: ${teamA.name} ${teamAScore} - ${teamBScore} ${teamB.name}`);
    gameLog.push(`${winner} wins the game!`);

    // Save results to localStorage (optional logging)
    localStorage.setItem('lastGameLog', JSON.stringify(gameLog));

    // Display the game log
    const gameLogDiv = document.getElementById('gameLog');
    gameLogDiv.innerHTML = gameLog.join('\n');
}

// Attach event listener to simulate button
document.getElementById('simulateGame').addEventListener('click', simulateGame);

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

// Get the goalie skill from a list of players
function getGoalieSkill(players) {
    // Find the goalie (player with position "Starter")
    const goalie = players.find(player => player.position === "Starter");
    
    // If a goalie is found, calculate their average skill
    if (goalie) {
        return (goalie.skills.glove + goalie.skills.stickHandling + goalie.skills.legs) / 3;
    }
    
    // Return a default skill level if no goalie is found
    return 50; // Default goalie skill if not defined
}

// Calculate team score based on players' offensive stats and the opposing goalie's skill
function calculateTeamScore(players, goalieSkill) {
    let score = 0;

    players.forEach(player => {
        if (!player.injured) {
            // Get player skills for scoring calculation
            const slapShot = player.skills.slapShotAccuracy || 0;
            const wristShot = player.skills.wristShotAccuracy || 0;
            const puckControl = player.skills.puckControl || 0;
            
            // Calculate the player's offensive ability
            const offense = (slapShot * 0.6 + wristShot * 0.4 + puckControl * 0.3);

            // Base goal chance and shot success probability
            const baseGoalChance = 0.1; // Default chance for a goal attempt
            const shotSuccessChance = (offense / 100) * 0.7; // Player's skill determining shot chance
            const goalieSaveChance = (100 - goalieSkill) / 100; // Opponent goalie defense

            // Calculate the actual chance of scoring a goal
            const goalChance = baseGoalChance + shotSuccessChance * goalieSaveChance;

            // If the calculated chance is higher than a random value, score a goal
            if (Math.random() < goalChance) {
                score++;
            }
        }
    });

    return score;
}

// Simulate a period
function simulatePeriod(teamA, teamB, periodNum, cumulativeScores) {
    const log = [`Period ${periodNum} Start:`];
    let teamAScore = 0;
    let teamBScore = 0;

    // Simulate multiple scoring attempts per period
    const scoringChances = 10; // Average number of scoring chances per period
    for (let i = 0; i < scoringChances; i++) {
        teamAScore += calculateTeamScore(teamA.players, getGoalieSkill(teamB.players));
        teamBScore += calculateTeamScore(teamB.players, getGoalieSkill(teamA.players));
    }

    log.push(`${teamA.name} scored ${teamAScore} goals this period.`);
    log.push(`${teamB.name} scored ${teamBScore} goals this period.`);

    // Update cumulative scores
    cumulativeScores.teamA += teamAScore;
    cumulativeScores.teamB += teamBScore;

    return { teamAScore, teamBScore, log, cumulativeScores };
}

// Simulate a penalty for one of the teams
function simulatePenalties(teamA, teamB) {
    // Determine if a penalty occurs (20% chance for a penalty in a period)
    if (Math.random() > 0.8) {
        // Randomly pick which team gets the penalty
        const penalizedTeam = Math.random() > 0.5 ? teamA : teamB;

        // Find a player to penalize based on aggression (higher aggressiveness = higher chance of penalty)
        const aggressivePlayers = penalizedTeam.players.filter(player => player.skills.aggression > 80);
        let penalizedPlayer;

        if (aggressivePlayers.length > 0) {
            // Pick a random player from aggressive players
            penalizedPlayer = aggressivePlayers[Math.floor(Math.random() * aggressivePlayers.length)];
        } else {
            // If no aggressive players, penalize a random player
            penalizedPlayer = penalizedTeam.players[Math.floor(Math.random() * penalizedTeam.players.length)];
        }

        return `${penalizedPlayer.name} from ${penalizedTeam.name} receives a penalty.`;
    }
    // No penalty occurred
    return "No penalties this period.";
}

// Handle injuries with a low probability (e.g., 2%)
function handleInjuries(team) {
    const injuryLog = [];
    team.players.forEach(player => {
        // 2% chance of injury for each player
        if (!player.injured && Math.random() > 0.98) {
            player.injured = true; // Mark player as injured
            injuryLog.push(`${player.name} from ${team.name} is injured.`);
        }
    });
    return injuryLog;
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

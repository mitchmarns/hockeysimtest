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
    return lineAssignments ? lineAssignments[teamName] : null;
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
    return 70; // Default goalie skill if not defined
}

// Calculate team score based on players' offensive stats and the opposing goalie's skill
function calculateTeamScore(players, goalieSkill) {
    let goals = [];

    players.forEach(player => {
        if (!player.injured) {
            // Get player skills for scoring calculation
            const slapShot = player.skills.slapShotAccuracy || 0;
            const wristShot = player.skills.wristShotAccuracy || 0;
            const puckControl = player.skills.puckControl || 0;
            const offense = (slapShot * 0.3 + wristShot * 0.2 + puckControl * 0.2);

            // shot-on-goals
            const shotOnGoalChance = (offense / 100) * 0.5; 
            if (Math.random() < shotOnGoalChance) {
                const baseGoalChance = 0.02; 
                const shotSuccessChance = (offense / 100) * 0.4;  
                const goalieSaveChance = (100 - goalieSkill) / 100; 
                const goalChance = baseGoalChance + shotSuccessChance * goalieSaveChance;

                if (Math.random() < goalChance) {
                    // Goal scored
                    const goal = { scorer: player.name, assists: [] };

                    // Determine assists using lineAssignments
                    const line = lineAssignments.find(line => 
                        Object.values(line).includes(player.id)
                    );
                    if (line) {
                        const teammates = Object.values(line).filter(id => id !== player.id);
                        if (teammates.length > 0) {
                            goal.assists.push(players.find(p => p.id === teammates[0])?.name || null);
                            if (teammates.length > 1) {
                                goal.assists.push(players.find(p => p.id === teammates[1])?.name || null);
                            }
                        }
                    }

                    goals.push(goal);
                }
            }
        }
    });

    return goals;
}

// Simulate a period
function simulatePeriod(teamA, teamB, periodNum, cumulativeScores) {
    const log = [`Period ${periodNum} Start:`];
    const teamALineAssignments = getLineAssignments(teamA.name);
    const teamBLineAssignments = getLineAssignments(teamB.name);

    let teamAScore = 0;
    let teamBScore = 0;   
    
    // Simulate multiple scoring attempts per period
    const scoringChances = 5; // Average number of scoring chances per period
    for (let i = 0; i < scoringChances; i++) {
        // Get goals for Team A
        const teamAGoals = calculateTeamScore(teamA.players, getGoalieSkill(teamB.players), teamALineAssignments);
        teamAGoals.forEach(goal => {
            log.push(`${teamA.name} Goal! Scorer: ${goal.scorer}. Assists: ${goal.assists.join(", ") || "None"}`);
            teamAScore++;
        });

        // Get goals for Team B
        const teamBGoals = calculateTeamScore(teamB.players, getGoalieSkill(teamA.players), teamBLineAssignments);
        teamBGoals.forEach(goal => {
            log.push(`${teamB.name} Goal! Scorer: ${goal.scorer}. Assists: ${goal.assists.join(", ") || "None"}`);
            teamBScore++;
        });
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

function simulateOvertime(teamA, teamB) {
    const log = ["Overtime Start:"];
    let teamAScore = 0;
    let teamBScore = 0;

    // Single scoring attempt for each team
    const scoringChances = 3; // Lower number of chances due to shorter overtime
    for (let i = 0; i < scoringChances; i++) {
        teamAScore += calculateTeamScore(teamA.players, getGoalieSkill(teamB.players));
        teamBScore += calculateTeamScore(teamB.players, getGoalieSkill(teamA.players));

        // If either team scores, end overtime
        if (teamAScore > 0 || teamBScore > 0) {
            break;
        }
    }

    if (teamAScore > 0) {
        log.push(`${teamA.name} scores in overtime!`);
    } else if (teamBScore > 0) {
        log.push(`${teamB.name} scores in overtime!`);
    } else {
        log.push("No goals scored in overtime.");
    }

    log.push("Overtime Ends.");
    return { teamAScore, teamBScore, log };
}

function simulateShootout(teamA, teamB) {
    const log = ["Shootout Start:"];
    const shootoutAttempts = 5; // Number of attempts for each team
    let teamAScore = 0;
    let teamBScore = 0;

    // Helper function to simulate a single shootout attempt
    function shootoutAttempt(player, goalieSkill) {
        if (player.injured) return false; // Injured players cannot participate
        const offense = (player.skills.slapShotAccuracy * 0.4 + player.skills.wristShotAccuracy * 0.4 + player.skills.puckControl * 0.2);
        const shotChance = (offense / 100) * 0.5; // Offensive skill impact
        const goalieSaveChance = (100 - goalieSkill) / 100; // Goalie defense impact
        const goalChance = shotChance * goalieSaveChance;
        return Math.random() < goalChance; // Return true if the player scores
    }

    const teamAPlayers = teamA.players.filter(player => !player.injured);
    const teamBPlayers = teamB.players.filter(player => !player.injured);
    const teamAGoalieSkill = getGoalieSkill(teamBPlayers);
    const teamBGoalieSkill = getGoalieSkill(teamAPlayers);

    for (let i = 0; i < shootoutAttempts; i++) {
        const shooterA = teamAPlayers[i % teamAPlayers.length]; // Rotate through players
        const shooterB = teamBPlayers[i % teamBPlayers.length];

        if (shootoutAttempt(shooterA, teamAGoalieSkill)) {
            teamAScore++;
            log.push(`${shooterA.name} from ${teamA.name} scores in the shootout!`);
        } else {
            log.push(`${shooterA.name} from ${teamA.name} misses.`);
        }

        if (shootoutAttempt(shooterB, teamBGoalieSkill)) {
            teamBScore++;
            log.push(`${shooterB.name} from ${teamB.name} scores in the shootout!`);
        } else {
            log.push(`${shooterB.name} from ${teamB.name} misses.`);
        }
    }

    log.push(`Shootout Ends. ${teamA.name}: ${teamAScore}, ${teamB.name}: ${teamBScore}`);
    return { teamAScore, teamBScore, log };
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

    gameLog.push(`End of Regulation: ${teamA.name} ${teamAScore} - ${teamBScore} ${teamB.name}`);

    // Check for a tie and simulate overtime
    if (teamAScore === teamBScore) {
        gameLog.push("The game is tied! Proceeding to overtime...");
        const overtimeResult = simulateOvertime(teamA, teamB);
        teamAScore += overtimeResult.teamAScore;
        teamBScore += overtimeResult.teamBScore;
        gameLog.push(...overtimeResult.log);

        // If still tied, proceed to shootout
        if (overtimeResult.teamAScore === 0 && overtimeResult.teamBScore === 0) {
            gameLog.push("Overtime ended with no goals. Proceeding to a shootout...");
            const shootoutResult = simulateShootout(teamA, teamB);
            teamAScore += shootoutResult.teamAScore;
            teamBScore += shootoutResult.teamBScore;
            gameLog.push(...shootoutResult.log);
        }
    }

    // Determine the winner 
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

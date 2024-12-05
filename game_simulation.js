// Load players from localStorage
  const loadPlayersFromStorage = () => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    if (playersData && playersData.players) {
      return playersData.players;
    }
    return [];
  };

  let playersData = { players: [] };

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
    return teams;
}

// Setup game: Select two random teams
function setupGame(teams) {
    const teamNames = Object.keys(teams);
    const teamAName = teamNames[Math.floor(Math.random() * teamNames.length)];
    let teamBName;
    do {
        teamBName = teamNames[Math.floor(Math.random() * teamNames.length)];
    } while (teamBName === teamAName);

    return { teamA: { name: teamAName, players: teams[teamAName] }, teamB: { name: teamBName, players: teams[teamBName] } };
}

// Simulate a period
function simulatePeriod(teamA, teamB, periodNum, cumulativeScores) {
    const log = [`Period ${periodNum} Start:`];
    let teamAScore = 0;
    let teamBScore = 0;

    // Simulate multiple scoring attempts per period
    const scoringChances = 60; // Average number of scoring chances per period
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

function getGoalieSkill(players) {
    const goalie = players.find(player => player.position === "Starter");
    return goalie ? (goalie.skills.glove + goalie.skills.stick + goalie.skills.legs) / 3 : 50; // Default skill if no goalie
}

// Calculate team score based on players' offensive stats
function calculateTeamScore(players, goalieSkill) {
    let score = 0;

    players.forEach(player => {
        if (!player.injured) {
            const slapShot = player.skills.slapShotAccuracy || 0;
            const wristShot = player.skills.wristShotAccuracy || 0;
            const puckControl = player.skills.puckControl || 0;
            
            const offense = (slapShot * 0.6 + wristShot * 0.4 + puckControl * 0.3);

            const baseGoalChance = 0.9;
            const shotSuccessChance = (offense / 100) * 0.7;
            const goalieSaveChance = (100 - goalieSkill) / 100;

            const goalChance = baseGoalChance + shotSuccessChance * goalieSaveChance;

            if (Math.random() < goalChance) {
                score++;
            }
        }
    });

    return score;
}

// Handle injuries with a 2% chance per player
function handleInjuries(team) {
    const injuredLog = [];
    team.players.forEach(player => {
        if (!player.injured && Math.random() > 0.98) { // 2% chance of injury
            player.injured = true;
            injuredLog.push(`${player.name} from ${team.name} is injured.`);
        }
    });
    return injuredLog;
}

function simulatePenalties(teamA, teamB) {
    const penaltyTeam = Math.random() > 0.8 ? teamA : teamB; // 20% chance of penalty
    const aggressivePlayers = penaltyTeam.players.filter(player => player.skills.aggressiveness > 80); // Higher aggressiveness = higher chance of penalty
    
    let penalizedPlayer;
    if (aggressivePlayers.length > 0) {
        penalizedPlayer = aggressivePlayers[Math.floor(Math.random() * aggressivePlayers.length)];
    } else {
        penalizedPlayer = penaltyTeam.players[Math.floor(Math.random() * penaltyTeam.players.length)]; // Default to random player
    }

    return `${penalizedPlayer.name} from ${penaltyTeam.name} receives a penalty.`;
}

function simulatePowerPlay(team, opposingGoalieSkill) {
    let extraGoals = 0;

    team.players.forEach(player => {
        if (!player.injured) {
            const offense = (player.skills.slapShotAccuracy * 0.6 +
                             player.skills.wristShotAccuracy * 0.4 +
                             player.skills.puckControl * 0.3);

            const powerPlayChance = (offense / 100) * 0.5; // Higher chance during power plays
            const goalieSaveChance = (100 - opposingGoalieSkill) / 100;

            if (Math.random() < (powerPlayChance * goalieSaveChance)) {
                extraGoals++;
            }
        }
    });

    return extraGoals;
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


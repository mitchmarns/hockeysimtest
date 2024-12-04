// Load players from localStorage
  const loadPlayersFromStorage = () => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    if (playersData && playersData.players) {
      return playersData.players;
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
function simulatePeriod(teamA, teamB, periodNum) {
    const log = [`Period ${periodNum} Start:`];

    // Calculate goals using player skills
    const teamAScore = calculateTeamScore(teamA.players);
    const teamBScore = calculateTeamScore(teamB.players);

    log.push(`${teamA.name} scored ${teamAScore} goals.`);
    log.push(`${teamB.name} scored ${teamBScore} goals.`);

    return { teamAScore, teamBScore, log };
}

// Calculate team score based on players' offensive stats
function calculateTeamScore(players, goalieSkill) {
    let score = 0;

    players.forEach(player => {
        if (!player.injured) {
            // Calculate offensive ability based on weighted stats
            const offense = (player.skills.slapShotAccuracy * 0.4 + 
                             player.skills.wristShotAccuracy * 0.4 + 
                             player.skills.puckControl * 0.2);

            // Adjust the chance of a goal based on the goalie’s skill
            const shotSuccessChance = (offense / 100) * 0.25;
            const goalieSaveChance = (100 - goalieSkill) / 100; // Higher goalie skill means higher save chance

            // Simulate shot outcome, considering the goalie’s save chance
            const isGoalScored = Math.random() < (shotSuccessChance * goalieSaveChance);

            if (isGoalScored) {
                score++;
            }
        }
    });

    return score;
}

// Handle injuries
function handleInjuries(team) {
    const injuredLog = [];
    team.players.forEach(player => {
        if (!player.injured && Math.random() > 0.95) { // 5% chance of injury
            player.injured = true;
            injuredLog.push(`${player.name} from ${team.name} is injured.`);
        }
    });
    return injuredLog;
}

// Simulate penalties
function simulatePenalties(teamA, teamB) {
    const penaltyTeam = Math.random() > 0.5 ? teamA : teamB;
    const penalizedPlayer = penaltyTeam.players[Math.floor(Math.random() * penaltyTeam.players.length)];
    return `${penalizedPlayer.name} from ${penaltyTeam.name} receives a penalty.`;
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

    for (let period = 1; period <= 3; period++) {
        const { teamAScore: periodAScore, teamBScore: periodBScore, log } = simulatePeriod(teamA, teamB, period);
        teamAScore += periodAScore;
        teamBScore += periodBScore;
        gameLog.push(...log);

        // Handle penalties and injuries
        gameLog.push(simulatePenalties(teamA, teamB));
        const injuryLogA = handleInjuries(teamA);
        const injuryLogB = handleInjuries(teamB);
        gameLog.push(...injuryLogA, ...injuryLogB);
    }

    // Check for overtime or shootout
    if (teamAScore === teamBScore) {
      const overtimeResult = simulateOvertime(teamA, teamB);
      teamAScore += overtimeResult.teamAScore;
      teamBScore += overtimeResult.teamBScore;
      gameLog.push(...overtimeResult.log);

      if (overtimeResult.teamAScore === 0 && overtimeResult.teamBScore === 0) {
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


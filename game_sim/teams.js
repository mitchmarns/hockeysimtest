// Group players by team
export const groupPlayersByTeam = (players) => {
  const teams = {};
  players.forEach(player => {
    if (player.team && player.team.trim()) {
      if (!teams[player.team]) {
        teams[player.team] = {
          name: player.team,
          players: [],
          lines: {
            forwardLines: Array(4).fill(null).map(() => ({ LW: null, C: null, RW: null })),
            defenseLines: Array(3).fill(null).map(() => ({ LD: null, RD: null })),
            goalies: { Starter: null, Backup: null },
          },
        };
      }
      teams[player.team].players.push(player);
    }
  });
  return teams;
};

// Calculate player skill
export const calculateAverageSkill = (player) => {
  return (player.skills.glove + player.skills.stick + player.skills.legs + player.skills.speed) / 4;
};

// line assignments
// Parse lineAssignments
export const parseLineAssignments = (lineAssignments, teams) => {
  let assignments;
  
try {
    assignments = JSON.parse(lineAssignments);
  } catch (error) {
    console.error("Invalid lineAssignments JSON:", error);
    return;
  }

  for (const [key, playerId] of Object.entries(assignments)) {
    const [teamName, lineType, lineNumber, position] = key.split('-');
    const team = teams.find((t) => t.name === teamName);

    if (!team) {
      console.warn(`Team ${teamName} not found.`);
      continue;
    }

    const player = team.players.find((p) => p.id === parseInt(playerId, 10));

    if (!player) {
      console.warn(`Player with ID ${playerId} not found in team ${teamName}.`);
      continue;
    }

    if (lineType === 'forward') {
      team.lines.forwardLines[lineNumber - 1][position] = player;
    } else if (lineType === 'defense') {
      team.lines.defenseLines[lineNumber - 1][position] = player;
    } else if (lineType === 'goalies') {
      team.lines.goalies[position.toLowerCase()] = player;
    }
  }
};


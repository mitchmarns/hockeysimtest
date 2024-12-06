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
            goalies: { starter: null, backup: null },
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
export const parseLineAssignments = (lineAssignments, teams) => {
  let assignments;

  // Check if lineAssignments is a string and parse it, or use it directly if already an object
  if (typeof lineAssignments === 'string') {
    try {
      assignments = JSON.parse(lineAssignments);
    } catch (error) {
      console.error("Invalid lineAssignments JSON:", error);
      return;
    }
  } else if (typeof lineAssignments === 'object' && lineAssignments !== null) {
    assignments = lineAssignments;
  } else {
    console.error("lineAssignments is neither a string nor an object.");
    return;
  }

  teams.forEach(team => {
    team.lines = {
      forwardLines: [
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null }
      ],
      defenseLines: [
        { LD: null, RD: null },
        { LD: null, RD: null },
        { LD: null, RD: null }
      ],
      goalies: { starter: null, backup: null }
    };

    for (const [key, playerId] of Object.entries(assignments)) {
      const [teamName, lineType, lineNumber, position] = key.split('-');

      if (teamName !== team.name) continue;

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
    console.log(`${team.name}'s lines after parsing:`, team.lines);
  });
};


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
    if (typeof lineAssignments === 'string') {
      assignments = JSON.parse(lineAssignments);
    } else if (typeof lineAssignments === 'object') {
      assignments = lineAssignments;
    } else {
      console.error('Invalid lineAssignments format');
      return;
    }
  } catch (error) {
    console.error('Failed to parse lineAssignments JSON:', error);
    return;
  }

  console.log('Parsed lineAssignments:', assignments);

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

    console.log(`Assigning players to team: ${team.name}`);

    for (const [key, playerId] of Object.entries(assignments)) {
      const [teamName, lineType, lineNumber, position] = key.split('-');

      if (teamName !== team.name) continue;

      const player = team.players.find(p => p.id === parseInt(playerId, 10));

      if (!player) {
        console.warn(`Player with ID ${playerId} not found in ${teamName}`);
        continue;
      }

      console.log(`Assigning ${position} in ${lineType} to ${player.name}`);

      if (lineType === 'goalies') {
        team.lines.goalies[position.toLowerCase()] = player;
      } else if (lineType === 'forward') {
        team.lines.forwardLines[lineNumber - 1][position] = player;
      } else if (lineType === 'defense') {
        team.lines.defenseLines[lineNumber - 1][position] = player;
      }
    }

    console.log(`${team.name}'s goalies after parsing:`, team.lines.goalies);
  });
};


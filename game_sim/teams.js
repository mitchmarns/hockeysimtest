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
    console.error("Line Assignments Data:", lineAssignments);
    return;
  }

  for (const [key, playerId] of Object.entries(assignments)) {
    const [teamName, lineType, lineNumber, position] = key.split('-');
    
    const team = teams[teamName];

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
      const forwardLineIndex = parseInt(lineNumber, 10) - 1;
      if (forwardLineIndex >= 0 && forwardLineIndex < team.lines.forwardLines.length) {
        team.lines.forwardLines[forwardLineIndex][position] = player;
      } else {
        console.warn(`Invalid forward line number ${lineNumber} for team ${teamName}`);
      }
    } else if (lineType === 'defense') {
      const defenseLineIndex = parseInt(lineNumber, 10) - 1;
      if (defenseLineIndex >= 0 && defenseLineIndex < team.lines.defenseLines.length) {
        team.lines.defenseLines[defenseLineIndex][position] = player;
      } else {
        console.warn(`Invalid defense line number ${lineNumber} for team ${teamName}`);
      }
    } else if (lineType === 'goalies') {
      if (position.toLowerCase() === 'starter' || position.toLowerCase() === 'backup') {
        team.lines.goalies[position.toLowerCase()] = player;
      } else {
        console.warn(`Invalid goalie position ${position} for team ${teamName}`);
      }
    }
  }
};



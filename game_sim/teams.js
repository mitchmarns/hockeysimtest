// Group players by team
export const groupPlayersByTeam = (players) => {
  const teams = {};
  players.forEach(player => {
    if (player.team && player.team.trim()) {
      if (!teams[player.team]) {
        teams[player.team] = { name: player.team, players: [] };
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

  if (typeof lineAssignments === "string") {
    try {
      console.log("Parsing lineAssignments:", lineAssignments);
      assignments = JSON.parse(lineAssignments);
    } catch (error) {
      console.error("Invalid lineAssignments JSON:", error);
      return;
    }
  } else if (typeof lineAssignments === "object" && lineAssignments !== null) {
    console.log("lineAssignments is already an object:", lineAssignments);
    assignments = lineAssignments;
  } else {
    console.error("Unexpected lineAssignments format:", lineAssignments);
    return;
  }

  for (const [key, playerId] of Object.entries(assignments)) {
    const [teamName, lineType, lineNumber, position] = key.split('-');
    console.log(`Processing: team=${teamName}, lineType=${lineType}, lineNumber=${lineNumber}, position=${position}, playerId=${playerId}`);

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
  console.log(`Assigned goalie: ${player.name} as ${position.toLowerCase()} for ${teamName}`);
}
    }
  }
};


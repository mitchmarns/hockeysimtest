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
  const assignments = JSON.parse(lineAssignments);

  for (const [key, playerId] of Object.entries(assignments)) {
    const [teamName, lineType, lineNumber, position] = key.split('-');
    const team = teams.find((t) => t.name === teamName);
    if (!team) continue;

    const player = team.players.find((p) => p.id === parseInt(playerId, 10));
    if (!player) continue;

    if (lineType === 'forward') {
      team.lines.forwardLines[lineNumber - 1][position] = player;
    } else if (lineType === 'defense') {
      team.lines.defenseLines[lineNumber - 1][position] = player;
    } else if (lineType === 'goalies') {
      team.lines.goalies[position.toLowerCase()] = player;
    }
  }
};

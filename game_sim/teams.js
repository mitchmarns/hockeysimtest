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

      // Assign goalies if the player's position is 'Starter' or 'Backup'
      if (player.position === 'Starter') {
        teams[player.team].lines.goalies.starter = player;
      }
      if (player.position === 'Backup') {
        teams[player.team].lines.goalies.backup = player;
      }
    }
  });
  return teams;
};

// Calculate player skill
export const calculateAverageSkill = (team, skillType) => {
  const totalSkill = team.players.reduce((sum, player) => {
    return sum + (player.skills[skillType] || 0);
  }, 0);
  return totalSkill / team.players.length;
};





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





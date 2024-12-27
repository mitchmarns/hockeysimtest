// Group players by team
export const groupPlayersByTeam = (players) => {
  const teams = {};

  players.forEach(player => {
    if (player.team && player.team.trim()) {
      // Initialize the team if it doesn't already exist
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

      // Assign goalies if the player's position is 'Starter' or 'Backup'
      if (player.position === 'Starter') {
        teams[player.team].lines.goalies.starter = player;
      }
      if (player.position === 'Backup') {
        teams[player.team].lines.goalies.backup = player;
      }

      // Assign forwards to the forward lines based on position (LW, C, RW)
      if (['LW', 'C', 'RW'].includes(player.position)) {
        // Loop through forward lines to find an empty spot
        for (let i = 0; i < teams[player.team].lines.forwardLines.length; i++) {
          const line = teams[player.team].lines.forwardLines[i];
          if (!line.LW && player.position === 'LW') {
            line.LW = player;
            break;
          }
          if (!line.C && player.position === 'C') {
            line.C = player;
            break;
          }
          if (!line.RW && player.position === 'RW') {
            line.RW = player;
            break;
          }
        }
      }

      // Assign defense players to defense lines based on position (LD, RD)
      if (['LD', 'RD'].includes(player.position)) {
        // Loop through defense lines to find an empty spot
        for (let i = 0; i < teams[player.team].lines.defenseLines.length; i++) {
          const line = teams[player.team].lines.defenseLines[i];
          if (!line.LD && player.position === 'LD') {
            line.LD = player;
            break;
          }
          if (!line.RD && player.position === 'RD') {
            line.RD = player;
            break;
          }
        }
      }
    }
  });

  return teams;
};

// Calculate player skill
export const calculateAverageSkill = (team, skillType) => {
  if (team.players.length === 0) return 0; // Prevent division by zero if no players are assigned

  const totalSkill = team.players.reduce((sum, player) => {
    return sum + (player.skills[skillType] || 0);
  }, 0);
  
  return totalSkill / team.players.length;
};





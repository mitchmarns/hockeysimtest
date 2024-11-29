let playersData = { players: [] }; // Default structure
export const teams = [
  { name: "Rangers", players: [], maxPlayers: 23,
    lines: {
      forwards: [
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
      ],
      defense: [
        { LD: null, RD: null },
        { LD: null, RD: null },
        { LD: null, RD: null },
      ],
      goalies: { Starter: null, Backup: null },
    },
  },
  { name: "Devils", players: [], maxPlayers: 23,
    lines: {
      forwards: [
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
      ],
      defense: [
        { LD: null, RD: null },
        { LD: null, RD: null },
        { LD: null, RD: null },
      ],
      goalies: { Starter: null, Backup: null },
    },
  },
  { name: "Islanders", players: [], maxPlayers: 23,
      lines: {
      forwards: [
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
      ],
      defense: [
        { LD: null, RD: null },
        { LD: null, RD: null },
        { LD: null, RD: null },
      ],
      goalies: { Starter: null, Backup: null },
    },
  },
  { name: "Sabres", players: [], maxPlayers: 23,
      lines: {
      forwards: [
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
        { LW: null, C: null, RW: null },
      ],
      defense: [
        { LD: null, RD: null },
        { LD: null, RD: null },
        { LD: null, RD: null },
      ],
      goalies: { Starter: null, Backup: null },
    },
  }
];

export async function loadPlayers() {
  try {
    const savedPlayers = localStorage.getItem('playersData');
    if (savedPlayers) {
      playersData = JSON.parse(savedPlayers); // Load players from localStorage
      // Ensure the assigned property is initialized to false if not already set
      playersData.forEach(player => {
        if (player.assigned === undefined) {
          player.assigned = false;  // Set to false if it's not defined
        }
      });
    } else {
      const response = await fetch('./players.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      playersData = await response.json();
      // Ensure the assigned property is initialized for each player
      playersData.forEach(player => {
        player.assigned = false; // Set to false for all players initially
      });
      localStorage.setItem('playersData', JSON.stringify(playersData)); // Save players to localStorage
    }
  } catch (error) {
    console.error('Error loading player data:', error);
  }
}

export function getAvailablePlayers() {
  return playersData.players.filter(player => !player.team);
}

export function assignPlayerToTeam(playerId, teamName) {
  const player = playersData.players.find(p => p.id === playerId);
  const team = teams.find(t => t.name === teamName);

  if (player && team && !player.team) {
    if (team.players.length < team.maxPlayers) {
      player.team = teamName;
      team.players.push(player);

      // Save updated teams to localStorage
      localStorage.setItem('teams', JSON.stringify(teams));
      console.log('Teams saved to localStorage:', teams);  
      localStorage.setItem('playersData', JSON.stringify(playersData));
    } else {
      console.error('Team is full.');
    }
  } else {
    console.error('Player not found or already assigned.');
  }
}

export function loadTeamsFromLocalStorage() {
  const savedTeams = localStorage.getItem('teams');
  if (savedTeams) {
    const parsedTeams = JSON.parse(savedTeams);
    parsedTeams.forEach(savedTeam => {
      const team = teams.find(t => t.name === savedTeam.name);
      if (team) {
        savedTeam.players.forEach(savedPlayer => {
          const player = team.players.find(p => p.id === savedPlayer.id);
          if (player) {
            player.line = savedPlayer.line || player.line; 
            player.assigned = savedPlayer.assigned !== undefined ? savedPlayer.assigned : player.assigned; // Correctly load the assigned status
          }
        });
        team.lines = savedTeam.lines || team.lines;
      }
    });
  }
}

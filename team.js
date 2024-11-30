let playersData = { players: [] }; // Default structure
export const teams = [
  { 
    name: "Rangers", 
    players: [], 
    maxPlayers: 23,
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
      const data = JSON.parse(savedPlayers);
      playersData.players = data.players || [];
      console.log('Players loaded from localStorage:', playersData);
    } else {
      const response = await fetch('./players.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      playersData.players = data.players || [];

      localStorage.setItem('playersData', JSON.stringify(playersData));
      console.log('Players loaded from players.json:', playersData);
}
    if (!Array.isArray(playersData.players)) {
      throw new Error('playersData.players is not an array');
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
      player.assigned = true;

      team.players.push(player);

      // Save updated teams to localStorage
      localStorage.setItem('teams', JSON.stringify(teams));
      localStorage.setItem('playersData', JSON.stringify(playersData));

      console.log("Player assigned and data saved:", { player, teams });
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

        team.players = savedTeam.players.map((savedPlayer) => {
          const player = playersData.players.find((p) => p.id === savedPlayer.id);
          if (player) {
            player.line = savedPlayer.line || null;
            player.assigned = savedPlayer.assigned !== undefined ? savedPlayer.assigned : false;
            player.team = savedPlayer.team || null;
            player.injured = savedPlayer.injured || false; 
            player.healthyScratch = savedPlayer.healthyScratch || false;
          }
          return player;
        });

        // Update team lines
        team.lines = savedTeam.lines || team.lines;
        
        // Ensure the UI reflects the loaded states
        team.players.forEach((player) => {
          const playerElement = document.querySelector(`[data-player-id="${player.id}"]`);

          if (playerElement) {
            // Apply visual indicators for injured or scratched players
            if (player.injured) {
              playerElement.classList.add('injured');
            } else {
              playerElement.classList.remove('injured');
            }

            if (player.healthyScratch) {
              playerElement.classList.add('healthy-scratch');
            } else {
              playerElement.classList.remove('healthy-scratch');
            }
          }
        });
      }
    });
    
    console.log("Teams loaded from localStorage:", teams);
  }
}

// Export all players for use
export function getPlayers() {
  return playersData.players;
}

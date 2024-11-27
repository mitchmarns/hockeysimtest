let playersData = { players: [] }; // Default structure
export const teams = [
  { name: "Rangers", players: [], maxPlayers: 23 },
  { name: "Devils", players: [], maxPlayers: 23 },
  { name: "Islanders", players: [], maxPlayers: 23 },
  { name: "Sabres", players: [], maxPlayers: 23 }
];

export async function loadPlayers() {
  try {
    const response = await fetch('./players.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    playersData = await response.json();
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
      console.log('Teams saved to localStorage:', teams);  // Log to verify data saving
    } else {
      console.error('Team is full.');
    }
  } else {
    console.error('Player not found or already assigned.');
  }
}

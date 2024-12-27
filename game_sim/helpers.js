export const simulateShotOutcome = (homeTeam, awayTeam, isHomeAttacking) => {
  const attackingTeam = isHomeAttacking ? homeTeam : awayTeam;
  const defendingTeam = isHomeAttacking ? awayTeam : homeTeam;

  // Collect players from attacking and defending teams
  const attackingPlayers = collectPlayersFromTeam(attackingTeam);
  const defendingPlayers = collectPlayersFromTeam(defendingTeam);

  // Validate if players are found for both teams
  if (!attackingPlayers.length || !defendingPlayers.length) {
    console.error('Error: No players available in lines.');
    return false;
  }

  // Select random attacker and defender
  const randomAttacker = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
  const randomDefender = defendingPlayers[Math.floor(Math.random() * defendingPlayers.length)];

  // Ensure valid attacker and defender are selected
  if (!randomAttacker || !randomDefender) {
    console.error('Error: Invalid attacker or defender.', randomAttacker, randomDefender);
    return false;
  }

  // Ensure attacker and defender have skills
  if (!randomAttacker.skills || !randomDefender.skills) {
    console.error('Player skills are missing for', randomAttacker.name, randomDefender.name);
    return false;
  }

  // Calculate shot chance
  const shotSkill = randomAttacker.skills.slapShotAccuracy + randomAttacker.skills.speed;
  const saveSkill = randomDefender.skills.glove + randomDefender.skills.reflexes;

  const shotChance = shotSkill - saveSkill;
  const shotOutcome = Math.random() * 100 < shotChance;

  return shotOutcome;
};

const collectPlayersFromTeam = (team) => {
  const players = [];

  // Loop through localStorage keys to find players assigned to the given team
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`${team.name}-`)) {
      const position = key.split('-')[1];  // Extract position (e.g., "forward", "defense")
      const lineNumber = key.split('-')[2];  // Extract line number (e.g., "1", "2", etc.)
      const playerPosition = key.split('-')[3];  // Extract specific position (e.g., "RW", "LD")

      const playerId = localStorage.getItem(key);  // Get the player ID from localStorage

      // Find the player data using the playerId
      const player = getPlayerById(playerId);
      if (player) {
        player.position = playerPosition;  // Attach position to the player object
        players.push(player);  // Add player to the list
      }
    }
  });

  return players.filter(Boolean);  // Remove any null/undefined values
};

// Helper function to get a player by ID from localStorage
const getPlayerById = (id) => {
  const playersData = JSON.parse(localStorage.getItem("playersData"));
  return playersData ? playersData.players.find((player) => player.id === parseInt(id)) : null;
};

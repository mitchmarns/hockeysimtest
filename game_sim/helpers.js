export const simulateShotOutcome = (homeTeam, awayTeam, isHomeAttacking) => {
  const attackingTeam = isHomeAttacking ? homeTeam : awayTeam;
  const defendingTeam = isHomeAttacking ? awayTeam : homeTeam;

  // Collect players from attacking and defending teams
  const attackingPlayers = collectPlayersFromTeam(attackingTeam).filter(Boolean);
  const defendingPlayers = collectPlayersFromTeam(defendingTeam).filter(Boolean);

  if (!attackingPlayers.length || !defendingPlayers.length) {
    console.error('Error: No players available in lines.');
    return false;
  }

  // Select random attacker and defender
  const randomAttacker = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
  const randomDefender = defendingPlayers[Math.floor(Math.random() * defendingPlayers.length)];

  if (!randomAttacker || !randomDefender) {
    console.error('Error: Invalid attacker or defender.', randomAttacker, randomDefender);
    return false;
  }

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

export const simulateShotOutcome = (attackingTeam, defendingTeam) => {
  // Flatten players from all lines into a single array for selection
  const attackingPlayers = [
    ...attackingTeam.lines.forwardLines.flatMap(line => Object.values(line)),
    ...attackingTeam.lines.defenseLines.flatMap(line => Object.values(line)),
    attackingTeam.lines.goalies.starter,
  ].filter(Boolean); // Filter out any null values

  const defendingPlayers = [
    ...defendingTeam.lines.forwardLines.flatMap(line => Object.values(line)),
    ...defendingTeam.lines.defenseLines.flatMap(line => Object.values(line)),
    defendingTeam.lines.goalies.starter,
  ].filter(Boolean);

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

  const shotSkill = randomAttacker.skills.slapShotAccuracy + randomAttacker.skills.speed;
  const saveSkill = randomDefender.skills.glove + randomDefender.skills.reflexes;

  const shotChance = shotSkill - saveSkill;
  const shotOutcome = Math.random() * 100 < shotChance;

  return shotOutcome;
};

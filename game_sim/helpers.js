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
  if (!team || !team.lines) {
    console.error('Invalid team data:', team);
    return [];
  }

  const players = [];

  // Collect forwards from all lines
  team.lines.forwardLines.forEach((line) => {
    if (line.LW) players.push(line.LW);
    if (line.C) players.push(line.C);
    if (line.RW) players.push(line.RW);
  });

  // Collect defensemen from all lines
  team.lines.defenseLines.forEach((line) => {
    if (line.LD) players.push(line.LD);
    if (line.RD) players.push(line.RD);
  });

  // Collect the starter goalie
  if (team.lines.goalies && team.lines.goalies.starter) {
    players.push(team.lines.goalies.starter);
  }

  // Return only valid players
  return players.filter(Boolean); // Filter out any null/undefined values
};

export const simulateShotOutcome = (attackingTeam, defendingTeam) => {
  // Ensure both teams have players
  if (attackingTeam.players.length === 0 || defendingTeam.players.length === 0) {
    console.error('One or both teams have no players!');
    return false; // Fail if no players are available
  }

  // Select a random attacker and defender
  const randomAttacker = attackingTeam.players[Math.floor(Math.random() * attackingTeam.players.length)];
  const randomDefender = defendingTeam.players[Math.floor(Math.random() * defendingTeam.players.length)];

  // Ensure both attacker and defender have skills defined
  if (!randomAttacker.skills || !randomDefender.skills) {
    console.error('Player skills are missing for', randomAttacker.name, randomDefender.name);
    return false; // Fail the shot if skills are undefined
  }

  let shotSkill = 0;
  let saveSkill = 0;

  // If the attacker is a goalie, adjust the skills accordingly
  if (randomAttacker.position === 'Starter' || randomAttacker.position === 'Backup') {
    // Goalies may use speed and reflexes for their shots
    shotSkill = randomAttacker.skills.speed + randomAttacker.skills.reflexes;
  } else {
    // Skater shot skill calculation (using skater attributes like slapShotAccuracy)
    shotSkill = (randomAttacker.skills.slapShotAccuracy || 0) + (randomAttacker.skills.speed || 0);
  }

  // Defending player's save skill (goalies)
  if (randomDefender.position === 'Starter' || randomDefender.position === 'Backup') {
    // Goalies use reflexes, glove, and positioning for save skill
    saveSkill = (randomDefender.skills.reflexes || 0) + (randomDefender.skills.glove || 0) + (randomDefender.skills.positioning || 0);
  } else {
    // Skaters' defense skill
    saveSkill = (randomDefender.skills.defense || 0) + (randomDefender.skills.stickChecking || 0);
  }

  // Calculate shot and save chances
  const shotChance = shotSkill - saveSkill;

  // If shotChance is negative, the shot should have no chance of succeeding
  if (shotChance <= 0) {
    return false;
  }

  // Determine if the shot is successful
  const shotOutcome = Math.random() * 100 < shotChance;

  return shotOutcome;
};

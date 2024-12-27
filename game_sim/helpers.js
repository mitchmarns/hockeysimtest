export const simulateShotOutcome = (attackingTeam, defendingTeam) => {
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
    // Goalie shot skill might not be used in the same way as skaters
    shotSkill = randomAttacker.skills.speed + randomAttacker.skills.reflexes; // Goalies may use speed and reflexes for their plays
  } else {
    // Skater shot skill calculation (using skater attributes like slapShotAccuracy)
    shotSkill = randomAttacker.skills.slapShotAccuracy + randomAttacker.skills.speed;
  }

  // Defending player's save skill (goalies)
  if (randomDefender.position === 'Starter' || randomDefender.position === 'Backup') {
    // Goalies use reflexes, glove, and positioning for save skill
    saveSkill = randomDefender.skills.reflexes + randomDefender.skills.glove + randomDefender.skills.positioning;
  } else {
    // Skaters' defense skill
    saveSkill = randomDefender.skills.defense + randomDefender.skills.stickChecking;
  }

  // Calculate shot and save chances
  const shotChance = shotSkill - saveSkill;

  // Determine if the shot is successful
  const shotOutcome = Math.random() * 100 < shotChance;

  return shotOutcome;
};

export const simulateShotOutcome = (scorer, goalie, isBreakaway = false) => {
  const shooterSkill = scorer.skills.wristShotAccuracy * 0.3
    + scorer.skills.wristShotPower * 0.2
    + scorer.skills.speed * 0.3
    + (isBreakaway ? scorer.skills.deking * 0.2 : scorer.skills.hockeyIQ * 0.1);

  const goalieSkill = goalie.skills.glove * 0.3
    + goalie.skills.reflexes * 0.3
    + goalie.skills.positioning * 0.2
    + goalie.skills.agility * 0.2;

  const shotChance = shooterSkill / (shooterSkill + goalieSkill * 1.5);
  return Math.random() < shotChance;
};

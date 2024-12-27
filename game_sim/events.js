export const getRandomEvent = () => {
  const eventType = Math.random();
  if (eventType < 0.1) return 'penalty';
  if (eventType < 0.15) return 'injury';
  if (eventType < 0.25) return 'turnover';
  if (eventType < 0.35) return 'hit';
  if (eventType < 0.45) return 'breakaway';
  return 'normalPlay';
};

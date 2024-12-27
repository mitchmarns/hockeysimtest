export class GameState {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.scores = { home: 0, away: 0 };
    this.penalizedPlayers = { home: {}, away: {} };
    this.injuredPlayers = {};
    this.gameLog = [];
  }

  addLog(message) {
    this.gameLog.push(message);
  }

  updateScore(team, amount) {
    this.scores[team] += amount;
  }
}

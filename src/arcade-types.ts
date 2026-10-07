export type GameId = 'snake' | 'bricks' | 'dino' | 'bounce';

export interface LeaderboardEntry {
  name: string;   // 3 uppercase A-Z
  score: number;
  ts: number;     // Date.now()
}

export interface GameOverPayload {
  game: GameId;
  score: number;
}

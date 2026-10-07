import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { GameId, LeaderboardEntry } from '../src/arcade-types';

const redis = Redis.fromEnv();

const VALID_GAMES: GameId[] = ['snake', 'bricks', 'dino', 'bounce'];
const MAX_ENTRIES = 10;
const SCORE_CAPS: Record<GameId, number> = {
  snake: 400,
  bricks: 5000,
  dino: 9999,
  bounce: 9999,
};

function key(game: GameId): string {
  return `arcade:lb:${game}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const game = req.query.game as string;
    if (!VALID_GAMES.includes(game as GameId)) {
      return res.status(400).json({ error: 'Invalid game' });
    }

    const raw = await redis.zrange<string[]>(key(game as GameId), 0, MAX_ENTRIES - 1, { rev: true });
    const entries: LeaderboardEntry[] = raw.map(m => typeof m === 'string' ? JSON.parse(m) : m);

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ entries });
  }

  if (req.method === 'POST') {
    const { game, name, score } = req.body ?? {};

    if (!VALID_GAMES.includes(game)) {
      return res.status(400).json({ error: 'Invalid game' });
    }
    if (typeof name !== 'string' || !/^[A-Z]{3}$/.test(name)) {
      return res.status(400).json({ error: 'Name must be 3 uppercase letters' });
    }
    if (typeof score !== 'number' || !Number.isInteger(score) || score < 1) {
      return res.status(400).json({ error: 'Invalid score' });
    }
    if (score > SCORE_CAPS[game as GameId]) {
      return res.status(400).json({ error: 'Score too high' });
    }

    const entry: LeaderboardEntry = { name, score, ts: Date.now() };
    await redis.zadd(key(game as GameId), { score, member: JSON.stringify(entry) });

    // Trim to top 10
    const total = await redis.zcard(key(game as GameId));
    if (total > MAX_ENTRIES) {
      await redis.zremrangebyrank(key(game as GameId), 0, total - MAX_ENTRIES - 1);
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

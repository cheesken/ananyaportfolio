import { useRef, useEffect, useCallback } from 'react';
import type { GameOverPayload } from '../../arcade-types';

const W = 400;
const H = 500;
const BG = '#0a0a0a';
const FG = '#00ff41';
const PAD_W = 56;
const PAD_H = 8;
const BALL_R = 4;
const BRICK_H = 14;
const BRICK_GAP = 2;
const COLS = 10;

// brick colors by HP: 1-hit → 4-hit
const HP_COLORS = ['#4dabf7', '#69db7c', '#ffd43b', '#ff6b6b'];
// indestructible
const STEEL = '#555';

interface Brick { x: number; y: number; w: number; h: number; hp: number; max: number; steel: boolean }
interface PowerUp { x: number; y: number; type: 'wide' | 'multi' | 'slow'; vy: number }

// ---------- Level patterns ----------
function makeBricks(level: number): Brick[] {
  const bricks: Brick[] = [];
  const bw = (W - (COLS + 1) * BRICK_GAP) / COLS;
  const patterns = [patternClassic, patternDiamond, patternFortress, patternCheckerboard, patternArrow];
  const fn = patterns[(level - 1) % patterns.length];
  const grid = fn();
  // scale HP with level
  const hpBoost = Math.floor((level - 1) / patterns.length);

  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 0) return;
      const steel = cell === -1;
      const baseHp = steel ? 1 : cell;
      const hp = steel ? 1 : Math.min(baseHp + hpBoost, 4);
      bricks.push({
        x: BRICK_GAP + c * (bw + BRICK_GAP),
        y: 50 + r * (BRICK_H + BRICK_GAP),
        w: bw, h: BRICK_H,
        hp, max: hp, steel,
      });
    });
  });
  return bricks;
}

function patternClassic(): number[][] {
  return Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: COLS }, () => r < 2 ? 3 : r < 4 ? 2 : 1)
  );
}

function patternDiamond(): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(COLS).fill(0));
  const cx = COLS / 2;
  for (let r = 0; r < 7; r++) {
    const half = r <= 3 ? r : 6 - r;
    for (let c = Math.floor(cx - half); c < Math.ceil(cx + half); c++) {
      if (c >= 0 && c < COLS) grid[r][c] = r <= 1 || r >= 5 ? 1 : r === 3 ? 3 : 2;
    }
  }
  // steel core
  grid[3][Math.floor(cx)] = -1;
  if (COLS % 2 === 0) grid[3][Math.floor(cx) - 1] = -1;
  return grid;
}

function patternFortress(): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(COLS).fill(0));
  // walls
  for (let r = 0; r < 7; r++) {
    grid[r][0] = -1; grid[r][COLS - 1] = -1;
    if (r === 0 || r === 6) for (let c = 0; c < COLS; c++) grid[r][c] = r === 0 ? -1 : 2;
    else for (let c = 1; c < COLS - 1; c++) grid[r][c] = grid[r][c] || (r < 3 ? 3 : 1);
  }
  // gate opening
  grid[6][4] = 0; grid[6][5] = 0;
  return grid;
}

function patternCheckerboard(): number[][] {
  return Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => (r + c) % 2 === 0 ? (r < 2 ? 3 : 2) : 0)
  );
}

function patternArrow(): number[][] {
  const grid: number[][] = Array.from({ length: 8 }, () => Array(COLS).fill(0));
  const cx = Math.floor(COLS / 2);
  for (let r = 0; r < 8; r++) {
    if (r < 5) {
      // arrow head
      const half = r;
      for (let c = cx - half; c <= cx + half; c++) {
        if (c >= 0 && c < COLS) grid[r][c] = r < 2 ? 3 : 2;
      }
    } else {
      // arrow shaft
      for (let c = cx - 1; c <= cx + 1; c++) {
        if (c >= 0 && c < COLS) grid[r][c] = 1;
      }
    }
  }
  return grid;
}

// ---------- Component ----------
export default function BrickBreakerGame({ onGameOver }: { onGameOver?: (p: GameOverPayload) => void }) {
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef(initState());

  function initState() {
    return {
      padX: W / 2 - PAD_W / 2,
      padW: PAD_W,
      balls: [{ x: W / 2, y: H - 36, vx: 2.5, vy: -3.5 }],
      bricks: makeBricks(1),
      powerUps: [] as PowerUp[],
      score: 0,
      best: Number(sessionStorage.getItem('arcade-best-bricks')) || 0,
      lives: 3,
      level: 1,
      over: false,
      won: false,
      started: false,
      combo: 0,
    };
  }

  const reset = useCallback(() => {
    const s = stateRef.current;
    const best = Math.max(s.best, s.score);
    sessionStorage.setItem('arcade-best-bricks', String(best));
    const fresh = initState();
    fresh.best = best;
    Object.assign(s, fresh);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // bricks
      s.bricks.forEach(b => {
        if (b.hp <= 0 && !b.steel) return;
        ctx.fillStyle = b.steel ? STEEL : HP_COLORS[b.hp - 1] || HP_COLORS[0];
        ctx.fillRect(b.x, b.y, b.w, b.h);
        // crack lines for damaged bricks
        if (!b.steel && b.hp < b.max) {
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.lineWidth = 1;
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          ctx.beginPath();
          ctx.moveTo(cx - 4, cy - 3);
          ctx.lineTo(cx + 3, cy + 2);
          if (b.max - b.hp >= 2) {
            ctx.moveTo(cx + 2, cy - 4);
            ctx.lineTo(cx - 3, cy + 3);
          }
          ctx.stroke();
        }
      });

      // power-ups
      s.powerUps.forEach(p => {
        const color = p.type === 'wide' ? '#ff6b6b' : p.type === 'multi' ? '#69db7c' : '#4dabf7';
        ctx.fillStyle = color;
        ctx.fillRect(p.x - 8, p.y - 4, 16, 8);
        ctx.fillStyle = BG;
        ctx.font = '7px "Space Mono", monospace';
        ctx.textAlign = 'center';
        const label = p.type === 'wide' ? 'W' : p.type === 'multi' ? 'M' : 'S';
        ctx.fillText(label, p.x, p.y + 3);
        ctx.textAlign = 'start';
      });

      // paddle
      ctx.fillStyle = FG;
      ctx.fillRect(s.padX, H - 24, s.padW, PAD_H);

      // balls
      s.balls.forEach(ball => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
      });

      // HUD
      ctx.fillStyle = FG;
      ctx.font = '12px "Space Mono", monospace';
      ctx.fillText(`SCORE: ${s.score}`, 8, 18);
      ctx.fillText(`LVL ${s.level}`, 8, 34);

      ctx.textAlign = 'right';
      ctx.fillText(`♥`.repeat(s.lives), W - 10, 18);
      if (s.best > 0) {
        ctx.fillStyle = 'rgba(0,255,65,0.4)';
        ctx.font = '10px "Space Mono", monospace';
        ctx.fillText(`BEST: ${s.best}`, W - 10, 34);
      }
      ctx.textAlign = 'start';

      // combo
      if (s.combo >= 3) {
        ctx.fillStyle = '#ffd43b';
        ctx.font = '10px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`COMBO x${s.combo}`, W / 2, 44);
        ctx.textAlign = 'start';
      }

      if (!s.started && !s.over) {
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEFT / RIGHT to move', W / 2, H / 2 + 20);
        ctx.fillText('SPACE to launch', W / 2, H / 2 + 40);
        ctx.textAlign = 'start';
      }

      if (s.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = s.won ? FG : '#ff6b6b';
        ctx.font = '20px "Space Mono", monospace';
        ctx.fillText(s.won ? `LEVEL ${s.level} CLEAR!` : 'GAME OVER', W / 2, H / 2 - 16);
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 8);
        if (s.score >= s.best && s.score > 0) {
          ctx.fillStyle = '#ffd43b';
          ctx.fillText('NEW BEST!', W / 2, H / 2 + 28);
        }
        ctx.fillStyle = FG;
        ctx.font = '12px "Space Mono", monospace';
        ctx.fillText(s.won ? 'SPACE for next level' : 'Press R', W / 2, H / 2 + 50);
        ctx.textAlign = 'start';
      }
    }

    function update() {
      raf = requestAnimationFrame(update);
      const s = stateRef.current;
      if (s.over || !s.started) { draw(); return; }

      // paddle (wraps around horizontally)
      const speed = 6;
      if (keysRef.current.has('ArrowLeft')) s.padX -= speed;
      if (keysRef.current.has('ArrowRight')) s.padX += speed;
      if (s.padX > W) s.padX = -s.padW;
      if (s.padX + s.padW < 0) s.padX = W;

      // power-ups fall
      s.powerUps.forEach(p => { p.y += p.vy; });
      // catch power-ups
      s.powerUps = s.powerUps.filter(p => {
        if (p.y + 4 >= H - 24 && p.y - 4 <= H - 16 && p.x >= s.padX && p.x <= s.padX + s.padW) {
          if (p.type === 'wide') s.padW = Math.min(100, s.padW + 20);
          if (p.type === 'multi' && s.balls.length < 8) {
            const b = s.balls[0];
            s.balls.push(
              { x: b.x, y: b.y, vx: b.vx + 1, vy: -Math.abs(b.vy) },
              { x: b.x, y: b.y, vx: b.vx - 1, vy: -Math.abs(b.vy) },
            );
          }
          if (p.type === 'slow') {
            s.balls.forEach(b => { b.vx *= 0.7; b.vy *= 0.7; });
          }
          return false;
        }
        return p.y < H + 20;
      });

      // balls
      const deadBalls: number[] = [];
      s.balls.forEach((ball, bi) => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // wall bounces
        if (ball.x <= BALL_R) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
        if (ball.x >= W - BALL_R) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
        if (ball.y <= BALL_R) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }

        // paddle collision
        if (
          ball.vy > 0 &&
          ball.y + BALL_R >= H - 24 &&
          ball.y + BALL_R <= H - 14 &&
          ball.x >= s.padX - BALL_R &&
          ball.x <= s.padX + s.padW + BALL_R
        ) {
          ball.vy = -Math.abs(ball.vy);
          const offset = (ball.x - (s.padX + s.padW / 2)) / (s.padW / 2);
          ball.vx = offset * 4;
          // maintain consistent speed
          const spd = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          const target = 4 + s.level * 0.3;
          ball.vx = (ball.vx / spd) * target;
          ball.vy = (ball.vy / spd) * target;
          s.combo = 0;
        }

        // brick collision
        for (const b of s.bricks) {
          if (b.hp <= 0 && !b.steel) continue;
          if (
            ball.x + BALL_R > b.x &&
            ball.x - BALL_R < b.x + b.w &&
            ball.y + BALL_R > b.y &&
            ball.y - BALL_R < b.y + b.h
          ) {
            // determine bounce direction
            const overlapL = (ball.x + BALL_R) - b.x;
            const overlapR = (b.x + b.w) - (ball.x - BALL_R);
            const overlapT = (ball.y + BALL_R) - b.y;
            const overlapB = (b.y + b.h) - (ball.y - BALL_R);
            const minO = Math.min(overlapL, overlapR, overlapT, overlapB);
            if (minO === overlapT || minO === overlapB) ball.vy *= -1;
            else ball.vx *= -1;

            if (!b.steel) {
              b.hp--;
              s.combo++;
              const comboMult = s.combo >= 5 ? 3 : s.combo >= 3 ? 2 : 1;
              s.score += 10 * comboMult;

              // drop power-up chance
              if (b.hp <= 0 && Math.random() < 0.2) {
                const types: PowerUp['type'][] = ['wide', 'multi', 'slow'];
                s.powerUps.push({
                  x: b.x + b.w / 2,
                  y: b.y + b.h,
                  type: types[Math.floor(Math.random() * types.length)],
                  vy: 1.5,
                });
              }
            }
            break; // one brick per frame per ball
          }
        }

        // fell off bottom
        if (ball.y - BALL_R > H) deadBalls.push(bi);
      });

      // remove dead balls
      for (let i = deadBalls.length - 1; i >= 0; i--) {
        s.balls.splice(deadBalls[i], 1);
      }

      // all balls lost
      if (s.balls.length === 0) {
        s.lives--;
        s.padW = PAD_W; // reset paddle width
        s.combo = 0;
        if (s.lives <= 0) {
          s.best = Math.max(s.best, s.score); sessionStorage.setItem('arcade-best-bricks', String(s.best));
          s.over = true;
          onGameOverRef.current?.({ game: 'bricks', score: s.score });
        } else {
          // respawn ball
          s.balls.push({ x: W / 2, y: H - 36, vx: 2.5, vy: -(3.5 + s.level * 0.3) });
        }
      }

      // check level clear (all non-steel bricks destroyed)
      if (s.bricks.every(b => b.steel || b.hp <= 0)) {
        s.best = Math.max(s.best, s.score); sessionStorage.setItem('arcade-best-bricks', String(s.best));
        s.over = true;
        s.won = true;
      }

      draw();
    }

    function nextLevel() {
      const s = stateRef.current;
      s.level++;
      s.bricks = makeBricks(s.level);
      s.balls = [{ x: W / 2, y: H - 36, vx: 2.5, vy: -(3.5 + s.level * 0.3) }];
      s.powerUps = [];
      s.padX = W / 2 - PAD_W / 2;
      s.padW = PAD_W;
      s.over = false;
      s.won = false;
      s.started = false;
      s.combo = 0;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') e.preventDefault();
      if (e.key === 'r' || e.key === 'R') { reset(); return; }

      const s = stateRef.current;
      if (s.over && s.won && e.key === ' ') { nextLevel(); return; }
      if (!s.started && !s.over && e.key === ' ') s.started = true;

      keysRef.current.add(e.key);
    }
    function onKeyUp(e: KeyboardEvent) { keysRef.current.delete(e.key); }

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [reset]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full max-w-[400px] rounded"
      style={{ aspectRatio: `${W}/${H}` }}
    />
  );
}

import { useRef, useEffect, useCallback } from 'react';

const W = 400;
const H = 400;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_W = W / BRICK_COLS;
const BRICK_H = 16;
const BRICK_TOP = 40;
const PAD_W = 60;
const PAD_H = 8;
const BALL_R = 4;
const BG = '#0a0a0a';
const FG = '#00ff41';
const COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7'];

function makeBricks() {
  const bricks: { x: number; y: number; w: number; h: number; color: string; alive: boolean }[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: c * BRICK_W + 2,
        y: BRICK_TOP + r * (BRICK_H + 3),
        w: BRICK_W - 4,
        h: BRICK_H,
        color: COLORS[r],
        alive: true,
      });
    }
  }
  return bricks;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef({
    padX: W / 2 - PAD_W / 2,
    ball: { x: W / 2, y: H - 40, vx: 3, vy: -3 },
    bricks: makeBricks(),
    score: 0,
    over: false,
    won: false,
  });

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.padX = W / 2 - PAD_W / 2;
    s.ball = { x: W / 2, y: H - 40, vx: 3, vy: -3 };
    s.bricks = makeBricks();
    s.score = 0;
    s.over = false;
    s.won = false;
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
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });

      // paddle
      ctx.fillStyle = FG;
      ctx.fillRect(s.padX, H - 20, PAD_W, PAD_H);

      // ball
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      // score
      ctx.font = '14px "Space Mono", monospace';
      ctx.fillText(`SCORE: ${s.score}`, 8, 20);

      if (s.over || s.won) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = s.won ? FG : '#ff6b6b';
        ctx.font = '20px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.won ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2 - 10);
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.fillText(`Score: ${s.score} — Press R`, W / 2, H / 2 + 16);
        ctx.textAlign = 'start';
      }
    }

    function update() {
      raf = requestAnimationFrame(update);
      const s = stateRef.current;
      if (s.over || s.won) { draw(); return; }

      // paddle
      const speed = 5;
      if (keysRef.current.has('ArrowLeft')) s.padX = Math.max(0, s.padX - speed);
      if (keysRef.current.has('ArrowRight')) s.padX = Math.min(W - PAD_W, s.padX + speed);

      // ball
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;

      // walls
      if (s.ball.x <= BALL_R || s.ball.x >= W - BALL_R) s.ball.vx *= -1;
      if (s.ball.y <= BALL_R) s.ball.vy *= -1;

      // bottom
      if (s.ball.y >= H) { s.over = true; draw(); return; }

      // paddle
      if (s.ball.vy > 0 &&
        s.ball.y + BALL_R >= H - 20 &&
        s.ball.y + BALL_R <= H - 12 &&
        s.ball.x >= s.padX && s.ball.x <= s.padX + PAD_W) {
        s.ball.vy = -Math.abs(s.ball.vy);
        s.ball.vx += ((s.ball.x - (s.padX + PAD_W / 2)) / (PAD_W / 2)) * 2;
      }

      // bricks
      s.bricks.forEach(b => {
        if (!b.alive) return;
        if (s.ball.x + BALL_R > b.x && s.ball.x - BALL_R < b.x + b.w &&
          s.ball.y + BALL_R > b.y && s.ball.y - BALL_R < b.y + b.h) {
          b.alive = false;
          s.ball.vy *= -1;
          s.score += 10;
        }
      });

      if (s.bricks.every(b => !b.alive)) s.won = true;
      draw();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
      if (e.key === 'r' || e.key === 'R') { reset(); return; }
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

  return <canvas ref={canvasRef} width={W} height={H} className="w-full max-w-[400px] aspect-square rounded" />;
}

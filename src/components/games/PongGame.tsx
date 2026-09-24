import { useRef, useEffect, useCallback } from 'react';

const W = 400;
const H = 300;
const PAD_W = 8;
const PAD_H = 60;
const BALL_R = 5;
const BG = '#0a0a0a';
const FG = '#00ff41';
const WIN_SCORE = 5;

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef({
    playerY: H / 2 - PAD_H / 2,
    aiY: H / 2 - PAD_H / 2,
    ball: { x: W / 2, y: H / 2, vx: 3, vy: 2 },
    playerScore: 0,
    aiScore: 0,
    over: false,
    winner: '',
  });

  const resetBall = useCallback(() => {
    const s = stateRef.current;
    s.ball = { x: W / 2, y: H / 2, vx: (Math.random() > 0.5 ? 3 : -3), vy: (Math.random() - 0.5) * 4 };
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.playerY = H / 2 - PAD_H / 2;
    s.aiY = H / 2 - PAD_H / 2;
    s.playerScore = 0;
    s.aiScore = 0;
    s.over = false;
    s.winner = '';
    resetBall();
  }, [resetBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // center line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(0,255,65,0.2)';
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // paddles
      ctx.fillStyle = FG;
      ctx.fillRect(12, s.playerY, PAD_W, PAD_H);
      ctx.fillRect(W - 12 - PAD_W, s.aiY, PAD_W, PAD_H);

      // ball
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      // scores
      ctx.font = '24px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.playerScore}`, W / 2 - 40, 30);
      ctx.fillText(`${s.aiScore}`, W / 2 + 40, 30);
      ctx.textAlign = 'start';

      if (s.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '20px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.winner === 'player' ? 'YOU WIN!' : 'AI WINS', W / 2, H / 2 - 10);
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.fillText('Press R to restart', W / 2, H / 2 + 16);
        ctx.textAlign = 'start';
      }
    }

    function update() {
      raf = requestAnimationFrame(update);
      const s = stateRef.current;
      if (s.over) { draw(); return; }

      // player input
      const speed = 4;
      if (keysRef.current.has('ArrowUp')) s.playerY = Math.max(0, s.playerY - speed);
      if (keysRef.current.has('ArrowDown')) s.playerY = Math.min(H - PAD_H, s.playerY + speed);

      // AI
      const aiCenter = s.aiY + PAD_H / 2;
      const diff = s.ball.y - aiCenter;
      s.aiY += Math.sign(diff) * Math.min(Math.abs(diff), 2.8);
      s.aiY = Math.max(0, Math.min(H - PAD_H, s.aiY));

      // ball
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;

      // top/bottom bounce
      if (s.ball.y <= BALL_R || s.ball.y >= H - BALL_R) s.ball.vy *= -1;

      // paddle collisions
      if (s.ball.x - BALL_R <= 20 && s.ball.y >= s.playerY && s.ball.y <= s.playerY + PAD_H && s.ball.vx < 0) {
        s.ball.vx = Math.abs(s.ball.vx) * 1.05;
        s.ball.vy += (s.ball.y - (s.playerY + PAD_H / 2)) * 0.1;
      }
      if (s.ball.x + BALL_R >= W - 20 && s.ball.y >= s.aiY && s.ball.y <= s.aiY + PAD_H && s.ball.vx > 0) {
        s.ball.vx = -Math.abs(s.ball.vx) * 1.05;
        s.ball.vy += (s.ball.y - (s.aiY + PAD_H / 2)) * 0.1;
      }

      // scoring
      if (s.ball.x < 0) {
        s.aiScore++;
        if (s.aiScore >= WIN_SCORE) { s.over = true; s.winner = 'ai'; }
        else resetBall();
      }
      if (s.ball.x > W) {
        s.playerScore++;
        if (s.playerScore >= WIN_SCORE) { s.over = true; s.winner = 'player'; }
        else resetBall();
      }

      draw();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
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
  }, [reset, resetBall]);

  return <canvas ref={canvasRef} width={W} height={H} className="w-full max-w-[400px] rounded" style={{ aspectRatio: `${W}/${H}` }} />;
}

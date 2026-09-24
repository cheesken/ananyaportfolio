import { useRef, useEffect, useCallback } from 'react';

const W = 300;
const H = 400;
const GRAVITY = 0.35;
const FLAP = -6;
const PIPE_W = 40;
const GAP = 120;
const PIPE_SPEED = 2;
const BIRD_R = 10;
const BG = '#0a0a0a';
const FG = '#00ff41';

interface Pipe { x: number; topH: number }

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    birdY: H / 2,
    vel: 0,
    pipes: [] as Pipe[],
    score: 0,
    over: false,
    started: false,
    frame: 0,
  });

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.birdY = H / 2;
    s.vel = 0;
    s.pipes = [];
    s.score = 0;
    s.over = false;
    s.started = false;
    s.frame = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const birdX = 60;

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // pipes
      ctx.fillStyle = FG;
      s.pipes.forEach(p => {
        ctx.fillRect(p.x, 0, PIPE_W, p.topH);
        ctx.fillRect(p.x, p.topH + GAP, PIPE_W, H - p.topH - GAP);
      });

      // bird
      ctx.fillStyle = '#ffd43b';
      ctx.beginPath();
      ctx.arc(birdX, s.birdY, BIRD_R, 0, Math.PI * 2);
      ctx.fill();

      // score
      ctx.fillStyle = FG;
      ctx.font = '18px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.score}`, W / 2, 30);
      ctx.textAlign = 'start';

      if (!s.started && !s.over) {
        ctx.fillStyle = FG;
        ctx.font = '14px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE to flap', W / 2, H / 2 + 40);
        ctx.textAlign = 'start';
      }

      if (s.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '20px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.fillText(`Score: ${s.score} — Press R`, W / 2, H / 2 + 16);
        ctx.textAlign = 'start';
      }
    }

    function update() {
      raf = requestAnimationFrame(update);
      const s = stateRef.current;
      if (s.over || !s.started) { draw(); return; }

      s.vel += GRAVITY;
      s.birdY += s.vel;
      s.frame++;

      // spawn pipes
      if (s.frame % 90 === 0) {
        const topH = 40 + Math.random() * (H - GAP - 80);
        s.pipes.push({ x: W, topH });
      }

      // move pipes
      s.pipes.forEach(p => { p.x -= PIPE_SPEED; });

      // score
      s.pipes.forEach(p => {
        if (Math.abs(p.x + PIPE_W - birdX) < PIPE_SPEED) s.score++;
      });

      // remove offscreen
      s.pipes = s.pipes.filter(p => p.x + PIPE_W > -10);

      // collision
      if (s.birdY - BIRD_R < 0 || s.birdY + BIRD_R > H) { s.over = true; }
      s.pipes.forEach(p => {
        if (birdX + BIRD_R > p.x && birdX - BIRD_R < p.x + PIPE_W) {
          if (s.birdY - BIRD_R < p.topH || s.birdY + BIRD_R > p.topH + GAP) {
            s.over = true;
          }
        }
      });

      draw();
    }

    function flap() {
      const s = stateRef.current;
      if (s.over) return;
      if (!s.started) s.started = true;
      s.vel = FLAP;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === ' ') { e.preventDefault(); flap(); }
      if (e.key === 'r' || e.key === 'R') reset();
    }
    function onClick() { flap(); }

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('click', onClick);
    raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('click', onClick);
    };
  }, [reset]);

  return <canvas ref={canvasRef} width={W} height={H} className="w-full max-w-[300px] rounded cursor-pointer" style={{ aspectRatio: `${W}/${H}` }} />;
}

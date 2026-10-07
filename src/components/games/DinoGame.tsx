import { useRef, useEffect, useCallback } from 'react';
import type { GameOverPayload } from '../../arcade-types';

const W = 400;
const H = 200;
const BG = '#0a0a0a';
const FG = '#00ff41';
const GROUND_Y = H - 20;
const GRAVITY = 0.6;
const JUMP_VEL = -10;
const DUCK_H = 16;
const STAND_H = 30;
const DINO_W = 20;
const DINO_X = 50;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  y: number;         // top of obstacle
  type: 'cactus' | 'bird';
}

function spawnObstacle(x: number, speed: number): Obstacle {
  // birds only appear at higher speeds
  if (speed > 5 && Math.random() < 0.3) {
    const birdY = Math.random() < 0.5 ? GROUND_Y - 45 : GROUND_Y - 25;
    return { x, w: 20, h: 12, y: birdY, type: 'bird' };
  }
  // cactus variants
  const variant = Math.random();
  if (variant < 0.3) return { x, w: 10, h: 28, y: GROUND_Y - 28, type: 'cactus' };
  if (variant < 0.6) return { x, w: 16, h: 36, y: GROUND_Y - 36, type: 'cactus' };
  // cluster
  return { x, w: 28, h: 24, y: GROUND_Y - 24, type: 'cactus' };
}

export default function DinoGame({ onGameOver }: { onGameOver?: (p: GameOverPayload) => void }) {
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef(initState());

  function initState() {
    return {
      dinoY: GROUND_Y,
      dinoH: STAND_H,
      vel: 0,
      jumping: false,
      ducking: false,
      obstacles: [] as Obstacle[],
      speed: 4,
      dist: 0,
      score: 0,
      best: Number(sessionStorage.getItem('arcade-best-dino')) || 0,
      over: false,
      started: false,
      frame: 0,
      nextSpawn: 80,
      legFrame: 0,
    };
  }

  const reset = useCallback(() => {
    const s = stateRef.current;
    const best = Math.max(s.best, s.score);
    sessionStorage.setItem('arcade-best-dino', String(best));
    const fresh = initState();
    fresh.best = best;
    Object.assign(s, fresh);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    function drawDino(x: number, y: number, h: number, legFrame: number) {
      const w = DINO_W;
      ctx.fillStyle = FG;

      if (h === DUCK_H) {
        // ducking: wider, shorter
        ctx.fillRect(x, y - h, w + 6, h);
        // eye
        ctx.fillStyle = BG;
        ctx.fillRect(x + w + 1, y - h + 2, 3, 3);
        ctx.fillStyle = FG;
        // legs
        if (legFrame % 2 === 0) {
          ctx.fillRect(x + 4, y, 3, 4);
          ctx.fillRect(x + 14, y, 3, 4);
        } else {
          ctx.fillRect(x + 8, y, 3, 4);
          ctx.fillRect(x + 18, y, 3, 4);
        }
      } else {
        // standing: body
        ctx.fillRect(x + 2, y - h, w - 2, h - 6);
        // head
        ctx.fillRect(x + 4, y - h - 8, w - 2, 10);
        // eye
        ctx.fillStyle = BG;
        ctx.fillRect(x + w - 4, y - h - 5, 3, 3);
        ctx.fillStyle = FG;
        // tail
        ctx.fillRect(x - 4, y - h + 4, 6, 4);
        // legs
        if (legFrame % 2 === 0) {
          ctx.fillRect(x + 4, y, 4, 6);
          ctx.fillRect(x + 12, y, 4, 6);
        } else {
          ctx.fillRect(x + 6, y, 4, 6);
          ctx.fillRect(x + 14, y, 4, 6);
        }
      }
    }

    function drawCactus(x: number, y: number, w: number, h: number) {
      ctx.fillStyle = FG;
      // main stem
      ctx.fillRect(x + w / 2 - 3, y, 6, h);
      if (w > 12) {
        // arms
        ctx.fillRect(x, y + 6, w, 4);
        ctx.fillRect(x, y + 4, 4, 8);
        ctx.fillRect(x + w - 4, y + 2, 4, 10);
      }
    }

    function drawBird(x: number, y: number, frame: number) {
      ctx.fillStyle = '#ffd43b';
      // body
      ctx.fillRect(x + 4, y + 4, 14, 6);
      // beak
      ctx.fillRect(x + 18, y + 5, 4, 3);
      // wings flap
      if (frame % 2 === 0) {
        ctx.fillRect(x + 6, y, 8, 4);
      } else {
        ctx.fillRect(x + 6, y + 10, 8, 4);
      }
    }

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // ground line
      ctx.strokeStyle = 'rgba(0,255,65,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();

      // ground texture (scrolling dots)
      ctx.fillStyle = 'rgba(0,255,65,0.15)';
      const offset = Math.floor(s.dist) % 20;
      for (let i = -1; i < W / 20 + 1; i++) {
        ctx.fillRect(i * 20 - offset, GROUND_Y + 4, 2, 1);
        ctx.fillRect(i * 20 - offset + 10, GROUND_Y + 10, 3, 1);
      }

      // obstacles
      s.obstacles.forEach(o => {
        if (o.type === 'cactus') {
          drawCactus(o.x, o.y, o.w, o.h);
        } else {
          drawBird(o.x, o.y, Math.floor(s.frame / 8));
        }
      });

      // dino
      drawDino(DINO_X, s.dinoY, s.dinoH, Math.floor(s.frame / 5));

      // score
      ctx.fillStyle = FG;
      ctx.font = '14px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, W - 10, 20);

      if (s.best > 0) {
        ctx.fillStyle = 'rgba(0,255,65,0.4)';
        ctx.font = '11px "Space Mono", monospace';
        ctx.fillText(`HI ${String(s.best).padStart(5, '0')}`, W - 80, 20);
      }
      ctx.textAlign = 'start';

      // start prompt
      if (!s.started && !s.over) {
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ontouchstart' in window ? 'TAP to jump' : 'SPACE to jump — DOWN to duck', W / 2, H / 2);
        ctx.textAlign = 'start';
      }

      if (s.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '18px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 4);
        if (s.score >= s.best && s.score > 0) {
          ctx.fillStyle = '#ffd43b';
          ctx.fillText('NEW BEST!', W / 2, H / 2 + 24);
        }
        ctx.fillStyle = FG;
        ctx.font = '11px "Space Mono", monospace';
        ctx.fillText('ontouchstart' in window ? 'Tap to restart' : 'Press R', W / 2, H / 2 + 44);
        ctx.textAlign = 'start';
      }
    }

    function update() {
      raf = requestAnimationFrame(update);
      const s = stateRef.current;
      if (s.over || !s.started) { draw(); return; }

      s.frame++;

      // ducking
      s.ducking = keysRef.current.has('ArrowDown');
      s.dinoH = s.ducking && !s.jumping ? DUCK_H : STAND_H;

      // jumping
      if (s.jumping) {
        s.vel += GRAVITY;
        s.dinoY += s.vel;
        if (s.dinoY >= GROUND_Y) {
          s.dinoY = GROUND_Y;
          s.vel = 0;
          s.jumping = false;
        }
      }

      // move obstacles
      s.obstacles.forEach(o => { o.x -= s.speed; });
      s.obstacles = s.obstacles.filter(o => o.x + o.w > -20);

      // spawn
      s.nextSpawn--;
      if (s.nextSpawn <= 0) {
        s.obstacles.push(spawnObstacle(W + 20, s.speed));
        s.nextSpawn = 40 + Math.floor(Math.random() * 60);
      }

      // collision
      const dinoLeft = DINO_X;
      const dinoRight = DINO_X + DINO_W;
      const dinoTop = s.dinoY - s.dinoH;
      const dinoBottom = s.dinoY;

      for (const o of s.obstacles) {
        // shrink hitbox slightly for fairness
        const oLeft = o.x + 2;
        const oRight = o.x + o.w - 2;
        const oTop = o.y + 2;
        const oBottom = o.y + o.h - 2;

        if (dinoRight > oLeft && dinoLeft < oRight && dinoBottom > oTop && dinoTop < oBottom) {
          s.best = Math.max(s.best, s.score); sessionStorage.setItem('arcade-best-dino', String(s.best));
          s.over = true;
          onGameOverRef.current?.({ game: 'dino', score: s.score });
          draw();
          return;
        }
      }

      // scoring & speed
      s.dist += s.speed;
      s.score = Math.floor(s.dist / 10);
      s.speed = 4 + Math.floor(s.score / 50) * 0.5;
      if (s.speed > 10) s.speed = 10;

      draw();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
      if (e.key === 'r' || e.key === 'R') { reset(); return; }

      const s = stateRef.current;
      if (!s.started && !s.over) s.started = true;

      // jump
      if ((e.key === ' ' || e.key === 'ArrowUp') && !s.jumping) {
        s.jumping = true;
        s.vel = JUMP_VEL;
      }

      keysRef.current.add(e.key);
    }
    function onKeyUp(e: KeyboardEvent) { keysRef.current.delete(e.key); }
    function onClick() {
      const s = stateRef.current;
      if (s.over) { reset(); return; }
      if (!s.started) s.started = true;
      if (!s.jumping) { s.jumping = true; s.vel = JUMP_VEL; }
    }

    // Touch: tap anywhere to jump
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const s = stateRef.current;
      if (s.over) { reset(); return; }
      if (!s.started) s.started = true;
      if (!s.jumping) { s.jumping = true; s.vel = JUMP_VEL; }
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onClick);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, [reset]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full max-w-[400px] rounded cursor-pointer"
      style={{ aspectRatio: `${W}/${H}` }}
    />
  );
}

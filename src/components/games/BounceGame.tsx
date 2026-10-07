import { useRef, useEffect, useCallback } from 'react';
import type { GameOverPayload } from '../../arcade-types';

const W = 400;
const H = 400;
const BG = '#0a0a0a';
const FG = '#00ff41';
const BALL_R = 8;
const GRAVITY = 0.25;
const BOUNCE_VEL = -8.5;
const MOVE_SPEED = 4;
const SCROLL_SPEED = 1.5;
const PLAT_H = 8;
const RING_R = 7;
const SPIKE_H = 12;
const SPIKE_W = 12;

interface Platform { x: number; y: number; w: number; spikes?: boolean }
interface Ring { x: number; y: number; collected: boolean }

// Max height the ball can rise from a bounce: v²/(2g) ≈ 8.5²/(2*0.25) = 144px
const MAX_RISE = 120; // leave a little margin

function generateSegment(startX: number, prevY: number): { platforms: Platform[]; rings: Ring[] } {
  const platforms: Platform[] = [];
  const rings: Ring[] = [];
  const count = 3 + Math.floor(Math.random() * 2);
  let lastY = prevY;

  for (let i = 0; i < count; i++) {
    const w = 55 + Math.random() * 55;
    const gap = 80 + Math.random() * 50; // horizontal gap between platforms
    const x = startX + i * gap;

    // next platform Y: can go up (within reachable range) or down (within canvas)
    const minY = Math.max(100, lastY - MAX_RISE);
    const maxY = Math.min(H - 40, lastY + 80);
    const y = minY + Math.random() * (maxY - minY);

    const spikes = i > 0 && Math.random() < 0.15; // never spike the first in segment
    platforms.push({ x, y, w, spikes });

    // ring above platform
    if (!spikes && Math.random() < 0.6) {
      rings.push({ x: x + w / 2, y: y - 28, collected: false });
    }

    lastY = y;
  }
  return { platforms, rings };
}

export default function BounceGame({ onGameOver }: { onGameOver?: (p: GameOverPayload) => void }) {
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef(initState());

  function initState() {
    // starting platform under the ball
    const startPlat: Platform = { x: 40, y: 300, w: 100 };
    const seg = generateSegment(W * 0.6, 300);
    return {
      ballX: 90,
      ballY: 260,
      velX: 0,
      velY: 0,
      platforms: [startPlat, ...seg.platforms] as Platform[],
      rings: [...seg.rings] as Ring[],
      score: 0,
      ringBonus: 0,
      dist: 0,
      best: Number(sessionStorage.getItem('arcade-best-bounce')) || 0,
      over: false,
      started: false,
      onGround: true,
    };
  }

  const reset = useCallback(() => {
    const s = stateRef.current;
    const best = Math.max(s.best, s.score);
    sessionStorage.setItem('arcade-best-bounce', String(best));
    const fresh = initState();
    fresh.best = best;
    Object.assign(s, fresh);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    function drawBall(x: number, y: number) {
      // red ball with highlight
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(x - 2, y - 3, BALL_R * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSpike(x: number, y: number) {
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(x, y - SPIKE_H);
      ctx.lineTo(x - SPIKE_W / 2, y);
      ctx.lineTo(x + SPIKE_W / 2, y);
      ctx.closePath();
      ctx.fill();
    }

    function drawRing(x: number, y: number) {
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, RING_R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // platforms
      s.platforms.forEach(p => {
        ctx.fillStyle = FG;
        ctx.fillRect(p.x, p.y, p.w, PLAT_H);

        // spikes on top
        if (p.spikes) {
          const count = Math.floor(p.w / (SPIKE_W + 2));
          const startX = p.x + (p.w - count * (SPIKE_W + 2)) / 2 + SPIKE_W / 2;
          for (let i = 0; i < count; i++) {
            drawSpike(startX + i * (SPIKE_W + 2), p.y);
          }
        }
      });

      // rings
      s.rings.forEach(r => {
        if (!r.collected) drawRing(r.x, r.y);
      });

      // ball
      drawBall(s.ballX, s.ballY);

      // score top-center
      ctx.fillStyle = FG;
      ctx.font = '18px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.score}`, W / 2, 28);

      // best top-right
      if (s.best > 0) {
        ctx.font = '11px "Space Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(0,255,65,0.4)';
        ctx.fillText(`BEST: ${s.best}`, W - 10, 20);
      }
      ctx.textAlign = 'start';

      // start prompt
      if (!s.started && !s.over) {
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ontouchstart' in window ? 'TOUCH left/right to move' : 'ARROWS to move', W / 2, H / 2);
        ctx.textAlign = 'start';
      }

      if (s.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '20px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
        ctx.fillStyle = FG;
        ctx.font = '14px "Space Mono", monospace';
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 8);
        if (s.score >= s.best && s.score > 0) {
          ctx.fillStyle = '#ffd43b';
          ctx.fillText('NEW BEST!', W / 2, H / 2 + 30);
        }
        ctx.fillStyle = FG;
        ctx.font = '12px "Space Mono", monospace';
        ctx.fillText('ontouchstart' in window ? 'Tap to restart' : 'Press R', W / 2, H / 2 + 54);
        ctx.textAlign = 'start';
      }
    }

    function update() {
      raf = requestAnimationFrame(update);
      const s = stateRef.current;
      if (s.over || !s.started) { draw(); return; }

      // horizontal input
      s.velX = 0;
      if (keysRef.current.has('ArrowLeft')) s.velX = -MOVE_SPEED;
      if (keysRef.current.has('ArrowRight')) s.velX = MOVE_SPEED;

      // gravity
      s.velY += GRAVITY;
      s.ballX += s.velX;
      s.ballY += s.velY;

      // keep ball in horizontal bounds
      if (s.ballX < BALL_R) s.ballX = BALL_R;
      if (s.ballX > W - BALL_R) s.ballX = W - BALL_R;

      // ceiling bounce
      if (s.ballY < BALL_R) {
        s.ballY = BALL_R;
        s.velY = Math.abs(s.velY) * 0.5;
      }

      // scroll everything left
      const scroll = SCROLL_SPEED;
      s.platforms.forEach(p => { p.x -= scroll; });
      s.rings.forEach(r => { r.x -= scroll; });
      s.dist += scroll;

      // score from distance + ring bonuses
      s.score = Math.floor(s.dist / 40) + s.ringBonus;

      // remove offscreen platforms/rings, generate new ones
      s.platforms = s.platforms.filter(p => p.x + p.w > -20);
      s.rings = s.rings.filter(r => r.x > -20);

      // check if we need more platforms
      const rightmostPlat = s.platforms.reduce((best, p) => p.x + p.w > best.x + best.w ? p : best, s.platforms[0]);
      const rightmost = rightmostPlat.x + rightmostPlat.w;
      if (rightmost < W + 200) {
        const seg = generateSegment(rightmost + 60 + Math.random() * 40, rightmostPlat.y);
        s.platforms.push(...seg.platforms);
        s.rings.push(...seg.rings);
      }

      // platform collision (land on top)
      s.onGround = false;
      for (const p of s.platforms) {
        if (
          s.velY > 0 &&
          s.ballX + BALL_R > p.x &&
          s.ballX - BALL_R < p.x + p.w &&
          s.ballY + BALL_R >= p.y &&
          s.ballY + BALL_R <= p.y + PLAT_H + s.velY + 2
        ) {
          // spike collision
          if (p.spikes) {
            s.best = Math.max(s.best, s.score); sessionStorage.setItem('arcade-best-bounce', String(s.best));
            s.over = true;
            onGameOverRef.current?.({ game: 'bounce', score: s.score });
            draw();
            return;
          }
          // bounce!
          s.ballY = p.y - BALL_R;
          s.velY = BOUNCE_VEL;
          s.onGround = true;
          break;
        }
      }

      // ring collection
      s.rings.forEach(r => {
        if (r.collected) return;
        const dx = s.ballX - r.x;
        const dy = s.ballY - r.y;
        if (dx * dx + dy * dy < (BALL_R + RING_R) * (BALL_R + RING_R)) {
          r.collected = true;
          s.ringBonus += 5;
        }
      });

      // fell off bottom
      if (s.ballY - BALL_R > H) {
        s.best = Math.max(s.best, s.score); sessionStorage.setItem('arcade-best-bounce', String(s.best));
        s.over = true;
        onGameOverRef.current?.({ game: 'bounce', score: s.score });
      }

      draw();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
      if (e.key === 'r' || e.key === 'R') { reset(); return; }
      if (!stateRef.current.started && !stateRef.current.over) {
        stateRef.current.started = true;
      }
      keysRef.current.add(e.key);
    }
    function onKeyUp(e: KeyboardEvent) { keysRef.current.delete(e.key); }
    function onClick() {
      if (stateRef.current.over) { reset(); return; }
      if (!stateRef.current.started) stateRef.current.started = true;
    }

    // Touch: hold left/right half to move
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const s = stateRef.current;
      if (s.over) { reset(); return; }
      if (!s.started) s.started = true;
      const rect = canvas!.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      keysRef.current.delete('ArrowLeft');
      keysRef.current.delete('ArrowRight');
      if (x < rect.width / 2) keysRef.current.add('ArrowLeft');
      else keysRef.current.add('ArrowRight');
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      keysRef.current.delete('ArrowLeft');
      keysRef.current.delete('ArrowRight');
      if (x < rect.width / 2) keysRef.current.add('ArrowLeft');
      else keysRef.current.add('ArrowRight');
    }
    function onTouchEnd() {
      keysRef.current.delete('ArrowLeft');
      keysRef.current.delete('ArrowRight');
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [reset]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full max-w-[400px] aspect-square rounded cursor-pointer"
    />
  );
}

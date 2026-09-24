import { useRef, useEffect, useCallback } from 'react';

const COLS = 20;
const ROWS = 20;
const BG = '#0a0a0a';
const FG = '#00ff41';
const FOOD = '#ff6b6b';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10 },
    score: 0,
    over: false,
    tick: 0,
  });

  const spawnFood = useCallback(() => {
    const s = stateRef.current;
    let pos: { x: number; y: number };
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (s.snake.some(p => p.x === pos.x && p.y === pos.y));
    s.food = pos;
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 10 }];
    s.dir = { x: 1, y: 0 };
    s.nextDir = { x: 1, y: 0 };
    s.score = 0;
    s.over = false;
    spawnFood();
  }, [spawnFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cell = canvas.width / COLS;
    let raf: number;
    let last = 0;
    const speed = 120; // ms per tick

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // grid
      ctx.strokeStyle = 'rgba(0,255,65,0.06)';
      for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, canvas!.height);
        ctx.stroke();
      }
      for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(canvas!.width, i * cell);
        ctx.stroke();
      }

      // food
      ctx.fillStyle = FOOD;
      ctx.fillRect(s.food.x * cell + 2, s.food.y * cell + 2, cell - 4, cell - 4);

      // snake
      s.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#00ff41' : FG;
        ctx.globalAlpha = i === 0 ? 1 : 0.7;
        ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
      });
      ctx.globalAlpha = 1;

      // score
      ctx.fillStyle = FG;
      ctx.font = '14px "Space Mono", monospace';
      ctx.fillText(`SCORE: ${s.score}`, 8, canvas!.height - 8);

      if (s.over) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);
        ctx.fillStyle = FOOD;
        ctx.font = '20px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas!.width / 2, canvas!.height / 2 - 10);
        ctx.fillStyle = FG;
        ctx.font = '13px "Space Mono", monospace';
        ctx.fillText(`Score: ${s.score} — Press R`, canvas!.width / 2, canvas!.height / 2 + 16);
        ctx.textAlign = 'start';
      }
    }

    function update(time: number) {
      raf = requestAnimationFrame(update);
      const s = stateRef.current;
      if (s.over) { draw(); return; }
      if (time - last < speed) { draw(); return; }
      last = time;

      s.dir = s.nextDir;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
        s.snake.some(p => p.x === head.x && p.y === head.y)) {
        s.over = true;
        draw();
        return;
      }

      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score++;
        spawnFood();
      } else {
        s.snake.pop();
      }
      draw();
    }

    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      if (e.key === 'r' || e.key === 'R') { reset(); return; }
      const map: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      };
      const nd = map[e.key];
      if (nd && (nd.x + s.dir.x !== 0 || nd.y + s.dir.y !== 0)) {
        e.preventDefault();
        s.nextDir = nd;
      }
    }

    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(update);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  }, [reset, spawnFood]);

  return <canvas ref={canvasRef} width={400} height={400} className="w-full max-w-[400px] aspect-square rounded" />;
}

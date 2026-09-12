import { useEffect, useRef, useState } from 'react';
import Stamp from './Stamp';

export default function Curtain() {
  const [removed, setRemoved] = useState(false);
  const curtainRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const tickingRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const THRESHOLD = 520;

  useEffect(() => {
    if (removed) return;
    const timer = setTimeout(() => {
      if (hintRef.current && progressRef.current < 0.25) {
        hintRef.current.style.opacity = String(1 - Math.min(1, progressRef.current / 0.25));
        hintRef.current.dataset.visible = 'true';
      }
    }, 1100);
    return () => clearTimeout(timer);
  }, [removed]);

  useEffect(() => {
    if (removed) return;

    function render() {
      const p = progressRef.current;
      const stampFade = Math.min(1, p / 0.45);
      if (curtainRef.current) {
        curtainRef.current.style.transform = `translateY(-${p * 100}%)`;
      }
      if (stampRef.current) {
        stampRef.current.style.opacity = String(1 - stampFade);
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = hintRef.current.dataset.visible === 'true'
          ? String(1 - Math.min(1, p / 0.25))
          : '0';
      }
      tickingRef.current = false;
    }

    const SNAP_THRESHOLD = 0.35;
    let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null;

    function addProgress(delta: number) {
      if (doneRef.current) return;
      progressRef.current = Math.min(1, Math.max(0, progressRef.current + delta / THRESHOLD));
      if (!tickingRef.current) {
        requestAnimationFrame(render);
        tickingRef.current = true;
      }
      if (progressRef.current >= 1) finish();
    }

    function snapCheck() {
      if (doneRef.current) return;
      if (progressRef.current >= SNAP_THRESHOLD) {
        finish();
      }
    }

    function finish() {
      doneRef.current = true;
      if (curtainRef.current) {
        curtainRef.current.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        curtainRef.current.style.transform = 'translateY(-100%)';
      }
      cleanup();
      setTimeout(() => setRemoved(true), 850);
    }

    function cleanup() {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeydown);
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      addProgress(e.deltaY);
      // snap check after scrolling stops
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(snapCheck, 150);
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - e.touches[0].clientY;
      if (Math.abs(delta) > 10) finish();
    }

    function onTouchEnd() {
      snapCheck();
    }

    function onKeydown(e: KeyboardEvent) {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        addProgress(90);
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeydown);

    return cleanup;
  }, [removed]);

  if (removed) return null;

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#18140F]"
    >
      <div ref={stampRef}>
        <Stamp />
      </div>

      <span
        ref={hintRef}
        data-visible="false"
        className="absolute bottom-6 flex items-center gap-2 text-[9px] tracking-[0.15em] uppercase text-[#F7F2E7]/30"
        style={{
          fontFamily: "'Gotham', 'Inter', system-ui, sans-serif",
          opacity: 0,
          transition: 'opacity 1.5s ease',
        }}
      >
        scroll
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

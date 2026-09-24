import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_COUNTER_API_KEY;

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!API_KEY) return;
    fetch('https://api.counterapi.dev/v2/ananyamakwana/visitors/up', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
      .then(r => r.json())
      .then(d => setCount(d.value ?? d.count))
      .catch(() => {});
  }, []);

  if (count === null) return null;

  return (
    <p
      className="fixed bottom-3 left-4 text-[10px] tracking-[0.15em] uppercase pointer-events-none select-none hidden md:block"
      style={{
        fontFamily: "'Space Mono', monospace",
        color: 'rgba(255,255,255,0.12)',
      }}
    >
      visitors: {count.toLocaleString()}
    </p>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

const STATS = [
  { label: 'YouTube Subscribers', value: 200 },
  { label: 'Instagram Followers', value: 350 },
  { label: 'Facebook Followers', value: 1200 },
  { label: 'LinkedIn Followers', value: 480 },
  { label: 'X Followers', value: 15 },
  { label: 'Threads Followers', value: 40 },
  { label: 'Telegram Followers', value: 90 },
  { label: 'WhatsApp Followers', value: 260 },
];

const DURATION = 1400;

function Counter({ value, run }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!run) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / DURATION, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, value]);

  return <>{display}+</>;
}

export default function StatsGrid() {
  const ref = useRef(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto px-6 my-16 md:my-28">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 80}>
          <div
            className="rounded-2xl px-4 py-6 text-center flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text)' }}>
              {s.label}
            </h3>
            <p className={`font-display font-bold text-3xl sm:text-5xl mt-3 ${run ? 'number-pop' : ''}`} style={{ color: 'var(--ias-green)' }}>
              <Counter value={s.value} run={run} />
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

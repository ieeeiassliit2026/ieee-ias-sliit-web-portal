import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LinkedinIcon } from './BrandIcons';
import { committeeMembers } from '../data/committee';
import Reveal from './Reveal';

export default function CommitteeSlider() {
  const trackRef = useRef(null);

  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <Reveal>
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--ias-green)' }}>
            Executive Committee
          </span>
          <h2 className="font-display text-3xl mt-2">Meet the Team</h2>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scrollBy(-1)} className="p-2 rounded-full border cursor-pointer" style={{ borderColor: 'var(--border)' }} aria-label="Previous">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scrollBy(1)} className="p-2 rounded-full border cursor-pointer" style={{ borderColor: 'var(--border)' }} aria-label="Next">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {committeeMembers.map((m) => (
          <a
            key={m.full_name}
            href={m.linkedin}
            target="_blank"
            rel="noreferrer"
            className="card-hover shrink-0 w-56 snap-start rounded-2xl overflow-hidden border group"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img src={m.photo} alt={m.full_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-[var(--ias-navy)] opacity-0 group-hover:opacity-100 transition-opacity">
                <LinkedinIcon size={14} />
              </div>
            </div>
            <div className="p-4">
              <p className="font-semibold text-sm">{m.full_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.position}</p>
            </div>
          </a>
        ))}
      </div>
      </Reveal>
    </section>
  );
}

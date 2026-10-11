import React from 'react';
import { LinkedinIcon } from '../components/BrandIcons';
import { committeeMembers } from '../data/committee';
import BandHero from '../components/BandHero';
import Reveal from '../components/Reveal';
import HeroImg from '../assets/HeroOC.jpg';

export default function TeamPage() {
  return (
    <>
      <BandHero title="Our" accent="Team" image={HeroImg} text="Meet the Executive Committee driving IEEE IAS SLIIT forward." />

      <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {committeeMembers.map((m, i) => (
          <Reveal key={m.full_name} delay={i * 100} direction="scale">
            <a
              href={m.linkedin}
              target="_blank"
              rel="noreferrer"
              className="card-hover group rounded-2xl overflow-hidden border block"
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
          </Reveal>
        ))}
      </div>
      </section>
    </>
  );
}

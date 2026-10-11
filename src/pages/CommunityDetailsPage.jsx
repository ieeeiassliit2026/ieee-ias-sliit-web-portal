import React from 'react';
import { LinkedinIcon } from '../components/BrandIcons';
import { committeeMembers } from '../data/committee';
import BandHero from '../components/BandHero';
import HeroImg from '../assets/ourcommunity.png';

export default function CommunityDetailsPage() {
  return (
    <>
      <BandHero
        title="Our"
        accent="Community"
        image={HeroImg}
        text="IEEE is the world's largest professional association advancing innovation and technological excellence for the benefit of humanity. IEEE and its members inspire a global community to innovate for a better tomorrow through its highly cited publications, conferences, technology standards, and professional and educational activities. The IAS SLIIT Student Chapter extends this mission on campus."
      />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl mb-10 text-center">Executive Committee</h2>

        {committeeMembers.filter((m) => m.position === 'Chapter Advisor').map((advisor) => (
          <div key={advisor.full_name} className="flex justify-center mb-14">
            <div
              className="card-hover group rounded-3xl overflow-hidden border w-full max-w-2xl flex flex-col md:flex-row md:items-center"
              style={{ borderColor: 'var(--ias-green)', borderWidth: '2px', background: 'var(--bg-elevated)' }}
            >
              <div className="relative w-full md:w-64 flex-shrink-0 aspect-square md:aspect-auto md:h-full overflow-hidden">
                <img src={advisor.photo} alt={advisor.full_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-transparent to-transparent" />
              </div>
              <div className="p-6 md:p-8 text-center md:text-left">
                <p className="font-display font-bold text-xl md:text-2xl">{advisor.full_name}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--ias-green)' }}>{advisor.position}</p>
                {advisor.description && <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{advisor.description}</p>}
              </div>
            </div>
          </div>
        ))}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {committeeMembers.filter((m) => m.position !== 'Chapter Advisor').map((m) => (
            <a
              key={m.full_name}
              href={m.linkedin}
              target="_blank"
              rel="noreferrer"
              className="card-hover group rounded-2xl overflow-hidden border"
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
      </section>
    </>
  );
}

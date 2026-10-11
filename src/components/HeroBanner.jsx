import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import HeroImg from '../assets/HeroOC.jpg';

export default function HeroBanner({ eyebrow, title, subtitle, children }) {
  const [entered, setEntered] = useState(false);
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    if (!section || !text) return;
    const onScroll = () => {
      const y = window.scrollY;
      const h = section.offsetHeight;
      if (y < h) {
        section.querySelector('.hero-bg').style.transform = `scale(1.1) translateY(${y * 0.3}px)`;
        text.style.transform = `translateY(${y * 0.15}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isStringTitle = typeof title === 'string';
  const words = isStringTitle ? title.split(' ') : [];

  return (
    <section ref={sectionRef} className="relative h-screen flex items-center overflow-hidden lg:-mt-[68px]">
      <img
        src={HeroImg}
        alt=""
        className="hero-bg absolute inset-0 w-full h-full object-cover ken-burns"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1210] via-[#0a1210]/70 to-[#0a1210]/40" />

      <div ref={textRef} className={`relative z-10 max-w-4xl mx-auto px-6 text-center text-white transition-all duration-1000 ease-out ${entered ? 'opacity-100' : 'opacity-0'}`}>
        {eyebrow && (
          <span
            className="inline-block font-mono text-[11px] tracking-[0.3em] uppercase mb-4 transition-all duration-700 delay-200"
            style={{ color: 'var(--ias-green)', opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(12px)' }}
          >
            {eyebrow}
          </span>
        )}
        <h1
          className="font-display text-4xl sm:text-6xl font-medium leading-tight mb-5 transition-all duration-700 delay-300"
          style={isStringTitle ? undefined : { opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(16px)' }}
        >
          {isStringTitle ? words.map((word, i) => (
            <span
              key={i}
              className="inline-block mr-[0.3em] transition-all duration-500"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${300 + i * 120}ms`,
              }}
            >
              {word}
            </span>
          )) : title}
        </h1>
        {subtitle && (
          <p
            className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-8 transition-all duration-700 delay-700"
            style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(12px)' }}
          >
            {subtitle}
          </p>
        )}
        <div
          className="transition-all duration-700 delay-900"
          style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(12px)' }}
        >
          {children}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <ChevronDown size={18} className="text-white/40 animate-bounce" />
      </div>
    </section>
  );
}

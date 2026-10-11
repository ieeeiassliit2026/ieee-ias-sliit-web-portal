import React from 'react';
import { Target, Eye, Zap } from 'lucide-react';
import StatsGrid from '../components/StatsGrid';
import BandHero from '../components/BandHero';
import Reveal from '../components/Reveal';
import AboutImg from '../assets/aboutUs.png';
import GridImg from '../assets/HeroOC.jpg';

const PILLARS = [
  {
    icon: Target,
    small: 'Our',
    big: 'Mission',
    text: 'Be essential to the global technical community and to industry professionals everywhere, and be universally recognized for the contributions of technical undergraduates in developing and applying technology to improve global conditions.',
  },
  {
    icon: Eye,
    small: 'Our',
    big: 'Vision',
    text: 'To be the leading provider of technical information, community services, and personalized services to the undergraduates of SLIIT.',
  },
  {
    icon: Zap,
    small: 'Our',
    big: 'Strategy',
    text: 'Our strategy is to empower SLIIT undergraduates by offering technical education through workshops and competitions, fostering collaboration through mentorship, and providing personalized services. We aim to build global partnerships that offer international exposure and recognition, and to encourage innovation and leadership by supporting student-led initiatives that address global challenges.',
  },
];

export default function AboutPage() {
  return (
    <>
      <BandHero
        title="About"
        accent="Us"
        band="var(--ias-green)"
        accentColor="var(--ias-navy)"
        text="IEEE is the trusted voice for engineering, computing, and technology information around the globe."
        image={AboutImg}
      />

      <StatsGrid />

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
        <div className="flex flex-col gap-8 sm:gap-16 lg:flex-row">
          <Reveal direction="left">
            <img src={GridImg} alt="" className="inline-block h-full w-full max-w-2xl lg:max-w-xl rounded-3xl object-cover" />
          </Reveal>
          <Reveal direction="right">
            <div className="flex flex-col items-start justify-evenly h-full">
              <h1 className="font-display mb-4 text-xl font-bold md:text-4xl">
                We are Pioneers in{' '}
                <span style={{ color: 'var(--ias-green)' }}>Industry Applications and Electrical Engineering</span>,
                Empowering Technological Advancements
              </h1>
              <p className="mb-6 max-w-lg text-sm sm:text-lg md:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The IEEE Industry Applications Society is a premier source for information, inspiration, and
                collaboration in industrial and electrical engineering. Connecting members worldwide, IAS empowers
                the people who advance technology by delivering tools for individuals at all stages of their
                professional careers. Our trusted resources include international conferences, peer-reviewed
                publications, a robust digital library, globally recognized standards, and continuous learning
                opportunities.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <div
        className="grid md:grid-cols-2 gap-4 px-6 py-16 md:px-24 md:py-20"
        style={{ background: 'var(--ias-navy)' }}
      >
        {PILLARS.map(({ icon: Icon, small, big, text }, i) => (
          <Reveal key={big} delay={i * 150} direction="scale">
            <div
              className={`rounded-3xl p-8 md:p-10 flex flex-col justify-between text-white h-full ${i === 2 ? 'md:col-span-2' : ''}`}
              style={{ border: '2px solid var(--ias-green)' }}
            >
              <Icon size={i === 2 ? 44 : 52} className={i === 2 ? 'self-center mb-4' : 'self-end mb-4'} style={{ color: 'var(--ias-green)' }} />
              <h2 className={`font-display leading-none mb-5 ${i === 2 ? 'text-center' : ''}`}>
                <span className="block text-2xl font-normal">{small}</span>
                <span className="block text-5xl font-extrabold" style={{ color: 'var(--ias-green)' }}>{big}</span>
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-white/80 text-justify">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

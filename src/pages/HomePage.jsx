import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import HeroBanner from '../components/HeroBanner';
import CommitteeSlider from '../components/CommitteeSlider';
import EventTimeline from '../components/EventTimeline';
import FAQAccordion from '../components/FAQAccordion';
import StatsGrid from '../components/StatsGrid';
import NewsletterBox from '../components/NewsletterBox';
import Reveal from '../components/Reveal';
import CommunityImg from '../assets/community.png';
import FeedbackImg from '../assets/feedback.png';

function FeedbackBand() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('contact_submissions').insert({
      name: form.name,
      email: form.email,
      message: form.message,
    });
    if (error) {
      setStatus('error');
      return;
    }
    setForm({ name: '', email: '', message: '' });
    setStatus('sent');
  };

  return (
    <div style={{ background: 'var(--ias-navy)' }}>
      <div className="grid max-w-screen-xl lg:grid-cols-2 items-center gap-10 sm:p-12 p-8 mx-auto max-sm:p-4">
        <Reveal direction="left">
          <div className="max-w-lg max-lg:mx-auto max-lg:text-center max-lg:mb-6">
            <h2 className="font-display text-4xl md:text-6xl font-extrabold" style={{ color: 'var(--ias-green)' }}>
              Feedback Time!
            </h2>
            <p className="text-sm text-white/70 mt-4 leading-relaxed">
              No backstage pass needed here — your ideas take center stage. Share away, we're all ears!
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 bg-white rounded-2xl p-6 shadow-2xl space-y-4">
              <input
                type="text" placeholder="Name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md h-12 px-6 bg-[#f0f1f2] text-sm text-gray-900 outline-none"
              />
              <input
                type="email" placeholder="Email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md h-12 px-6 bg-[#f0f1f2] text-sm text-gray-900 outline-none"
              />
              <textarea
                placeholder="Your Feedback" rows="6" required value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-md px-6 bg-[#f0f1f2] text-sm text-gray-900 pt-3 outline-none"
              />
              {status === 'error' && <p className="text-xs text-rose-500">Something went wrong. Please try again.</p>}
              {status === 'sent' && <p className="text-xs" style={{ color: 'var(--ias-green)' }}>Thanks — your feedback is in!</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-shimmer text-white font-semibold rounded-xl text-sm px-6 py-3 block w-full cursor-pointer disabled:opacity-60"
                style={{ background: 'var(--ias-green)' }}
              >
                {status === 'sending' ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal direction="right" className="z-10 lg:flex hidden items-center justify-center">
          <img src={FeedbackImg} alt="Feedback" className="w-full object-contain drop-shadow-xl" />
        </Reveal>
      </div>
    </div>
  );
}

export default function HomePage() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <HeroBanner
        eyebrow="IEEE Industry Applications Society"
        title={<>Welcome to<br />IEEE IAS of SLIIT</>}
        subtitle="Embrace the opportunity to join our community and make your mark in industrial and electrical engineering with the IEEE Industry Applications Society of the Sri Lanka Institute of Information Technology."
      >
        <button
          onClick={scrollToAbout}
          className="btn-shimmer bg-white w-fit text-gray-900 py-2.5 px-8 rounded-full text-lg font-semibold transition duration-300 transform hover:scale-105 hover:shadow-lg drop-shadow-2xl cursor-pointer"
        >
          Explore
        </button>
      </HeroBanner>

      <div id="about" className="flex flex-col md:flex-row gap-10 md:gap-14 my-20 md:my-28 w-[90%] max-w-screen-xl mx-auto items-center">
        <Reveal direction="left" className="w-full md:w-[55%] flex-shrink-0">
          <img src={CommunityImg} alt="Who we are" className="w-full object-contain drop-shadow-xl" />
        </Reveal>
        <Reveal direction="right" className="w-full md:w-[45%]">
          <div className="grid w-full items-center">
            <h1 className="font-display md:text-6xl text-4xl font-bold mb-8 text-center md:text-left" style={{ color: 'var(--ias-green)' }}>
              Who are we?
            </h1>
            <p className="text-center md:text-left leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              We are the IEEE Industry Applications Society at SLIIT, <br />a community passionate about
              industrial and electrical engineering. <br /><br />
              Our mission is to promote innovation, networking, and knowledge sharing. We are here to give you
              the opportunity to make a difference as a volunteer in the world of industry and technology.
            </p>
          </div>
        </Reveal>
      </div>

      <StatsGrid />
      <CommitteeSlider />
      <EventTimeline limit={5} />
      <FAQAccordion />
      <FeedbackBand />

      <div className="max-w-5xl mx-auto px-6 my-20">
        <Reveal>
          <NewsletterBox />
        </Reveal>
      </div>
    </>
  );
}

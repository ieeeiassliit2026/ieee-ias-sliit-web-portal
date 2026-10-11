import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Check, ChevronDown } from 'lucide-react';
import { LinkedinIcon, InstagramIcon, FacebookIcon } from '../components/BrandIcons';
import { supabase } from '../lib/supabaseClient';
import BandHero from '../components/BandHero';
import Reveal from '../components/Reveal';
import ContactImg from '../assets/contact.png';

const MEMBERSHIP_INFO = [
  {
    q: 'IEEE Membership',
    a: "Consider becoming a member of IEEE. As a member, you gain access to IEEE publications, conferences, and networking opportunities. Membership levels are available based on your professional status and interests, across fields including Engineering, Computer Sciences and Information Technology, Physical Sciences, Biological and Medical Sciences, Mathematics, Technical Communications, Education, Management, and Law and Policy.",
  },
  {
    q: 'IEEE Industry Applications Society Membership',
    a: 'IAS membership connects you directly with the practical, industrial side of electrical and electronic engineering — power systems, automation, and robotics — through technical publications, industrial visits, and hands-on workshops run by the student chapter.',
  },
];

function MembershipAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {MEMBERSHIP_INFO.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
            >
              <span className="font-semibold text-sm" style={{ color: 'var(--ias-green)' }}>{item.q}</span>
              <ChevronDown size={16} className="transition-transform duration-300 shrink-0 ml-4" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const { error } = await supabase.from('contact_submissions').insert(form);
    if (error) {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    } else {
      setStatus('done');
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <>
      <BandHero
        title="Contact"
        accent="Us"
        text="IEEE is the trusted voice for engineering, computing, and technology information around the globe."
        image={ContactImg}
      />

      {/* ── Membership info ── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <Reveal>
          <MembershipAccordion />
        </Reveal>
      </section>

      {/* ── Let's Talk! ── */}
      <section className="py-16 px-6" style={{ background: 'var(--ias-navy)', color: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:items-center">
            <Reveal direction="left">
            <div>
              <h2 className="font-display text-4xl mb-2">Let's <span style={{ color: 'var(--ias-green)' }}>Talk!</span></h2>
              <p className="text-sm text-white/60 mb-8">Share your thoughts and help us get in touch — or simply say hi!</p>

              <div className="flex items-center gap-4 mb-8">
                <a href="https://www.linkedin.com/company/ieee-industry-applications-society-of-sliit/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-[var(--ias-green)] transition-colors">
                  <LinkedinIcon size={20} />
                </a>
                <a href="https://www.instagram.com/ias_sliit/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[var(--ias-green)] transition-colors">
                  <InstagramIcon size={20} />
                </a>
                <a href="#" aria-label="Facebook" className="hover:text-[var(--ias-green)] transition-colors">
                  <FacebookIcon size={20} />
                </a>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5" style={{ color: 'var(--ias-green)' }} />
                  <div>
                    <p className="text-sm font-semibold">Email</p>
                    <p className="text-sm text-white/60">ias@ieeesliit.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5" style={{ color: 'var(--ias-green)' }} />
                  <div>
                    <p className="text-sm font-semibold">Location</p>
                    <p className="text-sm text-white/60">SLIIT Malabe Campus, New Kandy Road, Malabe, Sri Lanka</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5" style={{ color: 'var(--ias-green)' }} />
                  <div>
                    <p className="text-sm font-semibold">Phone</p>
                    <p className="text-sm text-white/60">+94 78 526 4854</p>
                  </div>
                </div>
              </div>
            </div>
            </Reveal>

            <Reveal direction="right">
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-8 space-y-4" style={{ background: 'var(--bg-elevated)' }}>
              {status === 'done' ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <Check size={32} className="text-[var(--ias-green)]" />
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>Message sent!</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <>
                  <input name="name" required value={form.name} onChange={handleChange} placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                  <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="Email"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                  <textarea name="message" required rows={5} value={form.message} onChange={handleChange} placeholder="Your Feedback"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)] resize-y"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                  {status === 'error' && <p className="text-xs text-rose-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-shimmer w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    style={{ background: 'var(--ias-green)', color: '#fff' }}
                  >
                    {status === 'loading' ? 'Submitting...' : <>Submit <Send size={14} /></>}
                  </button>
                </>
              )}
            </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Reveal>
        <div className="rounded-2xl overflow-hidden border h-72" style={{ borderColor: 'var(--border)' }}>
          <iframe
            title="SLIIT Malabe Campus Map"
            src="https://www.google.com/maps?q=SLIIT+Malabe+Campus&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
        </Reveal>
      </section>
    </>
  );
}

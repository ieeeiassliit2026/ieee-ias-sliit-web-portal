import React, { useEffect, useRef, useState } from 'react';
import { Star, Users } from 'lucide-react';
import { LinkedinIcon } from '../components/BrandIcons';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/Loader';
import BandHero from '../components/BandHero';
import Reveal from '../components/Reveal';
import HeroImg from '../assets/bg.jpg';

const TABS = ['All', 'Executive Committee', 'Volunteers', 'Top Contributors', 'IAS Members'];

function MemberCard({ member }) {
  return (
    <div className="card-hover group rounded-2xl overflow-hidden border text-center p-5 relative" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <div
        className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 transition-shadow duration-300 group-hover:shadow-[0_0_12px_var(--ias-green)]"
        style={{ borderColor: member.is_top_volunteer ? 'var(--ias-green)' : 'var(--border)' }}
      >
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--ias-green)]/15 text-[var(--ias-green)] font-display text-xl">
            {member.full_name.charAt(0)}
          </div>
        )}
        {member.is_top_volunteer && (
          <span className="absolute -top-0.5 -right-0.5 bg-[var(--ias-gold)] text-white rounded-full p-1 gold-shimmer">
            <Star size={10} fill="currentColor" />
          </span>
        )}
      </div>
      <p className="font-semibold text-sm">{member.full_name}</p>
      <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-16">
        {member.role_title && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{member.role_title}</p>}
      </div>
      {member.contribution_note && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{member.contribution_note}</p>}
      {member.linkedin_url && (
        <a
          href={member.linkedin_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs mt-2 font-semibold link-underline"
          style={{ color: 'var(--ias-blue)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <LinkedinIcon size={12} /> LinkedIn
        </a>
      )}
    </div>
  );
}

export default function MemberWallPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const tabsRef = useRef(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useEffect(() => {
    supabase
      .from('member_wall')
      .select('*')
      .order('is_top_volunteer', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMembers(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!tabsRef.current) return;
    const active = tabsRef.current.querySelector('[data-active="true"]');
    if (active) {
      setUnderline({ left: active.offsetLeft, width: active.offsetWidth });
    }
  }, [activeTab]);

  const filtered = activeTab === 'All'
    ? members
    : activeTab === 'Top Contributors'
      ? members.filter((m) => m.is_top_volunteer)
      : activeTab === 'Executive Committee'
        ? members.filter((m) => m.category === 'executive')
        : activeTab === 'Volunteers'
          ? members.filter((m) => m.category === 'volunteer')
          : members.filter((m) => m.category === 'member' || (!m.category && !m.is_top_volunteer));

  return (
    <>
      <BandHero title="Meet the" accent="IAS Squad" image={HeroImg} text="Celebrating registered IEEE IAS members and recognizing the top volunteers who make our chapter thrive." />

      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Filter tabs */}
        <div className="relative mb-10 overflow-x-auto" ref={tabsRef}>
          <div className="flex gap-1 min-w-max border-b" style={{ borderColor: 'var(--border)' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                data-active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: activeTab === tab ? 'var(--ias-green)' : 'var(--text-muted)' }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            className="absolute bottom-0 h-[2px] transition-all duration-300 ease-out rounded-full"
            style={{ left: underline.left, width: underline.width, background: 'var(--ias-green)' }}
          />
        </div>

        {loading ? (
          <Loader text="Loading members..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <Users className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No members in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {filtered.map((m, i) => (
              <Reveal key={m.id} delay={i * 60} direction="scale">
                <MemberCard member={m} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

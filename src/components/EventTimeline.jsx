import React, { useEffect, useState } from 'react';
import { Wrench, Building2, Presentation, Trophy, PartyPopper, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Reveal from './Reveal';

const TYPE_ICON = {
  workshop: Wrench,
  industrial_visit: Building2,
  seminar: Presentation,
  competition: Trophy,
  social: PartyPopper,
  other: Calendar,
};

export default function EventTimeline({ limit = 6 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, [limit]);

  if (loading) return null;
  if (events.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <Reveal>
      <div className="mb-10 text-center">
        <span className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--ias-green)' }}>
          Timeline
        </span>
        <h2 className="font-display text-3xl mt-2">Milestones &amp; Events</h2>
      </div>
      </Reveal>

      <div className="relative pl-8 border-l" style={{ borderColor: 'var(--border)' }}>
        {events.map((e, idx) => {
          const Icon = TYPE_ICON[e.event_type] || Calendar;
          return (
            <Reveal key={e.id} delay={idx * 100}>
            <div className="relative mb-10 last:mb-0">
              <span
                className="absolute -left-[calc(2rem+9px)] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ background: 'var(--bg)', borderColor: 'var(--ias-green)' }}
              >
                <Icon size={9} style={{ color: 'var(--ias-green)' }} />
              </span>
              <p className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                {new Date(e.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <h3 className="font-semibold">{e.title}</h3>
              {e.description && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{e.description}</p>}
              <a href={`/events#${e.id}`} className="inline-flex items-center gap-1 text-xs mt-2 link-underline" style={{ color: 'var(--ias-green)' }}>
                Read More <ArrowRight size={12} />
              </a>
            </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

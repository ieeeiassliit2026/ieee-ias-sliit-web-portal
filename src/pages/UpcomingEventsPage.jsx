import React, { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ImageHero from '../components/ImageHero';
import FeatureCard from '../components/FeatureCard';
import HeroBg from '../assets/bg.jpg';

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <ImageHero image={HeroBg} height="h-[55vh]" title="Upcoming Events" subtitle="What's next on the IEEE IAS SLIIT calendar." />

      <section className="max-w-6xl mx-auto px-6 py-16">
        {loading ? (
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading events...</p>
        ) : events.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <CalendarClock className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No upcoming events right now — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {events.map((e) => (
              <FeatureCard
                key={e.id}
                image={e.image_url}
                title={e.title}
                description={e.description}
                date={new Date(e.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

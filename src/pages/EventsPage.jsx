import React, { useEffect, useState } from 'react';
import { Calendar, X, Play } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Loader from '../components/Loader';
import Reveal from '../components/Reveal';

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})(?:[?&/#]|$)/);
  return m ? m[1] : null;
}

function EventCard({ event, onOpen }) {
  const ytId = getYouTubeId(event.video_url);

  return (
    <button
      onClick={() => onOpen(event)}
      className="card-hover text-left rounded-2xl overflow-hidden border cursor-pointer w-full"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
    >
      {ytId ? (
        <div className="aspect-video overflow-hidden relative">
          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={20} className="text-[var(--ias-green)] ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>
      ) : event.image_url ? (
        <div className="aspect-video overflow-hidden">
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      ) : null}
      <div className="p-5">
        <p className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--ias-green)' }}>
          {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <h3 className="font-semibold mb-1">{event.title}</h3>
        {event.description && <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{event.description}</p>}
      </div>
    </button>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  const upcoming = events.filter((e) => e.status === 'upcoming');
  const completed = events.filter((e) => e.status === 'completed');
  const selectedYtId = getYouTubeId(selected?.video_url);

  return (
    <>
      <div className="relative h-[70vh] overflow-hidden lg:-mt-[68px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/EventsHeroVid.mp4"
        />
        <div className="absolute inset-0 bg-black opacity-30" />
      </div>

      <section className="max-w-6xl mx-auto px-6 py-16">
      {loading ? (
        <Loader text="Loading events..." />
      ) : events.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <Calendar className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No events published yet — check back soon.</p>
        </div>
      ) : (
        <div className="space-y-14">
          <div>
            <h2 className="font-display text-2xl mb-5 text-center">Ongoing Events</h2>
            {upcoming.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {upcoming.map((e, i) => <Reveal key={e.id} delay={i * 80}><EventCard event={e} onOpen={setSelected} /></Reveal>)}
              </div>
            ) : (
              <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>No ongoing events right now.</p>
            )}
          </div>
          {completed.length > 0 && (
            <div>
              <h2 className="font-display text-2xl mb-5 text-center">Past Events</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {completed.map((e, i) => <Reveal key={e.id} delay={i * 80}><EventCard event={e} onOpen={setSelected} /></Reveal>)}
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full rounded-2xl overflow-hidden fade-in-snap"
            style={{ background: 'var(--bg-elevated)' }}
          >
            {selectedYtId ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedYtId}?autoplay=1`}
                  title={selected.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : selected.image_url ? (
              <img src={selected.image_url} alt={selected.title} className="w-full aspect-video object-cover" />
            ) : null}
            <div className="p-6 relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 cursor-pointer" aria-label="Close">
                <X size={18} />
              </button>
              <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--ias-green)' }}>
                {new Date(selected.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <h3 className="font-display text-xl mb-3">{selected.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.description}</p>
            </div>
          </div>
        </div>
      )}
      </section>
    </>
  );
}

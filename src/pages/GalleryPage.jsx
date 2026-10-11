import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ImageHero from '../components/ImageHero';
import Reveal from '../components/Reveal';
import HeroBg from '../assets/galleryHero.png';
import { committeeMembers } from '../data/committee';

function SkeletonCard({ style }) {
  return (
    <div className="mb-3 break-inside-avoid rounded-sm overflow-hidden shimmer-skeleton" style={style}>
      <div className="w-full bg-[var(--border)]" style={{ aspectRatio: style?.aspectRatio || '4/3' }} />
    </div>
  );
}

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setImages(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <>
      <ImageHero
        image={HeroBg}
        height="h-[60vh]"
        title="Media & Gallery"
        subtitle="Check out the vibrant and exciting events in IEEE Industry Applications Society, SLIIT"
      />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <Reveal><h2 className="font-display text-2xl mb-6 text-center">Organizing Committee</h2></Reveal>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-16">
          {committeeMembers.map((m) => (
            <a
              key={m.full_name}
              href={m.linkedin}
              target="_blank"
              rel="noreferrer"
              className="card-hover rounded-xl overflow-hidden aspect-square block"
              style={{ border: '2px solid var(--ias-green)' }}
            >
              <img src={m.photo} alt={m.full_name} className="w-full h-full object-cover" />
            </a>
          ))}
        </div>

        <Reveal><h2 className="font-display text-2xl mb-6 text-center">Event Photos</h2></Reveal>
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <SkeletonCard key={i} style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '4/3' : '1/1' }} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <ImageIcon className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No event photos uploaded yet.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
            {images.map((img, i) => (
              <Reveal key={img.id} delay={i * 60} direction="scale">
                <button
                  onClick={() => setLightbox(img)}
                  className="mb-3 block w-full cursor-pointer break-inside-avoid group relative overflow-hidden rounded-sm"
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || ''}
                    className="w-full shadow-md transition-transform duration-500 group-hover:scale-105"
                    style={{ border: '2px solid var(--ias-green)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    {(img.caption || img.photographer) && (
                      <span className="flex items-center justify-between gap-2 w-full text-[11px] text-white/90">
                        <span className="truncate">{img.caption}</span>
                        {img.photographer && <span className="shrink-0">📷 {img.photographer}</span>}
                      </span>
                    )}
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 fade-in-snap"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={40} />
          </button>
          <img
            src={lightbox.image_url}
            alt={lightbox.caption || ''}
            className="max-w-[85%] max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

import React from 'react';

export default function FeatureCard({ image, title, date, description }) {
  return (
    <article className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-6 pb-6 pt-32 h-80 card-hover">
      {image ? (
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: 'var(--ias-navy)' }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      {date && (
        <p className="z-10 text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--ias-green)' }}>
          {date}
        </p>
      )}
      <h3 className="z-10 text-xl font-semibold text-white mb-1">{title}</h3>
      {description && <p className="z-10 text-sm text-white/70 line-clamp-3">{description}</p>}
    </article>
  );
}

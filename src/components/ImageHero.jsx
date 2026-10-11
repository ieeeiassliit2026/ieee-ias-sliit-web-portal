import React from 'react';

/**
 * CS-style full-bleed hero: background photo, heavy dark overlay, giant centred
 * title. Used by Home, Gallery and the events cluster.
 */
export default function ImageHero({ image, title, subtitle, height = 'h-[70vh]', children }) {
  // Pull up under the fixed desktop navbar so the photo runs to the top of the
  // viewport and the bar floats over it (main compensates with matching padding).
  return (
    <div className={`relative ${height} overflow-hidden lg:-mt-[68px]`}>
      <div className="absolute inset-0">
        <img src={image} alt="" className="object-cover object-center w-full h-full" />
        <div className="absolute inset-0 bg-black opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col px-6 mx-auto justify-center items-center h-full text-center">
        <h1
          className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4 drop-shadow-2xl"
          style={{ color: 'var(--ias-green)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg text-white/70 mb-8 font-semibold max-w-3xl drop-shadow-2xl">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

import React from 'react';

/**
 * CS-style page header: a solid colour band holding a giant stacked two-tone
 * title with a supporting paragraph on the left, and an illustration on the right.
 */
export default function BandHero({ title, accent, text, image, band = 'var(--ias-navy)', accentColor = 'var(--ias-green)' }) {
  return (
    <div style={{ background: band }} className="lg:-mt-[68px]">
      <header>
        <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24 lg:pt-[calc(68px+2rem)]">
          <div className="grid items-center justify-items-start gap-8 sm:gap-16 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="md:grid flex justify-center gap-x-4">
                <h1 className="mb-2 text-5xl font-bold text-white leading-[0.85] md:text-[7rem] md:mb-6">
                  {title}
                </h1>
                {accent && (
                  <h1 className="mb-4 text-5xl font-bold leading-[0.85] md:text-[6rem] md:mb-10" style={{ color: accentColor }}>
                    {accent}
                  </h1>
                )}
              </div>
              {text && (
                <p className="mb-6 max-w-lg text-sm text-white/70 sm:text-lg md:mb-0 text-center md:text-left leading-relaxed">
                  {text}
                </p>
              )}
            </div>
            {image && (
              <img src={image} alt="" className="inline-block h-full w-full max-w-2xl rounded-3xl object-cover" />
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

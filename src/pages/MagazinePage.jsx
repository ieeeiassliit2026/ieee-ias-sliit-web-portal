import React, { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { BookOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';
import { supabase } from '../lib/supabaseClient';
import MagazineCover from '../assets/magazine/cover.webp';
import MagazinePdf from '../assets/magazine/magazine.pdf';
import flipSound from '../assets/magazine/flip.mp3';
import MagazineHeroImg from '../assets/magazine-hero.png';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const BUNDLED_EDITION = {
  id: 'bundled',
  title: 'IAS Magazine 2024',
  cover_image_url: MagazineCover,
  file_url: MagazinePdf,
  year: 2024,
};

function Page({ image, pageNumber }, ref) {
  return (
    <div ref={ref} className="bg-white flex items-center justify-center overflow-hidden">
      {image ? (
        <img src={image} alt={`Page ${pageNumber}`} className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}
const FlipPage = React.forwardRef(Page);

export default function MagazinePage() {
  const [editions, setEditions] = useState([BUNDLED_EDITION]);
  const [selected, setSelected] = useState(BUNDLED_EDITION);
  const [opened, setOpened] = useState(false);
  const [pageImages, setPageImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bookRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(flipSound);
    supabase
      .from('magazine_editions')
      .select('*')
      .order('year', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setEditions(data);
          setSelected(data[0]);
        }
      });
  }, []);

  const handleOpen = async (edition) => {
    setSelected(edition);
    setOpened(true);
    setPageImages([]);
    setLoading(true);
    try {
      const pdf = await pdfjsLib.getDocument({ url: edition.file_url }).promise;
      const images = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        images.push(canvas.toDataURL('image/jpeg', 0.85));
      }
      setPageImages(images);
    } catch (err) {
      console.error('Failed to load magazine PDF', err);
    } finally {
      setLoading(false);
    }
  };

  const playFlip = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <>
      <div className="relative overflow-hidden lg:-mt-[68px]" style={{ background: 'var(--ias-green)' }}>
        <div className="relative z-10 max-w-7xl mx-auto px-5 py-20 md:px-10 md:py-32 lg:pt-[calc(68px+3rem)] lg:pb-36 flex items-center">
          <div className="flex flex-col w-full lg:w-1/2">
            <h1 className="mb-2 text-5xl font-bold text-white leading-[0.85] md:text-[7rem] md:mb-6">IAS</h1>
            <h1 className="mb-4 text-5xl font-bold leading-[0.85] md:text-[6rem] md:mb-10" style={{ color: 'var(--ias-navy)' }}>Magazine</h1>
            <p className="mb-6 max-w-lg text-sm text-white/70 sm:text-lg md:mb-0 leading-relaxed">
              Pick up the latest edition and flip through the pages.
            </p>
          </div>
        </div>
        <img
          src={MagazineHeroImg}
          alt=""
          className="hidden lg:block absolute right-0 h-full object-contain object-right-top"
          style={{ maxWidth: '50%', top: '68px' }}
        />
      </div>

      <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20">
      {!opened ? (
        <div className="fade-in-snap w-full max-w-4xl">
          {editions.length > 1 && (
            <h2 className="font-display text-2xl text-center mb-8">Select an Edition</h2>
          )}
          <div className={`flex flex-wrap justify-center ${editions.length > 1 ? 'gap-8' : ''}`}>
            {editions.map((ed) => (
              <button
                key={ed.id}
                onClick={() => handleOpen(ed)}
                className="group flex flex-col items-center gap-4 cursor-pointer"
              >
                <div
                  className="relative w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden transition-transform duration-700 group-hover:-translate-y-4 group-hover:rotate-1"
                  style={{
                    boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4), 0 10px 30px -8px rgba(0,150,77,0.25)',
                    animation: 'float 4s ease-in-out infinite',
                  }}
                >
                  <img src={ed.cover_image_url || MagazineCover} alt={ed.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 ring-1 ring-white/20 rounded-2xl" />
                </div>
                <span className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--ias-green)] text-white text-sm font-semibold">
                  <BookOpen size={16} /> {ed.title || `Edition ${ed.year}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <Loader text="Opening the magazine..." />
      ) : (
        <div className="flex flex-col items-center gap-6 fade-in-snap w-full">
          {editions.length > 1 && (
            <button
              onClick={() => { setOpened(false); setPageImages([]); }}
              className="text-xs font-mono uppercase tracking-wide link-underline cursor-pointer mb-2"
              style={{ color: 'var(--ias-green)' }}
            >
              ← All Editions
            </button>
          )}
          <HTMLFlipBook
            ref={bookRef}
            width={340}
            height={460}
            size="stretch"
            minWidth={280}
            maxWidth={480}
            minHeight={380}
            maxHeight={640}
            showCover={true}
            onFlip={playFlip}
            className="mx-auto shadow-2xl"
          >
            {pageImages.map((img, i) => (
              <FlipPage key={i} image={img} pageNumber={i + 1} />
            ))}
          </HTMLFlipBook>

          <div className="flex items-center gap-4">
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
              className="p-3 rounded-full border cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <a href={selected.file_url} target="_blank" rel="noreferrer" className="text-xs font-mono uppercase tracking-wide link-underline" style={{ color: 'var(--ias-green)' }}>
              Download PDF
            </a>
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipNext()}
              className="p-3 rounded-full border cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      </section>
    </>
  );
}

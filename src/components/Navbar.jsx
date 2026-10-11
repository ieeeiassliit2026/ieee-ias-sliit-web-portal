import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import IASLogo from '../assets/IAS.png';
import IASLogoWhite from '../assets/IAS White LOGO.png';
import { useAuth } from '../lib/AuthContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/community', label: 'Community' },
  { to: '/events', label: 'Events' },
  { to: '/newsletter', label: 'Newsletter' },
  { to: '/magazine', label: 'Magazine' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem('ias-theme') === 'dark');
  const [underline, setUnderline] = useState({ left: 0, width: 0 });
  const linksRef = useRef(null);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { session } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ias-theme', dark ? 'dark' : 'light');
    const t = setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 450);
    return () => clearTimeout(t);
  }, [dark]);

  useEffect(() => setIsOpen(false), [location]);

  useEffect(() => {
    if (!linksRef.current) return;
    const active = linksRef.current.querySelector('[data-active="true"]');
    if (active) {
      setUnderline({ left: active.offsetLeft, width: active.offsetWidth });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (Math.abs(delta) < 5) return;
      setShowNavbar(delta < 0 || y < 100);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('nav')) setIsOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="mx-auto lg:w-2/3">
      <nav
        className={`relative lg:fixed top-0 left-1/2 -translate-x-1/2 w-full lg:w-[1040px] z-50 shadow-2xl px-5 py-3 lg:rounded-b-3xl transition-transform duration-500 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ background: 'var(--nav-glass)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', color: 'var(--text)' }}
      >
        <div className="flex justify-between items-center lg:justify-center gap-4 mx-auto">
          <Link to="/">
            <img src={dark ? IASLogoWhite : IASLogo} alt="IEEE IAS SLIIT" className="h-10 w-auto object-contain lg:mr-8" />
          </Link>

          <div className="hidden lg:flex gap-6 items-center relative" ref={linksRef}>
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-active={isActive(l.to)}
                className={`font-semibold text-sm whitespace-nowrap transition-colors py-1 ${isActive(l.to) ? 'text-[var(--ias-green)]' : 'hover:text-[var(--ias-green)]'}`}
              >
                {l.label}
              </NavLink>
            ))}
            <div
              className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300 ease-out"
              style={{ left: underline.left, width: underline.width, background: 'var(--ias-green)' }}
            />
            <Link
              to={session ? '/profile' : '/login'}
              className="btn-shimmer font-semibold text-sm px-4 py-1.5 rounded-full text-white whitespace-nowrap"
              style={{ background: 'var(--ias-green)' }}
            >
              {session ? 'Profile' : 'Login'}
            </Link>
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="theme-toggle p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              <span className={`block transition-transform duration-500 ${dark ? 'rotate-180' : 'rotate-0'}`}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </span>
            </button>
          </div>

          {/* Burger */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="theme-toggle p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              <span className={`block transition-transform duration-500 ${dark ? 'rotate-180' : 'rotate-0'}`}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </span>
            </button>
            <div
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setIsOpen((o) => !o); }}
              role="button"
              aria-label="Toggle menu"
            >
              <div className={`w-6 h-1 rounded mb-1 transition-transform ${isOpen ? 'translate-y-2 rotate-45' : ''}`} style={{ background: 'var(--text)' }} />
              <div className={`w-6 h-1 rounded mb-1 transition-opacity ${isOpen ? 'opacity-0' : 'opacity-100'}`} style={{ background: 'var(--text)' }} />
              <div className={`w-6 h-1 rounded transition-transform ${isOpen ? '-translate-y-2 -rotate-45' : ''}`} style={{ background: 'var(--text)' }} />
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`absolute top-full left-0 w-full font-semibold shadow-md p-4 text-center transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
          style={{ background: 'var(--nav-glass)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        >
          {LINKS.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="block py-2 text-sm transition-all duration-300"
              style={{
                color: isActive(l.to) ? 'var(--ias-green)' : undefined,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
                transitionDelay: isOpen ? `${i * 50}ms` : '0ms',
              }}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to={session ? '/profile' : '/login'}
            className="block py-2 text-sm transition-all duration-300"
            style={{
              color: 'var(--ias-green)',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
              transitionDelay: isOpen ? `${LINKS.length * 50}ms` : '0ms',
            }}
          >
            {session ? 'Profile' : 'Login / Register'}
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

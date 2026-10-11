import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { LinkedinIcon, InstagramIcon, FacebookIcon } from './BrandIcons';
import IASLogo from '../assets/IAS.png';

const USEFUL_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/community', label: 'Community' },
  { to: '/team', label: 'Our Team' },
];

const NEWS_LINKS = [
  { to: '/events', label: 'Events' },
  { to: '/upcoming', label: 'Upcoming Events' },
  { to: '/past', label: 'Past Events' },
  { to: '/newsletter', label: 'Newsletter' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/magazine', label: 'Magazine' },
];

function LinkColumn({ heading, links }) {
  return (
    <div className="my-5 mr-8 flex max-w-52 grow basis-24 flex-col space-y-4 lg:mx-8 lg:mt-0">
      <h2 className="font-semibold" style={{ color: 'var(--text)' }}>{heading}</h2>
      {links.map((l) => (
        <Link key={l.to} to={l.to} className="font-light text-sm link-underline w-fit" style={{ color: 'var(--text-muted)' }}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t mt-24" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <div className="max-w-screen-xl mx-auto flex-col lg:flex px-5 pt-10 pb-4 md:px-10">
        <div className="lg:flex lg:flex-row lg:justify-between">
          {/* Logo + socials */}
          <div className="grid justify-start content-start">
            <img src={IASLogo} alt="IEEE IAS SLIIT" className="w-44 object-contain logo-theme" />
            <p className="text-sm mt-4 max-w-xs" style={{ color: 'var(--text-muted)' }}>
              IEEE Industry Applications Society — Student Chapter, SLIIT.
            </p>
            <div className="flex justify-start space-x-4 mt-6 mb-6">
              <a
                href="https://www.linkedin.com/company/ieee-industry-applications-society-of-sliit/"
                target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="hover:text-[var(--ias-green)] transition-colors"
              >
                <LinkedinIcon size={22} />
              </a>
              <a
                href="https://www.instagram.com/ias_sliit/"
                target="_blank" rel="noreferrer" aria-label="Instagram"
                className="hover:text-[var(--ias-green)] transition-colors"
              >
                <InstagramIcon size={22} />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-[var(--ias-green)] transition-colors">
                <FacebookIcon size={22} />
              </a>
              <a href="mailto:ias@ieeesliit.com" aria-label="Email" className="hover:text-[var(--ias-green)] transition-colors">
                <Mail size={22} />
              </a>
            </div>
          </div>

          <div className="flex grow flex-row flex-wrap lg:flex-nowrap lg:justify-center">
            <LinkColumn heading="Useful Links" links={USEFUL_LINKS} />
            <LinkColumn heading="News Feed" links={NEWS_LINKS} />
          </div>

          <iframe
            title="SLIIT Malabe Campus"
            className="rounded-xl w-full lg:w-1/4 h-40 lg:h-auto lg:self-center mt-4 lg:mt-0"
            src="https://www.google.com/maps?q=SLIIT+Malabe+Campus&output=embed"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mx-auto my-4 w-full border-t" style={{ borderColor: 'var(--border)' }} />

        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} IEEE Industry Applications Society, SLIIT Student Chapter. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

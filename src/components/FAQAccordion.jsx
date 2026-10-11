import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from './Reveal';

const FAQS = [
  {
    q: 'What is IEEE IAS SLIIT?',
    a: 'We are the student branch chapter focused on the practical applications of electrical, electronic, and industrial engineering systems.',
  },
  {
    q: 'How do I join the IAS chapter?',
    a: 'You can add IAS to an existing IEEE membership, or join as a new IEEE member and select the Industry Applications Society during registration.',
  },
  {
    q: 'Do I need a specific major to join?',
    a: 'No — all students interested in industry automation, power systems, robotics, and professional development are welcome.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <Reveal>
      <div className="mb-10 text-center">
        <span className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--ias-green)' }}>
          FAQ
        </span>
        <h2 className="font-display text-3xl mt-2">Common Questions</h2>
      </div>
      </Reveal>

      <div className="space-y-3">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
              >
                <span className="font-medium text-sm">{item.q}</span>
                <ChevronDown size={16} className="transition-transform duration-300 shrink-0 ml-4" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <div
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

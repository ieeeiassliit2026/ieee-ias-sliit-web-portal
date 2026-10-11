import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() });
    if (error) {
      setStatus('error');
      setError(error.code === '23505' ? "You're already subscribed!" : 'Something went wrong. Please try again.');
    } else {
      setStatus('done');
    }
  };

  return (
    <div className="rounded-3xl p-8 sm:p-10 text-center" style={{ background: 'var(--ias-navy)', color: '#fff' }}>
      <h3 className="font-display text-2xl sm:text-3xl mb-2">Stay Tuned with IEEE IAS SLIIT</h3>
      <p className="text-sm text-white/60 max-w-lg mx-auto mb-6">
        Subscribe to our monthly newsletter to get the latest updates on industrial visits, technical articles,
        and upcoming hands-on workshops directly in your inbox.
      </p>

      {status === 'done' ? (
        <div className="flex items-center justify-center gap-2 text-[var(--ias-green)] text-sm font-medium">
          <Check size={16} /> You're subscribed — thank you!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/40 outline-none focus:border-[var(--ias-green)]"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-shimmer px-5 py-3 rounded-xl bg-[var(--ias-green)] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {status === 'loading' ? 'Subscribing...' : <>Subscribe Now <Send size={14} /></>}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-xs text-rose-300 mt-3">{error}</p>}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import IASLogo from '../assets/IAS.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const { data: registration } = await supabase
      .from('member_registrations')
      .select('status')
      .eq('id', data.user.id)
      .maybeSingle();

    setLoading(false);

    if (registration?.status === 'pending') {
      setError('Your account is not yet activated. Please wait for admin approval.');
      await supabase.auth.signOut();
      return;
    }
    if (registration?.status === 'declined') {
      setError('Your registration request was declined.');
      await supabase.auth.signOut();
      return;
    }

    navigate('/profile');
  };

  return (
    <>
      <section className="max-w-md mx-auto px-6 py-16 sm:py-24">
        <div className="flex flex-col items-center mb-8">
          <img src={IASLogo} alt="IEEE IAS SLIIT" className="h-14 w-auto object-contain mb-4 logo-theme" />
          <h1 className="font-display text-2xl">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
          />
          <input
            type="password" placeholder="Password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
          />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-shimmer w-full py-3 rounded-xl bg-[var(--ias-green)] text-white text-sm font-semibold disabled:opacity-60 cursor-pointer">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" className="link-underline font-semibold" style={{ color: 'var(--ias-green)' }}>Register now</Link>
          </p>
        </form>
      </section>
    </>
  );
}

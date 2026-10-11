import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import IASLogo from '../assets/IAS.png';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, account_type: 'member' } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <section className="max-w-md mx-auto px-6 py-16 sm:py-24">
        <div className="flex flex-col items-center mb-8">
          <img src={IASLogo} alt="IEEE IAS SLIIT" className="h-14 w-auto object-contain mb-4 logo-theme" />
          <h1 className="font-display text-2xl">Registration</h1>
        </div>

        {submitted ? (
          <div className="text-center rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
            <UserPlus className="mx-auto mb-3" style={{ color: 'var(--ias-green)' }} />
            <p className="font-semibold mb-1">Registration submitted</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Check your email to verify your account. An admin will review and activate your membership before you can log in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" placeholder="Full Name" required value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
            />
            <input
              type="email" placeholder="Email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
            />
            <input
              type="password" placeholder="Password (min 8 characters)" required minLength={8} autoComplete="new-password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
            />
            <input
              type="password" placeholder="Confirm Password" required value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-shimmer w-full py-3 rounded-xl bg-[var(--ias-green)] text-white text-sm font-semibold disabled:opacity-60 cursor-pointer">
              {loading ? 'Registering...' : 'Register'}
            </button>
            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Already have an account? <Link to="/login" className="link-underline font-semibold" style={{ color: 'var(--ias-green)' }}>Log in</Link>
            </p>
          </form>
        )}
      </section>
    </>
  );
}

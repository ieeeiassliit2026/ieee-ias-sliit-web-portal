import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function AdminLoginPage() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    const { data: admin } = await supabase.rpc('is_admin');
    setLoading(false);
    if (admin !== true) {
      await signOut();
      setError('This account does not have admin access.');
      return;
    }
    navigate('/admin');
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-2xl mb-8">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
        />
        <input
          type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--ias-green)]"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-shimmer w-full py-3 rounded-xl bg-[var(--ias-green)] text-white text-sm font-semibold disabled:opacity-60 cursor-pointer">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

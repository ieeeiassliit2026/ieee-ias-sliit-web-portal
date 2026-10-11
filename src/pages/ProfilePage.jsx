import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import IASLogo from '../assets/IAS.png';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('member_registrations')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <section className="max-w-md mx-auto px-6 py-16 sm:py-24 text-center">
        <img src={IASLogo} alt="IEEE IAS SLIIT" className="h-14 w-auto object-contain mx-auto mb-8 logo-theme" />
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : !profile ? (
          <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>You need to log in to view your profile.</p>
            <Link to="/login" className="btn-shimmer inline-block px-6 py-3 rounded-full bg-[var(--ias-green)] text-white text-sm font-semibold">Log In</Link>
          </div>
        ) : (
          <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
            <UserCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--ias-green)' }} />
            <p className="font-semibold mb-1">{profile.full_name}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
            <button onClick={handleLogout} className="text-xs font-mono uppercase tracking-wide px-6 py-3 rounded-full border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
              Logout
            </button>
          </div>
        )}
      </section>
    </>
  );
}

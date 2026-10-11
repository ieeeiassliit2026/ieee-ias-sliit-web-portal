import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

const TABS = ['Contact Messages', 'Pending Members', 'Events', 'Articles', 'Gallery', 'Newsletter Issues', 'Magazine', 'IAS Squad'];

function Field(props) {
  return (
    <input
      {...props}
      className="px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--ias-green)] w-full"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    />
  );
}

export default function AdminDashboardPage() {
  const { session, isAdmin, signOut } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [contacts, setContacts] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [issues, setIssues] = useState([]);
  const [members, setMembers] = useState([]);
  const [editions, setEditions] = useState([]);

  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', event_type: 'workshop', status: 'upcoming', image_url: '', video_url: '' });
  const [newNews, setNewNews] = useState({ title: '', description: '', image_url: '', published_at: '', author_name: '', author_title: '' });
  const [newEdition, setNewEdition] = useState({ title: '', year: String(new Date().getFullYear()), cover_image_url: '', file_url: '' });
  const [newImage, setNewImage] = useState({ image_url: '', caption: '' });
  const [newIssue, setNewIssue] = useState({ title: '', description: '', file_url: '', cover_image_url: '', published_at: '' });
  const [newMember, setNewMember] = useState({ full_name: '', role_title: '', contribution_note: '', photo_url: '', linkedin_url: '', category: 'member', is_top_volunteer: false });

  const [pendingNews, setPendingNews] = useState([]);
  const [notice, setNotice] = useState('');

  const reload = () => {
    supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).then(({ data }) => setContacts(data || []));
    supabase.from('member_registrations').select('*').eq('status', 'pending').order('created_at', { ascending: false }).then(({ data }) => setPendingMembers(data || []));
    supabase.from('events').select('*').order('event_date', { ascending: false }).then(({ data }) => setEvents(data || []));
    supabase.from('news_items').select('*').eq('status', 'approved').order('published_at', { ascending: false }).then(({ data }) => setNews(data || []));
    supabase.from('news_items').select('*').eq('status', 'pending').order('published_at', { ascending: false }).then(({ data }) => setPendingNews(data || []));
    supabase.from('gallery_images').select('*').order('created_at', { ascending: false }).then(({ data }) => setGallery(data || []));
    supabase.from('newsletter_issues').select('*').order('published_at', { ascending: false }).then(({ data }) => setIssues(data || []));
    supabase.from('member_wall').select('*').order('created_at', { ascending: false }).then(({ data }) => setMembers(data || []));
    supabase.from('magazine_editions').select('*').order('year', { ascending: false }).then(({ data }) => setEditions(data || []));
  };

  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  if (!session) {
    return <div className="max-w-md mx-auto px-6 py-20 text-center"><p style={{ color: 'var(--text-muted)' }}>Please log in to view the admin dashboard.</p></div>;
  }
  if (!isAdmin) {
    return <div className="max-w-md mx-auto px-6 py-20 text-center"><p style={{ color: 'var(--text-muted)' }}>This account does not have admin access.</p></div>;
  }

  // Empty form fields are omitted so DB defaults/NULLs apply (URL CHECKs reject '').
  const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== ''));
  const run = async (query) => {
    const { error } = await query;
    setNotice(error ? error.message : '');
    reload();
    return !error;
  };

  const addEvent = async (e) => {
    e.preventDefault();
    if (await run(supabase.from('events').insert(clean(newEvent))))
      setNewEvent({ title: '', description: '', event_date: '', event_type: 'workshop', status: 'upcoming', image_url: '', video_url: '' });
  };
  const addImage = async (e) => {
    e.preventDefault();
    if (await run(supabase.from('gallery_images').insert(clean(newImage))))
      setNewImage({ image_url: '', caption: '' });
  };
  const addIssue = async (e) => {
    e.preventDefault();
    if (await run(supabase.from('newsletter_issues').insert(clean(newIssue))))
      setNewIssue({ title: '', description: '', file_url: '', cover_image_url: '', published_at: '' });
  };
  const addMember = async (e) => {
    e.preventDefault();
    if (await run(supabase.from('member_wall').insert(clean(newMember))))
      setNewMember({ full_name: '', role_title: '', contribution_note: '', photo_url: '', linkedin_url: '', category: 'member', is_top_volunteer: false });
  };
  const addNews = async (e) => {
    e.preventDefault();
    if (await run(supabase.from('news_items').insert(clean(newNews))))
      setNewNews({ title: '', description: '', image_url: '', published_at: '', author_name: '', author_title: '' });
  };
  const addEdition = async (e) => {
    e.preventDefault();
    if (await run(supabase.from('magazine_editions').insert(clean({ ...newEdition, year: Number(newEdition.year) }))))
      setNewEdition({ title: '', year: String(new Date().getFullYear()), cover_image_url: '', file_url: '' });
  };
  const setMemberStatus = async (id, status) => {
    await run(supabase.from('member_registrations').update({ status }).eq('id', id));
  };
  const setNewsStatus = async (id, status) => {
    await run(supabase.from('news_items').update({ status }).eq('id', id));
  };
  const remove = async (table, id) => {
    await run(supabase.from(table).delete().eq('id', id));
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Admin Dashboard</h1>
        <button onClick={signOut} className="text-xs font-mono uppercase tracking-wide px-4 py-2 rounded-full border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
          Sign Out
        </button>
      </div>

      {notice && <p role="alert" className="text-xs text-rose-500 mb-4">{notice}</p>}

      <div className="flex gap-2 flex-wrap mb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium cursor-pointer border-b-2 -mb-px"
            style={{ borderColor: tab === t ? 'var(--ias-green)' : 'transparent', color: tab === t ? 'var(--ias-green)' : 'var(--text-muted)' }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Contact Messages' && (
        <div className="space-y-3">
          {contacts.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No messages yet.</p>}
          {contacts.map((c) => (
            <div key={c.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{c.name} — <span style={{ color: 'var(--text-muted)' }}>{c.email}</span></p>
                <span className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              {c.subject && <p className="text-xs font-semibold mb-1">{c.subject}</p>}
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.message}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'Pending Members' && (
        <div className="space-y-3">
          {pendingMembers.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pending registrations.</p>}
          {pendingMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="font-semibold text-sm">{m.full_name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMemberStatus(m.id, 'activated')} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--ias-green)] text-white cursor-pointer">Activate</button>
                <button onClick={() => setMemberStatus(m.id, 'declined')} className="text-xs font-semibold px-3 py-1.5 rounded-full border text-rose-500 cursor-pointer" style={{ borderColor: 'var(--border)' }}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Events' && (
        <div className="space-y-6">
          <form onSubmit={addEvent} className="grid sm:grid-cols-2 gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <Field placeholder="Title" required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            <Field type="date" required value={newEvent.event_date} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} />
            <Field placeholder="Image URL" value={newEvent.image_url} onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })} />
            <select value={newEvent.status} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <Field placeholder="YouTube Video URL" value={newEvent.video_url} onChange={(e) => setNewEvent({ ...newEvent, video_url: e.target.value })} />
            <textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }} />
            <button type="submit" className="sm:col-span-2 py-2 rounded-lg bg-[var(--ias-green)] text-white text-sm font-semibold cursor-pointer">Add Event</button>
          </form>
          {events.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <div><p className="font-semibold text-sm">{e.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.event_date} · {e.status}</p></div>
              <button onClick={() => remove('events', e.id)} className="text-xs text-rose-500 cursor-pointer">Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Articles' && (
        <div className="space-y-6">
          <form onSubmit={addNews} className="grid sm:grid-cols-2 gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <Field placeholder="Title" required value={newNews.title} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} />
            <Field type="date" required value={newNews.published_at} onChange={(e) => setNewNews({ ...newNews, published_at: e.target.value })} />
            <Field placeholder="Image URL" value={newNews.image_url} onChange={(e) => setNewNews({ ...newNews, image_url: e.target.value })} />
            <Field placeholder="Author name (optional)" maxLength={100} value={newNews.author_name} onChange={(e) => setNewNews({ ...newNews, author_name: e.target.value })} />
            <Field placeholder="Author role / organisation (optional)" maxLength={150} value={newNews.author_title} onChange={(e) => setNewNews({ ...newNews, author_title: e.target.value })} />
            <textarea placeholder="Description" value={newNews.description} onChange={(e) => setNewNews({ ...newNews, description: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }} />
            <button type="submit" className="sm:col-span-2 py-2 rounded-lg bg-[var(--ias-green)] text-white text-sm font-semibold cursor-pointer">Add Article</button>
          </form>

          {pendingNews.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending Approval ({pendingNews.length})
              </h3>
              {pendingNews.map((n) => (
                <div key={n.id} className="flex items-center justify-between rounded-xl border p-4 mb-2" style={{ borderColor: 'var(--ias-gold)', background: 'var(--bg)' }}>
                  <div>
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{[n.author_name, n.author_title].filter(Boolean).join(' · ')}</p>
                    <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{n.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setNewsStatus(n.id, 'approved')} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--ias-green)] text-white cursor-pointer">Approve</button>
                    <button onClick={() => setNewsStatus(n.id, 'rejected')} className="text-xs font-semibold px-3 py-1.5 rounded-full border text-rose-500 cursor-pointer" style={{ borderColor: 'var(--border)' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="font-semibold text-sm mb-2">Published Articles</h3>
          {news.map((n) => (
            <div key={n.id} className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <div><p className="font-semibold text-sm">{n.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.published_at}</p></div>
              <button onClick={() => remove('news_items', n.id)} className="text-xs text-rose-500 cursor-pointer">Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Gallery' && (
        <div className="space-y-6">
          <form onSubmit={addImage} className="grid sm:grid-cols-2 gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <Field placeholder="Image URL" required value={newImage.image_url} onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })} />
            <Field placeholder="Caption" value={newImage.caption} onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })} />
            <button type="submit" className="sm:col-span-2 py-2 rounded-lg bg-[var(--ias-green)] text-white text-sm font-semibold cursor-pointer">Add Image</button>
          </form>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {gallery.map((g) => (
              <div key={g.id} className="relative group">
                <img src={g.image_url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                <button onClick={() => remove('gallery_images', g.id)} className="absolute inset-0 bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Newsletter Issues' && (
        <div className="space-y-6">
          <form onSubmit={addIssue} className="grid sm:grid-cols-2 gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <Field placeholder="Title" required value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} />
            <Field type="date" required value={newIssue.published_at} onChange={(e) => setNewIssue({ ...newIssue, published_at: e.target.value })} />
            <Field placeholder="Cover Image URL" value={newIssue.cover_image_url} onChange={(e) => setNewIssue({ ...newIssue, cover_image_url: e.target.value })} />
            <Field placeholder="File URL (PDF)" required value={newIssue.file_url} onChange={(e) => setNewIssue({ ...newIssue, file_url: e.target.value })} />
            <textarea placeholder="Description" value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }} />
            <button type="submit" className="sm:col-span-2 py-2 rounded-lg bg-[var(--ias-green)] text-white text-sm font-semibold cursor-pointer">Add Issue</button>
          </form>
          {issues.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold text-sm">{i.title}</p>
              <button onClick={() => remove('newsletter_issues', i.id)} className="text-xs text-rose-500 cursor-pointer">Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Magazine' && (
        <div className="space-y-6">
          <form onSubmit={addEdition} className="grid sm:grid-cols-2 gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <Field placeholder="Edition title (e.g. IAS Magazine 2026)" required value={newEdition.title} onChange={(e) => setNewEdition({ ...newEdition, title: e.target.value })} />
            <Field type="number" min="2000" max="2100" required value={newEdition.year} onChange={(e) => setNewEdition({ ...newEdition, year: e.target.value })} />
            <Field placeholder="Cover Image URL" value={newEdition.cover_image_url} onChange={(e) => setNewEdition({ ...newEdition, cover_image_url: e.target.value })} />
            <Field placeholder="File URL (PDF)" required value={newEdition.file_url} onChange={(e) => setNewEdition({ ...newEdition, file_url: e.target.value })} />
            <button type="submit" className="sm:col-span-2 py-2 rounded-lg bg-[var(--ias-green)] text-white text-sm font-semibold cursor-pointer">Add Edition</button>
          </form>
          {editions.map((ed) => (
            <div key={ed.id} className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <div><p className="font-semibold text-sm">{ed.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ed.year}</p></div>
              <button onClick={() => remove('magazine_editions', ed.id)} className="text-xs text-rose-500 cursor-pointer">Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'IAS Squad' && (
        <div className="space-y-6">
          <form onSubmit={addMember} className="grid sm:grid-cols-2 gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <Field placeholder="Full Name" required value={newMember.full_name} onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })} />
            <Field placeholder="Role / Title" value={newMember.role_title} onChange={(e) => setNewMember({ ...newMember, role_title: e.target.value })} />
            <Field placeholder="Photo URL" value={newMember.photo_url} onChange={(e) => setNewMember({ ...newMember, photo_url: e.target.value })} />
            <Field placeholder="LinkedIn URL" value={newMember.linkedin_url} onChange={(e) => setNewMember({ ...newMember, linkedin_url: e.target.value })} />
            <select value={newMember.category} onChange={(e) => setNewMember({ ...newMember, category: e.target.value })} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
              <option value="member">IAS Member</option>
              <option value="executive">Executive Committee</option>
              <option value="volunteer">Volunteer</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newMember.is_top_volunteer} onChange={(e) => setNewMember({ ...newMember, is_top_volunteer: e.target.checked })} />
              Top Contributor
            </label>
            <textarea placeholder="Contribution note" value={newMember.contribution_note} onChange={(e) => setNewMember({ ...newMember, contribution_note: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }} />
            <button type="submit" className="sm:col-span-2 py-2 rounded-lg bg-[var(--ias-green)] text-white text-sm font-semibold cursor-pointer">Add Member</button>
          </form>
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold text-sm">{m.full_name} {m.is_top_volunteer && '⭐'}</p>
              <button onClick={() => remove('member_wall', m.id)} className="text-xs text-rose-500 cursor-pointer">Delete</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

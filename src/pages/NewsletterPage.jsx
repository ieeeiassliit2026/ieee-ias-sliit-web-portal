import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Newspaper, PenLine, Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import ImageHero from '../components/ImageHero';
import NewsletterBox from '../components/NewsletterBox';
import Reveal from '../components/Reveal';
import HeroBg from '../assets/HeroOC.jpg';

const PAGE_SIZE = 6;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------- Skeletons (shimmer-skeleton styles every direct child <div>) ----------
function CardSkeleton() {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }} aria-hidden="true">
      <div className="shimmer-skeleton"><div className="h-36 w-full" /></div>
      <div className="p-5 space-y-3 shimmer-skeleton">
        <div className="h-5 w-4/5 rounded" />
        <div className="h-3 w-full rounded" />
        <div className="h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

// ---------- Article card (follows the wireframe: banner -> title -> excerpt -> meta row -> pills) ----------
const readMinutes = (text) => Math.max(1, Math.ceil((text || '').split(/\s+/).filter(Boolean).length / 200));

function ArticleCard({ item }) {
  const [open, setOpen] = useState(false);
  const author = item.author_name || 'IEEE IAS SLIIT';
  const hasImg = !!item.image_url;
  const pill = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold';
  return (
    <article className="card-hover flex h-full flex-col rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <div className="relative px-5 pt-4 pb-5 text-center" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--ias-green) 22%, transparent), color-mix(in srgb, var(--ias-gold) 10%, transparent))' }}>
        {hasImg && (
          <>
            <img src={item.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/55" />
          </>
        )}
        <div className="relative">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: hasImg ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>Community Article</p>
          <p className={`font-display text-lg leading-tight mb-3 ${hasImg ? 'text-white' : ''}`}>{author}</p>
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center font-display text-2xl text-white bg-[var(--ias-green)] ring-2 ring-white/50" aria-hidden="true">
            {author.charAt(0).toUpperCase()}
          </div>
          {item.author_title && (
            <span className={`${pill} mt-4`} style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{item.author_title}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-snug mb-3">{item.title}</h3>
        {item.description && (
          <p className={`text-sm leading-relaxed whitespace-pre-line ${open ? '' : 'line-clamp-4'}`} style={{ color: 'var(--text-muted)' }}>{item.description}</p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            <span>{fmtDate(item.published_at)}</span>
            <span>{readMinutes(item.description)} min read</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setOpen(!open)} aria-expanded={open} className={`${pill} cursor-pointer`} style={{ borderColor: 'var(--ias-green)', color: 'var(--ias-green)' }}>
              {open ? 'Show less' : 'Read more'}
            </button>
            <span className={pill} style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Article</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nav = 'text-xs px-2 py-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-default';
  return (
    <nav className="flex items-center justify-center gap-3 mt-10 text-xs" aria-label="Pagination">
      <button className={nav} style={{ color: 'var(--text-muted)' }} disabled={page === 1} onClick={() => onChange(page - 1)}>&lsaquo; Previous</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          aria-current={n === page ? 'page' : undefined}
          className="w-8 h-8 rounded-md border font-mono cursor-pointer"
          style={{ borderColor: n === page ? 'var(--ias-green)' : 'var(--border)', color: n === page ? 'var(--ias-green)' : undefined, background: n === page ? 'var(--bg-elevated)' : undefined }}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button className={nav} disabled={page === pages} onClick={() => onChange(page + 1)}>Next &rsaquo;</button>
    </nav>
  );
}

// ---------- Submit form (members; RLS enforces membership + pending status) ----------
function SubmitArticle() {
  const { session } = useAuth();
  const [form, setForm] = useState({ title: '', author_title: '', description: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const field = 'px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--ias-green)] w-full';
  const fieldStyle = { borderColor: 'var(--border)', background: 'var(--bg)' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const { error: err } = await supabase.from('news_items').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      author_title: form.author_title.trim() || null,
      status: 'pending',
    });
    if (err) {
      setStatus('error');
      setError(err.code === '42501' ? 'Only activated members can submit articles. Your membership may still be pending approval.' : 'Something went wrong. Please try again.');
      return;
    }
    setForm({ title: '', author_title: '', description: '' });
    setStatus('sent');
  };

  return (
    <div className="rounded-2xl border p-6 mb-12" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <h3 className="font-display text-lg mb-1 flex items-center gap-2">
        <PenLine size={18} style={{ color: 'var(--ias-green)' }} /> Submit an Article
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Share a blog or article with the chapter. It is published after the admin team approves it.
      </p>
      {!session ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link to="/login" className="link-underline font-semibold" style={{ color: 'var(--ias-green)' }}>Log in</Link> or{' '}
          <Link to="/register" className="link-underline font-semibold" style={{ color: 'var(--ias-green)' }}>register</Link> as a member to submit an article.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-3">
          <input className={field} style={fieldStyle} placeholder="Article title" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={field} style={fieldStyle} placeholder="Your role / organisation (optional)" maxLength={150} value={form.author_title} onChange={(e) => setForm({ ...form, author_title: e.target.value })} />
          <textarea className={`sm:col-span-2 ${field}`} style={fieldStyle} placeholder="Write your article..." rows="5" required maxLength={10000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {status === 'error' && <p role="alert" className="text-xs text-rose-500 sm:col-span-2">{error}</p>}
          {status === 'sent' && <p className="text-xs sm:col-span-2" style={{ color: 'var(--ias-green)' }}>Submitted! Your article is pending approval.</p>}
          <button type="submit" disabled={status === 'sending'} className="sm:col-span-2 btn-shimmer py-2 rounded-lg text-white text-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: 'var(--ias-green)' }}>
            <Send size={14} /> {status === 'sending' ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function NewsletterPage() {
  const [issues, setIssues] = useState([]);
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    supabase
      .from('newsletter_issues')
      .select('*')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setIssues(data || []);
      });
  }, []);

  useEffect(() => {
    setArticlesLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    supabase
      .from('news_items')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
      .then(({ data, count }) => {
        setArticles(data || []);
        setTotal(count || 0);
        setArticlesLoading(false);
      });
  }, [page]);

  const goTo = (n) => {
    setPage(n);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <ImageHero image={issues[0]?.cover_image_url || HeroBg} height="h-[55vh]" title="Newsletter" subtitle="Articles, announcements, and updates from IEEE IAS SLIIT." />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div ref={listRef} className="scroll-mt-24" />
        <SubmitArticle />

        <h2 className="font-display text-2xl mb-6">Articles</h2>
        {articlesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <Newspaper className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No articles published yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item, i) => (
              <Reveal key={item.id} delay={i * 80} direction="scale"><ArticleCard item={item} /></Reveal>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pages} onChange={goTo} />

        {issues.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl mb-6">Issues</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {issues.map((issue, i) => (
                <Reveal key={issue.id} delay={i * 100} direction="scale">
                  <div className="card-hover rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                    {issue.cover_image_url && (
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={issue.cover_image_url} alt={issue.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--ias-green)' }}>{fmtDate(issue.published_at)}</p>
                      <h3 className="font-semibold mb-1">{issue.title}</h3>
                      {issue.description && <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{issue.description}</p>}
                      <a href={issue.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold link-underline" style={{ color: 'var(--ias-green)' }}>
                        <Mail size={13} /> View / Download
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20"><Reveal><NewsletterBox /></Reveal></div>
      </section>
    </>
  );
}

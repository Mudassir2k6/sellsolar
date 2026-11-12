'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Copy,
  ExternalLink,
  Hash,
  Lightbulb,
  MapPin,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  FileText,
  LayoutDashboard,
} from 'lucide-react';

const STORAGE_KEY = 'sellsolar_social_insights_tracked';

const NAV = [
  { id: 'discover', label: 'Discover Trends', icon: TrendingUp },
  { id: 'content', label: 'Content Ideas', icon: Lightbulb },
  { id: 'tracked-pages', label: 'Tracked Pages', icon: FileText },
  { id: 'tracked-posts', label: 'Tracked Posts', icon: Share2 },
  { id: 'my-insights', label: 'My Insights', icon: Bookmark },
];

function loadTracked() {
  if (typeof window === 'undefined') return { pages: [], posts: [], savedTags: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pages: [], posts: [], savedTags: [] };
    const parsed = JSON.parse(raw);
    return {
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      savedTags: Array.isArray(parsed.savedTags) ? parsed.savedTags : [],
    };
  } catch {
    return { pages: [], posts: [], savedTags: [] };
  }
}

function saveTracked(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function platformBadgeClass(name) {
  const n = String(name || '').toLowerCase();
  if (n.includes('tiktok')) return 'bg-gray-900 text-white';
  if (n.includes('instagram')) return 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-white';
  if (n.includes('youtube')) return 'bg-rose-600 text-white';
  if (n.includes('facebook')) return 'bg-blue-600 text-white';
  return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200';
}

export default function AdminSocialInsights({ onBackToSite }) {
  const [section, setSection] = useState('discover');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState({ pages: [], posts: [], savedTags: [] });
  const [copiedTag, setCopiedTag] = useState('');

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/social-insights.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load insights (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err?.message || 'Could not load social insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTracked(loadTracked());
    fetchInsights();
  }, [fetchInsights]);

  const updateTracked = useCallback((updater) => {
    setTracked((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveTracked(next);
      return next;
    });
  }, []);

  const toggleSaveTag = useCallback(
    (tag) => {
      updateTracked((prev) => {
        const exists = prev.savedTags.includes(tag);
        return {
          ...prev,
          savedTags: exists ? prev.savedTags.filter((t) => t !== tag) : [...prev.savedTags, tag],
        };
      });
    },
    [updateTracked]
  );

  const trackNewsAsPage = useCallback(
    (item) => {
      updateTracked((prev) => {
        if (prev.pages.some((p) => p.id === item.id)) return prev;
        return {
          ...prev,
          pages: [
            {
              id: item.id,
              title: item.title,
              url: item.url,
              savedAt: new Date().toISOString(),
            },
            ...prev.pages,
          ].slice(0, 50),
        };
      });
    },
    [updateTracked]
  );

  const trackIdeaAsPost = useCallback(
    (idea) => {
      updateTracked((prev) => {
        if (prev.posts.some((p) => p.id === idea.id)) return prev;
        return {
          ...prev,
          posts: [
            {
              id: idea.id,
              title: idea.title,
              format: idea.format,
              platforms: idea.platforms,
              hashtags: idea.hashtags,
              savedAt: new Date().toISOString(),
            },
            ...prev.posts,
          ].slice(0, 50),
        };
      });
    },
    [updateTracked]
  );

  const copyTag = async (tag) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(''), 1500);
    } catch {}
  };

  const hashtags = data?.hashtags || [];
  const news = data?.trendingNews || [];
  const ideas = data?.contentIdeas || [];

  const myInsightStats = useMemo(
    () => ({
      tags: tracked.savedTags.length,
      pages: tracked.pages.length,
      posts: tracked.posts.length,
    }),
    [tracked]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Inner Social Insights nav */}
        <aside className="lg:w-56 shrink-0 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
          <div className="mb-3 px-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Social Insights</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Trends · Hashtags · SEO</p>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          {typeof onBackToSite === 'function' && (
            <button
              type="button"
              onClick={onBackToSite}
              className="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Site
            </button>
          )}
        </aside>

        <div className="flex-1 min-w-0 space-y-5">
          {/* Header controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-500" />
                {section === 'discover' && 'Discover Live Trends'}
                {section === 'content' && 'Content Ideas That Work'}
                {section === 'tracked-pages' && 'Tracked Pages'}
                {section === 'tracked-posts' && 'Tracked Posts'}
                {section === 'my-insights' && 'My Insights'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data?.notice ||
                  'Real-time trending solar content from across the web and social media — not your own data.'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200">
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                {data?.location || 'Pakistan'}
              </span>
              <button
                type="button"
                onClick={fetchInsights}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <a
                href="https://sellsolar.pk/social-insights"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-bold bg-amber-50 dark:bg-amber-950/40"
              >
                Open /social-insights
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {data?.lastUpdatedLabel && (
            <p className="text-[11px] text-gray-400 font-mono">
              File last updated: {data.lastUpdatedLabel} · Cron: every night 1:00 AM PKT
            </p>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {loading && !data && (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-sm text-gray-500">
              Loading social insights…
            </div>
          )}

          {/* DISCOVER */}
          {section === 'discover' && data && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    Trending Solar News & Content
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    What&apos;s being published and discussed right now — use these topics for your own posts.
                  </p>
                </div>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {news.map((item) => (
                    <li key={item.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <a
                          href={item.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-gray-900 dark:text-white hover:text-amber-600"
                        >
                          {item.title}
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(item.tags || []).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => copyTag(tag)}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                            >
                              {tag}
                            </button>
                          ))}
                          <span className="text-[10px] text-gray-400 font-medium">{item.source}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => trackNewsAsPage(item)}
                        className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Track page
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="mb-3">
                  <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Hash className="h-4 w-4 text-amber-500" />
                    Trending Solar Hashtags
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    These tags update nightly into <code className="font-mono text-[11px]">/social-insights.json</code> so
                    search / AEO / GEO can find SellSolar.pk.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {hashtags.map((item) => {
                    const saved = tracked.savedTags.includes(item.tag);
                    return (
                      <div
                        key={item.tag}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => copyTag(item.tag)}
                            className="text-base font-black text-gray-900 dark:text-white hover:text-amber-600 text-left"
                            title="Copy hashtag"
                          >
                            {item.tag}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSaveTag(item.tag)}
                            className={`p-1.5 rounded-lg ${
                              saved
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            }`}
                            title={saved ? 'Saved' : 'Save tag'}
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(item.platforms || []).map((p) => (
                            <span
                              key={`${item.tag}-${p.name}`}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${platformBadgeClass(p.name)}`}
                            >
                              {p.name} · {p.posts} posts
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto flex items-center gap-2">
                          <a
                            href={item.searchUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1"
                          >
                            Search <ExternalLink className="h-3 w-3" />
                          </a>
                          {copiedTag === item.tag && (
                            <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1">
                              <Copy className="h-3 w-3" /> Copied
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* CONTENT IDEAS */}
          {section === 'content' && data && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Proven content ideas for solar pages — based on what&apos;s trending and what gets engagement.
              </p>
              <ol className="space-y-3">
                {ideas.map((idea, idx) => (
                  <li
                    key={idea.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wide text-amber-600">
                          {idea.format}
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{idea.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(idea.platforms || []).map((p) => (
                            <span
                              key={`${idea.id}-${p}`}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${platformBadgeClass(p)}`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(idea.hashtags || []).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => copyTag(tag)}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => trackIdeaAsPost(idea)}
                        className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Track post
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {section === 'tracked-pages' && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5">
              {tracked.pages.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No tracked pages yet. Open Discover Trends and tap <strong>Track page</strong> on a news topic.
                </p>
              ) : (
                <ul className="space-y-3">
                  {tracked.pages.map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-900 dark:text-white hover:text-amber-600">
                          {p.title}
                        </a>
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">{p.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateTracked((prev) => ({
                            ...prev,
                            pages: prev.pages.filter((x) => x.id !== p.id),
                          }))
                        }
                        className="text-[11px] font-bold text-rose-600"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {section === 'tracked-posts' && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5">
              {tracked.posts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No tracked posts yet. Open Content Ideas and tap <strong>Track post</strong>.
                </p>
              ) : (
                <ul className="space-y-3">
                  {tracked.posts.map((p) => (
                    <li key={p.id} className="border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase text-amber-600">{p.format}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{p.title}</p>
                          <p className="text-[11px] text-gray-500 mt-1">{(p.hashtags || []).join(' ')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateTracked((prev) => ({
                              ...prev,
                              posts: prev.posts.filter((x) => x.id !== p.id),
                            }))
                          }
                          className="text-[11px] font-bold text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {section === 'my-insights' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <LayoutDashboard className="h-5 w-5 text-amber-500 mb-2" />
                <p className="text-2xl font-black text-gray-900 dark:text-white">{myInsightStats.tags}</p>
                <p className="text-xs text-gray-500 font-bold">Saved hashtags</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {tracked.savedTags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <FileText className="h-5 w-5 text-amber-500 mb-2" />
                <p className="text-2xl font-black text-gray-900 dark:text-white">{myInsightStats.pages}</p>
                <p className="text-xs text-gray-500 font-bold">Tracked pages</p>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <Share2 className="h-5 w-5 text-amber-500 mb-2" />
                <p className="text-2xl font-black text-gray-900 dark:text-white">{myInsightStats.posts}</p>
                <p className="text-xs text-gray-500 font-bold">Tracked posts</p>
              </div>
              <div className="sm:col-span-3 rounded-2xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-200">
                Nightly cron (1:00 AM PKT) refreshes <code className="font-mono">public/social-insights.json</code> on
                sellsolar.pk. Public page <code className="font-mono">/social-insights</code> exposes these hashtags for
                SEO, AEO and GEO discovery.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

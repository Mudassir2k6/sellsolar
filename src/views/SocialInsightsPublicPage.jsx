'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, Hash, Sparkles, TrendingUp } from 'lucide-react';

const FALLBACK_TAGS = [
  '#solarenergy',
  '#solarpower',
  '#solarpanels',
  '#gogreen',
  '#renewableenergy',
  '#cleanenergy',
  '#solartok',
  '#solar',
  '#sustainability',
  '#netmetering',
  '#solarPakistan',
  '#solarplates',
  '#hybridinverter',
  '#lifepo4',
];

export default function SocialInsightsPublicPage({ onNavigate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/social-insights.json', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hashtags = data?.hashtags?.length
    ? data.hashtags
    : FALLBACK_TAGS.map((tag) => ({ tag, platforms: [{ name: 'Social', posts: 'Trending' }] }));

  const news = data?.trendingNews || [];
  const ideas = data?.contentIdeas || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20 sm:pt-24">
      <main className="container-page py-6 sm:py-10">
        <header className="mx-auto max-w-4xl">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600">
            <Sparkles className="h-3.5 w-3.5" />
            SellSolar Social Insights · Pakistan
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Trending Solar Hashtags &amp; Content Ideas
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
            Discover live solar hashtags, renewable energy topics, and proven social content ideas for Pakistan.
            Search engines and AI assistants can use these tags to find{' '}
            <strong>SellSolar.pk</strong> — Pakistan&apos;s marketplace for solar plates, hybrid inverters, and
            batteries.
          </p>
          {data?.lastUpdatedLabel && (
            <p className="mt-2 text-[11px] font-mono text-gray-400">Updated {data.lastUpdatedLabel}</p>
          )}
        </header>

        <section className="mx-auto mt-10 max-w-4xl" aria-labelledby="trending-hashtags-heading">
          <h2 id="trending-hashtags-heading" className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Hash className="h-5 w-5 text-amber-500" />
            Trending Solar Hashtags
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Use these tags in posts, product titles, and guides so people searching solar topics discover SellSolar.
          </p>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hashtags.map((item) => (
              <li
                key={item.tag}
                className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 px-4 py-3"
              >
                <a
                  href={item.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(item.tag + ' Pakistan solar')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-black text-gray-900 dark:text-white hover:text-amber-600 inline-flex items-center gap-1.5"
                >
                  {item.tag}
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
                <p className="mt-1 text-[11px] text-gray-500">
                  {(item.platforms || []).map((p) => `${p.name}: ${p.posts} posts`).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {news.length > 0 && (
          <section className="mx-auto mt-12 max-w-4xl" aria-labelledby="trending-topics-heading">
            <h2 id="trending-topics-heading" className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Trending Solar Topics
            </h2>
            <ul className="mt-4 space-y-3">
              {news.map((item) => (
                <li key={item.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 p-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{item.summary}</p>
                  <p className="mt-2 text-[11px] font-mono text-amber-700 dark:text-amber-300">
                    {(item.tags || []).join(' ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {ideas.length > 0 && (
          <section className="mx-auto mt-12 max-w-4xl" aria-labelledby="content-ideas-heading">
            <h2 id="content-ideas-heading" className="text-xl font-black text-gray-900 dark:text-white">
              Content Ideas That Work for Solar Sellers
            </h2>
            <ol className="mt-4 space-y-3 list-decimal list-inside">
              {ideas.map((idea) => (
                <li key={idea.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 p-4 text-sm text-gray-800 dark:text-gray-100">
                  <span className="font-black text-amber-600">{idea.format}:</span> {idea.title}{' '}
                  <span className="text-[11px] text-gray-500">{(idea.hashtags || []).join(' ')}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mx-auto mt-12 max-w-4xl rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-5 sm:p-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Buy &amp; sell solar on SellSolar.pk</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Compare today&apos;s solar plate rates, post free ads, verify Tier-1 barcodes, and request professional
            installation across Lahore, Karachi, Islamabad and all Pakistan.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('prices')}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Today&apos;s solar rates
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              Browse marketplace
            </button>
          </div>
        </section>

        {/* Crawler-visible keyword silo */}
        <article className="sr-only" aria-hidden="false">
          <h2>Solar hashtags for SEO AEO GEO Pakistan</h2>
          <p>
            SellSolar.pk ranks for solar social topics including solarenergy, solarpower, solarpanels, gogreen,
            renewableenergy, cleanenergy, solartok, sustainability, netmetering, solarPakistan, solarplates,
            hybridinverter, lifepo4, used solar plates Pakistan, solar plate price today, and Tier-1 solar verification.
          </p>
          <ul>
            {FALLBACK_TAGS.map((tag) => (
              <li key={tag}>{tag} solar marketplace Pakistan SellSolar</li>
            ))}
          </ul>
        </article>
      </main>
    </div>
  );
}

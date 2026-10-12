'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Newspaper,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';

export default function DailySolarNews({ onNavigate, isStandalonePage = false, className = '' }) {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSources, setShowSources] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchNews = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await fetch(`/api/solar-news${forceRefresh ? '?refresh=true' : ''}`);
      if (!res.ok) throw new Error('Failed to load news');
      const data = await res.json();
      setNewsData(data);
    } catch (err) {
      console.warn('Error fetching solar news:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
  }, []);

  const articles = newsData?.articles || [];
  const groundingSources = newsData?.groundingSources || [];
  const searchQueries = newsData?.searchQueries || [];

  const categories = useMemo(() => {
    const set = new Set(['All']);
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        a.headline?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.keyTakeaway?.toLowerCase().includes(q) ||
        a.tag?.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return filteredArticles.find((a) => a.featured) || filteredArticles[0] || null;
  }, [filteredArticles]);

  const regularArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  const handleCopy = (article) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const text = `${article.headline}\n\n${article.summary}\n\n⚡ Takeaway: ${article.keyTakeaway || ''}\n\nVia SellSolar.pk Daily News`;
      navigator.clipboard.writeText(text);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShareWhatsApp = (article) => {
    const text = `*${article.headline}*\n\n${article.summary}\n\n⚡ *Key Takeaway:* ${article.keyTakeaway || ''}\n\nRead more on SellSolar.pk`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const lastUpdatedDisplay = useMemo(() => {
    if (!newsData?.lastUpdated) return 'Today';
    try {
      const d = new Date(newsData.lastUpdated);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    } catch {
      return 'Today';
    }
  }, [newsData?.lastUpdated]);

  return (
    <section id="solar-news-section" className={`w-full ${className}`}>
      {/* Outer Card / Container */}
      <div className="rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-600 dark:via-amber-700 dark:to-gray-900 px-4 sm:px-6 py-5 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
                  Live Search Grounding
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/40 text-amber-100 border border-white/10">
                  <Globe className="h-3 w-3" /> Pakistan Market
                </span>
                {newsData?.groundedWithGoogleSearch && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    <CheckCircle2 className="h-3 w-3" /> Web Sources Verified
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2.5 text-white">
                <Newspaper className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200 shrink-0" />
                Daily Solar News & Market Intel
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium max-w-2xl">
                Real-time updates on solar panel rates, NEPRA net-metering policies, inverter imports, and technology breakthroughs across Pakistan.
              </p>
            </div>

            {/* Refresh and Timestamp Actions */}
            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-amber-200/90 tracking-wider">Last Synced</div>
                <div className="text-xs font-bold text-white font-mono">{lastUpdatedDisplay}</div>
              </div>
              <button
                type="button"
                onClick={() => fetchNews(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-gray-900 hover:bg-amber-50 active:scale-95 transition-all text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                title="Fetch latest updates from Google Search"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-amber-600 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Fetching Live...' : 'Refresh News'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, NEPRA, TOPCon, rates..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-4 animate-pulse">
              <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                ))}
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">No Matching Updates Found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                No solar news articles matched your filter "{searchQuery}". Try selecting "All" categories or reset your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="btn-outline text-xs px-4 py-2 font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              {/* Featured / Hero News Card */}
              {featuredArticle && (
                <div className="relative rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950/20 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                      🔥 Breaking Update
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      {featuredArticle.category}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {featuredArticle.timeAgo || featuredArticle.date}
                    </span>
                    {featuredArticle.readTime && (
                      <span className="text-xs text-gray-400 hidden sm:inline">• {featuredArticle.readTime}</span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                    {featuredArticle.headline}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {featuredArticle.summary}
                  </p>

                  {/* Key Consumer Takeaway Callout Box */}
                  {featuredArticle.keyTakeaway && (
                    <div className="mt-4 p-3.5 rounded-xl bg-white dark:bg-gray-800/80 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 shadow-2xs">
                      <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-extrabold text-amber-900 dark:text-amber-200">Practical Takeaway: </span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{featuredArticle.keyTakeaway}</span>
                      </div>
                    </div>
                  )}

                  {/* Card Footer: Source & Share */}
                  <div className="mt-4 pt-3.5 border-t border-amber-200/60 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 font-medium">Source:</span>
                      <a
                        href={featuredArticle.sourceUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        {featuredArticle.sourceName || 'Verified Dispatch'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(featuredArticle)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                        title="Copy headline and summary"
                      >
                        {copiedId === featuredArticle.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-gray-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(featuredArticle)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of Other Articles */}
              {regularArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {regularArticles.map((article) => (
                    <div
                      key={article.id}
                      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Tags & Relative Time */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                            {article.category}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {article.timeAgo || article.date}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug line-clamp-2">
                          {article.headline}
                        </h4>

                        {/* Summary */}
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                          {article.summary}
                        </p>

                        {/* Key Takeaway */}
                        {article.keyTakeaway && (
                          <div className="mt-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-[11px] text-gray-700 dark:text-gray-300">
                            <span className="font-bold text-amber-600 dark:text-amber-400">⚡ Insight: </span>
                            {article.keyTakeaway}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                        <a
                          href={article.sourceUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 truncate max-w-[150px]"
                          title={article.sourceName}
                        >
                          <span className="truncate">{article.sourceName || 'Source'}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(article)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            title="Copy link & summary"
                          >
                            {copiedId === article.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(article)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Grounding Source Verification Drawer / Accordion */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="w-full flex items-center justify-between py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Search Grounding Citations & Web Reference Sources ({groundingSources.length})</span>
              </div>
              {showSources ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showSources && (
              <div className="mt-3 p-4 rounded-2xl bg-gray-50/90 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/60 space-y-3 animate-in fade-in duration-200">
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  The news updates above are fetched and factualized with live Google Search Grounding across verified government gazettes, news desks, and renewable energy reports:
                </div>

                {/* Search queries pills */}
                {searchQueries.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Verified Queries:</span>
                    {searchQueries.map((q, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                )}

                {/* Grounding Sources Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {groundingSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/80 hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-2 group text-xs"
                    >
                      <div className="truncate font-semibold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {source.title || source.uri}
                      </div>
                      <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-amber-500 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

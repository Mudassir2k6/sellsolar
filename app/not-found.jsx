import Link from 'next/link';
import {
  Sun,
  Home,
  Search,
  TrendingUp,
  Calculator,
  ShoppingBag,
  ShieldCheck,
  Wrench,
  Bug,
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

export const metadata = {
  title: 'Page Not Found (404) | SellSolar',
  description:
    'The requested page could not be found on SellSolar. Browse live solar rates, solar load calculator, and marketplace listings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-decoration-none group"
            id="not-found-logo-link"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
              <Sun className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                SellSolar<span className="text-amber-500">.pk</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                Pakistan&apos;s Solar Marketplace
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/prices"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              id="not-found-header-rates"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Live Rates</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors"
              id="not-found-header-home"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:py-16 flex flex-col items-center text-center">
        {/* Reassurance Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold tracking-wide shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          HTTP 404 • Marketplace Operational
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-2xl leading-tight mb-4">
          This page is missing, but{' '}
          <span className="text-amber-500">SellSolar is online</span>
        </h1>

        {/* Reassuring Explanation */}
        <p className="text-slate-600 dark:text-slate-300 max-w-xl text-base sm:text-lg leading-relaxed mb-8">
          The link you followed may be broken, outdated, or mistyped. Don&apos;t worry — the rest of the
          SellSolar marketplace, daily rates, load calculator, and verified seller directory are running
          normally.
        </p>

        {/* Search Box */}
        <div className="w-full max-w-lg mb-10">
          <form
            action="/buy-solar"
            method="GET"
            className="relative flex items-center shadow-sm"
            id="not-found-search-form"
          >
            <div className="absolute left-4 pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search solar panels, inverters, batteries, or brands..."
              className="w-full pl-11 pr-28 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shadow-sm"
              id="not-found-search-submit"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Popular searches:</span>
            <Link href="/prices" className="hover:text-amber-600 dark:hover:text-amber-400 underline">
              Today&apos;s Rates
            </Link>
            <span>•</span>
            <Link href="/buy-solar?q=Longi" className="hover:text-amber-600 dark:hover:text-amber-400 underline">
              Longi 580W
            </Link>
            <span>•</span>
            <Link href="/buy-solar?q=Inverex" className="hover:text-amber-600 dark:hover:text-amber-400 underline">
              Inverex 6kW
            </Link>
            <span>•</span>
            <Link href="/buy-solar?q=Lithium" className="hover:text-amber-600 dark:hover:text-amber-400 underline">
              Lithium Battery
            </Link>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition-transform active:scale-95"
            id="not-found-cta-home"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/buy-solar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
            id="not-found-cta-marketplace"
          >
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span>Browse Marketplace</span>
          </Link>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
            id="not-found-cta-calculator"
          >
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span>Load Calculator</span>
          </Link>
        </div>

        {/* Helpful Destinations Grid */}
        <div className="w-full text-left mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 text-center">
            Helpful Sections You Might Be Looking For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <Link
              href="/prices"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
              id="not-found-card-rates"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Today&apos;s Solar Rates
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Live daily per-watt prices for A-grade panels, inverters &amp; batteries across Pakistan.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/calculator"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
              id="not-found-card-calc"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Solar Load Calculator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Accurately calculate your required kW system size, panel count &amp; battery backup.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/buy-solar"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
              id="not-found-card-marketplace"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Buy Solar Equipment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Explore new &amp; used solar panels, hybrid inverters &amp; lithium batteries from verified sellers.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dealers"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
              id="not-found-card-dealers"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Verified Dealers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Directory of certified solar equipment distributors in Lahore, Karachi, Islamabad &amp; more.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/install"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
              id="not-found-card-install"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 transition-colors">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Solar Installation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Request professional residential and commercial solar installation &amp; net metering.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/post-ad"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
              id="not-found-card-post"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 transition-colors">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Sell Solar (Free Ad)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    List your surplus or used solar panels and inverters to thousands of buyers in Pakistan.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bug / Broken Link Reporting Box */}
        <div className="w-full max-w-2xl rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-slate-900/80 p-6 text-left shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Found a broken link or website issue?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Help us keep SellSolar accurate. If a link on our platform led you to this missing page,
                  please report it so our team can resolve it immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Link
                href="/report-issue"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-bold transition-colors shadow-sm"
                id="not-found-report-button"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                id="not-found-contact-button"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SellSolar.pk • Pakistan&apos;s Dedicated Solar Marketplace</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/prices" className="hover:underline">Prices</Link>
            <Link href="/calculator" className="hover:underline">Calculator</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/help" className="hover:underline">Help Center</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Zap,
  ShieldCheck,
  TrendingUp,
  Award,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CITIES, CATEGORIES } from '../data/mockData';

interface HeroSectionProps {
  onSearchSubmit: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearchSubmit }) => {
  const { filters, setFilter, resetFilters } = useMarketplace();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickTag = (tag: string, cat?: string) => {
    setFilter('query', tag);
    if (cat) setFilter('category', cat);
    onSearchSubmit();
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-primary-50/50 via-white to-gray-50 border-b border-gray-100">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 -z-10 bg-grid opacity-30"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-300/20 blur-3xl -z-10"></div>
      <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-secondary-300/20 blur-3xl -z-10"></div>

      <div className="container-page">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary-200/80 px-4 py-1.5 rounded-full shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-secondary-500 animate-pulse"></span>
            <span className="text-xs font-extrabold tracking-wide uppercase text-gray-800">
              Pakistan's #1 Solar Marketplace
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-semibold text-primary-700 flex items-center gap-1">
              <SunMedium className="w-3.5 h-3.5 text-primary-500" /> Save up to 90% on Electricity Bills
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.12]">
            Buy & Sell Solar Equipment{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-primary-500 to-amber-500">
              with Confidence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find the best deals on new & used Tier-1 solar panels, hybrid inverters, lithium batteries, and complete net-metering systems from verified dealers across Pakistan.
          </p>

          {/* Hero Search Box */}
          <div className="pt-2">
            <form
              onSubmit={handleSearch}
              className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-200/80 max-w-3xl mx-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Search Keywords */}
                <div className="sm:col-span-5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Longi 580W, Inverex Nitrox 6kW..."
                    value={filters.query}
                    onChange={(e) => setFilter('query', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="sm:col-span-3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilter('category', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Dropdown */}
                <div className="sm:col-span-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilter('city', e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer truncate"
                  >
                    <option value="">All Cities</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Search Button */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full btn-primary py-2.5 px-4 text-sm font-bold shadow-md shadow-primary-500/25 flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Search Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-gray-500">
            <span className="font-semibold text-gray-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary-500" /> Popular:
            </span>
            <button
              onClick={() => handleQuickTag('Longi 580W', 'panel')}
              className="bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-800 px-3 py-1 rounded-full border border-gray-200/90 transition-colors shadow-2xs font-medium"
            >
              Longi 580W
            </button>
            <button
              onClick={() => handleQuickTag('Nitrox 6kW', 'inverter')}
              className="bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-800 px-3 py-1 rounded-full border border-gray-200/90 transition-colors shadow-2xs font-medium"
            >
              Inverex Nitrox 6kW
            </button>
            <button
              onClick={() => handleQuickTag('Lithium 48V', 'battery')}
              className="bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-800 px-3 py-1 rounded-full border border-gray-200/90 transition-colors shadow-2xs font-medium"
            >
              Lithium 48V 100Ah
            </button>
            <button
              onClick={() => handleQuickTag('10kW Complete System', 'complete_system')}
              className="bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-800 px-3 py-1 rounded-full border border-gray-200/90 transition-colors shadow-2xs font-medium"
            >
              10kW On-Grid Package
            </button>
            <button
              onClick={() => handleQuickTag('Canadian Solar', 'panel')}
              className="bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-800 px-3 py-1 rounded-full border border-gray-200/90 transition-colors shadow-2xs font-medium"
            >
              Canadian Solar 585W
            </button>
          </div>

          {/* Stats Badges Counter */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                5,800+
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Active Solar Ads</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-secondary-600 tracking-tight flex items-center justify-center gap-1">
                450+
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Verified Dealers</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight">
                14.8 MW
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Capacity Listed</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                0%
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">Commission / Fees</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

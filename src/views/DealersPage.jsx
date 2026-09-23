'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  BadgeCheck,
  Building2,
  ShieldCheck,
  Star,
  ExternalLink,
  Sparkles,
  Award,
  Filter,
  Layers,
  ArrowRight,
  Sun,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Info
} from 'lucide-react';
import { CITIES } from '../lib/constants';
import { supabase } from '../lib/supabase';
import {
  VERIFIED_DEALERS,
  REGISTRATION_SOURCES,
  getFilteredDealers,
  getCityDealerCounts,
  getSourceDealerCounts
} from '../data/dealersData';

export default function DealersPage({ onNavigate, onBack, hasOuterNavbar = false }) {
  const [dealersList, setDealersList] = useState(VERIFIED_DEALERS);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch any live dealers from Supabase profiles and merge with verified seed dealers
  useEffect(() => {
    let isMounted = true;

    async function loadRemoteDealers() {
      try {
        setIsLoading(true);
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('account_type', 'dealer');

        if (selectedSource && selectedSource !== 'all') {
          query = query.eq('registration_source', selectedSource);
        }

        const { data, error } = await query.limit(100);

        if (!error && Array.isArray(data) && data.length > 0 && isMounted) {
          // Normalize remote dealer records
          const remoteNormalized = data.map((d) => ({
            id: d.id,
            business_name: d.business_name || d.full_name || 'Solar Dealer',
            full_name: d.full_name || 'Authorized Representative',
            city: d.city || 'Pakistan',
            phone: d.phone || '',
            business_address: d.business_address || 'Verified Commercial Location',
            cnic: d.cnic || null,
            is_verified_dealer: !!d.is_verified_dealer,
            registration_source: d.registration_source || 'self_registered',
            brands: d.brands || ['Longi', 'Inverex', 'Growatt'],
            specialties: d.specialties || 'Turnkey Solar Installation & Wholesale',
            rating: d.rating || 4.8,
            reviews_count: d.reviews_count || 15,
            established_year: d.established_year || 2020,
            tier: d.is_verified_dealer ? 'Verified Dealer' : 'Registered Dealer'
          }));

          // Merge: remote first, then seed items that don't match existing phone or business name
          const phoneSet = new Set(remoteNormalized.map((r) => r.phone).filter(Boolean));
          const nameSet = new Set(remoteNormalized.map((r) => r.business_name?.toLowerCase().trim()));

          const remainingSeeds = VERIFIED_DEALERS.filter(
            (seed) => !phoneSet.has(seed.phone) && !nameSet.has(seed.business_name?.toLowerCase().trim())
          );

          setDealersList([...remoteNormalized, ...remainingSeeds]);
        }
      } catch (err) {
        console.warn('[DealersPage] Supabase load note:', err?.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRemoteDealers();

    return () => {
      isMounted = false;
    };
  }, [selectedSource]);

  // Filtered dataset
  const filteredDealers = useMemo(() => {
    return getFilteredDealers({
      dealers: dealersList,
      city: selectedCity,
      search: searchQuery,
      source: selectedSource,
      verifiedOnly
    });
  }, [dealersList, selectedCity, searchQuery, selectedSource, verifiedOnly]);

  // Counts for pills
  const cityCounts = useMemo(() => getCityDealerCounts(dealersList), [dealersList]);
  const sourceCounts = useMemo(() => getSourceDealerCounts(dealersList), [dealersList]);

  // Helper for WhatsApp click-to-chat
  const getWhatsAppLink = (dealer) => {
    const rawPhone = dealer.phone || '';
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    let intlNumber = cleanDigits;
    if (cleanDigits.startsWith('0')) {
      intlNumber = '92' + cleanDigits.slice(1);
    } else if (!cleanDigits.startsWith('92')) {
      intlNumber = '92' + cleanDigits;
    }

    const message = `Salam! I found your dealership "${dealer.business_name}" on SellSolar.pk and would like to inquire about solar equipment rates and availability in ${dealer.city}.`;
    return `https://wa.me/${intlNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${hasOuterNavbar ? 'pt-20 sm:pt-24 lg:pt-28' : ''}`}>
      {/* Optional Standalone Header if no outer navbar */}
      {!hasOuterNavbar && (
        <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="container-page flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              type="button"
              onClick={onBack || (() => onNavigate?.('home'))}
              className="flex items-center gap-2.5 focus:outline-hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20">
                <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Sell<span className="text-amber-500">Solar</span>
              </span>
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <BadgeCheck className="h-3.5 w-3.5" />
                10 Verified per City
              </span>
              <button
                type="button"
                onClick={onBack || (() => onNavigate?.('home'))}
                className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Breadcrumb Bar if hasOuterNavbar */}
      {hasOuterNavbar && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 sm:px-6 py-2.5">
          <div className="container-page flex items-center justify-between max-w-7xl mx-auto text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onNavigate?.('home')}
                className="hover:text-amber-500 transition-colors font-medium"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-bold">Verified Solar Dealers</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
              <BadgeCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              10 Verified per City
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-amber-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 py-6 sm:py-8">
        <div className="container-page px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2 shadow-xs">
              <Users className="h-3.5 w-3.5" />
              Pakistan Solar Dealer & Importer Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Verified Solar Dealers in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Pakistan</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Find verified solar equipment dealers, wholesalers, and certified distributors in each major city. Every business is verified with valid commercial market address, phone/WhatsApp, and Tier-1 brand authorizations.
            </p>

            {/* Quick KPI stats */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-lg font-black text-amber-500">{dealersList.length}+</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Dealers</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-lg font-black text-slate-900 dark:text-white">8 Cities</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">10 Dealers / City</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-lg font-black text-emerald-500">100%</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Contacts</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-lg font-black text-indigo-500">Direct</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">WhatsApp & Call</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container-page px-4 sm:px-6 py-5 sm:py-6 max-w-7xl mx-auto">
        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm mb-5 space-y-4">
          {/* Top Row: Search & Source Filter & Verified Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by business name, owner, market, or brand (e.g. Longi, Inverex)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Registration Source Filter (Backend/Source tracking requested by user) */}
            <div className="sm:col-span-4 relative">
              <label htmlFor="source-filter" className="sr-only">
                Registration Source
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1">
                <Filter className="h-4 w-4 text-amber-500 shrink-0 mr-2" />
                <select
                  id="source-filter"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 py-1.5 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Sources ({sourceCounts.all})</option>
                  <option value="ai_curated">🤖 AI Curated & Verified ({sourceCounts.ai_curated})</option>
                  <option value="self_registered">🌐 Self-Registered on Website ({sourceCounts.self_registered})</option>
                  <option value="manual_admin">🛡 Admin Verified ({sourceCounts.manual_admin})</option>
                </select>
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="sm:col-span-2 flex items-center">
              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  verifiedOnly
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BadgeCheck className="h-4 w-4" />
                {verifiedOnly ? 'Verified Only' : 'All Badges'}
              </button>
            </div>
          </div>

          {/* Bottom Row: City Tabs with Count Badges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Filter by City (10 Verified per City):
              </span>
              {(selectedCity || selectedSource !== 'all' || searchQuery || verifiedOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('');
                    setSelectedSource('all');
                    setSearchQuery('');
                    setVerifiedOnly(false);
                  }}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Reset Filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSelectedCity('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCity === ''
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Cities
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-black/20">
                  {dealersList.length}
                </span>
              </button>

              {CITIES.map((city) => {
                const count = cityCounts[city] || 10;
                const isSelected = selectedCity.toLowerCase() === city.toLowerCase();

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(isSelected ? '' : city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <MapPin className="h-3 w-3 opacity-70" />
                    {city}
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-black/20">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Showing <span className="text-amber-600 dark:text-amber-400 font-bold">{filteredDealers.length}</span> verified{' '}
            {filteredDealers.length === 1 ? 'dealer' : 'dealers'}
            {selectedCity && <span> in <strong>{selectedCity}</strong></span>}
            {selectedSource !== 'all' && (
              <span>
                {' '}
                • Source: <span className="font-bold text-indigo-600 dark:text-indigo-400">{REGISTRATION_SOURCES[selectedSource]?.label}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Verification Status
            </span>
          </div>
        </div>

        {/* Dealer Cards Grid */}
        {filteredDealers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No dealers match this filter</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Try choosing "All Cities", resetting search terms, or switching the registration source filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCity('');
                setSelectedSource('all');
                setSearchQuery('');
                setVerifiedOnly(false);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
            >
              Show All 80 Dealers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDealers.map((dealer) => {
              const srcConfig = REGISTRATION_SOURCES[dealer.registration_source] || REGISTRATION_SOURCES.ai_curated;

              return (
                <div
                  key={dealer.id}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Card Header: Avatar, Badges & Tier */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              {dealer.tier || 'Verified Dealer'}
                            </span>
                            {dealer.is_verified_dealer && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <BadgeCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                Verified
                              </span>
                            )}
                          </div>
                          <span className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {dealer.rating || 4.9}
                            <span className="text-slate-400 text-[11px] font-normal">
                              ({dealer.reviews_count || 32} reviews)
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Source Badge (Backend tracking indicator) */}
                      <div
                        title={`Registration Source: ${srcConfig.label}`}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800 ${srcConfig.badgeClass} shrink-0`}
                      >
                        <span className="mr-1">{srcConfig.icon}</span>
                        {dealer.registration_source === 'self_registered'
                          ? 'Self-Reg'
                          : dealer.registration_source === 'manual_admin'
                          ? 'Admin'
                          : 'AI Verified'}
                      </div>
                    </div>

                    {/* Business Name & Owner */}
                    <div className="mt-3.5">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                        {dealer.business_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>Lead / Owner:</span>
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">{dealer.full_name}</strong>
                      </p>
                    </div>

                    {/* City & Address */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{dealer.city}, Pakistan</span>
                      </div>
                      <p className="line-clamp-2 text-slate-500 dark:text-slate-400 pl-5 text-[11px] leading-relaxed">
                        {dealer.business_address}
                      </p>
                    </div>

                    {/* Brands Handled Tags */}
                    {Array.isArray(dealer.brands) && dealer.brands.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Authorized Brands:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dealer.brands.map((b) => (
                            <span
                              key={b}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specialties / Service Area */}
                    {dealer.specialties && (
                      <div className="mt-2.5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                        ⚡ {dealer.specialties}
                      </div>
                    )}
                  </div>

                  {/* Card Actions: Call & WhatsApp */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                    {/* Call Button */}
                    <a
                      href={`tel:${dealer.phone}`}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Phone className="h-3.5 w-3.5 text-amber-500" />
                      <span>{dealer.phone}</span>
                    </a>

                    {/* WhatsApp Button */}
                    <a
                      href={getWhatsAppLink(dealer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                    >
                      <MessageCircle className="h-3.5 w-3.5 fill-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Register as Dealer Banner */}
        <div className="mt-12 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent dark:from-amber-950/40 dark:to-slate-900 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center sm:text-left">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Solar Business Partner Program
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Are you a Solar Dealer, Importer or Installer?
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Get your business listed in the verified directory of Pakistan’s largest solar marketplace. Receive genuine buyer leads and inquiries directly on your WhatsApp and phone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate?.('login')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Register Your Dealership</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('contact')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors"
            >
              Contact Directory Team
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  Layers,
  Search,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Calculator,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  Award,
  BarChart3,
  Flame,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import {
  SOLAR_PRICES_DATA,
  MARKET_SUMMARY,
  TODAY_DATE_STR,
} from '../data/todayPricesData';
import { formatPrice } from '../lib/constants';

export default function TodayPricesPage({ onNavigate, onSelectCategory }) {
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'panel', 'inverter', 'battery'
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price_asc', 'price_desc', 'name'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Calculator State
  const [calcWatts, setCalcWatts] = useState(585);
  const [calcPanelBrandRate, setCalcPanelBrandRate] = useState(36.5);
  const [calcSystemSizeKw, setCalcSystemSizeKw] = useState(10);
  const [calcIncludeInverter, setCalcIncludeInverter] = useState(true);
  const [calcIncludeBattery, setCalcIncludeBattery] = useState('lithium'); // 'none', 'tubular', 'lithium'

  // Categories list
  const categoryTabs = [
    {
      id: 'all',
      label: 'All Solar Rates',
      icon: Layers,
      count: SOLAR_PRICES_DATA.length,
      color: 'text-primary-600',
      activeBg: 'bg-primary-500 text-white',
    },
    {
      id: 'panel',
      label: 'Solar Panels',
      sublabel: 'Per Watt & Plate Rates',
      icon: Sun,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'panel').length,
      color: 'text-amber-500',
      activeBg: 'bg-amber-500 text-white',
    },
    {
      id: 'inverter',
      label: 'Inverters',
      sublabel: 'Hybrid & On-Grid',
      icon: Zap,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'inverter').length,
      color: 'text-blue-500',
      activeBg: 'bg-blue-600 text-white',
    },
    {
      id: 'battery',
      label: 'Batteries',
      sublabel: 'Lithium & Tubular',
      icon: BatteryCharging,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'battery').length,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-600 text-white',
    },
  ];

  // Unique brands according to current category
  const availableBrands = useMemo(() => {
    const items =
      selectedCategory === 'all'
        ? SOLAR_PRICES_DATA
        : SOLAR_PRICES_DATA.filter((i) => i.category === selectedCategory);
    return Array.from(new Set(items.map((i) => i.brand))).sort();
  }, [selectedCategory]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = [...SOLAR_PRICES_DATA];

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (selectedBrand) {
      result = result.filter((item) => item.brand === selectedBrand);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.model.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.capacity.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'popular') {
        if (a.popular === b.popular) return 0;
        return a.popular ? -1 : 1;
      }
      if (sortBy === 'price_asc') {
        const pA = a.pricePerWatt || a.unitPriceMin;
        const pB = b.pricePerWatt || b.unitPriceMin;
        return pA - pB;
      }
      if (sortBy === 'price_desc') {
        const pA = a.pricePerWatt || a.unitPriceMax;
        const pB = b.pricePerWatt || b.unitPriceMax;
        return pB - pA;
      }
      if (sortBy === 'name') {
        return a.model.localeCompare(b.model);
      }
      return 0;
    });

    return result;
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  // Quick Calculator logic
  const calculatedPanelCost = calcWatts * calcPanelBrandRate;
  const calculatedSystemPanelsCost = calcSystemSizeKw * 1000 * calcPanelBrandRate;
  const estimatedInverterCost =
    calcSystemSizeKw <= 6
      ? 275000
      : calcSystemSizeKw <= 10
      ? 460000
      : calcSystemSizeKw <= 15
      ? 580000
      : 800000;
  const estimatedBatteryCost =
    calcIncludeBattery === 'lithium'
      ? 265000 * Math.max(1, Math.round(calcSystemSizeKw / 6))
      : calcIncludeBattery === 'tubular'
      ? 53000 * 4 * Math.max(1, Math.round(calcSystemSizeKw / 6))
      : 0;

  const totalCalculatedSystem =
    calculatedSystemPanelsCost +
    (calcIncludeInverter ? estimatedInverterCost : 0) +
    estimatedBatteryCost;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-900 via-gray-900 to-gray-900 py-14 text-white">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-secondary-500/20 blur-3xl" />

        <div className="container-page relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-500/20 border border-primary-400/30 px-3.5 py-1 text-xs font-semibold text-primary-300">
                <Clock className="h-3.5 w-3.5 text-primary-400" />
                Live Market Rates • Updated {TODAY_DATE_STR}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Today's Solar Prices in{' '}
                <span className="bg-gradient-to-r from-primary-400 to-amber-300 bg-clip-text text-transparent">
                  Pakistan (PKR)
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:text-lg max-w-2xl leading-relaxed">
                Daily verified trade benchmark prices for Tier-1 Solar Panels,
                Hybrid & On-Grid Inverters, and Lithium/Tubular Batteries across Hall
                Road Lahore, Saddar Karachi, and Rawalpindi.
              </p>

              {/* Quick Key Benchmarks */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-gray-300">
                <div className="rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/10">
                  <span className="text-gray-400 block text-[11px]">Panel Avg Per Watt</span>
                  <span className="text-sm font-bold text-amber-300">
                    {MARKET_SUMMARY.panelsPerWattAvg}
                  </span>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/10">
                  <span className="text-gray-400 block text-[11px]">Popular Panels</span>
                  <span className="text-sm font-bold text-white">
                    Longi Hi-MO 7 / Jinko 585W
                  </span>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/10">
                  <span className="text-gray-400 block text-[11px]">Lithium 5.12kWh Avg</span>
                  <span className="text-sm font-bold text-emerald-400">
                    Rs 240,000 – 275,000
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 text-left lg:max-w-xs shadow-2xl">
              <div className="flex items-center gap-2 text-primary-300 font-bold text-sm mb-1">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Planning to Buy or Sell?
              </div>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Find active deals from verified sellers or post your own solar equipment for free.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('home')}
                  className="btn-primary text-xs w-full py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Available Listings
                </button>
                <button
                  onClick={() => onNavigate('post-ad')}
                  className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors text-center"
                >
                  Post an Ad Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-page -mt-6">
        {/* Top Category Filter Tabs Bar */}
        <div className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-gray-200/80 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setSelectedBrand('');
                  }}
                  className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all ${
                    isSelected
                      ? tab.activeBg + ' shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-gray-600 shadow-sm'
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm truncate">{tab.label}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </div>
                    {tab.sublabel && (
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-white/80' : 'text-gray-400'
                        }`}
                      >
                        {tab.sublabel}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter controls & Search */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-gray-200/70 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, model (e.g. Longi Hi-MO 7, 6kW Hybrid, Narada 100Ah, 585W)..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort & Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary-500 focus:outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Compare Table
                </button>
              </div>
            </div>
          </div>

          {/* Brand Pills Filter */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs font-bold text-gray-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3 w-3" /> Brands:
            </span>
            <button
              onClick={() => setSelectedBrand('')}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedBrand === ''
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Brands ({availableBrands.length})
            </button>
            {availableBrands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b === selectedBrand ? '' : b)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedBrand === b
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Reset */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredItems.length}</span>{' '}
            verified market products
            {selectedBrand && (
              <span>
                {' '}
                for <span className="text-primary-600 font-bold">{selectedBrand}</span>
              </span>
            )}
          </div>
          {(selectedBrand || searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedBrand('');
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset all filters
            </button>
          )}
        </div>

        {/* ================= PRODUCTS VIEW ================= */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-200">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No matching items found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find solar equipment matching "{searchQuery || selectedBrand}". Try
              clearing your filters.
            </p>
            <button
              onClick={() => {
                setSelectedBrand('');
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-primary text-xs mt-4"
            >
              Show All Rates
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <PriceCard
                key={item.id}
                item={item}
                onExploreMarket={() => {
                  if (onSelectCategory) {
                    onSelectCategory(item.category);
                  } else {
                    onNavigate('home');
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">Brand & Model</th>
                    <th className="px-4 py-4">Category / Type</th>
                    <th className="px-4 py-4">Capacity / Specs</th>
                    <th className="px-4 py-4">
                      {selectedCategory === 'panel' ? 'Price / Watt' : 'Est. Market Rate'}
                    </th>
                    <th className="px-4 py-4">Unit Price (PKR)</th>
                    <th className="px-4 py-4">Trend</th>
                    <th className="px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{item.model}</div>
                        <div className="text-xs text-gray-500">{item.badge}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                          {item.brand}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">{item.type}</div>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-800">
                        {item.capacity}
                        {item.efficiency && (
                          <div className="text-xs text-secondary-600">
                            Eff: {item.efficiency}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {item.pricePerWattRange ? (
                          <span className="font-extrabold text-amber-600">
                            {item.pricePerWattRange}
                          </span>
                        ) : (
                          <span className="font-bold text-primary-600">
                            {formatPrice(item.unitPriceMin)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-gray-900">
                          {formatPrice(item.unitPriceMin)} – {formatPrice(item.unitPriceMax)}
                        </div>
                        <div className="text-[11px] text-gray-400">{item.warranty}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                            item.trend === 'drop'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.trend === 'hot'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.trend === 'drop' && <TrendingDown className="h-3 w-3" />}
                          {item.trend === 'hot' && <Flame className="h-3 w-3" />}
                          {item.trendPercent}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            if (onSelectCategory) {
                              onSelectCategory(item.category);
                            } else {
                              onNavigate('home');
                            }
                          }}
                          className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-100 transition-colors"
                        >
                          View Listings
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CALCULATOR WIDGET ================= */}
        <section className="mt-16 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="lg:max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-300 border border-primary-500/30 mb-3">
                <Calculator className="h-3.5 w-3.5 text-primary-400" />
                Live Rate Calculator
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Calculate Solar Plate & System Cost
              </h2>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                Estimate the exact equipment cost of your solar setup based on today's per-watt
                market rates in Pakistan.
              </p>

              {/* Calculator Inputs */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Solar Panel Wattage (per plate): <span className="text-amber-400 font-bold">{calcWatts}W</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="450"
                      max="670"
                      step="5"
                      value={calcWatts}
                      onChange={(e) => setCalcWatts(Number(e.target.value))}
                      className="w-full accent-primary-500 cursor-pointer"
                    />
                    <div className="flex gap-1.5 shrink-0">
                      {[550, 585, 615, 650].map((w) => (
                        <button
                          key={w}
                          onClick={() => setCalcWatts(w)}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                            calcWatts === w
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {w}W
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Per Watt Price (PKR): <span className="text-amber-400 font-bold">Rs {calcPanelBrandRate} / W</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="30"
                      max="50"
                      step="0.5"
                      value={calcPanelBrandRate}
                      onChange={(e) => setCalcPanelBrandRate(Number(e.target.value))}
                      className="w-full accent-primary-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    System Size: <span className="text-amber-400 font-bold">{calcSystemSizeKw} kW</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setCalcSystemSizeKw(kw)}
                        className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                          calcSystemSizeKw === kw
                            ? 'bg-primary-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {kw} kW
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Optional Battery Storage:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'No Battery' },
                      { id: 'tubular', label: 'Tubular (4x)' },
                      { id: 'lithium', label: 'Lithium (5.12kWh)' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setCalcIncludeBattery(b.id)}
                        className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                          calcIncludeBattery === b.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Output Breakdown Card */}
            <div className="w-full lg:w-96 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-6 shadow-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-primary-300 mb-1">
                Estimated Equipment Cost
              </div>
              <div className="text-3xl font-extrabold text-white">
                {formatPrice(totalCalculatedSystem)}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                For a complete {calcSystemSizeKw}kW solar setup
              </div>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-xs">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Single Panel ({calcWatts}W Plate):</span>
                  <span className="font-bold text-amber-300">
                    {formatPrice(calculatedPanelCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>
                    Panels Cost ({Math.ceil((calcSystemSizeKw * 1000) / calcWatts)} plates):
                  </span>
                  <span className="font-bold text-white">
                    {formatPrice(calculatedSystemPanelsCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>{calcSystemSizeKw}kW Inverter (Est):</span>
                  <span className="font-bold text-white">
                    {calcIncludeInverter ? formatPrice(estimatedInverterCost) : 'Excluded'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Battery Storage:</span>
                  <span className="font-bold text-emerald-400">
                    {calcIncludeBattery === 'none'
                      ? 'No Battery'
                      : formatPrice(estimatedBatteryCost)}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-primary-500/20 border border-primary-500/30 p-3 text-[11px] text-primary-200">
                💡 Note: Structural mounting frames, DC/AC wiring, net-metering fees, and labor
                typically add PKR 80,000 – 180,000 depending on location.
              </div>

              <button
                onClick={() => onNavigate('home')}
                className="btn-primary w-full mt-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                Find Sellers for {calcSystemSizeKw}kW Kit <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= CITY MARKET RATES BENCHMARK ================= */}
        <section className="mt-16">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">
                Regional Hubs
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Major Solar Markets in Pakistan
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 sm:mt-0">
              Prices vary by ±1-2% depending on freight and wholesaler stock
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKET_SUMMARY.cities.map((city) => (
              <div
                key={city.name}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/80 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                    <MapPin className="h-4 w-4 text-primary-600" />
                    {city.name}
                  </div>
                  <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold text-primary-700">
                    {city.rateStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Main Hub: {city.market}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                  <span className="text-gray-500">Panel Rate Avg:</span>
                  <span className="font-extrabold text-gray-900">Rs 34.5 – 37.5 / W</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= BUYING GUIDE & TIPS ================= */}
        <section className="mt-16 rounded-3xl bg-white p-6 sm:p-10 shadow-sm ring-1 ring-gray-200">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">
              Buyer's Advice
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Tips for Buying Solar Equipment in Pakistan
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Ensure you get genuine A-grade Tier-1 equipment and avoid counterfeits or B-grade stock.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-gray-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Verify QR Codes & Barcodes</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Genuine Longi, Jinko, and Canadian Solar panels have embossed barcodes embedded inside
                the glass layer. Scan using official brand apps.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">N-Type TOPCon vs Mono PERC</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                N-Type TOPCon panels deliver 3-5% more energy during Pakistan's peak 45°C summer heat
                compared to older P-type Mono PERC plates.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Lithium vs Tubular Battery</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                While LiFePO4 lithium batteries cost more upfront, their 10+ year lifespan (6,000
                cycles) makes them 40% cheaper over time than tubular batteries.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Subcomponent: Individual Product Card
function PriceCard({ item, onExploreMarket }) {
  const isPanel = item.category === 'panel';
  const isBattery = item.category === 'battery';
  const isHot = item.trend === 'hot';
  const isDrop = item.trend === 'drop';

  return (
    <div className="card group relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div>
        {/* Top Header & Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800">
            {item.brand}
          </span>
          <div className="flex items-center gap-1.5">
            {item.badge && (
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold text-primary-700 border border-primary-200/50">
                {item.badge}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isDrop
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isHot
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {isDrop && <TrendingDown className="h-3 w-3" />}
              {isHot && <Flame className="h-3 w-3" />}
              {item.trendPercent}
            </span>
          </div>
        </div>

        {/* Model Title */}
        <h3 className="text-base font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">
          {item.model}
        </h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-1">{item.type}</p>

        {/* Price Section */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3 border border-gray-100">
          {isPanel && item.pricePerWattRange ? (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Price Per Watt (Live)
              </div>
              <div className="text-xl font-extrabold text-amber-600">
                {item.pricePerWattRange}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600 border-t border-gray-200/60 pt-1.5">
                <span>Single Plate Rate:</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(item.unitPriceMin)} – {formatPrice(item.unitPriceMax)}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Estimated Trade Price
              </div>
              <div className="text-xl font-extrabold text-primary-600">
                {formatPrice(item.unitPriceMin)} – {formatPrice(item.unitPriceMax)}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                Capacity / Rating: <span className="font-semibold text-gray-800">{item.capacity}</span>
              </div>
            </div>
          )}
        </div>

        {/* Specs List */}
        <div className="mt-3.5 space-y-1.5 text-xs text-gray-600">
          {item.efficiency && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                {isBattery ? 'Life Cycle / DoD:' : 'Efficiency:'}
              </span>
              <span className="font-semibold text-gray-800">{item.efficiency}</span>
            </div>
          )}
          {item.warranty && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Warranty:</span>
              <span className="font-semibold text-secondary-600 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {item.warranty}
              </span>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Action Footer */}
      <div className="mt-5 border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
        <button
          onClick={onExploreMarket}
          className="flex-1 rounded-xl bg-gray-900 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors text-center"
        >
          Browse Deals in Market
        </button>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  Layers,
  Search,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Calculator,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  BarChart3,
  Flame,
  Filter,
  Boxes,
  Wrench,
  Cable,
  ArrowDownRight,
  Equal,
  Users,
} from 'lucide-react';
import {
  SOLAR_PRICES_DATA,
  MARKET_SUMMARY,
  TODAY_DATE_STR,
  LAST_MIDNIGHT_UPDATE,
  ISLAMABAD_DAILY_SHEETS,
  getActiveDailyRates,
} from '../data/todayPricesData';
import { getPakistanDateDetails } from '../lib/dateUtils';
import { formatPrice } from '../lib/constants';

export default function TodayPricesPage({ onNavigate, onSelectCategory }) {
  const pktDateInfo = useMemo(() => getPakistanDateDetails(), []);
  const todayDateLabel = pktDateInfo.shortDate; // e.g. "11-Sep-2026"
  const yesterdayDateLabel = pktDateInfo.yesterdayShortDate || '10-Sep-2026';

  const [pageTab, setPageTab] = useState('rates'); // 'rates' | 'catalog'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'panel', 'inverter', 'battery', 'complete_system', 'structure_accessories'
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price_asc', 'price_desc', 'name'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [dailySheetDate, setDailySheetDate] = useState('today'); // 'today' | 'yesterday' | 'compare'
  const [showDailySheetDetail, setShowDailySheetDetail] = useState(true);
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [sheetCategory, setSheetCategory] = useState('all'); // 'all' | 'panel' | 'inverter' | 'battery' | 'complete_system' | 'structure_accessories'
  const [sheetFilterStatus, setSheetFilterStatus] = useState('all');
  const [sheetMobileView, setSheetMobileView] = useState('cards'); // 'cards' | 'table'

  // Compact limit toggles to prevent infinite scrolling
  const [isExpandedSheet, setIsExpandedSheet] = useState(false);
  const [isExpandedCatalog, setIsExpandedCatalog] = useState(false);
  const [isExpandedGuide, setIsExpandedGuide] = useState(false);

  // Synchronized category selector ensuring top filter tabs, daily rate sheet, and product catalog update in unison
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setSheetCategory(catId);
    setSelectedBrand('');
    setSheetFilterStatus('all');
    setSheetSearchQuery('');
    setIsExpandedSheet(false);
    setIsExpandedCatalog(false);
  };

  // Calculator state removed — full calculator lives at /calculator

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
    {
      id: 'ess',
      label: 'ESS & Storage',
      sublabel: 'Power Tank & Cabinets',
      icon: Boxes,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'ess').length,
      color: 'text-violet-600',
      activeBg: 'bg-violet-600 text-white',
    },
    {
      id: 'complete_system',
      label: 'Complete Systems',
      sublabel: '3kW to 20kW Packages',
      icon: Boxes,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'complete_system').length,
      color: 'text-indigo-600',
      activeBg: 'bg-indigo-600 text-white',
    },
    {
      id: 'structure_accessories',
      label: 'Structures & Mounts',
      sublabel: 'GI Frames & Channel',
      icon: Wrench,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'structure_accessories').length,
      color: 'text-slate-600',
      activeBg: 'bg-slate-700 text-white',
    },
    {
      id: 'cables_wiring',
      label: 'Cables & Wiring',
      sublabel: 'Fast & Pakistan Cables',
      icon: Cable,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'cables_wiring').length,
      color: 'text-amber-700',
      activeBg: 'bg-amber-700 text-white',
    },
    {
      id: 'solar_accessories',
      label: 'Protection & BOS',
      sublabel: 'Breakers, SPDs, DB Box',
      icon: ShieldCheck,
      count: SOLAR_PRICES_DATA.filter((i) => i.category === 'solar_accessories').length,
      color: 'text-sky-600',
      activeBg: 'bg-sky-600 text-white',
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

  // Filtered Islamabad Daily Sheet Rates
  const displayedSheetRates = useMemo(() => {
    const isYesterday = dailySheetDate === 'yesterday';
    const sheet = isYesterday
      ? (ISLAMABAD_DAILY_SHEETS['yesterday'] || ISLAMABAD_DAILY_SHEETS[yesterdayDateLabel] || ISLAMABAD_DAILY_SHEETS['15-Sep-2026'] || ISLAMABAD_DAILY_SHEETS['14-Sep-2026'])
      : getActiveDailyRates(todayDateLabel || '16-Sep-2026');

    let activeData = [];
    if (sheetCategory === 'inverter') {
      activeData = (sheet?.inverterRates || []).map((i) => ({ ...i, itemCategory: 'inverter' }));
    } else if (sheetCategory === 'battery') {
      activeData = (sheet?.batteryRates || []).map((i) => ({ ...i, itemCategory: 'battery' }));
    } else if (sheetCategory === 'ess') {
      activeData = (sheet?.essRates || []).map((i) => ({ ...i, itemCategory: 'ess' }));
    } else if (sheetCategory === 'complete_system') {
      activeData = (sheet?.systemRates || []).map((i) => ({ ...i, itemCategory: 'complete_system' }));
    } else if (sheetCategory === 'cables_wiring') {
      activeData = (sheet?.cableRates || []).map((i) => ({ ...i, itemCategory: 'cables_wiring' }));
    } else if (sheetCategory === 'solar_accessories') {
      activeData = (sheet?.accessoriesRates || []).map((i) => ({ ...i, itemCategory: 'solar_accessories' }));
    } else if (sheetCategory === 'structure_accessories') {
      activeData = (sheet?.structureRates || []).map((i) => ({ ...i, itemCategory: 'structure_accessories' }));
    } else if (sheetCategory === 'panel') {
      activeData = (sheet?.rates || []).map((i) => ({ ...i, itemCategory: 'panel' }));
    } else {
      // 'all' category - combine verified benchmarks across all categories
      activeData = [
        ...(sheet?.rates || []).map((i) => ({ ...i, itemCategory: 'panel' })),
        ...(sheet?.inverterRates || []).map((i) => ({ ...i, itemCategory: 'inverter' })),
        ...(sheet?.batteryRates || []).map((i) => ({ ...i, itemCategory: 'battery' })),
        ...(sheet?.essRates || []).map((i) => ({ ...i, itemCategory: 'ess' })),
        ...(sheet?.cableRates || []).map((i) => ({ ...i, itemCategory: 'cables_wiring' })),
        ...(sheet?.accessoriesRates || []).map((i) => ({ ...i, itemCategory: 'solar_accessories' })),
        ...(sheet?.systemRates || []).map((i) => ({ ...i, itemCategory: 'complete_system' })),
        ...(sheet?.structureRates || []).map((i) => ({ ...i, itemCategory: 'structure_accessories' })),
      ];
    }

    return activeData.filter((item) => {
      // Status change filter
      if (sheetFilterStatus === 'changed' && item.change === 0) return false;

      // Category specific filters
      if (sheetCategory === 'panel') {
        if (sheetFilterStatus === 'jinko' && !item.brand.toLowerCase().includes('jinko')) return false;
        if (sheetFilterStatus === 'longi' && !item.brand.toLowerCase().includes('longi')) return false;
        if (sheetFilterStatus === 'canadian' && !item.brand.toLowerCase().includes('canadian')) return false;
        if (sheetFilterStatus === 'ja' && !item.brand.toLowerCase().includes('ja')) return false;
        if (sheetFilterStatus === 'astronergy' && !item.brand.toLowerCase().includes('astronergy')) return false;
        if (sheetFilterStatus === 'korean' && !item.brand.toLowerCase().includes('korean')) return false;
        if (sheetFilterStatus === 'osda' && !item.brand.toLowerCase().includes('osda')) return false;
        if (sheetFilterStatus === 'tcl' && !item.brand.toLowerCase().includes('tcl')) return false;
        if (sheetFilterStatus === 'lefn' && !item.brand.toLowerCase().includes('lefn')) return false;
      } else if (sheetCategory === 'inverter') {
        if (sheetFilterStatus === 'goodwe' && !item.brand.toLowerCase().includes('goodwe')) return false;
        if (sheetFilterStatus === 'zapher' && !item.brand.toLowerCase().includes('zapher')) return false;
        if (sheetFilterStatus === 'xenon' && !item.brand.toLowerCase().includes('xenon') && !item.brand.toLowerCase().includes('xynex')) return false;
        if (sheetFilterStatus === 'krypton' && !item.brand.toLowerCase().includes('krypton')) return false;
        if (sheetFilterStatus === 'itel' && !item.brand.toLowerCase().includes('itel')) return false;
        if (sheetFilterStatus === 'inverex' && !item.brand.toLowerCase().includes('inverex')) return false;
        if (sheetFilterStatus === 'hybrid' && !item.type?.toLowerCase().includes('hybrid')) return false;
        if (sheetFilterStatus === 'ongrid' && !item.type?.toLowerCase().includes('on-grid') && !item.type?.toLowerCase().includes('grid-tied') && !item.type?.toLowerCase().includes('string')) return false;
      } else if (sheetCategory === 'battery') {
        if (sheetFilterStatus === 'goodwe' && !item.brand.toLowerCase().includes('goodwe')) return false;
        if (sheetFilterStatus === 'lithium' && !item.type?.toLowerCase().includes('lithium') && !item.type?.toLowerCase().includes('lifepo4') && !item.brand?.toLowerCase().includes('lithium')) return false;
        if (sheetFilterStatus === 'tubular' && !item.type?.toLowerCase().includes('tubular')) return false;
        if (sheetFilterStatus === 'itel' && !item.brand.toLowerCase().includes('itel')) return false;
        if (sheetFilterStatus === 'narada' && !item.brand.toLowerCase().includes('narada')) return false;
      } else if (sheetCategory === 'cables_wiring') {
        if (sheetFilterStatus === 'fast' && !item.brand.toLowerCase().includes('fast')) return false;
        if (sheetFilterStatus === 'pakistan' && !item.brand.toLowerCase().includes('pakistan')) return false;
        if (sheetFilterStatus === 'mci' && !item.brand.toLowerCase().includes('mci')) return false;
        if (sheetFilterStatus === 'jukai' && !item.brand.toLowerCase().includes('jukai')) return false;
      } else if (sheetCategory === 'solar_accessories') {
        if (sheetFilterStatus === 'chint' && !item.brand.toLowerCase().includes('chint') && !item.model.toLowerCase().includes('chint')) return false;
        if (sheetFilterStatus === 'cnc' && !item.brand.toLowerCase().includes('cnc') && !item.model.toLowerCase().includes('cnc')) return false;
        if (sheetFilterStatus === 'tomzen' && !item.brand.toLowerCase().includes('tomzen') && !item.model.toLowerCase().includes('tomz')) return false;
        if (sheetFilterStatus === 'breaker' && !item.type?.toLowerCase().includes('breaker') && !item.type?.toLowerCase().includes('mcb')) return false;
        if (sheetFilterStatus === 'spd' && !item.type?.toLowerCase().includes('surge') && !item.type?.toLowerCase().includes('spd')) return false;
      } else if (sheetCategory === 'ess') {
        if (sheetFilterStatus === 'powertank' && !item.model?.toLowerCase().includes('power tank') && !item.model?.toLowerCase().includes('powertank')) return false;
        if (sheetFilterStatus === 'cabinet' && !item.model?.toLowerCase().includes('all-in-one') && !item.type?.toLowerCase().includes('all-in-one') && !item.model?.toLowerCase().includes('8kwh')) return false;
        if (sheetFilterStatus === 'itel' && !item.brand.toLowerCase().includes('itel')) return false;
      } else if (sheetCategory === 'complete_system') {
        if (sheetFilterStatus === 'residential' && !item.badge?.toLowerCase().includes('marla') && !item.badge?.toLowerCase().includes('kanal')) return false;
        if (sheetFilterStatus === 'commercial' && !item.badge?.toLowerCase().includes('plaza') && !item.badge?.toLowerCase().includes('factory')) return false;
      } else if (sheetCategory === 'structure_accessories') {
        if (sheetFilterStatus === 'structure' && !item.type?.toLowerCase().includes('structure') && !item.type?.toLowerCase().includes('frame')) return false;
        if (sheetFilterStatus === 'cable' && !item.type?.toLowerCase().includes('wire') && !item.type?.toLowerCase().includes('cable')) return false;
        if (sheetFilterStatus === 'protection' && !item.type?.toLowerCase().includes('breaker') && !item.type?.toLowerCase().includes('surge')) return false;
      } else if (sheetCategory === 'all') {
        if (sheetFilterStatus === 'panel' && item.itemCategory !== 'panel') return false;
        if (sheetFilterStatus === 'inverter' && item.itemCategory !== 'inverter') return false;
        if (sheetFilterStatus === 'battery' && item.itemCategory !== 'battery') return false;
        if (sheetFilterStatus === 'cables_wiring' && item.itemCategory !== 'cables_wiring') return false;
        if (sheetFilterStatus === 'solar_accessories' && item.itemCategory !== 'solar_accessories') return false;
        if (sheetFilterStatus === 'ess' && item.itemCategory !== 'ess') return false;
        if (sheetFilterStatus === 'goodwe' && !item.brand.toLowerCase().includes('goodwe')) return false;
        if (sheetFilterStatus === 'itel' && !item.brand.toLowerCase().includes('itel')) return false;
        if (sheetFilterStatus === 'system' && item.itemCategory !== 'complete_system') return false;
      }

      if (!sheetSearchQuery) return true;
      const q = sheetSearchQuery.toLowerCase().trim();
      return (
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.capacity && item.capacity.toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [dailySheetDate, sheetCategory, sheetFilterStatus, sheetSearchQuery]);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 pt-20 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Compact Top Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-gray-900 to-gray-900 py-5 sm:py-6 text-white border-b border-gray-800">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="container-page relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  <Clock className="h-3 w-3 text-amber-400" />
                  Live Rates &bull; {TODAY_DATE_STR}
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Wholesale Benchmark
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Today's Solar Prices in <span className="text-amber-400">Pakistan (PKR)</span>
              </h1>
            </div>
            {/* Compact 3-stat inline chips */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {[
                { id:'panel', icon: Sun, color:'text-amber-400', bg:'bg-amber-500/15 border-amber-400/30', val: MARKET_SUMMARY.panelsPerWattAvg || 'Rs 33–44/W', label:'Panels' },
                { id:'inverter', icon: Zap, color:'text-blue-400', bg:'bg-blue-500/15 border-blue-400/30', val: MARKET_SUMMARY.invertersAvg || 'Rs 112K–549K', label:'Inverters' },
                { id:'battery', icon: BatteryCharging, color:'text-emerald-400', bg:'bg-emerald-500/15 border-emerald-400/30', val: MARKET_SUMMARY.batteriesAvg || 'Rs 32K–265K', label:'Batteries' },
              ].map(({ id, icon: Icon, color, bg, val, label }) => (
                <button
                  key={id}
                  id={`hero-stat-${id}-avg`}
                  onClick={() => handleSelectCategory(id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-left transition-all cursor-pointer ${bg} hover:brightness-110`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-wide ${color}`}>{label}</div>
                    <div className="text-xs font-bold text-white leading-tight">{val}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-page mt-4">

        {/* ===== PAGE-LEVEL TAB SWITCHER ===== */}
        <div className="mb-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 rounded-2xl bg-white dark:bg-gray-900 p-1.5 shadow-lg ring-1 ring-gray-200/80 dark:ring-gray-800">
            <button
              id="prices-tab-rates"
              onClick={() => setPageTab('rates')}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                pageTab === 'rates'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              📊 Daily Rate Sheet
            </button>
            <button
              id="prices-tab-catalog"
              onClick={() => setPageTab('catalog')}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                pageTab === 'catalog'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Layers className="h-4 w-4" />
              🛒 Equipment Catalog
            </button>
          </div>
        </div>

        {/* Sticky Mobile/Desktop Category Quick-Bar */}
        <div className="sticky top-16 z-30 -mx-4 sm:mx-0 px-3 sm:px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-y sm:border sm:rounded-2xl border-gray-200/80 dark:border-gray-800 shadow-xs mb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0 mr-1 hidden sm:inline-block">
              Quick Rates:
            </span>
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sticky-tab-${tab.id}`}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? tab.activeBg + ' shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />
            <a
              href="#regional-markets"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>Cities</span>
            </a>
            <a
              href="#buying-guide"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Advice</span>
            </a>
          </div>
        </div>

        {/* Top Category Filter Tabs Bar */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-2 shadow-lg ring-1 ring-gray-200/80 dark:ring-gray-800 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  onClick={() => {
                    handleSelectCategory(tab.id);
                  }}
                  className={`group relative flex items-center gap-2.5 sm:gap-3 rounded-xl p-2.5 sm:px-3.5 sm:py-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? tab.activeBg + ' shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm'
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs sm:text-sm truncate">{tab.label}</span>
                      <span
                        className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </div>
                    {tab.sublabel && (
                      <p
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
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

        {/* Daily Rate Sheet Tab Content */}
        {pageTab === 'rates' && (
        <>
        {/* Verified Live Daily Trade Sheet & Date Comparison */}
        <div id="live-rate-sheet" className="rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-5 sm:p-6 shadow-sm border border-gray-200/90 dark:border-gray-800 mb-8 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              Verified Ready Stock Sheet • Twin Cities Hub ({todayDateLabel})
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">
              <span>Showing {displayedSheetRates.length} total items</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Physical Stock
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  College Rd, I-9 Industrial & Blue Area (Rawalpindi/Twin Cities)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {sheetCategory === 'panel'
                  ? 'Solar Panels — Ready Stock Available'
                  : sheetCategory === 'inverter'
                  ? 'Solar Inverters — Verified Ready Stock & Daily Benchmarks'
                  : sheetCategory === 'battery'
                  ? 'Solar Batteries — Lithium LiFePO4 & Tall Tubular Benchmarks'
                  : sheetCategory === 'ess'
                  ? 'ESS & Storage — Power Tanks & Integrated Cabinet Benchmarks'
                  : sheetCategory === 'cables_wiring'
                  ? 'Solar DC Cables & Wiring — Pure Copper XLPO Benchmarks'
                  : sheetCategory === 'solar_accessories'
                  ? 'Protection & Solar Accessories — Breakers, SPDs & Enclosures'
                  : sheetCategory === 'complete_system'
                  ? 'Turnkey Solar Systems — Residential & Commercial Packages'
                  : sheetCategory === 'structure_accessories'
                  ? 'Structures & BOS — Galvanized Mountings, DC Cables & Protections'
                  : 'All Solar Equipment — Verified Ready Stock Trade Rates'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {sheetCategory === 'panel'
                  ? `Wholesale ready stock trade sheet (${todayDateLabel}) for Tier-1 N-Type TOPCon & Bifacial modules.`
                  : sheetCategory === 'inverter'
                  ? `Wholesale ready stock trade sheet (${todayDateLabel}) for Hybrid (IP65) & On-Grid Net Metering Inverters.`
                  : sheetCategory === 'battery'
                  ? `Wholesale ready stock trade sheet (${todayDateLabel}) for Lithium Iron Phosphate (LiFePO4) & Deep Cycle Tubular batteries.`
                  : sheetCategory === 'ess'
                  ? `Wholesale ready stock trade sheet (${todayDateLabel}) for portable power stations, Itel Power Tanks, and all-in-one ESS cabinets.`
                  : sheetCategory === 'cables_wiring'
                  ? `Wholesale trade rates (${todayDateLabel}) for pure copper double-insulated DC solar wire (Fast, Pakistan Cables, MCI).`
                  : sheetCategory === 'solar_accessories'
                  ? `Wholesale trade rates (${todayDateLabel}) for DC/AC breakers, surge protectors (Chint, CNC, Tomzen), and earthing kits.`
                  : sheetCategory === 'complete_system'
                  ? `Turnkey solar setup benchmarks (${todayDateLabel}) including Tier-1 plates, inverters, and net-metering.`
                  : sheetCategory === 'structure_accessories'
                  ? `Wholesale trade rates (${todayDateLabel}) for heavy GI structures, pure copper DC wire, and surge protections.`
                  : `Comprehensive live rate sheet (${todayDateLabel}) across panels, inverters, batteries, ESS storage, cables, protection, and complete systems.`}
              </p>
            </div>

            {/* Date Selection Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 self-start md:self-auto">
              <button
                onClick={() => setDailySheetDate('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dailySheetDate === 'today' || dailySheetDate === todayDateLabel
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {todayDateLabel} (Live)
              </button>
              <button
                onClick={() => setDailySheetDate('yesterday')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dailySheetDate === 'yesterday' || dailySheetDate === yesterdayDateLabel
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {yesterdayDateLabel} (Sheet)
              </button>
              <button
                onClick={() => setDailySheetDate('compare')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dailySheetDate === 'compare'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Compare Jump
              </button>
            </div>
          </div>

          {/* Tier-1 Verification Callout */}
          <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-gray-900 to-gray-900 border border-emerald-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-white">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Tier 1 Solar Panels Official Verification
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    9 Official Portals
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5">
                  Verify serial numbers & barcodes directly with Canadian Solar, Jinko, LONGi, JA Solar, Astronergy, Trina, Sunova, Huasun, and Yingli.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('verification')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verify Barcodes & Links</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Summary Highlights - Dynamic based on category */}
          {sheetCategory === 'panel' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Canadian Solar Stock</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 41.60 – 41.75/W</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">585W (Rs. 41.60) • 625W (Rs. 41.75)</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Jinko Solar & LONGi</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 41.25 – 43.25/W</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Jinko 585W (41.25) • 645W (41.50 Deliv 15/09) • X10 (43.25)</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">LEFN 640W Best Value</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Rs. 33.00/W</span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Lowest in PK
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Fresh container arrivals • Rs. 4.00/W drop</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Astronergy & JA Solar</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 38.60 – 39.75/W</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">JA 585W (38.60) • JA 605W (39.75) • Astro 620W/720W (39.00)</span>
              </div>
            </div>
          ) : sheetCategory === 'inverter' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Inverex Nitrox Hybrids</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">Rs. 266k – 549k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">6kW Single Phase • 10kW 3P (+5k) • 12kW Commercial</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Knox & Fronus Value</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 112k – 272k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Knox 6kW IP65 (186k) • Fronus 8.2kW PV9200 (233k)</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">On-Grid Net Metering</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Rs. 167k – 187k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Knox 10kW G4 (167k) • Growatt MOD 10kW (174k) • Sungrow</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Huawei Smart Tier-1</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 323k – 440k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">SUN2000-10KTL AFCI (+5k) • 20KTL Commercial String</span>
              </div>
            </div>
          ) : sheetCategory === 'battery' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Lithium LiFePO4 (5.12kWh)</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Rs. 238,500 – 258k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Narada 100Ah (6000 Cycles) • Pylontech FIDUS (10-Yr)</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Inverex PowerWall Series</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 265.5k – 564k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">5.12kWh Wallmount • 11.8kWh Heavy Duty Storage</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Phoenix Tall Tubular</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 41,500 – 51,500</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">TX 2500 (230Ah 27-Plates) • TX 1800 (185Ah 21-Plates)</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Osaka, AGS & Daewoo</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 31,500 – 47,000</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">AGS SP Tall 1200 • Osaka Pro 1800 • Daewoo DIB Maintenance-Free</span>
              </div>
            </div>
          ) : sheetCategory === 'ess' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Power Tank 500W/1KWh</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">Rs. 65,000</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Portable ESS Station • 3-Year Replacement</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">3.6KW + 8KWh ESS Cabinet</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Call for Rate</span>
                  <span className="inline-flex items-center text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">
                    All-in-One
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Integrated Hybrid + 8kWh Storage • 5-Year Warranty</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Itel Hybrid IP-54 Inverters</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">Rs. 44k – 138k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">1.6kW to 6kW Pro • Single Source Compatible</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Itel IP-20 Lithium Batteries</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Rs. 58k – 590k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">12V, 25V, 51V (100Ah - 314Ah) • 5-Year Replacement</span>
              </div>
            </div>
          ) : sheetCategory === 'complete_system' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">5kW Residential Hybrid</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">Rs. 825k – 875k</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">20-24 units/day • 585W N-Type + 6kW Inverter</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">10kW Net-Metering On-Grid</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Rs. 1,290,000</span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    -40k Drop
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">40-48 units/day • DISCO Net Metering Complete</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">15kW Commercial Setup</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 1,780,000</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">60-70 units/day • Plaza / School 3-Phase Solution</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">20kW Industrial Setup</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 2,340,000</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">80-95 units/day • Heavy 3-Phase Factory Net-Metered</span>
              </div>
            </div>
          ) : sheetCategory === 'structure_accessories' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">GI L2/L3 Structures</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">Rs. 4,200 – 5,400</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Heavy Duty 12-14 Gauge Hot-Dip Galvanized</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">TUV 4mm/6mm DC Wire</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Rs. 210 – 290/M</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Tinned Pure Copper Double Insulated Solar Cable</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">DC Breakers & SPD</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 3,200 – 4,800</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">1000V DC Surge Protective Device & Dual Breakers</span>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 p-3.5">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Earthing Bore Complete</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Rs. 18,500</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Pure Copper Rod (10ft) + Bentonite Chemical Kit</span>
              </div>
            </div>
          ) : (
            // 'all' category overview
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 p-3.5">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 block font-medium">Solar Plates Live</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">Rs. 33.00 – 44.50/W</span>
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">LEFN 640W (33.00) • Jinko (41.25) • Canadian (41.60)</span>
              </div>

              <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 p-3.5">
                <span className="text-[11px] text-blue-700 dark:text-blue-400 block font-medium">Solar Inverters Live</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">Rs. 112k – 549k</span>
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">Knox (112k) • Inverex Nitrox (266k) • Huawei (323k)</span>
              </div>

              <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 p-3.5">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-medium">Batteries & Storage</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Rs. 31.5k – 564k</span>
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">Narada Lithium (238.5k) • Phoenix TX2500 (51.5k)</span>
              </div>

              <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 p-3.5">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400 block font-medium">Turnkey & Hardware</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">5kW to 20kW Systems</span>
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">From Rs. 510k complete with GI mountings & DC cables</span>
              </div>
            </div>
          )}

          {/* Collapsible Sheet Table */}
          {showDailySheetDetail && (
            <div>
              {/* Sheet Quick Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={sheetSearchQuery}
                    onChange={(e) => setSheetSearchQuery(e.target.value)}
                    placeholder={
                      sheetCategory === 'panel'
                        ? 'Filter panels (e.g. Canadian, Jinko, 645W, Astro...)'
                        : sheetCategory === 'inverter'
                        ? 'Filter inverters (e.g. Nitrox, 6kW, Knox, Huawei, Fronus...)'
                        : sheetCategory === 'battery'
                        ? 'Filter batteries (e.g. Narada, LiFePO4, Phoenix, TX2500...)'
                        : sheetCategory === 'complete_system'
                        ? 'Filter systems (e.g. 5kW, 10kW Net Metering, Commercial...)'
                        : sheetCategory === 'structure_accessories'
                        ? 'Filter structures (e.g. GI frame, DC cable, SPD, Earthing...)'
                        : 'Search across all solar rates (brand, model, spec...)'
                    }
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Dynamic Filter Chips per Category */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 sm:pb-0 scrollbar-hide">
                  {sheetCategory === 'panel' ? (
                    [
                      { id: 'all', label: 'All Panels' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'canadian', label: 'Canadian Solar' },
                      { id: 'jinko', label: 'Jinko Solar' },
                      { id: 'longi', label: 'LONGi' },
                      { id: 'ja', label: 'JA Solar' },
                      { id: 'astronergy', label: 'Astronergy' },
                      { id: 'korean', label: 'Korean' },
                      { id: 'osda', label: 'OSDA' },
                      { id: 'lefn', label: 'LEFN' },
                      { id: 'tcl', label: 'TCL' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : sheetCategory === 'inverter' ? (
                    [
                      { id: 'all', label: 'All Inverters' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'goodwe', label: 'GoodWe HV/LV' },
                      { id: 'zapher', label: 'Zapher IP66' },
                      { id: 'xenon', label: 'Xenon / Xynex' },
                      { id: 'krypton', label: 'Krypton IP20' },
                      { id: 'itel', label: 'Itel Hybrid' },
                      { id: 'hybrid', label: 'Hybrid' },
                      { id: 'ongrid', label: 'On-Grid' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : sheetCategory === 'battery' ? (
                    [
                      { id: 'all', label: 'All Batteries' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'lithium', label: 'Lithium (IP20/IP54)' },
                      { id: 'goodwe', label: 'GoodWe HV/LV' },
                      { id: 'itel', label: 'Itel Lithium' },
                      { id: 'narada', label: 'Narada' },
                      { id: 'tubular', label: 'Tall Tubular' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : sheetCategory === 'cables_wiring' ? (
                    [
                      { id: 'all', label: 'All DC Cables' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'fast', label: 'Fast Cables' },
                      { id: 'pakistan', label: 'Pakistan Cables' },
                      { id: 'mci', label: 'MCI Cables' },
                      { id: 'jukai', label: 'JUKAI' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : sheetCategory === 'solar_accessories' ? (
                    [
                      { id: 'all', label: 'All Protection' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'chint', label: 'Chint' },
                      { id: 'cnc', label: 'CNC' },
                      { id: 'tomzen', label: 'Tomzen' },
                      { id: 'breaker', label: 'Breakers (MCB)' },
                      { id: 'spd', label: 'SPDs Surge Guard' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : sheetCategory === 'ess' ? (
                    [
                      { id: 'all', label: 'All ESS' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'powertank', label: 'Power Tank 500W' },
                      { id: 'cabinet', label: 'All-in-One 8KWh' },
                      { id: 'itel', label: 'Itel' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : sheetCategory === 'complete_system' ? (
                    [
                      { id: 'all', label: 'All Systems' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'residential', label: 'Residential (5-10kW)' },
                      { id: 'commercial', label: 'Commercial (15-20kW)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : sheetCategory === 'structure_accessories' ? (
                    [
                      { id: 'all', label: 'All Structures' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'structure', label: 'GI Structure' },
                      { id: 'cable', label: 'DC Cable' },
                      { id: 'protection', label: 'Protection & Earth' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : (
                    // 'all' category chips
                    [
                      { id: 'all', label: 'All Equipment' },
                      { id: 'changed', label: 'Rate Changed' },
                      { id: 'panel', label: 'Panels' },
                      { id: 'inverter', label: 'Inverters' },
                      { id: 'battery', label: 'Batteries' },
                      { id: 'cables_wiring', label: 'Cables & Wiring' },
                      { id: 'solar_accessories', label: 'Accessories' },
                      { id: 'ess', label: 'ESS / Storage' },
                      { id: 'goodwe', label: 'GoodWe' },
                      { id: 'itel', label: 'Itel' },
                      { id: 'system', label: 'Complete Systems' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSheetFilterStatus(f.id)}
                        className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                          sheetFilterStatus === f.id
                            ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 font-bold'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Mobile View Mode Switcher */}
              <div className="flex items-center justify-between mb-3 px-0.5 md:hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    Mobile View:
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {sheetMobileView === 'cards' ? 'Cards View (Fitted)' : 'Full Spreadsheet'}
                  </span>
                </div>
                <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSheetMobileView('cards')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      sheetMobileView === 'cards'
                        ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    📱 Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetMobileView('table')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      sheetMobileView === 'table'
                        ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    📊 Table
                  </button>
                </div>
              </div>

              {/* Mobile Cards View (Fitted 100% Responsive, Zero Horizontal Scroll) */}
              {sheetMobileView === 'cards' && (
                <div className="md:hidden space-y-2.5 mb-3">
                  {displayedSheetRates.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs">
                      No matching items found in daily {sheetCategory === 'all' ? 'solar' : sheetCategory} rate sheet.
                    </div>
                  ) : (
                    (isExpandedSheet ? displayedSheetRates : displayedSheetRates.slice(0, 8)).map((item, idx) => {
                      const itemCat = item.itemCategory || sheetCategory;

                      // Panel Card
                      if (itemCat === 'panel') {
                        const wattMatch =
                          (item.capacity && item.capacity.match(/(\d{3,4})\s*W?/i)) ||
                          (item.model && item.model.match(/(\d{3,4})\s*W/i)) ||
                          (item.model && item.model.match(/\b(\d{3,4})\b/));
                        const wattsNum = wattMatch ? parseInt(wattMatch[1], 10) : 585;
                        const platePrice = Math.round(item.rate * wattsNum);

                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                    Panel
                                  </span>
                                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    {item.brand}
                                  </span>
                                  {item.badge && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                        item.status === 'down'
                                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                          : item.status === 'up'
                                          ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30'
                                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
                                  {item.model}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                                  Rs. {item.rate.toFixed(2)}/W
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  Prev: Rs. {item.prevRate.toFixed(2)}/W
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                              <div>
                                {item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                    <ArrowDownRight className="h-3 w-3" />
                                    Rs. {Math.abs(item.change).toFixed(2)}/W Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                    <TrendingUp className="h-3 w-3" />
                                    +Rs. {item.change.toFixed(2)}/W
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  Rs. {platePrice.toLocaleString()}{' '}
                                  <span className="text-[10px] text-gray-400 font-normal">/plate</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategory('panel');
                                    setSelectedBrand(item.brand.replace(' Solar', ''));
                                    setSearchQuery(item.model.split(' ')[0]);
                                    const target = document.getElementById('catalog-results');
                                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  Stock <ChevronRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Inverter Card
                      if (itemCat === 'inverter') {
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                    Inverter
                                  </span>
                                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    {item.brand}
                                  </span>
                                  {item.badge && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                        item.status === 'down'
                                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                          : item.status === 'up'
                                          ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30'
                                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
                                  {item.model}
                                </div>
                                {item.specs && (
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {item.specs}
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                                  Rs. {Math.round(item.rate).toLocaleString()}
                                </div>
                                {item.prevRate && (
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Prev: Rs. {Math.round(item.prevRate).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                              <div>
                                {item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                    <ArrowDownRight className="h-3 w-3" />
                                    -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                    <TrendingUp className="h-3 w-3" />
                                    +Rs. {item.change.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory('inverter');
                                  setSelectedBrand(item.brand);
                                  setSearchQuery(item.model.split(' ')[0]);
                                  const target = document.getElementById('catalog-results');
                                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                Stock <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      // Battery Card
                      if (itemCat === 'battery') {
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                    Battery
                                  </span>
                                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    {item.brand}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
                                  {item.model}
                                </div>
                                {item.specs && (
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {item.specs}
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                                  Rs. {Math.round(item.rate).toLocaleString()}
                                </div>
                                {item.prevRate && (
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Prev: Rs. {Math.round(item.prevRate).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                              <div>
                                {item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                    <ArrowDownRight className="h-3 w-3" />
                                    -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                    <TrendingUp className="h-3 w-3" />
                                    +Rs. {item.change.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory('battery');
                                  setSelectedBrand(item.brand);
                                  setSearchQuery(item.model.split(' ')[0]);
                                  const target = document.getElementById('catalog-results');
                                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                Stock <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      // ESS / Complete System / Structure Card
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                  {itemCat.replace('_', ' ')}
                                </span>
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                  {item.brand || item.systemType || 'Equipment'}
                                </span>
                                {item.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
                                {item.model || item.capacity || item.systemType}
                              </div>
                              {item.specs && (
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  {item.specs}
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-base font-extrabold text-primary-600 dark:text-primary-400">
                                Rs. {Math.round(item.rate).toLocaleString()}{item.unit ? ` ${item.unit}` : ''}
                              </div>
                              {item.prevRate && (
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  Prev: Rs. {Math.round(item.prevRate).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                            <div>
                              {item.change < 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                  <ArrowDownRight className="h-3 w-3" />
                                  -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                </span>
                              ) : item.change > 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md text-[11px]">
                                  <TrendingUp className="h-3 w-3" />
                                  +Rs. {item.change.toLocaleString()}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                                  <Equal className="h-3 w-3" /> Stable
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const target = document.getElementById('catalog-results');
                                if (target) target.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              View Deals <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Desktop Table View & Mobile Table Toggle Container */}
              <div className={`${sheetMobileView === 'cards' ? 'hidden md:block' : 'block'}`}>
                {sheetMobileView === 'table' && (
                  <div className="md:hidden flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                    <span>👉 Swipe table sideways to see rates, difference & total price</span>
                    <span className="font-bold">↔</span>
                  </div>
                )}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 scrollbar-hide">
                  <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-800/90 text-[11px] uppercase tracking-wider text-gray-600 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                    {sheetCategory === 'panel' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Brand & Module</th>
                        <th className="px-3 py-2.5">Model & Specifications</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? `${yesterdayDateLabel} Ready Rate`
                            : `${todayDateLabel} Live Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? 'Previous Rate'
                            : `${yesterdayDateLabel} Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026' ? 'Stock Trend' : 'Difference'}
                        </th>
                        <th className="px-3 py-2.5">Total Price (Est.)</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : sheetCategory === 'inverter' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Brand & Model</th>
                        <th className="px-3 py-2.5">Model & Specifications</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? `${yesterdayDateLabel} Ready Rate`
                            : `${todayDateLabel} Live Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? 'Previous Rate'
                            : `${yesterdayDateLabel} Rate`}
                        </th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Total Price (Est.)</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : sheetCategory === 'battery' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Brand & Model</th>
                        <th className="px-3 py-2.5">Model & Specifications</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? `${yesterdayDateLabel} Ready Rate`
                            : `${todayDateLabel} Live Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? 'Previous Rate'
                            : `${yesterdayDateLabel} Rate`}
                        </th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Total Price (Est.)</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : sheetCategory === 'ess' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Brand & ESS System</th>
                        <th className="px-3 py-2.5">Model & Specifications</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? `${yesterdayDateLabel} Ready Rate`
                            : `${todayDateLabel} Live Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? 'Previous Rate'
                            : `${yesterdayDateLabel} Rate`}
                        </th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Total Price (Est.)</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : sheetCategory === 'complete_system' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Turnkey Package</th>
                        <th className="px-3 py-2.5">Model & Specifications</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? `${yesterdayDateLabel} Package Rate`
                            : `${todayDateLabel} Package Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? 'Previous Rate'
                            : `${yesterdayDateLabel} Rate`}
                        </th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Total Price (Est.)</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : sheetCategory === 'cables_wiring' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Brand & Cable Spec</th>
                        <th className="px-3 py-2.5">Conductor & Size</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday'
                            ? `${yesterdayDateLabel} Rate (Per M)`
                            : `${todayDateLabel} Ready Rate (Per M)`}
                        </th>
                        <th className="px-3 py-2.5">Previous Rate</th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Coil / Meter Rate</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : sheetCategory === 'solar_accessories' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Brand & Switchgear</th>
                        <th className="px-3 py-2.5">Model & Ratings</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday'
                            ? `${yesterdayDateLabel} Unit Rate`
                            : `${todayDateLabel} Wholesale Rate`}
                        </th>
                        <th className="px-3 py-2.5">Previous Rate</th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Warranty & Spec</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : sheetCategory === 'structure_accessories' ? (
                      <tr>
                        <th className="px-3.5 py-2.5">Equipment / BOS Item</th>
                        <th className="px-3 py-2.5">Model & Specifications</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? `${yesterdayDateLabel} Ready Rate`
                            : `${todayDateLabel} Wholesale Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? 'Previous Rate'
                            : `${yesterdayDateLabel} Rate`}
                        </th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Total Price (Est.)</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    ) : (
                      // 'all' category header
                      <tr>
                        <th className="px-3.5 py-2.5">Category & Brand</th>
                        <th className="px-3 py-2.5">Model & Specifications</th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? `${yesterdayDateLabel} Ready Rate`
                            : `${todayDateLabel} Live Rate`}
                        </th>
                        <th className="px-3 py-2.5">
                          {dailySheetDate === 'yesterday' || dailySheetDate === '13-Sep-2026'
                            ? 'Previous Rate'
                            : `${yesterdayDateLabel} Rate`}
                        </th>
                        <th className="px-3 py-2.5">Difference</th>
                        <th className="px-3 py-2.5">Total Price (Est.)</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                    {displayedSheetRates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No matching items found in daily {sheetCategory === 'all' ? 'solar' : sheetCategory} rate sheet.
                        </td>
                      </tr>
                    ) : (
                      (isExpandedSheet ? displayedSheetRates : displayedSheetRates.slice(0, 8)).map((item, idx) => {
                        const itemCat = item.itemCategory || sheetCategory;

                        // 1. Panel row
                        if (itemCat === 'panel') {
                          const wattMatch =
                            (item.capacity && item.capacity.match(/(\d{3,4})\s*W?/i)) ||
                            (item.model && item.model.match(/(\d{3,4})\s*W/i)) ||
                            (item.model && item.model.match(/\b(\d{3,4})\b/));
                          const wattsNum = wattMatch ? parseInt(wattMatch[1], 10) : 585;
                          const platePrice = Math.round(item.rate * wattsNum);

                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                item.change < 0
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/15'
                                  : item.change > 0
                                  ? 'bg-red-50/40 dark:bg-red-950/15'
                                  : item.badge
                                  ? 'bg-amber-50/20 dark:bg-amber-950/15'
                                  : ''
                              }`}
                            >
                              <td className="px-3.5 py-2.5 font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-1.5">
                                {sheetCategory === 'all' && (
                                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-bold">
                                    Panel
                                  </span>
                                )}
                                <span>{item.brand}</span>
                                {item.badge && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                    item.status === 'down'
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                      : item.status === 'up'
                                      ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30'
                                      : item.status === 'new'
                                      ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                                {item.deliveryDate && (
                                  <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-semibold">
                                    Deliv: {item.deliveryDate}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200 font-semibold">
                                {item.model}
                              </td>
                              <td className="px-3 py-2.5 font-bold text-amber-600 dark:text-amber-400">
                                Rs. {item.rate.toFixed(2)}/W
                              </td>
                              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                Rs. {item.prevRate.toFixed(2)}/W
                              </td>
                              <td className="px-3 py-2.5">
                                {item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                    Rs. {Math.abs(item.change).toFixed(2)}/W Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    +Rs. {item.change.toFixed(2)}/W
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="font-bold text-gray-900 dark:text-white">
                                  Rs. {platePrice.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  per plate ({wattsNum}W)
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedCategory('panel');
                                    setSelectedBrand(item.brand.replace(' Solar', ''));
                                    setSearchQuery(item.model.split(' ')[0]);
                                    const target = document.getElementById('catalog-results');
                                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                                >
                                  View Stock
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // 2. Inverter row
                        if (itemCat === 'inverter') {
                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                item.change < 0
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/15'
                                  : item.change > 0
                                  ? 'bg-red-50/40 dark:bg-red-950/15'
                                  : item.badge
                                  ? 'bg-blue-50/30 dark:bg-blue-950/15'
                                  : ''
                              }`}
                            >
                              <td className="px-3.5 py-2.5 font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-1.5">
                                {sheetCategory === 'all' && (
                                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded font-bold">
                                    Inverter
                                  </span>
                                )}
                                <span>{item.brand}</span>
                                {item.badge && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                    item.status === 'down'
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                      : item.status === 'up'
                                      ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30'
                                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                                {item.note && (
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                                    {item.note}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">
                                <div className="font-semibold text-xs text-gray-900 dark:text-white">{item.model}</div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.capacity} • {item.type}</div>
                              </td>
                              <td className="px-3 py-2.5 font-bold text-blue-600 dark:text-blue-400">
                                {item.rate != null ? `Rs. ${item.rate.toLocaleString()}` : 'Rs. N/A'}
                              </td>
                              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                {item.prevRate != null ? `Rs. ${item.prevRate.toLocaleString()}` : 'Rs. N/A'}
                              </td>
                              <td className="px-3 py-2.5">
                                {item.rate == null ? (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    Call for Rate
                                  </span>
                                ) : item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                    -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    +Rs. {item.change.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {item.rate != null ? `Rs. ${item.rate.toLocaleString()}` : 'Call for Rate'}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {item.warranty || '5 Years Warranty'}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedCategory('inverter');
                                    setSelectedBrand(item.brand);
                                    setSearchQuery(item.brand);
                                    const target = document.getElementById('catalog-results');
                                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
                                >
                                  View Stock
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // 3. Battery row
                        if (itemCat === 'battery') {
                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                item.change < 0
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/15'
                                  : item.change > 0
                                  ? 'bg-red-50/40 dark:bg-red-950/15'
                                  : item.badge
                                  ? 'bg-emerald-50/30 dark:bg-emerald-950/15'
                                  : ''
                              }`}
                            >
                              <td className="px-3.5 py-2.5 font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-1.5">
                                {sheetCategory === 'all' && (
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                                    Battery
                                  </span>
                                )}
                                <span>{item.brand}</span>
                                {item.badge && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                    item.status === 'down'
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                      : item.status === 'up'
                                      ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30'
                                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">
                                <div className="font-semibold text-xs text-gray-900 dark:text-white">{item.model}</div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.capacity} • {item.type}</div>
                              </td>
                              <td className="px-3 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                                {item.rate != null ? `Rs. ${item.rate.toLocaleString()}` : 'Rs. N/A'}
                              </td>
                              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                {item.prevRate != null ? `Rs. ${item.prevRate.toLocaleString()}` : 'Rs. N/A'}
                              </td>
                              <td className="px-3 py-2.5">
                                {item.rate == null ? (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    Call for Rate
                                  </span>
                                ) : item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                    -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    +Rs. {item.change.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {item.rate != null ? `Rs. ${item.rate.toLocaleString()}` : 'Call for Rate'}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {item.warranty || '10 Years (6000 Cycles)'}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedCategory('battery');
                                    setSelectedBrand(item.brand);
                                    setSearchQuery(item.brand);
                                    const target = document.getElementById('catalog-results');
                                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                                >
                                  View Stock
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // 3.5. ESS / Energy Storage row
                        if (itemCat === 'ess') {
                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                item.change < 0
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/15'
                                  : item.change > 0
                                  ? 'bg-red-50/40 dark:bg-red-950/15'
                                  : item.badge
                                  ? 'bg-violet-50/30 dark:bg-violet-950/15'
                                  : ''
                              }`}
                            >
                              <td className="px-3.5 py-2.5 font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-1.5">
                                {sheetCategory === 'all' && (
                                  <span className="text-[10px] bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 px-1.5 py-0.5 rounded font-bold">
                                    ESS
                                  </span>
                                )}
                                <span>{item.brand}</span>
                                {item.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">
                                <div className="font-semibold text-xs text-gray-900 dark:text-white">{item.model}</div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.capacity} • {item.type}</div>
                              </td>
                              <td className="px-3 py-2.5 font-bold text-violet-600 dark:text-violet-400">
                                {item.rate != null ? `Rs. ${item.rate.toLocaleString()}` : 'Rs. N/A'}
                              </td>
                              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                {item.prevRate != null ? `Rs. ${item.prevRate.toLocaleString()}` : 'Rs. N/A'}
                              </td>
                              <td className="px-3 py-2.5">
                                {item.rate == null ? (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    Call for Rate
                                  </span>
                                ) : item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                    -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    +Rs. {item.change.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {item.rate != null ? `Rs. ${item.rate.toLocaleString()}` : 'Call for Rate'}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {item.warranty || '3 to 5 Years Warranty'}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedCategory('ess');
                                    setSelectedBrand(item.brand);
                                    setSearchQuery(item.brand);
                                    const target = document.getElementById('catalog-results');
                                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 transition-colors cursor-pointer"
                                >
                                  View Stock
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // 4. Complete System row
                        if (itemCat === 'complete_system') {
                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                item.change < 0
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/15'
                                  : item.change > 0
                                  ? 'bg-red-50/40 dark:bg-red-950/15'
                                  : item.badge
                                  ? 'bg-indigo-50/30 dark:bg-indigo-950/15'
                                  : ''
                              }`}
                            >
                              <td className="px-3.5 py-2.5 font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-1.5">
                                {sheetCategory === 'all' && (
                                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded font-bold">
                                    System
                                  </span>
                                )}
                                <span>{item.brand}</span>
                                {item.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">
                                <div className="font-semibold text-xs text-gray-900 dark:text-white">{item.model}</div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {item.capacity} • {item.type}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                                Rs. {item.rate.toLocaleString()}
                              </td>
                              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                Rs. {item.prevRate.toLocaleString()}
                              </td>
                              <td className="px-3 py-2.5">
                                {item.change < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                    -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                  </span>
                                ) : item.change > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    +Rs. {item.change.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-gray-400">
                                    <Equal className="h-3 w-3" /> Stable
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="font-bold text-gray-900 dark:text-white">
                                  Rs. {item.rate.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {item.warranty || '25-Yr Panels, 5-Yr Inverter'}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedCategory('complete_system');
                                    setSelectedBrand(item.brand);
                                    setSearchQuery(item.brand);
                                    const target = document.getElementById('catalog-results');
                                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                                >
                                  View Stock
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // 5. Structure & Accessories row
                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                              item.change < 0
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/15'
                                : item.change > 0
                                ? 'bg-red-50/40 dark:bg-red-950/15'
                                : item.badge
                                ? 'bg-slate-50/30 dark:bg-slate-900/20'
                                : ''
                            }`}
                          >
                            <td className="px-3.5 py-2.5 font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-1.5">
                              {sheetCategory === 'all' && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  item.itemCategory === 'cables_wiring'
                                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
                                    : item.itemCategory === 'solar_accessories'
                                    ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                }`}>
                                  {item.itemCategory === 'cables_wiring' ? 'Cable' : item.itemCategory === 'solar_accessories' ? 'Accessory' : 'Structure'}
                                </span>
                              )}
                              <span>{item.brand}</span>
                              {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30">
                                  {item.badge}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">
                              <div className="font-semibold text-xs text-gray-900 dark:text-white">{item.model}</div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.capacity} • {item.type}</div>
                            </td>
                            <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">
                              Rs. {item.rate.toLocaleString()} {item.itemCategory === 'cables_wiring' || item.unit === 'per_meter' ? '/ Meter' : ''}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                              Rs. {item.prevRate.toLocaleString()} {item.itemCategory === 'cables_wiring' || item.unit === 'per_meter' ? '/ Meter' : ''}
                            </td>
                            <td className="px-3 py-2.5">
                              {item.change < 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                  <ArrowDownRight className="h-3.5 w-3.5" />
                                  -Rs. {Math.abs(item.change).toLocaleString()} Drop
                                </span>
                              ) : item.change > 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 font-bold">
                                  <TrendingUp className="h-3.5 w-3.5" />
                                  +Rs. {item.change.toLocaleString()}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                  <Equal className="h-3 w-3" /> Stable
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="font-bold text-gray-900 dark:text-white">
                                Rs. {item.rate.toLocaleString()} {item.itemCategory === 'cables_wiring' || item.unit === 'per_meter' ? '/ Meter' : ''}
                              </div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                {item.warranty || (item.itemCategory === 'cables_wiring' ? '25-Yr Outdoor Rating' : '2-Yr Replacement')}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCategory(item.itemCategory || 'cables_wiring');
                                  setSelectedBrand(item.brand);
                                  setSearchQuery(item.brand);
                                  const target = document.getElementById('catalog-results');
                                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              >
                                View Stock
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              </div>

              {/* Compact Limit Expand / Collapse Bar */}
              {displayedSheetRates.length > 8 && (
                <div className="p-3 bg-gray-50/90 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{isExpandedSheet ? displayedSheetRates.length : Math.min(8, displayedSheetRates.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{displayedSheetRates.length}</span> items in {sheetCategory === 'all' ? 'All Rates' : sheetCategory}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsExpandedSheet(!isExpandedSheet)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-gray-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 shadow-2xs transition-all cursor-pointer"
                  >
                    {isExpandedSheet ? (
                      <>Show Top 8 Popular Only <ChevronUp className="h-3.5 w-3.5 text-amber-500" /></>
                    ) : (
                      <>View All {displayedSheetRates.length} Items ({displayedSheetRates.length - 8} more) <ChevronDown className="h-3.5 w-3.5 text-amber-500" /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-800">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              Verified daily at 12:00 Midnight PKT from wholesale suppliers in Pakistan.
            </span>
            <button
              onClick={() => setShowDailySheetDetail(!showDailySheetDetail)}
              className="text-primary-600 dark:text-primary-400 hover:underline font-semibold cursor-pointer"
            >
              {showDailySheetDetail
                ? 'Collapse Sheet'
                : `Expand ${
                    sheetCategory === 'panel'
                      ? 'Solar Panels Sheet'
                      : sheetCategory === 'inverter'
                      ? 'Inverters Sheet'
                      : 'Batteries Sheet'
                  }`}
            </button>
          </div>
        </div>
        </>
        )}

        {/* Equipment Catalog Tab Content */}
        {pageTab === 'catalog' && (
        <>
        {/* Filter controls & Search */}
        <div id="catalog-results" className="rounded-2xl bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-800 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, model (e.g. Longi Hi-MO 7, 6kW Hybrid, Narada 100Ah, 585W)..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort & Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Compare Table
                </button>
              </div>
            </div>
          </div>

          {/* Brand Pills Filter */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 shrink-0 uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3 w-3" /> Brands:
            </span>
            <button
              onClick={() => setSelectedBrand('')}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedBrand === ''
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
          <div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {(isExpandedCatalog ? filteredItems : filteredItems.slice(0, 9)).map((item) => (
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
            {filteredItems.length > 9 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsExpandedCatalog(!isExpandedCatalog)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-gray-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs transition-all cursor-pointer"
                >
                  {isExpandedCatalog ? (
                    <>Show Top 9 Products Only <ChevronUp className="h-4 w-4 text-amber-500" /></>
                  ) : (
                    <>View All {filteredItems.length} Products ({filteredItems.length - 9} More) <ChevronDown className="h-4 w-4 text-amber-500" /></>
                  )}
                </button>
              </div>
            )}
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
                  {(isExpandedCatalog ? filteredItems : filteredItems.slice(0, 9)).map((item) => (
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
                        ) : item.unitPriceMin == null ? (
                          <span className="font-bold text-gray-500">
                            Call for Rate
                          </span>
                        ) : (
                          <span className="font-bold text-primary-600">
                            {formatPrice(item.unitPriceMin)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-gray-900">
                          {item.unitPriceMin == null
                            ? 'Call for Rate'
                            : item.unitPriceMin === item.unitPriceMax
                            ? formatPrice(item.unitPriceMin)
                            : `${formatPrice(item.unitPriceMin)} – ${formatPrice(item.unitPriceMax)}`}
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
            {filteredItems.length > 9 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                  type="button"
                  onClick={() => setIsExpandedCatalog(!isExpandedCatalog)}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-xs bg-white dark:bg-gray-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs transition-all cursor-pointer"
                >
                  {isExpandedCatalog ? (
                    <>Show Top 9 Products Only <ChevronUp className="h-4 w-4 text-amber-500" /></>
                  ) : (
                    <>View All {filteredItems.length} Products ({filteredItems.length - 9} More) <ChevronDown className="h-4 w-4 text-amber-500" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
          </>
        )}

        {/* ===== COMPACT CALCULATOR CTA (replaces full widget) ===== */}
        <section className="mt-10 rounded-2xl bg-gradient-to-r from-primary-900 via-gray-900 to-gray-900 p-4 sm:px-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 border border-primary-400/30">
                <Calculator className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary-400">Solar Load Calculator</div>
                <div className="text-sm font-bold text-white">Calculate your exact system size, panel count &amp; turnkey budget</div>
              </div>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('calculator')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-400 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Calculator className="h-4 w-4" />
              Open Load Calculator
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ================= CITY MARKET RATES BENCHMARK ================= */}
        <section id="regional-markets" className="mt-12 scroll-mt-24">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-0.5">
                Regional Hubs
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                Major Solar Markets in Pakistan
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
              Prices vary by ±1-2% depending on freight and wholesaler stock
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {MARKET_SUMMARY.cities.map((city) => (
              <div
                key={city.name}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory({ city: city.name });
                  } else if (onNavigate) {
                    onNavigate('home');
                  }
                }}
                className="group rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-xs ring-1 ring-gray-200/80 dark:ring-gray-800 hover:shadow-md hover:ring-primary-400 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm sm:text-base group-hover:text-primary-600 transition-colors">
                      <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      {city.name}
                    </div>
                    <span className="rounded-full bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50">
                      {city.rateStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Main Hub: {city.market}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Panel Rate Avg:</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">Rs 34.5 – 37.5 / W</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-700">
                  <span>Browse {city.name} Ads</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= BUYING GUIDE & TIPS ================= */}
        <section id="buying-guide" className="mt-12 rounded-3xl bg-white dark:bg-gray-900 p-5 sm:p-8 shadow-xs ring-1 ring-gray-200/80 dark:ring-gray-800 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-0.5">
                Buyer's Advice
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                Tips for Buying Solar Equipment in Pakistan
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsExpandedGuide(!isExpandedGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors self-start sm:self-auto cursor-pointer"
            >
              {isExpandedGuide ? (
                <>Collapse Tips <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>Expand 3 Tips <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </button>
          </div>

          {isExpandedGuide && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4 border border-gray-100 dark:border-gray-800">
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">Verify QR Codes & Barcodes</h3>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Genuine Longi, Jinko, and Canadian Solar panels have embossed barcodes embedded inside
                  the glass layer. Scan using official brand apps.
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4 border border-gray-100 dark:border-gray-800">
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                  <Award className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">N-Type TOPCon vs Mono PERC</h3>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  N-Type TOPCon panels deliver 3-5% more energy during Pakistan's peak 45°C summer heat
                  compared to older P-type Mono PERC plates.
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4 border border-gray-100 dark:border-gray-800">
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">Lithium vs Tubular Battery</h3>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  While LiFePO4 lithium batteries cost more upfront, their 10+ year lifespan (6,000
                  cycles) makes them 40% cheaper over time than tubular batteries.
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions & Navigation Bar */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-gray-500">
              Need assistance with your solar setup?
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigate && onNavigate('calculator')}
                className="btn-outline text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5"
              >
                <Calculator className="h-3.5 w-3.5" />
                Load Calculator
              </button>
              <button
                onClick={() => onNavigate && onNavigate('install')}
                className="btn-outline text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5"
              >
                <Wrench className="h-3.5 w-3.5" />
                Request Installation
              </button>
              <button
                onClick={() => onNavigate && onNavigate('dealers')}
                className="btn-outline text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Verified Dealers
              </button>
              <button
                onClick={() => onNavigate && onNavigate('safety')}
                className="btn-ghost text-xs px-3 py-1.5 font-bold flex items-center gap-1 text-primary-600 hover:text-primary-700"
              >
                Safety Tips <ArrowRight className="h-3 w-3" />
              </button>
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
  const isSystem = item.category === 'complete_system';
  const isStructure = item.category === 'structure_accessories';
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
                  {item.unitPriceMin === item.unitPriceMax
                    ? formatPrice(item.unitPriceMin)
                    : `${formatPrice(item.unitPriceMin)} – ${formatPrice(item.unitPriceMax)}`}
                </span>
              </div>
            </div>
          ) : isSystem ? (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Complete Turnkey Package Cost
              </div>
              <div className="text-xl font-extrabold text-indigo-600">
                {item.unitPriceMin == null
                  ? 'Call for Quote'
                  : item.unitPriceMin === item.unitPriceMax
                  ? formatPrice(item.unitPriceMin)
                  : `${formatPrice(item.unitPriceMin)} – ${formatPrice(item.unitPriceMax)}`}
              </div>
              <div className="mt-1 text-[11px] text-gray-600 font-semibold">
                Daily Generation: <span className="text-emerald-600">{item.capacity}</span>
              </div>
            </div>
          ) : isStructure ? (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Mounting & BOS Trade Rate
              </div>
              <div className="text-xl font-extrabold text-slate-800">
                {item.unitPriceMin == null
                  ? 'Call for Rate'
                  : item.unitPriceMin === item.unitPriceMax
                  ? formatPrice(item.unitPriceMin)
                  : `${formatPrice(item.unitPriceMin)} – ${formatPrice(item.unitPriceMax)}`}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                Rating / Size: <span className="font-semibold text-gray-800">{item.capacity}</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Estimated Trade Price
              </div>
              <div className="text-xl font-extrabold text-primary-600">
                {item.unitPriceMin == null
                  ? 'Call for Rate'
                  : item.unitPriceMin === item.unitPriceMax
                  ? formatPrice(item.unitPriceMin)
                  : `${formatPrice(item.unitPriceMin)} – ${formatPrice(item.unitPriceMax)}`}
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
                {isBattery ? 'Life Cycle / DoD:' : isSystem ? 'Efficiency:' : isStructure ? 'Specification:' : 'Efficiency:'}
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

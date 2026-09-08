import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Sun,
  Zap,
  BatteryCharging,
  Boxes,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { CATEGORIES, formatPrice } from '../lib/constants';
import { getLocalOrSeedListings } from '../data/seedListings';
import { getEquipmentFallbackImage } from '../utils/solarImages';
import { supabase } from '../lib/supabase';

const POPULAR_SEARCHES = [
  { label: 'Longi Hi-MO 6 585W', brand: 'Longi', category: 'panel' },
  { label: 'Inverex Nitrox 6kW / 10kW', brand: 'Inverex', category: 'inverter' },
  { label: 'Crown Elego 3.2kW / 6kW', brand: 'Crown', category: 'inverter' },
  { label: 'Narada Lithium 48V 100Ah', brand: 'Narada', category: 'battery' },
  { label: 'Phoenix TX-1800 Tubular', brand: 'Phoenix', category: 'battery' },
  { label: 'Canadian Solar TopCon 585W', brand: 'Canadian Solar', category: 'panel' },
  { label: '10kW On-Grid Net Metering', brand: '', category: 'complete_system' },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Items', icon: Sparkles },
  { id: 'panel', label: 'Solar Panels', icon: Sun },
  { id: 'inverter', label: 'Inverters', icon: Zap },
  { id: 'battery', label: 'Batteries', icon: BatteryCharging },
  { id: 'complete_system', label: 'Systems', icon: Boxes },
];

export default function GlobalNavbarSearch({
  onSelectListing,
  onSearchSubmit,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [allListings, setAllListings] = useState(() => getLocalOrSeedListings({}));
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Load listings cache for fast instant search
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('solar_listings')
          .select('id, title, brand, category, condition, price, city, capacity_kw, warranty_years, image_url, image_urls, featured, views, created_at')
          .limit(100);

        if (isMounted) {
          if (!error && data && data.length > 0) {
            setAllListings(data);
          } else {
            setAllListings(getLocalOrSeedListings({}));
          }
        }
      } catch {
        if (isMounted) {
          setAllListings(getLocalOrSeedListings({}));
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Global keyboard shortcut ('/' or 'Ctrl+K' / 'Cmd+K' to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter listings based on query and active category
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = activeCategory === 'all' ? '' : activeCategory;

    let pool = allListings;
    if (pool.length === 0) {
      pool = getLocalOrSeedListings({});
    }

    return pool.filter((item) => {
      if (cat && item.category !== cat) return false;
      if (!q) return true;

      const titleMatch = item.title?.toLowerCase().includes(q);
      const brandMatch = item.brand?.toLowerCase().includes(q);
      const cityMatch = item.city?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const catMatch = item.category?.toLowerCase().includes(q) || (CATEGORIES[item.category] && CATEGORIES[item.category].toLowerCase().includes(q));
      const capacityMatch = item.capacity_kw && String(item.capacity_kw).toLowerCase().includes(q);

      return titleMatch || brandMatch || cityMatch || descMatch || catMatch || capacityMatch;
    });
  }, [allListings, query, activeCategory]);

  const displayedResults = useMemo(() => {
    return filteredResults.slice(0, 8);
  }, [filteredResults]);

  const handleSelect = (listingId) => {
    setIsOpen(false);
    if (onSelectListing) {
      onSelectListing(listingId);
    }
  };

  const handleSubmitSearch = (searchQuery = query, categoryId = activeCategory, brandName = '') => {
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit({
        query: searchQuery,
        category: categoryId === 'all' ? '' : categoryId,
        brand: brandName || ''
      });
    }
  };

  const handleKeyDownInInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < displayedResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && displayedResults[selectedIndex]) {
        handleSelect(displayedResults[selectedIndex].id);
      } else {
        handleSubmitSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Quick category badges with count
  const categoryCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const counts = { all: 0, panel: 0, inverter: 0, battery: 0, complete_system: 0 };
    
    allListings.forEach((item) => {
      let matchesQuery = true;
      if (q) {
        matchesQuery =
          item.title?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.city?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q);
      }
      if (matchesQuery) {
        counts.all += 1;
        if (counts[item.category] !== undefined) {
          counts[item.category] += 1;
        }
      }
    });

    return counts;
  }, [allListings, query]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Clickable Search Input for Mobile, Tablet, and Desktop */}
      <div
        id="navbar-search-bar-container"
        role="search"
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
        className={`flex items-center w-full transition-all duration-200 rounded-xl border cursor-text bg-gray-50/90 dark:bg-gray-800/90 ${
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md bg-white dark:bg-gray-800'
            : 'border-gray-200/90 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500/60 shadow-2xs'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (query.trim()) {
              handleSubmitSearch();
            } else {
              inputRef.current?.focus();
              setIsOpen(true);
            }
          }}
          className="pl-2.5 sm:pl-3 pr-1.5 py-2 flex items-center text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer shrink-0"
          title="Search"
          aria-label="Submit search"
        >
          <Search className="h-4 w-4 shrink-0 text-primary-500" />
        </button>

        <input
          id="navbar-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDownInInput}
          placeholder="Search solar panels, inverters..."
          className="w-full min-w-0 bg-transparent py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none cursor-text truncate"
        />

        {query ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1.5 mr-1.5 sm:mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors cursor-pointer shrink-0"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="mr-2 sm:mr-2.5 flex items-center pointer-events-none shrink-0">
            <kbd className="hidden md:inline-flex items-center rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* Responsive Dropdown Panel (Mobile, Tablet, Desktop) */}
      {isOpen && (
        <div
          ref={resultsContainerRef}
          className="fixed inset-x-2 top-16 sm:absolute sm:inset-x-auto sm:top-full sm:left-0 sm:mt-2 w-auto sm:w-[460px] md:w-[500px] lg:w-[540px] max-w-[calc(100vw-1rem)] sm:max-w-[92vw] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-2 sm:p-2.5 bg-gray-50 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800 no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const count = categoryCounts[tab.id] ?? 0;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setSelectedIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                >
                  <TabIcon className="h-3 w-3 shrink-0" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Results List or Popular/Trending */}
          <div className="max-h-[50vh] sm:max-h-[380px] overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-gray-800/60">
            {displayedResults.length > 0 ? (
              <div className="space-y-1">
                {displayedResults.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const itemImg = item.image_url || getEquipmentFallbackImage(item.category, item.title);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-950/40 ring-1 ring-primary-300 dark:ring-primary-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700">
                        <img
                          src={itemImg}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = getEquipmentFallbackImage(item.category, item.title);
                          }}
                        />
                        <span className={`absolute bottom-0 inset-x-0 text-[8px] text-center font-bold text-white py-0.2 ${
                          item.condition === 'used' ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}>
                          {item.condition === 'used' ? 'USED' : 'NEW'}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.5 rounded">
                            {item.brand || 'Solar'}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            {CATEGORIES[item.category] || item.category}
                          </span>
                          {item.capacity_kw && (
                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                              • {item.capacity_kw >= 1 ? `${item.capacity_kw} kW` : `${Math.round(item.capacity_kw * 1000)}W`}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.title}
                        </h4>

                        <div className="flex items-center justify-between mt-1 text-xs">
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3 text-primary-500 shrink-0" />
                            <span>{item.city}</span>
                          </div>
                          <span className="font-extrabold text-primary-900 dark:text-primary-300">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>

                      <div className="pl-1">
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : query.trim() ? (
              <div className="py-8 text-center">
                <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  No exact match for "{query}"
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
                  Try searching by brand (Longi, Inverex, Crown) or capacity (585W, 6kW).
                </p>
                <button
                  type="button"
                  onClick={() => handleSubmitSearch()}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 px-3 py-1.5 text-xs font-bold hover:bg-primary-100 transition-colors cursor-pointer"
                >
                  <Search className="h-3 w-3" />
                  Search all listings with "{query}"
                </button>
              </div>
            ) : (
              <div className="py-2 space-y-4">
                {/* Popular Brand Tags */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary-500" />
                    <span>Popular Solar Searches</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 px-1">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setQuery(item.brand || item.label);
                          handleSubmitSearch(item.brand || item.label, item.category);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          {CATEGORIES[item.category] || 'Solar'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Brands quick links */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 mb-2">
                    Browse Top Brands
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {['Longi', 'Inverex', 'Canadian Solar', 'Crown', 'Trina', 'Jinko', 'Huawei', 'Narada', 'Phoenix'].map(
                      (brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => {
                            setQuery(brand);
                            handleSubmitSearch(brand);
                          }}
                          className="rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                        >
                          {brand}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Actions */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-gray-400 dark:text-gray-500 font-medium text-[11px] sm:text-xs">
              Found {filteredResults.length} matching items
            </span>
            <button
              type="button"
              onClick={() => handleSubmitSearch()}
              className="flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flame,
  Layers,
  ArrowUpDown,
  Share2,
  Check
} from 'lucide-react';
import {
  getActiveDailyRates,
  MARKET_SUMMARY,
  CUSTOM_DAILY_RATES_STORAGE_KEY
} from '../data/todayPricesData';
import { getPakistanDateDetails } from '../lib/dateUtils';
import { formatPrice } from '../lib/constants';

/**
 * Standard national rate benchmark defaults for Pakistan solar market
 * Includes 550W Tier-1 panels, 585W/645W TopCon, Hybrid & On-grid Inverters (3kW to 10kW),
 * and Battery types (Lithium LiFePO4, Tall Tubular, VRLA Gel).
 */
const NATIONAL_RATE_BENCHMARKS = [
  // Solar Panels (featuring popular 550W & 585W models)
  {
    id: 'bench-panel-550w-longi',
    category: 'panel',
    brand: 'Longi Solar',
    model: 'Hi-MO 5 Tier-1 Mono PERC (550W)',
    spec: '550W Mono PERC / 21.3% Efficiency',
    unitType: 'per_watt',
    wattage: 550,
    nationalAvgRate: 38.50,
    prevRate: 39.00,
    change: -0.50,
    status: 'down',
    pricePerWatt: 'Rs 38.50 / W',
    fullPiecePrice: 21175,
    badge: 'National Benchmark 550W',
    warranty: '12 Yrs Product / 25 Yrs Linear',
    cities: {
      lahore: 38.25,
      karachi: 38.00,
      islamabad: 38.75,
      rawalpindi: 38.75,
      multan: 38.80,
      faisalabad: 38.50,
      peshawar: 39.00
    },
    popular: true
  },
  {
    id: 'bench-panel-550w-jinko',
    category: 'panel',
    brand: 'Jinko Solar',
    model: 'Tiger Pro 72HC Bifacial (550W)',
    spec: '550W Dual-Glass Bifacial / 21.5%',
    unitType: 'per_watt',
    wattage: 550,
    nationalAvgRate: 39.00,
    prevRate: 39.50,
    change: -0.50,
    status: 'down',
    pricePerWatt: 'Rs 39.00 / W',
    fullPiecePrice: 21450,
    badge: '550W Bifacial Ready Stock',
    warranty: '12 Yrs Product / 30 Yrs Power',
    cities: {
      lahore: 38.75,
      karachi: 38.50,
      islamabad: 39.25,
      rawalpindi: 39.25,
      multan: 39.30,
      faisalabad: 39.00,
      peshawar: 39.50
    },
    popular: true
  },
  {
    id: 'bench-panel-550w-canadian',
    category: 'panel',
    brand: 'Canadian Solar',
    model: 'HiKu6 Mono PERC (550W)',
    spec: '550W High Power Dual Cell',
    unitType: 'per_watt',
    wattage: 550,
    nationalAvgRate: 39.25,
    prevRate: 39.25,
    change: 0.00,
    status: 'stable',
    pricePerWatt: 'Rs 39.25 / W',
    fullPiecePrice: 21588,
    badge: 'Standard 550W Plate',
    warranty: '12 Yrs Product / 25 Yrs Linear',
    cities: {
      lahore: 39.00,
      karachi: 38.75,
      islamabad: 39.50,
      rawalpindi: 39.50,
      multan: 39.50,
      faisalabad: 39.25,
      peshawar: 39.80
    },
    popular: false
  },
  {
    id: 'bench-panel-585w-jinko',
    category: 'panel',
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-Type TOPCon (585W)',
    spec: '585W N-Type SMBB / 22.65% Eff',
    unitType: 'per_watt',
    wattage: 585,
    nationalAvgRate: 40.00,
    prevRate: 41.25,
    change: -1.25,
    status: 'down',
    pricePerWatt: 'Rs 40.00 / W',
    fullPiecePrice: 23400,
    badge: 'Most In-Demand 585W',
    warranty: '12 Yrs Product / 30 Yrs Power',
    cities: {
      lahore: 39.80,
      karachi: 39.50,
      islamabad: 40.00,
      rawalpindi: 40.00,
      multan: 40.25,
      faisalabad: 40.00,
      peshawar: 40.50
    },
    popular: true
  },
  {
    id: 'bench-panel-645w-longi',
    category: 'panel',
    brand: 'Longi Solar',
    model: 'Hi-MO X10 HPBC 2.0 Bifacial (645W)',
    spec: '645W HPBC 2.0 Anti-Dust Glass',
    unitType: 'per_watt',
    wattage: 645,
    nationalAvgRate: 43.50,
    prevRate: 43.25,
    change: 0.25,
    status: 'up',
    pricePerWatt: 'Rs 43.50 / W',
    fullPiecePrice: 28058,
    badge: 'Premium Flagship 645W',
    warranty: '15 Yrs Product / 30 Yrs Linear',
    cities: {
      lahore: 43.25,
      karachi: 43.00,
      islamabad: 43.50,
      rawalpindi: 43.50,
      multan: 43.75,
      faisalabad: 43.50,
      peshawar: 44.00
    },
    popular: true
  },

  // Inverters (Hybrid & On-Grid across popular capacities)
  {
    id: 'bench-inv-3kw-itel',
    category: 'inverter',
    brand: 'Itel Solar',
    model: '3KW Pro PV-4500 Hybrid IP54',
    spec: '3.0 kW Hybrid / Single Source / 4500W PV',
    unitType: 'unit',
    nationalAvgRate: 78000,
    prevRate: 78000,
    change: 0,
    status: 'stable',
    badge: 'Best Value 3kW',
    warranty: '3-Year Replacement Warranty',
    cities: {
      lahore: 77500,
      karachi: 76500,
      islamabad: 78000,
      rawalpindi: 78000,
      multan: 78500,
      faisalabad: 78000,
      peshawar: 79000
    },
    popular: true
  },
  {
    id: 'bench-inv-6kw-inverex',
    category: 'inverter',
    brand: 'Inverex',
    model: 'Nitrox 6kW Single Phase 48V Hybrid',
    spec: '6.0 kW Dual MPPT / IP65 / 48V Battery',
    unitType: 'unit',
    nationalAvgRate: 266000,
    prevRate: 266000,
    change: 0,
    status: 'stable',
    badge: 'Top Selling 6kW Hybrid',
    warranty: '5 Years Replacement Warranty',
    cities: {
      lahore: 265000,
      karachi: 263000,
      islamabad: 266000,
      rawalpindi: 266000,
      multan: 268000,
      faisalabad: 266000,
      peshawar: 269000
    },
    popular: true
  },
  {
    id: 'bench-inv-6kw-knox',
    category: 'inverter',
    brand: 'Knox Solar',
    model: 'Krypton 6kW Hybrid IP65 (48V)',
    spec: '6.0 kW Hybrid / Smart Wi-Fi / IP65',
    unitType: 'unit',
    nationalAvgRate: 186000,
    prevRate: 186000,
    change: 0,
    status: 'stable',
    badge: 'Budget 6kW Hybrid',
    warranty: '5 Years Standard Warranty',
    cities: {
      lahore: 185000,
      karachi: 184000,
      islamabad: 186000,
      rawalpindi: 186000,
      multan: 187000,
      faisalabad: 186000,
      peshawar: 188000
    },
    popular: false
  },
  {
    id: 'bench-inv-10kw-ongrid-growatt',
    category: 'inverter',
    brand: 'Growatt',
    model: 'MOD 10KTL3-X (10kW 3-Phase On-Grid)',
    spec: '10.0 kW Three-Phase / Net-Metering Approved',
    unitType: 'unit',
    nationalAvgRate: 174000,
    prevRate: 174000,
    change: 0,
    status: 'stable',
    badge: 'Net Metering Certified',
    warranty: '5 Years Extendable Warranty',
    cities: {
      lahore: 173000,
      karachi: 171000,
      islamabad: 174000,
      rawalpindi: 174000,
      multan: 175000,
      faisalabad: 174000,
      peshawar: 176000
    },
    popular: true
  },
  {
    id: 'bench-inv-10kw-inverex',
    category: 'inverter',
    brand: 'Inverex',
    model: 'Nitrox 10kW Three Phase Hybrid',
    spec: '10.0 kW 3-Phase Hybrid / High Voltage / IP65',
    unitType: 'unit',
    nationalAvgRate: 465000,
    prevRate: 460000,
    change: 5000,
    status: 'up',
    badge: '1 Kanal Home Benchmark',
    warranty: '5 Years Replacement Warranty',
    cities: {
      lahore: 462000,
      karachi: 459000,
      islamabad: 465000,
      rawalpindi: 465000,
      multan: 467000,
      faisalabad: 464000,
      peshawar: 468000
    },
    popular: true
  },

  // Battery Types (Lithium LiFePO4, Tall Tubular & Gel)
  {
    id: 'bench-bat-lifepo4-5kwh-narada',
    category: 'battery',
    brand: 'Narada',
    model: 'NPFC100 Lithium LiFePO4 (48V 100Ah)',
    spec: '48V 100Ah / 5.12 kWh / 6,000 Cycles @ 80% DoD',
    batteryType: 'Lithium (LiFePO4)',
    unitType: 'unit',
    nationalAvgRate: 238500,
    prevRate: 238500,
    change: 0,
    status: 'stable',
    badge: 'Top Lithium 5.12kWh',
    warranty: '5 Years Official Warranty',
    cities: {
      lahore: 237000,
      karachi: 235000,
      islamabad: 238500,
      rawalpindi: 238500,
      multan: 240000,
      faisalabad: 238000,
      peshawar: 241000
    },
    popular: true
  },
  {
    id: 'bench-bat-lifepo4-itel-51v',
    category: 'battery',
    brand: 'Itel Solar',
    model: 'Itel IP-20 Lithium 51V 100Ah (5.12 kWh)',
    spec: '51.2V 100Ah / Smart BMS / Wall & Rack Mount',
    batteryType: 'Lithium (LiFePO4)',
    unitType: 'unit',
    nationalAvgRate: 220000,
    prevRate: 220000,
    change: 0,
    status: 'stable',
    badge: 'Most Affordable 5kWh Lithium',
    warranty: '5-Year Replacement Warranty',
    cities: {
      lahore: 219000,
      karachi: 217000,
      islamabad: 220000,
      rawalpindi: 220000,
      multan: 222000,
      faisalabad: 220000,
      peshawar: 223000
    },
    popular: true
  },
  {
    id: 'bench-bat-tubular-phoenix-2500',
    category: 'battery',
    brand: 'Phoenix',
    model: 'TX 2500 Tall Tubular Deep Cycle (230Ah)',
    spec: '12V 230Ah (27 Heavy Plates) / Solar Cycle',
    batteryType: 'Tall Tubular (Lead-Acid)',
    unitType: 'unit',
    nationalAvgRate: 51500,
    prevRate: 50000,
    change: 1500,
    status: 'up',
    badge: 'Pakistan #1 Tall Tubular',
    warranty: '1 Year Free Replacement',
    cities: {
      lahore: 51000,
      karachi: 50500,
      islamabad: 51500,
      rawalpindi: 51500,
      multan: 52000,
      faisalabad: 51200,
      peshawar: 52500
    },
    popular: true
  },
  {
    id: 'bench-bat-tubular-osaka-1800',
    category: 'battery',
    brand: 'Osaka',
    model: 'Osaka Pro 1800 Tubular (185Ah)',
    spec: '12V 185Ah (21 Plates) / Deep Discharge',
    batteryType: 'Tall Tubular (Lead-Acid)',
    unitType: 'unit',
    nationalAvgRate: 45000,
    prevRate: 45000,
    change: 0,
    status: 'stable',
    badge: 'Reliable Tubular Backup',
    warranty: '1 Year Manufacturer Warranty',
    cities: {
      lahore: 44500,
      karachi: 44000,
      islamabad: 45000,
      rawalpindi: 45000,
      multan: 45500,
      faisalabad: 44800,
      peshawar: 45800
    },
    popular: false
  },
  {
    id: 'bench-bat-gel-narada-200ah',
    category: 'battery',
    brand: 'Narada',
    model: 'AcmeG Polymer VRLA Sealed Gel (200Ah)',
    spec: '12V 200Ah Sealed Gel / Zero Fumes / Indoor Safe',
    batteryType: 'VRLA Polymer Gel',
    unitType: 'unit',
    nationalAvgRate: 75500,
    prevRate: 76500,
    change: -1000,
    status: 'down',
    badge: 'Zero Maintenance Gel',
    warranty: '2 Years Official Warranty',
    cities: {
      lahore: 75000,
      karachi: 74000,
      islamabad: 75500,
      rawalpindi: 75500,
      multan: 76000,
      faisalabad: 75200,
      peshawar: 76500
    },
    popular: false
  }
];

const MAJOR_CITIES = [
  { id: 'all', name: 'National Avg' },
  { id: 'lahore', name: 'Lahore (Hall Rd)' },
  { id: 'karachi', name: 'Karachi (Saddar)' },
  { id: 'islamabad', name: 'Islamabad (I-9 / Blue Area)' },
  { id: 'rawalpindi', name: 'Rawalpindi (College Rd)' },
  { id: 'faisalabad', name: 'Faisalabad' },
  { id: 'multan', name: 'Multan' },
  { id: 'peshawar', name: 'Peshawar' },
];

export default function DailyMarketRates({ onNavigate, onSelectCategory, compact = false }) {
  const [ratesData, setRatesData] = useState(NATIONAL_RATE_BENCHMARKS);
  const [isTableExpanded, setIsTableExpanded] = useState(!compact);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'panel' | 'inverter' | 'battery'
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [panelWattFilter, setPanelWattFilter] = useState('all'); // 'all' | '550w' | '585w' | '645w'
  const [batteryTypeFilter, setBatteryTypeFilter] = useState('all'); // 'all' | 'lithium' | 'tubular' | 'gel'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Dynamic Pakistan Standard Time details
  const pktDate = useMemo(() => getPakistanDateDetails(), []);

  // Sync data with latest live verified rates on mount and listen to admin updates
  useEffect(() => {
    fetchLatestNationalRates();

    const handleRatesUpdate = () => {
      fetchLatestNationalRates();
    };

    window.addEventListener('sellsolar_daily_rates_updated', handleRatesUpdate);
    return () => {
      window.removeEventListener('sellsolar_daily_rates_updated', handleRatesUpdate);
    };
  }, []);

  const fetchLatestNationalRates = () => {
    setIsRefreshing(true);
    try {
      const activeSheet = getActiveDailyRates(pktDate.shortDate || '16-Sep-2026');

      // Update benchmark rates with any live admin adjustments
      const updated = NATIONAL_RATE_BENCHMARKS.map((item) => {
        if (item.category === 'panel') {
          const match = (activeSheet.rates || []).find(
            (r) => r.brand?.toLowerCase() === item.brand?.toLowerCase() && r.model?.includes(String(item.wattage))
          );
          if (match && typeof match.rate === 'number') {
            const diff = match.rate - (match.prevRate || match.rate);
            return {
              ...item,
              nationalAvgRate: match.rate,
              prevRate: match.prevRate || item.prevRate,
              change: diff,
              status: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
              fullPiecePrice: Math.round(match.rate * (item.wattage || 550)),
              pricePerWatt: `Rs ${match.rate.toFixed(2)} / W`,
            };
          }
        } else if (item.category === 'inverter') {
          const match = (activeSheet.inverterRates || []).find(
            (r) => r.brand?.toLowerCase() === item.brand?.toLowerCase() && r.model?.toLowerCase().includes(item.model?.toLowerCase().slice(0, 10))
          );
          if (match && typeof match.rate === 'number') {
            const diff = match.rate - (match.prevRate || match.rate);
            return {
              ...item,
              nationalAvgRate: match.rate,
              prevRate: match.prevRate || item.prevRate,
              change: diff,
              status: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
            };
          }
        } else if (item.category === 'battery') {
          const match = (activeSheet.batteryRates || []).find(
            (r) => r.brand?.toLowerCase() === item.brand?.toLowerCase() && r.model?.toLowerCase().includes(item.model?.toLowerCase().slice(0, 10))
          );
          if (match && typeof match.rate === 'number') {
            const diff = match.rate - (match.prevRate || match.rate);
            return {
              ...item,
              nationalAvgRate: match.rate,
              prevRate: match.prevRate || item.prevRate,
              change: diff,
              status: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
            };
          }
        }
        return item;
      });

      setRatesData(updated);
      setLastSyncedTime(new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to sync latest national rates:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 450);
    }
  };

  // Filtered rate items
  const filteredRates = useMemo(() => {
    return ratesData.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Panel wattage specific sub-filter
      if (item.category === 'panel' && panelWattFilter !== 'all') {
        if (panelWattFilter === '550w' && item.wattage !== 550) return false;
        if (panelWattFilter === '585w' && item.wattage !== 585) return false;
        if (panelWattFilter === '645w' && item.wattage !== 645) return false;
      }

      // Battery type specific sub-filter
      if (item.category === 'battery' && batteryTypeFilter !== 'all') {
        if (batteryTypeFilter === 'lithium' && !item.batteryType?.toLowerCase().includes('lithium')) return false;
        if (batteryTypeFilter === 'tubular' && !item.batteryType?.toLowerCase().includes('tubular')) return false;
        if (batteryTypeFilter === 'gel' && !item.batteryType?.toLowerCase().includes('gel')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchModel = item.model.toLowerCase().includes(q);
        const matchSpec = item.spec.toLowerCase().includes(q);
        const matchBadge = item.badge?.toLowerCase().includes(q);
        if (!matchBrand && !matchModel && !matchSpec && !matchBadge) return false;
      }

      return true;
    });
  }, [ratesData, selectedCategory, panelWattFilter, batteryTypeFilter, searchQuery]);

  // Key quick stats calculated directly from verified data
  const stats = useMemo(() => {
    const panels550 = ratesData.filter((i) => i.category === 'panel' && i.wattage === 550);
    const avg550Rate = panels550.length
      ? (panels550.reduce((acc, curr) => acc + curr.nationalAvgRate, 0) / panels550.length).toFixed(2)
      : '38.90';

    const inverters = ratesData.filter((i) => i.category === 'inverter');
    const minInv = inverters.length ? Math.min(...inverters.map((i) => i.nationalAvgRate)) : 78000;
    const maxInv = inverters.length ? Math.max(...inverters.map((i) => i.nationalAvgRate)) : 465000;

    const lithium = ratesData.find((i) => i.category === 'battery' && i.batteryType?.includes('Lithium'));
    const tubular = ratesData.find((i) => i.category === 'battery' && i.batteryType?.includes('Tubular'));

    return {
      avg550Rate,
      invRange: `Rs ${(minInv / 1000).toFixed(0)}k – ${(maxInv / 1000).toFixed(0)}k`,
      lithium5kWh: lithium ? `Rs ${(lithium.nationalAvgRate / 1000).toFixed(0)}k` : 'Rs 220k',
      tubular230Ah: tubular ? `Rs ${(tubular.nationalAvgRate / 1000).toFixed(0)}k` : 'Rs 51.5k',
    };
  }, [ratesData]);

  const handleShareRate = (item) => {
    const text = `SellSolar Pakistan Daily Market Rate (${pktDate.todayStr}):\n${item.brand} - ${item.model}\nRate: ${
      item.unitType === 'per_watt' ? `Rs ${item.nationalAvgRate.toFixed(2)}/W (Approx Rs ${item.fullPiecePrice.toLocaleString('en-PK')} per piece)` : `Rs ${item.nationalAvgRate.toLocaleString('en-PK')}`
    }\nStatus: ${item.status.toUpperCase()}\nVerified ready stock: https://sellsolar.pk/prices`;

    if (navigator.share) {
      navigator.share({ title: `SellSolar Rate - ${item.model}`, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getEffectiveRate = (item) => {
    if (selectedCity === 'all' || !item.cities || !item.cities[selectedCity]) {
      return item.nationalAvgRate;
    }
    return item.cities[selectedCity];
  };

  return (
    <section id="daily-market-rates" className={`w-full ${compact ? 'py-2' : 'py-6 sm:py-8'}`}>
      <div className="container-page">
        {/* Main Card Wrapper */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md overflow-hidden transition-all">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-amber-500/10 via-primary-500/5 to-transparent p-4 sm:p-6 border-b border-gray-200/80 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    Daily Market Rates Feed
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Verified Ready Stock Rates
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {pktDate.todayStr}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  National Solar Equipment Market Rates
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                  Daily wholesale trade benchmarks for standard 550W Tier-1 panels, hybrid inverters, and lithium/tubular battery types across Pakistan.
                </p>
              </div>

              {/* Action Buttons & Sync */}
              <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
                <button
                  type="button"
                  id="refresh-national-rates-btn"
                  onClick={fetchLatestNationalRates}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer disabled:opacity-60"
                  title="Re-fetch latest rates from market feed"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
                  <span>{isRefreshing ? 'Updating Rates...' : 'Refresh Feed'}</span>
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('prices')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <span>Full Rates Sheet</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick KPI Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-5">
              <div className="rounded-xl p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                  <Sun className="h-3.5 w-3.5" />
                  <span>550W Panel Benchmark</span>
                </div>
                <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-1">
                  Rs {stats.avg550Rate} <span className="text-xs font-medium text-gray-500">/ Watt</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Approx Rs 21.2k / piece
                </div>
              </div>

              <div className="rounded-xl p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-400">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Inverter Range</span>
                </div>
                <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-1">
                  {stats.invRange}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  3kW Pro up to 10kW 3P
                </div>
              </div>

              <div className="rounded-xl p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  <BatteryCharging className="h-3.5 w-3.5" />
                  <span>LiFePO4 Lithium (5kWh)</span>
                </div>
                <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-1">
                  {stats.lithium5kWh}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  51.2V 100Ah (6000 cycles)
                </div>
              </div>

              <div className="rounded-xl p-3 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Tall Tubular (230Ah)</span>
                </div>
                <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-1">
                  {stats.tubular230Ah}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  TX 2500 27-Plates Deep Cycle
                </div>
              </div>
            </div>
          </div>

          {/* In Compact Mode (Homepage), if not expanded, show a sleek 4-row benchmark snapshot and 1-click expand bar */}
          {compact && !isTableExpanded ? (
            <div className="p-4 sm:p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Live Today's Benchmark Snapshot
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    (Wholesale averages across Lahore, Karachi &amp; Rawalpindi)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTableExpanded(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 transition-all cursor-pointer"
                  >
                    <span>Expand Full Sheet ({ratesData.length}+ Models)</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('prices')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                    >
                      <span>Full Page</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Compact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {ratesData.slice(0, 4).map((bench) => (
                  <div
                    key={bench.id}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/60 hover:border-primary-400 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {bench.brand}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {bench.spec || bench.model}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
                        {bench.pricePerWatt || `Rs ${bench.nationalAvgRate?.toLocaleString()}`}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Ready Stock
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {compact && (
                <div className="px-4 py-2 bg-primary-50/50 dark:bg-primary-950/30 border-b border-primary-100 dark:border-primary-900/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                    Showing Complete 30+ Model National Rates
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTableExpanded(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600"
                  >
                    <span>Collapse to Snapshot</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {/* Filtering and Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-850/50 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                id="market-rate-filter-all"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                All Components
              </button>

              <button
                type="button"
                id="market-rate-filter-panel"
                onClick={() => {
                  setSelectedCategory('panel');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'panel'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Solar Panels (550W+)</span>
              </button>

              <button
                type="button"
                id="market-rate-filter-inverter"
                onClick={() => {
                  setSelectedCategory('inverter');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'inverter'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Inverters</span>
              </button>

              <button
                type="button"
                id="market-rate-filter-battery"
                onClick={() => {
                  setSelectedCategory('battery');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'battery'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                <BatteryCharging className="h-3.5 w-3.5" />
                <span>Battery Types</span>
              </button>
            </div>

            {/* City Selector & Search */}
            <div className="flex items-center gap-2.5">
              {/* City Filter */}
              <div className="relative shrink-0">
                <select
                  id="market-rate-city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="pl-7 pr-7 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none"
                >
                  {MAJOR_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <MapPin className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-2 pointer-events-none" />
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Filter brand or spec..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-2" />
              </div>
            </div>
          </div>

          {/* Sub-filters for Panels & Batteries */}
          {selectedCategory === 'panel' && (
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-amber-50/30 dark:bg-amber-950/10 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-semibold text-gray-500 dark:text-gray-400 shrink-0">Wattage:</span>
              <button
                type="button"
                onClick={() => setPanelWattFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  panelWattFilter === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                All Wattages
              </button>
              <button
                type="button"
                onClick={() => setPanelWattFilter('550w')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  panelWattFilter === '550w'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                550W (Standard National Benchmark)
              </button>
              <button
                type="button"
                onClick={() => setPanelWattFilter('585w')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  panelWattFilter === '585w'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                585W (Tiger Neo / N-Type)
              </button>
              <button
                type="button"
                onClick={() => setPanelWattFilter('645w')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  panelWattFilter === '645w'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                645W (Hi-MO X10)
              </button>
            </div>
          )}

          {selectedCategory === 'battery' && (
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-emerald-50/30 dark:bg-emerald-950/10 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-semibold text-gray-500 dark:text-gray-400 shrink-0">Battery Chemistry:</span>
              <button
                type="button"
                onClick={() => setBatteryTypeFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  batteryTypeFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                All Chemistries
              </button>
              <button
                type="button"
                onClick={() => setBatteryTypeFilter('lithium')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  batteryTypeFilter === 'lithium'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Lithium (LiFePO4) 48V/51V
              </button>
              <button
                type="button"
                onClick={() => setBatteryTypeFilter('tubular')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  batteryTypeFilter === 'tubular'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Tall Tubular (Lead-Acid)
              </button>
              <button
                type="button"
                onClick={() => setBatteryTypeFilter('gel')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  batteryTypeFilter === 'gel'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Polymer VRLA Gel
              </button>
            </div>
          )}

          {/* Rates Table / List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850/80 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Component & Specification</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">
                    {selectedCity === 'all' ? 'National Average Rate' : `${MAJOR_CITIES.find(c => c.id === selectedCity)?.name} Rate`}
                  </th>
                  <th className="py-3 px-3">Estimated Piece / Unit Cost</th>
                  <th className="py-3 px-3">Daily Movement</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No rates found matching "{searchQuery}". Try clearing filters.
                    </td>
                  </tr>
                ) : (
                  filteredRates.map((item) => {
                    const effectiveRate = getEffectiveRate(item);
                    const isDown = item.status === 'down';
                    const isUp = item.status === 'up';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-amber-50/40 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        {/* Component Spec */}
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 text-gray-600 dark:text-gray-300">
                              {item.category === 'panel' ? (
                                <Sun className="h-4 w-4 text-amber-500" />
                              ) : item.category === 'inverter' ? (
                                <Zap className="h-4 w-4 text-blue-500" />
                              ) : (
                                <BatteryCharging className="h-4 w-4 text-emerald-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                  {item.brand}
                                </span>
                                {item.badge && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-800 dark:text-gray-200 font-medium text-xs mt-0.5">
                                {item.model}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.spec}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category Tag */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                              item.category === 'panel'
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50'
                                : item.category === 'inverter'
                                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/50'
                                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50'
                            }`}
                          >
                            {item.category === 'panel'
                              ? `${item.wattage}W Solar Panel`
                              : item.category === 'inverter'
                              ? 'Solar Inverter'
                              : item.batteryType || 'Solar Battery'}
                          </span>
                        </td>

                        {/* Benchmark Rate */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.unitType === 'per_watt' ? (
                            <div>
                              <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                                Rs {effectiveRate.toFixed(2)}{' '}
                                <span className="text-xs font-normal text-gray-500">/ Watt</span>
                              </div>
                              {selectedCity !== 'all' && (
                                <div className="text-[10px] text-gray-400">
                                  Nat. Avg: Rs {item.nationalAvgRate.toFixed(2)}/W
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                                Rs {effectiveRate.toLocaleString('en-PK')}
                              </div>
                              {selectedCity !== 'all' && (
                                <div className="text-[10px] text-gray-400">
                                  Nat. Avg: Rs {item.nationalAvgRate.toLocaleString('en-PK')}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Estimated Piece / Unit Cost */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.unitType === 'per_watt' ? (
                            <div>
                              <div className="font-bold text-gray-900 dark:text-gray-100">
                                Rs {Math.round(effectiveRate * item.wattage).toLocaleString('en-PK')}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                Per {item.wattage}W single plate
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-gray-900 dark:text-gray-100">
                                Complete Unit
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {item.warranty || 'Warranty included'}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Daily Movement */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isDown ? (
                            <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                              <TrendingDown className="h-3 w-3" />
                              <span>
                                {item.unitType === 'per_watt'
                                  ? `-Rs ${Math.abs(item.change).toFixed(2)}`
                                  : `-Rs ${Math.abs(item.change).toLocaleString('en-PK')}`}
                              </span>
                            </div>
                          ) : isUp ? (
                            <div className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">
                              <TrendingUp className="h-3 w-3" />
                              <span>
                                {item.unitType === 'per_watt'
                                  ? `+Rs ${item.change.toFixed(2)}`
                                  : `+Rs ${item.change.toLocaleString('en-PK')}`}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              <Minus className="h-3 w-3" />
                              <span>Stable</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleShareRate(item)}
                              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer"
                              title="Share Rate or Copy details"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Share2 className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {onSelectCategory && (
                              <button
                                type="button"
                                onClick={() => onSelectCategory(item.category)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                              >
                                View Ads
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer note with disclaimer & last update info */}
          <div className="p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-850/80 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Live verified wholesale trade benchmark — Sourced from Hall Road Lahore, College Road Rawalpindi, and Karachi Regal.
              </span>
            </div>
            {lastSyncedTime && (
              <span className="text-[11px] text-gray-400">
                Last checked: {lastSyncedTime} PKT
              </span>
            )}
          </div>
          </>
          )}

        </div>
      </div>
    </section>
  );
}

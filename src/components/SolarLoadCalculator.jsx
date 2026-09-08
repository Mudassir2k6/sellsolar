import React, { useState, useMemo, useRef } from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Share2,
  Check,
  Wind,
  Tv,
  Lightbulb,
  Fan,
  Sparkles,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sliders,
  Award,
  BarChart3
} from 'lucide-react';
import {
  APPLIANCE_CATEGORIES,
  DEFAULT_APPLIANCES,
  LOAD_PRESETS,
  PAKISTAN_SOLAR_PARAMS
} from '../data/solarCalculatorData';
import { formatPrice } from '../lib/constants';

function CategoryApplianceIcon({ name, className = 'h-4 w-4' }) {
  switch (name) {
    case 'Fan':
      return <Fan className={className} />;
    case 'Lightbulb':
      return <Lightbulb className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    default:
      return <Zap className={className} />;
  }
}

/**
 * SolarLoadCalculator Component
 * Allows users to input their home appliances and wattage to estimate required solar system capacity in kW.
 * 
 * Props:
 * - onNavigate: (page: string) => void
 * - onSelectCategory: (cat: string) => void
 * - compact: boolean (when true, optimized for home page or embedded widgets)
 * - showHeroBanner: boolean (whether to render the top title/hero)
 * - className: string
 */
export default function SolarLoadCalculator({
  onNavigate,
  onSelectCategory,
  compact = false,
  showHeroBanner = true,
  className = ''
}) {
  // Appliances state map: id -> { quantity, watts, dayHours, nightHours, ... }
  const [applianceState, setApplianceState] = useState(() => {
    const initial = {};
    DEFAULT_APPLIANCES.forEach((app) => {
      initial[app.id] = {
        id: app.id,
        name: app.name,
        category: app.category,
        categoryLabel: app.categoryLabel,
        quantity: app.defaultQuantity,
        watts: app.defaultWatts,
        wattOptions: app.wattOptions || [app.defaultWatts],
        dayHours: app.dayHours,
        nightHours: app.nightHours,
        surgeMultiplier: app.surgeMultiplier || 1.2,
        icon: app.icon,
        hint: app.hint
      };
    });
    return initial;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [activePreset, setActivePreset] = useState('medium_home');
  const [customAppliances, setCustomAppliances] = useState([]);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Custom appliance input state
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState(300);
  const [customQty, setCustomQty] = useState(1);
  const [customCategory, setCustomCategory] = useState('motors');
  const [customDayHours, setCustomDayHours] = useState(4);
  const [customNightHours, setCustomNightHours] = useState(2);

  // Calculation parameters
  const [panelWattage, setPanelWattage] = useState(585); // standard 585W TOPCon
  const [electricityTariff, setElectricityTariff] = useState(60); // PKR / unit
  const [citySunHours, setCitySunHours] = useState(5.0); // Pakistan sun hours
  const [copied, setCopied] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);

  // Apply Preset
  const handleApplyPreset = (presetId) => {
    setActivePreset(presetId);
    const preset = LOAD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setApplianceState((prev) => {
      const next = {};
      DEFAULT_APPLIANCES.forEach((app) => {
        const presetVal = preset.appliances[app.id];
        if (presetVal) {
          next[app.id] = {
            ...prev[app.id],
            quantity: presetVal.quantity,
            watts: presetVal.watts ?? prev[app.id].watts,
            dayHours: presetVal.dayHours ?? prev[app.id].dayHours,
            nightHours: presetVal.nightHours ?? prev[app.id].nightHours
          };
        } else {
          next[app.id] = {
            ...prev[app.id],
            quantity: 0
          };
        }
      });
      return next;
    });
  };

  // Update appliance quantity
  const handleQuantityChange = (id, delta) => {
    setActivePreset('');
    setApplianceState((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const newQty = Math.max(0, current.quantity + delta);
      return {
        ...prev,
        [id]: { ...current, quantity: newQty }
      };
    });
  };

  // Directly set appliance quantity
  const handleSetQuantity = (id, val) => {
    setActivePreset('');
    const num = Math.max(0, parseInt(val, 10) || 0);
    setApplianceState((prev) => ({
      ...prev,
      [id]: { ...prev[id], quantity: num }
    }));
  };

  // Directly set appliance wattage
  const handleWattageChange = (id, watts) => {
    setActivePreset('');
    const num = Math.max(1, parseInt(watts, 10) || 1);
    setApplianceState((prev) => ({
      ...prev,
      [id]: { ...prev[id], watts: num }
    }));
  };

  // Add custom appliance
  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newId = `custom_${Date.now()}`;
    const newApp = {
      id: newId,
      name: customName.trim(),
      category: customCategory,
      categoryLabel: 'Custom',
      quantity: Math.max(1, parseInt(customQty, 10) || 1),
      watts: Math.max(1, parseInt(customWatts, 10) || 100),
      wattOptions: [customWatts],
      dayHours: Number(customDayHours) || 2,
      nightHours: Number(customNightHours) || 1,
      surgeMultiplier: 1.5,
      icon: 'Zap',
      hint: 'Custom household appliance'
    };
    setCustomAppliances((prev) => [...prev, newApp]);
    setCustomName('');
    setCustomWatts(300);
    setCustomQty(1);
    setShowAddCustom(false);
    setActivePreset('');
  };

  // Remove custom appliance
  const handleRemoveCustom = (id) => {
    setCustomAppliances((prev) => prev.filter((a) => a.id !== id));
    setActivePreset('');
  };

  // Update custom appliance qty
  const handleCustomQtyChange = (id, delta) => {
    setActivePreset('');
    setCustomAppliances((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          return { ...app, quantity: Math.max(0, app.quantity + delta) };
        }
        return app;
      })
    );
  };

  // Clear all
  const handleResetAll = () => {
    setActivePreset('');
    setCustomAppliances([]);
    setApplianceState((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        next[k] = { ...prev[k], quantity: 0 };
      });
      return next;
    });
  };

  // Active items list
  const activeItems = useMemo(() => {
    const list = [];
    Object.values(applianceState).forEach((item) => {
      if (item.quantity > 0) list.push(item);
    });
    customAppliances.forEach((item) => {
      if (item.quantity > 0) list.push(item);
    });
    return list;
  }, [applianceState, customAppliances]);

  // Sizing Calculations
  const sizing = useMemo(() => {
    let totalRunningWatts = 0;
    let totalSurgeWatts = 0;
    let totalDayWh = 0;
    let totalNightWh = 0;

    const breakdownByCat = {
      fans: 0,
      lights: 0,
      cooling: 0,
      kitchen: 0,
      motors: 0,
      electronics: 0
    };

    activeItems.forEach((item) => {
      const running = item.quantity * item.watts;
      const surge = item.quantity * item.watts * (item.surgeMultiplier || 1.2);
      const dayWh = item.quantity * item.watts * (item.dayHours || 0);
      const nightWh = item.quantity * item.watts * (item.nightHours || 0);

      totalRunningWatts += running;
      totalSurgeWatts += surge;
      totalDayWh += dayWh;
      totalNightWh += nightWh;

      const catKey = breakdownByCat[item.category] !== undefined ? item.category : 'motors';
      breakdownByCat[catKey] += running;
    });

    const totalDailyKwh = (totalDayWh + totalNightWh) / 1000;
    const dayKwh = totalDayWh / 1000;
    const nightKwh = totalNightWh / 1000;
    const monthlyUnits = Math.round(totalDailyKwh * 30);
    const estimatedMonthlyBill = Math.round(monthlyUnits * electricityTariff);

    // Solar system sizing
    // Derate factor (dust, temperature, inverter conversion) = 0.78
    const derateFactor = PAKISTAN_SOLAR_PARAMS.systemDerateFactor || 0.78;
    const effectiveSunHours = citySunHours * derateFactor;
    const calculatedKw = totalDailyKwh > 0 ? totalDailyKwh / effectiveSunHours : 0;

    // Minimum Inverter rating based on running load + 25% continuous headroom
    const inverterHeadroom = 1.25;
    const loadBasedInverterKw = (totalRunningWatts * inverterHeadroom) / 1000;

    // Match with realistic Pakistan standard inverter / solar tier:
    // (1 kW, 3.2 kW, 4.2 kW, 6 kW, 8 kW, 10 kW, 12 kW, 15 kW, 20 kW, etc.)
    const rawTargetKw = Math.max(calculatedKw, loadBasedInverterKw);
    let recommendedKw = 0;

    if (rawTargetKw === 0) {
      recommendedKw = 0;
    } else if (rawTargetKw <= 1.2) {
      recommendedKw = 1.2;
    } else if (rawTargetKw <= 2.2) {
      recommendedKw = 2.2;
    } else if (rawTargetKw <= 3.2) {
      recommendedKw = 3.2;
    } else if (rawTargetKw <= 4.2) {
      recommendedKw = 4.2;
    } else if (rawTargetKw <= 6.0) {
      recommendedKw = 6.0;
    } else if (rawTargetKw <= 8.0) {
      recommendedKw = 8.0;
    } else if (rawTargetKw <= 10.0) {
      recommendedKw = 10.0;
    } else if (rawTargetKw <= 12.0) {
      recommendedKw = 12.0;
    } else if (rawTargetKw <= 15.0) {
      recommendedKw = 15.0;
    } else if (rawTargetKw <= 20.0) {
      recommendedKw = 20.0;
    } else {
      recommendedKw = Math.ceil(rawTargetKw);
    }

    // Panels count (using panelWattage, e.g. 585W)
    const requiredSolarWatts = recommendedKw * 1000;
    const numberOfPanels = recommendedKw > 0 ? Math.ceil(requiredSolarWatts / panelWattage) : 0;
    const actualPanelCapacityKw = numberOfPanels > 0 ? ((numberOfPanels * panelWattage) / 1000).toFixed(2) : 0;

    // Roof area in sq ft (approx 28 sq ft per panel)
    const roofAreaSqFt = numberOfPanels * (PAKISTAN_SOLAR_PARAMS.panelDimensionsSqFt || 28);

    // Battery Bank sizing (Lithium 85% DoD vs Tubular 50% DoD)
    const lithiumKwh = nightKwh > 0 ? (nightKwh / 0.85).toFixed(1) : '0';
    const tubularAh = nightKwh > 0 ? Math.round((nightKwh * 1000) / (48 * 0.5)) : 0; // 48V bank

    // Estimated daily generation (kWh)
    const dailyGenerationKwh = (recommendedKw * citySunHours * derateFactor).toFixed(1);

    // Estimated turnkey budget range (PKR)
    // Hybrid with Lithium: ~165k/kW, On-Grid: ~115k/kW
    const onGridCostMin = Math.round(recommendedKw * 110000);
    const onGridCostMax = Math.round(recommendedKw * 125000);
    const hybridCostMin = Math.round(recommendedKw * 155000);
    const hybridCostMax = Math.round(recommendedKw * 180000);

    return {
      totalRunningWatts,
      totalRunningKw: (totalRunningWatts / 1000).toFixed(2),
      totalSurgeWatts,
      totalSurgeKw: (totalSurgeWatts / 1000).toFixed(2),
      totalDailyKwh: totalDailyKwh.toFixed(1),
      dayKwh: dayKwh.toFixed(1),
      nightKwh: nightKwh.toFixed(1),
      monthlyUnits,
      estimatedMonthlyBill,
      recommendedKw,
      numberOfPanels,
      actualPanelCapacityKw,
      roofAreaSqFt,
      lithiumKwh,
      tubularAh,
      dailyGenerationKwh,
      onGridCostMin,
      onGridCostMax,
      hybridCostMin,
      hybridCostMax,
      breakdownByCat
    };
  }, [activeItems, citySunHours, panelWattage, electricityTariff]);

  // Copy summary to clipboard
  const handleCopySummary = () => {
    const summary = `☀️ SellSolar Pakistan - Solar Load & kW Sizing Estimation
--------------------------------------------------
Recommended System: ${sizing.recommendedKw} kW Solar System
Number of Panels: ${sizing.numberOfPanels}x (${panelWattage}W Tier-1 Panels = ${sizing.actualPanelCapacityKw} kW)
Continuous Running Load: ${sizing.totalRunningWatts.toLocaleString()} Watts (${sizing.totalRunningKw} kW)
Peak Surge Demand: ${sizing.totalSurgeWatts.toLocaleString()} Watts
Estimated Daily Units: ${sizing.totalDailyKwh} kWh/day (~${sizing.monthlyUnits} units/month)
Estimated Monthly Bill Saved: PKR ${sizing.estimatedMonthlyBill.toLocaleString()}
Recommended Lithium Battery: ~${sizing.lithiumKwh} kWh (LiFePO4)
Estimated Rooftop Area: ~${sizing.roofAreaSqFt} sq ft
Active Appliances: ${activeItems.length} items (${activeItems.map((a) => `${a.quantity}x ${a.name} [${a.watts}W]`).join(', ')})
--------------------------------------------------
Calculated at SellSolar.pk`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Filtered standard appliances
  const displayedStandardAppliances = useMemo(() => {
    return DEFAULT_APPLIANCES.filter((app) => {
      if (activeCategory === 'all') return true;
      return app.category === activeCategory;
    });
  }, [activeCategory]);

  return (
    <div id="solar-load-calculator-component" className={`w-full ${className}`}>
      {/* Optional Hero Header */}
      {showHeroBanner && (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-850 to-primary-950 p-6 sm:p-8 text-white shadow-lg border border-gray-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/20 border border-primary-400/30 px-3 py-1 text-xs font-bold text-primary-300 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                Pakistan Solar Sizing & Sizing Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Solar Load <span className="text-primary-400">Calculator</span>
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                Add your household appliances and adjust wattages to estimate your exact required solar system capacity in <strong className="text-white">kW</strong>, panel counts, inverter sizing, and estimated monthly unit savings.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-800 px-3.5 py-2 text-xs font-bold text-gray-200 shadow-xs transition-all"
                title="Copy calculation summary"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-gray-400" />}
                <span>{copied ? 'Copied!' : 'Share Summary'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-300 transition-all"
                title="Reset all loads to zero"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Quick House Presets */}
          <div className="mt-6 pt-5 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary-400" />
                1-Click Household Presets:
              </span>
              <span className="text-[11px] text-gray-400">Auto-fill typical Pakistan home loads</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LOAD_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary-400 bg-primary-500/20 shadow-xs shadow-primary-500/20 ring-1 ring-primary-400/50'
                        : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/60 hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-primary-400">
                        {preset.targetSystem.split(' ')[0]} kW
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-primary-400" />}
                    </div>
                    <p className="font-bold text-xs text-white mt-0.5 truncate">{preset.name.split(' (')[0]}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{preset.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Inputs (Left) & Results Gauge (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Appliance Inputs & Wattage Controls (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Category Tabs & Add Custom Button */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-primary-500 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Appliances
              </button>
              {APPLIANCE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-primary-500 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <CategoryApplianceIcon name={cat.icon} className="h-3 w-3" />
                  <span>{cat.name.split('&')[0].trim()}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-xs font-bold text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom</span>
            </button>
          </div>

          {/* Add Custom Appliance Collapsible Form */}
          {showAddCustom && (
            <form
              onSubmit={handleAddCustom}
              className="p-4 rounded-2xl border-2 border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/20 space-y-3 transition-all animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-primary-500" />
                  Add Custom Household Appliance
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Appliance Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Air Fryer, Treadmill, Coffee Maker"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="input-field text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Wattage (Watts) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15000"
                    required
                    value={customWatts}
                    onChange={(e) => setCustomWatts(e.target.value)}
                    className="input-field text-xs py-1.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="input-field text-xs py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Day Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="14"
                    value={customDayHours}
                    onChange={(e) => setCustomDayHours(e.target.value)}
                    className="input-field text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Night Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="14"
                    value={customNightHours}
                    onChange={(e) => setCustomNightHours(e.target.value)}
                    className="input-field text-xs py-1.5"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-2 font-bold shadow-xs"
                >
                  Add Appliance to Sizing
                </button>
              </div>
            </form>
          )}

          {/* User Added Custom Appliances List */}
          {customAppliances.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Custom Added Appliances ({customAppliances.length})
              </span>
              {customAppliances.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-primary-200 dark:border-primary-800/70 bg-primary-50/40 dark:bg-primary-950/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{app.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {app.watts} W each • Running Load: <strong className="text-gray-700 dark:text-gray-200">{app.quantity * app.watts} W</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => handleCustomQtyChange(app.id, -1)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">
                        {app.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCustomQtyChange(app.id, 1)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCustom(app.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standard Household Appliances List */}
          <div className="space-y-2.5">
            {displayedStandardAppliances.map((app) => {
              const current = applianceState[app.id] || app;
              const isTurnedOn = current.quantity > 0;
              const subtotalWatts = current.quantity * current.watts;

              return (
                <div
                  key={app.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isTurnedOn
                      ? 'border-primary-300 dark:border-primary-700/80 bg-white dark:bg-gray-900 shadow-xs'
                      : 'border-gray-200 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Appliance Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isTurnedOn
                            ? 'bg-primary-500 text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <CategoryApplianceIcon name={app.icon} className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                            {app.name}
                          </h4>
                          {isTurnedOn && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {subtotalWatts} W
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                          {app.hint}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Wattage Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      
                      {/* Wattage Input Field */}
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/70 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">W:</span>
                        <input
                          type="number"
                          min="1"
                          max="15000"
                          value={current.watts}
                          onChange={(e) => handleWattageChange(app.id, e.target.value)}
                          className="w-14 bg-transparent text-right font-bold text-xs text-gray-900 dark:text-white focus:outline-hidden"
                          title="Click to edit wattage"
                        />
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(app.id, -1)}
                          disabled={current.quantity === 0}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={current.quantity}
                          onChange={(e) => handleSetQuantity(app.id, e.target.value)}
                          className="w-9 bg-transparent text-center text-xs font-extrabold text-gray-900 dark:text-white focus:outline-hidden"
                        />

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(app.id, 1)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Wattage Preset Chips for Appliances with multiple common ratings */}
                  {app.wattOptions && app.wattOptions.length > 1 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400 font-medium">Common ratings:</span>
                      {app.wattOptions.map((optWatt) => (
                        <button
                          key={optWatt}
                          type="button"
                          onClick={() => handleWattageChange(app.id, optWatt)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                            current.watts === optWatt
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {optWatt}W
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Real-time Sizing Output Gauge & System Recommendation (5 cols on desktop) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          
          {/* Main Recommended Capacity Card */}
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-500/10 blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                <Sun className="h-3.5 w-3.5 text-primary-500" />
                Estimated Required Capacity
              </span>
              <span className="text-[11px] font-semibold text-gray-400">
                {activeItems.length} active load items
              </span>
            </div>

            {/* Prominent kW Display */}
            <div className="text-center py-4 bg-gradient-to-b from-primary-500/5 to-transparent rounded-2xl border border-primary-100 dark:border-primary-900/30">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Recommended Solar System
              </p>
              <div className="flex items-baseline justify-center gap-1.5 my-1">
                <span className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                  {sizing.recommendedKw > 0 ? sizing.recommendedKw : '0'}
                </span>
                <span className="text-2xl font-black text-primary-500">kW</span>
              </div>
              <p className="text-xs font-bold text-primary-700 dark:text-primary-300">
                {sizing.recommendedKw === 0
                  ? 'Add appliances to start calculation'
                  : sizing.recommendedKw <= 4.2
                  ? 'Single-Phase Hybrid / On-Grid'
                  : '3-Phase Hybrid / Net-Metered On-Grid'}
              </p>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">
                  Continuous Load
                </span>
                <span className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5 block">
                  {sizing.totalRunningWatts.toLocaleString()} <span className="text-xs text-gray-500">W</span>
                </span>
                <span className="text-[10px] text-gray-400">({sizing.totalRunningKw} kW running)</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">
                  Peak Surge Load
                </span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {sizing.totalSurgeWatts.toLocaleString()} <span className="text-xs text-gray-500">W</span>
                </span>
                <span className="text-[10px] text-gray-400">({sizing.totalSurgeKw} kW startup)</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">
                  Solar Panels Required
                </span>
                <span className="text-base font-extrabold text-primary-600 dark:text-primary-400 mt-0.5 block">
                  {sizing.numberOfPanels} Panels
                </span>
                <span className="text-[10px] text-gray-400">@{panelWattage}W ({sizing.actualPanelCapacityKw} kW)</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">
                  Daily Generation
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  ~{sizing.dailyGenerationKwh} kWh
                </span>
                <span className="text-[10px] text-gray-400">~{sizing.monthlyUnits} units/month</span>
              </div>
            </div>

            {/* System Breakdown Details */}
            <div className="mt-4 p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary-500" />
                  Recommended Inverter Size:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {sizing.recommendedKw > 0 ? `${sizing.recommendedKw} kW / kVA` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" />
                  Lithium Battery Backup:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {sizing.recommendedKw > 0 ? `~${sizing.lithiumKwh} kWh (LiFePO4)` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  Est. Rooftop Space:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {sizing.recommendedKw > 0 ? `~${sizing.roofAreaSqFt} sq ft` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  Estimated Monthly Savings:
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {sizing.estimatedMonthlyBill > 0 ? `PKR ${sizing.estimatedMonthlyBill.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>

            {/* Estimated Budget Sizing Box */}
            {sizing.recommendedKw > 0 && (
              <div className="mt-4 p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary-900 dark:text-primary-200">
                    Est. Turnkey System Cost (Pakistan):
                  </span>
                  <span className="text-[10px] font-semibold text-primary-700 dark:text-primary-300">
                    Market Rates
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-gray-600 dark:text-gray-300">On-Grid (Net-metered):</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(sizing.onGridCostMin)} - {formatPrice(sizing.onGridCostMax)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 text-[11px]">
                  <span className="text-gray-600 dark:text-gray-300">Hybrid (with Lithium):</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(sizing.hybridCostMin)} - {formatPrice(sizing.hybridCostMax)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions: Browse Matching Panels & Share */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory('panels');
                  } else if (onNavigate) {
                    onNavigate('home');
                  }
                }}
                className="w-full btn-primary py-3 text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <span>Find Matching {sizing.recommendedKw || '5'} kW Solar Systems</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5 text-gray-400" />}
                <span>{copied ? 'Summary Copied to Clipboard!' : 'Share Sizing Calculation'}</span>
              </button>
            </div>
          </div>

          {/* Quick Technical Assumptions Box */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
            <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Calculation Methodology
            </p>
            <p className="text-[11px] leading-relaxed">
              Standardized for Pakistan irradiance (5.0 peak sun hours/day), 78% overall system efficiency (taking dust, DC-AC wire drop, and thermal derate into account), and modern Tier-1 N-Type TOPCon {panelWattage}W bifacial panels.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

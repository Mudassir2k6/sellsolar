import React, { useState, useMemo } from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  Award,
  BarChart3,
  Flame,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Printer,
  Share2,
  Check,
  Wind,
  Tv,
  Lightbulb,
  Fan,
  Refrigerator,
  Sparkles,
  Info,
  DollarSign,
  Compass,
  ArrowUpRight,
  Sliders
} from 'lucide-react';
import {
  APPLIANCE_CATEGORIES,
  DEFAULT_APPLIANCES,
  LOAD_PRESETS,
  PAKISTAN_SOLAR_PARAMS
} from '../data/solarCalculatorData';
import { formatPrice } from '../lib/constants';

// Helper icon component
function CategoryIcon({ name, className = "h-5 w-5" }) {
  switch (name) {
    case 'Fan':
      return <Fan className={className} />;
    case 'Lightbulb':
      return <Lightbulb className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Refrigerator':
      return <Refrigerator className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Zap':
    default:
      return <Zap className={className} />;
  }
}

export default function LoadCalculatorPage({ onNavigate, onSelectCategory }) {
  // Appliances state: map from id -> { quantity, watts, dayHours, nightHours, customName, category }
  const [applianceState, setApplianceState] = useState(() => {
    const initial = {};
    DEFAULT_APPLIANCES.forEach((app) => {
      initial[app.id] = {
        id: app.id,
        name: app.name,
        category: app.category,
        quantity: app.defaultQuantity,
        watts: app.defaultWatts,
        dayHours: app.dayHours,
        nightHours: app.nightHours,
        surgeMultiplier: app.surgeMultiplier,
        icon: app.icon,
        hint: app.hint,
      };
    });
    return initial;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [activePreset, setActivePreset] = useState('medium_home');
  const [customAppliances, setCustomAppliances] = useState([]);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Custom appliance form
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomWatts, setNewCustomWatts] = useState(500);
  const [newCustomQty, setNewCustomQty] = useState(1);
  const [newCustomDayHours, setNewCustomDayHours] = useState(2);
  const [newCustomNightHours, setNewCustomNightHours] = useState(1);
  const [newCustomCategory, setNewCustomCategory] = useState('motors');

  // System Configuration Options
  const [systemType, setSystemType] = useState('hybrid'); // 'hybrid', 'ongrid', 'offgrid'
  const [batteryType, setBatteryType] = useState('lithium'); // 'lithium', 'tubular', 'none'
  const [backupHoursNight, setBackupHoursNight] = useState(5); // Night backup desired
  const [panelWattage, setPanelWattage] = useState(585); // 585W TOPCon
  const [electricityTariff, setElectricityTariff] = useState(60); // PKR / kWh
  const [citySunFactor, setCitySunFactor] = useState(5.0); // Sun peak hours

  const [copied, setCopied] = useState(false);

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
            watts: presetVal.watts,
            dayHours: presetVal.dayHours,
            nightHours: presetVal.nightHours,
          };
        } else {
          next[app.id] = {
            ...prev[app.id],
            quantity: 0,
          };
        }
      });
      return next;
    });
  };

  // Update a single standard appliance field
  const handleUpdateAppliance = (id, field, value) => {
    setActivePreset(''); // User made custom tweak
    setApplianceState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Number(value) < 0 ? 0 : Number(value),
      },
    }));
  };

  // Update custom appliance
  const handleUpdateCustomAppliance = (index, field, value) => {
    setActivePreset('');
    setCustomAppliances((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'name' ? value : Math.max(0, Number(value)),
      };
      return next;
    });
  };

  // Add custom appliance
  const handleAddCustomAppliance = (e) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;
    const customId = `custom_${Date.now()}`;
    const newApp = {
      id: customId,
      name: newCustomName.trim(),
      category: newCustomCategory,
      quantity: Number(newCustomQty) || 1,
      watts: Number(newCustomWatts) || 100,
      dayHours: Number(newCustomDayHours) || 0,
      nightHours: Number(newCustomNightHours) || 0,
      surgeMultiplier: 1.5,
      icon: 'Zap',
      hint: 'User added custom equipment',
    };
    setCustomAppliances((prev) => [...prev, newApp]);
    setNewCustomName('');
    setNewCustomWatts(500);
    setNewCustomQty(1);
    setShowAddCustom(false);
    setActivePreset('');
  };

  // Remove custom appliance
  const handleRemoveCustom = (index) => {
    setCustomAppliances((prev) => prev.filter((_, i) => i !== index));
    setActivePreset('');
  };

  // Reset all appliances to zero
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

  // Combined active appliances list
  const allActiveItems = useMemo(() => {
    const list = [];
    Object.values(applianceState).forEach((item) => {
      if (item.quantity > 0) {
        list.push(item);
      }
    });
    customAppliances.forEach((item) => {
      if (item.quantity > 0) {
        list.push(item);
      }
    });
    return list;
  }, [applianceState, customAppliances]);

  // Calculations
  const calculations = useMemo(() => {
    let totalRunningWatts = 0;
    let totalSurgeWatts = 0;
    let totalDayEnergyWh = 0;
    let totalNightEnergyWh = 0;

    const categoryBreakdown = {
      cooling: 0,
      fans: 0,
      motors: 0,
      kitchen: 0,
      lights: 0,
      electronics: 0,
    };

    allActiveItems.forEach((item) => {
      const itemRunningWatts = item.quantity * item.watts;
      const itemSurgeWatts = item.quantity * item.watts * (item.surgeMultiplier || 1.2);
      const itemDayWh = item.quantity * item.watts * (item.dayHours || 0);
      const itemNightWh = item.quantity * item.watts * (item.nightHours || 0);

      totalRunningWatts += itemRunningWatts;
      totalSurgeWatts += itemSurgeWatts;
      totalDayEnergyWh += itemDayWh;
      totalNightEnergyWh += itemNightWh;

      const cat = item.category || 'motors';
      if (categoryBreakdown[cat] !== undefined) {
        categoryBreakdown[cat] += itemRunningWatts;
      } else {
        categoryBreakdown.motors += itemRunningWatts;
      }
    });

    const totalDailyKwh = (totalDayEnergyWh + totalNightEnergyWh) / 1000;
    const dayKwh = totalDayEnergyWh / 1000;
    const nightKwh = totalNightEnergyWh / 1000;
    const monthlyUnits = Math.round(totalDailyKwh * 30);
    const estimatedMonthlyBillPk = Math.round(monthlyUnits * electricityTariff);

    // Recommended System Sizing
    // Solar generation required: Daily units / (sunHours * systemDerateFactor)
    const effectiveSunHours = citySunFactor * PAKISTAN_SOLAR_PARAMS.systemDerateFactor;
    const calculatedSystemKw = totalDailyKwh > 0 ? totalDailyKwh / effectiveSunHours : 0;

    // Minimum Inverter Size based on running load + safety headroom (25%)
    const inverterSafetyFactor = 1.25;
    const loadBasedInverterKw = (totalRunningWatts * inverterSafetyFactor) / 1000;

    // Recommend realistic market size in Pakistan:
    // (e.g., 3kW, 3.6kW, 5kW, 6kW, 8kW, 10kW, 12kW, 15kW, 20kW)
    const rawTargetKw = Math.max(calculatedSystemKw, loadBasedInverterKw);
    let recommendedKw = 0;
    if (rawTargetKw === 0) {
      recommendedKw = 0;
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

    // Number of panels (e.g. 585W)
    const totalSolarCapacityWatts = recommendedKw * 1000;
    const numberOfPanels = recommendedKw > 0 ? Math.ceil(totalSolarCapacityWatts / panelWattage) : 0;
    const totalPanelCapacityActualKw = ((numberOfPanels * panelWattage) / 1000).toFixed(2);
    const rooftopAreaSqFt = numberOfPanels * PAKISTAN_SOLAR_PARAMS.panelDimensionsSqFt;

    // Battery Bank Requirement (kWh)
    // Battery required = Night load (kWh) * DOD factor (85% lithium, 50% tubular)
    const dodLithium = 0.85;
    const dodTubular = 0.50;
    const lithiumKwhRequired = nightKwh > 0 ? (nightKwh / dodLithium).toFixed(1) : '0';
    const tubularKwhRequired = nightKwh > 0 ? (nightKwh / dodTubular).toFixed(1) : '0';

    // Approximate Turnkey Budget in PKR
    let costPerKw = PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.hybrid_lithium;
    if (systemType === 'ongrid') {
      costPerKw = PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.ongrid;
    } else if (systemType === 'hybrid') {
      costPerKw = batteryType === 'tubular' 
        ? PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.hybrid_tubular
        : batteryType === 'none'
        ? PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.ongrid
        : PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.hybrid_lithium;
    } else {
      costPerKw = PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.offgrid;
    }

    const estimatedSystemCostMin = Math.round(recommendedKw * costPerKw * 0.95);
    const estimatedSystemCostMax = Math.round(recommendedKw * costPerKw * 1.1);

    // Payback Period (years)
    const yearlySavings = estimatedMonthlyBillPk * 12;
    const paybackYears = yearlySavings > 0 ? (estimatedSystemCostMin / yearlySavings).toFixed(1) : 0;

    return {
      totalRunningWatts,
      totalRunningKw: (totalRunningWatts / 1000).toFixed(2),
      totalSurgeKva: (totalSurgeWatts / 1000).toFixed(2),
      totalDailyKwh: totalDailyKwh.toFixed(1),
      dayKwh: dayKwh.toFixed(1),
      nightKwh: nightKwh.toFixed(1),
      monthlyUnits,
      estimatedMonthlyBillPk,
      yearlySavings,
      recommendedKw,
      numberOfPanels,
      totalPanelCapacityActualKw,
      rooftopAreaSqFt,
      lithiumKwhRequired,
      tubularKwhRequired,
      estimatedSystemCostMin,
      estimatedSystemCostMax,
      paybackYears,
      categoryBreakdown,
    };
  }, [
    allActiveItems,
    citySunFactor,
    electricityTariff,
    panelWattage,
    systemType,
    batteryType,
  ]);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const summary = `☀️ *SellSolar Pakistan - Solar Load & Sizing Report* ☀️
------------------------------------------------
⚡ *Running Load:* ${calculations.totalRunningWatts} Watts (${calculations.totalRunningKw} kW)
🔄 *Surge / Starting Load:* ${calculations.totalSurgeKva} kVA
📊 *Daily Consumption:* ${calculations.totalDailyKwh} Units/Day (Day: ${calculations.dayKwh} kWh, Night: ${calculations.nightKwh} kWh)
💡 *Monthly Units:* ~${calculations.monthlyUnits} Units/Month
💰 *Estimated Monthly WAPDA Bill:* Rs ${formatPrice(calculations.estimatedMonthlyBillPk)}

🎯 *RECOMMENDED SOLAR SETUP:*
✔️ *Solar System Capacity:* ${calculations.recommendedKw} kW (${systemType.toUpperCase()})
✔️ *Solar Panels Needed:* ${calculations.numberOfPanels}x Panels (${panelWattage}W N-Type TOPCon = ${calculations.totalPanelCapacityActualKw} kW)
✔️ *Rooftop Space Required:* ~${calculations.rooftopAreaSqFt} Sq. Ft.
✔️ *Battery Bank Needed:* ${batteryType === 'lithium' ? `${calculations.lithiumKwhRequired} kWh LiFePO4 (48V)` : `${calculations.tubularKwhRequired} kWh Tubular Lead Acid`}
💵 *Estimated Turnkey Cost:* Rs ${formatPrice(calculations.estimatedSystemCostMin)} - ${formatPrice(calculations.estimatedSystemCostMax)}
⏱️ *Estimated Payback Period:* ~${calculations.paybackYears} Years

Generated via SellSolar.pk Load Calculator`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter appliances by category
  const filteredAppliances = useMemo(() => {
    const standard = DEFAULT_APPLIANCES.filter((app) => {
      if (activeCategory === 'all') return true;
      return app.category === activeCategory;
    });

    const custom = customAppliances.filter((app) => {
      if (activeCategory === 'all') return true;
      return app.category === activeCategory;
    });

    return { standard, custom };
  }, [activeCategory, customAppliances]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20 lg:pt-24 print:bg-white print:p-0 print:pt-0">
      {/* Top Banner / Hero Header */}
      <section className="border-b border-gray-200 bg-white shadow-xs print:hidden">
        <div className="container-page py-8 lg:py-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1 text-xs font-bold text-primary-700">
                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                Pakistan Solar Sizing & Energy Audit Tool
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Solar Load <span className="text-primary-500">Calculator</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:text-lg">
                Enter your fans, lights, Inverter ACs, water motors, and kitchen appliances.
                Get accurate kW capacity, panel count, battery bank requirements, and budget estimates for Pakistan.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-all"
                title="Copy full sizing summary"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-gray-500" />
                    <span>Share Summary</span>
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <Printer className="h-4 w-4 text-gray-500" />
                <span>Print Report</span>
              </button>
              <button
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Quick House Presets */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                1-Click Quick House Presets:
              </span>
              <span className="text-xs text-gray-400">Select to auto-fill typical loads</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LOAD_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`flex flex-col items-start rounded-2xl p-4 text-left transition-all ${
                      isSelected
                        ? 'border-2 border-primary-500 bg-primary-50/70 shadow-md shadow-primary-500/10'
                        : 'border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold uppercase text-primary-600">
                        {preset.targetSystem}
                      </span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <span className="mt-1 text-sm font-extrabold text-gray-900">{preset.name}</span>
                    <span className="mt-1 line-clamp-1 text-xs text-gray-500">{preset.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container-page mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Column (Appliances Inputs): 7 Columns on desktop */}
          <div className="space-y-6 lg:col-span-7">
            
            {/* Category Filter Tabs */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-base font-bold text-gray-900">Appliance Categories</h2>
                <button
                  onClick={() => setShowAddCustom(!showAddCustom)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Custom Appliance
                </button>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    activeCategory === 'all'
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Items ({DEFAULT_APPLIANCES.length + customAppliances.length})
                </button>
                {APPLIANCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      activeCategory === cat.id
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Appliance Form Drawer/Modal */}
            {showAddCustom && (
              <form
                onSubmit={handleAddCustomAppliance}
                className="rounded-2xl border-2 border-primary-300 bg-primary-50/50 p-5 shadow-sm transition-all"
              >
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary-600" />
                    <h3 className="text-sm font-extrabold text-primary-900">Add Custom Appliance</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700">Appliance Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Laser Printer, Treadmill, Pool Pump"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Category</label>
                    <select
                      value={newCustomCategory}
                      onChange={(e) => setNewCustomCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden"
                    >
                      {APPLIANCE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Wattage (Watts)</label>
                    <input
                      type="number"
                      min="1"
                      value={newCustomWatts}
                      onChange={(e) => setNewCustomWatts(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={newCustomQty}
                      onChange={(e) => setNewCustomQty(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700">Day Hrs</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={newCustomDayHours}
                        onChange={(e) => setNewCustomDayHours(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-2 py-2 text-sm text-center focus:border-primary-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700">Night Hrs</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={newCustomNightHours}
                        onChange={(e) => setNewCustomNightHours(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-2 py-2 text-sm text-center focus:border-primary-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4" />
                    Save & Calculate Load
                  </button>
                </div>
              </form>
            )}

            {/* Appliance Item Cards List */}
            <div className="space-y-3.5">
              {/* Standard Appliances */}
              {filteredAppliances.standard.map((app) => {
                const current = applianceState[app.id] || {
                  quantity: app.defaultQuantity,
                  watts: app.defaultWatts,
                  dayHours: app.dayHours,
                  nightHours: app.nightHours,
                };
                const totalItemRunningWatts = current.quantity * current.watts;
                const totalDailyUnits = (
                  (current.quantity * current.watts * (current.dayHours + current.nightHours)) /
                  1000
                ).toFixed(2);
                const isActive = current.quantity > 0;

                return (
                  <div
                    key={app.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      isActive
                        ? 'border-primary-200 bg-white shadow-xs'
                        : 'border-gray-200/80 bg-white/70 opacity-80 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: Icon and Name */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            isActive
                              ? 'bg-primary-500 text-white shadow-xs shadow-primary-500/20'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <CategoryIcon name={app.icon} className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-gray-900">{app.name}</h3>
                            {isActive && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                                {totalItemRunningWatts} W active
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500">{app.hint}</p>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper */}
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateAppliance(app.id, 'quantity', current.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={current.quantity}
                            onChange={(e) =>
                              handleUpdateAppliance(app.id, 'quantity', e.target.value)
                            }
                            className="w-10 bg-transparent text-center text-sm font-extrabold text-gray-900 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateAppliance(app.id, 'quantity', current.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable / Inline Controls for Active Items */}
                    {isActive && (
                      <div className="mt-4 border-t border-gray-100 pt-3.5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {/* Wattage Setting */}
                          <div>
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-gray-600">Power Rating</label>
                              <span className="text-[11px] font-extrabold text-primary-600">
                                {current.watts} Watts
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              {app.wattOptions ? (
                                <select
                                  value={current.watts}
                                  onChange={(e) =>
                                    handleUpdateAppliance(app.id, 'watts', e.target.value)
                                  }
                                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-primary-500 focus:outline-hidden"
                                >
                                  {app.wattOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt} W {opt === app.defaultWatts ? '(Standard)' : ''}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  min="1"
                                  value={current.watts}
                                  onChange={(e) =>
                                    handleUpdateAppliance(app.id, 'watts', e.target.value)
                                  }
                                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-primary-500 focus:outline-hidden"
                                />
                              )}
                            </div>
                          </div>

                          {/* Day Usage Hours */}
                          <div>
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                <Sun className="h-3 w-3 text-amber-500" /> Day Hours (Solar)
                              </label>
                              <span className="text-[11px] font-extrabold text-gray-800">
                                {current.dayHours} hrs
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="12"
                              step="0.5"
                              value={current.dayHours}
                              onChange={(e) =>
                                handleUpdateAppliance(app.id, 'dayHours', e.target.value)
                              }
                              className="mt-2 w-full accent-amber-500 h-1.5 rounded-lg bg-gray-200 cursor-pointer"
                            />
                          </div>

                          {/* Night Usage Hours */}
                          <div>
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                                <BatteryCharging className="h-3 w-3 text-indigo-500" /> Night Hours (Battery)
                              </label>
                              <span className="text-[11px] font-extrabold text-gray-800">
                                {current.nightHours} hrs
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="12"
                              step="0.5"
                              value={current.nightHours}
                              onChange={(e) =>
                                handleUpdateAppliance(app.id, 'nightHours', e.target.value)
                              }
                              className="mt-2 w-full accent-indigo-500 h-1.5 rounded-lg bg-gray-200 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Daily kWh footprint pill */}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                          <span>
                            Surge multiplier: <strong className="text-gray-700">{app.surgeMultiplier}x</strong>
                          </span>
                          <span>
                            Daily consumption: <strong className="text-primary-700">{totalDailyUnits} Units/Day</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Custom Appliances List */}
              {filteredAppliances.custom.map((app, idx) => {
                const totalItemRunningWatts = app.quantity * app.watts;
                const totalDailyUnits = (
                  (app.quantity * app.watts * (app.dayHours + app.nightHours)) /
                  1000
                ).toFixed(2);

                return (
                  <div
                    key={app.id}
                    className="rounded-2xl border-2 border-dashed border-primary-300 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-gray-900">{app.name}</h3>
                            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-extrabold text-primary-800">
                              Custom ({totalItemRunningWatts} W)
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">User created appliance</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCustomAppliance(idx, 'quantity', app.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">
                            {app.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCustomAppliance(idx, 'quantity', app.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustom(idx)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-gray-100 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600">Wattage</label>
                        <input
                          type="number"
                          value={app.watts}
                          onChange={(e) =>
                            handleUpdateCustomAppliance(idx, 'watts', e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-amber-700">Day Hours</label>
                        <input
                          type="number"
                          step="0.5"
                          value={app.dayHours}
                          onChange={(e) =>
                            handleUpdateCustomAppliance(idx, 'dayHours', e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-indigo-700">Night Hours</label>
                        <input
                          type="number"
                          step="0.5"
                          value={app.nightHours}
                          onChange={(e) =>
                            handleUpdateCustomAppliance(idx, 'nightHours', e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (Live Results & System Sizing Dashboard): 5 Columns on desktop */}
          <div className="space-y-6 lg:col-span-5">
            
            {/* System Preferences Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Sliders className="h-4 w-4 text-primary-600" />
                <h3 className="text-sm font-extrabold text-gray-900">System Preferences</h3>
              </div>

              <div className="mt-4 space-y-4">
                {/* System Type Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-700">Solar Architecture</label>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'hybrid', label: 'Hybrid (Net Meter + Battery)' },
                      { id: 'ongrid', label: 'On-Grid (Net Metering Only)' },
                      { id: 'offgrid', label: 'Off-Grid (Batteries Only)' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSystemType(st.id)}
                        className={`rounded-xl px-2 py-2 text-center text-[11px] font-bold transition-all ${
                          systemType === st.id
                            ? 'bg-primary-500 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Battery Type */}
                {systemType !== 'ongrid' && (
                  <div>
                    <label className="text-xs font-bold text-gray-700">Battery Storage Chemistry</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBatteryType('lithium')}
                        className={`rounded-xl p-2.5 text-left border transition-all ${
                          batteryType === 'lithium'
                            ? 'border-primary-500 bg-primary-50 text-primary-900 font-bold'
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="text-xs font-extrabold">Lithium LiFePO4 (48V)</div>
                        <div className="text-[10px] text-gray-500">10+ yr life, 6000 cycles, 90% DoD</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatteryType('tubular')}
                        className={`rounded-xl p-2.5 text-left border transition-all ${
                          batteryType === 'tubular'
                            ? 'border-primary-500 bg-primary-50 text-primary-900 font-bold'
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="text-xs font-extrabold">Tubular Lead Acid</div>
                        <div className="text-[10px] text-gray-500">2-3 yr life, economical initial cost</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Panel Wattage & Tariff */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Solar Panel Model</label>
                    <select
                      value={panelWattage}
                      onChange={(e) => setPanelWattage(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-hidden"
                    >
                      <option value={585}>585W TOPCon N-Type (Market standard)</option>
                      <option value={600}>600W Bifacial TOPCon</option>
                      <option value={550}>550W Mono PERC</option>
                      <option value={700}>700W HJT / Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Electricity Tariff (Rs/Unit)</label>
                    <input
                      type="number"
                      value={electricityTariff}
                      onChange={(e) => setElectricityTariff(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sizing & Recommendation Result Card */}
            <div className="rounded-3xl border-2 border-primary-500 bg-gradient-to-b from-primary-900 via-gray-900 to-gray-950 p-6 text-white shadow-xl shadow-primary-950/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-400">
                    Recommended Sizing
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    {calculations.recommendedKw > 0
                      ? `${calculations.recommendedKw} kW System`
                      : 'No Active Load'}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 border border-primary-400/30 text-primary-400">
                  <Sun className="h-6 w-6" />
                </div>
              </div>

              {/* Load Metrics Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> Running Load
                  </div>
                  <div className="mt-1 text-lg font-black text-white">
                    {calculations.totalRunningWatts} <span className="text-xs font-medium text-gray-400">Watts</span>
                  </div>
                  <div className="text-[10px] text-gray-400">({calculations.totalRunningKw} kW continuous)</div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-rose-400" /> Surge / Motor Peak
                  </div>
                  <div className="mt-1 text-lg font-black text-rose-300">
                    {calculations.totalSurgeKva} <span className="text-xs font-medium text-gray-400">kVA</span>
                  </div>
                  <div className="text-[10px] text-gray-400">Motor & compressor startup</div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> Daily Units
                  </div>
                  <div className="mt-1 text-lg font-black text-emerald-300">
                    {calculations.totalDailyKwh} <span className="text-xs font-medium text-gray-400">kWh/day</span>
                  </div>
                  <div className="text-[10px] text-gray-400">~{calculations.monthlyUnits} units / month</div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-primary-400" /> Monthly Bill Saved
                  </div>
                  <div className="mt-1 text-lg font-black text-primary-300">
                    Rs {formatPrice(calculations.estimatedMonthlyBillPk)}
                  </div>
                  <div className="text-[10px] text-gray-400">At Rs {electricityTariff}/unit tariff</div>
                </div>
              </div>

              {/* Hardware Bill of Materials (BOM) */}
              <div className="mt-6 space-y-3 rounded-2xl bg-white/5 p-4 border border-white/10 text-xs">
                <div className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-white/10 pb-2">
                  System Hardware Requirements:
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" /> Solar Panels ({panelWattage}W):
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {calculations.numberOfPanels} Plates ({calculations.totalPanelCapacityActualKw} kW)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary-400" /> Recommended Inverter:
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {calculations.recommendedKw} kW {systemType.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-sky-400" /> Rooftop Space Needed:
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    ~{calculations.rooftopAreaSqFt} Sq. Ft.
                  </span>
                </div>

                {systemType !== 'ongrid' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" /> Battery Storage:
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      {batteryType === 'lithium'
                        ? `${calculations.lithiumKwhRequired} kWh LiFePO4 (48V)`
                        : `${calculations.tubularKwhRequired} kWh Tubular Lead Acid`}
                    </span>
                  </div>
                )}
              </div>

              {/* Turnkey Estimated Cost & Payback */}
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary-600/30 to-emerald-600/30 p-4 border border-primary-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Estimated Turnkey Budget (Pakistan)
                    </div>
                    <div className="mt-1 text-xl font-black text-white">
                      Rs {formatPrice(calculations.estimatedSystemCostMin)} - {formatPrice(calculations.estimatedSystemCostMax)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      ROI Payback
                    </div>
                    <div className="mt-1 text-xl font-black text-emerald-300">
                      ~{calculations.paybackYears} Years
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketplace Action CTA */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    setTimeout(() => {
                      const el = document.getElementById('listings');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse {calculations.recommendedKw}kW Solar Equipment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('prices')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition-colors"
                  >
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    <span>Check Today's Per-Watt Panel & Inverter Rates</span>
                  </button>
                )}
              </div>
            </div>

            {/* Advice & Tips Card for Pakistan */}
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary-500" /> Engineering Guidelines for Pakistan
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Net Metering (3-Phase):</strong> DISCOs (LESCO, IESCO, K-Electric) require 3-phase green meters for 5kW+ systems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Inverter AC Efficiency:</strong> Dual-inverter ACs reduce steady running load from 1,800W down to ~600W-800W after room temperature stabilizes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Water Pump Timing:</strong> Run 1HP/1.5HP motors between 11:00 AM and 2:00 PM to power them 100% directly off free solar energy.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

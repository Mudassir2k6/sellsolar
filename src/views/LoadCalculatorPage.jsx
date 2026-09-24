import React, { useState, useMemo } from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
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
  Sliders,
  Receipt,
  MapPin,
  HelpCircle
} from 'lucide-react';
import {
  APPLIANCE_CATEGORIES,
  DEFAULT_APPLIANCES,
  LOAD_PRESETS,
  PAKISTAN_SOLAR_PARAMS
} from '../data/solarCalculatorData';
import { formatPrice } from '../lib/constants';

// WhatsApp Brand SVG Icon
function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24h.01zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z" />
    </svg>
  );
}

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

// Major Cities in Pakistan with Irradiance data
const PAKISTAN_CITIES = [
  { id: 'lahore', name: 'Lahore & Central Punjab', sunHours: 4.8, disco: 'LESCO' },
  { id: 'karachi', name: 'Karachi & Coastal Sindh', sunHours: 5.4, disco: 'K-Electric' },
  { id: 'islamabad', name: 'Islamabad / Rawalpindi', sunHours: 5.0, disco: 'IESCO' },
  { id: 'multan', name: 'Multan & South Punjab', sunHours: 5.3, disco: 'MEPCO' },
  { id: 'faisalabad', name: 'Faisalabad & Gujranwala', sunHours: 4.9, disco: 'FESCO/GEPCO' },
  { id: 'quetta', name: 'Quetta & Balochistan', sunHours: 5.8, disco: 'QESCO' },
  { id: 'peshawar', name: 'Peshawar & KPK', sunHours: 5.0, disco: 'PESCO' },
];

export default function LoadCalculatorPage({ onNavigate, onSelectCategory }) {
  // Sizing Mode: 'bill' (Fast 10-Second Calculation) vs 'appliances' (Detailed load audit)
  const [calculationMode, setCalculationMode] = useState('bill');

  // ================= BILL SIZING MODE STATE =================
  const [billInputType, setBillInputType] = useState('amount'); // 'amount' (PKR) | 'units' (kWh)
  const [monthlyBillPkr, setMonthlyBillPkr] = useState(65000);
  const [monthlyUnitsPkr, setMonthlyUnitsPkr] = useState(1050);
  const [solarCoverage, setSolarCoverage] = useState(100); // 100% Net Zero, 75%, 50%, 120%
  const [dayNightSplit, setDayNightSplit] = useState(55); // 55% daytime, 45% nighttime
  const [selectedCity, setSelectedCity] = useState('lahore');

  // ================= APPLIANCES MODE STATE =================
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
  const [applianceSearchQuery, setApplianceSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState('medium_home');
  const [customAppliances, setCustomAppliances] = useState([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [openCategories, setOpenCategories] = useState(() => new Set(['fans', 'lights', 'cooling']));

  // Custom appliance form
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomWatts, setNewCustomWatts] = useState(500);
  const [newCustomQty, setNewCustomQty] = useState(1);
  const [newCustomDayHours, setNewCustomDayHours] = useState(2);
  const [newCustomNightHours, setNewCustomNightHours] = useState(1);
  const [newCustomCategory, setNewCustomCategory] = useState('motors');

  // ================= SYSTEM CONFIGURATION OPTIONS =================
  const [systemType, setSystemType] = useState('hybrid'); // 'hybrid', 'ongrid', 'offgrid'
  const [batteryType, setBatteryType] = useState('lithium'); // 'lithium', 'tubular'
  const [panelWattage, setPanelWattage] = useState(585); // 585W TOPCon
  const [electricityTariff, setElectricityTariff] = useState(62); // Average PKR / kWh in Pakistan with taxes

  const [copied, setCopied] = useState(false);

  // Apply Preset (Appliances Mode)
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
    setActivePreset('');
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

  // City sun hours
  const activeCityObj = useMemo(() => {
    return PAKISTAN_CITIES.find(c => c.id === selectedCity) || PAKISTAN_CITIES[0];
  }, [selectedCity]);

  // UNIFIED SIZING CALCULATIONS ENGINE (Handles both 'bill' and 'appliances' mode)
  const calculations = useMemo(() => {
    const citySunHours = activeCityObj.sunHours;
    const derate = PAKISTAN_SOLAR_PARAMS.systemDerateFactor || 0.78;
    const effectiveSunHours = citySunHours * derate;

    let totalRunningWatts = 0;
    let totalSurgeWatts = 0;
    let totalDailyKwh = 0;
    let dayKwh = 0;
    let nightKwh = 0;
    let monthlyUnits = 0;
    let estimatedMonthlyBillPk = 0;
    let rawTargetKw = 0;

    const categoryBreakdown = {
      cooling: 0,
      fans: 0,
      motors: 0,
      kitchen: 0,
      lights: 0,
      electronics: 0,
    };

    if (calculationMode === 'bill') {
      // BILL MODE SIZING
      if (billInputType === 'amount') {
        estimatedMonthlyBillPk = Math.max(0, Number(monthlyBillPkr) || 0);
        monthlyUnits = Math.round(estimatedMonthlyBillPk / (Number(electricityTariff) || 62));
      } else {
        monthlyUnits = Math.max(0, Number(monthlyUnitsPkr) || 0);
        estimatedMonthlyBillPk = Math.round(monthlyUnits * (Number(electricityTariff) || 62));
      }

      // Coverage adjustment (e.g. 100% net zero, 75%, 120%)
      const targetMonthlyUnits = monthlyUnits * (solarCoverage / 100);
      totalDailyKwh = targetMonthlyUnits > 0 ? (targetMonthlyUnits / 30) : 0;
      dayKwh = totalDailyKwh * (dayNightSplit / 100);
      nightKwh = totalDailyKwh * (1 - (dayNightSplit / 100));

      rawTargetKw = totalDailyKwh > 0 ? totalDailyKwh / effectiveSunHours : 0;

      // Realistic estimated continuous & surge running loads for this capacity tier
      totalRunningWatts = Math.round(rawTargetKw * 650);
      totalSurgeWatts = Math.round(rawTargetKw * 1350);
    } else {
      // APPLIANCES MODE SIZING
      let totalDayEnergyWh = 0;
      let totalNightEnergyWh = 0;

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

      totalDailyKwh = (totalDayEnergyWh + totalNightEnergyWh) / 1000;
      dayKwh = totalDayEnergyWh / 1000;
      nightKwh = totalNightEnergyWh / 1000;
      monthlyUnits = Math.round(totalDailyKwh * 30);
      estimatedMonthlyBillPk = Math.round(monthlyUnits * electricityTariff);

      const calculatedSystemKw = totalDailyKwh > 0 ? totalDailyKwh / effectiveSunHours : 0;
      const inverterSafetyFactor = 1.25;
      const loadBasedInverterKw = (totalRunningWatts * inverterSafetyFactor) / 1000;
      rawTargetKw = Math.max(calculatedSystemKw, loadBasedInverterKw);
    }

    // Standardize to realistic Pakistan Solar Inverter / System Tiers:
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
    } else if (rawTargetKw <= 25.0) {
      recommendedKw = 25.0;
    } else if (rawTargetKw <= 30.0) {
      recommendedKw = 30.0;
    } else {
      recommendedKw = Math.ceil(rawTargetKw);
    }

    // Number of solar panels (e.g. 585W TOPCon)
    const totalSolarCapacityWatts = recommendedKw * 1000;
    const numberOfPanels = recommendedKw > 0 ? Math.ceil(totalSolarCapacityWatts / panelWattage) : 0;
    const totalPanelCapacityActualKw = ((numberOfPanels * panelWattage) / 1000).toFixed(2);
    const rooftopAreaSqFt = numberOfPanels * (PAKISTAN_SOLAR_PARAMS.panelDimensionsSqFt || 28);

    // Battery Bank Requirement (kWh)
    const dodLithium = 0.85; // 85% DoD LiFePO4
    const dodTubular = 0.50; // 50% DoD Tubular Lead-Acid
    const lithiumKwhRequired = nightKwh > 0 ? (nightKwh / dodLithium).toFixed(1) : '0';
    const tubularKwhRequired = nightKwh > 0 ? (nightKwh / dodTubular).toFixed(1) : '0';

    // Approximate Turnkey Budget in PKR
    let costPerKw = PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.hybrid_lithium;
    if (systemType === 'ongrid') {
      costPerKw = PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.ongrid;
    } else if (systemType === 'hybrid') {
      costPerKw = batteryType === 'tubular'
        ? PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.hybrid_tubular
        : PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.hybrid_lithium;
    } else {
      costPerKw = PAKISTAN_SOLAR_PARAMS.turnkeyCostPerKw.offgrid;
    }

    const estimatedSystemCostMin = Math.round(recommendedKw * costPerKw * 0.95);
    const estimatedSystemCostMax = Math.round(recommendedKw * costPerKw * 1.12);

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
    calculationMode,
    billInputType,
    monthlyBillPkr,
    monthlyUnitsPkr,
    solarCoverage,
    dayNightSplit,
    activeCityObj,
    electricityTariff,
    allActiveItems,
    panelWattage,
    systemType,
    batteryType,
  ]);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const summary = `☀️ *SellSolar.pk - Solar Sizing Quotation* ☀️
------------------------------------------------
🎯 *Recommended System:* ${calculations.recommendedKw} kW (${systemType.toUpperCase()})
⚡ *Solar Panels Needed:* ${calculations.numberOfPanels}x Plates (${panelWattage}W N-Type TOPCon = ${calculations.totalPanelCapacityActualKw} kW)
🔌 *Inverter:* ${calculations.recommendedKw} kW ${systemType.toUpperCase()} Inverter
🔋 *Battery Bank:* ${systemType === 'ongrid' ? 'None (Net Metering Only)' : batteryType === 'lithium' ? `${calculations.lithiumKwhRequired} kWh LiFePO4 (48V)` : `${calculations.tubularKwhRequired} kWh Tubular Lead Acid`}
🏡 *Rooftop Space Needed:* ~${calculations.rooftopAreaSqFt} Sq. Ft.
💡 *Monthly Units:* ~${calculations.monthlyUnits} Units/Month
💰 *Estimated Monthly Bill Saved:* Rs ${formatPrice(calculations.estimatedMonthlyBillPk)}
💵 *Estimated Turnkey Cost:* Rs ${formatPrice(calculations.estimatedSystemCostMin)} - ${formatPrice(calculations.estimatedSystemCostMax)}
⏱️ *Estimated Payback Period:* ~${calculations.paybackYears} Years
------------------------------------------------
Calculated on SellSolar.pk Load Calculator:
https://sellsolar.pk/calculator`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Direct 1-Click WhatsApp Share
  const handleShareWhatsApp = () => {
    const summary = `☀️ *SellSolar.pk - Solar System Sizing Quotation* ☀️
------------------------------------------------
🎯 *Recommended System:* ${calculations.recommendedKw} kW (${systemType.toUpperCase()})
⚡ *Solar Panels:* ${calculations.numberOfPanels}x Plates (${panelWattage}W TOPCon = ${calculations.totalPanelCapacityActualKw} kW)
🔌 *Inverter:* ${calculations.recommendedKw} kW ${systemType.toUpperCase()}
🔋 *Battery Storage:* ${systemType === 'ongrid' ? 'None (Net-Metered)' : batteryType === 'lithium' ? `${calculations.lithiumKwhRequired} kWh LiFePO4 (48V)` : `${calculations.tubularKwhRequired} kWh Tubular`}
🏡 *Rooftop Space Required:* ~${calculations.rooftopAreaSqFt} Sq. Ft.
💰 *Estimated Monthly Bill Saved:* Rs ${formatPrice(calculations.estimatedMonthlyBillPk)}
💵 *Estimated Turnkey Budget:* Rs ${formatPrice(calculations.estimatedSystemCostMin)} - ${formatPrice(calculations.estimatedSystemCostMax)}
⏱️ *Estimated Payback Period:* ~${calculations.paybackYears} Years
📍 *Location:* ${activeCityObj.name} (${activeCityObj.disco})
------------------------------------------------
Calculated on SellSolar Pakistan Load Calculator:
https://sellsolar.pk/calculator`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleCategory = (catId) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  // Filter appliances for appliances mode with search
  const filteredAppliances = useMemo(() => {
    const query = applianceSearchQuery.trim().toLowerCase();
    return DEFAULT_APPLIANCES.filter((app) => {
      const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
      const matchesSearch = !query || app.name.toLowerCase().includes(query) || app.hint.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, applianceSearchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-36 pt-20 lg:pt-24 print:bg-white print:p-0 print:pt-0 text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Top Banner / Hero Header */}
      <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs print:hidden">
        <div className="container-page py-5 sm:py-6">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/60 px-3 py-0.5 text-xs font-bold text-primary-700 dark:text-primary-300">
                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                Pakistan Solar Sizing & Energy Audit Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Solar Load & Capacity <span className="text-primary-500">Calculator</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Calculate your exact required solar capacity in <strong className="text-gray-900 dark:text-white">kW</strong>, number of solar plates, battery backup, and turnkey installation budget for Pakistan.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer"
                title="Share quotation via WhatsApp"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>Share to WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                title="Copy full sizing summary"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-gray-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4 text-gray-500" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* DUAL CALCULATION MODE SWITCHER */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary-500" />
                Select How You Want to Calculate:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {/* Option 1: Fast Bill Mode */}
              <button
                type="button"
                onClick={() => setCalculationMode('bill')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  calculationMode === 'bill'
                    ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  calculationMode === 'bill' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      By Electricity Bill / Units
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Fast 10s
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Enter your monthly bill amount or units for instant recommended kW capacity.
                  </p>
                </div>
              </button>

              {/* Option 2: Appliances Mode */}
              <button
                type="button"
                onClick={() => setCalculationMode('appliances')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  calculationMode === 'appliances'
                    ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  calculationMode === 'appliances' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      By Household Appliances
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Detailed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Select ACs, fans, lights, and water pumps for a granular energy audit.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container-page mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column (Inputs): 7 Columns on desktop */}
          <div className="space-y-6 lg:col-span-7">
            
            {/* ============================================================ */}
            {/* VIEW A: FAST ELECTRICITY BILL / UNITS MODE                   */}
            {/* ============================================================ */}
            {calculationMode === 'bill' && (
              <div className="space-y-5">
                <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary-500" />
                      <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                        Enter Monthly Electricity Consumption
                      </h2>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      From your WAPDA / K-Electric Bill
                    </span>
                  </div>

                  {/* Toggle: Bill in PKR vs Units in kWh */}
                  <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800 p-1">
                    <button
                      type="button"
                      onClick={() => setBillInputType('amount')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        billInputType === 'amount'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                      }`}
                    >
                      Monthly Bill Amount (PKR / Rs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillInputType('units')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        billInputType === 'units'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                      }`}
                    >
                      Monthly Units Consumed (kWh)
                    </button>
                  </div>

                  {/* Input Box with quick chips */}
                  {billInputType === 'amount' ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Average Monthly Electricity Bill (PKR)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-gray-400">
                          Rs
                        </span>
                        <input
                          type="number"
                          step="1000"
                          min="5000"
                          max="2000000"
                          value={monthlyBillPkr}
                          onChange={(e) => setMonthlyBillPkr(Number(e.target.value))}
                          placeholder="e.g. 65000"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-primary-200 dark:border-primary-800/80 bg-gray-50 dark:bg-gray-800/60 focus:bg-white dark:focus:bg-gray-900 text-lg sm:text-xl font-black text-gray-900 dark:text-white focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      {/* Quick Bill Chips */}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-400 font-semibold">Quick select:</span>
                        {[35000, 50000, 65000, 85000, 120000, 175000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setMonthlyBillPkr(amt)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              monthlyBillPkr === amt
                                ? 'bg-primary-500 text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            Rs {amt / 1000}k
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Average Monthly Units Consumed (kWh)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="50"
                          min="50"
                          max="25000"
                          value={monthlyUnitsPkr}
                          onChange={(e) => setMonthlyUnitsPkr(Number(e.target.value))}
                          placeholder="e.g. 1000"
                          className="w-full px-4 py-3.5 rounded-2xl border-2 border-primary-200 dark:border-primary-800/80 bg-gray-50 dark:bg-gray-800/60 focus:bg-white dark:focus:bg-gray-900 text-lg sm:text-xl font-black text-gray-900 dark:text-white focus:border-primary-500 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-gray-400">
                          Units / Month
                        </span>
                      </div>

                      {/* Quick Unit Chips */}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-400 font-semibold">Quick select:</span>
                        {[400, 650, 900, 1200, 1600, 2200].map((units) => (
                          <button
                            key={units}
                            type="button"
                            onClick={() => setMonthlyUnitsPkr(units)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              monthlyUnitsPkr === units
                                ? 'bg-primary-500 text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {units} Units
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location / City Selector (Affects Solar Irradiance) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Your City / Region (Solar Sunshine Peak Hours)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500" />
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                      >
                        {PAKISTAN_CITIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {c.sunHours} Peak Sun Hours/Day ({c.disco})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Solar Coverage Goal Slider */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-700 dark:text-gray-300">Target Electricity Offset Goal:</span>
                      <span className="text-primary-600 dark:text-primary-400 font-extrabold text-sm">
                        {solarCoverage}% {solarCoverage === 100 ? '(Net Zero Bill)' : solarCoverage > 100 ? '(Net Exporter)' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="130"
                      step="5"
                      value={solarCoverage}
                      onChange={(e) => setSolarCoverage(Number(e.target.value))}
                      className="w-full accent-primary-500 h-2 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold pt-0.5">
                      <span>50% (Day Load)</span>
                      <span>75% (Substantial)</span>
                      <span className="text-primary-600 font-bold">100% (Zero WAPDA Bill)</span>
                      <span>120% (Export Units)</span>
                    </div>
                  </div>

                  {/* Explanation card */}
                  <div className="rounded-2xl p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      At current Pakistan tariff rates (~Rs {electricityTariff}/unit with FC charges & taxes), a monthly bill of <strong>Rs {formatPrice(calculations.estimatedMonthlyBillPk)}</strong> consumes approximately <strong>{calculations.monthlyUnits} units/month</strong> (~{calculations.totalDailyKwh} units/day).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW B: DETAILED APPLIANCES MODE                             */}
            {/* ============================================================ */}
            {calculationMode === 'appliances' && (
              <div className="space-y-6">
                
                {/* 1-Click Quick House Presets */}
                <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      1-Click Household Presets:
                    </span>
                    <span className="text-xs text-gray-400">Auto-fill typical loads</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {LOAD_PRESETS.map((preset) => {
                      const isSelected = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.id)}
                          className={`flex flex-col items-start rounded-2xl p-3.5 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 shadow-xs'
                              : 'border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="text-xs font-extrabold uppercase text-primary-600 dark:text-primary-400">
                              {preset.targetSystem}
                            </span>
                            {isSelected && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-white">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <span className="mt-1 text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">{preset.name}</span>
                          <span className="mt-0.5 line-clamp-1 text-[11px] text-gray-500 dark:text-gray-400">{preset.subtitle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Filter Tabs & Appliance Search */}
                <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Appliance Categories</h2>
                    
                    <div className="flex items-center gap-2">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search appliance..."
                          value={applianceSearchQuery}
                          onChange={(e) => setApplianceSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAddCustom(!showAddCustom)}
                        className="inline-flex items-center gap-1 rounded-xl bg-primary-50 dark:bg-primary-950/60 px-3 py-1.5 text-xs font-bold text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Custom</span>
                      </button>
                    </div>
                  </div>

                  {/* Category pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        activeCategory === 'all'
                          ? 'bg-primary-500 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      All Items
                    </button>
                    {APPLIANCE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          activeCategory === cat.id
                            ? 'bg-primary-500 text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
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
                    className="rounded-3xl border-2 border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/20 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-primary-200 dark:border-primary-800">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary-600" />
                        <h3 className="text-sm font-extrabold text-primary-900 dark:text-primary-200">Add Custom Appliance</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddCustom(false)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Appliance Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Air Fryer, Treadmill, Coffee Maker"
                          value={newCustomName}
                          onChange={(e) => setNewCustomName(e.target.value)}
                          required
                          className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs focus:border-primary-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Wattage (Watts)</label>
                        <input
                          type="number"
                          min="1"
                          max="15000"
                          value={newCustomWatts}
                          onChange={(e) => setNewCustomWatts(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-bold focus:border-primary-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Save & Add to Calculation
                      </button>
                    </div>
                  </form>
                )}

                {/* ========= CATEGORIZED ACCORDION APPLIANCE LIST ========= */}
                <div className="space-y-3">
                  {APPLIANCE_CATEGORIES.map((cat) => {
                    const catAppliances = filteredAppliances.filter(app => app.category === cat.id);
                    if (catAppliances.length === 0 && applianceSearchQuery) return null;

                    const activeCount = catAppliances.filter(app => (applianceState[app.id]?.quantity || 0) > 0).length;
                    const totalCatWatts = catAppliances.reduce((sum, app) => {
                      return sum + (applianceState[app.id]?.quantity || 0) * (applianceState[app.id]?.watts || app.defaultWatts);
                    }, 0);
                    const isOpen = openCategories.has(cat.id) || Boolean(applianceSearchQuery);

                    return (
                      <div key={cat.id} className={`rounded-2xl border transition-all ${
                        activeCount > 0
                          ? 'border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-900 shadow-sm'
                          : 'border-gray-200/80 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50'
                      }`}>
                        {/* Category accordion header */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              activeCount > 0 ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            }`}>
                              <CategoryIcon name={cat.icon} className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-gray-900 dark:text-white">{cat.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {activeCount > 0
                                  ? <span className="text-primary-600 dark:text-primary-400 font-bold">{activeCount} item{activeCount !== 1 ? 's' : ''} active • {totalCatWatts}W</span>
                                  : `${catAppliances.length} appliances — click to configure`
                                }
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`} />
                        </button>

                        {/* Category accordion body */}
                        {isOpen && (
                          <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-3">
                            {catAppliances.map((app) => {
                              const current = applianceState[app.id] || {
                                quantity: app.defaultQuantity,
                                watts: app.defaultWatts,
                                dayHours: app.dayHours,
                                nightHours: app.nightHours,
                              };
                              const totalItemRunningWatts = current.quantity * current.watts;
                              const isActive = current.quantity > 0;

                              return (
                                <div
                                  key={app.id}
                                  className={`rounded-xl border p-3 transition-all duration-200 ${
                                    isActive
                                      ? 'border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-950/20'
                                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{app.name}</div>
                                      {isActive ? (
                                        <div className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">{totalItemRunningWatts}W continuous load</div>
                                      ) : (
                                        <div className="text-[10px] text-gray-400">{app.hint}</div>
                                      )}
                                    </div>

                                    {/* Stepper */}
                                    <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-0.5 shrink-0 shadow-2xs">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateAppliance(app.id, 'quantity', current.quantity - 1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        value={current.quantity}
                                        onChange={(e) => handleUpdateAppliance(app.id, 'quantity', e.target.value)}
                                        className="w-8 bg-transparent text-center text-xs font-extrabold text-gray-900 dark:text-white outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateAppliance(app.id, 'quantity', current.quantity + 1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expandable controls for active items */}
                                  {isActive && (
                                    <div className="mt-2.5 border-t border-primary-100 dark:border-primary-900/60 pt-2.5">
                                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <div>
                                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                            <span>Rating</span>
                                            <span className="text-primary-600 dark:text-primary-400">{current.watts} W</span>
                                          </div>
                                          <div className="mt-1">
                                            {app.wattOptions ? (
                                              <select
                                                value={current.watts}
                                                onChange={(e) => handleUpdateAppliance(app.id, 'watts', e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-[11px] font-semibold text-gray-800 dark:text-gray-200 outline-none"
                                              >
                                                {app.wattOptions.map((opt) => (
                                                  <option key={opt} value={opt}>
                                                    {opt}W {opt === app.defaultWatts ? '(Std)' : ''}
                                                  </option>
                                                ))}
                                              </select>
                                            ) : (
                                              <input
                                                type="number"
                                                min="1"
                                                value={current.watts}
                                                onChange={(e) => handleUpdateAppliance(app.id, 'watts', e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-[11px] font-semibold text-gray-800 dark:text-gray-200 outline-none"
                                              />
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                            <span className="flex items-center gap-1"><Sun className="h-3 w-3" /> Day hrs</span>
                                            <span>{current.dayHours}h</span>
                                          </div>
                                          <input
                                            type="range"
                                            min="0" max="12" step="0.5"
                                            value={current.dayHours}
                                            onChange={(e) => handleUpdateAppliance(app.id, 'dayHours', e.target.value)}
                                            className="mt-1.5 w-full accent-amber-500 h-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer"
                                          />
                                        </div>

                                        <div>
                                          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                                            <span className="flex items-center gap-1"><BatteryCharging className="h-3 w-3" /> Night hrs</span>
                                            <span>{current.nightHours}h</span>
                                          </div>
                                          <input
                                            type="range"
                                            min="0" max="12" step="0.5"
                                            value={current.nightHours}
                                            onChange={(e) => handleUpdateAppliance(app.id, 'nightHours', e.target.value)}
                                            className="mt-1.5 w-full accent-indigo-500 h-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reset All Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Clear All Appliances to Zero</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Live Results & System Sizing Dashboard): 5 Columns on desktop */}
          <div id="sizing-result-card" className="space-y-5 lg:col-span-5 lg:sticky lg:top-24">
            
            {/* System Preferences Card */}
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary-500" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">System Architecture & Preferences</h3>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">Pakistan Market</span>
              </div>

              {/* System Type Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Solar Inverter Type</label>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'hybrid', label: 'Hybrid (Net Meter + Battery)' },
                    { id: 'ongrid', label: 'On-Grid (Net Metering Only)' },
                    { id: 'offgrid', label: 'Off-Grid (Pure Battery)' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSystemType(st.id)}
                      className={`rounded-xl px-2 py-2 text-center text-[11px] font-bold transition-all cursor-pointer ${
                        systemType === st.id
                          ? 'bg-primary-500 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Battery Storage Type */}
              {systemType !== 'ongrid' && (
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Battery Chemistry</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBatteryType('lithium')}
                      className={`rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                        batteryType === 'lithium'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 font-bold'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="text-xs font-extrabold">Lithium LiFePO4</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">10-15 yr life, 6000 cycles</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatteryType('tubular')}
                      className={`rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                        batteryType === 'tubular'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 font-bold'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="text-xs font-extrabold">Tubular Lead Acid</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">2-3 yr life, low initial cost</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Panel Wattage & Tariff */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Panel Model</label>
                  <select
                    value={panelWattage}
                    onChange={(e) => setPanelWattage(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
                  >
                    <option value={585}>585W TOPCon (Tier-1)</option>
                    <option value={600}>600W Bifacial</option>
                    <option value={550}>550W Mono PERC</option>
                    <option value={700}>700W Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">WAPDA Tariff (Rs/kWh)</label>
                  <input
                    type="number"
                    value={electricityTariff}
                    onChange={(e) => setElectricityTariff(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sizing & Recommendation Result Card */}
            <div className="rounded-3xl border-2 border-primary-500 bg-gradient-to-b from-primary-950 via-gray-900 to-gray-950 p-6 text-white shadow-xl shadow-primary-950/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-400">
                    Recommended Sizing
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {calculations.recommendedKw > 0
                      ? `${calculations.recommendedKw} kW System`
                      : '0 kW System'}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 border border-primary-400/30 text-primary-400">
                  <Sun className="h-6 w-6" />
                </div>
              </div>

              {/* Load Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> Continuous Load
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-black text-white">
                    {calculations.totalRunningWatts.toLocaleString()} <span className="text-xs font-medium text-gray-400">W</span>
                  </div>
                  <div className="text-[10px] text-gray-400">({calculations.totalRunningKw} kW running)</div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-rose-400" /> Peak Surge Load
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-black text-rose-300">
                    {calculations.totalSurgeKva} <span className="text-xs font-medium text-gray-400">kVA</span>
                  </div>
                  <div className="text-[10px] text-gray-400">Compressor / motor startup</div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> Daily Units
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-black text-emerald-300">
                    {calculations.totalDailyKwh} <span className="text-xs font-medium text-gray-400">kWh/day</span>
                  </div>
                  <div className="text-[10px] text-gray-400">~{calculations.monthlyUnits} units / month</div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-primary-400" /> Monthly Bill Saved
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-black text-primary-300">
                    Rs {formatPrice(calculations.estimatedMonthlyBillPk)}
                  </div>
                  <div className="text-[10px] text-gray-400">At Rs {electricityTariff}/unit</div>
                </div>
              </div>

              {/* Hardware Bill of Materials (BOM) */}
              <div className="mt-5 space-y-2.5 rounded-2xl bg-white/5 p-4 border border-white/10 text-xs">
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
              <div className="mt-5 rounded-2xl bg-gradient-to-r from-primary-600/30 to-emerald-600/30 p-4 border border-primary-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Estimated Turnkey Budget (Pakistan)
                    </div>
                    <div className="mt-1 text-lg sm:text-xl font-black text-white">
                      Rs {formatPrice(calculations.estimatedSystemCostMin)} - {formatPrice(calculations.estimatedSystemCostMax)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      ROI Payback
                    </div>
                    <div className="mt-1 text-lg sm:text-xl font-black text-emerald-300">
                      ~{calculations.paybackYears} Years
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketplace Action Buttons */}
              <div className="mt-5 flex flex-col gap-2.5">
                {/* WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>Send Quotation to WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('install')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 py-3 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Request Free Turnkey Installation Quote</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory({ query: `${calculations.recommendedKw}kW` });
                    } else if (onNavigate) {
                      onNavigate('home');
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 hover:bg-primary-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse {calculations.recommendedKw}kW Equipment Marketplace</span>
                </button>
              </div>
            </div>

            {/* Advice & Guidelines for Pakistan */}
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary-500" /> Engineering Guidelines for Pakistan
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Net Metering (3-Phase):</strong> DISCOs (LESCO, IESCO, K-Electric) require 3-phase green meters for 5kW+ systems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Inverter ACs:</strong> Dual-inverter ACs reduce steady running load from 1,800W down to ~600W-800W after room temperature stabilizes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Water Motors:</strong> Run 1HP/1.5HP motors between 11:00 AM and 2:00 PM to power them directly from free daytime solar.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM SUMMARY BAR */}
      <div className="fixed bottom-14 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-3 shadow-lg print:hidden">
        <div className="flex items-center justify-between gap-3 container-page">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase">System:</span>
              <span className="text-base font-black text-primary-600 dark:text-primary-400">
                {calculations.recommendedKw > 0 ? `${calculations.recommendedKw} kW` : '—'}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                ({systemType.toUpperCase()})
              </span>
            </div>
            <div className="text-[11px] font-extrabold text-gray-900 dark:text-white truncate">
              {calculations.recommendedKw > 0 ? (
                <>Rs {formatPrice(calculations.estimatedSystemCostMin)} - {formatPrice(calculations.estimatedSystemCostMax)}</>
              ) : (
                'Select bill or load'
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              title="Share on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('sizing-result-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-extrabold shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>View Sizing</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

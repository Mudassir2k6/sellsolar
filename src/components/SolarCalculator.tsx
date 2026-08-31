import React, { useState } from 'react';
import {
  Calculator,
  Zap,
  TrendingUp,
  DollarSign,
  Sun,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatPKR } from '../data/mockData';

interface SolarCalculatorProps {
  onFindMatchingPackages?: (capacityKw: number) => void;
  onPostAd?: () => void;
}

export const SolarCalculator: React.FC<SolarCalculatorProps> = ({
  onFindMatchingPackages,
}) => {
  const { calculateSolar, setFilter } = useMarketplace();
  const [billAmount, setBillAmount] = useState<number>(45000);

  const calc = calculateSolar(billAmount);

  const handleMatchListings = () => {
    setFilter('category', 'complete_system');
    setFilter('query', `${calc.recommendedKw}kW`);
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (onFindMatchingPackages) onFindMatchingPackages(calc.recommendedKw);
  };

  const presetBills = [15000, 30000, 45000, 75000, 120000, 250000];

  return (
    <section id="calculator" className="py-16 bg-white border-t border-gray-100">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-primary-200 mb-2">
            <Calculator className="w-3.5 h-3.5" /> Instant System Sizing & ROI
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Pakistan Solar Savings Calculator
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Calculate your recommended system size, estimated monthly savings, and net-metering payback period based on current DISCO / NEPRA electricity tariffs.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-5 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Average Monthly Electricity Bill
                </label>
                <span className="text-xl font-extrabold text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-2xs">
                  {formatPKR(billAmount)}
                </span>
              </div>

              {/* Slider */}
              <div className="mt-4">
                <input
                  type="range"
                  min={10000}
                  max={300000}
                  step={5000}
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-1.5">
                  <span>Rs 10,000</span>
                  <span>Rs 150,000</span>
                  <span>Rs 300,000+</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {presetBills.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBillAmount(b)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      billAmount === b
                        ? 'bg-primary-500 text-gray-900 shadow-2xs font-bold'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {formatPKR(b)}
                  </button>
                ))}
              </div>
            </div>

            {/* Assumptions Box */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/70 text-xs text-gray-600 space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary-500" /> Calculation Assumptions
              </div>
              <ul className="space-y-1 text-gray-500 text-[11px]">
                <li>• Average grid tariff: ~Rs 60 / unit (kWh)</li>
                <li>• 4.5 peak sunshine generation hours / day</li>
                <li>• Tier-1 580W Monocrystalline PERC panels</li>
                <li>• 3-Phase Net-Metering grid export approved</li>
              </ul>
            </div>

            <button
              onClick={handleMatchListings}
              className="w-full btn-primary py-3 text-sm font-bold shadow-md flex items-center justify-center gap-2"
            >
              <span>View {calc.recommendedKw}kW Solar Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Calculated Results Card */}
          <div className="lg:col-span-7 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-700 pb-5">
              <div>
                <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                  Recommended System Size
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                  <span>{calc.recommendedKw} kW</span>
                  <span className="text-sm font-normal text-gray-300">
                    ({calc.recommendedKw >= 10 ? 'Three-Phase' : 'Single / Three Phase'})
                  </span>
                </div>
              </div>

              <div className="bg-gray-800/80 border border-gray-700 px-4 py-2 rounded-xl text-right sm:text-right">
                <div className="text-[11px] text-gray-400">Payback Period</div>
                <div className="text-xl font-extrabold text-secondary-400">
                  ~{calc.estimatedPaybackYears} Years
                </div>
              </div>
            </div>

            {/* 4-Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-gray-800/60 border border-gray-700/80 p-3.5 rounded-xl">
                <div className="text-[11px] text-gray-400">Monthly Bill Savings</div>
                <div className="text-lg sm:text-xl font-extrabold text-secondary-400 mt-0.5">
                  {formatPKR(calc.estimatedMonthlySavings)}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Up to 90% bill reduction</div>
              </div>

              <div className="bg-gray-800/60 border border-gray-700/80 p-3.5 rounded-xl">
                <div className="text-[11px] text-gray-400">Annual Savings</div>
                <div className="text-lg sm:text-xl font-extrabold text-primary-400 mt-0.5">
                  {formatPKR(calc.estimatedAnnualSavings)}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Direct electricity savings</div>
              </div>

              <div className="bg-gray-800/60 border border-gray-700/80 p-3.5 rounded-xl col-span-2 sm:col-span-1">
                <div className="text-[11px] text-gray-400">Est. Total Turnkey Cost</div>
                <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  {formatPKR(calc.systemCostEstimate)}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Panels + Inverter + Structure</div>
              </div>
            </div>

            {/* Hardware breakdown detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl border border-gray-700/50">
                <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">
                    {calc.panelCount}x Solar Panels (580W)
                  </div>
                  <div className="text-[11px] text-gray-400">Tier-1 Monocrystalline PERC</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl border border-gray-700/50">
                <Layers className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">
                    {calc.roofAreaSqFt} sq ft Roof Space
                  </div>
                  <div className="text-[11px] text-gray-400">South/West unobstructed roof area</div>
                </div>
              </div>
            </div>

            {/* Battery Backup Recommendation */}
            <div className="bg-primary-500/10 border border-primary-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-primary-200">
              <ShieldCheck className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-primary-300">Energy Storage Suggestion: </span>
                <span>{calc.batteryRecommendation}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-secondary-400" />
                Reduces {calc.co2SavedTons} tons of CO₂ emissions annually
              </span>
              <span className="font-semibold text-primary-400">25-Year Warranty Lifecycle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

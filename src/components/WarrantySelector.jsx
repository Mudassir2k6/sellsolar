import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Check } from 'lucide-react';

const SUGGESTIONS = [
  { label: '6 Months', value: 0.5, unit: 'months', count: 6 },
  { label: '1 Year', value: 1, unit: 'years', count: 1 },
  { label: '1.2 Years', value: 1.2, unit: 'years', count: 1.2 },
  { label: '1.5 Years', value: 1.5, unit: 'years', count: 1.5 },
  { label: '2 Years', value: 2, unit: 'years', count: 2 },
  { label: '5 Years', value: 5, unit: 'years', count: 5 },
  { label: '10 Years', value: 10, unit: 'years', count: 10 },
  { label: '12 Years', value: 12, unit: 'years', count: 12 },
  { label: '25 Years', value: 25, unit: 'years', count: 25 },
];

/**
 * Format warranty years into readable label (e.g. 1.2 Years, 6 Months, 45 Days)
 */
export function formatWarrantyShort(years) {
  if (years === null || years === undefined || years === '' || Number(years) <= 0) {
    return 'No warranty';
  }
  const num = Number(years);
  if (isNaN(num)) return 'No warranty';

  // Check if days (very small fraction)
  const approxDays = Math.round(num * 365);
  if (num < 0.1 && approxDays > 0) {
    return `${approxDays}d warranty`;
  }

  // Check if months (less than 1 year or exact fraction)
  const approxMonths = Math.round(num * 12);
  if (num < 1 && approxMonths > 0 && Math.abs(num - approxMonths / 12) < 0.03) {
    return `${approxMonths} mo warranty`;
  }

  const formattedNum = Number.isInteger(num) ? num : parseFloat(num.toFixed(1));
  return `${formattedNum} yr warranty`;
}

export function formatWarrantyLong(years) {
  if (years === null || years === undefined || years === '' || Number(years) <= 0) {
    return 'Out of Warranty / No Warranty';
  }
  const num = Number(years);
  if (isNaN(num)) return 'Out of Warranty';

  const approxDays = Math.round(num * 365);
  if (num < 0.1 && approxDays > 0) {
    return `${approxDays} Days Warranty`;
  }

  const approxMonths = Math.round(num * 12);
  if (num < 1 && approxMonths > 0 && Math.abs(num - approxMonths / 12) < 0.03) {
    return `${approxMonths} ${approxMonths === 1 ? 'Month' : 'Months'} Warranty`;
  }

  const formattedNum = Number.isInteger(num) ? num : parseFloat(num.toFixed(1));
  return `${formattedNum} ${formattedNum === 1 ? 'Year' : 'Years'} Warranty`;
}

export default function WarrantySelector({ value, onChange, className = '' }) {
  // Determine if in warranty
  const numericVal = value !== null && value !== undefined && value !== '' ? Number(value) : null;
  const hasWarranty = numericVal !== null && !isNaN(numericVal) && numericVal > 0;

  // Local state for custom unit & count
  const [inWarranty, setInWarranty] = useState(hasWarranty);
  const [unit, setUnit] = useState('years'); // 'years' | 'months' | 'days'
  const [inputValue, setInputValue] = useState(
    numericVal ? (Number.isInteger(numericVal) ? numericVal.toString() : parseFloat(numericVal.toFixed(2)).toString()) : '1'
  );

  // Sync when prop value changes externally
  useEffect(() => {
    if (numericVal !== null && !isNaN(numericVal) && numericVal > 0) {
      setInWarranty(true);
      // Auto-detect unit
      if (numericVal < 0.1) {
        const days = Math.round(numericVal * 365);
        setUnit('days');
        setInputValue(days.toString());
      } else if (numericVal < 1) {
        const months = Math.round(numericVal * 12);
        setUnit('months');
        setInputValue(months.toString());
      } else {
        setUnit('years');
        const formatted = Number.isInteger(numericVal) ? numericVal.toString() : parseFloat(numericVal.toFixed(2)).toString();
        setInputValue(formatted);
      }
    } else if (value === '' || value === null) {
      // no warranty or not set
    }
  }, [value]);

  const calculateYearsValue = (rawNum, selectedUnit) => {
    const num = parseFloat(rawNum);
    if (isNaN(num) || num <= 0) return null;
    if (selectedUnit === 'days') {
      return parseFloat((num / 365).toFixed(4));
    }
    if (selectedUnit === 'months') {
      return parseFloat((num / 12).toFixed(3));
    }
    return parseFloat(num.toFixed(2));
  };

  const handleInWarrantyToggle = (enabled) => {
    setInWarranty(enabled);
    if (!enabled) {
      onChange(null);
    } else {
      const computedYears = calculateYearsValue(inputValue || '1', unit);
      onChange(computedYears !== null ? computedYears : 1);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (inWarranty) {
      const computedYears = calculateYearsValue(val, unit);
      onChange(computedYears);
    }
  };

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (inWarranty) {
      const computedYears = calculateYearsValue(inputValue, newUnit);
      onChange(computedYears);
    }
  };

  const handleApplySuggestion = (sug) => {
    setInWarranty(true);
    setUnit(sug.unit);
    setInputValue(sug.count.toString());
    onChange(sug.value);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span>Product Warranty Status</span>
        </label>
        {inWarranty && numericVal && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Check className="h-3 w-3" />
            {formatWarrantyLong(numericVal)}
          </span>
        )}
      </div>

      {/* Primary Radio / Segmented Toggle: In Warranty vs No Warranty */}
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Warranty Status">
        <button
          type="button"
          role="radio"
          aria-checked={inWarranty}
          onClick={() => handleInWarrantyToggle(true)}
          className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition-all ${
            inWarranty
              ? 'border-primary-500 bg-primary-50/70 text-primary-800 dark:border-primary-400 dark:bg-primary-950/50 dark:text-primary-200 shadow-sm ring-2 ring-primary-500/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
              inWarranty ? 'border-primary-600 bg-primary-600 dark:border-primary-400 dark:bg-primary-400' : 'border-gray-400'
            }`}
          >
            {inWarranty && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-gray-900" />}
          </div>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            In Warranty
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={!inWarranty}
          onClick={() => handleInWarrantyToggle(false)}
          className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition-all ${
            !inWarranty
              ? 'border-gray-400 bg-gray-100 text-gray-800 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
              !inWarranty ? 'border-gray-600 bg-gray-600 dark:border-gray-400 dark:bg-gray-400' : 'border-gray-400'
            }`}
          >
            {!inWarranty && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-gray-900" />}
          </div>
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-gray-400" />
            No / Out of Warranty
          </span>
        </button>
      </div>

      {/* Expandable Warranty Details when In Warranty is selected */}
      {inWarranty && (
        <div className="rounded-2xl border border-primary-100 dark:border-primary-900/60 bg-gradient-to-b from-primary-50/40 to-transparent dark:from-primary-950/20 p-4 space-y-3.5 animate-fadeIn">
          {/* Quick Suggestions Chips */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Quick Suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((sug) => {
                const isSelected =
                  numericVal !== null && Math.abs(numericVal - sug.value) < 0.02;
                return (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => handleApplySuggestion(sug)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-400/50 dark:bg-primary-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {sug.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Duration & Unit Input */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Custom Duration (e.g. 1.2 years, 6 months, 45 days)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="e.g. 1.2 or 6"
                  className="input-field w-full text-base font-semibold"
                />
              </div>

              {/* Unit Dropdown / Selector */}
              <div className="w-36 sm:w-40 shrink-0">
                <select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="select-field w-full font-semibold"
                >
                  <option value="years">Year(s)</option>
                  <option value="months">Month(s)</option>
                  <option value="days">Day(s)</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>Tip: Enter decimal values like <strong className="text-gray-700 dark:text-gray-300">1.2</strong> or <strong className="text-gray-700 dark:text-gray-300">2.5</strong> for exact remaining warranty.</span>
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Zap, ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { getActiveDailyRates } from '../data/todayPricesData';
import { getPakistanDateDetails } from '../lib/dateUtils';

/** sessionStorage key read by TodayPricesPage to pick the category and highlight the rate sheet */
export const RATES_FOCUS_KEY = 'sellsolar_rates_focus';

// `category` matches the category ids used by TodayPricesPage (panel / inverter / battery).
const TABS = [
  { id: 'panel', label: 'Panels', field: 'rates', unit: 'Rs / Watt', decimals: 2, showCapacity: false },
  { id: 'inverter', label: 'Inverters', field: 'inverterRates', unit: 'Rs', decimals: 0, showCapacity: false },
  { id: 'battery', label: 'Batteries', field: 'batteryRates', unit: 'Rs', decimals: 0, showCapacity: true },
];

// Popular panels are listed first (if present on today's sheet); everything else follows in sheet order.
const PREFERRED_PANELS = [
  ['longi', '645'],
  ['ja solar', '625'],
  ['canadian', '625'],
  ['korean', '585'],
  ['astronergy', '720'],
];
const VISIBLE_ROWS = 3; // lists longer than this get the duplicated seamless-loop copy
const SCROLL_PX_PER_SECOND = 22;

function orderRows(rates, tabId) {
  const list = Array.isArray(rates) ? rates.filter((r) => r && typeof r.rate === 'number') : [];
  if (tabId !== 'panel') return list;
  const ordered = [];
  PREFERRED_PANELS.forEach(([brand, watt]) => {
    const hit = list.find(
      (r) =>
        !ordered.includes(r) &&
        String(r.brand).toLowerCase().includes(brand) &&
        String(r.model).includes(watt)
    );
    if (hit) ordered.push(hit);
  });
  list.forEach((r) => {
    if (!ordered.includes(r)) ordered.push(r);
  });
  return ordered;
}

function formatNumber(value, decimals) {
  return Number(value).toLocaleString('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Trend({ status, change, decimals }) {
  const amount = formatNumber(Math.abs(change), decimals);
  if (status === 'down') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
        <TrendingDown className="h-3 w-3" />
        {amount}
      </span>
    );
  }
  if (status === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
        <TrendingUp className="h-3 w-3" />
        {amount}
      </span>
    );
  }
  return <Minus className="h-3 w-3 text-gray-400" aria-label="No change" />;
}

function RateRow({ r, tab }) {
  const details = [
    r.model,
    tab.showCapacity && r.capacity ? r.capacity : null,
    r.badge && r.badge !== 'Ready Stock' ? r.badge : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-gray-900 dark:text-gray-100">{r.brand}</p>
        <p className="truncate text-[10px] text-gray-500 dark:text-gray-400" title={details}>
          {details}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[12px] font-extrabold text-gray-900 dark:text-white">
          {formatNumber(r.rate, tab.decimals)}
        </p>
        <Trend status={r.status} change={Number(r.change) || 0} decimals={tab.decimals} />
      </div>
    </li>
  );
}

/**
 * Desktop-only (xl+) live rate card shown on the left of the home hero.
 * Tabs: Panels / Inverters / Batteries (today's date-wise sheet, same carry-forward logic as the rates page).
 * "Full rate sheet" opens the rates page on the same category and highlights the rate sheet area.
 */
export default function HeroSideRatesCard({ onOpenRates }) {
  const [activeTab, setActiveTab] = useState('panel');

  const sheet = useMemo(() => {
    const { shortDate } = getPakistanDateDetails();
    try {
      return { key: shortDate, data: getActiveDailyRates(shortDate) };
    } catch {
      return { key: shortDate, data: null };
    }
  }, []);

  const tabsWithRows = useMemo(
    () =>
      TABS.map((tab) => ({ tab, rows: orderRows(sheet.data?.[tab.field], tab.id) })).filter(
        (entry) => entry.rows.length > 0
      ),
    [sheet.data]
  );

  const current = tabsWithRows.find((entry) => entry.tab.id === activeTab) || tabsWithRows[0];
  const rows = current?.rows || [];
  const tab = current?.tab || TABS[0];

  // Auto-scroll (seamless loop over a duplicated list). Pauses on hover / touch,
  // never runs for users who prefer reduced motion, and the list stays manually scrollable.
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0; // new tab -> start from the top
    if (!el || rows.length <= VISIBLE_ROWS) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let raf = 0;
    let last = performance.now();
    let pos = 0;
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (pausedRef.current || document.hidden) {
        pos = el.scrollTop;
      } else {
        pos += (dt * SCROLL_PX_PER_SECOND) / 1000;
        const loopAt = el.scrollHeight / 2;
        if (loopAt > 0 && pos >= loopAt) pos -= loopAt;
        el.scrollTop = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rows.length, tab.id]);

  if (!tabsWithRows.length) return null;

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  const openFullSheet = () => {
    try {
      sessionStorage.setItem(RATES_FOCUS_KEY, tab.id);
    } catch {
      /* storage unavailable: page still opens, just without the pre-selected category */
    }
    onOpenRates?.();
  };

  return (
    <aside
      aria-label="Today's solar rates"
      className="hidden xl:flex absolute left-0 inset-y-0 w-52 2xl:w-56 text-left"
    >
      {/* inset-y-0 makes the card exactly as tall as the hero text block, so nothing is cut off */}
      <div className="flex h-full w-full min-h-0 flex-col rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg p-2.5">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-[11px] font-extrabold text-gray-900 dark:text-white">
            <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Today&apos;s Rates
          </p>
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
            LIVE
          </span>
        </div>

        <div role="tablist" aria-label="Rate category" className="mt-1.5 flex shrink-0 gap-1">
          {tabsWithRows.map(({ tab: t }) => {
            const selected = t.id === tab.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 rounded-md px-1 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                  selected
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-950/50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <p className="mt-1 shrink-0 text-[10px] text-gray-500 dark:text-gray-400">
          {sheet.key} · {tab.unit} · {rows.length} items
        </p>

        <div
          ref={scrollRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          aria-label={`${tab.label} rates list (scrolls automatically, hover to pause)`}
          className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul>
            {rows.map((r, i) => (
              <RateRow key={`a-${tab.id}-${i}-${r.brand}-${r.model}`} r={r} tab={tab} />
            ))}
          </ul>
          {/* Duplicate list makes the loop seamless; hidden from screen readers */}
          {rows.length > VISIBLE_ROWS ? (
            <ul aria-hidden="true">
              {rows.map((r, i) => (
                <RateRow key={`b-${tab.id}-${i}-${r.brand}-${r.model}`} r={r} tab={tab} />
              ))}
            </ul>
          ) : null}
        </div>

        {onOpenRates ? (
          <button
            type="button"
            onClick={openFullSheet}
            className="mt-1.5 inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
          >
            Full {tab.label.toLowerCase()} sheet
            <ArrowRight className="h-3 w-3" />
          </button>
        ) : null}
      </div>
    </aside>
  );
}

'use client';

import { ArrowRight, BatteryCharging, Sun, Zap, CircleDollarSign } from 'lucide-react';

const LANDINGS = {
  'used-solar': {
    icon: Sun,
    h1: 'Buy & Sell Used Solar Equipment in Pakistan',
    lead:
      'Find used solar panels, hybrid inverters and lithium batteries from verified sellers across Lahore, Karachi, Islamabad and all Pakistan.',
    bullets: [
      'Used Longi, Jinko, Canadian and JA Solar panels',
      'Inspected hybrid and on-grid inverters',
      'Second-hand lithium and tubular batteries',
      'Free listings for sellers — reach real buyers fast',
    ],
    ctaPrimary: { label: 'Browse used solar ads', page: 'home' },
    ctaSecondary: { label: 'Sell used solar free', page: 'sell-solar' },
  },
  'solar-price': {
    icon: CircleDollarSign,
    h1: 'Today Solar Price in Pakistan — Panels, Inverters & Batteries',
    lead:
      'Check live solar rates in Pakistan: panel price per watt, hybrid inverter cost and lithium battery rates updated for buyers and installers.',
    bullets: [
      'Daily solar panel PKR/watt market ranges',
      'Hybrid inverter prices by kW size',
      'Lithium battery pack benchmarks',
      'Plan 5kW–20kW systems with real market numbers',
    ],
    ctaPrimary: { label: "View today's solar rates", page: 'prices' },
    ctaSecondary: { label: 'Open load calculator', page: 'calculator' },
  },
  'solar-inverter': {
    icon: Zap,
    h1: 'Solar Inverter Price & Used Inverters for Sale in Pakistan',
    lead:
      'Compare new and used solar inverters — Inverex, Homage, Growatt, GoodWe, Solis and more — with city-wise sellers on SellSolar.',
    bullets: [
      'Hybrid, on-grid and off-grid inverter listings',
      'Used inverter deals with warranty notes',
      'Match inverter size to your load calculator result',
      'Dealer and individual sellers across Pakistan',
    ],
    ctaPrimary: { label: 'Find solar inverters', page: 'home' },
    ctaSecondary: { label: 'Check inverter rates', page: 'prices' },
  },
  'solar-batteries': {
    icon: BatteryCharging,
    h1: 'Solar Batteries & Lithium Battery Price in Pakistan',
    lead:
      'Buy used and new solar batteries — lithium, tubular and gel — with transparent pricing and verified marketplace sellers.',
    bullets: [
      'Lithium battery packs for hybrid systems',
      'Tubular battery options for backup',
      'Compare capacity, cycles and city availability',
      'Safe buyer tips before you pay',
    ],
    ctaPrimary: { label: 'Browse solar batteries', page: 'home' },
    ctaSecondary: { label: 'Safety tips', page: 'safety' },
  },
  'solar-panels': {
    icon: Sun,
    h1: 'Solar Panels for Sale in Pakistan — Used & New',
    lead:
      'Shop used and new solar panels from Tier-1 brands. Filter by wattage, city and condition, then contact sellers directly on SellSolar.',
    bullets: [
      'Used and new mono / bifacial modules',
      'Brand filters: Longi, Jinko, JA, Trina, Canadian',
      'City search: Lahore, Karachi, Islamabad, Faisalabad',
      'Post your own panel ad in minutes',
    ],
    ctaPrimary: { label: 'Buy solar panels', page: 'buy-solar' },
    ctaSecondary: { label: 'Sell panels free', page: 'sell-solar' },
  },
};

export const KEYWORD_LANDING_KEYS = Object.keys(LANDINGS);

export default function KeywordLandingPage({ pageKey, onNavigate }) {
  const data = LANDINGS[pageKey];
  if (!data) return null;
  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <main className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
            <Icon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {data.h1}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
            {data.lead}
          </p>

          <ul className="mt-8 space-y-3">
            {data.bullets.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white/80 px-4 py-3 text-sm font-medium text-gray-800 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-100"
              >
                <span className="mt-0.5 text-primary-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate?.(data.ctaPrimary.page)}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              {data.ctaPrimary.label}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.(data.ctaSecondary.page)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              {data.ctaSecondary.label}
            </button>
          </div>

          <article className="prose prose-sm mt-12 max-w-none text-gray-600 dark:prose-invert dark:text-gray-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Why SellSolar for this search?</h2>
            <p>
              SellSolar.pk is built for Pakistan solar shoppers searching for solar price, used solar,
              inverter and battery deals. Listings are organized for fast comparison, and sellers can
              post free ads to reach buyers in major cities.
            </p>
            <p>
              Use today&apos;s rates page before you buy, run the load calculator for system sizing, then
              contact verified dealers or individual sellers directly.
            </p>
          </article>
        </div>
      </main>
    </div>
  );
}

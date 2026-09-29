'use client';

import { ArrowRight, BatteryCharging, Sun, Zap, CircleDollarSign } from 'lucide-react';

const LANDINGS = {
  'used-solar': {
    icon: Sun,
    h1: 'Used Solar Plates, Inverters & Batteries in Pakistan',
    lead:
      'Buy and sell verified second-hand used solar plates, used hybrid inverters, and solar batteries from trusted sellers across Lahore, Karachi, Islamabad and all Pakistan.',
    bullets: [
      'Used Longi, Jinko, Canadian and JA Solar plates',
      'Inspected hybrid and on-grid solar inverters',
      'Second-hand lithium LiFePO4 and tubular batteries',
      'Free listings for sellers — reach genuine solar buyers fast',
    ],
    ctaPrimary: { label: 'Browse used solar ads', page: 'home' },
    ctaSecondary: { label: 'Sell used solar free', page: 'sell-solar' },
  },
  'solar-price': {
    icon: CircleDollarSign,
    h1: 'Today Solar Plate Price & Solar Rates in Pakistan',
    lead:
      'Check live solar plate price per watt, hybrid inverter cost (3kW, 5kW, 6kW, 10kW), and lithium / tubular battery rates in Pakistan updated daily.',
    bullets: [
      'Daily solar plate PKR/watt market benchmark rates',
      'Hybrid solar inverter prices by kW capacity',
      'Lithium battery pack and tubular battery benchmarks',
      'Plan 5kW, 10kW & 20kW home solar systems with real market numbers',
    ],
    ctaPrimary: { label: "View today's solar plate rates", page: 'prices' },
    ctaSecondary: { label: 'Open solar calculator', page: 'calculator' },
  },
  'solar-inverter': {
    icon: Zap,
    h1: 'Solar Inverters & Invertor Price in Pakistan (Hybrid & On-Grid)',
    lead:
      'Compare solar inverter prices in Pakistan. Buy and sell new and used hybrid, off-grid and on-grid inverters (Inverex, Growatt, GoodWe, Knox, Solis, Fronus) at best market rates.',
    bullets: [
      'Hybrid, on-grid and off-grid solar inverter listings',
      'Inverex, Knox, Growatt, GoodWe & Solis inverters (3kW to 10kW)',
      'Used inverter deals with warranty and condition notes',
      'Dealer and individual sellers across all major Pakistani cities',
    ],
    ctaPrimary: { label: 'Find solar inverters', page: 'home' },
    ctaSecondary: { label: 'Check inverter rates', page: 'prices' },
  },
  'solar-batteries': {
    icon: BatteryCharging,
    h1: 'Solar Batteries & Lithium Battery Price in Pakistan',
    lead:
      'Compare solar battery prices in Pakistan — LiFePO4 lithium batteries (48V/51.2V 100Ah) and deep-cycle tubular backup batteries (Phoenix, Osaka, Daewoo) at verified rates.',
    bullets: [
      'LiFePO4 lithium battery packs for hybrid solar systems (6000 cycles)',
      'Tall tubular deep-cycle batteries for loadshedding backup',
      'Compare capacity, cycle life, warranty, and city availability',
      'Verified battery dealers and direct seller listings',
    ],
    ctaPrimary: { label: 'Browse solar batteries', page: 'home' },
    ctaSecondary: { label: "Check today's battery rates", page: 'prices' },
  },
  'solar-panels': {
    icon: Sun,
    h1: 'Solar Plates & Panels for Sale in Pakistan (New & Used)',
    lead:
      'Shop Tier-1 solar plates in Pakistan. Compare solar plate prices for Longi, Jinko, Canadian Solar, JA Solar, and Astronergy across Lahore, Karachi, Islamabad, and all cities.',
    bullets: [
      'Tier-1 550W, 585W & 645W TopCon & Mono PERC solar plates',
      'Check today solar plate rate per watt before buying',
      'Used solar plates with verified seller condition',
      'Official barcode & serial verification portal for peace of mind',
    ],
    ctaPrimary: { label: 'Buy solar plates', page: 'buy-solar' },
    ctaSecondary: { label: "Check today's plate prices", page: 'prices' },
  },
  'solar-plates': {
    icon: Sun,
    h1: 'Solar Plates Price in Pakistan — Tier-1 New & Used Solar Plates',
    lead:
      'Find the latest solar plates price in Pakistan. Browse Tier-1 solar plates from Longi, Jinko, Canadian Solar, and JA Solar with verified serial numbers.',
    bullets: [
      '550W, 585W and 645W Tier-1 solar plates for home & commercial systems',
      'Daily updated PKR per watt solar plate benchmarks',
      'Used solar plates from genuine home owners and dealers',
      'Instant manufacturer barcode verification',
    ],
    ctaPrimary: { label: 'View Solar Plates', page: 'solar-panels' },
    ctaSecondary: { label: "Check Daily Rates", page: 'prices' },
  },
};

export const KEYWORD_LANDING_KEYS = Object.keys(LANDINGS);

export default function KeywordLandingPage({ pageKey, onNavigate }) {
  const data = LANDINGS[pageKey];
  if (!data) return null;
  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20 sm:pt-24">
      <main className="container-page py-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md shadow-primary-500/30">
            <Icon className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {data.h1}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
            {data.lead}
          </p>

          <ul className="mt-5 space-y-2.5">
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

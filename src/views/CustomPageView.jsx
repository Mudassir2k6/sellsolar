'use client';

import React from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  PhoneCall,
  Calculator,
  Tag,
  Sun,
  Layers,
  Award
} from 'lucide-react';

export default function CustomPageView({
  pageData,
  onNavigate,
  onPostAd
}) {
  const title = pageData?.title || 'Custom Page';
  const heroHeading = pageData?.heroHeading || pageData?.title || 'SellSolar Custom Page';
  const description = pageData?.description || 'Information and resources provided by SellSolar Pakistan.';
  const category = pageData?.category || 'Information';
  const path = pageData?.path || '';

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-200 pt-20 sm:pt-24 lg:pt-28">
      {/* Breadcrumb Bar */}
      <div className="border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs">
        <div className="container-page py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('home')}
                className="hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Home
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {category}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {title}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-6 sm:py-8 bg-gradient-to-b from-primary-500/10 via-amber-500/5 to-transparent border-b border-gray-200/60 dark:border-gray-800">
        <div className="container-page max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/70 border border-primary-300 dark:border-primary-800 text-primary-900 dark:text-primary-300 text-xs font-bold tracking-wide shadow-2xs mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Verified Platform Page • {category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-2.5">
            {heroHeading}
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-5">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('buy-solar')}
              className="btn-primary text-xs sm:text-sm px-4 py-2 shadow-sm inline-flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              <span>Browse Solar Marketplace</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('calculator')}
              className="btn-secondary text-xs sm:text-sm px-4 py-2 inline-flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>Solar Load Calculator</span>
            </button>
            <button
              type="button"
              onClick={() => onPostAd ? onPostAd() : onNavigate && onNavigate('post-ad')}
              className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Post Your Solar Ad</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-6 sm:py-8">
        <div className="container-page max-w-4xl space-y-5">
          {/* Card 1: Primary Overview */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  About This Service & Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  URL Route: <span className="font-mono text-amber-600 dark:text-amber-400">{path}</span>
                </p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
              <p>
                {description}
              </p>
              <p>
                SellSolar is Pakistan's premier solar equipment marketplace, connecting thousands of solar buyers, verified dealers, certified EPC solar installers, and verified equipment importers across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Quetta.
              </p>
            </div>
          </div>

          {/* Card 2: Features & Guarantee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
              <Zap className="w-6 h-6 text-amber-500 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Direct Buyer-Seller Deals
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Connect directly on WhatsApp or call with zero broker cuts or hidden commissions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
              <Layers className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Verified Solar Specs
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                N-Type, TopCon, Bifacial Tier-1 panels and hybrid inverters with authentic warranties.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
              <Award className="w-6 h-6 text-purple-500 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Daily Live Rates
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Real-time per-watt and per-kW rates updated daily for major Pakistani cities.
              </p>
            </div>
          </div>

          {/* Card 3: Need Custom Assistance */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Have specific requirements or questions?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Our technical support team and solar engineers are ready to assist you.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('contact')}
                className="btn-primary text-xs sm:text-sm px-4 py-2.5 flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

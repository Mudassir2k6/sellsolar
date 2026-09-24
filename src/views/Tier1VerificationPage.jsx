import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Mail,
  Smartphone,
  Search,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Sun,
  FileText,
  BadgeCheck,
  Building2,
  HelpCircle,
  TrendingDown,
  Layers,
  ChevronRight
} from 'lucide-react';
import { TIER1_PANELS_VERIFICATION, PANEL_INSPECTION_CHECKLIST } from '../data/tier1VerificationData';

export default function Tier1VerificationPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('all');
  const [testSerial, setTestSerial] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [quickVerifyBrand, setQuickVerifyBrand] = useState('canadian-solar');

  const filteredBrands = useMemo(() => {
    return TIER1_PANELS_VERIFICATION.filter((brand) => {
      if (selectedBrandId !== 'all' && brand.id !== selectedBrandId) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        brand.name.toLowerCase().includes(q) ||
        (brand.supportedModels || []).some((m) => m.toLowerCase().includes(q)) ||
        (brand.email || '').toLowerCase().includes(q) ||
        brand.instructions.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedBrandId]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    const brand = TIER1_PANELS_VERIFICATION.find((b) => b.id === quickVerifyBrand);
    if (!brand) return;

    if (testSerial.trim()) {
      navigator.clipboard.writeText(testSerial.trim());
      setCopiedKey('test-serial');
      setTimeout(() => setCopiedKey(null), 2500);
    }

    if (brand.webLink) {
      window.open(brand.webLink, '_blank', 'noopener,noreferrer');
    } else if (brand.email) {
      const subject = encodeURIComponent(`Authenticity Verification Request - Serial: ${testSerial || 'Inquiry'}`);
      const body = encodeURIComponent(`Dear ${brand.name} Pakistan Team,\n\nPlease verify the authenticity of the following solar panel serial number:\nSerial Number: ${testSerial || '[ENTER SERIAL NUMBER]'}\n\nAttached are photos of the barcode underneath the glass and the junction box.\n\nThank you.`);
      window.location.href = `mailto:${brand.email}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-950 via-gray-900 to-gray-950 text-white pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-gray-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-xs text-gray-600">/</span>
            <button
              onClick={() => onNavigate && onNavigate('prices')}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Today's Rates
            </button>
            <span className="text-xs text-gray-600">/</span>
            <span className="text-xs text-primary-400 font-semibold">Tier-1 Panel Verification</span>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-4">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              100% Genuine Solar Verification Hub
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              TIER 1 SOLAR PANELS VERIFICATION
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-300 leading-relaxed">
              Official manufacturer barcode databases, serial number lookups, and Pakistan warranty verification links for Canadian Solar, Jinko, LONGi, JA Solar, Astronergy, Trina, Sunova, Huasun, and Yingli.
            </p>
            <p className="mt-1 text-xs text-primary-300 font-medium">
              نقلی یا بی-گریڈ پلیٹوں سے بچنے کے لیے اپنا بارکوڈ اور سیریل نمبر مینوفیکچرر کے آفیشل پورٹل پر چیک کریں۔
            </p>
          </div>

          {/* Quick Serial Lookup Box */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 max-w-3xl shadow-xl">
            <form onSubmit={handleQuickLookup} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-primary-400" />
                  Quick Portal Launcher & Serial Copier
                </span>
                <span className="text-[11px] text-gray-400">Direct External Redirect</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4">
                  <select
                    value={quickVerifyBrand}
                    onChange={(e) => setQuickVerifyBrand(e.target.value)}
                    className="w-full h-10 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs px-3 focus:outline-none focus:border-primary-500"
                  >
                    {TIER1_PANELS_VERIFICATION.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-5 relative">
                  <input
                    type="text"
                    placeholder="Enter serial number (optional)..."
                    value={testSerial}
                    onChange={(e) => setTestSerial(e.target.value)}
                    className="w-full h-10 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs pl-3 pr-8 focus:outline-none focus:border-primary-500 placeholder-gray-500"
                  />
                  {copiedKey === 'test-serial' && (
                    <span className="absolute right-2 top-2.5 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1 rounded">
                      Copied!
                    </span>
                  )}
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Tip: When you click "Launch Portal", your serial number is automatically copied to your clipboard so you can paste (Ctrl+V) directly into the manufacturer's query page.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-page py-8 sm:py-10">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name, module model, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Brand Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedBrandId('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedBrandId === 'all'
                  ? 'bg-primary-600 text-white font-bold'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All 9 Brands
            </button>
            {TIER1_PANELS_VERIFICATION.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBrandId(b.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  selectedBrandId === b.id
                    ? 'bg-primary-600 text-white font-bold'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* 9 Brand Verification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filteredBrands.map((brand, idx) => (
            <div
              key={brand.id}
              className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-sm border border-amber-500/20">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                        {brand.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <BadgeCheck className="h-3 w-3" />
                        {brand.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 my-4 text-xs">
                  {/* Serial Barcode Location */}
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">
                      <QrCode className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      <span>Barcode Location:</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      {brand.serialLocation}
                    </p>
                  </div>

                  {/* Verification Instructions */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">How to Verify:</span>
                    <p className="text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {brand.instructions}
                    </p>
                  </div>

                  {/* Supported Models */}
                  {brand.supportedModels && brand.supportedModels.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Supported Series:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {brand.supportedModels.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pro Tip */}
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                    <span className="font-bold">Tip: </span>
                    {brand.tips}
                  </div>
                </div>
              </div>

              {/* Action Buttons for this Brand */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 mt-2">
                {brand.webLink && (
                  <div className="flex items-center gap-2">
                    <a
                      href={brand.webLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <span>Open Official Portal</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopy(brand.webLink, `link-${brand.id}`)}
                      title="Copy URL"
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      {copiedKey === `link-${brand.id}` ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {brand.appLink && (
                  <a
                    href={brand.appLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold text-xs transition-colors border border-gray-700"
                  >
                    <Smartphone className="h-3.5 w-3.5 text-sky-400" />
                    <span>Download Trina iOS App</span>
                  </a>
                )}

                {brand.email && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${brand.email}?subject=Panel Authenticity Verification Request`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email Pakistan Desk</span>
                    </a>
                    <button
                      onClick={() => handleCopy(brand.email, `mail-${brand.id}`)}
                      title="Copy Email"
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      {copiedKey === `mail-${brand.id}` ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Physical Inspection & Anti-Counterfeit Checklist */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Buyer Protection Guide
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
                Physical Inspection Checklist for Genuine Tier-1 Solar Plates
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Essential visual audits before releasing payment to dealers in Pakistan.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('prices')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold text-xs hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors self-start cursor-pointer"
            >
              <span>View Today's Per Watt Prices</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PANEL_INSPECTION_CHECKLIST.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start gap-3"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Urdu Advice Box */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-transparent border border-amber-500/20 text-gray-800 dark:text-gray-200 text-xs leading-relaxed">
            <h5 className="font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
              <span>ضروری ہدایات برائے خریدار:</span>
            </h5>
            <p>
              اگر کسی پلیٹ پر بارکوڈ شیشے کے اوپر اسٹیکر کی شکل میں چسپاں ہو یا بارکوڈ مٹا ہوا ہو، تو ایسی پلیٹ ہرگز نہ خریدیں۔ ہمیشہ مینوفیکچرر کے آفیشل پورٹل پر سیریل نمبر ڈال کر چیک کریں تاکہ فلیش ٹیسٹ اور گریڈ-اے (Grade A) کوالٹی کی مکمل تسلی ہو سکے۔
            </p>
          </div>
        </div>

        {/* Bottom Navigation CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gray-900 text-white border border-gray-800">
          <div>
            <h4 className="font-bold text-sm">Need help verifying large commercial consignments?</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Compare today's wholesale per-watt rates across Lahore, Karachi, and Islamabad ready stocks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('prices')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Today's Solar Rates
            </button>
            <button
              onClick={() => onNavigate && onNavigate('dealers')}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-colors border border-gray-700 cursor-pointer"
            >
              Verified Dealers Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

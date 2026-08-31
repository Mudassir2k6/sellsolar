import React, { useState } from 'react';
import {
  Sun,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface FooterProps {
  onNavigate: (page: string) => void;
  onPostAd: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onPostAd }) => {
  const { setFilter } = useMarketplace();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleCityClick = (city: string) => {
    setFilter('city', city);
    onNavigate('home');
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (cat: string) => {
    setFilter('category', cat);
    onNavigate('home');
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="container-page">
        {/* Top Newsletter / Solar Rates Alert */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-850 to-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-700/80 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-primary-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4" /> Weekly Solar Price Alert
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Stay updated with daily Tier-1 panel & inverter rates
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Get weekly updates on per-watt solar panel import prices, dollar rate changes, and DISCO Net-Metering policies in Pakistan.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 bg-secondary-900/60 text-secondary-300 border border-secondary-600 px-4 py-2.5 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-secondary-400" />
                <span>Subscribed! You will receive solar price updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3.5 py-2.5 bg-gray-900/80 border border-gray-700 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 flex-1"
                />
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-5 text-xs font-bold shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-gray-800 text-xs">
          {/* Col 1: Brand & Bio (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Sun className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Sell<span className="text-primary-500">Solar</span>
                <span className="text-[10px] ml-1 text-gray-400 uppercase">.pk</span>
              </span>
            </div>

            <p className="text-gray-400 leading-relaxed max-w-sm text-xs">
              Pakistan's dedicated solar equipment marketplace. Connecting buyers, verified dealers, importers, and EPC installers with zero broker commissions and direct WhatsApp contact.
            </p>

            <div className="pt-2 flex items-center gap-2 text-gray-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-secondary-400" />
              <span>CNIC Verified Sellers & Tier-1 Equipment Only</span>
            </div>
          </div>

          {/* Col 2: Solar Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Equipment
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => handleCategoryClick('panel')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Solar Panels (580W - 600W)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('inverter')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Hybrid & On-Grid Inverters
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('battery')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Lithium LiFePO4 Batteries
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('complete_system')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Complete Net-Metering Systems
                </button>
              </li>
              <li>
                <button
                  onClick={onPostAd}
                  className="text-primary-400 hover:underline font-bold"
                >
                  + Post Free Solar Ad
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Major Cities */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Major Cities
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => handleCityClick('Lahore')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Solar Panels in Lahore
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCityClick('Karachi')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Solar Equipment Karachi
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCityClick('Islamabad')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Net Metering Islamabad
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCityClick('Rawalpindi')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Solar Inverters Rawalpindi
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCityClick('Faisalabad')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Industrial Solar Faisalabad
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCityClick('Multan')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Solar Tube Wells Multan
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links & Tools */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Tools & Guides
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Solar Sizing & ROI Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dealers')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Verified Dealers Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-primary-400 transition-colors"
                >
                  How Net Metering Works
                </button>
              </li>
              <li>
                <span className="text-gray-500">Tier-1 Barcode Verification Guide</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Micro Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} SellSolar.pk. All rights reserved. Pakistan's Solar Equipment Exchange.
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

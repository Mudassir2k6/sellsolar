import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Search,
  Building,
  CheckCircle2,
  Award,
  ArrowLeft,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CITIES } from '../data/mockData';
import { Dealer } from '../types';

interface DealersDirectoryProps {
  onBack: () => void;
  onSelectDealerListings?: (cityOrDealer: string) => void;
}

export const DealersDirectory: React.FC<DealersDirectoryProps> = ({
  onBack,
  onSelectDealerListings,
}) => {
  const { dealers, setFilter } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      if (verifiedOnly && !d.is_verified_dealer) return false;
      if (selectedCity && d.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = d.business_name.toLowerCase().includes(q);
        const matchOwner = d.owner_name.toLowerCase().includes(q);
        const matchCity = d.city.toLowerCase().includes(q);
        const matchSpec = d.specializations.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchOwner && !matchCity && !matchSpec) return false;
      }
      return true;
    });
  }, [dealers, searchQuery, selectedCity, verifiedOnly]);

  const handleWhatsApp = (dealer: Dealer) => {
    const text = encodeURIComponent(
      `Hello ${dealer.business_name}, I found your profile on SellSolar. I would like to get a quote / consultation for a solar system in ${dealer.city}.`
    );
    window.open(`https://wa.me/${dealer.whatsapp}?text=${text}`, '_blank');
  };

  const handleViewInventory = (dealer: Dealer) => {
    setFilter('city', dealer.city);
    onBack();
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-page">
        {/* Back navigation & Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-secondary-600 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> CNIC & Business Verified
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Verified Solar Dealers & EPC Installers
              </h1>
              <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                Connect with licensed solar companies, direct importers, and certified Net-Metering engineering teams across Pakistan.
              </p>
            </div>

            <div className="text-xs text-gray-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              {filteredDealers.length} Certified Companies
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs mb-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, owner, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="">All Cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer px-2">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-400"
            />
            <span>Verified Badge Only</span>
          </label>
        </div>

        {/* Dealers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <div
              key={dealer.id}
              className="card bg-white p-6 border border-gray-200/90 hover:border-primary-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Dealer Header */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={dealer.logo_url}
                    alt={dealer.business_name}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-2xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {dealer.business_name}
                      </h3>
                      {dealer.is_verified_dealer && (
                        <ShieldCheck
                          className="w-4 h-4 text-secondary-600 shrink-0"
                          title="Verified Dealer"
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{dealer.owner_name}</div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{dealer.rating}</span>
                      <span className="text-gray-400 font-normal">
                        ({dealer.reviews_count} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge / Experience */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {dealer.badge && (
                    <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      {dealer.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {dealer.experience_years} Years in Solar
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    CNIC Verified
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{dealer.address}</span>
                </div>

                {/* Specializations Tags */}
                <div className="space-y-1 mb-4">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Specializations:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dealer.specializations.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => handleWhatsApp(dealer)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <a
                  href={`tel:${dealer.phone}`}
                  className="p-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                  title="Call Dealer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleViewInventory(dealer)}
                  className="p-2.5 border border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors text-xs font-bold"
                  title="View Equipment in City"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

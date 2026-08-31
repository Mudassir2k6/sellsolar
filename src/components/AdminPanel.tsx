import React, { useState } from 'react';
import {
  ShieldCheck,
  Package,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  ArrowLeft,
  Search,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatPKR } from '../data/mockData';

interface AdminPanelProps {
  onBack: () => void;
  onSelectListing: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBack,
  onSelectListing,
}) => {
  const { listings, dealers, deleteListing, toggleFeaturedListing, toggleVerifiedDealer } =
    useMarketplace();

  const [activeTab, setActiveTab] = useState<'listings' | 'dealers'>('listings');
  const [search, setSearch] = useState('');

  const totalGMV = listings.reduce((sum, l) => sum + (l.price || 0), 0);

  const filteredListings = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase()) ||
    l.brand.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDealers = dealers.filter((d) =>
    d.business_name.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-page">
        {/* Navigation & Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Admin Control Panel
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                SellSolar Platform Administration
              </h1>
            </div>

            <div className="flex gap-2">
              <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700">
                Total GMV: {formatPKR(totalGMV)}
              </span>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 bg-white border border-gray-200 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Total Solar Listings</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{listings.length}</div>
          </div>

          <div className="card p-4 bg-white border border-gray-200 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Featured Ads</div>
            <div className="text-2xl font-black text-primary-600 mt-1">
              {listings.filter((l) => l.is_featured).length}
            </div>
          </div>

          <div className="card p-4 bg-white border border-gray-200 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Registered Dealers</div>
            <div className="text-2xl font-black text-secondary-600 mt-1">{dealers.length}</div>
          </div>

          <div className="card p-4 bg-white border border-gray-200 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Verified Badges</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {dealers.filter((d) => d.is_verified_dealer).length}
            </div>
          </div>
        </div>

        {/* Tab Header & Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'listings'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manage Listings ({listings.length})
            </button>

            <button
              onClick={() => setActiveTab('dealers')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'dealers'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manage Dealers ({dealers.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Tab 1: Listings Table */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Category / Brand</th>
                    <th className="py-3 px-4">Price (PKR)</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredListings.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={l.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{l.title}</div>
                            <div className="text-[10px] text-gray-500">Seller: {l.seller_name}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-800 capitalize">{l.category}</div>
                        <div className="text-[10px] text-gray-500">{l.brand}</div>
                      </td>

                      <td className="py-3 px-4 font-bold text-gray-900">{formatPKR(l.price)}</td>
                      <td className="py-3 px-4 text-gray-600">{l.city}</td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleFeaturedListing(l.id)}
                          className={`p-1.5 rounded-md border text-xs font-semibold flex items-center gap-1 ${
                            l.is_featured
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              l.is_featured ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                          <span>{l.is_featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectListing(l.id)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                            title="View"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this listing?')) deleteListing(l.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Dealers Table */}
        {activeTab === 'dealers' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Dealer / Business</th>
                    <th className="py-3 px-4">Owner Name</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDealers.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={d.logo_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{d.business_name}</div>
                            <div className="text-[10px] text-gray-400">{d.badge || 'Dealer'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-800 font-semibold">{d.owner_name}</td>
                      <td className="py-3 px-4 text-gray-600">{d.city}</td>
                      <td className="py-3 px-4 text-gray-600">{d.phone}</td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleVerifiedDealer(d.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                            d.is_verified_dealer
                              ? 'bg-secondary-50 text-secondary-700 border-secondary-200'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{d.is_verified_dealer ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  Package,
  MessageSquare,
  Heart,
  Eye,
  Trash2,
  CheckCircle,
  ExternalLink,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatPKR } from '../data/mockData';

interface UserDashboardProps {
  onBack: () => void;
  onPostAd: () => void;
  onSelectListing: (id: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onBack,
  onPostAd,
  onSelectListing,
}) => {
  const { user } = useAuth();
  const { listings, deleteListing, updateListingStatus, enquiries, favorites } =
    useMarketplace();

  const [activeTab, setActiveTab] = useState<'listings' | 'enquiries' | 'verify' | 'favorites'>(
    'listings'
  );
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const myListings = listings.filter((l) => l.user_id === user?.id);
  const activeCount = myListings.filter((l) => l.status === 'active').length;
  const soldCount = myListings.filter((l) => l.status === 'sold').length;
  const totalViews = myListings.reduce((sum, l) => sum + (l.views || 0), 0);

  const myEnquiries = enquiries.filter((e) =>
    myListings.some((l) => l.id === e.listing_id)
  );

  const savedListings = listings.filter((l) => favorites.includes(l.id));

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-page">
        {/* Navigation & Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-gray-900">
                    {user?.business_name || user?.full_name || 'My Dashboard'}
                  </h1>
                  {user?.is_verified_dealer && (
                    <span className="inline-flex items-center gap-1 bg-secondary-50 text-secondary-700 text-xs font-bold px-2 py-0.5 rounded-full border border-secondary-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Dealer
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user?.email} • {user?.city || 'Pakistan'} • Member since 2024
                </p>
              </div>
            </div>

            <button
              onClick={onPostAd}
              className="btn-primary py-2.5 px-4 text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Post New Ad
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 bg-white border border-gray-200/80 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Active Listings</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{activeCount}</div>
          </div>

          <div className="card p-4 bg-white border border-gray-200/80 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Sold Items</div>
            <div className="text-2xl font-black text-secondary-600 mt-1">{soldCount}</div>
          </div>

          <div className="card p-4 bg-white border border-gray-200/80 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Customer Views</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{totalViews}</div>
          </div>

          <div className="card p-4 bg-white border border-gray-200/80 shadow-2xs">
            <div className="text-xs font-semibold text-gray-400">Inquiries Received</div>
            <div className="text-2xl font-black text-primary-600 mt-1">{myEnquiries.length}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-2 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'listings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" /> My Solar Listings ({myListings.length})
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'enquiries'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Inquiries ({myEnquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4" /> Saved Items ({savedListings.length})
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'verify'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Dealer Verification
          </button>
        </div>

        {/* Tab 1: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {myListings.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              listing.status === 'active'
                                ? 'bg-secondary-100 text-secondary-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {listing.status}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {formatPKR(listing.price)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">
                          {listing.title}
                        </h4>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                          <span>{listing.city}</span>
                          <span>• {listing.views} Views</span>
                          <span>• {listing.condition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onSelectListing(listing.id)}
                        className="btn-ghost py-1.5 px-3 text-xs font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Ad
                      </button>

                      {listing.status === 'active' ? (
                        <button
                          onClick={() => updateListingStatus(listing.id, 'sold')}
                          className="text-xs font-semibold text-gray-700 hover:text-secondary-700 bg-gray-100 hover:bg-secondary-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                        >
                          Mark as Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => updateListingStatus(listing.id, 'active')}
                          className="text-xs font-semibold text-secondary-700 bg-secondary-50 hover:bg-secondary-100 px-3 py-1.5 rounded-lg border border-secondary-200 transition-colors"
                        >
                          Relist Active
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Delete this listing permanently?')) {
                            deleteListing(listing.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-10 bg-white border border-gray-200 text-center max-w-md mx-auto">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-gray-800">No Listings Yet</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  You haven't posted any solar equipment ads. List your panels, inverters or batteries now for free!
                </p>
                <button
                  onClick={onPostAd}
                  className="btn-primary py-2 px-5 text-xs font-bold mx-auto"
                >
                  Post First Ad
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {myEnquiries.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {myEnquiries.map((enq) => (
                  <div key={enq.id} className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <span>{enq.sender_name}</span>
                        <span className="text-xs font-normal text-gray-400">
                          inquiring about "{enq.listing_title}"
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">{enq.created_at}</span>
                    </div>

                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      "{enq.message}"
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <a
                        href={`https://wa.me/${enq.sender_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Customer ({enq.sender_phone})
                      </a>
                      <a
                        href={`tel:${enq.sender_phone}`}
                        className="text-gray-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-10 bg-white border border-gray-200 text-center max-w-md mx-auto">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-gray-800">No Inquiries Yet</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Inquiries from interested buyers will appear here automatically with their phone and WhatsApp info.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {savedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedListings.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => onSelectListing(l.id)}
                    className="card p-4 bg-white border border-gray-200 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <img
                        src={l.image_url}
                        alt={l.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-base font-bold text-gray-900">{formatPKR(l.price)}</div>
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-1 mt-0.5">
                      {l.title}
                    </h4>
                    <div className="text-[11px] text-gray-500 mt-2 flex justify-between">
                      <span>{l.city}</span>
                      <span className="text-primary-600 font-semibold">View Details &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-10 bg-white border border-gray-200 text-center max-w-md mx-auto">
                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-gray-800">No Saved Items</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Click the heart icon on any solar equipment card to save it for quick reference later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Dealer Verification */}
        {activeTab === 'verify' && (
          <div className="card p-6 sm:p-8 bg-white border border-gray-200 max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary-100 text-secondary-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Apply for Verified Dealer Status
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Get the green Verified Badge, higher search visibility, and listing trust by submitting your business credentials.
              </p>
            </div>

            {verificationSubmitted ? (
              <div className="bg-secondary-50 border border-secondary-200 text-secondary-800 p-5 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-secondary-600 mx-auto" />
                <h4 className="font-bold text-sm">Application Under Review!</h4>
                <p className="text-xs text-gray-600">
                  Our compliance team will verify your CNIC / NTN documents within 24-48 business hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setVerificationSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Business / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Solar Engineering PVT LTD"
                    defaultValue={user?.business_name || ''}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      National Tax Number (NTN / STRN)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 7894561-2"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      CNIC Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="35201-1234567-1"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Physical Shop / Office Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Shop #, Plaza, Main Market, City"
                    defaultValue={user?.business_address || ''}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    AEDB Certification Category (Optional)
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    <option value="">None / Standard Distributor</option>
                    <option value="C1">AEDB Category C-1 (Up to 1MW)</option>
                    <option value="C2">AEDB Category C-2 (Up to 500kW)</option>
                    <option value="C3">AEDB Category C-3 (Up to 250kW)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-xs font-bold shadow-md"
                >
                  Submit for Verification
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

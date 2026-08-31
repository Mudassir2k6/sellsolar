import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Eye,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  Check,
  Zap,
  Info,
} from 'lucide-react';
import { Listing } from '../types';
import { formatPKR } from '../data/mockData';
import { useMarketplace } from '../context/MarketplaceContext';

interface ListingDetailModalProps {
  listingId: string;
  onBack: () => void;
  onSelectRelatedListing?: (id: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listingId,
  onBack,
  onSelectRelatedListing,
}) => {
  const { listings, favorites, toggleFavorite, incrementViews, sendEnquiry } =
    useMarketplace();

  const listing = listings.find((l) => l.id === listingId);

  const [activeImage, setActiveImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Enquiry Form State
  const [enqName, setEnqName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqMessage, setEnqMessage] = useState(
    'Hi, I am interested in this solar equipment. Please share best price and availability.'
  );
  const [enqSent, setEnqSent] = useState(false);

  useEffect(() => {
    if (listing) {
      setActiveImage(listing.image_url);
      incrementViews(listing.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [listingId]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Listing Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            The solar listing you are looking for may have been removed or marked as sold.
          </p>
          <button onClick={onBack} className="btn-primary py-2 px-6 text-xs font-bold">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(listing.id);
  const allImages = [listing.image_url, ...(listing.additional_images || [])];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const phone = listing.seller_whatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${listing.seller_name}, I saw your listing on SellSolar: "${listing.title}" for ${formatPKR(listing.price)}. Is it available in ${listing.city}?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleSendEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqName || !enqPhone) return;

    await sendEnquiry({
      listing_id: listing.id,
      listing_title: listing.title,
      sender_name: enqName,
      sender_phone: enqPhone,
      message: enqMessage,
    });
    setEnqSent(true);
  };

  const related = listings
    .filter((l) => l.id !== listing.id && (l.category === listing.category || l.city === listing.city))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-page">
        {/* Top Navigation & Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-primary-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Listings
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="btn-ghost py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-secondary-600" /> Copied Link
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-gray-500" /> Share
                </>
              )}
            </button>

            <button
              onClick={() => toggleFavorite(listing.id)}
              className="btn-ghost py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
                }`}
              />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Image Gallery, Specs, Description */}
          <div className="lg:col-span-8 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-3">
                <img
                  src={activeImage || listing.image_url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Condition Tag */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-secondary-600 text-white text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    {listing.condition === 'new'
                      ? 'Brand New'
                      : listing.condition === 'used'
                      ? 'Used Equipment'
                      : 'Refurbished'}
                  </span>
                  {listing.is_featured && (
                    <span className="bg-primary-500 text-gray-900 text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary-400" />
                  <span>{listing.views} views</span>
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img
                          ? 'border-primary-500 scale-105 shadow-xs'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Table */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-500" /> Technical Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold text-[11px] uppercase">Brand</div>
                  <div className="text-gray-900 font-bold mt-0.5">{listing.brand}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold text-[11px] uppercase">Model</div>
                  <div className="text-gray-900 font-bold mt-0.5">{listing.model || 'Standard'}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold text-[11px] uppercase">Capacity / Output</div>
                  <div className="text-gray-900 font-bold mt-0.5">{listing.capacity_val || 'N/A'}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold text-[11px] uppercase">Tier-1 Certified</div>
                  <div className="text-secondary-700 font-bold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500" />
                    {listing.specifications?.tier1 ? 'Yes (Bloomberg Tier-1)' : 'Standard'}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold text-[11px] uppercase">Efficiency</div>
                  <div className="text-gray-900 font-bold mt-0.5">
                    {listing.specifications?.efficiency || '21.5%+'}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-semibold text-[11px] uppercase">Warranty</div>
                  <div className="text-gray-900 font-bold mt-0.5">
                    {listing.warranty_years ? `${listing.warranty_years} Years Official` : 'No Warranty'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Equipment Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Safety & Buying Guidelines */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Info className="w-4 h-4 text-amber-600" /> Buyer Safety & Verification Tips
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800/90 text-[11px]">
                <li>Always scan the original barcode sticker under the solar glass for genuine serial verification.</li>
                <li>Never transfer 100% advance payment to unknown personal accounts without seeing equipment or visiting the shop.</li>
                <li>Ask the dealer for an official stamped warranty card and company invoice.</li>
              </ul>
            </div>
          </div>

          {/* Right 4 Cols: Price, Contact, Seller Card, Enquiry */}
          <div className="lg:col-span-4 space-y-6">
            {/* Price & Primary CTA Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md space-y-5">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Asking Price
                </div>
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                  {formatPKR(listing.price)}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {listing.location_area ? `${listing.location_area}, ` : ''}
                    {listing.city}
                  </span>
                </div>
              </div>

              {/* Instant WhatsApp Button */}
              <button
                onClick={handleWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </button>

              {/* Call Seller Button */}
              <a
                href={`tel:${listing.seller_phone}`}
                className="w-full btn-ghost py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-gray-500" />
                <span>Call {listing.seller_phone}</span>
              </a>

              {/* Seller Summary Box */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  {listing.seller_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    {listing.seller_name}
                    {listing.is_verified_seller && (
                      <ShieldCheck className="w-4 h-4 text-secondary-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {listing.is_verified_seller ? 'Verified Dealer' : 'Member Seller'}
                  </div>
                </div>
              </div>
            </div>

            {/* In-app Message Form */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-primary-500" /> Send Seller an Enquiry
              </h3>

              {enqSent ? (
                <div className="bg-secondary-50 border border-secondary-200 text-secondary-800 p-4 rounded-xl text-center text-xs space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-secondary-600 mx-auto mb-1" />
                  <div className="font-bold">Enquiry Sent Successfully!</div>
                  <p className="text-gray-600 text-[11px]">
                    The seller has received your contact number and will reach out shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendEnquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Usman Tariq"
                      value={enqName}
                      onChange={(e) => setEnqName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 03001234567"
                      value={enqPhone}
                      onChange={(e) => setEnqPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Message</label>
                    <textarea
                      rows={3}
                      value={enqMessage}
                      onChange={(e) => setEnqMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-2.5 text-xs font-bold shadow-xs"
                  >
                    Submit Enquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Related Equipment Section */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Similar Solar Equipment You May Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelatedListing && onSelectRelatedListing(rel.id)}
                  className="card p-4 bg-white border border-gray-200 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={rel.image_url}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-base font-extrabold text-gray-900">
                    {formatPKR(rel.price)}
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1 mt-1">
                    {rel.title}
                  </h4>
                  <div className="text-[11px] text-gray-500 mt-2 flex items-center justify-between">
                    <span>{rel.city}</span>
                    <span className="font-semibold text-primary-600">View Specs &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

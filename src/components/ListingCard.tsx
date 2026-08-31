import React from 'react';
import {
  MapPin,
  ShieldCheck,
  Zap,
  Phone,
  MessageCircle,
  Eye,
  Heart,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Listing } from '../types';
import { formatPKR } from '../data/mockData';
import { useMarketplace } from '../context/MarketplaceContext';

interface ListingCardProps {
  listing: Listing;
  onSelectListing: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelectListing,
}) => {
  const { favorites, toggleFavorite } = useMarketplace();
  const isFavorite = favorites.includes(listing.id);

  const isUsed = listing.condition === 'used';
  const isRefurbished = listing.condition === 'refurbished';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = listing.seller_whatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${listing.seller_name}, I am interested in your listing on SellSolar: "${listing.title}" for ${formatPKR(listing.price)}. Is this still available?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${listing.seller_phone}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  return (
    <div
      onClick={() => onSelectListing(listing.id)}
      className="card group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-300 flex flex-col justify-between relative bg-white"
    >
      <div>
        {/* Thumbnail Image with Badges */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Condition & Featured Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${
                isUsed
                  ? 'bg-amber-500 text-white'
                  : isRefurbished
                  ? 'bg-blue-600 text-white'
                  : 'bg-secondary-600 text-white'
              }`}
            >
              {isUsed ? 'Used' : isRefurbished ? 'Refurbished' : 'Brand New'}
            </span>

            {listing.is_featured && (
              <span className="bg-primary-500 text-gray-900 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                Featured
              </span>
            )}
          </div>

          {/* Favorite heart toggle button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 transition-all shadow-md z-10"
            aria-label="Save to favorites"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          {/* Brand pill bottom left */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="bg-gray-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md border border-white/10">
              {listing.brand}
            </span>
          </div>

          {/* Sold status overlay if applicable */}
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-2xs flex items-center justify-center z-20">
              <span className="bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {formatPKR(listing.price)}
            </span>
            {listing.specifications?.capacity && (
              <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                {listing.specifications.capacity}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-2 text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>

          {/* Specifications Bullet Summary */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {listing.specifications?.tier1 && (
              <span className="inline-flex items-center gap-1 font-semibold text-secondary-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500" /> Tier-1
              </span>
            )}
            {listing.specifications?.efficiency && (
              <span>• {listing.specifications.efficiency} eff.</span>
            )}
            {listing.warranty_years ? (
              <span>• {listing.warranty_years}y warranty</span>
            ) : (
              <span>• No warranty</span>
            )}
          </div>

          {/* Location & Seller Info */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1 font-medium text-gray-600 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{listing.city}</span>
            </div>

            {listing.is_verified_seller && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary-700 bg-secondary-50 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary-600" /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="px-4 pb-4 pt-1 flex items-center gap-2">
        <button
          onClick={handleWhatsAppClick}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={handlePhoneClick}
          className="p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
          title="Call Seller"
        >
          <Phone className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

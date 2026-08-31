import React, { useState } from 'react';
import { Sparkles, Grid, RotateCcw, AlertCircle, PlusCircle } from 'lucide-react';
import { Listing } from '../types';
import { ListingCard } from './ListingCard';
import { useMarketplace } from '../context/MarketplaceContext';

interface ListingsGridProps {
  onSelectListing: (id: string) => void;
  onPostAd: () => void;
}

export const ListingsGrid: React.FC<ListingsGridProps> = ({
  onSelectListing,
  onPostAd,
}) => {
  const { filteredListings, resetFilters, filters } = useMarketplace();
  const [displayCount, setDisplayCount] = useState(12);

  const visibleListings = filteredListings.slice(0, displayCount);
  const hasMore = filteredListings.length > displayCount;

  return (
    <section id="listings" className="py-12 bg-gray-50/70 border-t border-gray-100">
      <div className="container-page">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Direct From Importers & Verified Dealers
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Available Solar Equipment
            </h2>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900 font-bold">{visibleListings.length}</strong> of{' '}
            {filteredListings.length} verified listings
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelectListing={onSelectListing}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 8)}
                  className="btn-ghost py-3 px-8 text-sm font-bold shadow-xs hover:border-primary-400"
                >
                  Load More Equipment ({filteredListings.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No solar equipment found</h3>
            <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              We couldn't find any listings matching your active filters. Try adjusting your brand, city, or price criteria.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={resetFilters}
                className="btn-ghost text-xs font-bold py-2 px-4 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </button>

              <button
                onClick={onPostAd}
                className="btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Post First Ad in this Category
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

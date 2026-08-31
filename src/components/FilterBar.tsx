import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  MapPin,
  Tag,
  ShieldAlert,
  X,
  Sparkles,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CITIES, BRANDS, CATEGORIES } from '../data/mockData';

export const FilterBar: React.FC = () => {
  const { filters, setFilter, resetFilters, filteredListings, listings } = useMarketplace();

  const hasActiveFilters =
    Boolean(filters.query) ||
    Boolean(filters.category) ||
    Boolean(filters.brand) ||
    Boolean(filters.condition) ||
    Boolean(filters.city) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.sortBy !== 'latest';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-5 mb-8">
      {/* Top Filter Bar Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Keyword Search */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Search Keyword
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search model, specs..."
              value={filters.query}
              onChange={(e) => setFilter('query', e.target.value)}
              className="w-full pl-8 pr-2.5 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Brand
          </label>
          <select
            value={filters.brand}
            onChange={(e) => setFilter('brand', e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="">All Brands</option>
            {BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Condition
          </label>
          <select
            value={filters.condition}
            onChange={(e) => setFilter('condition', e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="">All Conditions</option>
            <option value="new">Brand New (Box Pack)</option>
            <option value="used">Used / Second Hand</option>
            <option value="refurbished">Certified Refurbished</option>
          </select>
        </div>

        {/* City / Location */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilter('city', e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="">All Pakistan</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilter('sortBy', e.target.value as any)}
            className="w-full px-2.5 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer font-medium"
          >
            <option value="latest">Latest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Price Range Slider / Inputs & Active Pills */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Min / Max Price quick inputs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Price (PKR):</span>
          <input
            type="number"
            placeholder="Min Rs"
            value={filters.minPrice}
            onChange={(e) => setFilter('minPrice', e.target.value)}
            className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max Rs"
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', e.target.value)}
            className="w-28 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        {/* Results Counter & Reset Button */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900 font-bold">{filteredListings.length}</strong> of{' '}
            {listings.length} equipment items
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-50">
          <span className="text-[11px] font-bold text-gray-400 mr-1">Active Filters:</span>
          {filters.query && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary-200">
              Keyword: "{filters.query}"
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilter('query', '')} />
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary-200">
              Category: {CATEGORIES.find((c) => c.value === filters.category)?.label}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilter('category', '')} />
            </span>
          )}
          {filters.brand && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary-200">
              Brand: {filters.brand}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilter('brand', '')} />
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary-200">
              City: {filters.city}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilter('city', '')} />
            </span>
          )}
          {filters.condition && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary-200">
              Condition: {filters.condition}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFilter('condition', '')} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

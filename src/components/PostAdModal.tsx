import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sun,
  Cpu,
  BatteryCharging,
  Home,
  ShieldCheck,
  Sparkles,
  DollarSign,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { CategoryType, ConditionType } from '../types';
import { CITIES, BRANDS } from '../data/mockData';

interface PostAdModalProps {
  onBack: () => void;
  onSuccess: (newListingId: string) => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { createListing } = useMarketplace();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('panel');
  const [brand, setBrand] = useState(BRANDS[0]);
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [condition, setCondition] = useState<ConditionType>('new');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState(user?.city || CITIES[0]);
  const [locationArea, setLocationArea] = useState(user?.business_address || '');
  const [warrantyYears, setWarrantyYears] = useState('12');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80'
  );
  const [sellerName, setSellerName] = useState(
    user?.business_name || user?.full_name || ''
  );
  const [sellerPhone, setSellerPhone] = useState(user?.phone || '+92 300 1234567');
  const [sellerWhatsApp, setSellerWhatsApp] = useState(
    user?.phone?.replace(/[^0-9]/g, '') || '923001234567'
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postedSuccess, setPostedSuccess] = useState(false);

  const sampleImages = [
    { label: 'Solar Panel (Mono PERC)', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80' },
    { label: 'Solar Inverter (Hybrid)', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' },
    { label: 'Lithium Battery Storage', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Turnkey Rooftop System', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide an ad title');
      return;
    }

    if (!price || Number(price) <= 0) {
      setError('Please enter a valid price in PKR');
      return;
    }

    if (!sellerPhone.trim()) {
      setError('Please provide your contact phone number');
      return;
    }

    setSubmitting(true);

    try {
      const newListing = await createListing({
        title,
        category,
        brand,
        model: model.trim() || undefined,
        capacity_val: capacity.trim() || undefined,
        condition,
        price: Number(price),
        city,
        location_area: locationArea.trim() || undefined,
        warranty_years: warrantyYears ? Number(warrantyYears) : undefined,
        description:
          description.trim() ||
          `${brand} ${category} in ${condition} condition. Available for pickup or delivery in ${city}. Contact for details.`,
        image_url: imageUrl,
        user_id: user?.id || 'guest-user',
        seller_name: sellerName || 'Solar Seller',
        seller_phone: sellerPhone,
        seller_whatsapp: sellerWhatsApp || sellerPhone,
        specifications: {
          tier1: true,
          capacity: capacity || undefined,
          warranty_years: warrantyYears ? Number(warrantyYears) : undefined,
        },
      });

      setPostedSuccess(true);
      setTimeout(() => {
        onSuccess(newListing.id);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to post ad. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (postedSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center max-w-md animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Ad Published Successfully!</h2>
          <p className="text-xs text-gray-500 mt-2">
            Your solar equipment listing is now live on SellSolar. Buyers across Pakistan can now view and contact you.
          </p>
          <div className="mt-4 text-xs font-semibold text-primary-600">
            Opening your listing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-page max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-primary-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel & Return
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Post a Free Solar Ad
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Reach thousands of solar buyers, EPC installers, and homeowners across Pakistan.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Equipment Classification */}
          <div className="card p-6 bg-white border border-gray-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              1. Equipment Category & Brand
            </h2>

            {/* Category selection buttons */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'panel', label: 'Solar Panel', icon: Sun },
                  { id: 'inverter', label: 'Inverter', icon: Cpu },
                  { id: 'battery', label: 'Battery', icon: BatteryCharging },
                  { id: 'complete_system', label: 'Complete System', icon: Home },
                ].map((c) => {
                  const Icon = c.icon;
                  const isSel = category === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.id as CategoryType)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        isSel
                          ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-2xs'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSel ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Brand *</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Condition *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['new', 'used', 'refurbished'] as ConditionType[]).map((cond) => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => setCondition(cond)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                        condition === cond
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ad Title & Specifications */}
          <div className="card p-6 bg-white border border-gray-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              2. Title & Specifications
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ad Title * (Include wattage/model)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Longi Hi-MO 6 580W Monocrystalline Solar Panel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Model / Series
                </label>
                <input
                  type="text"
                  placeholder="e.g. LR5-72HTH-580M"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Capacity / Rating
                </label>
                <input
                  type="text"
                  placeholder="e.g. 580W or 6kW"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Warranty (Years)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={warrantyYears}
                  onChange={(e) => setWarrantyYears(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Detailed Description
              </label>
              <textarea
                rows={3}
                placeholder="Mention key details like import source, barcode authenticity, packaging condition, testing report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Card 3: Price & Location */}
          <div className="card p-6 bg-white border border-gray-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              3. Pricing & City Location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 37500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-1 focus:ring-primary-500 focus:outline-none cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Location Area / Market
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hall Road / DHA"
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Photos & Seller Info */}
          <div className="card p-6 bg-white border border-gray-200/90 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              4. Product Photo & Contact Details
            </h2>

            {/* Photo preview and selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Photo Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              {/* Sample Photo selector shortcuts */}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-gray-500">
                <span>Quick Preset Photos:</span>
                {sampleImages.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setImageUrl(s.url)}
                    className="text-primary-700 hover:underline font-medium"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Image Preview thumbnail */}
              {imageUrl && (
                <div className="mt-3 w-32 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seller / Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Solar Trading"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="03218899770"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="923218899770"
                  value={sellerWhatsApp}
                  onChange={(e) => setSellerWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="btn-ghost py-2.5 px-5 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-3 px-8 text-sm font-bold shadow-md shadow-primary-500/25 flex items-center gap-2"
            >
              {submitting ? (
                <span>Publishing Ad...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Solar Ad Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

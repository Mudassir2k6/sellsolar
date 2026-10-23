'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FilePen,
  Save,
  Trash2,
  Package,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  Upload,
  RefreshCw
} from 'lucide-react';
import { CITIES, CATEGORIES, BRANDS } from '../lib/constants';
import { isValidUuid } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const QUICK_STOCK_IMAGES = [
  { label: 'Longi Hi-MO 6 (585W)', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
  { label: 'Canadian Solar Bifacial', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Jinko Tiger Neo TopCon', url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&auto=format&fit=crop&q=80' },
  { label: 'Inverex Hybrid Inverter', url: 'https://images.unsplash.com/photo-1558441719-8b489c63f7bc?w=800&auto=format&fit=crop&q=80' },
  { label: 'Lithium / Tubular Battery', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80' },
  { label: 'Complete Solar Rooftop', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
];

export default function EditSolarAdModal({
  isOpen,
  ad,
  onClose,
  onSave,
  onDelete,
}) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'panel',
    brand: 'Longi',
    condition: 'used',
    city: 'Islamabad',
    capacity_kw: '',
    warranty_years: '',
    description: '',
    seller_name: '',
    seller_phone: '',
    image_url: '',
    status: 'approved',
    is_sold: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Populate form with ad data whenever ad changes
  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        price: ad.price ? String(ad.price) : '',
        category: ad.category || 'panel',
        brand: ad.brand || 'Longi',
        condition: ad.condition || 'used',
        city: ad.city || 'Islamabad',
        capacity_kw: ad.capacity_kw || '',
        warranty_years: ad.warranty_years ? String(ad.warranty_years) : '',
        description: ad.description || '',
        seller_name: ad.seller_name || '',
        seller_phone: ad.seller_phone || ad.phone || '',
        image_url: ad.image_url || '',
        status: ad.status || (ad.is_sold ? 'sold' : 'approved'),
        is_sold: Boolean(ad.is_sold || ad.status === 'sold'),
      });
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [ad]);

  if (!isOpen || !ad) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      is_sold: newStatus === 'sold',
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image_url: reader.result,
      }));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Please enter an ad title.');
      return;
    }

    const numericPrice = Number(String(formData.price).replace(/[^0-9]/g, ''));
    if (!numericPrice || numericPrice <= 0) {
      setErrorMsg('Please enter a valid price in PKR.');
      return;
    }

    setIsSubmitting(true);

    const updatedAd = {
      ...ad,
      title: formData.title.trim(),
      price: numericPrice,
      category: formData.category,
      brand: formData.brand,
      condition: formData.condition,
      city: formData.city,
      capacity_kw: formData.capacity_kw ? String(formData.capacity_kw).trim() : null,
      warranty_years: formData.warranty_years ? Number(formData.warranty_years) : null,
      description: formData.description.trim(),
      seller_name: formData.seller_name.trim() || ad.seller_name || 'Seller',
      seller_phone: formData.seller_phone.trim(),
      phone: formData.seller_phone.trim(),
      image_url: formData.image_url.trim() || ad.image_url,
      status: formData.status,
      is_sold: Boolean(formData.is_sold || formData.status === 'sold'),
      updated_at: new Date().toISOString(),
    };

    try {
      if (onSave) {
        await onSave(updatedAd);
      }
      setSuccessMsg('Ad updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error saving ad:', err);
      setErrorMsg(err.message || 'Failed to update ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdActive = !formData.is_sold && formData.status !== 'inactive' && formData.status !== 'sold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FilePen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Edit Solar Listing (اشتہار تبدیل کریں)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update price, specs, photos, or active/inactive status live
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Status Control Bar (Active / Inactive / Sold) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Ad Status (اشتہار کی حالت)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('approved')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isAdActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Active (فعال)
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('inactive')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formData.status === 'inactive'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-300" />
                Inactive / Pause (روک دیں)
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('sold')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formData.is_sold || formData.status === 'sold'
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Mark Sold (فروخت شدہ)
              </button>
            </div>
          </div>

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Product Title (اشتہار کا عنوان) *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 585w Solar Panel Longi Hi-MO 6"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Price in PKR (قیمت) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  Rs.
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 19500"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category, Brand, Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Category (کیٹیگری)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="panel">Solar Plates / Panels</option>
                <option value="inverter">Solar Inverters</option>
                <option value="battery">Solar Batteries</option>
                <option value="complete_system">Complete Solar Systems</option>
                <option value="structure_accessories">Structures & Mounting</option>
                <option value="accessories">Accessories & Wiring</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Brand (برانڈ)
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Condition (حالت)
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="used">Used (استعمال شدہ)</option>
                <option value="new">Brand New (نیا)</option>
              </select>
            </div>
          </div>

          {/* City, Capacity, Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                City (شہر)
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Capacity / Wattage
              </label>
              <input
                type="text"
                name="capacity_kw"
                value={formData.capacity_kw}
                onChange={handleChange}
                placeholder="e.g. 585W or 6kW"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Warranty (Years)
              </label>
              <input
                type="number"
                name="warranty_years"
                value={formData.warranty_years}
                onChange={handleChange}
                placeholder="e.g. 10"
                min="0"
                max="30"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Seller Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Seller Name (نام)
              </label>
              <input
                type="text"
                name="seller_name"
                value={formData.seller_name}
                onChange={handleChange}
                placeholder="e.g. Naveed Ahmed"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                WhatsApp / Phone Number (فون نمبر) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  name="seller_phone"
                  value={formData.seller_phone}
                  onChange={handleChange}
                  placeholder="0300-1234567"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo Management */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Product Image (تصویر تبدیل کریں)
            </label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center relative group">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Paste direct Image URL or select below..."
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-gray-400">or pick stock:</span>
                </div>

                {/* Quick Stock Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_STOCK_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, image_url: img.url }))}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-400 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Description & Specifications (تفصیلات)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe condition, working status, age of panels, inverter performance..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${formData.title}"?`)) {
                    onDelete(ad.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Ad (ختم کریں)</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Ad (تبدیلی محفوظ کریں)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

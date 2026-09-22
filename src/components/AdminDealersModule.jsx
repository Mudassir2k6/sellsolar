'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Award,
  Trash2,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { VERIFIED_DEALERS, getCityDealerCounts } from '../data/dealersData';
import { CUSTOM_DEALERS_STORAGE_KEY, saveCustomDealer } from '../data/seedDealers';
import { useToast } from '../context/ToastContext';
import { CITIES } from '../lib/constants';

export default function AdminDealersModule() {
  const { showToast } = useToast();
  const [dealers, setDealers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [editingDealerId, setEditingDealerId] = useState(null);

  const [dealerForm, setDealerForm] = useState({
    business_name: '',
    full_name: '',
    phone: '',
    city: 'Lahore',
    business_address: '',
    cnic: '',
    brands: '',
    specialties: '',
    tier: 'Verified Dealer',
    is_verified_dealer: true,
  });

  const loadAllDealers = () => {
    let custom = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(CUSTOM_DEALERS_STORAGE_KEY);
        if (raw) custom = JSON.parse(raw);
      } catch (err) {
        console.warn('Failed loading custom dealers:', err);
      }
    }

    const customPhones = new Set(custom.map((c) => c.phone).filter(Boolean));
    const combined = [
      ...custom,
      ...VERIFIED_DEALERS.filter((d) => !customPhones.has(d.phone)),
    ];
    setDealers(combined);
  };

  useEffect(() => {
    loadAllDealers();
  }, []);

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      if (selectedCity !== 'all' && d.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedSource !== 'all' && (d.registration_source || 'ai_curated') !== selectedSource) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.full_name?.toLowerCase().includes(q);
        const matchBiz = d.business_name?.toLowerCase().includes(q);
        const matchPhone = d.phone?.includes(q);
        const matchCity = d.city?.toLowerCase().includes(q);
        if (!matchName && !matchBiz && !matchPhone && !matchCity) return false;
      }
      return true;
    });
  }, [dealers, selectedCity, selectedSource, searchQuery]);

  const handleToggleVerification = (dealer) => {
    const updated = { ...dealer, is_verified_dealer: !dealer.is_verified_dealer };
    saveCustomDealer(updated);
    setDealers((prev) => prev.map((d) => (d.id === dealer.id ? updated : d)));
    showToast({
      title: updated.is_verified_dealer ? 'Dealer Verified' : 'Verification Revoked',
      message: `${dealer.business_name} status updated live.`,
      type: 'success',
    });
  };

  const handleSaveDealer = (e) => {
    e?.preventDefault();
    if (!dealerForm.business_name.trim() || !dealerForm.phone.trim()) {
      showToast({ title: 'Validation Error', message: 'Business name and phone are required.', type: 'error' });
      return;
    }

    const brandsArray = typeof dealerForm.brands === 'string'
      ? dealerForm.brands.split(',').map((b) => b.trim()).filter(Boolean)
      : dealerForm.brands;

    const newDealer = {
      id: editingDealerId || `dlr-admin-${Date.now()}`,
      business_name: dealerForm.business_name.trim(),
      full_name: dealerForm.full_name.trim() || 'Solar Dealer',
      phone: dealerForm.phone.trim(),
      city: dealerForm.city,
      business_address: dealerForm.business_address.trim() || `${dealerForm.city}, Pakistan`,
      cnic: dealerForm.cnic.trim() || undefined,
      brands: brandsArray.length > 0 ? brandsArray : ['Longi', 'Jinko', 'Inverex'],
      specialties: dealerForm.specialties.trim() || 'Turnkey Solar Engineering & Wholesale',
      tier: dealerForm.tier,
      is_verified_dealer: dealerForm.is_verified_dealer,
      registration_source: 'manual_admin',
      registered_by: 'administrator',
      registered_by_display: 'Admin Verified Onboarding',
      rating: 4.9,
      reviews_count: 12,
      created_at: new Date().toISOString(),
    };

    saveCustomDealer(newDealer);
    loadAllDealers();
    setIsAddingDealer(false);
    setEditingDealerId(null);
    setDealerForm({
      business_name: '',
      full_name: '',
      phone: '',
      city: 'Lahore',
      business_address: '',
      cnic: '',
      brands: '',
      specialties: '',
      tier: 'Verified Dealer',
      is_verified_dealer: true,
    });

    showToast({
      title: editingDealerId ? 'Dealer Updated' : 'Dealer Added',
      message: `${newDealer.business_name} is live in the Verified Dealers Directory.`,
      type: 'success',
    });
  };

  const handleStartEdit = (dealer) => {
    setEditingDealerId(dealer.id);
    setDealerForm({
      business_name: dealer.business_name || '',
      full_name: dealer.full_name || '',
      phone: dealer.phone || '',
      city: dealer.city || 'Lahore',
      business_address: dealer.business_address || '',
      cnic: dealer.cnic || '',
      brands: Array.isArray(dealer.brands) ? dealer.brands.join(', ') : (dealer.brands || ''),
      specialties: dealer.specialties || '',
      tier: dealer.tier || 'Verified Dealer',
      is_verified_dealer: dealer.is_verified_dealer !== false,
    });
    setIsAddingDealer(true);
  };

  const handleDeleteDealer = (dealerId) => {
    if (!confirm('Are you sure you want to delete this dealer?')) return;
    try {
      const raw = localStorage.getItem(CUSTOM_DEALERS_STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((d) => d.id !== dealerId);
      localStorage.setItem(CUSTOM_DEALERS_STORAGE_KEY, JSON.stringify(list));
      loadAllDealers();
      showToast({ title: 'Dealer Removed', message: 'Dealer deleted from directory.', type: 'info' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-600" />
              Verified Solar Dealers Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
              {dealers.length} Dealers Active
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage certified solar dealers across 8 major Pakistan cities. Add verified profiles, approve online registrations, or edit showroom listings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isAddingDealer) {
              setIsAddingDealer(false);
              setEditingDealerId(null);
            } else {
              setIsAddingDealer(true);
            }
          }}
          className="btn-primary text-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          {isAddingDealer ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAddingDealer ? 'Cancel' : 'Onboard New Dealer'}
        </button>
      </div>

      {/* Onboarding / Edit Form */}
      {isAddingDealer && (
        <form
          onSubmit={handleSaveDealer}
          className="p-5 rounded-2xl border border-primary-200 dark:border-primary-900/60 bg-primary-50/30 dark:bg-primary-950/20 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-primary-900 dark:text-primary-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-600" />
              {editingDealerId ? 'Edit Dealer Details' : 'Direct Onboard Dealer (Verified)'}
            </h3>
            <span className="text-[11px] text-primary-700 dark:text-primary-400">Publishes live immediately</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Business / Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Al-Madina Solar Solutions"
                value={dealerForm.business_name}
                onChange={(e) => setDealerForm({ ...dealerForm, business_name: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name (Contact Person)</label>
              <input
                type="text"
                placeholder="e.g. Haji Muhammad Usman"
                value={dealerForm.full_name}
                onChange={(e) => setDealerForm({ ...dealerForm, full_name: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">WhatsApp / Phone *</label>
              <input
                type="tel"
                required
                placeholder="03001234567"
                value={dealerForm.phone}
                onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">City</label>
              <select
                value={dealerForm.city}
                onChange={(e) => setDealerForm({ ...dealerForm, city: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">CNIC (Optional)</label>
              <input
                type="text"
                placeholder="35201-1234567-1"
                value={dealerForm.cnic}
                onChange={(e) => setDealerForm({ ...dealerForm, cnic: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Tier / Badge</label>
              <select
                value={dealerForm.tier}
                onChange={(e) => setDealerForm({ ...dealerForm, tier: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              >
                <option value="Platinum Dealer">Platinum Dealer</option>
                <option value="Gold Dealer">Gold Dealer</option>
                <option value="Verified Dealer">Verified Dealer</option>
                <option value="Authorized Distributor">Authorized Distributor</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Authorized Brands (comma separated)</label>
              <input
                type="text"
                placeholder="Longi, Jinko, Inverex, Growatt, Huawei"
                value={dealerForm.brands}
                onChange={(e) => setDealerForm({ ...dealerForm, brands: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Specialties</label>
              <input
                type="text"
                placeholder="Wholesale Solar Panels, Hybrid Inverters"
                value={dealerForm.specialties}
                onChange={(e) => setDealerForm({ ...dealerForm, specialties: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Showroom Address</label>
              <input
                type="text"
                placeholder="Shop # 14-15, Main Hall Road, Lahore"
                value={dealerForm.business_address}
                onChange={(e) => setDealerForm({ ...dealerForm, business_address: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={dealerForm.is_verified_dealer}
                onChange={(e) => setDealerForm({ ...dealerForm, is_verified_dealer: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Mark as Officially Verified Dealer
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingDealer(false);
                  setEditingDealerId(null);
                }}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                {editingDealerId ? 'Save Updates' : 'Publish Dealer'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input-field text-xs py-2 w-auto bg-white dark:bg-gray-900 font-bold"
          >
            <option value="all">All Cities ({dealers.length})</option>
            {CITIES.map((c) => {
              const count = dealers.filter((d) => d.city?.toLowerCase() === c.toLowerCase()).length;
              return (
                <option key={c} value={c}>
                  {c} ({count})
                </option>
              );
            })}
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="input-field text-xs py-2 w-auto bg-white dark:bg-gray-900 font-bold"
          >
            <option value="all">All Sources</option>
            <option value="manual_admin">Admin Verified</option>
            <option value="self_registered">Self-Registered</option>
            <option value="ai_curated">AI Curated</option>
          </select>
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search dealer, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-9 py-2 bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Dealers Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Business & Contact</th>
                <th className="px-4 py-3">City & Address</th>
                <th className="px-4 py-3">Brands & Specialties</th>
                <th className="px-4 py-3">Tier & Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                    No dealers match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredDealers.map((dealer) => {
                  const brands = Array.isArray(dealer.brands) ? dealer.brands : [];
                  const isVerified = dealer.is_verified_dealer !== false;

                  return (
                    <tr key={dealer.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{dealer.business_name}</span>
                          {isVerified && (
                            <ShieldCheck className="h-3.5 w-3.5 text-primary-600 shrink-0" title="Verified Dealer" />
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>{dealer.full_name}</span>
                          <span>•</span>
                          <a href={`tel:${dealer.phone}`} className="hover:underline font-mono text-gray-700 dark:text-gray-300">
                            {dealer.phone}
                          </a>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-1">
                          {dealer.city}
                        </span>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px]">
                          {dealer.business_address || 'Address not listed'}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {brands.slice(0, 3).map((b, i) => (
                            <span key={i} className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                              {b}
                            </span>
                          ))}
                          {brands.length > 3 && (
                            <span className="text-[9px] text-gray-400">+{brands.length - 3}</span>
                          )}
                        </div>
                        {dealer.specialties && (
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 max-w-[200px]">
                            {dealer.specialties}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                            {dealer.tier || 'Verified Dealer'}
                          </span>
                          <div className="text-[9px] text-gray-400">
                            {dealer.registration_source === 'manual_admin'
                              ? 'Admin Verified'
                              : dealer.registration_source === 'self_registered'
                              ? 'Website Portal'
                              : 'Curated'}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(dealer)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-3 w-3 text-gray-400" />
                              <span>Unverified</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(dealer)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-600"
                            title="Edit Dealer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDealer(dealer.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

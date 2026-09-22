'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign,
  Search,
  Plus,
  Edit3,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  Sun,
  Zap,
  BatteryCharging,
  Boxes,
  Wrench,
  RefreshCw,
  Sparkles,
  Download,
} from 'lucide-react';
import { getActiveDailyRates, saveCustomDailyRates } from '../data/todayPricesData';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../lib/constants';

const CATEGORIES = [
  { id: 'panel', label: 'Solar Panels', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'inverter', label: 'Inverters', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'battery', label: 'Batteries', icon: BatteryCharging, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'ess', label: 'ESS & Storage', icon: Boxes, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { id: 'complete_system', label: 'Systems', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'structure_accessories', label: 'Structures & Wire', icon: Wrench, color: 'text-slate-500', bg: 'bg-slate-500/10' },
];

export default function AdminDailyRatesModule() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('panel');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [sheetData, setSheetData] = useState(() => getActiveDailyRates('16-Sep-2026'));

  const [newItemForm, setNewItemForm] = useState({
    brand: '',
    model: '',
    capacity: '',
    type: '',
    rate: '',
    prevRate: '',
    status: 'stable',
    badge: '',
    warranty: '',
    note: '',
  });

  const getCategoryKey = (cat) => {
    switch (cat) {
      case 'panel': return 'rates';
      case 'inverter': return 'inverterRates';
      case 'battery': return 'batteryRates';
      case 'ess': return 'essRates';
      case 'complete_system': return 'systemRates';
      case 'structure_accessories': return 'structureRates';
      default: return 'rates';
    }
  };

  const currentList = useMemo(() => {
    const key = getCategoryKey(activeCategory);
    const list = sheetData[key] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.brand?.toLowerCase().includes(q) ||
        item.model?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q) ||
        item.capacity?.toLowerCase().includes(q)
    );
  }, [sheetData, activeCategory, searchQuery]);

  const handleStartEdit = (item, idx) => {
    setEditingIndex(idx);
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

  const handleSaveEdit = (idx) => {
    const key = getCategoryKey(activeCategory);
    const updatedRates = [...(sheetData[key] || [])];
    const newRate = parseFloat(editingItem.rate) || 0;
    const prev = parseFloat(editingItem.prevRate) || newRate;
    const diff = Number((newRate - prev).toFixed(2));
    const status = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';

    updatedRates[idx] = {
      ...editingItem,
      rate: newRate,
      prevRate: prev,
      change: diff,
      status,
    };

    const newSheet = { ...sheetData, [key]: updatedRates };
    setSheetData(newSheet);
    saveCustomDailyRates(newSheet);
    setEditingIndex(null);
    setEditingItem(null);

    showToast({
      title: 'Rate Updated',
      message: `${editingItem.brand} ${editingItem.model} updated live on the portal.`,
      type: 'success',
    });
  };

  const handleAddNewItem = (e) => {
    e?.preventDefault();
    if (!newItemForm.brand.trim() || !newItemForm.model.trim()) {
      showToast({ title: 'Validation Error', message: 'Brand and Model are required.', type: 'error' });
      return;
    }

    const key = getCategoryKey(activeCategory);
    const currentCategoryRates = [...(sheetData[key] || [])];
    const newRate = parseFloat(newItemForm.rate) || 0;
    const prevRate = parseFloat(newItemForm.prevRate) || newRate;
    const diff = Number((newRate - prevRate).toFixed(2));
    const status = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';

    const newItem = {
      brand: newItemForm.brand.trim(),
      model: newItemForm.model.trim(),
      capacity: newItemForm.capacity.trim() || undefined,
      type: newItemForm.type.trim() || undefined,
      rate: newRate,
      prevRate,
      change: diff,
      status,
      badge: newItemForm.badge.trim() || undefined,
      warranty: newItemForm.warranty.trim() || undefined,
      note: newItemForm.note.trim() || undefined,
    };

    const updatedRates = [newItem, ...currentCategoryRates];
    const newSheet = { ...sheetData, [key]: updatedRates };
    setSheetData(newSheet);
    saveCustomDailyRates(newSheet);

    setNewItemForm({
      brand: '',
      model: '',
      capacity: '',
      type: '',
      rate: '',
      prevRate: '',
      status: 'stable',
      badge: '',
      warranty: '',
      note: '',
    });
    setIsAddingNew(false);

    showToast({
      title: 'Benchmark Rate Added',
      message: `${newItem.brand} ${newItem.model} benchmark added and published live.`,
      type: 'success',
    });
  };

  const handleDeleteItem = (idx) => {
    if (!confirm('Are you sure you want to remove this benchmark item?')) return;
    const key = getCategoryKey(activeCategory);
    const currentCategoryRates = [...(sheetData[key] || [])];
    currentCategoryRates.splice(idx, 1);
    const newSheet = { ...sheetData, [key]: currentCategoryRates };
    setSheetData(newSheet);
    saveCustomDailyRates(newSheet);

    showToast({
      title: 'Item Removed',
      message: 'The benchmark item has been removed from today\'s sheet.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-500" />
              Daily Solar Price Benchmarks & Sheets
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Update official daily Islamabad & Pakistan benchmark rates. Changes reflect instantly on the public Today's Prices page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="btn-primary text-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          {isAddingNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAddingNew ? 'Close Form' : 'Add New Benchmark Rate'}
        </button>
      </div>

      {/* Add New Rate Form */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewItem}
          className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Add New Rate to {CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h3>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">All fields publish live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Longi, Jinko, Inverex"
                value={newItemForm.brand}
                onChange={(e) => setNewItemForm({ ...newItemForm, brand: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Model / Specification *</label>
              <input
                type="text"
                required
                placeholder="e.g. 585W Hi-MO X6 or Nitrox 6kW"
                value={newItemForm.model}
                onChange={(e) => setNewItemForm({ ...newItemForm, model: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                {activeCategory === 'panel' ? 'Rate (PKR / Watt) *' : 'Rate (PKR) *'}
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder={activeCategory === 'panel' ? 'e.g. 41.50' : 'e.g. 245000'}
                value={newItemForm.rate}
                onChange={(e) => setNewItemForm({ ...newItemForm, rate: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Previous Rate (PKR)</label>
              <input
                type="number"
                step="any"
                placeholder={activeCategory === 'panel' ? 'e.g. 40.50' : 'e.g. 250000'}
                value={newItemForm.prevRate}
                onChange={(e) => setNewItemForm({ ...newItemForm, prevRate: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Capacity / Specs</label>
              <input
                type="text"
                placeholder="e.g. 6.0 kW or 51.2V 100Ah"
                value={newItemForm.capacity}
                onChange={(e) => setNewItemForm({ ...newItemForm, capacity: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Type / Category</label>
              <input
                type="text"
                placeholder="e.g. Dual-MPPT Hybrid On-Grid"
                value={newItemForm.type}
                onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Tag</label>
              <input
                type="text"
                placeholder="e.g. Official Warranty, High Demand"
                value={newItemForm.badge}
                onChange={(e) => setNewItemForm({ ...newItemForm, badge: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Official Warranty</label>
              <input
                type="text"
                placeholder="e.g. 5 Years Replacement"
                value={newItemForm.warranty}
                onChange={(e) => setNewItemForm({ ...newItemForm, warranty: e.target.value })}
                className="input-field text-xs bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              Publish Rate to Portal
            </button>
          </div>
        </form>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = (sheetData[getCategoryKey(cat.id)] || []).length;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setEditingIndex(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-amber-400 dark:text-amber-600' : cat.color}`} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search model, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-9 py-2 bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Benchmark Rates Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Brand & Model</th>
                <th className="px-4 py-3">Type / Capacity</th>
                <th className="px-4 py-3">Today's Benchmark Rate</th>
                <th className="px-4 py-3">Previous Rate</th>
                <th className="px-4 py-3">Trend</th>
                <th className="px-4 py-3">Badge & Warranty</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                    No benchmark rates found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentList.map((item, idx) => {
                  const isEditing = editingIndex === idx;

                  if (isEditing) {
                    return (
                      <tr key={idx} className="bg-amber-50/50 dark:bg-amber-950/20">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editingItem.brand}
                              onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="Brand"
                            />
                            <input
                              type="text"
                              value={editingItem.model}
                              onChange={(e) => setEditingItem({ ...editingItem, model: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="Model"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editingItem.capacity || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, capacity: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="Capacity"
                            />
                            <input
                              type="text"
                              value={editingItem.type || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="Type"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="any"
                            value={editingItem.rate}
                            onChange={(e) => setEditingItem({ ...editingItem, rate: e.target.value })}
                            className="input-field text-xs py-1 font-bold text-emerald-600"
                            placeholder="Rate"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="any"
                            value={editingItem.prevRate || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, prevRate: e.target.value })}
                            className="input-field text-xs py-1"
                            placeholder="Prev Rate"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-500">Auto Computed</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editingItem.badge || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="Badge"
                            />
                            <input
                              type="text"
                              value={editingItem.warranty || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, warranty: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="Warranty"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(idx)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Save Changes"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const isPanel = activeCategory === 'panel';
                  const change = item.change || 0;

                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.brand}</span>
                          <span className="text-gray-500 font-medium">{item.model}</span>
                        </div>
                        {item.note && <p className="text-[10px] text-gray-400 mt-0.5">{item.note}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 dark:text-gray-300">{item.capacity || item.type || 'Standard Spec'}</div>
                        {item.type && item.capacity && (
                          <p className="text-[10px] text-gray-400">{item.type}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                          {item.rate !== null ? (
                            isPanel ? `PKR ${Number(item.rate).toFixed(2)}/W` : formatPrice(item.rate)
                          ) : (
                            <span className="text-gray-400 font-normal">Call for Rate</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono">
                        {item.prevRate ? (
                          isPanel ? `PKR ${Number(item.prevRate).toFixed(2)}/W` : formatPrice(item.prevRate)
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {change > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                            <TrendingUp className="h-3 w-3" />
                            +{isPanel ? change.toFixed(2) : formatPrice(change)}
                          </span>
                        ) : change < 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <TrendingDown className="h-3 w-3" />
                            {isPanel ? change.toFixed(2) : formatPrice(change)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <Minus className="h-3 w-3" /> Stable
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {item.badge && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 w-max">
                              {item.badge}
                            </span>
                          )}
                          {item.warranty && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                              {item.warranty}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item, idx)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
                            title="Edit Rate"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
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

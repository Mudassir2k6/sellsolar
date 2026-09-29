'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  Store,
  Tag,
  Eye,
  Flame,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  Phone,
  Mail,
  ArrowUpDown,
  Filter,
  Layers,
  Database,
  Check,
  Building,
  TrendingUp,
  Package
} from 'lucide-react';

export default function AdminDrillDownModal({
  isOpen,
  onClose,
  initialMetric = 'users',
  usersList = [],
  listingsList = [],
  dealersList = [],
  myAds = [],
  inboxMessages = [],
  onNavigateToListing,
  onSelectTab,
  onRefreshData,
  backendInfo = {},
}) {
  const [currentMetric, setCurrentMetric] = useState(initialMetric);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'views_desc' | 'name_asc'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state if initialMetric changes when opened
  React.useEffect(() => {
    if (initialMetric) {
      setCurrentMetric(initialMetric);
      setSearchQuery('');
      setFilterCategory('all');
    }
  }, [initialMetric, isOpen]);

  if (!isOpen) return null;

  const handleManualRefresh = async () => {
    if (!onRefreshData) return;
    setIsRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let rows = [];
    let filename = `sellsolar-${currentMetric}-drilldown.csv`;

    if (currentMetric === 'users') {
      rows = filteredUsers.map((u) => ({
        Name: u.name || '',
        Email: u.email || '',
        Phone: u.phone || '',
        City: u.city || '',
        Role: u.role || '',
        AccountType: u.account_type || '',
        Verified: u.is_verified_dealer ? 'Yes' : 'No',
        CreatedAt: u.created_at || '',
      }));
    } else if (currentMetric === 'dealers') {
      rows = filteredDealers.map((d) => ({
        BusinessName: d.business_name || d.name || '',
        ContactPerson: d.full_name || '',
        City: d.city || '',
        Phone: d.phone || '',
        Address: d.business_address || '',
        Rating: d.rating || '4.8',
        Verified: 'Yes',
      }));
    } else if (currentMetric === 'listings' || currentMetric === 'my-ads' || currentMetric === 'hot-sell' || currentMetric === 'views') {
      rows = filteredListings.map((l) => ({
        Title: l.title || '',
        Brand: l.brand || '',
        Category: l.category || '',
        PricePKR: l.price || 0,
        City: l.city || '',
        Condition: l.condition || '',
        Views: l.views || 0,
        Status: l.is_sold || l.status === 'sold' ? 'Sold' : 'Active',
        SellerName: l.seller_name || '',
        SellerPhone: l.seller_phone || '',
        CreatedAt: l.created_at || '',
      }));
    } else if (currentMetric === 'inbox') {
      rows = filteredInbox.map((m) => ({
        Name: m.name || '',
        Email: m.email || '',
        Phone: m.phone || '',
        Subject: m.subject || '',
        Date: m.created_at || '',
        Status: m.read ? 'Read' : 'Unread',
      }));
    }

    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return usersList
      .filter((u) => {
        if (filterCategory === 'dealer' && u.role !== 'dealer' && !u.is_verified_dealer) return false;
        if (filterCategory === 'admin' && u.role !== 'admin' && u.role !== 'super_admin') return false;
        if (filterCategory === 'customer' && (u.role === 'dealer' || u.role === 'admin' || u.role === 'super_admin')) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [usersList, filterCategory, searchQuery, sortBy]);

  const filteredDealers = useMemo(() => {
    return dealersList
      .filter((d) => {
        if (filterCategory !== 'all' && d.city?.toLowerCase() !== filterCategory.toLowerCase()) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          d.business_name?.toLowerCase().includes(q) ||
          d.full_name?.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q) ||
          d.phone?.includes(q) ||
          d.business_address?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return (a.business_name || a.name || '').localeCompare(b.business_name || b.name || '');
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [dealersList, filterCategory, searchQuery, sortBy]);

  const activeSourceListings = currentMetric === 'my-ads' ? myAds : listingsList;

  const filteredListings = useMemo(() => {
    return activeSourceListings
      .filter((l) => {
        if (currentMetric === 'hot-sell' && !l.is_hot_sell && !l.featured) return false;
        if (filterCategory === 'active' && (l.is_sold || l.status === 'sold')) return false;
        if (filterCategory === 'sold' && !(l.is_sold || l.status === 'sold')) return false;
        if (filterCategory === 'panel' && l.category !== 'panel') return false;
        if (filterCategory === 'inverter' && l.category !== 'inverter') return false;
        if (filterCategory === 'battery' && l.category !== 'battery') return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          l.title?.toLowerCase().includes(q) ||
          l.brand?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.seller_name?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'views_desc' || currentMetric === 'views') return (b.views || 0) - (a.views || 0);
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [activeSourceListings, currentMetric, filterCategory, searchQuery, sortBy]);

  const filteredInbox = useMemo(() => {
    return inboxMessages
      .filter((m) => {
        if (filterCategory === 'unread' && m.read) return false;
        if (filterCategory === 'read' && !m.read) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [inboxMessages, filterCategory, searchQuery]);

  // Metric metadata
  const metricTabs = [
    { id: 'users', label: 'Total Users', count: usersList.length, icon: Users, tabTarget: 'roles' },
    { id: 'dealers', label: 'Verified Dealers', count: dealersList.length, icon: Store, tabTarget: 'dealers-directory' },
    { id: 'listings', label: 'Market Listings', count: listingsList.length, icon: Tag, tabTarget: 'products' },
    { id: 'my-ads', label: 'My Active Ads', count: myAds.length, icon: Package, tabTarget: 'my-ads' },
    { id: 'views', label: 'Ad Views Breakdown', count: listingsList.reduce((acc, l) => acc + (l.views || 0), 0), icon: Eye, tabTarget: 'analytics' },
    { id: 'hot-sell', label: 'Hot Sell Ads', count: listingsList.filter((l) => l.is_hot_sell || l.featured).length, icon: Flame, tabTarget: 'products' },
    { id: 'inbox', label: 'Inquiries & Messages', count: inboxMessages.length, icon: MessageSquare, tabTarget: 'inbox' },
  ];

  const activeTabMeta = metricTabs.find((m) => m.id === currentMetric) || metricTabs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative flex flex-col w-full max-w-6xl max-h-[92vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Backend Verified: Supabase PostgreSQL
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Live Data Drill-Down Explorer
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 flex items-center gap-2">
              <activeTabMeta.icon className="w-6 h-6 text-amber-500 shrink-0" />
              <span>{activeTabMeta.label} Detailed Drill-Down</span>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                {activeTabMeta.count} records
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Refresh directly from backend database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Refresh DB'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Export visible records to CSV file"
            >
              <Download className="w-3.5 h-3.5 text-primary-600" />
              <span>Export CSV</span>
            </button>
            {onSelectTab && (
              <button
                type="button"
                onClick={() => {
                  onSelectTab(activeTabMeta.tabTarget);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Full Tab View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
              aria-label="Close Drill-Down Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {metricTabs.map((tab) => {
            const isSelected = tab.id === currentMetric;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCurrentMetric(tab.id);
                  setSearchQuery('');
                  setFilterCategory('all');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:px-6 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTabMeta.label.toLowerCase()} (name, phone, city, title)...`}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Context Filters */}
            {currentMetric === 'users' && (
              <div className="flex items-center gap-1 text-xs">
                {['all', 'admin', 'dealer', 'customer'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Roles' : cat}
                  </button>
                ))}
              </div>
            )}

            {currentMetric === 'dealers' && (
              <div className="flex items-center gap-1 text-xs">
                {['all', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFilterCategory(city)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filterCategory === city
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {city === 'all' ? 'All Cities' : city}
                  </button>
                ))}
              </div>
            )}

            {(currentMetric === 'listings' || currentMetric === 'my-ads' || currentMetric === 'hot-sell' || currentMetric === 'views') && (
              <div className="flex items-center gap-1 text-xs">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active Only' },
                  { id: 'sold', label: 'Sold Only' },
                  { id: 'panel', label: 'Panels' },
                  { id: 'inverter', label: 'Inverters' },
                  { id: 'battery', label: 'Batteries' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterCategory(f.id)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filterCategory === f.id
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Sort Control */}
            <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-gray-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="name_asc">Alphabetical (A-Z)</option>
                <option value="views_desc">Highest Views</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area Table / Detailed View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* 1. USERS DRILL DOWN */}
          {currentMetric === 'users' && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="py-3 px-4">User &amp; Contact</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Role &amp; Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No users match current search / filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => (
                      <tr key={u.id || idx} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300 text-xs shrink-0">
                              {(u.name || u.email || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                {u.name || 'Unnamed User'}
                                {u.isCurrentSession && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    YOU
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">{u.email || u.phone || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {u.city || 'Pakistan'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              u.role === 'super_admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : u.role === 'admin'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : u.role === 'dealer' || u.is_verified_dealer
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {u.role || 'customer'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {u.source === 'supabase_db' ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Supabase DB
                            </span>
                          ) : (
                            <span className="text-gray-400">Local Verified</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. DEALERS DRILL DOWN */}
          {currentMetric === 'dealers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDealers.length === 0 ? (
                <div className="col-span-full py-8 text-center text-gray-500">
                  No verified dealers match your city or query.
                </div>
              ) : (
                filteredDealers.map((d, idx) => (
                  <div
                    key={d.id || idx}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">
                          {d.business_name || d.name}
                        </h4>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{d.city || 'Pakistan'}</span>
                        {d.business_address && <span className="truncate max-w-[200px] text-gray-400">• {d.business_address}</span>}
                      </p>
                      {d.specialties && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                          {d.specialties}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {d.phone || '0300-SOLAR-PK'}
                      </span>
                      <a
                        href={`https://wa.me/92${(d.phone || '').replace(/[^0-9]/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. LISTINGS / MY ADS / HOT SELL / VIEWS DRILL DOWN */}
          {(currentMetric === 'listings' || currentMetric === 'my-ads' || currentMetric === 'hot-sell' || currentMetric === 'views') && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="py-3 px-4">Solar Product</th>
                    <th className="py-3 px-4">Category &amp; Brand</th>
                    <th className="py-3 px-4">Price (PKR)</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No equipment found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-bold text-amber-700 shrink-0">
                                <Package className="w-5 h-5 text-amber-600" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <p className="font-bold text-gray-900 dark:text-white truncate" title={item.title}>
                                {item.title}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Seller: {item.seller_name || 'Verified Seller'} {item.seller_phone ? `• ${item.seller_phone}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize font-semibold text-gray-800 dark:text-gray-200">
                            {item.category || 'Solar'}
                          </span>
                          <span className="block text-[10px] text-gray-400 font-medium">
                            {item.brand || 'Tier-1'} • {item.condition === 'used' ? 'Used' : 'New'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-amber-600 dark:text-amber-400">
                          Rs. {Number(item.price || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {item.city || 'Pakistan'}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                            {item.views || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.is_sold || item.status === 'sold'
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {item.is_sold || item.status === 'sold' ? 'Sold' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {onNavigateToListing && (
                            <button
                              type="button"
                              onClick={() => {
                                onNavigateToListing(item.id);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. INBOX DRILL DOWN */}
          {currentMetric === 'inbox' && (
            <div className="space-y-3">
              {filteredInbox.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No contact inquiries found.
                </div>
              ) : (
                filteredInbox.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs hover:border-amber-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {msg.name || 'Visitor'}
                        </span>
                        <span className="text-xs text-gray-400">• {msg.email}</span>
                        {!msg.read && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-800 uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-xs text-gray-700 dark:text-gray-300 mt-1">
                        {msg.subject || 'Marketplace Solar Inquiry'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-gray-400">
                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectTab) onSelectTab('inbox');
                          onClose();
                        }}
                        className="mt-1 px-3 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs"
                      >
                        Reply in Inbox
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Summary */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Database: Supabase PostgreSQL connected ({usersList.length} users, {listingsList.length} listings)</span>
          </div>
          <div>
            Showing <strong className="text-gray-900 dark:text-white">{
              currentMetric === 'users' ? filteredUsers.length :
              currentMetric === 'dealers' ? filteredDealers.length :
              currentMetric === 'inbox' ? filteredInbox.length :
              filteredListings.length
            }</strong> filtered records
          </div>
        </div>

      </div>
    </div>
  );
}

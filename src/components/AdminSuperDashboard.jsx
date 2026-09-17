'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  Tag,
  Clock,
  CircleCheckBig,
  CircleX,
  Star,
  Flame,
  MessageSquare,
  ChartColumn,
  FileText,
  Settings,
  ShieldCheck,
  Bell,
  Search,
  Check,
  Send,
  Trash2,
  ExternalLink,
  Eye,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Share2,
  Sparkles,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  CircleAlert,
  SlidersHorizontal,
  Package,
  PlusCircle,
  User,
  Lock,
  LogOut,
  DollarSign,
  Building,
} from 'lucide-react';
import { useAuth, USER_ROLES, getStoredUsers, saveStoredUsers, DEFAULT_ADMIN_ID, DEFAULT_ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getInboxMessages, replyToInboxMessage, markMessageAsRead, deleteInboxMessage } from '../services/inboxService';
import { getAnalyticsSummary } from '../services/analyticsService';
import { formatPrice } from '../lib/constants';

export default function AdminSuperDashboard({
  onBack,
  onNavigateToListing,
  onPostAd,
  onChangePassword,
}) {
  const { user, profile, isSuperAdmin, isAdmin, isDealer, isCustomer, updateUserRole, updateProfile, signOut } = useAuth();
  const { showToast } = useToast();
  const { settings, updateSiteSettings } = useSiteSettings();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [inboxFilter, setInboxFilter] = useState('all'); // 'all' | 'unread' | 'replied'
  const [productFilter, setProductFilter] = useState('all'); // 'all' | 'featured' | 'hot_sell' | 'pending' | 'approved'
  const [myAdsFilter, setMyAdsFilter] = useState('all'); // 'all' | 'active' | 'sold'
  const [searchQuery, setSearchQuery] = useState('');
  const [cmsForm, setCmsForm] = useState({ ...settings });
  const [cmsSaved, setCmsSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.city || 'Lahore',
    businessName: profile?.business_name || '',
    showroomAddress: profile?.showroom_address || '',
  });

  useEffect(() => {
    if (profile || user) {
      setProfileForm({
        fullName: profile?.full_name || user?.user_metadata?.full_name || '',
        phone: profile?.phone || '',
        city: profile?.city || 'Lahore',
        businessName: profile?.business_name || '',
        showroomAddress: profile?.showroom_address || '',
      });
    }
  }, [profile, user]);

  // Compute user's personal ads
  const myAds = useMemo(() => {
    if (!user) return [];
    const uEmail = user.email?.toLowerCase();
    const pName = profile?.full_name?.toLowerCase();
    const pPhone = profile?.phone;
    return listingsList.filter((item) => {
      return (
        item.user_id === user.id ||
        (uEmail && (item.seller_email?.toLowerCase() === uEmail || item.email?.toLowerCase() === uEmail)) ||
        (pName && item.seller_name?.toLowerCase() === pName) ||
        (pPhone && item.seller_phone === pPhone)
      );
    });
  }, [listingsList, user, profile]);

  // Load users and listings
  const loadData = () => {
    // 1. Users
    const rawUsers = getStoredUsers();
    const mappedUsers = Object.entries(rawUsers).map(([key, val]) => {
      const p = val.profile || {};
      const u = val.user || {};
      return {
        id: p.id || u.id || key,
        email: p.email || u.email || (key.includes('@') ? key : ''),
        name: p.full_name || u.user_metadata?.full_name || p.username || key,
        phone: p.phone || '',
        city: p.city || 'Lahore',
        role: p.role || (p.is_super_admin ? 'super_admin' : p.is_admin ? 'admin' : p.account_type === 'dealer' ? 'dealer' : 'customer'),
        is_verified_dealer: !!p.is_verified_dealer,
        account_type: p.account_type || 'individual',
        created_at: p.created_at || '2026-01-01T00:00:00Z',
      };
    });
    setUsersList(mappedUsers);

    // 2. Listings
    try {
      const rawListings = localStorage.getItem('sellsolar_custom_listings');
      if (rawListings) {
        const parsed = JSON.parse(rawListings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setListingsList(parsed);
        }
      }
    } catch {}

    // 3. Inbox
    setInboxMessages(getInboxMessages());
  };

  useEffect(() => {
    loadData();
    const handleInboxUpdate = () => setInboxMessages(getInboxMessages());
    window.addEventListener('sellsolar_inbox_updated', handleInboxUpdate);
    return () => window.removeEventListener('sellsolar_inbox_updated', handleInboxUpdate);
  }, []);

  useEffect(() => {
    setCmsForm({ ...settings });
  }, [settings]);

  // Analytics summary
  const analytics = useMemo(() => getAnalyticsSummary(listingsList), [listingsList]);

  // Handle User Role Change
  const handleRoleChange = async (userIdOrEmail, newRole) => {
    try {
      if (updateUserRole) {
        await updateUserRole(userIdOrEmail, newRole);
      }
      loadData();
      showToast({
        title: 'User Role Updated',
        message: `User role has been updated to ${newRole.toUpperCase()}.`,
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Update Failed',
        message: err.message || 'Could not update role.',
        type: 'error',
      });
    }
  };

  // Toggle Featured Listing
  const handleToggleFeatured = (listingId) => {
    const updated = listingsList.map((item) => {
      if (item.id === listingId) {
        return { ...item, is_featured: !item.is_featured };
      }
      return item;
    });
    setListingsList(updated);
    try {
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(updated));
    } catch {}
    showToast({
      title: 'Listing Updated',
      message: 'Featured status has been updated.',
      type: 'success',
    });
  };

  // Toggle Hot Sell Listing
  const handleToggleHotSell = (listingId) => {
    const updated = listingsList.map((item) => {
      if (item.id === listingId) {
        return { ...item, is_hot_sell: !item.is_hot_sell };
      }
      return item;
    });
    setListingsList(updated);
    try {
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(updated));
    } catch {}
    showToast({
      title: 'Listing Updated',
      message: 'Hot Sell status has been updated.',
      type: 'success',
    });
  };

  // Toggle Approved Status
  const handleToggleApproved = (listingId, newStatus) => {
    const updated = listingsList.map((item) => {
      if (item.id === listingId) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setListingsList(updated);
    try {
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(updated));
    } catch {}
    showToast({
      title: 'Listing Status Updated',
      message: `Product is now marked as ${newStatus}.`,
      type: 'success',
    });
  };

  // Send Reply to Inbox Message
  const handleSendReply = (e) => {
    e?.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;
    try {
      replyToInboxMessage(selectedMessage.id, replyText.trim(), isSuperAdmin ? 'Super Admin' : 'Admin');
      setReplyText('');
      setInboxMessages(getInboxMessages());
      const refreshed = getInboxMessages().find((m) => m.id === selectedMessage.id);
      setSelectedMessage(refreshed);
      showToast({
        title: 'Reply Sent',
        message: `Your response has been dispatched to ${selectedMessage.senderEmail}.`,
        type: 'success',
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Save CMS Settings
  const handleSaveCmsSettings = (e) => {
    e?.preventDefault();
    updateSiteSettings(cmsForm);
    setCmsSaved(true);
    setTimeout(() => setCmsSaved(false), 3000);
    showToast({
      title: 'Website Settings Saved',
      message: 'Brand identity, WhatsApp configuration and contact info updated live.',
      type: 'success',
    });
  };

  // Toggle Sold for Personal Ad
  const handleToggleSold = (listingId) => {
    const updated = listingsList.map((item) => {
      if (item.id === listingId) {
        const isSoldNow = !item.is_sold;
        return { ...item, is_sold: isSoldNow, status: isSoldNow ? 'sold' : 'approved' };
      }
      return item;
    });
    setListingsList(updated);
    try {
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(updated));
    } catch {}
    showToast({
      title: 'Status Updated',
      message: 'Product sold status has been updated.',
      type: 'success',
    });
  };

  // Delete Personal Ad
  const handleDeleteMyAd = (listingId) => {
    if (!confirm('Are you sure you want to remove this solar ad?')) return;
    const updated = listingsList.filter((item) => item.id !== listingId);
    setListingsList(updated);
    try {
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(updated));
    } catch {}
    showToast({
      title: 'Ad Removed',
      message: 'Your listing has been removed from SellSolar.',
      type: 'info',
    });
  };

  // Save Profile Info
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    try {
      if (updateProfile) {
        await updateProfile({
          full_name: profileForm.fullName,
          phone: profileForm.phone,
          city: profileForm.city,
          business_name: profileForm.businessName,
          showroom_address: profileForm.showroomAddress,
        });
      }
      showToast({
        title: 'Profile Updated',
        message: 'Your personal information and contact details have been updated.',
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Update Failed',
        message: err.message || 'Could not update profile.',
        type: 'error',
      });
    }
  };

  // Filtered Inbox Messages
  const filteredInbox = inboxMessages.filter((msg) => {
    if (inboxFilter === 'unread') return !msg.is_read;
    if (inboxFilter === 'replied') return msg.status === 'replied';
    return true;
  }).filter((msg) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (msg.senderName || '').toLowerCase().includes(q) ||
      (msg.senderEmail || '').toLowerCase().includes(q) ||
      (msg.ticketNumber || '').toLowerCase().includes(q) ||
      (msg.subject || '').toLowerCase().includes(q)
    );
  });

  // Filtered Listings
  const filteredListings = listingsList.filter((item) => {
    if (productFilter === 'featured') return !!item.is_featured;
    if (productFilter === 'hot_sell') return !!item.is_hot_sell;
    if (productFilter === 'pending') return item.status === 'pending';
    if (productFilter === 'approved') return item.status === 'approved' || !item.status;
    return true;
  }).filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.brand || '').toLowerCase().includes(q) ||
      (item.city || '').toLowerCase().includes(q)
    );
  });

  const unreadInboxCount = inboxMessages.filter((m) => !m.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            title="Back to Marketplace"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white">
                Sell<span className="text-amber-500">Solar</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isSuperAdmin
                  ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : isAdmin
                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : isDealer
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {isSuperAdmin
                  ? '👑 Super Admin Dashboard'
                  : isAdmin
                  ? '🛡️ Admin Dashboard'
                  : isDealer
                  ? '🏬 Verified Dealer Dashboard'
                  : '👤 My Dashboard'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onPostAd && (
            <button
              type="button"
              onClick={onPostAd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post Ad</span>
            </button>
          )}

          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.email || DEFAULT_ADMIN_EMAIL}</p>
            <p className="text-[10px] text-gray-400 capitalize">
              {isSuperAdmin
                ? 'Super Administrator'
                : isAdmin
                ? 'Administrator'
                : isDealer
                ? 'Solar Dealer Store'
                : 'Verified User'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="btn-secondary text-xs px-2.5 sm:px-3 py-1.5"
          >
            Marketplace ↗
          </button>
        </div>
      </header>

      {/* Main Unified Dashboard Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shrink-0 flex flex-col justify-between">
          <nav className="space-y-1">
            {/* User card in sidebar */}
            <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || 'My Account'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-white shadow-sm font-black'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </button>

            {/* TAB 2: MY ADS & INVENTORY */}
            <button
              type="button"
              onClick={() => setActiveTab('my-ads')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'my-ads'
                  ? 'bg-amber-500 text-white shadow-sm font-black'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4" />
                <span>My Solar Ads</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'my-ads' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {myAds.length}
              </span>
            </button>

            {/* TAB 3: PRODUCTS & MODERATION (SUPER ADMIN & ADMIN ONLY) */}
            {(isSuperAdmin || isAdmin) && (
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'products'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="h-4 w-4" />
                  <span>Marketplace Moderation</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{listingsList.length}</span>
              </button>
            )}

            {/* TAB 4: INBOX & INQUIRIES */}
            <button
              type="button"
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-amber-500 text-white shadow-sm font-black'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4" />
                <span>Inbox {isSuperAdmin ? '(info@sellsolar)' : 'Messages'}</span>
              </div>
              {unreadInboxCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
                  {unreadInboxCount}
                </span>
              )}
            </button>

            {/* TAB 5: ANALYTICS & TRAFFIC */}
            {(isSuperAdmin || isAdmin) && (
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ChartColumn className="h-4 w-4" />
                  <span>Analytics & Traffic</span>
                </div>
              </button>
            )}

            {/* SUPER ADMIN ONLY TABS */}
            {isSuperAdmin && (
              <>
                <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Super Admin Master
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('roles')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'roles'
                      ? 'bg-purple-600 text-white shadow-sm font-black'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-purple-500" />
                    <span>Roles & Permissions</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{usersList.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-purple-600 text-white shadow-sm font-black'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-purple-500" />
                    <span>Website Settings & CMS</span>
                  </div>
                </button>
              </>
            )}

            {/* TAB: MY PROFILE & SECURITY */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Personal Account
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-white shadow-sm font-black'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4" />
                <span>My Profile & Security</span>
              </div>
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {onPostAd && (
              <button
                type="button"
                onClick={onPostAd}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post New Solar Ad</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => signOut?.()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD / OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Role-aware Welcome Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent border border-amber-200/60 dark:border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      Welcome back,
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isSuperAdmin
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : isAdmin
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : isDealer
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {isSuperAdmin
                        ? '👑 Super Admin Master'
                        : isAdmin
                        ? '🛡️ Administrator'
                        : isDealer
                        ? '🏬 Verified Dealer'
                        : '👤 Registered Seller'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'SellSolar User'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isSuperAdmin
                      ? 'You have master control over website CMS, user roles, inbox, and marketplace equipment.'
                      : isDealer
                      ? 'Manage your commercial solar inventory, monitor buyer inquiries, and update showroom profile.'
                      : 'Manage your active solar listings, monitor ad views, and check customer inquiries.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onPostAd && (
                    <button
                      type="button"
                      onClick={onPostAd}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Post Solar Ad</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-ads')}
                    className="btn-secondary text-xs px-3.5 py-2.5 font-bold"
                  >
                    My Ads ({myAds.length})
                  </button>
                </div>
              </div>

              {/* KPI Cards: Platform KPIs (if Super Admin/Admin) or Personal KPIs (if Dealer/Customer) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {isSuperAdmin || isAdmin ? (
                  <>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{usersList.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dealers</p>
                      <p className="text-2xl font-black text-primary-600 dark:text-primary-400 mt-1">
                        {usersList.filter((u) => u.role === 'dealer' || u.is_verified_dealer).length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Market Listings</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{listingsList.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">My Active Ads</p>
                      <p className="text-2xl font-black text-amber-500 mt-1">{myAds.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hot Sell Badges</p>
                      <p className="text-2xl font-black text-rose-500 mt-1">
                        {listingsList.filter((l) => l.is_hot_sell).length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inbox Unread</p>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{unreadInboxCount}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">My Total Ads</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{myAds.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Listings</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {myAds.filter((a) => !a.is_sold && a.status !== 'sold').length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sold Products</p>
                      <p className="text-2xl font-black text-gray-600 dark:text-gray-300 mt-1">
                        {myAds.filter((a) => a.is_sold || a.status === 'sold').length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Views on My Ads</p>
                      <p className="text-2xl font-black text-amber-500 mt-1">
                        {myAds.reduce((acc, curr) => acc + (curr.views || 0), 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Account Role</p>
                      <p className="text-base font-black text-primary-600 capitalize mt-2">
                        {isDealer ? 'Dealer' : 'Seller'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inquiries</p>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                        {unreadInboxCount}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-amber-500" />
                      Inquiries & Messages
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {isSuperAdmin
                        ? 'Check incoming contact messages to info@sellsolar.pk and reply directly.'
                        : 'Check inquiries from buyers interested in your solar equipment.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inbox')}
                    className="mt-4 btn-primary text-xs w-full py-2"
                  >
                    Open Inbox ({unreadInboxCount} New)
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-500" />
                      My Solar Equipment
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      You currently have {myAds.length} solar listings on the SellSolar marketplace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-ads')}
                    className="mt-4 btn-secondary text-xs w-full py-2"
                  >
                    Manage My Ads ({myAds.length})
                  </button>
                </div>

                {isSuperAdmin ? (
                  <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-purple-600" />
                        Website Settings & CMS
                      </h3>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        Control WhatsApp number, site logo, brand text and social media links.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      Configure Site Settings
                    </button>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-500" />
                        Profile & Security
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Update your contact number, city, and change your account password.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="mt-4 btn-secondary text-xs w-full py-2"
                    >
                      View Profile Settings
                    </button>
                  </div>
                )}
              </div>

              {/* My Recent Listings on Overview */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-500" />
                      My Recent Solar Ads
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Your recently listed solar equipment on SellSolar.pk
                    </p>
                  </div>
                  {onPostAd && (
                    <button
                      type="button"
                      onClick={onPostAd}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Post New Ad</span>
                    </button>
                  )}
                </div>

                {myAds.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">You haven't posted any ads yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Sell your used or new solar panels, inverters and batteries.</p>
                    {onPostAd && (
                      <button
                        type="button"
                        onClick={onPostAd}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                      >
                        + Post Free Ad
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {myAds.slice(0, 3).map((ad) => (
                      <div
                        key={ad.id}
                        className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{ad.title}</p>
                          <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">{formatPrice(ad.price)}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ad.is_sold || ad.status === 'sold'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ad.is_sold || ad.status === 'sold' ? 'Sold' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INBOX (info@sellsolar.pk) */}
          {activeTab === 'inbox' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-6 w-6 text-amber-500" />
                    Unified Inbox (info@sellsolar.pk)
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Customer contact messages, dealer inquiries, and direct responses.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInboxFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inboxFilter === 'all'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    All ({inboxMessages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('unread')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inboxFilter === 'unread'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Unread ({unreadInboxCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('replied')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inboxFilter === 'replied'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Replied ({inboxMessages.filter((m) => m.status === 'replied').length})
                  </button>
                </div>
              </div>

              {/* Message Layout: List + Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Message List */}
                <div className="lg:col-span-5 space-y-2">
                  {filteredInbox.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-400">
                      No messages found in this category.
                    </div>
                  ) : (
                    filteredInbox.map((msg) => {
                      const isSelected = selectedMessage?.id === msg.id;
                      return (
                        <div
                          key={msg.id}
                          onClick={() => {
                            setSelectedMessage(msg);
                            markMessageAsRead(msg.id);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                              : !msg.is_read
                              ? 'border-rose-200 dark:border-rose-900/60 bg-white dark:bg-gray-900 font-bold'
                              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                              {msg.ticketNumber}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1 truncate">
                            {msg.subject || 'Inquiry'}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {msg.senderName} • {msg.senderEmail}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px]">
                            <span className="text-gray-400">{msg.category}</span>
                            <span className={`px-1.5 py-0.5 rounded font-black uppercase ${
                              msg.status === 'replied'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : !msg.is_read
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {msg.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Detail & Reply Composer */}
                <div className="lg:col-span-7">
                  {selectedMessage ? (
                    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                      <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              {selectedMessage.ticketNumber}
                            </span>
                            <span className="text-xs text-gray-400">
                              Sent to: <strong>{selectedMessage.recipientEmail || 'info@sellsolar.pk'}</strong>
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white mt-2">
                            {selectedMessage.subject}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            From: <strong>{selectedMessage.senderName}</strong> ({selectedMessage.senderEmail}){' '}
                            {selectedMessage.senderPhone && `• Phone: ${selectedMessage.senderPhone}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            deleteInboxMessage(selectedMessage.id);
                            setSelectedMessage(null);
                            setInboxMessages(getInboxMessages());
                          }}
                          className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Message Content */}
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </div>

                      {/* Reply Thread */}
                      {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Responses Sent</h4>
                          {selectedMessage.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs"
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                                <span>{rep.sender}</span>
                                <span className="font-normal text-gray-400">
                                  {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Composer */}
                      <form onSubmit={handleSendReply} className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                          Send Reply to {selectedMessage.senderEmail}
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your official response to this inquiry..."
                          className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-400">
                            Reply will be sent from <strong>info@sellsolar.pk</strong>
                          </span>
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Dispatch Reply
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                      <Mail className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-2" />
                      Select an inquiry from the list on the left to read and reply.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS & VIEWS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Visitor & Product Analytics</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Track website visits, unique sessions, and most viewed solar equipment.
                </p>
              </div>

              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Total Site Visits</span>
                    <Eye className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {analytics.totalVisits.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                    ↑ Real-time tracking active
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Today's Visits</span>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {analytics.todayVisits.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 font-semibold">Today's sessions</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Unique Visitors</span>
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {analytics.uniqueVisitors.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">
                    Distinct browser sessions
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Product Views</span>
                    <Tag className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {analytics.totalProductViews.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                    Listing detail impressions
                  </p>
                </div>
              </div>

              {/* Top 10 Most Viewed Products Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    🔥 Top 10 Most Viewed Solar Equipment
                  </h3>
                  <span className="text-xs text-gray-400 font-semibold">Live ranking</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Equipment</th>
                        <th className="p-3">Brand & Category</th>
                        <th className="p-3">City</th>
                        <th className="p-3">Price</th>
                        <th className="p-3 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {analytics.topViewedProducts.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-gray-400">#{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              ) : null}
                              <span className="font-bold text-gray-900 dark:text-white truncate max-w-xs">
                                {item.title}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-500">
                            {item.brand} • <span className="capitalize">{item.category}</span>
                          </td>
                          <td className="p-3 text-gray-500">{item.city}</td>
                          <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                            {formatPrice(item.price)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {item.totalViews.toLocaleString()} views
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS MANAGEMENT (Featured & Hot Sell) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">Solar Equipment Moderation</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Toggle ⭐ Featured status and 🔥 Hot Sell badges directly with 1 click.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['all', 'featured', 'hot_sell', 'pending', 'approved'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setProductFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                        productFilter === f
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                      <tr>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Brand / City</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Badges</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredListings.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                              ) : null}
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{item.title}</p>
                                <p className="text-[11px] text-gray-400 capitalize">{item.category} • {item.condition}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-gray-500">
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{item.brand}</p>
                            <p className="text-[11px] text-gray-400">{item.city}</p>
                          </td>
                          <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">
                            {formatPrice(item.price)}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Toggle Featured Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(item.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                                  item.is_featured
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700'
                                }`}
                                title="Click to toggle Featured"
                              >
                                <Star className={`w-3 h-3 ${item.is_featured ? 'fill-current' : ''}`} />
                                {item.is_featured ? 'Featured' : 'Add Feature'}
                              </button>

                              {/* Toggle Hot Sell Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleHotSell(item.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                                  item.is_hot_sell
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700'
                                }`}
                                title="Click to toggle Hot Sell"
                              >
                                <Flame className={`w-3 h-3 ${item.is_hot_sell ? 'fill-current' : ''}`} />
                                {item.is_hot_sell ? 'Hot Sell' : 'Add Hot Sell'}
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              item.status === 'approved' || !item.status
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                                : item.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                            }`}>
                              {item.status || 'approved'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleApproved(item.id, 'approved')}
                                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  title="Approve Listing"
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </button>
                              )}
                              {item.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleApproved(item.id, 'rejected')}
                                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 transition-colors"
                                  title="Reject Listing"
                                >
                                  <CircleX className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ROLES & ACCESS (SUPER ADMIN ONLY) */}
          {activeTab === 'roles' && isSuperAdmin && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-purple-600" />
                  Roles & Permissions (4 Tiers)
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Manage user roles between <strong>Super Admin</strong>, <strong>Admin</strong>, <strong>Dealer</strong>, and <strong>Customer</strong>.
                </p>
              </div>

              {/* Roles Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                      <tr>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Email & Phone</th>
                        <th className="p-3.5">City</th>
                        <th className="p-3.5">Assigned Role</th>
                        <th className="p-3.5 text-right">Role Selector</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {usersList.map((u) => {
                        const isDefaultAdmin = (u.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
                        return (
                          <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="p-3.5">
                              <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                              <p className="text-[10px] font-mono text-gray-400 truncate max-w-xs">{u.id}</p>
                            </td>
                            <td className="p-3.5 text-gray-500">
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{u.email}</p>
                              <p className="text-[11px] text-gray-400">{u.phone || 'No phone'}</p>
                            </td>
                            <td className="p-3.5 text-gray-500">{u.city}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                u.role === 'super_admin'
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                  : u.role === 'admin'
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                  : u.role === 'dealer'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                              }`}>
                                {u.role === 'super_admin' ? '👑 Super Admin' : u.role === 'admin' ? '🛡️ Admin' : u.role === 'dealer' ? '🏬 Dealer' : '👤 Customer'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              {isDefaultAdmin ? (
                                <span className="text-[10px] font-bold text-gray-400 italic">Master Account</span>
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id || u.email, e.target.value)}
                                  className="text-xs font-bold py-1 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                  <option value="customer">Customer</option>
                                  <option value="dealer">Dealer</option>
                                  <option value="admin">Admin</option>
                                  <option value="super_admin">Super Admin</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WEBSITE SETTINGS & CMS (SUPER ADMIN ONLY) */}
          {activeTab === 'settings' && isSuperAdmin && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="h-6 w-6 text-purple-600" />
                  Website Settings & CMS Management
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Change all brand text, logos, social media links, and WhatsApp floating contact button live.
                </p>
              </div>

              {cmsSaved && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Site settings successfully saved and updated across the platform!
                </div>
              )}

              <form onSubmit={handleSaveCmsSettings} className="space-y-6">
                {/* Section 1: WhatsApp Controller */}
                <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                        WhatsApp Floating Chat & Contact Settings
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Controls the floating WhatsApp widget and listing enquiry redirects.
                      </p>
                    </div>
                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmsForm.whatsAppEnabled}
                        onChange={(e) => setCmsForm({ ...cmsForm, whatsAppEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                        {cmsForm.whatsAppEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        WhatsApp Phone Number (with Country Code) *
                      </label>
                      <input
                        type="text"
                        value={cmsForm.whatsAppNumber}
                        onChange={(e) => setCmsForm({ ...cmsForm, whatsAppNumber: e.target.value })}
                        placeholder="e.g. 923001234567"
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Display Number Format
                      </label>
                      <input
                        type="text"
                        value={cmsForm.whatsAppDisplayNumber}
                        onChange={(e) => setCmsForm({ ...cmsForm, whatsAppDisplayNumber: e.target.value })}
                        placeholder="e.g. +92 300 1234567"
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Pre-filled WhatsApp Message Template
                    </label>
                    <input
                      type="text"
                      value={cmsForm.whatsAppDefaultMessage}
                      onChange={(e) => setCmsForm({ ...cmsForm, whatsAppDefaultMessage: e.target.value })}
                      placeholder="Assalam-o-Alaikum, I am inquiring about solar equipment on SellSolar.pk"
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                {/* Section 2: Branding & Headings */}
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Brand & Homepage Headings</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Website Brand Name
                      </label>
                      <input
                        type="text"
                        value={cmsForm.siteTitle}
                        onChange={(e) => setCmsForm({ ...cmsForm, siteTitle: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Brand Tagline
                      </label>
                      <input
                        type="text"
                        value={cmsForm.tagline}
                        onChange={(e) => setCmsForm({ ...cmsForm, tagline: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Hero Banner Heading
                    </label>
                    <input
                      type="text"
                      value={cmsForm.heroHeading}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroHeading: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Hero Banner Subtitle
                    </label>
                    <input
                      type="text"
                      value={cmsForm.heroSubheading}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroSubheading: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                {/* Section 3: Contact Info & Support Email */}
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Contact & Support Desk</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Official Support Email *
                      </label>
                      <input
                        type="email"
                        value={cmsForm.supportEmail}
                        onChange={(e) => setCmsForm({ ...cmsForm, supportEmail: e.target.value })}
                        placeholder="info@sellsolar.pk"
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Support Phone
                      </label>
                      <input
                        type="text"
                        value={cmsForm.supportPhone}
                        onChange={(e) => setCmsForm({ ...cmsForm, supportPhone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Head Office Address
                    </label>
                    <input
                      type="text"
                      value={cmsForm.headOfficeAddress}
                      onChange={(e) => setCmsForm({ ...cmsForm, headOfficeAddress: e.target.value })}
                      placeholder="Sector G-7, Blue Area, Islamabad, Pakistan"
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                {/* Section 4: Social Media Links */}
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Social Media Links</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Facebook</label>
                      <input
                        type="url"
                        value={cmsForm.socialLinks?.facebook || ''}
                        onChange={(e) =>
                          setCmsForm({
                            ...cmsForm,
                            socialLinks: { ...(cmsForm.socialLinks || {}), facebook: e.target.value },
                          })
                        }
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Instagram</label>
                      <input
                        type="url"
                        value={cmsForm.socialLinks?.instagram || ''}
                        onChange={(e) =>
                          setCmsForm({
                            ...cmsForm,
                            socialLinks: { ...(cmsForm.socialLinks || {}), instagram: e.target.value },
                          })
                        }
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">YouTube</label>
                      <input
                        type="url"
                        value={cmsForm.socialLinks?.youtube || ''}
                        onChange={(e) =>
                          setCmsForm({
                            ...cmsForm,
                            socialLinks: { ...(cmsForm.socialLinks || {}), youtube: e.target.value },
                          })
                        }
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Twitter / X</label>
                      <input
                        type="url"
                        value={cmsForm.socialLinks?.twitter || ''}
                        onChange={(e) =>
                          setCmsForm({
                            ...cmsForm,
                            socialLinks: { ...(cmsForm.socialLinks || {}), twitter: e.target.value },
                          })
                        }
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Save All Website Settings Live
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: MY SOLAR ADS */}
          {activeTab === 'my-ads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="h-6 w-6 text-amber-500" />
                    My Solar Ads
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage your personal equipment listings, mark items as sold, or post new solar hardware.
                  </p>
                </div>
                {onPostAd && (
                  <button
                    type="button"
                    onClick={onPostAd}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Post New Solar Ad</span>
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMyAdsFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    myAdsFilter === 'all'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  All ({myAds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMyAdsFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    myAdsFilter === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Active ({myAds.filter((a) => !a.is_sold && a.status !== 'sold').length})
                </button>
                <button
                  type="button"
                  onClick={() => setMyAdsFilter('sold')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    myAdsFilter === 'sold'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Sold ({myAds.filter((a) => a.is_sold || a.status === 'sold').length})
                </button>
              </div>

              {/* My Ads Grid */}
              {myAds.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-3">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">No Ads Posted Yet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    You haven't listed any solar panels, inverters, or batteries yet. Start selling across Pakistan for free!
                  </p>
                  {onPostAd && (
                    <button
                      type="button"
                      onClick={onPostAd}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Post Your First Ad Now</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myAds
                    .filter((ad) => {
                      if (myAdsFilter === 'active') return !ad.is_sold && ad.status !== 'sold';
                      if (myAdsFilter === 'sold') return !!ad.is_sold || ad.status === 'sold';
                      return true;
                    })
                    .map((ad) => (
                      <div
                        key={ad.id}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col justify-between shadow-xs hover:border-amber-400/50 transition-all"
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden flex items-center justify-center">
                              {ad.image_url ? (
                                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    ad.is_sold || ad.status === 'sold'
                                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  {ad.is_sold || ad.status === 'sold' ? 'Sold' : 'Active'}
                                </span>
                                {ad.is_featured && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                    ⭐ Featured
                                  </span>
                                )}
                                {ad.is_hot_sell && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                    🔥 Hot Sell
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1 line-clamp-1">
                                {ad.title}
                              </h4>
                              <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                {formatPrice(ad.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <span>{ad.city || 'Pakistan'}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {ad.views || 0} views
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                          <button
                            type="button"
                            onClick={() => handleToggleSold(ad.id)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                              ad.is_sold || ad.status === 'sold'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {ad.is_sold || ad.status === 'sold' ? 'Mark Available' : 'Mark as Sold'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigateToListing?.(ad.id)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            title="View on marketplace"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMyAd(ad.id)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete Ad"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MY PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-6 w-6 text-amber-500" />
                  My Profile & Security
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Manage your personal account details, dealer store information, and security credentials.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 shadow-xs">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-500" />
                    Account Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Full Name / Seller Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="input-field text-xs"
                        placeholder="e.g. Mudassir Solar"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Registered Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || DEFAULT_ADMIN_EMAIL}
                        className="input-field text-xs opacity-60 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="input-field text-xs"
                        placeholder="e.g. 03001234567"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="input-field text-xs"
                        placeholder="e.g. Lahore"
                      />
                    </div>
                  </div>

                  {/* Dealer Store Details */}
                  {(isDealer || isSuperAdmin) && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Store className="h-4 w-4" />
                        Commercial Dealer Store Info
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                            Solar Business / Shop Name
                          </label>
                          <input
                            type="text"
                            value={profileForm.businessName}
                            onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                            className="input-field text-xs"
                            placeholder="e.g. Solar City Electronics"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                            Showroom / Warehouse Address
                          </label>
                          <input
                            type="text"
                            value={profileForm.showroomAddress}
                            onChange={(e) => setProfileForm({ ...profileForm, showroomAddress: e.target.value })}
                            className="input-field text-xs"
                            placeholder="e.g. Main Hall Road, Lahore"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>
              </form>

              {/* Password & Security Card */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    Password & Security
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Update your account login password or reset via 6-digit email OTP.
                  </p>
                </div>
                {onChangePassword && (
                  <button
                    type="button"
                    onClick={onChangePassword}
                    className="btn-secondary text-xs px-4 py-2 font-bold shrink-0"
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

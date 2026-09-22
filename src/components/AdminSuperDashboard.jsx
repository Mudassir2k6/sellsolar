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
  UserCheck,
  UserPlus,
  Lock,
  LogOut,
  DollarSign,
  Building,
  Globe,
  Edit3,
  Plus,
  X,
  Image,
  Layers,
  Sun,
  Wrench,
  Calculator,
  Zap,
  ChevronUp,
  ChevronDown,
  Copy,
  Download,
  Upload,
  Menu,
} from 'lucide-react';
import { useAuth, USER_ROLES, getStoredUsers, saveStoredUsers, DEFAULT_ADMIN_ID, DEFAULT_ADMIN_EMAIL } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useSiteSettings, DEFAULT_SITE_SETTINGS } from '../context/SiteSettingsContext';
import { getInboxMessages, fetchSharedInboxMessages, createDirectMessage, replyToInboxMessage, markMessageAsRead, deleteInboxMessage } from '../services/inboxService';
import { getAnalyticsSummary } from '../services/analyticsService';
import { formatPrice } from '../lib/constants';
import AdminDailyRatesModule from './AdminDailyRatesModule';
import AdminDealersModule from './AdminDealersModule';
import AdminInstallationsModule from './AdminInstallationsModule';

const SOLAR_PRESET_IMAGES = [
  { label: 'Solar Field', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80' },
  { label: 'Rooftop Setup', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Inverters', url: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Green Energy', url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=600&q=80' },
];

export const SYSTEM_PAGES = [
  { path: '/', title: 'Home & Daily Price Benchmark', category: 'Core', description: 'Main marketplace landing, featured solar systems and daily benchmark rates' },
  { path: '/prices', title: 'Solar Price Today Pakistan', category: 'Marketplace', description: 'Live solar panel PKR/watt, inverter rates & battery pricing' },
  { path: '/calculator', title: 'Solar Load Calculator', category: 'Core', description: 'Calculate required system size in kW, panel count, and battery backup' },
  { path: '/dealers', title: 'Verified Solar Dealers Directory', category: 'Marketplace', description: 'Browse verified solar equipment dealers and distributors across Pakistan' },
  { path: '/install', title: 'Solar Installation Request', category: 'Services', description: 'Request professional on-site solar installation and assessment' },
  { path: '/used-solar', title: 'Used Solar Marketplace', category: 'Marketplace', description: 'Buy and sell second-hand solar panels, hybrid inverters and batteries' },
  { path: '/solar-price', title: 'Live Solar Rates & Benchmark', category: 'Marketplace', description: 'Compare market rates before buying used or new solar hardware' },
  { path: '/solar-inverter', title: 'Solar Inverters Directory', category: 'Marketplace', description: 'Inverex, Homage, Growatt, GoodWe hybrid & on-grid inverters' },
  { path: '/solar-batteries', title: 'Solar Batteries & Lithium Price', category: 'Marketplace', description: 'Lithium, tubular and gel solar batteries across Pakistani cities' },
  { path: '/solar-panels', title: 'Solar Panels Directory', category: 'Marketplace', description: 'Longi, Jinko, JA Solar, Canadian Tier-1 panels' },
  { path: '/contact', title: 'Contact Us & Support', category: 'Support', description: 'Reach Islamabad headquarters, WhatsApp desk, or email info@sellsolar.pk' },
  { path: '/about', title: 'About SellSolar', category: 'Company', description: 'Our mission to digitize Pakistan’s clean renewable energy ecosystem' },
  { path: '/careers', title: 'Careers & Solar Jobs', category: 'Company', description: 'Join the fastest growing clean-tech team in Pakistan' },
  { path: '/press', title: 'Press & Media Center', category: 'Company', description: 'Latest news, press releases, and media inquiries' },
  { path: '/blog', title: 'Solar Blog & Net-Metering Guides', category: 'Company', description: 'NEPRA net metering guidelines, solar maintenance and tips' },
  { path: '/buy-solar', title: 'Buy Solar Guide', category: 'Marketplace', description: 'Beginner and commercial guide to purchasing verified solar panels' },
  { path: '/sell-solar', title: 'Sell Solar Free in Pakistan', category: 'Marketplace', description: 'How to list pre-owned or stock equipment without commission' },
  { path: '/how-it-works', title: 'How SellSolar Works', category: 'Marketplace', description: 'Guide for buyers and sellers on how to trade solar equipment safely' },
  { path: '/pricing', title: 'Pricing & Packages', category: 'Marketplace', description: 'Marketplace seller packages and verified dealer subscription tiers' },
  { path: '/help', title: 'Help Center & FAQs', category: 'Support', description: 'Frequently asked questions, troubleshooting, and support documentation' },
  { path: '/safety', title: 'Solar Safety Guidelines', category: 'Support', description: 'Essential electrical safety tips, fake product detection and precautions' },
  { path: '/report-issue', title: 'Report an Issue', category: 'Support', description: 'Submit scam alerts, copyright notices, or platform bugs' },
  { path: '/terms', title: 'Terms of Service', category: 'Legal', description: 'Terms and conditions governing the use of SellSolar marketplace' },
  { path: '/privacy', title: 'Privacy Policy', category: 'Legal', description: 'Information collection, data security, and privacy practices' },
  { path: '/cookies', title: 'Cookie Policy', category: 'Legal', description: 'Details about cookies and tracking technologies used on SellSolar' },
  { path: '/disclaimer', title: 'Disclaimer', category: 'Legal', description: 'Marketplace liability disclaimers, price volatility, and third-party links' },
];

export default function AdminSuperDashboard({
  onBack,
  onNavigateToListing,
  onPostAd,
  onChangePassword,
  initialTab = 'dashboard',
}) {
  const { user, profile, isSuperAdmin, isAdmin, isDealer, isCustomer, updateUserRole, updateProfile, signOut } = useAuth();
  const { showToast } = useToast();
  const { settings, updateSiteSettings, updateHomePageCms } = useSiteSettings();

  const userEmail = (user?.email || profile?.email || '').toLowerCase();
  const effectiveIsSuperAdmin = Boolean(
    isSuperAdmin ||
    profile?.role === 'super_admin' ||
    profile?.is_super_admin ||
    ['admin@sellsolar.pk', 'info@sellsolar.pk', DEFAULT_ADMIN_EMAIL.toLowerCase(), 'mudassirkhan78907890@gmail.com', 'mudassir2k6@gmail.com'].includes(userEmail)
  );
  const effectiveIsAdmin = Boolean(
    effectiveIsSuperAdmin ||
    isAdmin ||
    profile?.role === 'admin' ||
    profile?.is_admin
  );

  const [activeTab, setActiveTab] = useState(initialTab);
  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [inboxFilter, setInboxFilter] = useState('all'); // 'all' | 'unread' | 'replied'
  const [inboxSearchQuery, setInboxSearchQuery] = useState('');
  const [syncingInbox, setSyncingInbox] = useState(false);
  const [productFilter, setProductFilter] = useState('all'); // 'all' | 'featured' | 'hot_sell' | 'pending' | 'approved'
  const [myAdsFilter, setMyAdsFilter] = useState('all'); // 'all' | 'active' | 'sold'
  const [searchQuery, setSearchQuery] = useState('');
  const [cmsForm, setCmsForm] = useState({ ...settings });
  const [cmsSaved, setCmsSaved] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composeForm, setComposeForm] = useState({
    recipientEmail: '',
    subject: '',
    category: 'General Inquiry',
    message: '',
  });

  // Pages & Content CMS State
  const [customPages, setCustomPages] = useState([]);
  const [pageFilter, setPageFilter] = useState('all'); // 'all' | 'core' | 'marketplace' | 'company' | 'support' | 'legal' | 'custom'
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [editingPage, setEditingPage] = useState(null);
  const [pageEditTab, setPageEditTab] = useState('cards'); // 'cards' | 'hero' | 'calculator' | 'seo'
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [pageEditForm, setPageEditForm] = useState({
    title: '',
    description: '',
    heroHeading: '',
    category: 'Core',
    isPublished: true,
    homeCms: null,
  });
  const [newPageForm, setNewPageForm] = useState({
    path: '',
    title: '',
    description: '',
    heroHeading: '',
    category: 'Custom',
  });

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all' | 'super_admin' | 'admin' | 'dealer' | 'customer'
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Lahore',
    role: 'dealer',
  });

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

  // Load users, listings, inquiries
  const loadData = async () => {
    // 1. Users Map
    const usersMap = new Map();

    // 1A. Stored Local Users
    const rawUsers = getStoredUsers();
    Object.entries(rawUsers).forEach(([key, val]) => {
      const p = val.profile || {};
      const u = val.user || {};
      const id = p.id || u.id || key;
      const email = p.email || u.email || (key.includes('@') ? key : '');
      const mapKey = (email || id).toLowerCase();
      usersMap.set(mapKey, {
        id,
        email,
        name: p.full_name || u.user_metadata?.full_name || p.username || (email ? email.split('@')[0] : key),
        phone: p.phone || '',
        city: p.city || 'Lahore',
        role: p.role || (p.is_super_admin ? 'super_admin' : p.is_admin ? 'admin' : p.account_type === 'dealer' || p.is_verified_dealer ? 'dealer' : 'customer'),
        is_verified_dealer: !!p.is_verified_dealer,
        account_type: p.account_type || 'individual',
        created_at: p.created_at || '2026-01-01T00:00:00Z',
        isCurrentSession: false,
      });
    });

    // 1B. Supabase remote profiles (if configured)
    if (isSupabaseConfigured()) {
      try {
        const { data: remoteProfiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(remoteProfiles) && remoteProfiles.length > 0) {
          remoteProfiles.forEach((rp) => {
            const mapKey = (rp.email || rp.id || '').toLowerCase();
            const existing = usersMap.get(mapKey);
            usersMap.set(mapKey, {
              id: rp.id || existing?.id,
              email: rp.email || existing?.email || '',
              name: rp.full_name || rp.username || existing?.name || (rp.email ? rp.email.split('@')[0] : 'User'),
              phone: rp.phone || existing?.phone || '',
              city: rp.city || existing?.city || 'Lahore',
              role: rp.role || (rp.is_super_admin ? 'super_admin' : rp.is_admin ? 'admin' : rp.account_type === 'dealer' || rp.is_verified_dealer ? 'dealer' : existing?.role || 'customer'),
              is_verified_dealer: !!rp.is_verified_dealer,
              account_type: rp.account_type || existing?.account_type || 'individual',
              created_at: rp.created_at || existing?.created_at || '2026-01-01T00:00:00Z',
              isCurrentSession: false,
            });
          });
        }
      } catch (sbErr) {
        console.warn('Supabase profiles query notice:', sbErr);
      }
    }

    // 1C. Active Signed-in User Session (Highlight with isCurrentSession: true)
    if (user || profile) {
      const activeEmail = (user?.email || profile?.email || '').toLowerCase();
      const activeId = user?.id || profile?.id;
      const activeKey = (activeEmail || activeId || '').toLowerCase();
      if (activeKey) {
        const existing = usersMap.get(activeKey);
        usersMap.set(activeKey, {
          id: activeId || existing?.id || DEFAULT_ADMIN_ID,
          email: activeEmail || existing?.email || DEFAULT_ADMIN_EMAIL,
          name: profile?.full_name || user?.user_metadata?.full_name || existing?.name || 'You',
          phone: profile?.phone || existing?.phone || '',
          city: profile?.city || existing?.city || 'Lahore',
          role: profile?.role || (isSuperAdmin ? 'super_admin' : isAdmin ? 'admin' : isDealer ? 'dealer' : existing?.role || 'customer'),
          is_verified_dealer: !!profile?.is_verified_dealer || isDealer,
          account_type: profile?.account_type || existing?.account_type || 'individual',
          created_at: profile?.created_at || existing?.created_at || new Date().toISOString(),
          isCurrentSession: true,
        });
      }
    }

    // 1D. Sellers from Listings (anyone who listed solar products on the platform)
    try {
      const rawListings = localStorage.getItem('sellsolar_custom_listings');
      if (rawListings) {
        const parsed = JSON.parse(rawListings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setListingsList(parsed);
          parsed.forEach((item) => {
            const sellerEmail = (item.seller_email || item.email || '').toLowerCase();
            const sellerPhone = item.seller_phone || item.phone || '';
            const sellerId = item.user_id;
            const sellerKey = (sellerEmail || sellerId || sellerPhone).toLowerCase();
            if (sellerKey && !usersMap.has(sellerKey)) {
              usersMap.set(sellerKey, {
                id: sellerId || `seller_${sellerPhone || Math.random().toString(36).slice(2, 8)}`,
                email: sellerEmail || `${(item.seller_name || 'seller').toLowerCase().replace(/\s+/g, '')}@sellsolar.seller`,
                name: item.seller_name || 'Solar Seller',
                phone: sellerPhone,
                city: item.city || item.location || 'Lahore',
                role: 'dealer',
                is_verified_dealer: !!item.is_verified_seller,
                account_type: 'dealer',
                created_at: item.created_at || '2026-02-01T00:00:00Z',
                isCurrentSession: false,
              });
            }
          });
        }
      }
    } catch {}

    // 1E. Verified dealers & default community users if list has only 1 user
    if (usersMap.size <= 1) {
      const seedAccounts = [
        { id: 'usr_dlr_lahore', name: 'Tariq Solar Solutions', email: 'tariq@solarpk.com', phone: '03008451290', city: 'Lahore', role: 'dealer', is_verified_dealer: true, account_type: 'dealer' },
        { id: 'usr_dlr_karachi', name: 'Sindh Green Energy', email: 'sales@sindhgreen.pk', phone: '03214567890', city: 'Karachi', role: 'dealer', is_verified_dealer: true, account_type: 'dealer' },
        { id: 'usr_adm_support', name: 'SellSolar Staff Ops', email: 'support@sellsolar.pk', phone: '03001234567', city: 'Islamabad', role: 'admin', is_verified_dealer: false, account_type: 'admin' },
        { id: 'usr_cst_rawalpindi', name: 'Engr. Usman Khan', email: 'usman.solar@gmail.com', phone: '03335551234', city: 'Rawalpindi', role: 'customer', is_verified_dealer: false, account_type: 'individual' },
      ];
      seedAccounts.forEach((s) => {
        if (!usersMap.has(s.email.toLowerCase())) {
          usersMap.set(s.email.toLowerCase(), {
            ...s,
            created_at: '2026-01-15T00:00:00Z',
            isCurrentSession: false,
          });
        }
      });
    }

    setUsersList(Array.from(usersMap.values()));

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
    if (typeof window !== 'undefined') {
      fetchSharedInboxMessages().then((msgs) => {
        if (msgs && msgs.length > 0) setInboxMessages(msgs);
      }).catch(() => {});
    }

    // 4. Custom Pages & CMS
    try {
      const rawPages = localStorage.getItem('sellsolar_custom_pages');
      if (rawPages) {
        setCustomPages(JSON.parse(rawPages));
      }
    } catch {}
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    loadData();
    const handleInboxUpdate = () => setInboxMessages(getInboxMessages());
    const handleUsersUpdate = () => loadData();
    const handleStorageChange = (e) => {
      if (e.key === 'sellsolar_inbox_messages' || !e.key) {
        setInboxMessages(getInboxMessages());
      }
      if (e.key === 'sellsolar_custom_pages' || e.key === 'sellsolar_settings' || e.key === 'sellsolar_users_roles') {
        loadData();
      }
    };
    window.addEventListener('sellsolar_inbox_updated', handleInboxUpdate);
    window.addEventListener('sellsolar_users_updated', handleUsersUpdate);
    window.addEventListener('sellsolar_auth_updated', handleUsersUpdate);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('sellsolar_inbox_updated', handleInboxUpdate);
      window.removeEventListener('sellsolar_users_updated', handleUsersUpdate);
      window.removeEventListener('sellsolar_auth_updated', handleUsersUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'inbox') {
      setInboxMessages(getInboxMessages());
      fetchSharedInboxMessages().then((msgs) => {
        if (msgs && msgs.length > 0) setInboxMessages(msgs);
      }).catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    setCmsForm({ ...settings });
  }, [settings]);

  // Analytics summary
  const analytics = useMemo(() => getAnalyticsSummary(listingsList), [listingsList]);

  // Filtered Users List
  const filteredUsersList = useMemo(() => {
    return usersList.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (!userSearchQuery) return true;
      const q = userSearchQuery.toLowerCase();
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.city || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q)
      );
    });
  }, [usersList, userRoleFilter, userSearchQuery]);

  // Handle User Role Change
  const handleRoleChange = async (userIdOrEmail, newRole) => {
    try {
      // Optimistic update
      setUsersList((prev) =>
        prev.map((u) => {
          const match =
            u.id === userIdOrEmail ||
            (u.email && u.email.toLowerCase() === (userIdOrEmail || '').toLowerCase());
          if (match) {
            return {
              ...u,
              role: newRole,
              is_verified_dealer: newRole === 'dealer',
              account_type: newRole === 'dealer' ? 'dealer' : newRole === 'admin' || newRole === 'super_admin' ? 'admin' : 'individual',
            };
          }
          return u;
        })
      );
      if (updateUserRole) {
        await updateUserRole(userIdOrEmail, newRole);
      }
      await loadData();
      showToast({
        title: 'Role Updated',
        message: `Assigned role updated to ${newRole.toUpperCase()}.`,
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

  // Create or add new user directly from Admin
  const handleCreateNewUser = async (e) => {
    e?.preventDefault();
    const name = (newUserForm.name || '').trim();
    const email = (newUserForm.email || '').trim().toLowerCase();
    const phone = (newUserForm.phone || '').trim();
    const city = (newUserForm.city || 'Lahore').trim();
    const role = newUserForm.role || 'dealer';

    if (!name || (!email && !phone)) {
      showToast({
        title: 'Required Details',
        message: 'Please provide user name and at least an email or phone number.',
        type: 'error',
      });
      return;
    }

    const cleanMail = email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@sellsolar.pk`;
    try {
      if (updateUserRole) {
        await updateUserRole(cleanMail, role);
      }
      const localUsers = getStoredUsers();
      const existingKey = Object.keys(localUsers).find((k) => k.toLowerCase() === cleanMail || localUsers[k]?.profile?.email?.toLowerCase() === cleanMail);
      const userKey = existingKey || cleanMail;
      if (localUsers[userKey]) {
        localUsers[userKey].profile.full_name = name;
        localUsers[userKey].profile.phone = phone;
        localUsers[userKey].profile.city = city;
        saveStoredUsers(localUsers);
      }
      await loadData();
      setIsAddingUser(false);
      setNewUserForm({ name: '', email: '', phone: '', city: 'Lahore', role: 'dealer' });
      showToast({
        title: 'User Registered',
        message: `${name} has been added as ${role.toUpperCase()}.`,
        type: 'success',
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
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
        message: `Response saved & dispatched to ${selectedMessage.senderEmail}.`,
        type: 'success',
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Send Composed Message
  const handleSendCompose = async (e) => {
    e?.preventDefault();
    if (!composeForm.recipientEmail.trim() || !composeForm.message.trim()) return;
    try {
      const res = await createDirectMessage({
        senderName: profile?.full_name || user?.user_metadata?.full_name || (isSuperAdmin ? 'Super Admin' : 'User'),
        senderEmail: user?.email || 'info@sellsolar.pk',
        recipientEmail: composeForm.recipientEmail,
        subject: composeForm.subject,
        message: composeForm.message,
        category: composeForm.category,
      });
      setIsComposing(false);
      setComposeForm({ recipientEmail: '', subject: '', category: 'General Inquiry', message: '' });
      setInboxMessages(getInboxMessages());
      const newlyCreated = getInboxMessages().find((m) => m.ticketNumber === res.ticketNumber);
      if (newlyCreated) setSelectedMessage(newlyCreated);
      showToast({
        title: 'Message Sent',
        message: `Inquiry ticket [${res.ticketNumber}] dispatched successfully.`,
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

  // Pages & Content CMS Handlers
  const handleOpenEditPage = (page) => {
    setEditingPage(page);
    const isHome = page.path === '/';
    setPageEditTab(isHome ? 'cards' : 'seo');
    setPageEditForm({
      title: page.title || '',
      description: page.description || '',
      heroHeading: page.heroHeading || page.title || '',
      category: page.category || 'Core',
      isPublished: page.isPublished !== false,
      homeCms: isHome
        ? JSON.parse(
            JSON.stringify(
              settings?.homePageCms || {
                hero: {
                  badgeText: "⚡ Pakistan's #1 Solar Directory",
                  heading: 'Buy & Sell Solar Equipment at Live Market Rates',
                  subheading: 'Compare verified solar panel, inverter & battery listings across Lahore, Karachi, Islamabad & 30+ cities in Pakistan.',
                  searchPlaceholder: 'Search panels, inverters, batteries or cities (e.g. Longi, Solis, Lahore)...',
                  primaryCtaText: 'Post a Free Ad',
                  primaryCtaLink: 'post-ad',
                  secondaryCtaText: "Today's Solar Rates",
                  secondaryCtaLink: 'prices',
                  heroImageUrl: '',
                },
                cards: [],
                calculatorBanner: {
                  enabled: true,
                  badge: 'Instant System Sizing Tool',
                  title: 'Calculate Your Solar Load in 30 Seconds',
                  description: 'Enter your Fans, LED Bulbs, Inverter ACs, Water Pumps, Iron & Fridge. Find your required kW system size, panel count, and battery backup.',
                  calculateButtonText: 'Calculate Here (Instant kW)',
                  fullPageButtonText: 'Full Page',
                },
              }
            )
          )
        : null,
    });
  };

  const handleAddHomeCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      badge: 'Featured Option',
      badgeColor: 'amber',
      icon: 'Sun',
      title: 'Solar Power Solution',
      description: 'High efficiency solar setup with Tier-1 warranty equipment.',
      points: [
        'Complete installation and warranty support',
        'Direct dealer pricing & technical consultation',
        'Verified equipment with guaranteed generation',
      ],
      ctaText: 'Post an Ad — Free',
      ctaLink: 'post-ad',
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      enabled: true,
    };
    setPageEditForm((prev) => ({
      ...prev,
      homeCms: {
        ...prev.homeCms,
        cards: [...(prev.homeCms?.cards || []), newCard],
      },
    }));
  };

  const handleUpdateHomeCard = (idx, field, value) => {
    setPageEditForm((prev) => {
      const updatedCards = [...(prev.homeCms?.cards || [])];
      if (updatedCards[idx]) {
        updatedCards[idx] = { ...updatedCards[idx], [field]: value };
      }
      return {
        ...prev,
        homeCms: {
          ...prev.homeCms,
          cards: updatedCards,
        },
      };
    });
  };

  const handleRemoveHomeCard = (idx) => {
    setPageEditForm((prev) => {
      const updatedCards = [...(prev.homeCms?.cards || [])].filter((_, i) => i !== idx);
      return {
        ...prev,
        homeCms: {
          ...prev.homeCms,
          cards: updatedCards,
        },
      };
    });
  };

  const handleAddCardPoint = (cardIdx) => {
    setPageEditForm((prev) => {
      const updatedCards = [...(prev.homeCms?.cards || [])];
      if (updatedCards[cardIdx]) {
        const points = [...(updatedCards[cardIdx].points || []), 'New verified benefit or warranty feature'];
        updatedCards[cardIdx] = { ...updatedCards[cardIdx], points };
      }
      return {
        ...prev,
        homeCms: { ...prev.homeCms, cards: updatedCards },
      };
    });
  };

  const handleUpdateCardPoint = (cardIdx, pointIdx, val) => {
    setPageEditForm((prev) => {
      const updatedCards = [...(prev.homeCms?.cards || [])];
      if (updatedCards[cardIdx]) {
        const points = [...(updatedCards[cardIdx].points || [])];
        points[pointIdx] = val;
        updatedCards[cardIdx] = { ...updatedCards[cardIdx], points };
      }
      return {
        ...prev,
        homeCms: { ...prev.homeCms, cards: updatedCards },
      };
    });
  };

  const handleRemoveCardPoint = (cardIdx, pointIdx) => {
    setPageEditForm((prev) => {
      const updatedCards = [...(prev.homeCms?.cards || [])];
      if (updatedCards[cardIdx]) {
        const points = (updatedCards[cardIdx].points || []).filter((_, i) => i !== pointIdx);
        updatedCards[cardIdx] = { ...updatedCards[cardIdx], points };
      }
      return {
        ...prev,
        homeCms: { ...prev.homeCms, cards: updatedCards },
      };
    });
  };

  const handleMoveCard = (idx, direction) => {
    setPageEditForm((prev) => {
      const cards = [...(prev.homeCms?.cards || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= cards.length) return prev;
      const temp = cards[idx];
      cards[idx] = cards[targetIdx];
      cards[targetIdx] = temp;
      return {
        ...prev,
        homeCms: { ...prev.homeCms, cards },
      };
    });
  };

  const handleDuplicateCard = (idx) => {
    setPageEditForm((prev) => {
      const cards = [...(prev.homeCms?.cards || [])];
      const source = cards[idx];
      if (!source) return prev;
      const clone = {
        ...JSON.parse(JSON.stringify(source)),
        id: `card-${Date.now()}`,
        title: `${source.title || 'Card'} (Copy)`,
      };
      cards.splice(idx + 1, 0, clone);
      return {
        ...prev,
        homeCms: { ...prev.homeCms, cards },
      };
    });
  };

  const handleExportCms = () => {
    try {
      const dataToExport = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        settings,
        customPages,
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sellsolar-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast({
        title: 'CMS Backup Exported',
        message: 'JSON backup file downloaded successfully.',
        type: 'success',
      });
    } catch (err) {
      showToast({ title: 'Export Failed', message: err.message, type: 'error' });
    }
  };

  const handleImportCms = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result);
        if (parsed.settings) {
          updateSiteSettings(parsed.settings);
        }
        if (Array.isArray(parsed.customPages)) {
          localStorage.setItem('sellsolar_custom_pages', JSON.stringify(parsed.customPages));
          setCustomPages(parsed.customPages);
        }
        showToast({
          title: 'CMS Backup Restored',
          message: 'Settings, custom pages, and visual cards restored successfully.',
          type: 'success',
        });
      } catch (err) {
        showToast({ title: 'Invalid File', message: 'The uploaded file is not a valid SellSolar JSON backup.', type: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetHomeCms = () => {
    if (window.confirm('Reset Homepage CMS cards and hero to platform defaults?')) {
      setPageEditForm((prev) => ({
        ...prev,
        homeCms: JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS.homePageCms)),
      }));
      showToast({
        title: 'Defaults Restored',
        message: 'Platform default cards and hero text restored in editor. Click "Save Page Changes" to apply.',
        type: 'info',
      });
    }
  };

  const handleSavePageEdit = (e) => {
    e?.preventDefault();
    if (!editingPage) return;
    try {
      if (editingPage.path === '/' && pageEditForm.homeCms) {
        updateHomePageCms(pageEditForm.homeCms);
      }
      const stored = localStorage.getItem('sellsolar_custom_pages');
      let currentCustom = stored ? JSON.parse(stored) : [];
      const existingIdx = currentCustom.findIndex((p) => p.path === editingPage.path);
      const updatedPage = {
        ...editingPage,
        title: pageEditForm.title,
        description: pageEditForm.description,
        heroHeading: pageEditForm.heroHeading,
        category: pageEditForm.category,
        isPublished: pageEditForm.isPublished,
        lastUpdated: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        currentCustom[existingIdx] = updatedPage;
      } else {
        currentCustom.push(updatedPage);
      }
      localStorage.setItem('sellsolar_custom_pages', JSON.stringify(currentCustom));
      setCustomPages(currentCustom);
      setEditingPage(null);
      showToast({
        title: 'Page Updated',
        message: `${updatedPage.title} content and CMS cards updated successfully.`,
        type: 'success',
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleCreateCustomPage = (e) => {
    e?.preventDefault();
    let cleanPath = (newPageForm.path || '').trim();
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (cleanPath.length <= 1) {
      showToast({ title: 'Invalid Path', message: 'Please enter a valid page slug like /solar-guide', type: 'error' });
      return;
    }
    const newPage = {
      path: cleanPath,
      title: newPageForm.title || cleanPath.replace('/', '').toUpperCase(),
      description: newPageForm.description || '',
      heroHeading: newPageForm.heroHeading || newPageForm.title,
      category: newPageForm.category || 'Custom',
      isPublished: true,
      isCustom: true,
      lastUpdated: new Date().toISOString(),
    };
    try {
      const stored = localStorage.getItem('sellsolar_custom_pages');
      let currentCustom = stored ? JSON.parse(stored) : [];
      if (currentCustom.some((p) => p.path === cleanPath)) {
        showToast({ title: 'Duplicate Path', message: 'A page with this URL path already exists.', type: 'error' });
        return;
      }
      currentCustom.push(newPage);
      localStorage.setItem('sellsolar_custom_pages', JSON.stringify(currentCustom));
      setCustomPages(currentCustom);
      setIsAddingPage(false);
      setNewPageForm({ path: '', title: '', description: '', heroHeading: '', category: 'Custom' });
      showToast({
        title: 'Page Created',
        message: `Custom page "${newPage.title}" created successfully.`,
        type: 'success',
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleDeleteCustomPage = (pagePath) => {
    if (!confirm('Are you sure you want to delete this custom page?')) return;
    try {
      const stored = localStorage.getItem('sellsolar_custom_pages');
      let currentCustom = stored ? JSON.parse(stored) : [];
      const filtered = currentCustom.filter((p) => p.path !== pagePath);
      localStorage.setItem('sellsolar_custom_pages', JSON.stringify(filtered));
      setCustomPages(filtered);
      showToast({ title: 'Page Deleted', message: 'Custom page deleted.', type: 'info' });
    } catch {}
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

  // Delete Marketplace Listing (Admin Moderation)
  const handleDeleteListing = (listingId) => {
    if (!confirm('Are you sure you want to permanently delete this marketplace listing?')) return;
    const updated = listingsList.filter((item) => item.id !== listingId);
    setListingsList(updated);
    try {
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(updated));
    } catch {}
    showToast({
      title: 'Listing Deleted',
      message: 'The listing has been permanently removed from the marketplace.',
      type: 'info',
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
  }).filter((msg) => {
    if (!inboxSearchQuery) return true;
    const q = inboxSearchQuery.toLowerCase();
    return (
      (msg.senderName || '').toLowerCase().includes(q) ||
      (msg.senderEmail || '').toLowerCase().includes(q) ||
      (msg.senderPhone || '').toLowerCase().includes(q) ||
      (msg.ticketNumber || '').toLowerCase().includes(q) ||
      (msg.subject || '').toLowerCase().includes(q) ||
      (msg.category || '').toLowerCase().includes(q)
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

  // Merged Pages List (System default pages + custom page overrides)
  const allPagesList = useMemo(() => {
    const customMap = new Map();
    (customPages || []).forEach((p) => customMap.set(p.path, p));

    const merged = SYSTEM_PAGES.map((sys) => {
      if (customMap.has(sys.path)) {
        return { ...sys, ...customMap.get(sys.path) };
      }
      return { ...sys, isPublished: true, lastUpdated: 'Standard Route' };
    });

    // Add any newly created custom pages not in SYSTEM_PAGES
    (customPages || []).forEach((cust) => {
      if (!SYSTEM_PAGES.some((sys) => sys.path === cust.path)) {
        merged.push({ ...cust, isCustom: true, isPublished: true });
      }
    });

    return merged;
  }, [customPages]);

  // Filtered Pages
  const filteredPages = useMemo(() => {
    return allPagesList.filter((p) => {
      if (pageFilter !== 'all') {
        if (pageFilter === 'custom' && !p.isCustom) return false;
        if (pageFilter !== 'custom' && p.category.toLowerCase() !== pageFilter.toLowerCase()) return false;
      }
      if (!pageSearchQuery) return true;
      const q = pageSearchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });
  }, [allPagesList, pageFilter, pageSearchQuery]);

  const unreadInboxCount = inboxMessages.filter((m) => !m.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile navigation toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors shrink-0 shadow-2xs"
            title={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
            title="Back to Marketplace"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white shrink-0">
                Sell<span className="text-amber-500">Solar</span>
              </span>
              <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate max-w-[130px] sm:max-w-none ${
                effectiveIsSuperAdmin
                  ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : effectiveIsAdmin
                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : isDealer
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {effectiveIsSuperAdmin
                  ? '👑 Super Admin'
                  : effectiveIsAdmin
                  ? '🛡️ Admin'
                  : isDealer
                  ? '🏬 Dealer'
                  : '👤 Dashboard'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {onPostAd && (
            <button
              type="button"
              onClick={onPostAd}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post Ad</span>
            </button>
          )}

          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.email || DEFAULT_ADMIN_EMAIL}</p>
            <p className="text-[10px] text-gray-400 capitalize">
              {effectiveIsSuperAdmin
                ? 'Super Administrator'
                : effectiveIsAdmin
                ? 'Administrator'
                : isDealer
                ? 'Solar Dealer Store'
                : 'Verified User'}
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="btn-secondary text-xs px-2 sm:px-3 py-1.5 shrink-0"
          >
            <span className="hidden sm:inline">Marketplace ↗</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Subnav Quick Switcher */}
      <div className="md:hidden sticky top-16 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-2.5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-xs font-bold shrink-0 flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Menu className="h-3.5 w-3.5" />
          <span>All Tabs</span>
        </button>

        <button
          type="button"
          onClick={() => selectTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Overview
        </button>

        <button
          type="button"
          onClick={() => selectTab('my-ads')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
            activeTab === 'my-ads'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>My Ads</span>
          <span className="text-[10px] opacity-80 font-mono">({myAds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => selectTab('inbox')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
            activeTab === 'inbox'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>Inbox</span>
          {unreadInboxCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black">
              {unreadInboxCount}
            </span>
          )}
        </button>

        {(isSuperAdmin || isAdmin) && (
          <>
            <button
              type="button"
              onClick={() => selectTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'products'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Moderation ({listingsList.length})
            </button>

            <button
              type="button"
              onClick={() => selectTab('daily-rates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'daily-rates'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Daily Rates
            </button>

            <button
              type="button"
              onClick={() => selectTab('dealers-directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'dealers-directory'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Dealers
            </button>

            <button
              type="button"
              onClick={() => selectTab('pages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'pages'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              CMS Pages
            </button>

            <button
              type="button"
              onClick={() => selectTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Site Settings
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => selectTab('profile')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Profile
        </button>
      </div>

      {/* Main Unified Dashboard Body */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Navigation Sidebar (Desktop persistent sidebar + Mobile slide-out drawer) */}
        <aside
          className={`fixed md:sticky top-0 md:top-16 left-0 z-50 md:z-10 h-full md:h-[calc(100vh-4rem)] w-72 md:w-64 max-w-[85vw] md:max-w-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shrink-0 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="space-y-1">
            {/* Mobile Drawer Close Header */}
            <div className="flex md:hidden items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Navigation Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

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
              onClick={() => selectTab('dashboard')}
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
              onClick={() => selectTab('my-ads')}
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
            {effectiveIsAdmin && (
              <button
                type="button"
                onClick={() => selectTab('products')}
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
              onClick={() => selectTab('inbox')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-amber-500 text-white shadow-sm font-black'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4" />
                <span>Inbox {effectiveIsAdmin ? '(info@sellsolar.pk)' : 'Messages'}</span>
              </div>
              {unreadInboxCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
                  {unreadInboxCount}
                </span>
              )}
            </button>

            {/* TAB 5: ANALYTICS & TRAFFIC */}
            {effectiveIsAdmin && (
              <button
                type="button"
                onClick={() => selectTab('analytics')}
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

            {/* TAB 6: PAGES & CONTENT CMS (SUPER ADMIN & ADMIN) */}
            {effectiveIsAdmin && (
              <button
                type="button"
                onClick={() => selectTab('pages')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'pages'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4" />
                  <span>Pages & CMS</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{allPagesList.length}</span>
              </button>
            )}

            {/* TAB 7: DAILY PRICE BENCHMARKS & SHEETS */}
            {(isSuperAdmin || isAdmin) && (
              <button
                type="button"
                onClick={() => selectTab('daily-rates')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'daily-rates'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span>Daily Prices & Sheets</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold">
                  Live
                </span>
              </button>
            )}

            {/* TAB 8: VERIFIED DEALERS DIRECTORY */}
            {(isSuperAdmin || isAdmin) && (
              <button
                type="button"
                onClick={() => selectTab('dealers-directory')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'dealers-directory'
                    ? 'bg-primary-600 text-white shadow-sm font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="h-4 w-4 text-primary-500" />
                  <span>Solar Dealers (80+)</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">8 Cities</span>
              </button>
            )}

            {/* TAB 9: TURNKEY INSTALLATION LEADS */}
            {(isSuperAdmin || isAdmin) && (
              <button
                type="button"
                onClick={() => selectTab('installation-leads')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'installation-leads'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-4 w-4 text-indigo-500" />
                  <span>Installation Leads</span>
                </div>
              </button>
            )}

            {/* SUPER ADMIN & ADMIN ROLES TABS */}
            {effectiveIsAdmin && (
              <>
                <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Administration & Access
                </div>

                <button
                  type="button"
                  onClick={() => selectTab('roles')}
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
                  onClick={() => selectTab('settings')}
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
              onClick={() => selectTab('profile')}
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPostAd();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post New Solar Ad</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                signOut?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto">
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
                      effectiveIsSuperAdmin
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : effectiveIsAdmin
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : isDealer
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {effectiveIsSuperAdmin
                        ? '👑 Super Admin Master'
                        : effectiveIsAdmin
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
                    {effectiveIsSuperAdmin
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
                {effectiveIsAdmin ? (
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

              {/* Quick Navigation Cards for Administrative Modules */}
              {isSuperAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        Daily Rates & Benchmarks
                      </h3>
                      <p className="text-xs text-emerald-800/80 dark:text-emerald-300 mt-1">
                        Adjust official Islamabad PKR/Watt panel rates, inverters, and lithium storage prices live.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('daily-rates')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Update Benchmark Rates
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border border-primary-200 dark:border-primary-900/60 bg-primary-50/40 dark:bg-primary-950/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-primary-950 dark:text-primary-200 flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary-600" />
                        Solar Dealers Directory
                      </h3>
                      <p className="text-xs text-primary-800/80 dark:text-primary-300 mt-1">
                        Manage 80+ certified verified solar dealers, authorized brands, and city showrooms.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('dealers-directory')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                    >
                      Manage Verified Dealers
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-indigo-600" />
                        Installation Leads
                      </h3>
                      <p className="text-xs text-indigo-800/80 dark:text-indigo-300 mt-1">
                        Review customer site surveys, EPC requests, tracking codes, and WhatsApp dispatch.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('installation-leads')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      View Installation Leads
                    </button>
                  </div>
                </div>
              )}

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

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://mail.google.com/mail/u/0/#search/info%40sellsolar.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                    title="Open incoming emails forwarded to mudassir2k6@gmail.com"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open in Gmail</span>
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      setSyncingInbox(true);
                      try {
                        const msgs = await fetchSharedInboxMessages();
                        if (msgs && msgs.length > 0) setInboxMessages(msgs);
                        showToast?.('Inbox synchronized successfully', 'success');
                      } catch {}
                      setSyncingInbox(false);
                    }}
                    disabled={syncingInbox}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncingInbox ? 'animate-spin text-amber-500' : ''}`} />
                    <span>{syncingInbox ? 'Syncing...' : 'Sync'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsComposing(true);
                      setSelectedMessage(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Compose Message</span>
                  </button>

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

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets, senders..."
                      value={inboxSearchQuery}
                      onChange={(e) => setInboxSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
                    />
                  </div>
                </div>
              </div>

              {/* Email Routing Info Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200">Email Routing to Gmail:</span>{' '}
                    <span className="text-amber-800/90 dark:text-amber-300/90">
                      Emails sent to <strong>info@sellsolar.pk</strong> route straight to your Gmail (<strong>mudassir2k6@gmail.com</strong>).
                      Website contact inquiries and messages also log in real time below.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=info@sellsolar.pk&su=Test%20Message%20to%20info@sellsolar.pk&body=This%20is%20a%20test%20message%20to%20verify%20email%20delivery%20to%20SellSolar%20support."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold text-xs shadow-2xs transition-all active:scale-95"
                    title="Send a test email to verify routing"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Send Test Email</span>
                  </a>
                  <a
                    href="https://mail.google.com/mail/u/0/#search/info%40sellsolar.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                  >
                    <span>Open Gmail Inbox</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Message Layout: List + Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Message List (hidden on mobile if a message is selected or composing) */}
                <div className={`lg:col-span-5 space-y-2 ${(selectedMessage || isComposing) ? 'hidden lg:block' : 'block'}`}>
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
                            setIsComposing(false);
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

                {/* Message Detail / Composer Panel */}
                <div className={`lg:col-span-7 ${(!selectedMessage && !isComposing) ? 'hidden lg:block' : 'block'}`}>
                  {isComposing ? (
                    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsComposing(false)}
                            className="p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Mail className="h-4 w-4 text-amber-500" />
                            Compose New Message
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsComposing(false)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleSendCompose} className="space-y-3.5 text-xs">
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                            Recipient Email *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. customer@example.com or info@sellsolar.pk"
                            value={composeForm.recipientEmail}
                            onChange={(e) => setComposeForm({ ...composeForm, recipientEmail: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                              Subject *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Turnkey 10kW Solar Quotation"
                              value={composeForm.subject}
                              onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                              Category
                            </label>
                            <select
                              value={composeForm.category}
                              onChange={(e) => setComposeForm({ ...composeForm, category: e.target.value })}
                              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                            >
                              <option value="General Inquiry">General Inquiry</option>
                              <option value="Dealer Verification">Dealer Verification</option>
                              <option value="Product Inquiry">Product Inquiry</option>
                              <option value="Customer Support">Customer Support</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                            Message Body *
                          </label>
                          <textarea
                            rows={5}
                            required
                            placeholder="Write your message here..."
                            value={composeForm.message}
                            onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-gray-400">
                            Sender: <strong>{user?.email || 'info@sellsolar.pk'}</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsComposing(false)}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Send Message
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : selectedMessage ? (
                    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                      {/* Mobile back button */}
                      <div className="flex items-center justify-between lg:hidden pb-2 border-b border-gray-100 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(null)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Back to all messages
                        </button>
                      </div>

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
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-400">
                            Reply will be sent from <strong>info@sellsolar.pk</strong>
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedMessage.senderEmail && (
                              <>
                                <a
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                    selectedMessage.senderEmail
                                  )}&su=${encodeURIComponent(
                                    `Re: [${selectedMessage.ticketNumber}] ${selectedMessage.subject || 'SellSolar Inquiry'}`
                                  )}&body=${encodeURIComponent(
                                    `Dear ${selectedMessage.senderName || 'Valued User'},\n\n${replyText || ''}\n\nBest regards,\nSellSolar Support Team\ninfo@sellsolar.pk`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                                  title="Open reply draft in Gmail web"
                                >
                                  <span className="h-3.5 w-3.5 rounded bg-white/20 flex items-center justify-center text-[9px] font-black">M</span>
                                  <span>Reply in Gmail</span>
                                </a>
                                <a
                                  href={`mailto:${encodeURIComponent(selectedMessage.senderEmail)}?subject=${encodeURIComponent(
                                    `Re: [${selectedMessage.ticketNumber}] ${selectedMessage.subject || 'SellSolar Inquiry'}`
                                  )}&body=${encodeURIComponent(
                                    `Dear ${selectedMessage.senderName || 'Valued User'},\n\n${replyText || ''}\n\nBest regards,\nSellSolar Support Team\ninfo@sellsolar.pk`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                                  title="Open draft in default email app"
                                >
                                  <Mail className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="hidden sm:inline">Mail App</span>
                                </a>
                              </>
                            )}
                            <button
                              type="submit"
                              disabled={!replyText.trim()}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Dispatch Reply
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                      <Mail className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-2" />
                      Select an inquiry from the list on the left to read and reply, or click Compose Message.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS & TRAFFIC */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <ChartColumn className="h-6 w-6 text-amber-500" />
                    Visitor Traffic & Product Views Analytics
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Real-time metrics for platform visits, route breakdown, device channels, and equipment view counts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Tracking Active
                  </span>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Site Visits</span>
                    <Eye className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {analytics.totalVisits.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                    ↑ All recorded page views
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Visits</span>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {analytics.todayVisits.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">Today's sessions</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unique Visitors</span>
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
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Views</span>
                    <Tag className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {analytics.totalProductViews.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                    Listing impressions
                  </p>
                </div>
              </div>

              {/* Visitor Traffic Breakdown: Top Pages & Channels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Visited Pages */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">
                        📍 Top Visited Pages & Routes
                      </h3>
                      <p className="text-[11px] text-gray-400">Traffic distribution across SellSolar.pk</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {analytics.topVisitedPages?.length || 0} Routes Tracked
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                        <tr>
                          <th className="p-3">Route Path</th>
                          <th className="p-3">Visits</th>
                          <th className="p-3">Traffic Share</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {(analytics.topVisitedPages || []).map((page) => (
                          <tr key={page.path} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                              {page.path}
                            </td>
                            <td className="p-3 font-bold text-gray-900 dark:text-white">
                              {page.count.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                  <div
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${Math.min(100, page.percentage * 2)}%` }}
                                  ></div>
                                </div>
                                <span className="text-[11px] font-mono text-gray-500">{page.percentage}%</span>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={page.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-amber-600"
                              >
                                View ↗
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Traffic Channels & Device Share */}
                <div className="space-y-6">
                  {/* Traffic Sources */}
                  <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3">
                      🌐 Traffic Acquisition Sources
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.trafficSources || {}).map(([source, count]) => {
                        const total = Object.values(analytics.trafficSources || {}).reduce((a, b) => a + b, 0) || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={source}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-gray-700 dark:text-gray-300">{source}</span>
                              <span className="font-mono text-gray-500">{count.toLocaleString()} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Device Share */}
                  <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3">
                      📱 Device Breakdown
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Mobile</p>
                        <p className="text-lg font-black text-amber-500 mt-0.5">74%</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Desktop</p>
                        <p className="text-lg font-black text-blue-500 mt-0.5">22%</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Tablet</p>
                        <p className="text-lg font-black text-purple-500 mt-0.5">4%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Views & Marketplace Performance Details */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-500" />
                      Detailed Equipment Views & Inquiry Performance
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      All products ranked by total visitor views, generated inquiries, and badges.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      ⭐ {analytics.totalFeatured} Featured
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                      🔥 {analytics.totalHotSell} Hot Sell
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                      <tr>
                        <th className="p-3.5">Rank</th>
                        <th className="p-3.5">Solar Equipment</th>
                        <th className="p-3.5">Brand & Category</th>
                        <th className="p-3.5">City</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Total Views</th>
                        <th className="p-3.5">Inquiries</th>
                        <th className="p-3.5">Badges</th>
                        <th className="p-3.5 text-right">Quick Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {(analytics.topViewedProducts || []).map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-gray-400">#{idx + 1}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                              ) : null}
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{item.title}</p>
                                <p className="text-[10px] text-gray-400 capitalize">{item.condition || 'Used'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-gray-500">
                            {item.brand} • <span className="capitalize">{item.category}</span>
                          </td>
                          <td className="p-3.5 text-gray-500">{item.city}</td>
                          <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">
                            {formatPrice(item.price)}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {item.totalViews.toLocaleString()} views
                          </td>
                          <td className="p-3.5 font-mono font-bold text-purple-600 dark:text-purple-400">
                            {item.inquiriesCount || 0} leads
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1">
                              {item.is_featured && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[9px]">
                                  ⭐ FEATURED
                                </span>
                              )}
                              {item.is_hot_sell && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black text-[9px]">
                                  🔥 HOT
                                </span>
                              )}
                              {!item.is_featured && !item.is_hot_sell && (
                                <span className="text-[10px] text-gray-400">Standard</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(item.id)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                  item.is_featured
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:text-amber-600'
                                }`}
                                title="Toggle Featured"
                              >
                                ⭐ {item.is_featured ? 'Featured' : 'Feature'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleHotSell(item.id)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                  item.is_hot_sell
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:text-rose-600'
                                }`}
                                title="Toggle Hot Sell"
                              >
                                🔥 {item.is_hot_sell ? 'Hot' : 'Hot Sell'}
                              </button>
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

          {/* TAB: PAGES & CONTENT CMS */}
          {activeTab === 'pages' && effectiveIsAdmin && (
            <div className="space-y-6">
              {/* Header & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-amber-500" />
                    Pages & Content CMS Manager
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Inspect, customize SEO titles & headings, and create new marketplace or custom content pages.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportCms}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Download full backup of site settings, custom pages, and visual cards"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Backup CMS</span>
                  </button>
                  <label
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    title="Upload and restore a previous CMS backup JSON"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Restore CMS</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportCms}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingPage(true)}
                    className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Custom Page</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {['all', 'core', 'marketplace', 'company', 'support', 'legal', 'custom'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPageFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                        pageFilter === cat
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pages by name or slug..."
                    value={pageSearchQuery}
                    onChange={(e) => setPageSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Pages Directory Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                      <tr>
                        <th className="p-3.5">Page Title & URL Slug</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">SEO Description & Content</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredPages.map((page) => (
                        <tr key={page.path} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-3.5">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 dark:text-white">{page.title}</span>
                                {page.isCustom && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] font-bold">
                                    CUSTOM
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                                {page.path}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {page.category}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-500 max-w-sm">
                            <p className="truncate text-xs">{page.description || 'Standard platform route'}</p>
                            {page.heroHeading && (
                              <p className="text-[10px] text-gray-400 truncate">Hero: {page.heroHeading}</p>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              page.isPublished !== false
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {page.isPublished !== false ? 'Live / Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={page.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Open Live Page"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenEditPage(page)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="h-3 w-3" />
                                Edit
                              </button>
                              {page.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomPage(page.path)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                  title="Delete Custom Page"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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

              {/* Edit Page Modal */}
              {editingPage && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                  <div className={`w-full ${editingPage.path === '/' ? 'max-w-4xl' : 'max-w-xl'} max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto`}>
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-amber-500" />
                          Edit Page Content: {editingPage.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                            {editingPage.path}
                          </span>
                          {editingPage.path === '/' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              VISUAL CMS ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPage(null)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Sub-tabs if home page */}
                    {editingPage.path === '/' && (
                      <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 overflow-x-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setPageEditTab('cards')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            pageEditTab === 'cards'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                          }`}
                        >
                          <Layers className="h-3.5 w-3.5" />
                          Cards & Features ({pageEditForm.homeCms?.cards?.length || 0})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPageEditTab('hero')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            pageEditTab === 'hero'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                          }`}
                        >
                          <Sun className="h-3.5 w-3.5" />
                          Hero Banner
                        </button>
                        <button
                          type="button"
                          onClick={() => setPageEditTab('calculator')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            pageEditTab === 'calculator'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                          }`}
                        >
                          <Calculator className="h-3.5 w-3.5" />
                          Load Calculator Banner
                        </button>
                        <button
                          type="button"
                          onClick={() => setPageEditTab('seo')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            pageEditTab === 'seo'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                          }`}
                        >
                          <Globe className="h-3.5 w-3.5" />
                          SEO & Page Info
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSavePageEdit} className="flex flex-col flex-1 overflow-hidden">
                      <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
                        {/* TAB 1: CARDS & FEATURES (Home Page) */}
                        {editingPage.path === '/' && pageEditTab === 'cards' && (
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                              <div>
                                <h4 className="font-black text-xs text-amber-950 dark:text-amber-300">
                                  Homepage Promotional & Action Cards
                                </h4>
                                <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                                  Add, edit, remove, or customize cards with custom titles, images, badges, bullet points, and CTA actions.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleAddHomeCard}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-center transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add New Card
                              </button>
                            </div>

                            {(!pageEditForm.homeCms?.cards || pageEditForm.homeCms.cards.length === 0) ? (
                              <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                                <Layers className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">No Cards Configured</p>
                                <p className="text-gray-400 text-xs mt-1">Click "+ Add New Card" above to add your first interactive card to the homepage.</p>
                                <button
                                  type="button"
                                  onClick={handleAddHomeCard}
                                  className="mt-3.5 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Add First Card
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {pageEditForm.homeCms.cards.map((card, cardIdx) => (
                                  <div
                                    key={card.id || cardIdx}
                                    className={`rounded-2xl border transition-all p-4 space-y-3.5 ${
                                      card.enabled !== false
                                        ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs'
                                        : 'border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/40 opacity-70'
                                    }`}
                                  >
                                    {/* Card header */}
                                    <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                                      <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-[10px] flex items-center justify-center text-gray-600 dark:text-gray-400">
                                          {cardIdx + 1}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          card.badgeColor === 'emerald'
                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                            : card.badgeColor === 'blue'
                                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                            : card.badgeColor === 'purple'
                                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                        }`}>
                                          {card.badge || 'Featured'}
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-xs">
                                          {card.title || 'Untitled Card'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          disabled={cardIdx === 0}
                                          onClick={() => handleMoveCard(cardIdx, 'up')}
                                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                          title="Move Card Up"
                                        >
                                          <ChevronUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={cardIdx === pageEditForm.homeCms.cards.length - 1}
                                          onClick={() => handleMoveCard(cardIdx, 'down')}
                                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                          title="Move Card Down"
                                        >
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateCard(cardIdx)}
                                          className="p-1.5 rounded-lg text-gray-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors"
                                          title="Duplicate Card"
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateHomeCard(cardIdx, 'enabled', card.enabled === false)}
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                            card.enabled !== false
                                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                          }`}
                                        >
                                          {card.enabled !== false ? '● Live' : '○ Hidden'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveHomeCard(cardIdx)}
                                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                          title="Delete Card"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Image Section with Preview and Presets */}
                                    <div className="space-y-1.5">
                                      <label className="font-bold text-gray-700 dark:text-gray-300 block">
                                        Card Image URL & Preview
                                      </label>
                                      <div className="flex flex-col sm:flex-row items-start gap-3">
                                        <div className="w-28 h-20 shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                          {card.imageUrl ? (
                                            <img
                                              src={card.imageUrl}
                                              alt={card.title}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                              }}
                                            />
                                          ) : (
                                            <Image className="h-6 w-6 text-gray-400" />
                                          )}
                                        </div>
                                        <div className="flex-1 w-full space-y-1.5">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="url"
                                              value={card.imageUrl || ''}
                                              onChange={(e) => handleUpdateHomeCard(cardIdx, 'imageUrl', e.target.value)}
                                              className="input-field text-xs flex-1"
                                              placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                                            />
                                            <label
                                              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
                                              title="Upload image from device"
                                            >
                                              <Upload className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                              <span>Upload</span>
                                              <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                                className="hidden"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  const reader = new FileReader();
                                                  reader.onload = (event) => {
                                                    handleUpdateHomeCard(cardIdx, 'imageUrl', event.target?.result);
                                                  };
                                                  reader.readAsDataURL(file);
                                                  e.target.value = '';
                                                }}
                                              />
                                            </label>
                                          </div>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] text-gray-400">Quick Presets:</span>
                                            {SOLAR_PRESET_IMAGES.map((preset) => (
                                              <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => handleUpdateHomeCard(cardIdx, 'imageUrl', preset.url)}
                                                className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                                              >
                                                {preset.label}
                                              </button>
                                            ))}
                                            {card.imageUrl && (
                                              <button
                                                type="button"
                                                onClick={() => handleUpdateHomeCard(cardIdx, 'imageUrl', '')}
                                                className="px-2 py-0.5 rounded text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                              >
                                                Remove Image
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Titles and Badges */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div className="sm:col-span-2">
                                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                          Card Title *
                                        </label>
                                        <input
                                          type="text"
                                          required
                                          value={card.title || ''}
                                          onChange={(e) => handleUpdateHomeCard(cardIdx, 'title', e.target.value)}
                                          className="input-field text-xs"
                                          placeholder="e.g. Sell Your Solar Equipment on SellSolar"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                          Badge Color
                                        </label>
                                        <select
                                          value={card.badgeColor || 'amber'}
                                          onChange={(e) => handleUpdateHomeCard(cardIdx, 'badgeColor', e.target.value)}
                                          className="input-field text-xs"
                                        >
                                          <option value="amber">Amber / Yellow</option>
                                          <option value="emerald">Emerald / Green</option>
                                          <option value="blue">Blue</option>
                                          <option value="purple">Purple</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                          Badge Pill Text
                                        </label>
                                        <input
                                          type="text"
                                          value={card.badge || ''}
                                          onChange={(e) => handleUpdateHomeCard(cardIdx, 'badge', e.target.value)}
                                          className="input-field text-xs"
                                          placeholder="e.g. Post Solar Ad"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                          CTA Button Label
                                        </label>
                                        <input
                                          type="text"
                                          value={card.ctaText || ''}
                                          onChange={(e) => handleUpdateHomeCard(cardIdx, 'ctaText', e.target.value)}
                                          className="input-field text-xs"
                                          placeholder="e.g. Post an Ad — Free"
                                        />
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                      <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                        Card Description
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={card.description || ''}
                                        onChange={(e) => handleUpdateHomeCard(cardIdx, 'description', e.target.value)}
                                        className="input-field text-xs"
                                        placeholder="Brief explanation of this service or offering..."
                                      />
                                    </div>

                                    {/* Bullet Points */}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <label className="font-bold text-gray-700 dark:text-gray-300">
                                          Feature Bullet Points ({card.points?.length || 0})
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleAddCardPoint(cardIdx)}
                                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                                        >
                                          <Plus className="h-3 w-3" />
                                          Add Bullet Point
                                        </button>
                                      </div>
                                      <div className="space-y-1.5">
                                        {(card.points || []).map((pt, ptIdx) => (
                                          <div key={ptIdx} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                            <input
                                              type="text"
                                              value={pt}
                                              onChange={(e) => handleUpdateCardPoint(cardIdx, ptIdx, e.target.value)}
                                              className="input-field text-xs flex-1"
                                              placeholder="e.g. 10,000+ monthly active solar buyers"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveCardPoint(cardIdx, ptIdx)}
                                              className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                                              title="Delete point"
                                            >
                                              <X className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Action Link Target */}
                                    <div>
                                      <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                        CTA Button Action Link
                                      </label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <select
                                          value={['post-ad', 'installation', 'calculator', 'prices', 'dealers', 'used-solar'].includes(card.ctaLink) ? card.ctaLink : 'custom'}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== 'custom') {
                                              handleUpdateHomeCard(cardIdx, 'ctaLink', val);
                                            }
                                          }}
                                          className="input-field text-xs"
                                        >
                                          <option value="post-ad">Post Free Ad Modal (/post-ad)</option>
                                          <option value="installation">Turnkey Installation Modal (/installation)</option>
                                          <option value="calculator">Load Calculator (/calculator)</option>
                                          <option value="prices">Daily Benchmark Rates (/prices)</option>
                                          <option value="dealers">Verified Solar Dealers (/dealers)</option>
                                          <option value="used-solar">Used Solar Market (/used-solar)</option>
                                          <option value="custom">Custom URL Path</option>
                                        </select>
                                        <input
                                          type="text"
                                          value={card.ctaLink || ''}
                                          onChange={(e) => handleUpdateHomeCard(cardIdx, 'ctaLink', e.target.value)}
                                          className="input-field text-xs font-mono"
                                          placeholder="e.g. post-ad or /custom-route"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 2: HERO BANNER & SEARCH (Home Page) */}
                        {editingPage.path === '/' && pageEditTab === 'hero' && (
                          <div className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                              <h4 className="font-black text-xs text-amber-950 dark:text-amber-300">
                                Homepage Hero Section & Search
                              </h4>
                              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                                Customize the main welcome banner text, headline, search bar placeholder, and promotional badge.
                              </p>
                            </div>

                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                Hero Pill Badge Text
                              </label>
                              <input
                                type="text"
                                value={pageEditForm.homeCms?.hero?.badgeText || ''}
                                onChange={(e) =>
                                  setPageEditForm((prev) => ({
                                    ...prev,
                                    homeCms: {
                                      ...prev.homeCms,
                                      hero: { ...prev.homeCms?.hero, badgeText: e.target.value },
                                    },
                                  }))
                                }
                                className="input-field text-xs"
                                placeholder="e.g. ⚡ Pakistan's #1 Solar Directory"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                Main Hero Heading *
                              </label>
                              <input
                                type="text"
                                required
                                value={pageEditForm.homeCms?.hero?.heading || ''}
                                onChange={(e) =>
                                  setPageEditForm((prev) => ({
                                    ...prev,
                                    homeCms: {
                                      ...prev.homeCms,
                                      hero: { ...prev.homeCms?.hero, heading: e.target.value },
                                    },
                                  }))
                                }
                                className="input-field text-xs"
                                placeholder="e.g. Buy & Sell Solar Equipment at Live Market Rates"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                Hero Subheading
                              </label>
                              <textarea
                                rows={3}
                                value={pageEditForm.homeCms?.hero?.subheading || ''}
                                onChange={(e) =>
                                  setPageEditForm((prev) => ({
                                    ...prev,
                                    homeCms: {
                                      ...prev.homeCms,
                                      hero: { ...prev.homeCms?.hero, subheading: e.target.value },
                                    },
                                  }))
                                }
                                className="input-field text-xs"
                                placeholder="e.g. Compare verified solar panel, inverter & battery listings..."
                              />
                            </div>

                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                Search Input Placeholder
                              </label>
                              <input
                                type="text"
                                value={pageEditForm.homeCms?.hero?.searchPlaceholder || ''}
                                onChange={(e) =>
                                  setPageEditForm((prev) => ({
                                    ...prev,
                                    homeCms: {
                                      ...prev.homeCms,
                                      hero: { ...prev.homeCms?.hero, searchPlaceholder: e.target.value },
                                    },
                                  }))
                                }
                                className="input-field text-xs"
                                placeholder="e.g. Search panels, inverters, batteries or cities..."
                              />
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                              <label className="font-bold text-gray-700 dark:text-gray-300 block">
                                Ambient Hero Background Image (Optional)
                              </label>
                              <div className="flex flex-col sm:flex-row items-start gap-3">
                                <div className="w-28 h-20 shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  {pageEditForm.homeCms?.hero?.heroImageUrl ? (
                                    <img
                                      src={pageEditForm.homeCms.hero.heroImageUrl}
                                      alt="Hero Background"
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <Image className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 w-full space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="url"
                                      value={pageEditForm.homeCms?.hero?.heroImageUrl || ''}
                                      onChange={(e) =>
                                        setPageEditForm((prev) => ({
                                          ...prev,
                                          homeCms: {
                                            ...prev.homeCms,
                                            hero: { ...prev.homeCms?.hero, heroImageUrl: e.target.value },
                                          },
                                        }))
                                      }
                                      className="input-field text-xs flex-1"
                                      placeholder="Paste background image URL (e.g. https://images.unsplash.com/...)"
                                    />
                                    <label
                                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
                                      title="Upload image from device"
                                    >
                                      <Upload className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                      <span>Upload</span>
                                      <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            setPageEditForm((prev) => ({
                                              ...prev,
                                              homeCms: {
                                                ...prev.homeCms,
                                                hero: { ...prev.homeCms?.hero, heroImageUrl: event.target?.result },
                                              },
                                            }));
                                          };
                                          reader.readAsDataURL(file);
                                          e.target.value = '';
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] text-gray-400">Presets:</span>
                                    {SOLAR_PRESET_IMAGES.map((preset) => (
                                      <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() =>
                                          setPageEditForm((prev) => ({
                                            ...prev,
                                            homeCms: {
                                              ...prev.homeCms,
                                              hero: { ...prev.homeCms?.hero, heroImageUrl: preset.url },
                                            },
                                          }))
                                        }
                                        className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-gray-700 dark:text-gray-300 transition-colors"
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                    {pageEditForm.homeCms?.hero?.heroImageUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPageEditForm((prev) => ({
                                            ...prev,
                                            homeCms: {
                                              ...prev.homeCms,
                                              hero: { ...prev.homeCms?.hero, heroImageUrl: '' },
                                            },
                                          }))
                                        }
                                        className="px-2 py-0.5 rounded text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                      >
                                        Remove Background
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: LOAD CALCULATOR BANNER (Home Page) */}
                        {editingPage.path === '/' && pageEditTab === 'calculator' && (
                          <div className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                              <h4 className="font-black text-xs text-amber-950 dark:text-amber-300">
                                Homepage Solar Load Calculator Banner
                              </h4>
                              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                                Configure the inline 30-second solar sizing calculator banner displayed on the homepage.
                              </p>
                            </div>

                            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer bg-gray-50/50 dark:bg-gray-800/30">
                              <input
                                type="checkbox"
                                checked={pageEditForm.homeCms?.calculatorBanner?.enabled !== false}
                                onChange={(e) =>
                                  setPageEditForm((prev) => ({
                                    ...prev,
                                    homeCms: {
                                      ...prev.homeCms,
                                      calculatorBanner: {
                                        ...prev.homeCms?.calculatorBanner,
                                        enabled: e.target.checked,
                                      },
                                    },
                                  }))
                                }
                                className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                              />
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white block">
                                  Enable Calculator Banner on Homepage
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  When enabled, visitors can calculate system kW sizing directly on the homepage.
                                </span>
                              </div>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                  Banner Pill Badge
                                </label>
                                <input
                                  type="text"
                                  value={pageEditForm.homeCms?.calculatorBanner?.badge || ''}
                                  onChange={(e) =>
                                    setPageEditForm((prev) => ({
                                      ...prev,
                                      homeCms: {
                                        ...prev.homeCms,
                                        calculatorBanner: {
                                          ...prev.homeCms?.calculatorBanner,
                                          badge: e.target.value,
                                        },
                                      },
                                    }))
                                  }
                                  className="input-field text-xs"
                                  placeholder="e.g. Instant System Sizing Tool"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                  Banner Title
                                </label>
                                <input
                                  type="text"
                                  value={pageEditForm.homeCms?.calculatorBanner?.title || ''}
                                  onChange={(e) =>
                                    setPageEditForm((prev) => ({
                                      ...prev,
                                      homeCms: {
                                        ...prev.homeCms,
                                        calculatorBanner: {
                                          ...prev.homeCms?.calculatorBanner,
                                          title: e.target.value,
                                        },
                                      },
                                    }))
                                  }
                                  className="input-field text-xs"
                                  placeholder="e.g. Calculate Your Solar Load in 30 Seconds"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                Banner Description
                              </label>
                              <textarea
                                rows={2}
                                value={pageEditForm.homeCms?.calculatorBanner?.description || ''}
                                onChange={(e) =>
                                  setPageEditForm((prev) => ({
                                    ...prev,
                                    homeCms: {
                                      ...prev.homeCms,
                                      calculatorBanner: {
                                        ...prev.homeCms?.calculatorBanner,
                                        description: e.target.value,
                                      },
                                    },
                                  }))
                                }
                                className="input-field text-xs"
                                placeholder="e.g. Enter your Fans, LED Bulbs, Inverter ACs..."
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                  Instant Button Text
                                </label>
                                <input
                                  type="text"
                                  value={pageEditForm.homeCms?.calculatorBanner?.calculateButtonText || ''}
                                  onChange={(e) =>
                                    setPageEditForm((prev) => ({
                                      ...prev,
                                      homeCms: {
                                        ...prev.homeCms,
                                        calculatorBanner: {
                                          ...prev.homeCms?.calculatorBanner,
                                          calculateButtonText: e.target.value,
                                        },
                                      },
                                    }))
                                  }
                                  className="input-field text-xs"
                                  placeholder="e.g. Calculate Here (Instant kW)"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                  Full Page Button Text
                                </label>
                                <input
                                  type="text"
                                  value={pageEditForm.homeCms?.calculatorBanner?.fullPageButtonText || ''}
                                  onChange={(e) =>
                                    setPageEditForm((prev) => ({
                                      ...prev,
                                      homeCms: {
                                        ...prev.homeCms,
                                        calculatorBanner: {
                                          ...prev.homeCms?.calculatorBanner,
                                          fullPageButtonText: e.target.value,
                                        },
                                      },
                                    }))
                                  }
                                  className="input-field text-xs"
                                  placeholder="e.g. Full Page"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 4: SEO & PAGE INFO (Home Page or Any Page) */}
                        {(editingPage.path !== '/' || pageEditTab === 'seo') && (
                          <div className="space-y-4">
                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                Page Navigation Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={pageEditForm.title}
                                onChange={(e) => setPageEditForm({ ...pageEditForm, title: e.target.value })}
                                className="input-field text-xs"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                Hero Banner Heading
                              </label>
                              <input
                                type="text"
                                value={pageEditForm.heroHeading}
                                onChange={(e) => setPageEditForm({ ...pageEditForm, heroHeading: e.target.value })}
                                className="input-field text-xs"
                                placeholder="e.g. Find Verified Solar Panels in Pakistan"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                SEO Meta Description
                              </label>
                              <textarea
                                rows={3}
                                value={pageEditForm.description}
                                onChange={(e) => setPageEditForm({ ...pageEditForm, description: e.target.value })}
                                className="input-field text-xs"
                                placeholder="Search engine summary..."
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                  Page Category
                                </label>
                                <select
                                  value={pageEditForm.category}
                                  onChange={(e) => setPageEditForm({ ...pageEditForm, category: e.target.value })}
                                  className="input-field text-xs"
                                >
                                  <option value="Core">Core</option>
                                  <option value="Marketplace">Marketplace</option>
                                  <option value="Company">Company</option>
                                  <option value="Support">Support</option>
                                  <option value="Legal">Legal</option>
                                  <option value="Custom">Custom</option>
                                </select>
                              </div>
                              <div>
                                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                  Status
                                </label>
                                <select
                                  value={pageEditForm.isPublished ? 'published' : 'draft'}
                                  onChange={(e) => setPageEditForm({ ...pageEditForm, isPublished: e.target.value === 'published' })}
                                  className="input-field text-xs"
                                >
                                  <option value="published">Live / Published</option>
                                  <option value="draft">Draft / Hidden</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
                        <div>
                          {editingPage.path === '/' && (
                            <button
                              type="button"
                              onClick={handleResetHomeCms}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-xs transition-colors"
                            >
                              Reset to Defaults
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPage(null)}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-primary text-xs px-5 py-2"
                          >
                            Save Page Changes
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add Custom Page Modal */}
              {isAddingPage && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <Plus className="h-4 w-4 text-amber-500" />
                        Create New Custom Page
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingPage(false)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateCustomPage} className="p-5 space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                            Page Slug / Route * (e.g. /solar-guide)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="/my-page"
                            value={newPageForm.path}
                            onChange={(e) => setNewPageForm({ ...newPageForm, path: e.target.value })}
                            className="input-field text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                            Page Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Net Metering Guide"
                            value={newPageForm.title}
                            onChange={(e) => setNewPageForm({ ...newPageForm, title: e.target.value })}
                            className="input-field text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Hero Heading
                        </label>
                        <input
                          type="text"
                          placeholder="Big heading on top of page..."
                          value={newPageForm.heroHeading}
                          onChange={(e) => setNewPageForm({ ...newPageForm, heroHeading: e.target.value })}
                          className="input-field text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Meta Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Brief description for SEO..."
                          value={newPageForm.description}
                          onChange={(e) => setNewPageForm({ ...newPageForm, description: e.target.value })}
                          className="input-field text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Category
                        </label>
                        <select
                          value={newPageForm.category}
                          onChange={(e) => setNewPageForm({ ...newPageForm, category: e.target.value })}
                          className="input-field text-xs"
                        >
                          <option value="Custom">Custom Content</option>
                          <option value="Marketplace">Marketplace Guide</option>
                          <option value="Support">Support & Help</option>
                          <option value="Company">Company Information</option>
                          <option value="Legal">Legal Notice</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => setIsAddingPage(false)}
                          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary text-xs px-5 py-2"
                        >
                          Create Page Live
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
                              <button
                                type="button"
                                onClick={() => onNavigateToListing && onNavigateToListing(item.id)}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="View Product Page"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
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
                              <button
                                type="button"
                                onClick={() => handleDeleteListing(item.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                title="Delete Listing Permanently"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
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

          {/* TAB 5: ROLES & ACCESS (SUPER ADMIN & ADMIN) */}
          {activeTab === 'roles' && effectiveIsAdmin && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                    Roles & Permissions Management
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage permissions for all platform users across <strong>Super Admin</strong>, <strong>Admin</strong>, <strong>Verified Dealer</strong>, and <strong>Customer</strong> tiers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadData()}
                    className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
                    title="Refresh user list"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Sync Users</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>+ Add User / Assign Role</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Total Accounts</p>
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">{usersList.length}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Synced across platform</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Signed In Now</p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1.5">
                    {usersList.filter((u) => u.isCurrentSession).length || 1}
                  </p>
                  <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Active logged in session</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Verified Dealers</p>
                    <Store className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">
                    {usersList.filter((u) => u.role === 'dealer').length}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Solar shops & stores</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Administrators</p>
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">
                    {usersList.filter((u) => u.role === 'super_admin' || u.role === 'admin').length}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Super Admin & Admin team</p>
                </div>
              </div>

              {/* Search and Role Filter Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone, city..."
                    className="input-field pl-9 text-xs py-2"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: `All (${usersList.length})` },
                    { id: 'super_admin', label: '👑 Super Admin' },
                    { id: 'admin', label: '🛡️ Admin' },
                    { id: 'dealer', label: '🏬 Dealer' },
                    { id: 'customer', label: '👤 Customer' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setUserRoleFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                        userRoleFilter === tab.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roles Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                      <tr>
                        <th className="p-3.5">User Account & Status</th>
                        <th className="p-3.5">Email & Phone</th>
                        <th className="p-3.5">City & Source</th>
                        <th className="p-3.5">Current Role</th>
                        <th className="p-3.5 text-right">Assign / Change Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredUsersList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-400">
                            No users found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredUsersList.map((u) => {
                          const isDefaultAdmin = (u.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
                          const isActiveUser = u.isCurrentSession || (u.email && u.email.toLowerCase() === (user?.email || '').toLowerCase());
                          return (
                            <tr key={u.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${isActiveUser ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}>
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                    {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-bold text-gray-900 dark:text-white truncate">{u.name}</p>
                                      {isActiveUser && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                          Active (You)
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] font-mono text-gray-400 truncate max-w-xs">{u.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 text-gray-500">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{u.email || 'No email'}</p>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  {u.phone ? (
                                    <>
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      {u.phone}
                                    </>
                                  ) : (
                                    <span className="italic">No phone listed</span>
                                  )}
                                </p>
                              </td>
                              <td className="p-3.5 text-gray-500">
                                <p className="font-medium text-gray-700 dark:text-gray-300">{u.city || 'Pakistan'}</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-slate-100 dark:bg-gray-800 text-gray-500">
                                  {u.account_type || 'Account'}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  u.role === 'super_admin'
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                    : u.role === 'admin'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : u.role === 'dealer'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                }`}>
                                  {u.role === 'super_admin' ? '👑 Super Admin' : u.role === 'admin' ? '🛡️ Admin' : u.role === 'dealer' ? '🏬 Dealer' : '👤 Customer'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="inline-flex items-center gap-2 justify-end">
                                  <select
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u.id || u.email, e.target.value)}
                                    className="text-xs font-bold py-1.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none shadow-xs cursor-pointer"
                                  >
                                    <option value="customer">👤 Customer</option>
                                    <option value="dealer">🏬 Verified Dealer</option>
                                    <option value="admin">🛡️ Admin</option>
                                    <option value="super_admin">👑 Super Admin</option>
                                  </select>
                                  {isDefaultAdmin && (
                                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                                      (Owner)
                                    </span>
                                  )}
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

              {/* Add User Modal */}
              {isAddingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-purple-600" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Add User & Assign Role</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingUser(false)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateNewUser} className="space-y-4 text-xs">
                      <div>
                        <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name / Business Name *</label>
                        <input
                          type="text"
                          required
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          placeholder="e.g. Asad Solar Center"
                          className="input-field text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
                          <input
                            type="email"
                            value={newUserForm.email}
                            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                            placeholder="user@example.com"
                            className="input-field text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={newUserForm.phone}
                            onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                            placeholder="03001234567"
                            className="input-field text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">City</label>
                          <input
                            type="text"
                            value={newUserForm.city}
                            onChange={(e) => setNewUserForm({ ...newUserForm, city: e.target.value })}
                            placeholder="Lahore / Karachi"
                            className="input-field text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Assign Role *</label>
                          <select
                            value={newUserForm.role}
                            onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                            className="input-field text-xs font-bold"
                          >
                            <option value="customer">👤 Customer</option>
                            <option value="dealer">🏬 Verified Dealer</option>
                            <option value="admin">🛡️ Admin</option>
                            <option value="super_admin">👑 Super Admin</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => setIsAddingUser(false)}
                          className="btn-secondary text-xs px-4 py-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary text-xs px-4 py-2 bg-purple-600 hover:bg-purple-700"
                        >
                          Save & Assign Role
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: WEBSITE SETTINGS & CMS (SUPER ADMIN & ADMIN) */}
          {activeTab === 'settings' && effectiveIsAdmin && (
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
                {/* Section 1: Logo & Visual Media */}
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 shadow-xs">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Website Logo, Favicon & Visual Identity
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Logo Image URL (PNG / SVG / WebP)
                      </label>
                      <input
                        type="url"
                        value={cmsForm.logoUrl || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="input-field text-xs"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Leave blank to use default styled text logo.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Logo Preview
                      </label>
                      <div className="h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50 flex items-center justify-center">
                        {cmsForm.logoUrl ? (
                          <img src={cmsForm.logoUrl} alt="Logo Preview" className="h-7 max-w-full object-contain" />
                        ) : (
                          <span className="text-base font-black tracking-tight text-gray-900 dark:text-white">
                            Sell<span className="text-amber-500">Solar</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Favicon URL
                      </label>
                      <input
                        type="text"
                        value={cmsForm.faviconUrl || '/favicon.ico'}
                        onChange={(e) => setCmsForm({ ...cmsForm, faviconUrl: e.target.value })}
                        className="input-field text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Social Share Preview Image (OG Image)
                      </label>
                      <input
                        type="text"
                        value={cmsForm.ogImageUrl || '/og-image.jpg'}
                        onChange={(e) => setCmsForm({ ...cmsForm, ogImageUrl: e.target.value })}
                        className="input-field text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Top Announcement Bar */}
                <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        Top Announcement / Alert Banner
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        Displays an announcement notice at the very top of all website pages.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmsForm.topBannerEnabled}
                        onChange={(e) => setCmsForm({ ...cmsForm, topBannerEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      <span className="ml-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                        {cmsForm.topBannerEnabled ? 'Active' : 'Hidden'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Announcement Notice Text
                      </label>
                      <input
                        type="text"
                        value={cmsForm.topBannerText || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, topBannerText: e.target.value })}
                        placeholder="Pakistan's #1 Solar Marketplace — Verified Dealers & Daily Price Benchmark"
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Target Link (e.g. /prices)
                      </label>
                      <input
                        type="text"
                        value={cmsForm.topBannerLink || '/prices'}
                        onChange={(e) => setCmsForm({ ...cmsForm, topBannerLink: e.target.value })}
                        className="input-field text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: WhatsApp Controller */}
                <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                        WhatsApp Floating Chat & Contact Settings
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Controls the floating WhatsApp button and listing enquiry redirects across the entire site.
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
                        {cmsForm.whatsAppEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        WhatsApp Phone Number (with Country Code) *
                      </label>
                      <input
                        type="text"
                        value={cmsForm.whatsAppNumber}
                        onChange={(e) => setCmsForm({ ...cmsForm, whatsAppNumber: e.target.value })}
                        placeholder="e.g. 923001234567"
                        className="input-field text-xs font-mono"
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
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Floating Button Label
                      </label>
                      <input
                        type="text"
                        value={cmsForm.whatsAppLabel || 'WhatsApp Us'}
                        onChange={(e) => setCmsForm({ ...cmsForm, whatsAppLabel: e.target.value })}
                        placeholder="WhatsApp Us"
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Floating Widget Position
                      </label>
                      <select
                        value={cmsForm.whatsAppPosition || 'bottom-right'}
                        onChange={(e) => setCmsForm({ ...cmsForm, whatsAppPosition: e.target.value })}
                        className="input-field text-xs"
                      >
                        <option value="bottom-right">Bottom Right Corner</option>
                        <option value="bottom-left">Bottom Left Corner</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Pulse Ping Animation
                      </label>
                      <select
                        value={cmsForm.whatsAppPulse !== false ? 'yes' : 'no'}
                        onChange={(e) => setCmsForm({ ...cmsForm, whatsAppPulse: e.target.value === 'yes' })}
                        className="input-field text-xs"
                      >
                        <option value="yes">Enabled (Attention Pulse)</option>
                        <option value="no">Disabled (Static)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Pre-filled WhatsApp Greeting Template
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

                {/* Section 4: Brand & Headings */}
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 shadow-xs">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Brand Names & Homepage Headings</h3>

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
                      Website Brand Logo (URL or Upload)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {cmsForm.logoUrl ? (
                          <img
                            src={cmsForm.logoUrl}
                            alt="Logo preview"
                            className="w-full h-full object-contain p-1"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">No Logo</span>
                        )}
                      </div>
                      <div className="flex-1 w-full space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cmsForm.logoUrl || ''}
                            onChange={(e) => setCmsForm({ ...cmsForm, logoUrl: e.target.value })}
                            placeholder="Paste custom logo URL or upload image file..."
                            className="input-field text-xs flex-1"
                          />
                          <label
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
                            title="Upload logo from device"
                          >
                            <Upload className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/jpg"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setCmsForm({ ...cmsForm, logoUrl: event.target?.result });
                                };
                                reader.readAsDataURL(file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          {cmsForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setCmsForm({ ...cmsForm, logoUrl: '' })}
                              className="px-2.5 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                              title="Clear logo"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Recommended: Transparent PNG, WebP or SVG format. Displays in the header navbar and branding areas.
                        </p>
                      </div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Footer Description
                      </label>
                      <textarea
                        rows={2}
                        value={cmsForm.footerAboutText || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, footerAboutText: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Copyright Notice
                      </label>
                      <input
                        type="text"
                        value={cmsForm.copyrightText || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, copyrightText: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Contact Info & Support Email */}
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 shadow-xs">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Contact & Support Desk</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        Sales Inquiry Email
                      </label>
                      <input
                        type="email"
                        value={cmsForm.salesEmail || 'sales@sellsolar.pk'}
                        onChange={(e) => setCmsForm({ ...cmsForm, salesEmail: e.target.value })}
                        placeholder="sales@sellsolar.pk"
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

                {/* Section 6: Social Media Links */}
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 shadow-xs">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Social Media Profiles & Channels</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={cmsForm.socialLinks?.linkedin || ''}
                        onChange={(e) =>
                          setCmsForm({
                            ...cmsForm,
                            socialLinks: { ...(cmsForm.socialLinks || {}), linkedin: e.target.value },
                          })
                        }
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">TikTok</label>
                      <input
                        type="url"
                        value={cmsForm.socialLinks?.tiktok || ''}
                        onChange={(e) =>
                          setCmsForm({
                            ...cmsForm,
                            socialLinks: { ...(cmsForm.socialLinks || {}), tiktok: e.target.value },
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

          {/* TAB 7: DAILY PRICE BENCHMARKS & SHEETS */}
          {activeTab === 'daily-rates' && (isSuperAdmin || isAdmin) && (
            <AdminDailyRatesModule />
          )}

          {/* TAB 8: VERIFIED SOLAR DEALERS DIRECTORY */}
          {activeTab === 'dealers-directory' && (isSuperAdmin || isAdmin) && (
            <AdminDealersModule />
          )}

          {/* TAB 9: TURNKEY SOLAR INSTALLATION LEADS */}
          {activeTab === 'installation-leads' && (isSuperAdmin || isAdmin) && (
            <AdminInstallationsModule />
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

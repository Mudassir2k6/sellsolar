'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import AuthPage from './views/AuthPage';
import PasswordPage from './views/PasswordPage';
import TodayPricesPage from './views/TodayPricesPage';
import Tier1VerificationPage from './views/Tier1VerificationPage';
import DailyMarketRates from './components/DailyMarketRates';
import LoadCalculatorPage from './views/LoadCalculatorPage';
import SolarLoadCalculator from './components/SolarLoadCalculator';
import FloatingPostAdButton from './components/FloatingPostAdButton';
import CompanyMarketplacePage from './views/CompanyMarketplacePage';
import CustomPageView from './views/CustomPageView';
import KeywordLandingPage, { KEYWORD_LANDING_KEYS } from './views/KeywordLandingPage';
import EmailContactModal from './components/EmailContactModal';
import { applyPageSeo, parseLocation, pageToPath } from './lib/seo';
import { getInboxMessages } from './services/inboxService';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BadgeCheck,
  BatteryCharging,
  Bell,
  Boxes,
  Calculator,
  Calendar,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleCheckBig,
  CirclePlus,
  CircleX,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Facebook,
  FilePen,
  FileText,
  Flame,
  Grid,
  Heart,
  Image,
  Instagram,
  Layers,
  LayoutDashboard,
  Linkedin,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  Package,
  PackageOpen,
  Phone,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  Twitter,
  Upload,
  User,
  Users,
  Wrench,
  X,
  Youtube,
  Zap,
} from 'lucide-react';
import { useAuth, DEFAULT_ADMIN_ID, DEFAULT_ADMIN_EMAIL, getStoredUsers, saveStoredUsers } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { supabase } from './lib/supabase';
import { BRANDS, CATEGORIES, CITIES, formatPrice } from './lib/constants';
import { digitsOnlyPhone, isValidPhone, normalizePhone, isValidUuid } from './lib/auth';
import { getLocalOrSeedListings, getLocalOrSeedListingById } from './data/seedListings';
import { getEquipmentFallbackImage, SELL_SOLAR_PROMO_IMAGE, TURNKEY_INSTALL_PROMO_IMAGE } from './utils/solarImages';
import ThemeRadioToggle from './components/ThemeRadioToggle';
import WarrantySelector, { formatWarrantyShort, formatWarrantyLong } from './components/WarrantySelector';
import InstallationRequestPage from './views/InstallationRequestPage';
import DealersPage from './views/DealersPage';
import ListingPhotoUploader from './components/ListingPhotoUploader';
import { listingImages, uploadListingPhotos } from './lib/images';
import GlobalNavbarSearch from './components/GlobalNavbarSearch';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import FloatingWhatsAppWidget from './components/FloatingWhatsAppWidget';
import MobileBottomNav from './components/MobileBottomNav';
import AdminSuperDashboard from './components/AdminSuperDashboard';
import { recordPageView, recordProductView } from './services/analyticsService';

function Xy({
  onNavigate:t,currentPage:e,onSelectListing:selList,onSearchSubmit:searchSub
}){
  var w;
  const [r, n] = useState(!1),
    [s, a] = useState(!1),
    [l, o] = useState(!1),
    [isMobileSearchOpen, setIsMobileSearchOpen] = useState(!1),
    {
      user: c,
      profile: u,
      signOut: d,
      isSuperAdmin: isSuperAdm,
      isAdmin: isAdmRole,
    } = useAuth();
  const isUserAdmin = Boolean(
    c &&
      (isSuperAdm ||
        isAdmRole ||
        u?.is_admin ||
        u?.is_super_admin ||
        u?.role === 'super_admin' ||
        u?.role === 'admin' ||
        c?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())
  );
  const { settings } = useSiteSettings();
  const mobileMenuRef = useRef(null);
  const mobileToggleBtnRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const j = () => n(window.scrollY > 20);
    return (
      window.addEventListener('scroll', j),
      () => window.removeEventListener('scroll', j)
    );
  }, []);

  useEffect(() => {
    if (!s) return;
    const handleOutsideClick = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileToggleBtnRef.current &&
        !mobileToggleBtnRef.current.contains(event.target)
      ) {
        a(!1);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') a(!1);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [s]);

  useEffect(() => {
    if (!l) return;
    const handleUserOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        o(!1);
      }
    };
    document.addEventListener('mousedown', handleUserOutside);
    document.addEventListener('touchstart', handleUserOutside);
    return () => {
      document.removeEventListener('mousedown', handleUserOutside);
      document.removeEventListener('touchstart', handleUserOutside);
    };
  }, [l]);

  const [unreadInboxCount, setUnreadInboxCount] = useState(0);
  useEffect(() => {
    const updateCount = () => {
      try {
        const msgs = getInboxMessages();
        setUnreadInboxCount(msgs.filter((m) => !m.is_read).length);
      } catch {}
    };
    updateCount();
    window.addEventListener('sellsolar_inbox_updated', updateCount);
    return () =>
      window.removeEventListener('sellsolar_inbox_updated', updateCount);
  }, []);

  const h = (j) => {
    t(j);
    a(!1);
    o(!1);
    setIsMobileSearchOpen(!1);
  };
  const p = async () => {
    await d();
    t('home');
    o(!1);
    a(!1);
    setIsMobileSearchOpen(!1);
  };
  const y = [
    {
      label: "Today's Rates",
      page: 'prices',
      highlight: true,
    },
    {
      label: 'Load Calculator',
      page: 'calculator',
      isCalc: true,
    },
    {
      label: 'Verified Dealers',
      page: 'dealers',
    },
    {
      label: 'Tier-1 Verification',
      page: 'verification',
      isVerify: true,
    },
    {
      label: 'Request Complete Installation',
      page: 'install',
      isInstall: true,
    },
  ];

  const userInitial = ((u?.full_name || c?.email || 'U').charAt(0).toUpperCase());

  return jsxs('header', {
    className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      r
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-gray-200/80 dark:border-gray-800'
        : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50'
    }`,
    children: [
      settings?.topBannerEnabled !== false
        ? jsx('div', {
            className:
              'hidden lg:block bg-gray-950 text-gray-300 text-xs py-1.5 border-b border-gray-800',
            children: jsxs('div', {
              className: 'container-page flex items-center justify-between',
              children: [
                jsxs('div', {
                  className: 'flex items-center overflow-hidden whitespace-nowrap text-xs max-w-[60%]',
                  children: [
                    jsx('style', {
                      dangerouslySetInnerHTML: { __html: `
                        @keyframes ticker {
                          0% { transform: translateX(100%); }
                          100% { transform: translateX(-100%); }
                        }
                        .animate-ticker {
                          display: inline-block;
                          animation: ticker 35s linear infinite;
                        }
                      ` }
                    }),
                    jsxs('span', {
                      className: 'animate-ticker font-semibold text-gray-300 flex items-center gap-3',
                      children: [
                        jsxs('span', { className: 'flex items-center gap-1', children: [jsx(TrendingUp, { className: 'h-3.5 w-3.5 text-primary-400' }), "LIVE RATES:"] }),
                        jsxs('span', { className: 'text-emerald-400', children: ['🟢 Longi 585W: Rs 38.50/W'] }),
                        jsx('span', { className: 'text-gray-700', children: '|' }),
                        jsxs('span', { className: 'text-emerald-400', children: ['🟢 Jinko 585W: Rs 40.00/W'] }),
                        jsx('span', { className: 'text-gray-700', children: '|' }),
                        jsxs('span', { className: 'text-amber-400', children: ['🟡 Inverex 6kW: Rs 266,000'] }),
                        jsx('span', { className: 'text-gray-700', children: '|' }),
                        jsxs('span', { className: 'text-emerald-400', children: ['🟢 Tubular 230Ah: Rs 51,500'] }),
                      ]
                    })
                  ]
                }),
                jsxs('div', {
                  className: 'flex items-center gap-5 text-gray-400 font-medium',
                  children: [
                    jsx('button', {
                      onClick: () => h('prices'),
                      className:
                        'hover:text-amber-400 transition-colors font-semibold cursor-pointer',
                      children: "Today's Rates",
                    }),
                    jsx('button', {
                      onClick: () => h('calculator'),
                      className: 'hover:text-white transition-colors cursor-pointer',
                      children: 'Load Calculator',
                    }),
                    jsx('button', {
                      onClick: () => h('install'),
                      className: 'hover:text-white transition-colors cursor-pointer',
                      children: 'Turnkey Installation',
                    }),
                    jsx('button', {
                      onClick: () => h('dealers'),
                      className: 'hover:text-white transition-colors cursor-pointer',
                      children: 'Verified Dealers',
                    }),
                    jsx('button', {
                      onClick: () => h('verification'),
                      className: 'hover:text-emerald-400 text-emerald-400/90 font-semibold transition-colors cursor-pointer flex items-center gap-1',
                      children: 'Tier-1 Verification',
                    }),
                  ],
                }),
              ],
            }),
          })
        : null,

      jsx('div', {
        className: 'container-page',
        children: jsxs('div', {
          className:
            'flex h-16 items-center justify-between gap-2 sm:gap-4',
          children: [
            // Brand Logo
            jsxs('button', {
              onClick: () => h('home'),
              className: 'flex items-center gap-2 shrink-0 select-none cursor-pointer',
              children: [
                settings?.logoUrl
                  ? jsx('img', {
                      src: settings.logoUrl,
                      alt: settings.siteTitle || 'SellSolar',
                      className: 'h-8 sm:h-9 max-w-[140px] sm:max-w-[180px] object-contain',
                    })
                  : jsxs(Fragment, {
                      children: [
                        jsx('div', {
                          className:
                            'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-md shadow-primary-500/25 shrink-0',
                          children: jsx(Sun, {
                            className: 'h-4 w-4 sm:h-5 sm:w-5 text-white',
                            strokeWidth: 2.5,
                          }),
                        }),
                        jsxs('span', {
                          className:
                            'text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white',
                          children: [
                            'Sell',
                            jsx('span', {
                              className: 'text-primary-500',
                              children: 'Solar',
                            }),
                          ],
                        }),
                      ],
                    }),
              ],
            }),

            // Search Component (desktop navbar bar + mobile full overlay)
            jsx(GlobalNavbarSearch, {
              onSelectListing: (id) => {
                setIsMobileSearchOpen(!1);
                selList && selList(id);
              },
              onSearchSubmit: (filterObj) => {
                setIsMobileSearchOpen(!1);
                searchSub && searchSub(filterObj);
              },
              mobileOpen: isMobileSearchOpen,
              onCloseMobile: () => setIsMobileSearchOpen(!1),
              className:
                'flex-1 min-w-0 md:min-w-[180px] max-w-sm lg:max-w-md xl:max-w-lg mx-0 md:mx-2 lg:mx-4',
            }),

            // Desktop Navigation Buttons (hidden on mobile, md:flex)
            jsxs('div', {
              className: 'hidden md:flex items-center gap-2 lg:gap-2.5',
              children: [
                jsx('button', {
                  onClick: () => h('prices'),
                  className: `flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                    e === 'prices'
                      ? 'bg-amber-500 text-white shadow-amber-500/25'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                  }`,
                  children: jsxs(Fragment, {
                    children: [
                      jsxs('span', {
                        className: 'relative flex h-2 w-2 shrink-0',
                        children: [
                          jsx('span', {
                            className:
                              'absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75',
                          }),
                          jsx('span', {
                            className:
                              'relative inline-flex h-2 w-2 rounded-full bg-amber-500',
                          }),
                        ],
                      }),
                      jsx('span', {
                        className: 'whitespace-nowrap',
                        children: "Today's Rates",
                      }),
                      jsx('span', {
                        className: `hidden lg:inline rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          e === 'prices'
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                        }`,
                        children: 'LIVE',
                      }),
                    ],
                  }),
                }),
                jsx('button', {
                  onClick: () => h('calculator'),
                  className: `flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    e === 'calculator'
                      ? 'bg-primary-500 text-white shadow-xs shadow-primary-500/20'
                      : 'bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 border border-primary-200/70 dark:border-primary-800/60 hover:bg-primary-100 dark:hover:bg-primary-900/60'
                  }`,
                  children: jsxs(Fragment, {
                    children: [
                      jsx(Calculator, {
                        className: `h-4 w-4 shrink-0 ${
                          e === 'calculator'
                            ? 'text-white'
                            : 'text-primary-600 dark:text-primary-400'
                        }`,
                      }),
                      jsx('span', {
                        className: 'whitespace-nowrap',
                        children: 'Calculator',
                      }),
                    ],
                  }),
                }),
                jsx('button', {
                  onClick: () => h('verification'),
                  className: `hidden lg:flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    e === 'verification' || e === 'tier-1-verification' || e === 'panel-verification'
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  }`,
                  children: jsxs(Fragment, {
                    children: [
                      jsx(ShieldCheck, {
                        className: `h-4 w-4 shrink-0 ${
                          e === 'verification' || e === 'tier-1-verification' || e === 'panel-verification'
                            ? 'text-white'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`,
                      }),
                      jsx('span', {
                        className: 'whitespace-nowrap',
                        children: 'Tier-1 Check',
                      }),
                    ],
                  }),
                }),
                jsx('button', {
                  onClick: () => h('install'),
                  className: `hidden xl:flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    e === 'install'
                      ? 'bg-secondary-600 text-white shadow-xs shadow-secondary-600/20'
                      : 'bg-secondary-50 dark:bg-secondary-950/40 text-secondary-800 dark:text-secondary-300 border border-secondary-200/70 dark:border-secondary-800/60 hover:bg-secondary-100 dark:hover:bg-secondary-900/60'
                  }`,
                  children: jsxs(Fragment, {
                    children: [
                      jsx(Wrench, {
                        className: `h-4 w-4 shrink-0 ${
                          e === 'install'
                            ? 'text-white'
                            : 'text-secondary-600 dark:text-secondary-400'
                        }`,
                      }),
                      jsx('span', {
                        className: 'whitespace-nowrap',
                        children: 'Installation',
                      }),
                    ],
                  }),
                }),
                jsx(ThemeRadioToggle, {
                  className: 'shrink-0',
                }),
                c
                  ? jsxs(Fragment, {
                      children: [
                        jsxs('button', {
                          onClick: () => h('post-ad'),
                          className:
                            'btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm shadow-xs cursor-pointer',
                          children: [
                            jsx(CirclePlus, {
                              className: 'h-4 w-4',
                            }),
                            'Post an Ad',
                          ],
                        }),
                        jsxs('div', {
                          className: 'relative',
                          children: [
                            jsxs('button', {
                              onClick: () => o(!l),
                              className:
                                'flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                              children: [
                                jsx('div', {
                                  className:
                                    'flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white',
                                  children: userInitial,
                                }),
                                jsx('span', {
                                  className: 'max-w-[100px] truncate',
                                  children:
                                    ((w = u == null ? void 0 : u.full_name) ==
                                    null
                                      ? void 0
                                      : w.split(' ')[0]) || 'User',
                                }),
                                jsx(ChevronDown, {
                                  className: 'h-4 w-4 text-gray-400',
                                }),
                              ],
                            }),
                            l &&
                              jsxs('div', {
                                ref: userDropdownRef,
                                className:
                                  'absolute right-0 mt-2 w-56 animate-slide-down rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-2 shadow-xl z-50',
                                children: [
                                  jsxs('div', {
                                    className:
                                      'border-b border-gray-100 dark:border-gray-800 px-4 py-2',
                                    children: [
                                      jsx('p', {
                                        className:
                                          'text-sm font-bold text-gray-900 dark:text-white',
                                        children:
                                          (u == null ? void 0 : u.full_name) ||
                                          'User',
                                      }),
                                      jsx('p', {
                                        className:
                                          'truncate text-xs text-gray-500 dark:text-gray-400',
                                        children:
                                          u?.username ||
                                          (c?.email?.endsWith('@sellsolar.local')
                                            ? c.email.replace(
                                                '@sellsolar.local',
                                                ''
                                              )
                                            : c?.email) ||
                                          '',
                                      }),
                                      (u == null ? void 0 : u.account_type) ===
                                        'dealer' &&
                                        jsx('span', {
                                          className:
                                            'mt-1 inline-block rounded-full bg-primary-100 dark:bg-primary-950/60 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:text-primary-300',
                                          children: u.is_verified_dealer
                                            ? 'Verified Dealer'
                                            : 'Dealer',
                                        }),
                                    ],
                                  }),
                                  jsxs('button', {
                                    onClick: () => h('dashboard'),
                                    className:
                                      'flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                                    children: [
                                      jsx(LayoutDashboard, {
                                        className: 'h-4 w-4 text-amber-500',
                                      }),
                                      u?.is_super_admin ||
                                      u?.role === 'super_admin' ||
                                      c?.email?.toLowerCase() ===
                                        DEFAULT_ADMIN_EMAIL.toLowerCase()
                                        ? '👑 Super Admin Dashboard'
                                        : u?.is_admin || u?.role === 'admin'
                                        ? '🛡️ Admin Dashboard'
                                        : u?.role === 'dealer' || u?.is_dealer
                                        ? '🏪 Dealer Dashboard'
                                        : '📊 My Dashboard',
                                    ],
                                  }),
                                  isUserAdmin &&
                                    jsxs('button', {
                                      onClick: () => h('inbox'),
                                      className:
                                        'flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer',
                                      children: [
                                        jsxs('div', {
                                          className:
                                            'flex items-center gap-2',
                                          children: [
                                            jsx(MessageSquare, {
                                              className:
                                                'h-4 w-4 text-purple-500',
                                            }),
                                            'Admin Inquiries & Inbox',
                                          ],
                                        }),
                                        unreadInboxCount > 0 &&
                                          jsx('span', {
                                            className:
                                              'px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white',
                                            children: unreadInboxCount,
                                          }),
                                      ],
                                    }),
                                  jsxs('button', {
                                    onClick: () => h('password'),
                                    className:
                                      'flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                                    children: [
                                      jsx(Lock, {
                                        className: 'h-4 w-4 text-gray-400',
                                      }),
                                      'Change Password',
                                    ],
                                  }),
                                  jsxs('button', {
                                    onClick: () => h('post-ad'),
                                    className:
                                      'flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                                    children: [
                                      jsx(CirclePlus, {
                                        className: 'h-4 w-4 text-gray-400',
                                      }),
                                      'Post Ad',
                                    ],
                                  }),
                                  jsxs('button', {
                                    onClick: () => h('dealers'),
                                    className:
                                      'flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                                    children: [
                                      jsx(Store, {
                                        className: 'h-4 w-4 text-gray-400',
                                      }),
                                      'View Dealers',
                                    ],
                                  }),
                                  jsxs('button', {
                                    onClick: p,
                                    className:
                                      'flex w-full items-center gap-2 border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/40 cursor-pointer',
                                    children: [
                                      jsx(LogOut, {
                                        className: 'h-4 w-4',
                                      }),
                                      'Sign Out',
                                    ],
                                  }),
                                ],
                              }),
                          ],
                        }),
                      ],
                    })
                  : jsxs(Fragment, {
                      children: [
                        jsxs('button', {
                          onClick: () => h('login'),
                          id: 'header-signin-btn',
                          className:
                            'inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 px-3 py-1.5 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-2xs cursor-pointer shrink-0 active:scale-95',
                          children: [
                            jsx(User, {
                              className:
                                'h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0',
                            }),
                            jsx('span', { children: 'Sign In' }),
                          ],
                        }),
                        jsxs('button', {
                          onClick: () => h('login'),
                          id: 'header-post-ad-btn',
                          className:
                            'btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm shadow-xs shrink-0 cursor-pointer',
                          children: [
                            jsx(CirclePlus, {
                              className: 'h-4 w-4 shrink-0',
                            }),
                            'Post an Ad',
                          ],
                        }),
                      ],
                    }),
              ],
            }),

            // Mobile Top Bar Controls (md:hidden)
            // Perfectly spaced 4 action buttons on mobile: Search, Theme, User/Sign In, Hamburger
            jsxs('div', {
              className: 'flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0',
              children: [
                // 1. Mobile Search Trigger (opens full search overlay)
                jsx('button', {
                  type: 'button',
                  onClick: () => setIsMobileSearchOpen(!0),
                  id: 'mobile-header-search-trigger',
                  className:
                    'flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 active:scale-95 transition-all cursor-pointer',
                  'aria-label': 'Search solar equipment',
                  children: jsx(Search, { className: 'h-4 w-4' }),
                }),

                // 2. Mobile Theme Switcher
                jsx(ThemeRadioToggle, {
                  className: 'shrink-0',
                }),

                // 3. User Avatar or Sign In Icon Button
                c
                  ? jsx('button', {
                      type: 'button',
                      onClick: () => h('dashboard'),
                      id: 'mobile-header-profile-btn',
                      className:
                        'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer',
                      'aria-label': 'Open Dashboard',
                      children: userInitial,
                    })
                  : jsx('button', {
                      type: 'button',
                      onClick: () => h('login'),
                      id: 'mobile-header-signin-btn',
                      className:
                        'flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-primary-600 active:scale-95 transition-all shadow-2xs cursor-pointer',
                      'aria-label': 'Sign In',
                      children: jsx(User, {
                        className: 'h-4 w-4 text-gray-600 dark:text-gray-300',
                      }),
                    }),

                // 4. Hamburger Menu Toggle Button
                jsx('button', {
                  ref: mobileToggleBtnRef,
                  type: 'button',
                  onClick: () => a(!s),
                  id: 'mobile-header-menu-toggle',
                  className:
                    'flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer',
                  'aria-label': s
                    ? 'Close navigation menu'
                    : 'Open navigation menu',
                  children: s
                    ? jsx(X, { className: 'h-5 w-5' })
                    : jsx(Menu, { className: 'h-5 w-5' }),
                }),
              ],
            }),
          ],
        }),
      }),

      // Professional Mobile Drawer Menu (div:nth-of-type(3) & div:nth-of-type(4))
      s &&
        jsxs(Fragment, {
          children: [
            // Backdrop (div:nth-of-type(3))
            jsx('div', {
              id: 'mobile-navigation-backdrop',
              className:
                'fixed inset-0 top-16 bg-black/60 backdrop-blur-xs md:hidden z-40 transition-opacity animate-in fade-in duration-200',
              onClick: () => a(false),
              'aria-hidden': 'true',
            }),
            // Drawer Container (div:nth-of-type(4))
            jsx('div', {
              id: 'mobile-navigation-drawer',
              ref: mobileMenuRef,
              className:
                'fixed top-16 right-0 bottom-0 w-full sm:w-[380px] max-w-full bg-white dark:bg-gray-900 border-t sm:border-l border-gray-200/90 dark:border-gray-800 shadow-2xl md:hidden z-50 h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain flex flex-col animate-in slide-in-from-top-1 sm:slide-in-from-right duration-200',
              children: jsxs('div', {
                className: 'flex flex-col min-h-full pb-8',
                children: [
                  // 1. Drawer Header / Quick Dismiss Bar
                  jsxs('div', {
                    className:
                      'sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80',
                    children: [
                      jsxs('div', {
                        className: 'flex items-center gap-2',
                        children: [
                          jsx('div', {
                            className:
                              'flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400',
                            children: jsx(Sun, { className: 'h-3.5 w-3.5', strokeWidth: 2.5 }),
                          }),
                          jsxs('span', {
                            className:
                              'text-xs font-black tracking-tight text-gray-900 dark:text-white',
                            children: [
                              'Sell',
                              jsx('span', {
                                className: 'text-amber-500',
                                children: 'Solar',
                              }),
                              jsx('span', {
                                className: 'ml-1 text-[10px] font-semibold text-gray-400 dark:text-gray-500',
                                children: '• Menu',
                              }),
                            ],
                          }),
                        ],
                      }),
                      jsx('button', {
                        type: 'button',
                        onClick: () => a(false),
                        className:
                          'flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer',
                        'aria-label': 'Close menu',
                        children: jsx(X, { className: 'h-4 w-4' }),
                      }),
                    ],
                  }),

                  // 2. User Profile Section / Welcome Card
                  c
                    ? jsxs('div', {
                        className:
                          'p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/10 dark:via-gray-900 dark:to-gray-900 border-b border-gray-200/70 dark:border-gray-800 flex items-center justify-between',
                        children: [
                          jsxs('div', {
                            className: 'flex items-center gap-3 min-w-0',
                            children: [
                              jsx('div', {
                                className:
                                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black text-sm shadow-sm',
                                children: userInitial,
                              }),
                              jsxs('div', {
                                className: 'min-w-0 flex-1',
                                children: [
                                  jsx('h3', {
                                    className:
                                      'text-sm font-extrabold text-gray-900 dark:text-white truncate',
                                    children:
                                      u?.full_name || 'Solar User',
                                  }),
                                  jsx('p', {
                                    className:
                                      'text-xs text-gray-500 dark:text-gray-400 truncate',
                                    children: c?.email || '',
                                  }),
                                  jsx('span', {
                                    className:
                                      'inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
                                    children: isUserAdmin
                                      ? '🛡️ Admin Account'
                                      : u?.account_type === 'dealer' ||
                                        u?.is_dealer
                                      ? '🏪 Verified Dealer'
                                      : '👤 Member',
                                  }),
                                ],
                              }),
                            ],
                          }),
                          jsx('button', {
                            onClick: () => h('dashboard'),
                            className:
                              'shrink-0 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/80 shadow-2xs active:scale-95 transition-all cursor-pointer',
                            children: 'Dashboard →',
                          }),
                        ],
                      })
                    : jsxs('div', {
                        className:
                          'p-4 bg-gray-50 dark:bg-gray-850/60 border-b border-gray-200/70 dark:border-gray-800 flex items-center justify-between',
                        children: [
                          jsxs('div', {
                            children: [
                              jsx('h3', {
                                className:
                                  'text-sm font-extrabold text-gray-900 dark:text-white',
                                children: 'Welcome to SellSolar',
                              }),
                              jsx('p', {
                                className:
                                  'text-xs text-gray-500 dark:text-gray-400 mt-0.5',
                                children: "Pakistan's Premier Solar Marketplace",
                              }),
                            ],
                          }),
                          jsx('button', {
                            onClick: () => h('login'),
                            className:
                              'btn-primary text-xs px-3.5 py-1.5 font-bold shadow-2xs active:scale-95 cursor-pointer',
                            children: 'Sign In / Join',
                          }),
                        ],
                      }),

                  // 3. Post Free Ad CTA Banner
                  jsx('div', {
                    className:
                      'p-3.5 border-b border-gray-100 dark:border-gray-800',
                    children: jsxs('button', {
                      type: 'button',
                      onClick: () => h('post-ad'),
                      className:
                        'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-sm shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer',
                      children: [
                        jsx(CirclePlus, {
                          className: 'h-5 w-5 shrink-0',
                        }),
                        jsx('span', {
                          children: 'Post Free Solar Ad (اشتہار لگائیں)',
                        }),
                      ],
                    }),
                  }),

                  // 4. Navigation Links Sections
                  jsxs('div', {
                    className: 'p-3 space-y-4',
                    children: [
                      // Section 1: Marketplace & Rates
                      jsxs('div', {
                        children: [
                          jsx('p', {
                            className:
                              'px-2 mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500',
                            children: 'Marketplace & Rates',
                          }),
                          jsxs('div', {
                            className: 'space-y-1',
                            children: [
                              // Today's Rates
                              jsxs('button', {
                                onClick: () => h('prices'),
                                className: `w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                                  e === 'prices'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800/60'
                                }`,
                                children: [
                                  jsxs('div', {
                                    className: 'flex items-center gap-2.5',
                                    children: [
                                      jsxs('span', {
                                        className:
                                          'relative flex h-2.5 w-2.5 shrink-0',
                                        children: [
                                          jsx('span', {
                                            className:
                                              'absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75',
                                          }),
                                          jsx('span', {
                                            className:
                                              'relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500',
                                          }),
                                        ],
                                      }),
                                      jsx('span', {
                                        children: "Today's Solar Rates",
                                      }),
                                    ],
                                  }),
                                  jsx('span', {
                                    className:
                                      'rounded bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 text-[10px] font-black text-amber-900 dark:text-amber-100',
                                    children: 'LIVE',
                                  }),
                                ],
                              }),
                              // Browse All Listings
                              jsxs('button', {
                                onClick: () => h('home'),
                                className:
                                  'w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer',
                                children: [
                                  jsxs('div', {
                                    className: 'flex items-center gap-2.5',
                                    children: [
                                      jsx(Sun, {
                                        className:
                                          'h-4.5 w-4.5 text-amber-500',
                                      }),
                                      jsx('span', {
                                        children: 'Browse Solar Equipment',
                                      }),
                                    ],
                                  }),
                                  jsx(ChevronRight, {
                                    className: 'h-4 w-4 text-gray-400',
                                  }),
                                ],
                              }),
                              // Verified Dealers
                              jsxs('button', {
                                onClick: () => h('dealers'),
                                className:
                                  'w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer',
                                children: [
                                  jsxs('div', {
                                    className: 'flex items-center gap-2.5',
                                    children: [
                                      jsx(Store, {
                                        className:
                                          'h-4.5 w-4.5 text-amber-500',
                                      }),
                                      jsx('span', {
                                        children: 'Verified Solar Dealers',
                                      }),
                                    ],
                                  }),
                                  jsx(ChevronRight, {
                                    className: 'h-4 w-4 text-gray-400',
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),

                      // Section 2: Smart Tools & Services
                      jsxs('div', {
                        children: [
                          jsx('p', {
                            className:
                              'px-2 mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500',
                            children: 'Calculators & Services',
                          }),
                          jsxs('div', {
                            className: 'space-y-1',
                            children: [
                              // Solar Calculator
                              jsxs('button', {
                                onClick: () => h('calculator'),
                                className: `w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                                  e === 'calculator'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-primary-50/80 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 border border-primary-200/70 dark:border-primary-800/60'
                                }`,
                                children: [
                                  jsxs('div', {
                                    className: 'flex items-center gap-2.5',
                                    children: [
                                      jsx(Calculator, {
                                        className:
                                          'h-4.5 w-4.5 text-primary-600 dark:text-primary-400',
                                      }),
                                      jsx('span', {
                                        children:
                                          'Solar Load & System Calculator',
                                      }),
                                    ],
                                  }),
                                  jsx(ChevronRight, {
                                    className: 'h-4 w-4 text-gray-400',
                                  }),
                                ],
                              }),
                              // Tier-1 Panels Verification
                              jsxs('button', {
                                onClick: () => h('verification'),
                                className: `w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                                  e === 'verification' || e === 'tier-1-verification' || e === 'panel-verification'
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`,
                                children: [
                                  jsxs('div', {
                                    className: 'flex items-center gap-2.5',
                                    children: [
                                      jsx(ShieldCheck, {
                                        className:
                                          'h-4.5 w-4.5 text-emerald-500',
                                      }),
                                      jsx('span', {
                                        children:
                                          'Tier-1 Panels Verification',
                                      }),
                                    ],
                                  }),
                                  jsx(ChevronRight, {
                                    className: 'h-4 w-4 text-gray-400',
                                  }),
                                ],
                              }),
                              // Turnkey Installation
                              jsxs('button', {
                                onClick: () => h('install'),
                                className:
                                  'w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer',
                                children: [
                                  jsxs('div', {
                                    className: 'flex items-center gap-2.5',
                                    children: [
                                      jsx(Wrench, {
                                        className:
                                          'h-4.5 w-4.5 text-secondary-600 dark:text-secondary-400',
                                      }),
                                      jsx('span', {
                                        children:
                                          'Complete Turnkey Installation',
                                      }),
                                    ],
                                  }),
                                  jsx(ChevronRight, {
                                    className: 'h-4 w-4 text-gray-400',
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),

                      // Section 3: Theme Toggle Row in Drawer
                      jsxs('div', {
                        className: 'pt-2 border-t border-gray-100 dark:border-gray-800',
                        children: [
                          jsx('p', {
                            className:
                              'px-2 mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500',
                            children: 'Display Preferences',
                          }),
                          jsxs('div', {
                            className: 'flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-850/60 border border-gray-200/60 dark:border-gray-800',
                            children: [
                              jsx('span', {
                                className: 'text-sm font-medium text-gray-700 dark:text-gray-300',
                                children: 'Appearance',
                              }),
                              jsx(ThemeRadioToggle, {
                                className: 'shrink-0',
                              }),
                            ],
                          }),
                        ],
                      }),

                      // Section 4: Account & Security
                      jsxs('div', {
                        className:
                          'pt-2 border-t border-gray-100 dark:border-gray-800',
                        children: [
                          jsx('p', {
                            className:
                              'px-2 mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500',
                            children: 'Account & Security',
                          }),
                          c
                            ? jsxs('div', {
                                className: 'space-y-1',
                                children: [
                                  // Dashboard
                                  jsxs('button', {
                                    onClick: () => h('dashboard'),
                                    className:
                                      'w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer',
                                    children: [
                                      jsxs('div', {
                                        className:
                                          'flex items-center gap-2.5',
                                        children: [
                                          jsx(LayoutDashboard, {
                                            className:
                                              'h-4.5 w-4.5 text-amber-500',
                                          }),
                                          jsx('span', {
                                            children:
                                              u?.is_super_admin ||
                                              u?.role === 'super_admin' ||
                                              c?.email?.toLowerCase() ===
                                                DEFAULT_ADMIN_EMAIL.toLowerCase()
                                                ? '👑 Super Admin Dashboard'
                                                : u?.is_admin ||
                                                  u?.role === 'admin'
                                                ? '🛡️ Admin Dashboard'
                                                : u?.role === 'dealer' ||
                                                  u?.is_dealer
                                                ? '🏪 Dealer Dashboard'
                                                : '📊 My Dashboard',
                                          }),
                                        ],
                                      }),
                                      jsx(ChevronRight, {
                                        className: 'h-4 w-4 text-gray-400',
                                      }),
                                    ],
                                  }),
                                  // Admin Inbox (if admin)
                                  isUserAdmin &&
                                    jsxs('button', {
                                      onClick: () => h('inbox'),
                                      className:
                                        'w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all cursor-pointer',
                                      children: [
                                        jsxs('div', {
                                          className:
                                            'flex items-center gap-2.5',
                                          children: [
                                            jsx(MessageSquare, {
                                              className:
                                                'h-4.5 w-4.5 text-purple-500',
                                            }),
                                            jsx('span', {
                                              children:
                                                'Admin Inbox & Inquiries',
                                            }),
                                          ],
                                        }),
                                        unreadInboxCount > 0 &&
                                          jsx('span', {
                                            className:
                                              'px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white',
                                            children: unreadInboxCount,
                                          }),
                                      ],
                                    }),
                                  // Change Password
                                  jsxs('button', {
                                    onClick: () => h('password'),
                                    className:
                                      'w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer',
                                    children: [
                                      jsxs('div', {
                                        className:
                                          'flex items-center gap-2.5',
                                        children: [
                                          jsx(Lock, {
                                            className:
                                              'h-4.5 w-4.5 text-gray-400',
                                          }),
                                          jsx('span', {
                                            children: 'Change Password',
                                          }),
                                        ],
                                      }),
                                      jsx(ChevronRight, {
                                        className: 'h-4 w-4 text-gray-400',
                                      }),
                                    ],
                                  }),
                                  // Sign Out
                                  jsxs('button', {
                                    onClick: p,
                                    className:
                                      'w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer mt-2',
                                    children: [
                                      jsx(LogOut, {
                                        className: 'h-4.5 w-4.5',
                                      }),
                                      jsx('span', {
                                        children: 'Sign Out',
                                      }),
                                    ],
                                  }),
                                ],
                              })
                            : jsxs('div', {
                                className: 'space-y-1.5',
                                children: [
                                  jsxs('button', {
                                    onClick: () => h('login'),
                                    className:
                                      'w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 transition-all cursor-pointer',
                                    children: [
                                      jsxs('div', {
                                        className:
                                          'flex items-center gap-2.5',
                                        children: [
                                          jsx(User, {
                                            className:
                                              'h-4.5 w-4.5 text-primary-600',
                                          }),
                                          jsx('span', {
                                            children:
                                              'Sign In to Your Account',
                                          }),
                                        ],
                                      }),
                                      jsx(ChevronRight, {
                                        className:
                                          'h-4 w-4 text-primary-500',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                        ],
                      }),
                    ],
                  }),

                  // 5. Professional Trust & Customer Support Notice (No exposed raw phone/WhatsApp)
                  jsxs('div', {
                    className:
                      'mt-auto p-4 bg-gray-50/90 dark:bg-gray-850/60 border-t border-gray-200/60 dark:border-gray-800 text-center space-y-1',
                    children: [
                      jsxs('div', {
                        className: 'flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300',
                        children: [
                          jsx(BadgeCheck, { className: 'h-4 w-4 text-amber-500 shrink-0' }),
                          jsx('span', { children: "Pakistan's #1 Solar Marketplace" }),
                        ],
                      }),
                      jsx('p', {
                        className:
                          'text-[11px] text-gray-500 dark:text-gray-400',
                        children:
                          'Support & Inquiries: info@sellsolar.pk • Mon–Sat 9am–6pm',
                      }),
                      jsx('p', {
                        className:
                          'text-[10px] text-gray-400 dark:text-gray-500 pt-0.5',
                        children: '© 2026 SellSolar.pk • All Rights Reserved',
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
    ],
  });
}const Zy=[{
  value:"",label:"All",icon:Search
},{
  value:"panel",label:"Panels",icon:Sun
},{
  value:"inverter",label:"Inverters",icon:Zap
},{
  value:"battery",label:"Batteries",icon:BatteryCharging
},{
  value:"complete_system",label:"Systems",icon:Boxes
}],ex=["","Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Gujranwala","Peshawar"],tx=["","Longi","Canadian Solar","Jinko","Trina","Inverex","Tesla","Homage","Phoenix","Osaka","AGS"],rx=[{
  value:"",label:"Any Condition"
},{
  value:"new",label:"New"
},{
  value:"used",label:"Used"
}];
function nx({
  filters:t,onFilterChange:e,onSearch:r,onReset:n,onNavigatePrices:np,onNavigateCalculator:nc,onNavigateDealers:nd,onNavigateInstallation:ni
}){
  const { settings } = useSiteSettings();
  const heroCms = settings?.homePageCms?.hero;
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(() => Boolean(t.brand || t.condition || t.minPrice || t.maxPrice));
  const activeExtraFiltersCount = [t.brand, t.condition, t.minPrice, t.maxPrice].filter(Boolean).length;
  // Live dynamic ticking animated counters for hero metrics
  const [counts, setCounts] = useState({
    listings: 512,
    sellers: 124,
    cities: 16,
    buyers: 10450,
  });

  useEffect(() => {
    // Smooth initial count-up
    const startTime = Date.now();
    const duration = 1800;
    const targets = { listings: 512, sellers: 124, cities: 16, buyers: 10450 };

    const animInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts({
        listings: Math.floor(targets.listings * ease),
        sellers: Math.floor(targets.sellers * ease),
        cities: Math.floor(targets.cities * ease),
        buyers: Math.floor(targets.buyers * ease),
      });

      if (progress >= 1) {
        clearInterval(animInterval);
      }
    }, 30);

    // Continuous live ticker that gently updates so it stays alive and never stays fixed
    const liveTicker = setInterval(() => {
      setCounts(prev => {
        const deltaListings = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const deltaBuyers = Math.floor(Math.random() * 5) - 2;
        const newListings = Math.max(500, prev.listings + deltaListings);
        const newBuyers = Math.max(10400, prev.buyers + deltaBuyers);
        return {
          ...prev,
          listings: newListings,
          buyers: newBuyers,
        };
      });
    }, 2800);

    return () => {
      clearInterval(animInterval);
      clearInterval(liveTicker);
    };
  }, []);

  const popularSearches = [
    "Longi 585W",
    "Inverex 6kW",
    "Canadian Solar TopCon",
    "Crown 3.2kW",
    "Narada 48V",
    "10kW On-Grid",
    "Jinko 580W"
  ];

  const handlePopularClick = (term) => {
    e("query", term);
    setTimeout(() => {
      r();
      const el = document.getElementById("listings");
      el && el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return jsxs("section",{
    className:"relative overflow-hidden pt-14 sm:pt-18 lg:pt-20 pb-4 sm:pb-5 border-b border-gray-200/60 dark:border-gray-800 transition-colors",children:[
      jsxs("div",{
        className:"absolute inset-0 -z-10",children:[
          heroCms?.heroImageUrl ? jsx("div", {
            className: "absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-15 transition-opacity",
            style: { backgroundImage: `url(${heroCms.heroImageUrl})` }
          }) : null,
          jsx("div",{
            className:"absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors"
          }),
          jsx("div",{
            className:"absolute inset-0 bg-grid opacity-30 dark:opacity-15"
          }),
          jsx("div",{
            className:"absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-300/20 dark:bg-primary-500/10 blur-3xl"
          }),
          jsx("div",{
            className:"absolute -left-32 top-64 h-96 w-96 rounded-full bg-secondary-300/15 dark:bg-secondary-500/10 blur-3xl"
          })
        ]
      }),
      jsxs("div",{
        className:"container-page",children:[
          jsxs("div",{
            className:"mx-auto max-w-3xl text-center px-1 sm:px-0",children:[
              jsxs("div",{
                className:"mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-800/60 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary-700 dark:text-primary-300 shadow-2xs",children:[
                  jsx(TrendingUp,{ className:"h-3 w-3 text-primary-600 dark:text-primary-400" }),
                  heroCms?.badgeText || "Pakistan's #1 Solar Marketplace"
                ]
              }),
              jsx("h1",{
                className:"text-balance text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight",
                children: heroCms?.heading || "Sell & Buy Used Solar Panels in Pakistan"
              }),
              jsx("p",{
                className:"mx-auto mt-1 sm:mt-1.5 max-w-xl text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed",
                children: heroCms?.subheading || "Search 500+ verified used and new solar panels, inverters and batteries across Pakistan at live market rates."
              }),
              (nc||np||nd)&&jsxs("div",{
                className:"mt-2.5 flex flex-wrap items-center justify-center gap-2",children:[
                  np?jsxs("button",{
                    onClick:np,className:"inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all shadow-2xs cursor-pointer",children:[
                      jsx(Zap,{ className:"h-3 w-3 fill-amber-500 text-amber-500" }),
                      "Today's Rates (Rs 34-42/W)",
                      jsx(ArrowRight,{ className:"h-2.5 w-2.5" })
                    ]
                  }):null,
                  nc?jsxs("button",{
                    onClick:nc,className:"inline-flex items-center gap-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 border border-primary-200/80 dark:border-primary-800/60 px-2.5 py-1 text-[11px] font-bold text-primary-800 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-all shadow-2xs cursor-pointer",children:[
                      jsx(Calculator,{ className:"h-3 w-3 text-primary-600 dark:text-primary-400" }),
                      "Load Calculator",
                      jsx(ArrowRight,{ className:"h-2.5 w-2.5" })
                    ]
                  }):null,
                  nd?jsxs("button",{
                    onClick:nd,className:"inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-2xs cursor-pointer",children:[
                      jsx(Store,{ className:"h-3 w-3 text-emerald-600 dark:text-emerald-400" }),
                      "Verified Dealers (80+)",
                      jsx(ArrowRight,{ className:"h-2.5 w-2.5" })
                    ]
                  }):null
                ]
              })
            ]
          }),
          jsx("div",{
            className:"mx-auto mt-3.5 sm:mt-4 max-w-4xl",children:jsxs("div",{
              className:"card overflow-hidden border border-gray-200/90 dark:border-gray-800 shadow-xl dark:bg-gray-900",children:[
                jsx("div",{
                  className:"flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800 p-1.5 sm:p-2 scrollbar-hide bg-gray-50/70 dark:bg-gray-850/60",children:Zy.map(s=>{
                    const a=s.icon,l=t.category===s.value;
                    return jsxs("button",{
                      onClick:()=>e("category",s.value),className:`flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                        l?"bg-primary-500 text-white shadow-xs":"text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-transparent"
                      }`,children:[
                        jsx(a,{ className:"h-4 w-4" }),
                        s.label
                      ]
                    },s.value||"all")
                  })
                }),
                jsxs("div",{
                  className:"p-3 sm:p-4",children:[
                    jsxs("div",{
                      className:"flex flex-col sm:flex-row gap-2 items-stretch",children:[
                        jsxs("div",{
                          className:"relative flex-1",children:[
                            jsx(Search,{ className:"absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
                            jsx("input",{
                              type:"text",
                              placeholder:"Search solar panels, inverters, batteries (e.g. Longi 585W, Inverex 6kW)...",
                              value:t.query,
                              onChange:s=>e("query",s.target.value),
                              onKeyDown:s=>s.key==="Enter"&&r(),
                              className:"w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950"
                            })
                          ]
                        }),
                        jsxs("div",{
                          className:"relative sm:w-44 shrink-0",children:[
                            jsx(MapPin,{ className:"absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" }),
                            jsx("select",{
                              value:t.city,
                              onChange:s=>e("city",s.target.value),
                              className:"w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-8 pr-7 text-xs sm:text-sm text-gray-900 dark:text-gray-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950 font-medium",
                              children:ex.map(s=>jsx("option",{
                                value:s,children:s||"All Pakistan"
                              },s||"all-cities"))
                            })
                          ]
                        }),
                        jsxs("button",{
                          onClick:r,
                          className:"btn-primary px-5 py-2.5 text-xs sm:text-sm font-bold shrink-0 shadow-xs flex items-center justify-center gap-1.5",children:[
                            jsx(Search,{ className:"h-4 w-4" }),
                            "Search"
                          ]
                        })
                      ]
                    }),
                    jsxs("div",{
                      className:"mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs",children:[
                        jsxs("button",{
                          type:"button",
                          onClick:()=>setMoreFiltersOpen(prev=>!prev),
                          className:`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors font-medium ${
                            moreFiltersOpen || activeExtraFiltersCount > 0
                              ? "bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800/60"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`,
                          children:[
                            jsx(SlidersHorizontal,{ className:"h-3.5 w-3.5" }),
                            "Filters (Brand, Condition, Price)",
                            activeExtraFiltersCount > 0 && jsx("span",{
                              className:"ml-1 rounded-full bg-primary-500 text-white px-1.5 py-0.2 text-[10px] font-bold",
                              children:activeExtraFiltersCount
                            }),
                            jsx(ChevronDown,{ className:`h-3 w-3 transition-transform ${moreFiltersOpen?"rotate-180":""}` })
                          ]
                        }),
                        (activeExtraFiltersCount > 0 || t.city || t.query || t.category) && jsx("button",{
                          type:"button",
                          onClick:n,
                          className:"text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 font-medium transition-colors text-[11px]",
                          children:"Clear Filters"
                        })
                      ]
                    }),
                    moreFiltersOpen && jsxs("div",{
                      className:"mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn",children:[
                        jsxs("div",{
                          children:[
                            jsx("label",{ className:"mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400", children:"Brand" }),
                            jsx("select",{
                              value:t.brand,onChange:s=>e("brand",s.target.value),className:"select-field text-xs py-2",children:tx.map(s=>jsx("option",{
                                value:s,children:s||"All Brands"
                              },s||"all-brands"))
                            })
                          ]
                        }),
                        jsxs("div",{
                          children:[
                            jsx("label",{ className:"mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400", children:"Condition" }),
                            jsx("select",{
                              value:t.condition,onChange:s=>e("condition",s.target.value),className:"select-field text-xs py-2",children:rx.map(s=>jsx("option",{
                                value:s.value,children:s.label
                              },s.value||"any-cond"))
                            })
                          ]
                        }),
                        jsxs("div",{
                          className:"col-span-2 sm:col-span-2",children:[
                            jsx("label",{ className:"mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400", children:"Price Range (PKR)" }),
                            jsxs("div",{
                              className:"flex items-center gap-1.5",children:[
                                jsx("input",{
                                  type:"number",placeholder:"Min PKR",value:t.minPrice,onChange:s=>e("minPrice",s.target.value),className:"input-field text-xs py-2"
                                }),
                                jsx("span",{ className:"text-gray-400 text-xs", children:"-" }),
                                jsx("input",{
                                  type:"number",placeholder:"Max PKR",value:t.maxPrice,onChange:s=>e("maxPrice",s.target.value),className:"input-field text-xs py-2"
                                })
                              ]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                jsxs("div",{
                  className:"border-t border-gray-200/70 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/50 px-3.5 py-2 text-xs flex flex-wrap items-center gap-1.5",children:[
                    jsx("span",{ className:"font-bold text-gray-500 dark:text-gray-400 text-[11px] mr-1", children:"Popular:" }),
                    popularSearches.map(term=>jsx("button",{
                      type:"button",onClick:()=>handlePopularClick(term),className:"rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-2xs",children:term
                    },term))
                  ]
                })
              ]
            })
          }),
          jsx("div",{
            className:"mx-auto mt-3.5 max-w-4xl",children:jsx("div",{
              className:"flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1.5 scrollbar-none",children:[
                {
                  label: "Solar Panels",
                  sub: "550W & N-Type",
                  icon: Sun,
                  action: () => {
                    e("category", "panel");
                    const el = document.getElementById("listings");
                    el && el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  active: t.category === "panel"
                },
                {
                  label: "Inverters",
                  sub: "Hybrid & On-Grid",
                  icon: Zap,
                  action: () => {
                    e("category", "inverter");
                    const el = document.getElementById("listings");
                    el && el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  active: t.category === "inverter"
                },
                {
                  label: "Batteries",
                  sub: "Lithium & Tubular",
                  icon: BatteryCharging,
                  action: () => {
                    e("category", "battery");
                    const el = document.getElementById("listings");
                    el && el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  active: t.category === "battery"
                },
                {
                  label: "Complete Systems",
                  sub: "5kW to 20kW+",
                  icon: Boxes,
                  action: () => {
                    e("category", "complete_system");
                    const el = document.getElementById("listings");
                    el && el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  active: t.category === "complete_system"
                },
                {
                  label: "Daily Rates",
                  sub: "Rs 34-42/W Live",
                  icon: TrendingUp,
                  action: np || (() => {
                    const el = document.getElementById("daily-market-rates");
                    el && el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }),
                  highlight: true
                },
                {
                  label: "Solar Calculator",
                  sub: "Find System kW",
                  icon: Calculator,
                  action: nc
                },
                {
                  label: "Verified Dealers",
                  sub: "80+ Certified",
                  icon: Store,
                  action: nd
                }
              ].map(cat => jsxs("button", {
                type: "button",
                onClick: cat.action,
                className: `flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-left border transition-all shrink-0 cursor-pointer ${
                  cat.active
                    ? "bg-primary-500 text-white border-primary-600 shadow-xs"
                    : cat.highlight
                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-300/80 dark:border-amber-800"
                    : "bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-2xs"
                }`,
                children: [
                  jsx("div", {
                    className: `h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      cat.active
                        ? "bg-white/20 text-white"
                        : cat.highlight
                        ? "bg-amber-500 text-white"
                        : "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
                    }`,
                    children: jsx(cat.icon, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4" })
                  }),
                  jsxs("div", {
                    className: "min-w-0 pr-1",
                    children: [
                      jsx("div", { className: `text-[11px] sm:text-xs font-bold leading-tight ${cat.active ? "text-white" : ""}`, children: cat.label }),
                      jsx("div", { className: `text-[9px] sm:text-[10px] leading-tight ${cat.active ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`, children: cat.sub })
                    ]
                  })
                ]
              }, cat.label))
            })
          }),
          jsx("div",{
            className:"mx-auto mt-4 sm:mt-5 grid max-w-4xl grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-4",children:[{
              value: `${counts.listings.toLocaleString()}+`, label: "Active Listings"
            },{
              value: `${counts.sellers}+`, label: "Verified Sellers"
            },{
              value: `${counts.cities}+`, label: "Cities Covered"
            },{
              value: counts.buyers >= 1000 ? `${(counts.buyers / 1000).toFixed(1)}K+` : `${counts.buyers}+`, label: "Monthly Buyers"
            }].map(s=>jsxs("div",{
              className:"card-interactive p-2.5 sm:p-3 text-center border border-gray-200/80 dark:border-gray-800 dark:bg-gray-900 shadow-2xs transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-600",children:[
                jsx("div",{ className:"text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight", children:s.value }),
                jsx("div",{ className:"mt-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400", children:s.label })
              ]
            },s.label))
          })
        ]
      })
    ]
  });
}function PakWheelsSellCards({ onPostAd, onInstall, onNavigate }) {
  const items = [
    {
      id: 'sell',
      title: 'Post Free Solar Ad',
      desc: 'Sell used/new solar panels, inverters or batteries',
      cta: 'Post Ad Free',
      icon: CirclePlus,
      color: 'from-amber-500 to-amber-600',
      action: () => onPostAd && onPostAd()
    },
    {
      id: 'calc',
      title: 'Solar Load Calculator',
      desc: 'Instant kW sizing, panel count & battery backup',
      cta: 'Calculate kW',
      icon: Calculator,
      color: 'from-primary-500 to-primary-600',
      action: () => onNavigate && onNavigate('calculator')
    },
    {
      id: 'install',
      title: 'Request Installation',
      desc: 'Net-Metering & PEC certified solar installers',
      cta: 'Get Quote',
      icon: Wrench,
      color: 'from-emerald-500 to-emerald-600',
      action: () => (onInstall ? onInstall() : (onNavigate && onNavigate('installation')))
    }
  ];

  return jsx("section", {
    className: "bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-800 transition-colors",
    children: jsx("div", {
      className: "container-page py-3",
      children: jsx("div", {
        className: "grid grid-cols-1 sm:grid-cols-3 gap-2.5",
        children: items.map((item) => (
          jsxs("button", {
            type: "button",
            onClick: item.action,
            className: "group flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xs transition-all text-left w-full cursor-pointer",
            children: [
              jsx("div", {
                className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-xs`,
                children: jsx(item.icon, { className: "h-4 w-4" })
              }),
              jsxs("div", {
                className: "flex-1 min-w-0",
                children: [
                  jsx("div", { className: "text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight truncate", children: item.title }),
                  jsx("div", { className: "text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight truncate", children: item.desc })
                ]
              }),
              jsxs("span", {
                className: "shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-lg border border-primary-200/60 dark:border-primary-800/60",
                children: [item.cta, jsx(ArrowRight, { className: "h-2.5 w-2.5" })]
              })
            ]
          }, item.id)
        ))
      })
    })
  });
}

const sx=[{
  value:"panel",icon:Sun,desc:"Monocrystalline & TopCon panels",gradient:"from-primary-500 to-primary-600",count:"240+ Ads"
},{
  value:"inverter",icon:Zap,desc:"Hybrid, off-grid & on-grid inverters",gradient:"from-accent-500 to-accent-600",count:"150+ Ads"
},{
  value:"battery",icon:BatteryCharging,desc:"Lithium LiFePO4 & tubular batteries",gradient:"from-secondary-500 to-secondary-600",count:"95+ Ads"
},{
  value:"complete_system",icon:Boxes,desc:"Full solar packages with net-metering",gradient:"from-amber-500 to-amber-600",count:"60+ Ads"
}];

function ix({
  onSelectCategory:t,
  onSelectCity:onCity,
  onSelectBrand:onBrand
}){
  const [activeBrowseTab, setActiveBrowseTab] = useState("category");

  const browseCities = [
    "Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Gujranwala","Sialkot","Quetta"
  ];
  const browseBrands = [
    "Longi","Canadian Solar","Jinko","Trina","Inverex","Crown","Huawei","Growatt","Narada","Phoenix"
  ];

  return jsx("section",{
    id:"categories",className:"bg-gray-50/60 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-800 transition-colors",
    children:jsxs("div",{
      className:"container-page py-2.5 sm:py-3",
      children:[
        /* Tab Switcher */
        jsxs("div",{
          className:"flex items-center gap-2 mb-2",
          children:[
            jsx("span",{ className:"text-[11px] font-bold text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block", children:"Browse by:" }),
            ["category","city","brand"].map(tab =>
              jsx("button",{
                type:"button",
                onClick:()=>setActiveBrowseTab(tab),
                className:`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeBrowseTab===tab
                    ?"bg-primary-500 text-white shadow-xs"
                    :"bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600"
                }`,
                children: tab.charAt(0).toUpperCase() + tab.slice(1)
              }, tab)
            )
          ]
        }),
        /* Scrollable Chips Row */
        jsx("div",{
          className:"flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
          children: activeBrowseTab==="category"
            ? sx.map(cat => {
                const Icon = cat.icon;
                return jsxs("button",{
                  type:"button",
                  onClick:()=>t(cat.value),
                  className:"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 text-[11px] font-bold text-gray-700 dark:text-gray-200 shrink-0 transition-all shadow-2xs",
                  children:[
                    jsx("div",{ className:`flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br ${cat.gradient} text-white shrink-0`, children:jsx(Icon,{className:"h-3 w-3",strokeWidth:2}) }),
                    CATEGORIES[cat.value]
                  ]
                },cat.value);
              })
            : activeBrowseTab==="city"
            ? browseCities.map(city =>
                jsxs("button",{
                  type:"button",
                  onClick:()=>onCity&&onCity(city),
                  className:"inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 hover:text-primary-600 text-[11px] font-bold text-gray-700 dark:text-gray-200 shrink-0 transition-all shadow-2xs",
                  children:[jsx(MapPin,{className:"h-3 w-3 text-primary-500 shrink-0"}),city]
                },city)
              )
            : browseBrands.map(brand =>
                jsxs("button",{
                  type:"button",
                  onClick:()=>onBrand&&onBrand(brand),
                  className:"inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-400 hover:text-amber-700 text-[11px] font-bold text-gray-700 dark:text-gray-200 shrink-0 transition-all shadow-2xs",
                  children:[jsx(Award,{className:"h-3 w-3 text-amber-500 shrink-0"}),brand]
                },brand)
              )
        })
      ]
    })
  })
}

function ax({
  listing:t,onClick:e,onNavigate:nav
}){
  const { user } = useAuth();
  const toastCtx = useToast ? useToast() : null;
  const r=t.condition==="used";
  const allImages = listingImages(t);
  const imgUrl = allImages[0] || t.image_url || getEquipmentFallbackImage(t.category, t.title);

  const handleWhatsApp = (ev) => {
    ev.stopPropagation();
    if (!user) {
      if (toastCtx && toastCtx.showToast) {
        toastCtx.showToast({
          title: "Registration Required",
          message: "Please login or register on SellSolar before contacting the seller via WhatsApp.",
          type: "notice"
        });
      }
      if (nav) nav("login");
      return;
    }
    const phone = t.seller_phone || "03001234567";
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '92' + clean.slice(1);
    } else if (!clean.startsWith('92')) {
      clean = '92' + clean;
    }
    const msg = `Salam! I am interested in your solar listing on SellSolar: "${t.title}" (${formatPrice(t.price)}). Is it still available?`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return jsxs("div",{
    id: `listing-card-${t.id}`,
    onClick: e,
    className: "group cursor-pointer rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800/90 shadow-xs hover:shadow-xl hover:border-amber-500/50 dark:hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden relative",
    children: [
      jsxs("div", {
        children: [
          jsxs("div", {
            className: "relative aspect-[16/11] overflow-hidden bg-gray-100 dark:bg-gray-800",
            children: [
              jsx("img", {
                src: imgUrl,
                alt: t.title,
                loading: "lazy",
                referrerPolicy: "no-referrer",
                className: "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                onError: s => {
                  s.currentTarget.onerror = null;
                  s.currentTarget.src = getEquipmentFallbackImage(t.category, t.title);
                }
              }),
              jsx("div", {
                className: "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none opacity-60 group-hover:opacity-75 transition-opacity"
              }),
              jsxs("div", {
                className: "absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5 z-10",
                children: [
                  jsx("span", {
                    className: `rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      r ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                    }`,
                    children: r ? "Used" : "New"
                  }),
                  (t.featured || t.is_featured) && jsxs("span", {
                    className: "flex items-center gap-1 rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm",
                    children: [
                      jsx(Star, { className: "h-2.5 w-2.5 fill-current" }),
                      "Featured"
                    ]
                  }),
                  t.is_hot_sell && jsxs("span", {
                    className: "flex items-center gap-1 rounded-md bg-rose-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm",
                    children: [
                      jsx(Flame, { className: "h-2.5 w-2.5 fill-current" }),
                      "Hot"
                    ]
                  })
                ]
              }),
              jsxs("div", {
                className: "absolute right-2.5 top-2.5 flex items-center gap-1 z-10",
                children: [
                  (t.seller_verified || t.is_verified_dealer) && jsxs("span", {
                    className: "flex items-center gap-1 rounded-md bg-emerald-600/90 text-white px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs shadow-sm",
                    children: [
                      jsx(ShieldCheck, { className: "h-3 w-3" }),
                      "Verified"
                    ]
                  }),
                  allImages.length > 1 && jsxs("span", {
                    className: "flex items-center gap-1 rounded-md bg-black/60 text-white px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-xs shadow-sm",
                    children: [
                      jsx(Image, { className: "h-2.5 w-2.5" }),
                      allImages.length
                    ]
                  })
                ]
              })
            ]
          }),
          jsxs("div", {
            className: "p-3 sm:p-3.5",
            children: [
              jsxs("div", {
                className: "mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider",
                children: [
                  jsx("span", {
                    className: "text-amber-600 dark:text-amber-400 truncate",
                    children: CATEGORIES[t.category] || t.category
                  }),
                  t.capacity_kw ? jsx("span", {
                    className: "px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold shrink-0 ml-1.5",
                    children: `${t.capacity_kw}kW`
                  }) : null
                ]
              }),
              jsx("h3", {
                className: "line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-gray-900 dark:text-gray-100 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400",
                children: t.title
              }),
              jsxs("div", {
                className: "mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400",
                children: [
                  jsx(MapPin, {
                    className: "h-3.5 w-3.5 shrink-0 text-amber-500"
                  }),
                  jsx("span", {
                    className: "truncate font-medium",
                    children: t.city || "Pakistan"
                  }),
                  jsx("span", {
                    className: "text-gray-300 dark:text-gray-700",
                    children: "•"
                  }),
                  jsx("span", {
                    className: "truncate font-semibold text-gray-700 dark:text-gray-300",
                    children: t.brand || "Solar"
                  })
                ]
              })
            ]
          })
        ]
      }),
      jsx("div", {
        className: "px-3 pb-3 sm:px-3.5 sm:pb-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 mt-auto",
        children: jsxs("div", {
          className: "flex items-center justify-between gap-2",
          children: [
            jsxs("div", {
              className: "min-w-0 flex-1",
              children: [
                jsx("div", {
                  className: "text-sm sm:text-base font-black tracking-tight text-gray-950 dark:text-white truncate",
                  children: formatPrice(t.price)
                }),
                t.warranty_years ? jsxs("div", {
                  className: "flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5",
                  children: [
                    jsx(ShieldCheck, { className: "h-3 w-3 shrink-0" }),
                    formatWarrantyShort(t.warranty_years)
                  ]
                }) : jsx("div", {
                  className: "text-[10px] text-gray-400 dark:text-gray-500 mt-0.5",
                  children: "Verified Equipment"
                })
              ]
            }),
            jsx("button", {
              type: "button",
              onClick: handleWhatsApp,
              id: `listing-card-chat-btn-${t.id}`,
              title: "Chat with seller on WhatsApp",
              className: "inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0 cursor-pointer",
              children: jsxs(Fragment, {
                children: [
                  jsx(MessageCircle, {
                    className: "h-3.5 w-3.5 fill-emerald-600 dark:fill-emerald-400 text-transparent"
                  }),
                  jsx("span", {
                    className: "hidden xs:inline",
                    children: "Chat"
                  })
                ]
              })
            })
          ]
        })
      })
    ]
  });
}

function lx({
  listings:t,loading:e,error:r,totalCount:n,onSelectListing:s,onResetFilters:rf,onNavigate:nav,currentCondition,onConditionChange,currentCategory,onCategoryChange,isCarousel
}){
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    setVisibleCount(8);
  }, [t.length, currentCondition, currentCategory]);

  return jsx("section",{
    id:"listings",className:"bg-white dark:bg-gray-950 py-5 sm:py-6 border-b border-gray-200/60 dark:border-gray-800 transition-colors",children:jsxs("div",{
      className:"container-page",children:[
        jsxs("div",{
          className:"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-2.5 mb-3.5",children:[
            jsxs("div",{
              children:[
                jsx("h2",{
                  className:"text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white",children:"Used & New Solar Products for Sale"
                }),
                jsx("p",{
                  className:"mt-0.5 text-xs text-gray-500 dark:text-gray-400",children:e?"Loading equipment...":`${n} ${n===1?"listing":"listings"} — filter Used or New across Pakistan`
                })
              ]
            }),
            jsxs("div",{
              className:"flex flex-wrap items-center gap-2 sm:gap-3",children:[
                jsxs("div",{
                  className:"inline-flex items-center p-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold shadow-2xs",
                  children:[
                    jsx("span",{
                      className:"px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 hidden xs:inline",
                      children:"Condition:"
                    }),
                    jsx("button",{
                      type:"button",
                      onClick:()=>onConditionChange&&onConditionChange(""),
                      className:`px-2.5 sm:px-3 py-1 rounded-md transition-all ${
                        !currentCondition || currentCondition===""
                          ?"bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 font-bold shadow-xs"
                          :"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`,
                      children:"Both (All)"
                    }),
                    jsxs("button",{
                      type:"button",
                      onClick:()=>onConditionChange&&onConditionChange("new"),
                      className:`px-2.5 sm:px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        currentCondition==="new"
                          ?"bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                          :"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`,
                      children:[
                        jsx("span",{ className:"h-2 w-2 rounded-full bg-emerald-500 shrink-0" }),
                        "Brand New"
                      ]
                    }),
                    jsxs("button",{
                      type:"button",
                      onClick:()=>onConditionChange&&onConditionChange("used"),
                      className:`px-2.5 sm:px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        currentCondition==="used"
                          ?"bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                          :"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`,
                      children:[
                        jsx("span",{ className:"h-2 w-2 rounded-full bg-amber-500 shrink-0" }),
                        "Used"
                      ]
                    })
                  ]
                }),
                rf&&jsxs("button",{
                  onClick:rf,className:"btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1.5",children:[
                    jsx(RefreshCw,{ className:"h-3.5 w-3.5" }),
                    "Clear"
                  ]
                }),
                jsx("span",{
                  className:"rounded-md bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shrink-0",
                  children:`${n} Listed`
                })
              ]
            })
          ]
        }),
        jsxs("div",{
          className:"flex items-center gap-1.5 overflow-x-auto pb-2 mb-3.5 scrollbar-none",children:[
            { id:"", label:"All Equipment" },
            { id:"panel", label:"Solar Panels", icon:Sun },
            { id:"inverter", label:"Inverters", icon:Zap },
            { id:"battery", label:"Batteries", icon:BatteryCharging },
            { id:"complete_system", label:"Complete Systems", icon:Boxes }
          ].map(cat => {
            const isSelected = (!currentCategory && cat.id === "") || currentCategory === cat.id;
            return jsxs("button", {
              type: "button",
              onClick: () => onCategoryChange && onCategoryChange(cat.id),
              className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`,
              children: [
                cat.icon && jsx(cat.icon, { className: "h-3.5 w-3.5" }),
                cat.label
              ]
            }, cat.id || "all");
          })
        }),
        e?jsx("div",{
          id:"listings-skeleton-grid",
          className:"grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4",children:[1,2,3,4,5,6,7,8].map(sk=>jsxs("div",{
            className:"rounded-2xl overflow-hidden animate-pulse bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-xs",children:[jsx("div",{
              className:"aspect-[16/11] bg-gray-200 dark:bg-gray-800"
            }),jsxs("div",{
              className:"p-3.5 space-y-2.5",children:[jsx("div",{
                className:"h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3"
              }),jsx("div",{
                className:"h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-4/5"
              }),jsx("div",{
                className:"h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2"
              }),jsx("div",{
                className:"h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-2/5 pt-2"
              })]
            })]
          },sk))
        }):r?jsxs("div",{
          className:"card p-8 text-center text-error-600 dark:text-error-400 dark:bg-gray-900 border border-error-200 dark:border-error-900",children:[jsx(CircleAlert,{
            className:"mx-auto h-7 w-7 mb-2"
          }),jsx("p",{
            className:"font-semibold text-xs sm:text-sm",children:r
          })]
        }):t.length===0?jsxs("div",{
          className:"card p-10 text-center dark:bg-gray-900 border border-gray-200 dark:border-gray-800",children:[jsx(PackageOpen,{
            className:"mx-auto h-10 w-10 text-gray-400 mb-2.5"
          }),jsx("h3",{
            className:"text-base font-bold text-gray-900 dark:text-white",children:"No solar listings found"
          }),jsx("p",{
            className:"mt-1 max-w-md mx-auto text-xs text-gray-500 dark:text-gray-400",children:"We couldn't find any equipment matching your active filters. Try broadening your criteria or search keywords."
          }),rf&&jsxs("button",{
            onClick:rf,className:"btn-primary mt-4 text-xs inline-flex items-center gap-1.5 px-4 py-2",children:[jsx(RefreshCw,{
              className:"h-3.5 w-3.5"
            }),"Clear All Filters"]
          })]
        }):jsxs("div",{
          children:[
            jsx("div",{
              id:"listings-grid",
              className: isCarousel ? "flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" : "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4",
              children:t.slice(0, visibleCount).map(a=>jsx("div", { className: isCarousel ? "shrink-0 w-[240px] sm:w-[280px] snap-start" : "", children: jsx(ax,{
                listing:a,onClick:()=>s(a.id),onNavigate:nav
              },a.id)}, a.id))
            }),
            t.length > 8 && jsxs("div",{
              className:"mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800",
              children:[
                visibleCount < t.length ? jsxs("button",{
                  type:"button",
                  onClick:()=>setVisibleCount(prev=>Math.min(prev+8, t.length)),
                  className:"btn bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs hover:border-primary-500 transition-all flex items-center gap-2",
                  children:[
                    `Load Next 8 Equipment (${t.length - visibleCount} more)`,
                    jsx(ChevronDown,{ className:"h-4 w-4 text-primary-500" })
                  ]
                }) : null,
                visibleCount < t.length ? jsxs("button",{
                  type:"button",
                  onClick:()=>setVisibleCount(t.length),
                  className:"btn-primary px-6 py-2.5 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2",
                  children:[
                    `Explore All ${n || t.length} Ads`,
                    jsx(ArrowRight,{ className:"h-4 w-4" })
                  ]
                }) : jsxs("button",{
                  type:"button",
                  onClick:()=>{
                    setVisibleCount(8);
                    const el = document.getElementById("listings");
                    el && el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  className:"btn-ghost text-xs px-5 py-2 flex items-center gap-1.5",
                  children:[
                    "Show Less (First 8)",
                    jsx(ChevronDown,{ className:"h-3.5 w-3.5 rotate-180" })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  })
}

const FOOTER_PAGES_KEYS = [
  "about", "careers", "press", "blog",
  "buy-solar", "sell-solar", "how-it-works", "pricing",
  "help", "contact", "safety", "report-issue",
  "terms", "privacy", "cookies", "disclaimer"
];

const ux={
  "Solar Marketplace":[
    { label: "Today's Solar Rates", page: "prices" },
    { label: "Tier-1 Panels Verification", page: "verification" },
    { label: "Solar Panels", page: "solar-panels" },
    { label: "Solar Inverter", page: "solar-inverter" },
    { label: "Solar Batteries", page: "solar-batteries" },
    { label: "Used Solar Deals", page: "used-solar" },
    { label: "Verified Dealers", page: "dealers" }
  ],
  "Tools & Services":[
    { label: "Tier-1 Authenticity Check", page: "verification" },
    { label: "Solar Load Calculator", page: "calculator" },
    { label: "Turnkey Installation", page: "install" },
    { label: "How It Works", page: "how-it-works" },
    { label: "Pricing & Plans", page: "pricing" },
    { label: "Safety Tips", page: "safety" }
  ],
  "Company & Support":[
    { label: "About SellSolar", page: "about" },
    { label: "Contact Us", page: "contact" },
    { label: "Help Center", page: "help" },
    { label: "Careers", page: "careers" },
    { label: "Blog & Guides", page: "blog" },
    { label: "Report an Issue", page: "report-issue" }
  ],
  "Legal & Privacy":[
    { label: "Terms of Service", page: "terms" },
    { label: "Privacy Policy", page: "privacy" },
    { label: "Cookie Policy", page: "cookies" },
    { label: "Disclaimer", page: "disclaimer" }
  ]
};

const PAKISTAN_SOLAR_CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot", "Sargodha", "Bahawalpur"
];

function hx({
  onPostAd: t,
  onNavigate: navigate
}){
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const { settings } = useSiteSettings();

  const supportEmail = settings?.supportEmail || "info@sellsolar.pk";
  const supportPhone = settings?.supportPhone || "+92 300 1234567";
  const supportPhoneStr = String(supportPhone);
  const officeAddress = settings?.headOfficeAddress || "Sector G-7, Blue Area, Islamabad, Pakistan";
  const copyrightText = settings?.copyrightText || "© 2026 SellSolar Pakistan. All rights reserved.";
  const aboutText = settings?.footerAboutText || "Pakistan's #1 marketplace for solar panels, on-grid & hybrid inverters, lithium batteries, and turnkey solar installations. Buy and sell with total confidence.";

  const rawWa = String(settings?.whatsAppNumber || "923001234567").replace(/\D/g, "");
  const waUrl = `https://wa.me/${rawWa}?text=${encodeURIComponent("Assalam-o-Alaikum, I am inquiring about solar equipment on SellSolar.pk")}`;

  const socialLinksList = [
    { label: "WhatsApp Support", href: waUrl, Icon: MessageCircle, isExternal: true },
    settings?.socialLinks?.facebook ? { label: "Facebook", href: settings.socialLinks.facebook, Icon: Facebook, isExternal: true } : null,
    settings?.socialLinks?.instagram ? { label: "Instagram", href: settings.socialLinks.instagram, Icon: Instagram, isExternal: true } : null,
    settings?.socialLinks?.linkedin ? { label: "LinkedIn", href: settings.socialLinks.linkedin, Icon: Linkedin, isExternal: true } : null,
    settings?.socialLinks?.youtube ? { label: "YouTube", href: settings.socialLinks.youtube, Icon: Youtube, isExternal: true } : null,
    settings?.socialLinks?.twitter ? { label: "Twitter / X", href: settings.socialLinks.twitter, Icon: Twitter, isExternal: true } : null,
    { label: "Email Support", href: `mailto:${supportEmail}`, Icon: Mail, isEmail: true },
  ].filter(Boolean);

  const handleNav = (page) => {
    if (navigate) {
      navigate(page);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return jsxs("footer", {
    id: "contact",
    className: "bg-gray-950 text-gray-400 border-t border-gray-800/80 pb-28 sm:pb-24 md:pb-8 transition-colors",
    children: [
      jsx(EmailContactModal, {
        isOpen: emailModalOpen,
        onClose: () => setEmailModalOpen(false),
        recipientEmail: supportEmail,
        defaultSubject: "Inquiry via SellSolar.pk",
        onNavigateToContactForm: () => {
          if (navigate) {
            navigate("contact");
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        }
      }),



      /* Main Footer Navigation Columns */
      jsxs("div", {
        className: "container-page py-6 sm:py-8",
        children: [
          jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10",
            children: [
              /* Col 1 & 2: Brand & Contact Info */
              jsxs("div", {
                className: "sm:col-span-2",
                children: [
                  jsxs("div", {
                    className: "flex items-center gap-2.5",
                    children: [
                      jsx("div", {
                        className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-amber-500 shadow-sm shadow-primary-500/30",
                        children: jsx(Sun, { className: "h-5 w-5 text-white", strokeWidth: 2.5 })
                      }),
                      jsxs("div", {
                        children: [
                          jsxs("span", {
                            className: "text-xl font-black text-white tracking-tight",
                            children: [
                              "Sell",
                              jsx("span", { className: "text-primary-400", children: "Solar" }),
                              jsx("span", { className: "text-xs text-amber-400 font-bold ml-1", children: ".pk" })
                            ]
                          }),
                          jsx("p", {
                            className: "text-[10px] text-gray-400 font-semibold tracking-wide",
                            children: "پاکستان کا سب سے بڑا سولر پلیٹ فارم"
                          })
                        ]
                      })
                    ]
                  }),
                  jsx("p", {
                    className: "mt-4 max-w-sm text-xs sm:text-sm text-gray-400 leading-relaxed",
                    children: aboutText
                  }),

                  /* Direct Contact Details */
                  jsxs("div", {
                    className: "mt-6 space-y-2.5 text-xs sm:text-sm",
                    children: [
                      /* WhatsApp direct link (Hidden per user request) */
                      jsxs("a", {
                        href: waUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "hidden",
                        children: [
                          jsx(MessageCircle, { className: "h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" }),
                          jsxs("span", {
                            children: [
                              "WhatsApp: ",
                              jsx("span", { className: "font-semibold text-white", children: settings?.whatsAppDisplayNumber || supportPhoneStr })
                            ]
                          })
                        ]
                      }),
                      /* Email Modal Trigger */
                      jsxs("button", {
                        type: "button",
                        onClick: () => setEmailModalOpen(true),
                        className: "flex items-center gap-2.5 text-gray-300 hover:text-primary-400 transition-colors cursor-pointer text-left group",
                        children: [
                          jsx(Mail, { className: "h-4 w-4 text-primary-400 group-hover:scale-110 transition-transform shrink-0" }),
                          jsx("span", { className: "group-hover:underline", children: supportEmail })
                        ]
                      }),
                      /* Phone Call (Hidden per user request) */
                      jsxs("a", {
                        href: `tel:${supportPhoneStr.replace(/\s+/g, "")}`,
                        className: "hidden",
                        children: [
                          jsx(Phone, { className: "h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" }),
                          jsx("span", { children: supportPhoneStr })
                        ]
                      }),
                      /* Office Location */
                      jsxs("p", {
                        className: "flex items-start gap-2.5 text-gray-400",
                        children: [
                          jsx(MapPin, { className: "h-4 w-4 text-gray-500 shrink-0 mt-0.5" }),
                          jsx("span", { children: officeAddress })
                        ]
                      })
                    ]
                  })
                ]
              }, "brand-contact-info"),

              /* Navigation Link Columns */
              ...Object.entries(ux).map(([sectionTitle, links]) =>
                jsxs("div", {
                  children: [
                    jsx("h4", {
                      className: "mb-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white",
                      children: sectionTitle
                    }),
                    jsx("ul", {
                      className: "space-y-2 text-xs sm:text-sm",
                      children: links.map((item, idx) =>
                        jsx("li", {
                          children: jsx("a", {
                            href: `/${item.page}`,
                            onClick: (ev) => {
                              ev.preventDefault();
                              handleNav(item.page);
                            },
                            className: "text-gray-400 hover:text-white transition-colors cursor-pointer inline-block py-0.5",
                            children: item.label
                          })
                        }, `footer-link-${sectionTitle}-${item.page || item.label}-${idx}`)
                      )
                    })
                  ]
                }, `footer-col-${sectionTitle}`)
              )
            ]
          }),

          /* Solar Cities Strip */
          jsxs("div", {
            className: "mt-10 pt-6 border-t border-gray-800/60",
            children: [
              jsxs("div", {
                className: "text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5",
                children: [
                  jsx(MapPin, { className: "h-3.5 w-3.5 text-primary-400" }),
                  "Solar Equipment in Popular Pakistani Cities:"
                ]
              }),
              jsx("div", {
                className: "flex flex-wrap gap-1.5",
                children: PAKISTAN_SOLAR_CITIES.map((city, cIdx) =>
                  jsx("button", {
                    type: "button",
                    onClick: () => handleNav("home"),
                    className: "px-2.5 py-1 rounded-lg text-xs bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-primary-400 border border-gray-800/80 transition-all cursor-pointer",
                    children: city
                  }, `city-tag-${city}-${cIdx}`)
                )
              })
            ]
          }),

          /* Bottom Bar: Copyright, Social Icons, Back to Top */
          jsxs("div", {
            className: "mt-8 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400",
            children: [
              jsxs("div", {
                className: "flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 text-center sm:text-left",
                children: [
                  jsx("p", { children: copyrightText }),
                  jsx("span", { className: "hidden sm:inline text-gray-700", children: "•" }),
                  jsx("p", {
                    className: "text-[11px] text-gray-400",
                    children: "Made with pride in Pakistan 🇵🇰"
                  })
                ]
              }),

              /* Social Media Buttons */
              jsx("div", {
                className: "flex items-center gap-2",
                children: socialLinksList.map(({ label, href, Icon, isEmail }, sIdx) =>
                  jsx("a", {
                    href,
                    onClick: (ev) => {
                      if (isEmail) {
                        ev.preventDefault();
                        setEmailModalOpen(true);
                      }
                    },
                    target: isEmail ? undefined : "_blank",
                    rel: isEmail ? undefined : "noopener noreferrer",
                    "aria-label": label,
                    title: label,
                    className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-primary-600 transition-all cursor-pointer active:scale-95",
                    children: Icon ? jsx(Icon, { className: "h-4 w-4" }) : null
                  }, `social-btn-${label}-${sIdx}`)
                )
              }),

              /* Back to top button */
              jsxs("button", {
                type: "button",
                id: "footer-back-to-top-btn",
                onClick: () => {
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                },
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-all cursor-pointer text-xs font-semibold active:scale-95",
                title: "Scroll back to the top of the page",
                children: [
                  jsx(ArrowUp, { className: "h-3.5 w-3.5 text-primary-400" }),
                  "Back to Top"
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}function Wu(t){
  const e=t instanceof Error?t.message.toLowerCase():"";
  return e.includes("invalid login")||e.includes("invalid credentials")?"Incorrect email or password. Please try again.":e.includes("user already registered")||e.includes("already been registered")?"An account with this email already exists. Try logging in instead.":e.includes("email_rate_limit")||e.includes("rate limit")?"Too many attempts. Please wait a moment and try again.":e.includes("email not confirmed")?"Please check your email and confirm your account before logging in.":e.includes("unable to validate email")||e.includes("invalid email")||e.includes("email address")&&e.includes("invalid")?"Please enter a valid email address.":t instanceof Error&&t.message?t.message:"Something went wrong. Please try again."
}function isValidEmail(t){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(t||"").trim())
}function Bn(props){
  return jsx(AuthPage,props)
}function mx({
  onBack:t
}){
  const[e,r]=useState([]),[n,s]=useState(!0),[a,l]=useState(""),[o,c]=useState(""),[u,d]=useState(!1);
  return useEffect(()=>{
    (async()=>{
      s(!0);
      let p=supabase.from("profiles").select("*").eq("account_type","dealer").order("is_verified_dealer",{
        ascending:!1
      }).order("created_at",{
        ascending:!1
      });
      o&&(p=p.eq("city",o)),u&&(p=p.eq("is_verified_dealer",!0)),a&&(p=p.or(`full_name.ilike.%${a}%,business_name.ilike.%${a}%`));
      const{
        data:y,error:w
      }=await p.limit(50);
      w?console.error("Error fetching dealers:",w.message):r(y||[]),s(!1)
    })()
  },[a,o,u]),jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:t,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsx("button",{
          onClick:t,className:"text-sm font-semibold text-gray-600 hover:text-gray-900",children:"Back to Home"
        })]
      })
    }),jsxs("div",{
      className:"container-page py-8 lg:py-12",children:[jsxs("div",{
        className:"mb-8",children:[jsxs("div",{
          className:"mb-2 flex items-center gap-2 text-sm font-semibold text-primary-600",children:[jsx(Users,{
            className:"h-4 w-4"
          }),"Dealer Directory"]
        }),jsx("h1",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl",children:"Verified Solar Dealers"
        }),jsx("p",{
          className:"mt-2 text-gray-500",children:"Browse trusted solar equipment dealers across Pakistan. Verified dealers have confirmed business details and CNIC."
        })]
      }),jsx("div",{
        className:"card mb-8 p-4",children:jsxs("div",{
          className:"grid grid-cols-1 gap-3 sm:grid-cols-3",children:[jsxs("div",{
            className:"relative",children:[jsx(Search,{
              className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            }),jsx("input",{
              type:"text",placeholder:"Search by name or business...",value:a,onChange:h=>l(h.target.value),className:"input-field pl-11"
            })]
          }),jsx("div",{
            children:jsxs("select",{
              value:o,onChange:h=>c(h.target.value),className:"select-field",children:[jsx("option",{
                value:"",children:"All Cities"
              }),CITIES.map(h=>jsx("option",{
                value:h,children:h
              },h))]
            })
          }),jsxs("button",{
            onClick:()=>d(!u),className:`btn justify-center ${u?"bg-secondary-500 text-white hover:bg-secondary-600":"bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"}`,children:[jsx(BadgeCheck,{
              className:"h-5 w-5"
            }),u?"Verified Only":"All Dealers"]
          })]
        })
      }),n?jsxs("div",{
        className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
          className:"h-10 w-10 animate-spin text-primary-500"
        }),jsx("p",{
          className:"mt-4 text-sm text-gray-500",children:"Loading dealers..."
        })]
      }):e.length===0?jsxs("div",{
        className:"flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center ring-1 ring-gray-200",children:[jsx(Users,{
          className:"h-16 w-16 text-gray-300"
        }),jsx("p",{
          className:"mt-4 text-lg font-semibold text-gray-700",children:"No dealers found"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Try adjusting your search or filters."
        })]
      }):jsx("div",{
        className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",children:e.map(h=>jsxs("div",{
          className:"card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",children:[jsxs("div",{
            className:"flex items-start justify-between",children:[jsx("div",{
              className:"flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/20",children:jsx(Store,{
                className:"h-7 w-7 text-white"
              })
            }),h.is_verified_dealer&&jsxs("span",{
              className:"flex items-center gap-1 rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-700",children:[jsx(BadgeCheck,{
                className:"h-3.5 w-3.5"
              }),"Verified"]
            })]
          }),jsx("h3",{
            className:"mt-4 text-lg font-bold text-gray-900",children:h.business_name||h.full_name
          }),jsx("p",{
            className:"text-sm text-gray-500",children:h.full_name
          }),jsxs("div",{
            className:"mt-3 space-y-1.5 text-sm text-gray-600",children:[h.city&&jsxs("div",{
              className:"flex items-center gap-2",children:[jsx(MapPin,{
                className:"h-4 w-4 text-gray-400"
              }),h.city]
            }),h.phone&&jsxs("div",{
              className:"flex items-center gap-2",children:[jsx(Phone,{
                className:"h-4 w-4 text-gray-400"
              }),h.phone]
            }),h.business_address&&jsxs("div",{
              className:"flex items-start gap-2",children:[jsx(Store,{
                className:"h-4 w-4 mt-0.5 text-gray-400 shrink-0"
              }),jsx("span",{
                className:"line-clamp-2",children:h.business_address
              })]
            })]
          }),h.cnic&&jsxs("div",{
            className:"mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400",children:["CNIC: ",h.cnic.slice(0,5),"••••••",h.cnic.slice(-1)]
          }),h.phone&&jsxs("div",{
            className:"mt-4 pt-3 border-t border-gray-100 flex items-center gap-2",
            children:[
              jsx("a",{
                href:`tel:${h.phone}`,
                className:"btn-outline flex-1 text-xs py-2 font-bold justify-center flex items-center gap-1.5",
                children:[jsx(Phone,{ className:"h-3.5 w-3.5" }),"Call"]
              }),
              jsx("a",{
                href:`https://wa.me/${(h.phone.replace(/[^0-9]/g, '').startsWith('0') ? '92' + h.phone.replace(/[^0-9]/g, '').slice(1) : (h.phone.replace(/[^0-9]/g, '').startsWith('92') ? h.phone.replace(/[^0-9]/g, '') : '92' + h.phone.replace(/[^0-9]/g, '')))}?text=${encodeURIComponent(`Salam! I found your dealership "${h.business_name || h.full_name}" on SellSolar.pk.`)}`,
                target:"_blank",
                rel:"noopener noreferrer",
                className:"btn flex-1 text-xs py-2 font-bold justify-center flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs",
                children:[jsx(MessageCircle,{ className:"h-3.5 w-3.5 fill-white" }),"WhatsApp"]
              })
            ]
          })]
        },h.id))
      })]
    })]
  })
}const px=["panel","inverter","battery","complete_system"],gx=["new","used"];
function yx({
  onBack:t,onPosted:e
}){
  const{
    profile:r,user:seller
  }=useAuth(),[n,s]=useState(!1),[a,l]=useState(null),[o,c]=useState(!1),[u,d]=useState(""),[h,p]=useState(""),[y,w]=useState("panel"),[j,C]=useState("used"),[g,f]=useState(""),[m,v]=useState((r==null?void 0:r.city)||""),[k,x]=useState(""),[S,L]=useState(""),[z,I]=useState(""),[Y,ke]=useState(""),[ye,Be]=useState((r==null?void 0:r.full_name)||""),[le,We]=useState((r==null?void 0:r.phone)||""),[uploadedFiles,setUploadedFiles]=useState([]),[uploadNotice,setUploadNotice]=useState(""),Xe=async()=>{
    if(l(null),!u.trim()||!h.trim()||!g.trim()||!m.trim()){
      l("Please fill in all required fields (title, brand, price, city)");
      return
    }if(le&&!isValidPhone(le)){
      l("Phone number must be exactly 11 digits.");
      return
    }const _=parseFloat(g);
    if(isNaN(_)||_<=0){
      l("Please enter a valid positive price in PKR");
      return
    }if(k&&(isNaN(parseFloat(k))||parseFloat(k)<0)){
      l("Capacity must be a positive number in kW");
      return
    }s(!0);
    setUploadNotice("");
    try{
      let finalCover = z.trim() || null;
      let finalImageUrls = [];
      if (uploadedFiles.length > 0) {
        setUploadNotice("Compressing & preparing photos...");
        try {
          const urls = await uploadListingPhotos(supabase, seller?.id, uploadedFiles);
          if (urls.length > 0) {
            finalCover = urls[0];
            finalImageUrls = urls;
          }
        } catch (photoErr) {
          console.warn("Photo upload notice:", photoErr);
        }
      }

      const safeUserId = (seller?.id && isValidUuid(seller.id)) ? seller.id : ((seller?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) ? DEFAULT_ADMIN_ID : null);

      const newListing = {
        id: 'cust-' + Date.now(),
        user_id: safeUserId,
        title: u.trim(),
        brand: h.trim(),
        category: y,
        condition: j,
        price: _,
        city: m.trim(),
        capacity_kw: k ? parseFloat(k) : null,
        warranty_years: S !== null && S !== "" && !isNaN(Number(S)) ? parseFloat(Number(S).toFixed(4)) : null,
        image_url: finalCover,
        image_urls: finalImageUrls.length > 0 ? finalImageUrls : (finalCover ? [finalCover] : []),
        description: Y.trim() || null,
        featured: false,
        seller_name: ye.trim() || (r == null ? void 0 : r.full_name) || "Solar Seller",
        seller_phone: le.trim() || (r == null ? void 0 : r.phone) || null,
        views: 0,
        status: "approved",
        is_sold: false,
        created_at: new Date().toISOString()
      };
      try {
        const raw = localStorage.getItem("sellsolar_custom_listings");
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(newListing);
        localStorage.setItem("sellsolar_custom_listings", JSON.stringify(list));
      } catch (err) {}

      try {
        const{
          error:A
        }=await supabase.from("solar_listings").insert({
          user_id: safeUserId,title:u.trim(),brand:h.trim(),category:y,condition:j,price:_,city:m.trim(),capacity_kw:k?parseFloat(k):null,warranty_years:S !== null && S !== "" && !isNaN(Number(S)) ? parseFloat(Number(S).toFixed(4)) : null,image_url:finalCover,image_urls:finalImageUrls.length > 0 ? finalImageUrls : (finalCover ? [finalCover] : []),description:Y.trim()||null,featured:!1,seller_name:ye.trim()||(r==null?void 0:r.full_name)||null,seller_phone:le.trim()||(r==null?void 0:r.phone)||null,views:0,status:"approved",is_sold:!1
        });
        if(A)console.warn("Supabase insert notice:", A);
      } catch(err) {
        console.warn("Supabase insert error:", err);
      }
      c(!0),setTimeout(()=>{
        e()
      },2e3)
    }catch(A){
      l(A instanceof Error?A.message:"Failed to post ad. Please try again.")
    }finally{
      s(!1)
    }
  };
  return o?jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsx("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:jsxs("div",{
        className:"card max-w-md p-8 text-center",children:[jsx("div",{
          className:"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100",children:jsx(CircleCheck,{
            className:"h-8 w-8 text-secondary-600"
          })
        }),jsx("h2",{
          className:"mt-4 text-2xl font-extrabold text-gray-900",children:"Ad Posted Successfully!"
        }),jsx("p",{
          className:"mt-2 text-sm text-gray-500",children:"Your listing is now live on SellSolar. Buyers can find it in the listings section."
        }),jsx("p",{
          className:"mt-4 text-xs text-gray-400",children:"Redirecting to home..."
        })]
      })
    })
  }):jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:t,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsxs("button",{
          onClick:t,className:"flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Home"]
        })]
      })
    }),jsx("div",{
      className:"container-page py-8 lg:py-12",children:jsxs("div",{
        className:"mx-auto max-w-2xl",children:[jsx("h1",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900",children:"Post a New Ad"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Fill in the details below to list your solar equipment for sale."
        }),jsx("div",{
          className:"card mt-6 p-6 sm:p-8",children:jsxs("div",{
            className:"space-y-5",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Ad Title *"
              }),jsx("input",{
                type:"text",value:u,onChange:_=>d(_.target.value),placeholder:"e.g. Longi 550W Monocrystalline Solar Panel",className:"input-field"
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Category *"
                }),jsxs("div",{
                  className:"relative",children:[jsx(Tag,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10"
                  }),jsx("select",{
                    value:y,onChange:_=>w(_.target.value),className:"select-field pl-11",children:px.map(_=>jsx("option",{
                      value:_,children:CATEGORIES[_]
                    },_))
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Condition *"
                }),jsx("div",{
                  className:"flex gap-2",children:gx.map(_=>jsx("button",{
                    type:"button",
                    onClick:()=>C(_),className:`flex-1 rounded-xl border-2 py-3 text-sm font-semibold capitalize transition-all ${j===_?"border-primary-500 bg-primary-50 text-primary-700":"border-gray-200 text-gray-600 hover:border-gray-300"}`,children:_
                  },_))
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Brand *"
                }),jsxs("select",{
                  value:h,onChange:_=>p(_.target.value),className:"select-field",children:[jsx("option",{
                    value:"",children:"Select brand"
                  }),BRANDS.map(_=>jsx("option",{
                    value:_,children:_
                  },_)),jsx("option",{
                    value:"Other",children:"Other"
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Price (PKR) *"
                }),jsxs("div",{
                  className:"relative",children:[jsx("span",{
                    className:"absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-black text-gray-700 dark:text-gray-200 select-none",children:"PKR"
                  }),jsx("input",{
                    type:"number",min:"0",step:"any",onKeyDown:T=>{if(T.key==='-'||T.key==='e'||T.key==='+')T.preventDefault()},value:g,onChange:_=>{
                      const v=_.target.value;
                      if(v===""||(!isNaN(v)&&Number(v)>=0))f(v);
                    },placeholder:"e.g. 18500",className:"input-field pl-16 font-semibold"
                  })]
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"City *"
                }),jsxs("div",{
                  className:"relative",children:[jsx(MapPin,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10"
                  }),jsxs("select",{
                    value:m,onChange:_=>v(_.target.value),className:"select-field pl-11",children:[jsx("option",{
                      value:"",children:"Select city"
                    }),CITIES.map(_=>jsx("option",{
                      value:_,children:_
                    },_))]
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Capacity (kW)"
                }),jsxs("div",{
                  className:"relative",children:[jsx(Zap,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-500"
                  }),jsx("input",{
                    type:"number",min:"0",step:"any",onKeyDown:T=>{if(T.key==='-'||T.key==='e'||T.key==='+')T.preventDefault()},value:k,onChange:_=>{
                      const v=_.target.value;
                      if(v===""||(!isNaN(v)&&Number(v)>=0))x(v);
                    },placeholder:"e.g. 0.55",className:"input-field pl-11 font-semibold"
                  })]
                })]
              })]
            }),jsx("div",{
              className:"rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4",children:jsx(WarrantySelector,{
                value:S,onChange:val=>L(val)
              })
            }),jsx("div",{
              className:"rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4",children:jsx(ListingPhotoUploader,{
                files:uploadedFiles,onChange:setUploadedFiles,disabled:n
              })
            }),jsxs("details",{
              className:"group text-xs text-gray-500",children:[jsx("summary",{
                className:"cursor-pointer font-semibold hover:text-gray-700 dark:hover:text-gray-300 select-none",children:"Or enter image link manually / quick upload"
              }),jsxs("div",{
                className:"mt-2 flex items-center gap-2",children:[jsxs("div",{
                  className:"relative flex-1",children:[jsx(Image,{
                    className:"absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  }),jsx("input",{
                    type:"text",value:z,onChange:_=>I(_.target.value),placeholder:"https://... or upload file directly",className:"input-field pl-10 text-xs"
                  })]
                }),jsxs("label",{
                  className:"px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs",title:"Upload single image",children:[jsx(Upload,{
                    className:"h-3.5 w-3.5 text-primary-600 dark:text-primary-400"
                  }),jsx("span",{children:"Upload"}),jsx("input",{
                    type:"file",accept:"image/jpeg,image/png,image/webp,image/jpg",className:"hidden",onChange:e=>{
                      const f=e.target.files?.[0];
                      if(!f)return;
                      const r=new FileReader();
                      r.onload=ev=>{if(ev.target?.result)I(ev.target.result)};
                      r.readAsDataURL(f);
                      e.target.value='';
                    }
                  })]
                })]
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Description"
              }),jsx("textarea",{
                value:Y,onChange:_=>ke(_.target.value),rows:4,placeholder:"Describe your product, condition, features...",className:"input-field resize-none"
              })]
            }),a&&jsxs("div",{
              className:"flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
                className:"h-4 w-4 shrink-0 mt-0.5"
              }),jsx("span",{
                children:a
              })]
            }),jsx("button",{
              onClick:Xe,disabled:n,className:"btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed",children:n?jsxs(Fragment,{
                children:[jsx(LoaderCircle,{
                  className:"h-5 w-5 animate-spin"
                }),uploadNotice||"Posting Ad..."]
              }):"Post Ad"
            })]
          })
        })]
      })
    })]
  })
}function xx({
  onBack:t
}){
  const{
    profile:e
  }=useAuth(),[r,n]=useState("users"),[s,a]=useState([]),[l,o]=useState([]),[c,u]=useState(!0),[d,h]=useState(null),[p,y]=useState(null),w=(e==null?void 0:e.is_admin)===!0,j=useCallback(async()=>{
    const{
      data:x,error:S
    }=await supabase.from("profiles").select("*").order("created_at",{
      ascending:!1
    });
    S?h(S.message):a(x||[])
  },[]),C=useCallback(async()=>{
    const{
      data:x,error:S
    }=await supabase.from("solar_listings").select("*").order("created_at",{
      ascending:!1
    });
    S?h(S.message):o(x||[])
  },[]);
  useEffect(()=>{
    if(!w){
      u(!1);
      return
    }u(!0),h(null),Promise.all([j(),C()]).finally(()=>u(!1))
  },[w,j,C]);
  const g=async x=>{
    y(x);
    const{
      error:S
    }=await supabase.rpc("admin_verify_dealer",{
      target_user_id:x
    });
    S?h(S.message):a(L=>L.map(z=>z.id===x?{
      ...z,is_verified_dealer:!0
    }:z)),y(null)
  },f=async x=>{
    if(!confirm("Are you sure you want to delete this listing?"))return;
    y(x);
    const{
      error:S
    }=await supabase.rpc("admin_delete_listing",{
      listing_id:x
    });
    S?h(S.message):o(L=>L.filter(z=>z.id!==x)),y(null)
  },m=async x=>{
    if(!confirm("Are you sure you want to delete this user profile? This cannot be undone."))return;
    y(x);
    const{
      error:S
    }=await supabase.rpc("admin_delete_profile",{
      target_user_id:x
    });
    S?h(S.message):a(L=>L.filter(z=>z.id!==x)),y(null)
  };
  if(!w)return jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsx("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:jsxs("div",{
        className:"card max-w-md p-8 text-center",children:[jsx("div",{
          className:"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100",children:jsx(ShieldCheck,{
            className:"h-8 w-8 text-error-600"
          })
        }),jsx("h2",{
          className:"mt-4 text-2xl font-extrabold text-gray-900",children:"Access Denied"
        }),jsx("p",{
          className:"mt-2 text-sm text-gray-500",children:"You need admin privileges to access this page."
        }),jsxs("button",{
          onClick:t,className:"btn-ghost mt-6",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Home"]
        })]
      })
    })
  });
  const v=s.filter(x=>x.account_type==="dealer");
  s.filter(x=>x.account_type==="individual");
  const k=[{
    id:"users",label:"All Users",icon:Users,count:s.length
  },{
    id:"dealers",label:"Dealers",icon:Store,count:v.length
  },{
    id:"listings",label:"Listings",icon:Tag,count:l.length
  }];
  return jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:t,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          }),jsx("span",{
            className:"ml-2 rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-bold text-error-700",children:"Admin"
          })]
        }),jsxs("button",{
          onClick:t,className:"flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Home"]
        })]
      })
    }),jsxs("div",{
      className:"container-page py-8 lg:py-12",children:[jsxs("div",{
        className:"mb-8",children:[jsxs("div",{
          className:"mb-2 flex items-center gap-2 text-sm font-semibold text-error-600",children:[jsx(ShieldCheck,{
            className:"h-4 w-4"
          }),"Admin Dashboard"]
        }),jsx("h1",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900",children:"Manage Users & Listings"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Verify dealers, manage user accounts, and moderate listings."
        })]
      }),jsx("div",{
        className:"mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4",children:[{
          label:"Total Users",value:s.length,icon:Users,color:"text-accent-500 bg-accent-50"
        },{
          label:"Dealers",value:v.length,icon:Store,color:"text-primary-500 bg-primary-50"
        },{
          label:"Verified",value:v.filter(x=>x.is_verified_dealer).length,icon:BadgeCheck,color:"text-secondary-500 bg-secondary-50"
        },{
          label:"Listings",value:l.length,icon:Tag,color:"text-warning-500 bg-warning-50"
        }].map(x=>{
          const S=x.icon;
          return jsxs("div",{
            className:"card p-4",children:[jsx("div",{
              className:`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${x.color}`,children:jsx(S,{
                className:"h-5 w-5"
              })
            }),jsx("div",{
              className:"text-2xl font-extrabold text-gray-900",children:x.value
            }),jsx("div",{
              className:"text-xs font-medium text-gray-500",children:x.label
            })]
          },x.label)
        })
      }),d&&jsxs("div",{
        className:"mb-6 flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
          className:"h-4 w-4 shrink-0 mt-0.5"
        }),jsx("span",{
          children:d
        }),jsx("button",{
          onClick:()=>h(null),className:"ml-auto text-error-400 hover:text-error-600",children:"×"
        })]
      }),jsx("div",{
        className:"mb-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 scrollbar-hide",children:k.map(x=>{
          const S=x.icon;
          return jsxs("button",{
            onClick:()=>n(x.id),className:`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${r===x.id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`,children:[jsx(S,{
              className:"h-4 w-4"
            }),x.label,jsx("span",{
              className:"rounded-full bg-gray-200 px-2 py-0.5 text-xs",children:x.count
            })]
          },x.id)
        })
      }),c?jsxs("div",{
        className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
          className:"h-10 w-10 animate-spin text-primary-500"
        }),jsx("p",{
          className:"mt-4 text-sm text-gray-500",children:"Loading data..."
        })]
      }):r==="listings"?jsx("div",{
        className:"space-y-3",children:l.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No listings found."
        }):l.map(x=>jsxs("div",{
          className:"card flex items-center gap-4 p-4",children:[jsx("div",{
            className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:x.image_url?jsx("img",{
              src:x.image_url,alt:x.title,className:"h-full w-full object-cover"
            }):jsx("div",{
              className:"flex h-full items-center justify-center",children:jsx(Tag,{
                className:"h-6 w-6 text-gray-300"
              })
            })
          }),jsxs("div",{
            className:"min-w-0 flex-1",children:[jsx("h3",{
              className:"truncate text-sm font-bold text-gray-900",children:x.title
            }),jsxs("div",{
              className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
                className:"font-semibold text-primary-600",children:CATEGORIES[x.category]
              }),jsx("span",{
                children:"•"
              }),jsx("span",{
                children:x.brand
              }),jsx("span",{
                children:"•"
              }),jsx("span",{
                children:x.city
              }),jsx("span",{
                children:"•"
              }),jsx("span",{
                className:"font-bold text-gray-700",children:formatPrice(x.price)
              }),x.featured&&jsxs(Fragment,{
                children:[jsx("span",{
                  children:"•"
                }),jsx("span",{
                  className:"rounded-full bg-primary-100 px-2 py-0.5 font-semibold text-primary-700",children:"Featured"
                })]
              })]
            })]
          }),jsx("button",{
            onClick:()=>f(x.id),disabled:p===x.id,className:"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-error-500 transition-colors hover:bg-error-50 disabled:opacity-50",children:p===x.id?jsx(LoaderCircle,{
              className:"h-4 w-4 animate-spin"
            }):jsx(Trash2,{
              className:"h-4 w-4"
            })
          })]
        },x.id))
      }):jsx("div",{
        className:"space-y-3",children:(r==="dealers"?v:s).length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:r==="dealers"?"No dealers found.":"No users found."
        }):(r==="dealers"?v:s).map(x=>jsx("div",{
          className:"card p-4",children:jsxs("div",{
            className:"flex items-start gap-4",children:[jsx("div",{
              className:"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600",children:x.account_type==="dealer"?jsx(Store,{
                className:"h-6 w-6 text-white"
              }):jsx("span",{
                className:"text-lg font-bold text-white",children:x.full_name.charAt(0).toUpperCase()
              })
            }),jsxs("div",{
              className:"min-w-0 flex-1",children:[jsxs("div",{
                className:"flex flex-wrap items-center gap-2",children:[jsx("h3",{
                  className:"text-sm font-bold text-gray-900",children:x.business_name||x.full_name
                }),x.account_type==="dealer"&&jsx("span",{
                  className:"rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700",children:"Dealer"
                }),x.is_verified_dealer&&jsxs("span",{
                  className:"flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700",children:[jsx(BadgeCheck,{
                    className:"h-3 w-3"
                  }),"Verified"]
                }),x.is_admin&&jsxs("span",{
                  className:"flex items-center gap-1 rounded-full bg-error-100 px-2 py-0.5 text-xs font-semibold text-error-700",children:[jsx(ShieldCheck,{
                    className:"h-3 w-3"
                  }),"Admin"]
                })]
              }),jsxs("div",{
                className:"mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500",children:[x.city&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(MapPin,{
                    className:"h-3 w-3"
                  }),x.city]
                }),x.phone&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(Phone,{
                    className:"h-3 w-3"
                  }),x.phone]
                }),x.cnic&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(CreditCard,{
                    className:"h-3 w-3"
                  }),x.cnic]
                }),x.business_address&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(Store,{
                    className:"h-3 w-3"
                  }),x.business_address]
                })]
              }),x.visiting_card_url&&jsxs("a",{
                href:x.visiting_card_url,target:"_blank",rel:"noopener noreferrer",className:"mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700",children:[jsx(Eye,{
                  className:"h-3 w-3"
                }),"View Visiting Card"]
              })]
            }),jsxs("div",{
              className:"flex shrink-0 items-center gap-2",children:[x.account_type==="dealer"&&!x.is_verified_dealer&&jsxs("button",{
                onClick:()=>g(x.id),disabled:p===x.id,className:"flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50",children:[p===x.id?jsx(LoaderCircle,{
                  className:"h-3.5 w-3.5 animate-spin"
                }):jsx(BadgeCheck,{
                  className:"h-3.5 w-3.5"
                }),"Verify"]
              }),!x.is_admin&&jsx("button",{
                onClick:()=>m(x.id),disabled:p===x.id,className:"flex h-9 w-9 items-center justify-center rounded-lg text-error-500 transition-colors hover:bg-error-50 disabled:opacity-50",children:p===x.id?jsx(LoaderCircle,{
                  className:"h-4 w-4 animate-spin"
                }):jsx(Trash2,{
                  className:"h-4 w-4"
                })
              })]
            })]
          })
        },x.id))
      })]
    })]
  })
}function Df({
  navItems:t,activeTab:e,onTabChange:r,onBack:n,badgeColor:s="bg-error-100 text-error-700",headerLabel:a,headerIcon:l,children:o
}){
  var j;
  const[c,u]=useState(!1),
       [userMenuOpen,setUserMenuOpen]=useState(!1),{
    user:d,profile:h,signOut:p
  }=useAuth();
  const userDropdownRef = useRef(null);
  const userButtonRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleDropdownOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setUserMenuOpen(!1);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setUserMenuOpen(!1);
    };
    document.addEventListener("mousedown", handleDropdownOutside);
    document.addEventListener("touchstart", handleDropdownOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDropdownOutside);
      document.removeEventListener("touchstart", handleDropdownOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  const y=C=>{
    r(C),u(!1),setUserMenuOpen(!1);
  },w=async()=>{
    await p(),n()
  };
  return jsxs("div",{
    className:"min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md",children:jsxs("div",{
        className:"flex h-16 items-center justify-between px-4 lg:px-6",children:[jsxs("div",{
          className:"flex items-center gap-3",children:[jsx("button",{
            onClick:()=>u(!c),className:"rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden",children:c?jsx(X,{
              className:"h-5 w-5"
            }):jsx(Menu,{
              className:"h-5 w-5"
            })
          }),jsxs("button",{
            onClick:n,className:"flex items-center gap-2",children:[jsx("div",{
              className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
                className:"h-5 w-5 text-white",strokeWidth:2.5
              })
            }),jsxs("span",{
              className:"text-xl font-extrabold tracking-tight text-gray-900 dark:text-white",children:["Sell",jsx("span",{
                className:"text-primary-500",children:"Solar"
              })]
            }),jsx("span",{
              className:`ml-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${s}`,children:a
            })]
          })]
        }),jsxs("div",{
          className:"flex items-center gap-2 sm:gap-3",children:[
          jsx(ThemeRadioToggle,{ className:"shrink-0" }),
          jsxs("button",{
            type:"button",
            onClick:()=>{
              if(t&&t.some(item=>item.id==="notifications")){
                y("notifications");
              }
            },
            title:"Notifications",
            className:"relative rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",children:[jsx(Bell,{
              className:"h-5 w-5"
            }),jsx("span",{
              className:"absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error-500"
            })]
          }),jsxs("div",{
            className:"relative",children:[jsxs("button",{
              ref:userButtonRef,
              type:"button",
              onClick:()=>setUserMenuOpen(prev=>!prev),
              "aria-expanded":userMenuOpen,
              "aria-haspopup":"true",
              className:`flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer ${
                userMenuOpen ? "ring-2 ring-primary-500/30 bg-gray-50 dark:bg-gray-800 border-primary-300 dark:border-primary-600" : ""
              }`,children:[jsx("div",{
                className:"flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white shadow-xs",children:((h==null?void 0:h.full_name)||(d==null?void 0:d.email)||"U").charAt(0).toUpperCase()
              }),jsx("span",{
                className:"hidden sm:inline font-semibold",children:((j=h==null?void 0:h.full_name)==null?void 0:j.split(" ")[0])||"User"
              }),jsx(ChevronDown,{
                className:`h-4 w-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180 text-primary-500" : ""}`
              })]
            }),
            userMenuOpen&&jsxs("div",{
              ref:userDropdownRef,
              className:"absolute right-0 mt-2 w-64 animate-slide-down rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-2 shadow-2xl z-50",
              children:[
                jsxs("div",{
                  onClick:()=>{ y("profile"); },
                  role:"button",
                  tabIndex:0,
                  title:"View Profile",
                  className:"border-b border-gray-100 dark:border-gray-800 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group",
                  children:[
                    jsxs("div",{
                      className:"flex items-center justify-between",
                      children:[
                        jsx("p",{
                          className:"text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors",
                          children:(h==null?void 0:h.full_name)||"User"
                        }),
                        jsx(ChevronRight,{
                          className:"h-4 w-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all"
                        })
                      ]
                    }),
                    jsx("p",{
                      className:"truncate text-xs text-gray-500 dark:text-gray-400",
                      children:(h?.username||(d?.email?.endsWith('@sellsolar.local')?d.email.replace('@sellsolar.local',''):d?.email))||""
                    }),
                    jsxs("div",{
                      className:"mt-1.5 flex items-center gap-1.5",
                      children:[
                        jsxs("span",{
                          className:`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${s}`,
                          children:[
                            l&&jsx(l,{ className:"h-3 w-3" }),
                            a||"Member"
                          ]
                        }),
                        (h==null?void 0:h.is_verified_dealer)&&jsxs("span",{
                          className:"inline-flex items-center gap-0.5 rounded-full bg-secondary-100 dark:bg-secondary-950/60 px-2 py-0.5 text-[11px] font-bold text-secondary-700 dark:text-secondary-300",
                          children:[
                            jsx(BadgeCheck,{ className:"h-3 w-3" }),
                            "Verified"
                          ]
                        })
                      ]
                    })
                  ]
                }),
                jsxs("div",{
                  className:"py-1 max-h-60 overflow-y-auto",
                  children:t.map(item=>{
                    const IconComp=item.icon;
                    const isActive=e===item.id;
                    return jsxs("button",{
                      type:"button",
                      onClick:()=>{
                        y(item.id);
                      },
                      className:`flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ?"bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-semibold"
                          :"text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`,
                      children:[
                        IconComp&&jsx(IconComp,{
                          className:`h-4 w-4 ${isActive?"text-primary-600 dark:text-primary-400":"text-gray-400"}`
                        }),
                        jsx("span",{ className:"flex-1 text-left", children:item.label }),
                        item.badge!==void 0&&item.badge>0&&jsx("span",{
                          className:"rounded-full bg-error-100 dark:bg-error-950/60 px-2 py-0.5 text-xs font-bold text-error-700 dark:text-error-300",
                          children:item.badge
                        })
                      ]
                    }, item.id);
                  })
                }),
                jsx("div",{ className:"border-t border-gray-100 dark:border-gray-800 my-1" }),
                jsxs("button",{
                  type:"button",
                  onClick:()=>{
                    setUserMenuOpen(!1);
                    n();
                  },
                  className:"flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                  children:[
                    jsx(ArrowLeft,{ className:"h-4 w-4 text-gray-400" }),
                    jsx("span",{ children:"Back to Marketplace" })
                  ]
                }),
                jsxs("button",{
                  type:"button",
                  onClick:()=>{
                    setUserMenuOpen(!1);
                    w();
                  },
                  className:"flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/40 transition-colors",
                  children:[
                    jsx(LogOut,{ className:"h-4 w-4" }),
                    jsx("span",{ children:"Sign Out" })
                  ]
                })
              ]
            })]
          }),jsxs("button",{
            onClick:w,className:"flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-error-600 hover:bg-error-50",children:[jsx(LogOut,{
              className:"h-4 w-4"
            }),jsx("span",{
              className:"hidden sm:inline",children:"Sign Out"
            })]
          })]
        })]
      })
    }),jsxs("div",{
      className:"flex",children:[jsxs("aside",{
        className:`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-transform duration-300 lg:sticky lg:translate-x-0 ${c?"translate-x-0":"-translate-x-full"}`,children:[jsxs("nav",{
          className:"flex flex-col gap-0.5 p-3",children:[jsxs("button",{
            type:"button",
            onClick:()=>y("profile"),
            title:"Edit Profile",
            className:"w-full text-left mb-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 p-3 border border-gray-200 dark:border-gray-700/60 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all cursor-pointer group",
            children:[jsxs("div",{
              className:"flex items-center gap-3",children:[jsx("div",{
                className:"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-md group-hover:scale-105 transition-transform",children:jsx("span",{
                  className:"text-lg font-bold text-white",children:((h==null?void 0:h.full_name)||(d==null?void 0:d.email)||"U").charAt(0).toUpperCase()
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsxs("div",{
                  className:"flex items-center justify-between",
                  children:[
                    jsx("p",{
                      className:"truncate text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors",children:(h==null?void 0:h.full_name)||"User"
                    }),
                    jsx(ChevronRight,{
                      className:"h-3.5 w-3.5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0"
                    })
                  ]
                }),jsx("p",{
                  className:"truncate text-xs text-gray-500 dark:text-gray-400",children:(h?.username||(d?.email?.endsWith('@sellsolar.local')?d.email.replace('@sellsolar.local',''):d?.email))||""
                }),jsxs("div",{
                  className:"mt-0.5 flex items-center gap-1.5",children:[jsxs("span",{
                    className:`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${s}`,children:[jsx(l,{
                      className:"h-3 w-3"
                    }),a]
                  }),(h==null?void 0:h.is_verified_dealer)&&jsxs("span",{
                    className:"inline-flex items-center gap-0.5 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-bold text-secondary-700",children:[jsx(BadgeCheck,{
                      className:"h-3 w-3"
                    }),"Verified"]
                  })]
                })]
              })]
            })]
          }),jsxs("div",{
            className:"mb-2 flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400",children:[jsx(l,{
              className:"h-3.5 w-3.5"
            }),a," Menu"]
          }),t.map(C=>{
            const g=C.icon,f=e===C.id;
            return jsxs("button",{
              onClick:()=>y(C.id),className:`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${f?"bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold":"text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`,children:[jsx(g,{
                className:`h-4.5 w-4.5 ${f?"text-primary-600 dark:text-primary-400":"text-gray-400"}`
              }),jsx("span",{
                className:"flex-1 text-left",children:C.label
              }),C.badge!==void 0&&C.badge>0&&jsx("span",{
                className:"rounded-full bg-error-100 px-2 py-0.5 text-xs font-bold text-error-700",children:C.badge
              })]
            },C.id)
          })]
        }),jsx("div",{
          className:"mt-auto border-t border-gray-100 dark:border-gray-800 p-3",children:jsxs("button",{
            onClick:n,className:"flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",children:[jsx(ArrowLeft,{
              className:"h-4 w-4"
            }),"Back to Site"]
          })
        })]
      }),c&&jsx("div",{
        onClick:()=>u(!1),className:"fixed inset-0 top-16 z-20 bg-black/30 lg:hidden"
      }),jsx("main",{
        className:"min-h-[calc(100vh-4rem)] flex-1 overflow-x-hidden",children:o
      })]
    })]
  })
}function vx({
  onBack:t
}){
  const{
    profile:e
  }=useAuth(),[r,n]=useState("dashboard"),[s,a]=useState([]),[l,o]=useState([]),[c,u]=useState([]),[d,h]=useState([]),[p,y]=useState([]),[w,j]=useState([]),[C,g]=useState(!0),[f,m]=useState(null),[v,k]=useState(null),[x,S]=useState(""),[L,z]=useState("all"),[I,Y]=useState(null),[ke,ye]=useState(""),Be=(e==null?void 0:e.is_admin)===!0,le=useCallback(async()=>{
    const[b,O,q,V,_a,Bs]=await Promise.all([supabase.from("profiles").select("*").order("created_at",{
      ascending:!1
    }),supabase.from("solar_listings").select("*").order("created_at",{
      ascending:!1
    }),supabase.from("categories").select("*").order("sort_order",{
      ascending:!0
    }),supabase.from("brands").select("*").order("name",{
      ascending:!0
    }),supabase.from("enquiries").select("*").order("created_at",{
      ascending:!1
    }),supabase.from("advertisements").select("*").order("created_at",{
      ascending:!1
    })]);
    const profilesData = (!b.error && b.data && b.data.length > 0) ? b.data : [
      {
        id: DEFAULT_ADMIN_ID,
        email: "mudassir2k6@gmail.com",
        full_name: "Mudassir (Admin)",
        phone: "03001234567",
        city: "Lahore",
        account_type: "individual",
        is_admin: true,
        is_verified_dealer: false,
        created_at: "2026-01-01T00:00:00Z"
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        email: "contact@solartraders.pk",
        full_name: "Tariq Mahmood",
        phone: "03019876543",
        city: "Lahore",
        account_type: "dealer",
        business_name: "Solar Traders Lahore",
        business_address: "Hall Road, Lahore",
        is_admin: false,
        is_verified_dealer: true,
        created_at: "2026-01-15T00:00:00Z"
      }
    ];
    const listingsData = (!O.error && O.data && O.data.length > 0) ? O.data : getLocalOrSeedListings({});
    a(profilesData);
    o(listingsData);
    u(q.data || []);
    h(V.data || []);
    y(_a.data || []);
    j(Bs.data || []);
  },[]);
  useEffect(()=>{
    if(!Be){
      g(!1);
      return
    }g(!0),m(null),le().finally(()=>g(!1))
  },[Be,le]);
  const We=async b=>{
    k(b);
    try {
      await supabase.rpc("admin_update_listing_status",{
        p_listing_id:b,p_new_status:"approved"
      });
    } catch(err) {}
    o(q=>q.map(V=>V.id===b?{
      ...V,status:"approved",rejection_reason:null
    }:V));
    k(null);
  },Xe=async()=>{
    if(!I)return;
    k(I.listingId);
    try {
      await supabase.rpc("admin_update_listing_status",{
        p_listing_id:I.listingId,p_new_status:"rejected",p_reason:ke||"Does not meet guidelines"
      });
    } catch(err) {}
    o(O=>O.map(q=>q.id===I.listingId?{
      ...q,status:"rejected",rejection_reason:ke
    }:q));
    k(null);Y(null);ye("");
  },_=async b=>{
    k(b);
    try {
      await supabase.rpc("admin_toggle_featured",{
        p_listing_id:b
      });
    } catch(err) {}
    o(q=>q.map(V=>V.id===b?{
      ...V,featured:!V.featured
    }:V));
    k(null);
  },A=async b=>{
    k(b);
    try {
      await supabase.rpc("admin_toggle_sponsored",{
        p_listing_id:b
      });
    } catch(err) {}
    o(q=>q.map(V=>V.id===b?{
      ...V,sponsored:!V.sponsored
    }:V));
    k(null);
  },D=async b=>{
    k(b);
    try {
      await supabase.rpc("admin_toggle_sold",{
        p_listing_id:b
      });
    } catch(err) {}
    o(q=>q.map(V=>V.id===b?{
      ...V,is_sold:!V.is_sold
    }:V));
    k(null);
  },H=async b=>{
    if(!confirm("Delete this listing permanently?"))return;
    k(b);
    try {
      await supabase.rpc("admin_delete_listing",{
        listing_id:b
      });
    } catch(err) {}
    o(q=>q.filter(V=>V.id!==b));
    k(null);
  },X=async b=>{
    k(b);
    try {
      await supabase.rpc("admin_verify_dealer",{
        target_user_id:b
      });
    } catch(err) {}
    a(q=>q.map(V=>V.id===b?{
      ...V,is_verified_dealer:!0
    }:V));
    k(null);
  },St=async b=>{
    if(!confirm("Delete this user profile?"))return;
    k(b);
    try {
      await supabase.rpc("admin_delete_profile",{
        target_user_id:b
      });
    } catch(err) {}
    a(q=>q.filter(V=>V.id!==b));
    k(null);
  },we=s.filter(b=>b.account_type==="dealer"),Ve=l.filter(b=>b.status==="pending"),oe=l.filter(b=>b.status==="approved"),xt=l.filter(b=>b.status==="rejected"),yr=l.filter(b=>b.featured),Ft=l.filter(b=>b.sponsored),Ds=l.reduce((b,O)=>b+(O.views||0),0),Ms=l.filter(b=>{
    const O=!x||b.title.toLowerCase().includes(x.toLowerCase())||b.brand.toLowerCase().includes(x.toLowerCase())||b.city.toLowerCase().includes(x.toLowerCase()),q=L==="all"||b.status===L;
    return O&&q
  }),Us=[{
    id:"dashboard",label:"Dashboard",icon:LayoutDashboard
  },{
    id:"users",label:"Users",icon:Users,badge:s.length
  },{
    id:"dealers",label:"Dealers",icon:Store,badge:we.length
  },{
    id:"products",label:"Products",icon:Tag,badge:l.length
  },{
    id:"pending",label:"Pending Approvals",icon:Clock,badge:Ve.length
  },{
    id:"categories",label:"Categories",icon:Layers
  },{
    id:"brands",label:"Brands",icon:Award
  },{
    id:"locations",label:"Locations",icon:MapPin
  },{
    id:"advertisements",label:"Advertisements",icon:Megaphone
  },{
    id:"featured",label:"Featured Products",icon:Star,badge:yr.length
  },{
    id:"sponsored",label:"Sponsored Products",icon:DollarSign,badge:Ft.length
  },{
    id:"enquiries",label:"Messages / Enquiries",icon:MessageSquare,badge:p.length
  },{
    id:"reviews",label:"Reviews & Ratings",icon:Star
  },{
    id:"reports",label:"Reports & Analytics",icon:ChartColumn
  },{
    id:"cms",label:"CMS",icon:FileText
  },{
    id:"settings",label:"Website Settings",icon:Settings
  },{
    id:"roles",label:"Roles & Permissions",icon:ShieldCheck
  },{
    id:"notifications",label:"Notifications",icon:Bell
  },{
    id:"system-logs",label:"System Logs",icon:ScrollText
  },{
    id:"audit-logs",label:"Audit Logs",icon:ScrollText
  }],ja=[{
    label:"Total Users",value:s.length,icon:Users,color:"text-accent-500 bg-accent-50"
  },{
    label:"Total Dealers",value:we.length,icon:Store,color:"text-primary-500 bg-primary-50"
  },{
    label:"Total Products",value:l.length,icon:Tag,color:"text-gray-600 bg-gray-100"
  },{
    label:"Pending",value:Ve.length,icon:Clock,color:"text-warning-500 bg-warning-50"
  },{
    label:"Approved",value:oe.length,icon:CircleCheckBig,color:"text-secondary-500 bg-secondary-50"
  },{
    label:"Rejected",value:xt.length,icon:CircleX,color:"text-error-500 bg-error-50"
  },{
    label:"Featured",value:yr.length,icon:Star,color:"text-primary-500 bg-primary-50"
  },{
    label:"Sponsored",value:Ft.length,icon:DollarSign,color:"text-accent-500 bg-accent-50"
  },{
    label:"Active Ads",value:w.filter(b=>b.is_active).length,icon:Megaphone,color:"text-primary-500 bg-primary-50"
  },{
    label:"Total Enquiries",value:p.length,icon:MessageSquare,color:"text-gray-600 bg-gray-100"
  },{
    label:"Total Views",value:Ds,icon:Eye,color:"text-accent-500 bg-accent-50"
  }];
  if(!Be)return jsx("div",{
    className:"min-h-screen bg-gray-50 flex flex-col items-center justify-center py-24",children:jsxs("div",{
      className:"card max-w-md p-8 text-center",children:[jsx("div",{
        className:"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100",children:jsx(ShieldCheck,{
          className:"h-8 w-8 text-error-600"
        })
      }),jsx("h2",{
        className:"mt-4 text-2xl font-extrabold text-gray-900",children:"Access Denied"
      }),jsx("p",{
        className:"mt-2 text-sm text-gray-500",children:"You need admin privileges to access this page."
      }),jsx("button",{
        onClick:t,className:"btn-ghost mt-6",children:"Back to Home"
      })]
    })
  });
  const Bt=b=>jsxs("div",{
    className:"card flex items-center gap-4 p-4",children:[jsx("div",{
      className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:b.image_url?jsx("img",{
        src:b.image_url,alt:b.title,className:"h-full w-full object-cover"
      }):jsx("div",{
        className:"flex h-full items-center justify-center",children:jsx(Tag,{
          className:"h-6 w-6 text-gray-300"
        })
      })
    }),jsxs("div",{
      className:"min-w-0 flex-1",children:[jsx("h3",{
        className:"truncate text-sm font-bold text-gray-900",children:b.title
      }),jsxs("div",{
        className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
          className:"font-semibold text-primary-600",children:CATEGORIES[b.category]
        }),jsx("span",{
          children:"•"
        }),jsx("span",{
          children:b.brand
        }),jsx("span",{
          children:"•"
        }),jsx("span",{
          children:b.city
        }),jsx("span",{
          children:"•"
        }),jsx("span",{
          className:"font-bold text-gray-700",children:formatPrice(b.price)
        }),jsx("span",{
          children:"•"
        }),jsxs("span",{
          className:"flex items-center gap-0.5",children:[jsx(Eye,{
            className:"h-3 w-3"
          }),b.views]
        }),b.featured&&jsx("span",{
          className:"rounded-full bg-primary-100 px-2 py-0.5 font-semibold text-primary-700",children:"Featured"
        }),b.sponsored&&jsx("span",{
          className:"rounded-full bg-accent-100 px-2 py-0.5 font-semibold text-accent-700",children:"Sponsored"
        }),b.is_sold&&jsx("span",{
          className:"rounded-full bg-gray-200 px-2 py-0.5 font-semibold text-gray-700",children:"Sold"
        })]
      }),jsx("div",{
        className:"mt-1",children:jsx("span",{
          className:`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${b.status==="approved"?"bg-secondary-100 text-secondary-700":b.status==="pending"?"bg-warning-100 text-warning-700":b.status==="rejected"?"bg-error-100 text-error-700":"bg-gray-100 text-gray-600"}`,children:b.status.charAt(0).toUpperCase()+b.status.slice(1)
        })
      })]
    }),jsxs("div",{
      className:"flex shrink-0 flex-wrap items-center justify-end gap-1.5",children:[b.status==="pending"&&jsxs(Fragment,{
        children:[jsxs("button",{
          onClick:()=>We(b.id),disabled:v===b.id,className:"flex items-center gap-1 rounded-lg bg-secondary-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-secondary-600 disabled:opacity-50",children:[v===b.id?jsx(LoaderCircle,{
            className:"h-3 w-3 animate-spin"
          }):jsx(CircleCheckBig,{
            className:"h-3 w-3"
          }),"Approve"]
        }),jsxs("button",{
          onClick:()=>Y({
            listingId:b.id
          }),disabled:v===b.id,className:"flex items-center gap-1 rounded-lg bg-error-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-error-600 disabled:opacity-50",children:[jsx(CircleX,{
            className:"h-3 w-3"
          })," Reject"]
        })]
      }),b.status==="rejected"&&jsxs("button",{
        onClick:()=>We(b.id),disabled:v===b.id,className:"flex items-center gap-1 rounded-lg bg-secondary-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-secondary-600 disabled:opacity-50",children:[jsx(CircleCheckBig,{
          className:"h-3 w-3"
        })," Approve"]
      }),jsx("button",{
        onClick:()=>_(b.id),disabled:v===b.id,className:`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${b.featured?"bg-primary-100 text-primary-600":"text-gray-400 hover:bg-gray-100"}`,title:"Toggle Featured",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(Star,{
          className:"h-3.5 w-3.5"
        })
      }),jsx("button",{
        onClick:()=>A(b.id),disabled:v===b.id,className:`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${b.sponsored?"bg-accent-100 text-accent-600":"text-gray-400 hover:bg-gray-100"}`,title:"Toggle Sponsored",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(DollarSign,{
          className:"h-3.5 w-3.5"
        })
      }),jsx("button",{
        onClick:()=>D(b.id),disabled:v===b.id,className:`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${b.is_sold?"bg-gray-200 text-gray-700":"text-gray-400 hover:bg-gray-100"}`,title:"Toggle Sold",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(CircleCheckBig,{
          className:"h-3.5 w-3.5"
        })
      }),jsx("button",{
        onClick:()=>H(b.id),disabled:v===b.id,className:"flex h-8 w-8 items-center justify-center rounded-lg text-error-500 transition-colors hover:bg-error-50 disabled:opacity-50",title:"Delete",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(Trash2,{
          className:"h-3.5 w-3.5"
        })
      })]
    })]
  },b.id),zs=(b,O)=>jsx("div",{
    className:"card p-4",children:jsxs("div",{
      className:"flex items-start gap-4",children:[jsx("div",{
        className:"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600",children:b.account_type==="dealer"?jsx(Store,{
          className:"h-6 w-6 text-white"
        }):jsx("span",{
          className:"text-lg font-bold text-white",children:b.full_name.charAt(0).toUpperCase()
        })
      }),jsxs("div",{
        className:"min-w-0 flex-1",children:[jsxs("div",{
          className:"flex flex-wrap items-center gap-2",children:[jsx("h3",{
            className:"text-sm font-bold text-gray-900",children:b.business_name||b.full_name
          }),b.account_type==="dealer"&&jsx("span",{
            className:"rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700",children:"Dealer"
          }),b.is_verified_dealer&&jsxs("span",{
            className:"flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700",children:[jsx(BadgeCheck,{
              className:"h-3 w-3"
            })," Verified"]
          }),b.is_admin&&jsxs("span",{
            className:"flex items-center gap-1 rounded-full bg-error-100 px-2 py-0.5 text-xs font-semibold text-error-700",children:[jsx(ShieldCheck,{
              className:"h-3 w-3"
            })," Admin"]
          })]
        }),jsxs("div",{
          className:"mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500",children:[b.city&&jsxs("span",{
            className:"flex items-center gap-1",children:[jsx(MapPin,{
              className:"h-3 w-3"
            }),b.city]
          }),b.phone&&jsxs("span",{
            className:"flex items-center gap-1",children:[jsx(Phone,{
              className:"h-3 w-3"
            }),b.phone]
          }),b.cnic&&jsxs("span",{
            className:"flex items-center gap-1",children:[jsx(CreditCard,{
              className:"h-3 w-3"
            }),b.cnic]
          })]
        })]
      }),jsxs("div",{
        className:"flex shrink-0 items-center gap-2",children:[O&&b.account_type==="dealer"&&!b.is_verified_dealer&&jsxs("button",{
          onClick:()=>X(b.id),disabled:v===b.id,className:"flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-secondary-600 disabled:opacity-50",children:[v===b.id?jsx(LoaderCircle,{
            className:"h-3.5 w-3.5 animate-spin"
          }):jsx(BadgeCheck,{
            className:"h-3.5 w-3.5"
          })," Verify"]
        }),!b.is_admin&&jsx("button",{
          onClick:()=>St(b.id),disabled:v===b.id,className:"flex h-9 w-9 items-center justify-center rounded-lg text-error-500 hover:bg-error-50 disabled:opacity-50",children:v===b.id?jsx(LoaderCircle,{
            className:"h-4 w-4 animate-spin"
          }):jsx(Trash2,{
            className:"h-4 w-4"
          })
        })]
      })]
    })
  },b.id),Fs=()=>{
    var b;
    if(C)return jsxs("div",{
      className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
        className:"h-10 w-10 animate-spin text-primary-500"
      }),jsx("p",{
        className:"mt-4 text-sm text-gray-500",children:"Loading data..."
      })]
    });
    if(f)return jsxs("div",{
      className:"mb-6 flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
        className:"h-4 w-4 shrink-0 mt-0.5"
      }),jsx("span",{
        children:f
      }),jsx("button",{
        onClick:()=>m(null),className:"ml-auto text-error-400 hover:text-error-600",children:"×"
      })]
    });
    switch(r){
      case"dashboard":return jsxs("div",{
        children:[jsxs("div",{
          className:"mb-6",children:[jsx("h1",{
            className:"text-2xl font-extrabold tracking-tight text-gray-900",children:"Admin Dashboard"
          }),jsx("p",{
            className:"mt-1 text-sm text-gray-500",children:"Overview of platform activity and moderation."
          })]
        }),jsx("div",{
          className:"grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",children:ja.map(O=>{
            const q=O.icon;
            return jsxs("div",{
              className:"card p-4",children:[jsx("div",{
                className:`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${O.color}`,children:jsx(q,{
                  className:"h-5 w-5"
                })
              }),jsx("div",{
                className:"text-2xl font-extrabold text-gray-900",children:O.value
              }),jsx("div",{
                className:"text-xs font-medium text-gray-500",children:O.label
              })]
            },O.label)
          })
        }),Ve.length>0&&jsxs("div",{
          className:"mt-8",children:[jsx("h2",{
            className:"mb-4 text-lg font-bold text-gray-900",children:"Pending Approvals"
          }),jsx("div",{
            className:"space-y-3",children:Ve.map(Bt)
          })]
        })]
      });
      case"users":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"All Users"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[s.length," registered users"]
        }),jsx("div",{
          className:"space-y-3",children:s.map(O=>zs(O,!1))
        })]
      });
      case"dealers":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Dealers"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[we.length," dealer accounts"]
        }),we.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No dealers found."
        }):jsx("div",{
          className:"space-y-3",children:we.map(O=>zs(O,!0))
        })]
      });
      case"products":case"pending":case"featured":case"sponsored":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:r==="pending"?"Pending Approvals":r==="featured"?"Featured Products":r==="sponsored"?"Sponsored Products":"All Products"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:r==="pending"?`${Ve.length} awaiting review`:r==="featured"?`${yr.length} featured`:r==="sponsored"?`${Ft.length} sponsored`:`${l.length} total products`
        }),r==="products"&&jsxs("div",{
          className:"mb-4 flex flex-col gap-3 sm:flex-row",children:[jsxs("div",{
            className:"relative flex-1",children:[jsx(Search,{
              className:"absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            }),jsx("input",{
              type:"text",value:x,onChange:O=>S(O.target.value),placeholder:"Search by title, brand, or city...",className:"input-field pl-11"
            })]
          }),jsxs("select",{
            value:L,onChange:O=>z(O.target.value),className:"input-field sm:w-48",children:[jsx("option",{
              value:"all",children:"All Status"
            }),jsx("option",{
              value:"draft",children:"Draft"
            }),jsx("option",{
              value:"pending",children:"Pending"
            }),jsx("option",{
              value:"approved",children:"Approved"
            }),jsx("option",{
              value:"rejected",children:"Rejected"
            })]
          })]
        }),jsx("div",{
          className:"space-y-3",children:r==="pending"?Ve.map(Bt):r==="featured"?yr.length?yr.map(Bt):jsx("div",{
            className:"card py-16 text-center text-gray-500",children:"No featured products."
          }):r==="sponsored"?Ft.length?Ft.map(Bt):jsx("div",{
            className:"card py-16 text-center text-gray-500",children:"No sponsored products."
          }):Ms.length?Ms.map(Bt):jsx("div",{
            className:"card py-16 text-center text-gray-500",children:"No products found."
          })
        })]
      });
      case"categories":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Categories"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[c.length," categories"]
        }),jsx("div",{
          className:"grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",children:c.map(O=>jsx("div",{
            className:"card p-4",children:jsxs("div",{
              className:"flex items-center gap-3",children:[jsx("div",{
                className:"flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600",children:jsx(Sun,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"flex-1",children:[jsx("h3",{
                  className:"text-sm font-bold text-gray-900",children:O.name
                }),jsxs("p",{
                  className:"text-xs text-gray-500",children:["/",O.slug]
                })]
              }),jsx("span",{
                className:`rounded-full px-2 py-0.5 text-xs font-semibold ${O.is_active?"bg-secondary-100 text-secondary-700":"bg-gray-100 text-gray-500"}`,children:O.is_active?"Active":"Inactive"
              })]
            })
          },O.id))
        })]
      });
      case"brands":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Brands"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[d.length," brands"]
        }),jsx("div",{
          className:"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",children:d.map(O=>jsxs("div",{
            className:"card p-4",children:[jsx("h3",{
              className:"text-sm font-bold text-gray-900",children:O.name
            }),jsxs("p",{
              className:"text-xs text-gray-500",children:["/",O.slug]
            }),jsx("span",{
              className:`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${O.is_active?"bg-secondary-100 text-secondary-700":"bg-gray-100 text-gray-500"}`,children:O.is_active?"Active":"Inactive"
            })]
          },O.id))
        })]
      });
      case"locations":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Locations"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Cities where products are listed"
        }),jsx("div",{
          className:"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",children:Array.from(new Set(l.map(O=>O.city))).map(O=>jsxs("div",{
            className:"card p-4",children:[jsxs("div",{
              className:"flex items-center gap-2",children:[jsx(MapPin,{
                className:"h-4 w-4 text-primary-500"
              }),jsx("h3",{
                className:"text-sm font-bold text-gray-900",children:O
              })]
            }),jsxs("p",{
              className:"mt-1 text-xs text-gray-500",children:[l.filter(q=>q.city===O).length," listings"]
            })]
          },O))
        })]
      });
      case"advertisements":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Advertisements"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[w.length," advertisements"]
        }),w.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No advertisements configured."
        }):jsx("div",{
          className:"space-y-3",children:w.map(O=>jsxs("div",{
            className:"card flex items-center gap-4 p-4",children:[jsx("div",{
              className:"h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:O.image_url?jsx("img",{
                src:O.image_url,alt:O.title,className:"h-full w-full object-cover"
              }):jsx(Megaphone,{
                className:"h-6 w-6 text-gray-300 m-auto"
              })
            }),jsxs("div",{
              className:"min-w-0 flex-1",children:[jsx("h3",{
                className:"text-sm font-bold text-gray-900",children:O.title
              }),jsxs("p",{
                className:"text-xs text-gray-500",children:["Placement: ",O.placement]
              })]
            }),jsx("span",{
              className:`rounded-full px-2 py-0.5 text-xs font-semibold ${O.is_active?"bg-secondary-100 text-secondary-700":"bg-gray-100 text-gray-500"}`,children:O.is_active?"Active":"Inactive"
            })]
          },O.id))
        })]
      });
      case"enquiries":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Messages & Enquiries"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[p.length," total enquiries"]
        }),p.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No enquiries yet."
        }):jsx("div",{
          className:"space-y-3",children:p.map(O=>jsx("div",{
            className:"card p-4",children:jsxs("div",{
              className:"flex items-start gap-3",children:[jsx("div",{
                className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600",children:jsx(MessageSquare,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("p",{
                  className:"text-sm text-gray-700",children:O.message||"No message"
                }),O.contact_phone&&jsxs("p",{
                  className:"mt-1 text-xs text-gray-500",children:["Phone: ",O.contact_phone]
                }),jsx("p",{
                  className:"mt-1 text-xs text-gray-400",children:new Date(O.created_at).toLocaleDateString("en-PK")
                })]
              }),!O.is_read&&jsx("span",{
                className:"h-2 w-2 shrink-0 rounded-full bg-error-500"
              })]
            })
          },O.id))
        })]
      });
      case"reports":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Reports & Analytics"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Platform performance overview"
        }),jsxs("div",{
          className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(TrendingUp,{
                className:"h-4 w-4"
              })," Total Views"]
            }),jsx("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:Ds.toLocaleString()
            })]
          }),jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(Tag,{
                className:"h-4 w-4"
              })," Approval Rate"]
            }),jsxs("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:[l.length>0?Math.round(oe.length/l.length*100):0,"%"]
            })]
          }),jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(Store,{
                className:"h-4 w-4"
              })," Verified Dealers"]
            }),jsx("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:we.filter(O=>O.is_verified_dealer).length
            })]
          }),jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(MessageSquare,{
                className:"h-4 w-4"
              })," Enquiries"]
            }),jsx("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:p.length
            })]
          })]
        })]
      });
      default:return jsx("div",{
        className:"flex flex-col items-center justify-center py-24",children:jsxs("div",{
          className:"card max-w-md p-8 text-center",children:[jsx(FileText,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("h2",{
            className:"mt-4 text-lg font-bold text-gray-900",children:((b=Us.find(O=>O.id===r))==null?void 0:b.label)||"Section"
          }),jsx("p",{
            className:"mt-2 text-sm text-gray-500",children:"This section is ready for configuration. Content will appear here once set up."
          })]
        })
      })
    }
  };
  return jsxs(Fragment,{
    children:[jsx(Df,{
      navItems:Us,activeTab:r,onTabChange:b=>n(b),onBack:t,badgeColor:"bg-error-100 text-error-700",headerLabel:"Admin",headerIcon:ShieldCheck,children:jsx("div",{
        className:"p-4 lg:p-8",children:Fs()
      })
    }),I&&jsx("div",{
      className:"fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4",onClick:()=>Y(null),children:jsxs("div",{
        className:"card max-w-md p-6",onClick:b=>b.stopPropagation(),children:[jsx("h2",{
          className:"text-lg font-bold text-gray-900",children:"Reject Listing"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Provide a reason for rejection (optional)."
        }),jsx("textarea",{
          value:ke,onChange:b=>ye(b.target.value),placeholder:"e.g. Does not meet quality guidelines...",className:"input-field mt-4 min-h-[80px]"
        }),jsxs("div",{
          className:"mt-4 flex justify-end gap-2",children:[jsx("button",{
            onClick:()=>{
              Y(null),ye("")
            },className:"btn-ghost",children:"Cancel"
          }),jsx("button",{
            onClick:Xe,className:"btn-primary bg-error-500 hover:bg-error-600",children:"Reject Listing"
          })]
        })]
      })
    })]
  })
}function wx({
  onBack:t
}){
  const {
    user: e,
    profile: r,
    refreshProfile: n,
    updateProfile,
  } = useAuth(),
  [s, a] = useState("dashboard"),
  [l, o] = useState([]),
  [c, u] = useState([]),
  [d, h] = useState([]),
  [p, y] = useState([]),
  [w, j] = useState([]),
  [C, g] = useState(!0),
  [f, m] = useState(null),
  [v, k] = useState(null),
  [x, S] = useState(null),
  [L, z] = useState(""),
  [I, Y] = useState(""),
  [profileEmail, setProfileEmail] = useState(""),
  [fieldErrors, setFieldErrors] = useState({ phone: "", email: "" }),
  [ke, ye] = useState(""),
  [Be, le] = useState(""),
  [We, Xe] = useState(""),
  [_, A] = useState({
    title:"",brand:BRANDS[0],category:"panel",condition:"new",price:"",city:CITIES[0],capacity_kw:"",warranty_years:"",image_url:"",description:"",seller_name:"",seller_phone:""
  }),[D,H]=useState("pending"),[X,St]=useState(""),[we,Ve]=useState(""),oe=(r==null?void 0:r.account_type)==="dealer";
  const xt = useCallback(async () => {
    if (!e) return;
    let effectiveUserId = e.id;
    if (!isValidUuid(effectiveUserId)) {
      if (e.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
        effectiveUserId = DEFAULT_ADMIN_ID;
      }
    }
    const hasValidDbUuid = isValidUuid(effectiveUserId);

    let P = { data: [] };
    let Q = { data: [] };
    let de = { data: [] };
    let te = { data: [] };

    if (hasValidDbUuid) {
      try {
        [P, Q, de, te] = await Promise.all([
          supabase.from("solar_listings").select("*").eq("user_id", effectiveUserId).order("created_at", {
            ascending: false
          }),
          supabase.from("enquiries").select("*").or(`sender_id.eq.${effectiveUserId},receiver_id.eq.${effectiveUserId}`).order("created_at", {
            ascending: false
          }),
          supabase.from("favorites").select("*").eq("user_id", effectiveUserId).order("created_at", {
            ascending: false
          }),
          supabase.from("notifications").select("*").eq("user_id", effectiveUserId).order("created_at", {
            ascending: false
          })
        ]);
      } catch (fetchErr) {
        console.warn("Dashboard fetch notice:", fetchErr);
      }
    }

    let localListings = [];
    try {
      const raw = localStorage.getItem("sellsolar_custom_listings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localListings = parsed.filter(item => 
            item.user_id === effectiveUserId || 
            item.user_id === e.id || 
            (r?.full_name && item.seller_name === r.full_name) ||
            (r?.phone && item.seller_phone === r.phone)
          );
        }
      }
    } catch (err) {}

    const dbListings = P.data || [];
    const combinedMap = new Map();
    dbListings.forEach(item => combinedMap.set(item.id, item));
    localListings.forEach(item => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });
    const combinedListings = Array.from(combinedMap.values());
    o(combinedListings);

    if (P.error && !P.error.message?.includes("invalid input syntax for type uuid")) {
      m(P.error.message);
    }
    if (Q.error && !Q.error.message?.includes("invalid input syntax for type uuid")) {
      m(Q.error.message);
    } else {
      u(Q.data || []);
    }

    h(de.data || []);
    y(te.data || []);

    if (de.data && de.data.length > 0) {
      const T = de.data.map(ba => ba.listing_id).filter(id => isValidUuid(id));
      if (T.length > 0) {
        const { data: vt } = await supabase.from("solar_listings").select("*").in("id", T);
        j(vt || []);
      }
    }
  }, [e, r]);
  useEffect(()=>{
    if(!e){
      g(!1);
      return
    }g(!0),m(null),xt().finally(()=>g(!1))
  },[e,xt]),useEffect(()=>{
    if (r) {
      z(r.full_name || "");
      Y(r.phone || "");
      ye(r.city || "");
      le(r.business_name || "");
      Xe(r.business_address || "");
      const cleanInitEmail = r.email || e?.email || "";
      setProfileEmail(cleanInitEmail.endsWith("@sellsolar.local") ? "" : cleanInitEmail);
    } else if (e) {
      const cleanInitEmail = e.email || "";
      setProfileEmail(cleanInitEmail.endsWith("@sellsolar.local") ? "" : cleanInitEmail);
    }
  },[r,e]);
  const yr=async P=>{
    if(!confirm("Delete this listing?"))return;
    k(P);
    const{
      error:Q
    }=await supabase.from("solar_listings").delete().eq("id",P);
    Q?m(Q.message):o(de=>de.filter(te=>te.id!==P)),k(null)
  },Ft=async P=>{
    k(P);
    const Q=l.find(te=>te.id===P),{
      error:de
    }=await supabase.from("solar_listings").update({
      is_sold:!(Q!=null&&Q.is_sold)
    }).eq("id",P);
    de?m(de.message):o(te=>te.map(T=>T.id===P?{
      ...T,is_sold:!T.is_sold
    }:T)),k(null)
  },Ds=async P=>{
    k(P);
    const{
      error:Q
    }=await supabase.from("solar_listings").update({
      status:"pending"
    }).eq("id",P);
    Q?m(Q.message):o(de=>de.map(te=>te.id===P?{
      ...te,status:"pending"
    }:te)),k(null)
  },Ms=async P=>{
    k(P);
    const{
      error:Q
    }=await supabase.from("favorites").delete().eq("id",P);
    Q?m(Q.message):(h(de=>de.filter(te=>te.id!==P)),j(de=>de.filter(te=>{
      var T;
      return!((T=d.find(vt=>vt.id===P))!=null&&T.listing_id.includes(te.id))
    }))),k(null)
  },Us=async P=>{
    const{
      error:Q
    }=await supabase.from("notifications").update({
      is_read:!0
    }).eq("id",P);
    Q?m(Q.message):y(de=>de.map(te=>te.id===P?{
      ...te,is_read:!0
    }:te))
  },ja=async()=>{
    if(!e&&!r)return;
    m(null);
    S(null);
    setFieldErrors({ phone: "", email: "" });

    if(!L.trim()){
      m("Full Name is required.");
      return;
    }
    if(!ke.trim()){
      m("Please select your city.");
      return;
    }
    if(oe&&!Be.trim()){
      m("Business name is required.");
      return;
    }
    if(oe&&!We.trim()){
      m("Business address is required.");
      return;
    }

    const cleanP = normalizePhone(I);
    if(I&&!isValidPhone(cleanP)){
      const errMsg = "Phone number must be exactly 11 digits (e.g. 03001234567).";
      m(errMsg);
      setFieldErrors(prev => ({ ...prev, phone: errMsg }));
      return;
    }

    const cleanEm = profileEmail.trim().toLowerCase();
    if(cleanEm&&!isValidEmail(cleanEm)){
      const errMsg = "Please enter a valid email address (e.g. name@example.com).";
      m(errMsg);
      setFieldErrors(prev => ({ ...prev, email: errMsg }));
      return;
    }

    k("profile");
    try {
      if (updateProfile) {
        await updateProfile({
          fullName: L,
          phone: I,
          email: cleanEm,
          city: ke,
          businessName: oe ? Be : null,
          businessAddress: oe ? We : null,
        });
      } else {
        let targetProfileId = e?.id || r?.id;
        if (!isValidUuid(targetProfileId) && (e?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() || r?.is_admin)) {
          targetProfileId = DEFAULT_ADMIN_ID;
        }
        if (isValidUuid(targetProfileId) && isSupabaseConfigured()) {
          const upd = { full_name: L, phone: cleanP || null, city: ke || null, business_name: oe ? Be : null, business_address: oe ? We : null };
          if (cleanEm) upd.email = cleanEm;
          await supabase.from("profiles").update(upd).eq("id", targetProfileId);
        }
      }
      S("Profile and contact details updated successfully!");
      if (n) await n();
      setTimeout(() => S(null), 4000);
    } catch (err) {
      console.warn("Profile update error:", err);
      const msg = err.message || "Failed to update profile. Please try again.";
      m(msg);
      if (msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("number")) {
        setFieldErrors(prev => ({ ...prev, phone: msg }));
      }
      if (msg.toLowerCase().includes("email")) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      }
    } finally {
      k(null);
    }
  },Bt=async()=>{
    if(!e||!r)return;
    if(!_.title.trim()||!_.price.trim()){
      m("Please fill in title and price");
      return
    }
    const pVal = parseFloat(_.price);
    if(isNaN(pVal) || pVal <= 0){
      m("Please enter a valid positive price in PKR");
      return
    }
    if(_.capacity_kw && (isNaN(parseFloat(_.capacity_kw)) || parseFloat(_.capacity_kw) < 0)){
      m("Capacity must be a positive number in kW");
      return
    }
    if(_.seller_phone&&!isValidPhone(_.seller_phone)){
      m("Phone number must be exactly 11 digits.");
      return
    }k("add-product");
    let submitUserId = e.id;
    if (!isValidUuid(submitUserId)) {
      submitUserId = e.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ? DEFAULT_ADMIN_ID : null;
    }
    const newProductData = {
      title:_.title,brand:_.brand,category:_.category,condition:_.condition,price:parseFloat(_.price),city:_.city,capacity_kw:_.capacity_kw?parseFloat(_.capacity_kw):null,warranty_years:_.warranty_years !== null && _.warranty_years !== "" && !isNaN(Number(_.warranty_years)) ? parseFloat(Number(_.warranty_years).toFixed(4)) : null,image_url:_.image_url||null,description:_.description||null,seller_name:_.seller_name||r.full_name,seller_phone:_.seller_phone||r.phone,user_id:isValidUuid(submitUserId)?submitUserId:null,status:D,featured:!1,sponsored:!1,is_sold:!1,views:0
    };
    try {
      await supabase.from("solar_listings").insert(newProductData);
    } catch(err) {}
    try {
      const raw = localStorage.getItem("sellsolar_custom_listings");
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({
        ...newProductData,
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `local-${Date.now()}`,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("sellsolar_custom_listings", JSON.stringify(list));
    } catch(err) {}
    S(D==="draft"?"Draft saved":"Product submitted for approval");
    A({
      title:"",brand:BRANDS[0],category:"panel",condition:"new",price:"",city:CITIES[0],capacity_kw:"",warranty_years:"",image_url:"",description:"",seller_name:"",seller_phone:""
    });
    await xt();
    a("products");
    setTimeout(()=>S(null),3e3);
    k(null);
  },zs=async()=>{
    if(X!==we){
      m("Passwords do not match");
      return
    }if(X.length<8){
      m("Password must be at least 8 characters");
      return
    }k("password");
    const{
      error:P
    }=await supabase.auth.updateUser({
      password:X
    });
    P?m(P.message):(S("Password changed successfully"),St(""),Ve(""),setTimeout(()=>S(null),3e3)),k(null)
  },Fs=l.filter(P=>P.status==="draft"),b=l.filter(P=>P.status==="pending"),O=l.filter(P=>P.status==="approved"),q=l.filter(P=>P.status==="rejected"),V=l.filter(P=>P.is_sold),_a=l.reduce((P,Q)=>P+(Q.views||0),0),Bs=p.filter(P=>!P.is_read),Mf=[{
    id:"dashboard",label:"Dashboard",icon:LayoutDashboard
  },{
    id:"profile",label:"My Profile",icon:User
  },{
    id:"products",label:"My Products",icon:Tag,badge:l.length
  },{
    id:"add-product",label:"Add Product",icon:CirclePlus
  },{
    id:"drafts",label:"Draft Products",icon:FilePen,badge:Fs.length
  },{
    id:"pending",label:"Pending Products",icon:Clock,badge:b.length
  },{
    id:"approved",label:"Approved Products",icon:CircleCheckBig,badge:O.length
  },{
    id:"rejected",label:"Rejected Products",icon:CircleX,badge:q.length
  },{
    id:"sold",label:"Sold Products",icon:DollarSign,badge:V.length
  },{
    id:"favorites",label:"Favorites",icon:Heart,badge:d.length
  },{
    id:"messages",label:"Messages",icon:MessageSquare,badge:c.length
  },{
    id:"enquiries",label:"Enquiries",icon:Mail
  },{
    id:"notifications",label:"Notifications",icon:Bell,badge:Bs.length
  },{
    id:"settings",label:"Account Settings",icon:Settings
  },{
    id:"password",label:"Change Password",icon:Lock
  }],fc=P=>jsx("div",{
    className:"card p-4",children:jsxs("div",{
      className:"flex items-start gap-4",children:[jsx("div",{
        className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:P.image_url?jsx("img",{
          src:P.image_url,alt:P.title,className:"h-full w-full object-cover"
        }):jsx("div",{
          className:"flex h-full items-center justify-center",children:jsx(Tag,{
            className:"h-6 w-6 text-gray-300"
          })
        })
      }),jsxs("div",{
        className:"min-w-0 flex-1",children:[jsx("h3",{
          className:"truncate text-sm font-bold text-gray-900",children:P.title
        }),jsxs("div",{
          className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
            className:"font-semibold text-primary-600",children:CATEGORIES[P.category]
          }),jsx("span",{
            children:"•"
          }),jsx("span",{
            children:P.brand
          }),jsx("span",{
            children:"•"
          }),jsx("span",{
            children:P.city
          }),jsx("span",{
            children:"•"
          }),jsx("span",{
            className:"font-bold text-gray-700",children:formatPrice(P.price)
          }),jsx("span",{
            children:"•"
          }),jsxs("span",{
            className:"flex items-center gap-0.5",children:[jsx(Eye,{
              className:"h-3 w-3"
            }),P.views]
          })]
        }),jsxs("div",{
          className:"mt-1.5 flex flex-wrap items-center gap-2",children:[jsx("span",{
            className:`rounded-full px-2 py-0.5 text-xs font-bold ${P.status==="approved"?"bg-secondary-100 text-secondary-700":P.status==="pending"?"bg-warning-100 text-warning-700":P.status==="rejected"?"bg-error-100 text-error-700":"bg-gray-100 text-gray-600"}`,children:P.status.charAt(0).toUpperCase()+P.status.slice(1)
          }),P.featured&&jsx("span",{
            className:"rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700",children:"Featured"
          }),P.sponsored&&jsx("span",{
            className:"rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700",children:"Sponsored"
          }),P.is_sold&&jsx("span",{
            className:"rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700",children:"Sold"
          }),P.status==="rejected"&&P.rejection_reason&&jsxs("span",{
            className:"text-xs text-error-500",children:["Reason: ",P.rejection_reason]
          })]
        })]
      }),jsxs("div",{
        className:"flex shrink-0 flex-col items-end gap-1.5",children:[P.status==="draft"&&jsxs("button",{
          onClick:()=>Ds(P.id),disabled:v===P.id,className:"flex items-center gap-1 rounded-lg bg-primary-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 disabled:opacity-50",children:[v===P.id?jsx(LoaderCircle,{
            className:"h-3 w-3 animate-spin"
          }):jsx(Clock,{
            className:"h-3 w-3"
          }),"Submit"]
        }),!P.is_sold&&P.status==="approved"&&jsxs("button",{
          onClick:()=>Ft(P.id),disabled:v===P.id,className:"flex items-center gap-1 rounded-lg bg-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50",children:[jsx(DollarSign,{
            className:"h-3 w-3"
          })," Mark Sold"]
        }),P.is_sold&&jsxs("button",{
          onClick:()=>Ft(P.id),disabled:v===P.id,className:"flex items-center gap-1 rounded-lg bg-secondary-100 px-2.5 py-1.5 text-xs font-semibold text-secondary-700 hover:bg-secondary-200 disabled:opacity-50",children:[jsx(CircleCheckBig,{
            className:"h-3 w-3"
          })," Mark Available"]
        }),jsx("button",{
          onClick:()=>yr(P.id),disabled:v===P.id,className:"flex h-8 w-8 items-center justify-center rounded-lg text-error-500 hover:bg-error-50 disabled:opacity-50",children:v===P.id?jsx(LoaderCircle,{
            className:"h-3.5 w-3.5 animate-spin"
          }):jsx(Trash2,{
            className:"h-3.5 w-3.5"
          })
        })]
      })]
    })
  },P.id),Uf=()=>{
    var de;
    if(C)return jsxs("div",{
      className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
        className:"h-10 w-10 animate-spin text-primary-500"
      }),jsx("p",{
        className:"mt-4 text-sm text-gray-500",children:"Loading your dashboard..."
      })]
    });
    const P=()=>f&&jsxs("div",{
      className:"mb-6 flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
        className:"h-4 w-4 shrink-0 mt-0.5"
      }),jsx("span",{
        children:f
      }),jsx("button",{
        onClick:()=>m(null),className:"ml-auto text-error-400 hover:text-error-600",children:"×"
      })]
    }),Q=()=>x&&jsxs("div",{
      className:"mb-6 flex items-start gap-2 rounded-lg bg-secondary-50 p-3 text-sm text-secondary-700",children:[jsx(CircleCheckBig,{
        className:"h-4 w-4 shrink-0 mt-0.5"
      }),jsx("span",{
        children:x
      })]
    });
    switch(s){
      case"dashboard":return jsxs("div",{
        children:[jsxs("div",{
          className:"mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",children:[jsxs("div",{
            children:[jsxs("h1",{
              className:"text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white",children:["Welcome, ",((de=r==null?void 0:r.full_name)==null?void 0:de.split(" ")[0])||"User","!"]
            }),jsxs("p",{
              className:"mt-1 text-sm text-gray-500 dark:text-gray-400",children:[oe?"Dealer Dashboard":"Seller Dashboard"," — manage your products and enquiries."]
            })]
          }),jsxs("div",{
            className:"flex items-center gap-2",children:[jsxs("button",{
              type:"button",
              onClick:()=>a("add-product"),
              className:"btn-primary text-sm py-2 px-3.5 shadow-sm inline-flex items-center gap-1.5",
              children:[jsx(CirclePlus,{ className:"h-4 w-4" }),"Add Product"]
            }),jsxs("button",{
              type:"button",
              onClick:()=>a("products"),
              className:"btn-ghost text-sm py-2 px-3.5 border border-gray-200 dark:border-gray-700 inline-flex items-center gap-1.5",
              children:[jsx(Tag,{ className:"h-4 w-4" }),"My Products"]
            })]
          })]
        }),P(),Q(),jsx("div",{
          className:"grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",children:[{
            label:"All Products",value:l.length,icon:Tag,color:"text-primary-500 bg-primary-50 dark:bg-primary-950/50",tab:"products",hint:"Click to view listings"
          },{
            label:"Approved",value:O.length,icon:CircleCheckBig,color:"text-secondary-500 bg-secondary-50 dark:bg-secondary-950/50",tab:"approved",hint:"Live on site"
          },{
            label:"Pending",value:b.length,icon:Clock,color:"text-warning-500 bg-warning-50 dark:bg-warning-950/50",tab:"pending",hint:"Awaiting approval"
          },{
            label:"Rejected",value:q.length,icon:CircleX,color:"text-error-500 bg-error-50 dark:bg-error-950/50",tab:"rejected",hint:"Needs review"
          },{
            label:"Sold",value:V.length,icon:DollarSign,color:"text-gray-600 bg-gray-100 dark:bg-gray-800",tab:"sold",hint:"Completed sales"
          },{
            label:"Favorites",value:d.length,icon:Heart,color:"text-error-500 bg-error-50 dark:bg-error-950/50",tab:"favorites",hint:"Saved items"
          },{
            label:"Enquiries",value:c.length,icon:MessageSquare,color:"text-accent-500 bg-accent-50 dark:bg-accent-950/50",tab:"enquiries",hint:"Buyer messages"
          },{
            label:"Total Views",value:_a,icon:TrendingUp,color:"text-primary-500 bg-primary-50 dark:bg-primary-950/50",tab:"products",hint:"Listing impressions"
          }].map(T=>{
            const vt=T.icon;
            return jsxs("button",{
              type:"button",
              onClick:()=>a(T.tab),
              title:`View ${T.label}`,
              className:"card p-4 text-left transition-all duration-200 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 hover:-translate-y-0.5 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary-500/30",
              children:[
                jsxs("div",{
                  className:"flex items-center justify-between mb-2",
                  children:[
                    jsx("div",{
                      className:`flex h-10 w-10 items-center justify-center rounded-xl ${T.color} transition-transform group-hover:scale-110`,
                      children:jsx(vt,{ className:"h-5 w-5" })
                    }),
                    jsx(ChevronRight,{
                      className:"h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all"
                    })
                  ]
                }),
                jsx("div",{
                  className:"text-2xl font-extrabold text-gray-900 dark:text-white",
                  children:T.value
                }),
                jsx("div",{
                  className:"text-xs font-bold text-gray-700 dark:text-gray-200 mt-0.5",
                  children:T.label
                }),
                jsx("div",{
                  className:"text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors",
                  children:T.hint
                })
              ]
            }, T.label)
          })
        }),b.length>0&&jsxs("div",{
          className:"mt-8",children:[jsx("h2",{
            className:"mb-4 text-lg font-bold text-gray-900 dark:text-white",children:"Awaiting Approval"
          }),jsx("div",{
            className:"space-y-3",children:b.map(fc)
          })]
        })]
      });
      case"profile":return jsxs("div",{
        className:"max-w-2xl",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white",children:"My Profile"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500 dark:text-gray-400",children:"Update your personal information, phone number, and email address."
        }),P(),Q(),jsxs("div",{
          className:"card p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm rounded-2xl",children:[jsxs("div",{
            className:"mb-6 flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800",children:[jsx("div",{
              className:"flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md",children:oe?jsx(Store,{
                className:"h-8 w-8 text-white"
              }):jsx("span",{
                className:"text-2xl font-bold text-white",children:(L.trim().charAt(0) || "U").toUpperCase()
              })
            }),jsxs("div",{
              className:"min-w-0 flex-1",children:[jsx("h2",{
                className:"text-lg font-bold text-gray-900 dark:text-white truncate",children:r?.full_name || L || "User Profile"
              }),jsx("p",{
                className:"text-sm text-gray-500 dark:text-gray-400 font-medium truncate",children:profileEmail || r?.username || (e?.email?.endsWith('@sellsolar.local')?e.email.replace('@sellsolar.local',''):e?.email) || ""
              }),oe&&jsx("span",{
                className:`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${r!=null&&r.is_verified_dealer?"bg-secondary-100 text-secondary-700 dark:bg-secondary-950/60 dark:text-secondary-400":"bg-warning-100 text-warning-700 dark:bg-warning-950/60 dark:text-warning-400"}`,children:r!=null&&r.is_verified_dealer?jsxs(Fragment,{
                  children:[jsx(BadgeCheck,{
                    className:"h-3.5 w-3.5"
                  })," Verified Dealer"]
                }):"Pending Dealer Verification"
              })]
            })]
          }),jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200",children:"Full Name *"
              }),jsx("input",{
                type:"text",value:L,onChange:T=>z(T.target.value),placeholder:"Enter your full name",className:"input-field"
              })]
            }),jsxs("div",{
              children:[jsxs("div",{
                className:"flex items-center justify-between mb-1.5",children:[jsx("label",{
                  className:"block text-sm font-semibold text-gray-700 dark:text-gray-200",children:"Email Address"
                }),jsx("span",{
                  className:"text-xs text-gray-400 dark:text-gray-500",children:"Account & Login Email"
                })]
              }),jsxs("div",{
                className:"relative",children:[jsx(Mail,{
                  className:"pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                }),jsx("input",{
                  type:"email",value:profileEmail,onChange:T=>{
                    setProfileEmail(T.target.value);
                    if(fieldErrors.email)setFieldErrors(prev=>({...prev,email:""}));
                  },placeholder:"yourname@example.com",className:`input-field pl-10 ${fieldErrors.email?"border-error-500 focus:ring-error-500":""}`
                })]
              }),fieldErrors.email?jsxs("p",{
                className:"mt-1.5 text-xs text-error-600 dark:text-error-400 font-medium flex items-center gap-1",children:[jsx(CircleAlert,{className:"h-3.5 w-3.5 shrink-0"}),fieldErrors.email]
              }):jsx("p",{
                className:"mt-1 text-xs text-gray-500 dark:text-gray-400",children:"System checks if email is already registered with another account before updating."
              })]
            }),jsxs("div",{
              children:[jsxs("div",{
                className:"flex items-center justify-between mb-1.5",children:[jsx("label",{
                  className:"block text-sm font-semibold text-gray-700 dark:text-gray-200",children:"Phone Number (11 Digits) *"
                }),jsx("span",{
                  className:"text-xs font-mono text-gray-400 dark:text-gray-500",children:`${normalizePhone(I).length}/11`
                })]
              }),jsxs("div",{
                className:"relative",children:[jsx(Phone,{
                  className:"pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                }),jsx("input",{
                  type:"tel",inputMode:"numeric",maxLength:11,value:I,onChange:T=>{
                    Y(digitsOnlyPhone(T.target.value));
                    if(fieldErrors.phone)setFieldErrors(prev=>({...prev,phone:""}));
                  },placeholder:"03001234567",className:`input-field pl-10 font-mono tracking-wide ${fieldErrors.phone?"border-error-500 focus:ring-error-500":""}`
                })]
              }),fieldErrors.phone?jsxs("p",{
                className:"mt-1.5 text-xs text-error-600 dark:text-error-400 font-medium flex items-center gap-1",children:[jsx(CircleAlert,{className:"h-3.5 w-3.5 shrink-0"}),fieldErrors.phone]
              }):jsx("p",{
                className:"mt-1 text-xs text-gray-500 dark:text-gray-400",children:"Pakistani phone number (03xxxxxxxxx). Verified for duplicate prevention."
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200",children:"City *"
              }),jsxs("select",{
                value:ke,onChange:T=>ye(T.target.value),className:"input-field",children:[jsx("option",{
                  value:"",children:"Select city"
                }),CITIES.map(T=>jsx("option",{
                  value:T,children:T
                },T))]
              })]
            }),oe&&jsxs(Fragment,{
              children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200",children:"Business Name *"
                }),jsx("input",{
                  type:"text",value:Be,onChange:T=>le(T.target.value),placeholder:"Your company or shop name",className:"input-field"
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200",children:"Business Address *"
                }),jsx("input",{
                  type:"text",value:We,onChange:T=>Xe(T.target.value),placeholder:"Shop / Office address",className:"input-field"
                })]
              })]
            }),jsxs("div",{
              className:"pt-2 flex flex-col sm:flex-row sm:items-center gap-3",children:[jsxs("button",{
                onClick:ja,disabled:v==="profile",className:"btn-primary inline-flex items-center justify-center gap-2 min-w-[160px]",children:[v==="profile"?jsx(LoaderCircle,{
                  className:"h-4 w-4 animate-spin"
                }):jsx(CircleCheckBig,{
                  className:"h-4 w-4"
                }),v==="profile"?"Saving Changes...":"Save Changes"]
              }),jsx("span",{
                className:"text-xs text-gray-500 dark:text-gray-400",children:"All checks will run automatically before saving."
              })]
            })]
          })]
        })]
      });
      case"add-product":return jsxs("div",{
        className:"max-w-2xl",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Add Product"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"List a new solar product for sale"
        }),P(),Q(),jsx("div",{
          className:"card p-6",children:jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Product Title *"
              }),jsx("input",{
                type:"text",value:_.title,onChange:T=>A({
                  ..._,title:T.target.value
                }),placeholder:"e.g. Longi 450W Solar Panel",className:"input-field"
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Brand"
                }),jsx("select",{
                  value:_.brand,onChange:T=>A({
                    ..._,brand:T.target.value
                  }),className:"input-field",children:BRANDS.map(T=>jsx("option",{
                    value:T,children:T
                  },T))
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Category"
                }),jsxs("select",{
                  value:_.category,onChange:T=>A({
                    ..._,category:T.target.value
                  }),className:"input-field",children:[jsx("option",{
                    value:"panel",children:"Solar Panels"
                  }),jsx("option",{
                    value:"inverter",children:"Inverters"
                  }),jsx("option",{
                    value:"battery",children:"Batteries"
                  }),jsx("option",{
                    value:"complete_system",children:"Complete Systems"
                  })]
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Condition"
                }),jsxs("select",{
                  value:_.condition,onChange:T=>A({
                    ..._,condition:T.target.value
                  }),className:"input-field",children:[jsx("option",{
                    value:"new",children:"New"
                  }),jsx("option",{
                    value:"used",children:"Used"
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Price (PKR) *"
                }),jsxs("div",{
                  className:"relative",children:[jsx("span",{
                    className:"absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-black text-gray-700 dark:text-gray-200 select-none",children:"PKR"
                  }),jsx("input",{
                    type:"number",min:"0",step:"any",onKeyDown:T=>{if(T.key==='-'||T.key==='e'||T.key==='+')T.preventDefault()},value:_.price,onChange:T=>{
                      const v=T.target.value;
                      if(v===""||(!isNaN(v)&&Number(v)>=0)){
                        A({..._,price:v});
                      }
                    },placeholder:"e.g. 50000",className:"input-field pl-16 font-semibold"
                  })]
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"City"
                }),jsx("select",{
                  value:_.city,onChange:T=>A({
                    ..._,city:T.target.value
                  }),className:"input-field",children:CITIES.map(T=>jsx("option",{
                    value:T,children:T
                  },T))
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Capacity (kW)"
                }),jsxs("div",{
                  className:"relative",children:[jsx(Zap,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-500"
                  }),jsx("input",{
                    type:"number",min:"0",step:"any",onKeyDown:T=>{if(T.key==='-'||T.key==='e'||T.key==='+')T.preventDefault()},value:_.capacity_kw,onChange:T=>{
                      const v=T.target.value;
                      if(v===""||(!isNaN(v)&&Number(v)>=0)){
                        A({..._,capacity_kw:v});
                      }
                    },placeholder:"e.g. 5",className:"input-field pl-11 font-semibold"
                  })]
                })]
              })]
            }),jsx("div",{
              className:"rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4",children:jsx(WarrantySelector,{
                value:_.warranty_years,onChange:val=>A({
                  ..._,warranty_years:val
                })
              })
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Image URL"
              }),jsx("input",{
                type:"text",value:_.image_url,onChange:T=>A({
                  ..._,image_url:T.target.value
                }),placeholder:"https://...",className:"input-field"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Description"
              }),jsx("textarea",{
                value:_.description,onChange:T=>A({
                  ..._,description:T.target.value
                }),placeholder:"Describe your product...",className:"input-field min-h-[80px]"
              })]
            }),jsxs("div",{
              className:"flex gap-3 pt-2",children:[jsxs("button",{
                onClick:()=>{
                  H("pending"),Bt()
                },disabled:v==="add-product",className:"btn-primary flex-1",children:[v==="add-product"?jsx(LoaderCircle,{
                  className:"h-4 w-4 animate-spin"
                }):jsx(CirclePlus,{
                  className:"h-4 w-4"
                }),"Submit for Approval"]
              }),jsxs("button",{
                onClick:()=>{
                  H("draft"),Bt()
                },disabled:v==="add-product",className:"btn-ghost flex-1",children:[jsx(FilePen,{
                  className:"h-4 w-4"
                }),"Save as Draft"]
              })]
            })]
          })
        })]
      });
      case"products":case"drafts":case"pending":case"approved":case"rejected":case"sold":const te=s==="products"?l:s==="drafts"?Fs:s==="pending"?b:s==="approved"?O:s==="rejected"?q:V;
      return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:s==="products"?"All Products":s==="drafts"?"Draft Products":s==="pending"?"Pending Products":s==="approved"?"Approved Products":s==="rejected"?"Rejected Products":"Sold Products"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[te.length," ",te.length===1?"product":"products"]
        }),P(),te.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(Package,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No products here"
          }),jsxs("button",{
            onClick:()=>a("add-product"),className:"btn-primary mt-4",children:[jsx(CirclePlus,{
              className:"h-4 w-4"
            })," Add a Product"]
          })]
        }):jsx("div",{
          className:"space-y-3",children:te.map(fc)
        })]
      });
      case"favorites":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Favorites"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[w.length," saved listings"]
        }),w.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(Heart,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No favorites yet"
          }),jsx("p",{
            className:"mt-1 text-sm text-gray-500",children:"Browse listings and tap the heart icon to save them."
          })]
        }):jsx("div",{
          className:"space-y-3",children:w.map(T=>{
            const vt=d.find(ba=>ba.listing_id===T.id);
            return jsxs("div",{
              className:"card flex items-center gap-4 p-4",children:[jsx("div",{
                className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:T.image_url?jsx("img",{
                  src:T.image_url,alt:T.title,className:"h-full w-full object-cover"
                }):jsx(Tag,{
                  className:"h-6 w-6 text-gray-300 m-auto"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("h3",{
                  className:"truncate text-sm font-bold text-gray-900",children:T.title
                }),jsxs("div",{
                  className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
                    className:"font-semibold text-primary-600",children:CATEGORIES[T.category]
                  }),jsx("span",{
                    children:"•"
                  }),jsx("span",{
                    children:formatPrice(T.price)
                  }),jsx("span",{
                    children:"•"
                  }),jsxs("span",{
                    className:"flex items-center gap-0.5",children:[jsx(MapPin,{
                      className:"h-3 w-3"
                    }),T.city]
                  })]
                })]
              }),vt&&jsx("button",{
                onClick:()=>Ms(vt.id),disabled:v===vt.id,className:"flex h-9 w-9 items-center justify-center rounded-lg text-error-500 hover:bg-error-50 disabled:opacity-50",children:v===vt.id?jsx(LoaderCircle,{
                  className:"h-4 w-4 animate-spin"
                }):jsx(Trash2,{
                  className:"h-4 w-4"
                })
              })]
            },T.id)
          })
        })]
      });
      case"messages":case"enquiries":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:s==="messages"?"Messages":"Enquiries"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[c.length," total"]
        }),c.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(MessageSquare,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No messages yet"
          })]
        }):jsx("div",{
          className:"space-y-3",children:c.map(T=>jsx("div",{
            className:"card p-4",children:jsxs("div",{
              className:"flex items-start gap-3",children:[jsx("div",{
                className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600",children:jsx(MessageSquare,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("p",{
                  className:"text-sm text-gray-700",children:T.message||"No message"
                }),T.contact_phone&&jsxs("p",{
                  className:"mt-1 flex items-center gap-1 text-xs text-gray-500",children:[jsx(Phone,{
                    className:"h-3 w-3"
                  }),T.contact_phone]
                }),jsxs("p",{
                  className:"mt-1 flex items-center gap-1 text-xs text-gray-400",children:[jsx(Calendar,{
                    className:"h-3 w-3"
                  }),new Date(T.created_at).toLocaleDateString("en-PK")]
                })]
              }),!T.is_read&&jsx("span",{
                className:"h-2 w-2 shrink-0 rounded-full bg-error-500"
              })]
            })
          },T.id))
        })]
      });
      case"notifications":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Notifications"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[p.length," total, ",Bs.length," unread"]
        }),p.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(Bell,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No notifications"
          })]
        }):jsx("div",{
          className:"space-y-3",children:p.map(T=>jsx("div",{
            className:`card p-4 ${T.is_read?"":"ring-1 ring-primary-200"}`,children:jsxs("div",{
              className:"flex items-start gap-3",children:[jsx("div",{
                className:`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${T.is_read?"bg-gray-100 text-gray-400":"bg-primary-50 text-primary-600"}`,children:jsx(Bell,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("h3",{
                  className:"text-sm font-bold text-gray-900",children:T.title
                }),T.message&&jsx("p",{
                  className:"mt-0.5 text-sm text-gray-600",children:T.message
                }),jsx("p",{
                  className:"mt-1 text-xs text-gray-400",children:new Date(T.created_at).toLocaleDateString("en-PK")
                })]
              }),!T.is_read&&jsx("button",{
                onClick:()=>Us(T.id),className:"text-xs font-semibold text-primary-600 hover:text-primary-700",children:"Mark read"
              })]
            })
          },T.id))
        })]
      });
      case"settings":return jsxs("div",{
        className:"max-w-2xl",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Account Settings"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Manage your account preferences"
        }),P(),jsx("div",{
          className:"card p-6",children:jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Username"
              }),jsx("input",{
                type:"text",value:(r?.username||(e?.email?.endsWith('@sellsolar.local')?e.email.replace('@sellsolar.local',''):e?.email))||"",disabled:!0,className:"input-field bg-gray-50 font-medium"
              }),jsx("p",{
                className:"mt-1 text-xs text-gray-400",children:"Username cannot be changed"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Account Type"
              }),jsxs("div",{
                className:"flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3",children:[oe?jsx(Store,{
                  className:"h-5 w-5 text-primary-500"
                }):jsx(User,{
                  className:"h-5 w-5 text-primary-500"
                }),jsx("span",{
                  className:"text-sm font-semibold text-gray-700",children:oe?"Dealer":"Individual"
                }),oe&&(r==null?void 0:r.is_verified_dealer)&&jsx(BadgeCheck,{
                  className:"h-4 w-4 text-secondary-500"
                })]
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Member Since"
              }),jsx("p",{
                className:"text-sm text-gray-600",children:r!=null&&r.created_at?new Date(r.created_at).toLocaleDateString("en-PK",{
                  year:"numeric",month:"long",day:"numeric"
                }):"N/A"
              })]
            })]
          })
        })]
      });
      case"password":return jsxs("div",{
        className:"max-w-md",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Change Password"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Update your account password"
        }),P(),Q(),jsx("div",{
          className:"card p-6",children:jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"New Password"
              }),jsx("input",{
                type:"password",value:X,onChange:T=>St(T.target.value),placeholder:"At least 8 characters",className:"input-field"
              }),jsx("p",{
                className:"mt-1.5 text-xs text-gray-400",children:"Any 8 or more characters."
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Confirm Password"
              }),jsx("input",{
                type:"password",value:we,onChange:T=>Ve(T.target.value),className:"input-field"
              })]
            }),jsxs("button",{
              onClick:zs,disabled:v==="password",className:"btn-primary",children:[v==="password"?jsx(LoaderCircle,{
                className:"h-4 w-4 animate-spin"
              }):jsx(Lock,{
                className:"h-4 w-4"
              }),"Change Password"]
            })]
          })
        })]
      });
      default:return null
    }
  };
  return jsx(Df,{
    navItems:Mf,activeTab:s,onTabChange:P=>a(P),onBack:t,badgeColor:"bg-primary-100 text-primary-700",headerLabel:oe?"Dealer":"Individual",headerIcon:oe?Store:User,children:jsx("div",{
      className:"p-4 lg:p-8",children:Uf()
    })
  })
}function jx({
  listingId:t,onBack:e
}){
  const[r,n]=useState(null),[s,a]=useState(null),[l,o]=useState(!0),[c,u]=useState(null),[d,h]=useState(!1),[activePhotoIdx,setActivePhotoIdx]=useState(0),[inquiryModalOpen,setInquiryModalOpen]=useState(!1);
  const { user: currentUser } = useAuth();
  const toastCtx = useToast ? useToast() : null;
  useEffect(()=>{
    (async()=>{
      o(!0),u(null);
      try{
        let found = null;
        try {
          const{
            data:m,error:v
          }=await supabase.from("solar_listings").select("*").eq("id",t).maybeSingle();
          if(!v && m) found = m;
        } catch(err) {
          // ignore supabase error and try local
        }
        if(!found) {
          found = getLocalOrSeedListingById(t);
        }
        if(!found){
          u("Listing not found");
          return;
        }
        const k = found;
        n(k);
        applyPageSeo('listing-detail', { listing: k, listingId: t });
        if(k.user_id && isValidUuid(k.user_id)){
          try {
            const{
              data:x
            }=await supabase.from("profiles").select("*").eq("id",k.user_id).maybeSingle();
            x&&a(x);
          } catch(err) {}
        }
      }catch(m){
        u(m instanceof Error?m.message:"Failed to load listing")
      }finally{
        o(!1)
      }
    })()
  },[t]);
  if(l)return jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsxs("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
        className:"h-10 w-10 animate-spin text-primary-500"
      }),jsx("p",{
        className:"mt-4 text-sm text-gray-500",children:"Loading listing..."
      })]
    })
  });
  if(c||!r)return jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsx("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:jsxs("div",{
        className:"card max-w-md p-8 text-center",children:[jsx("p",{
          className:"text-lg font-semibold text-gray-700",children:c||"Listing not found"
        }),jsxs("button",{
          onClick:e,className:"btn-ghost mt-6",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Listings"]
        })]
      })
    })
  });
  const p=r.condition==="used",y=(s==null?void 0:s.business_name)||(s==null?void 0:s.full_name)||r.seller_name||"Seller",w=r.seller_phone||(s==null?void 0:s.phone)||null,j=(s==null?void 0:s.account_type)==="dealer",C=[{
    label:"Brand",value:r.brand
  },{
    label:"Category",value:CATEGORIES[r.category]||r.category
  },{
    label:"Condition",value:p?"Used":"New"
  },{
    label:"Capacity",value:r.capacity_kw?`${r.capacity_kw} kW`:null
  },{
    label:"Warranty",value:formatWarrantyLong(r.warranty_years)
  },{
    label:"City",value:r.city
  }],g=new Date(r.created_at).toLocaleDateString("en-PK",{
    year:"numeric",month:"long",day:"numeric"
  });
  const photos = listingImages(r);
  const detailImg = photos[activePhotoIdx] || r.image_url || getEquipmentFallbackImage(r.category, r.title);

  const handleWhatsApp = () => {
    if (!currentUser) {
      if (toastCtx && toastCtx.showToast) {
        toastCtx.showToast({
          title: "Registration Required",
          message: "Please login or register on SellSolar before contacting the seller via WhatsApp.",
          type: "notice"
        });
      }
      return;
    }
    const phone = w || "03001234567";
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '92' + clean.slice(1);
    } else if (!clean.startsWith('92')) {
      clean = '92' + clean;
    }
    const msg = `Salam! I am interested in your listing: "${r.title}" (PKR ${formatPrice(r.price)}) on SellSolar.pk. Is it still available?`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return jsxs(Fragment, {
    children: [
      jsxs("div",{
    className:"min-h-screen bg-gray-50 dark:bg-gray-950",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:e,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900 dark:text-white",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsxs("button",{
          onClick:e,className:"flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Listings"]
        })]
      })
    }),jsx("div",{
      className:"container-page py-8 lg:py-12",children:jsxs("div",{
        className:"mx-auto max-w-5xl",children:[jsxs("div",{
          className:"mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400",children:[jsx("button",{
            onClick:e,className:"hover:text-gray-700 dark:hover:text-gray-200",children:"Home"
          }),jsx("span",{
            children:"/"
          }),jsx("span",{
            className:"font-semibold text-primary-600 dark:text-primary-400",children:CATEGORIES[r.category]||r.category
          }),jsx("span",{
            children:"/"
          }),jsx("span",{
            className:"truncate text-gray-400 dark:text-gray-500",children:r.title
          })]
        }),jsxs("div",{
          className:"grid grid-cols-1 gap-8 lg:grid-cols-5",children:[jsxs("div",{
            className:"lg:col-span-3",children:[jsxs("div",{
              className:"card overflow-hidden",children:[jsxs("div",{
                className:"relative aspect-[4/3] bg-gray-100 dark:bg-gray-800",children:[jsx("img",{
                  src:detailImg,alt:r.title,referrerPolicy:"no-referrer",className:"h-full w-full object-cover",onError:s=>{
                    s.currentTarget.onerror = null;
                    s.currentTarget.src = getEquipmentFallbackImage(r.category, r.title);
                  }
                }),jsxs("div",{
                  className:"absolute left-4 top-4 flex gap-2",children:[jsx("span",{
                    className:`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${p?"bg-warning-500 text-white":"bg-secondary-500 text-white"}`,children:p?"Used":"New"
                  }),r.featured&&jsxs("span",{
                    className:"flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white shadow-sm",children:[jsx(Tag,{
                      className:"h-3 w-3"
                    }),"Featured"]
                  })]
                }),jsxs("div",{
                  className:"absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm",children:[jsx(Eye,{
                    className:"h-3 w-3"
                  }),r.views||0," views"]
                })]
              }),photos.length > 1 && jsx("div",{
                className:"p-3 flex gap-2 overflow-x-auto bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800",children:photos.map((ph, idx)=>jsx("button",{
                  onClick:()=>setActivePhotoIdx(idx),className:`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activePhotoIdx===idx?"border-primary-500 ring-2 ring-primary-500/30 scale-105":"border-transparent opacity-70 hover:opacity-100"}`,children:jsx("img",{
                    src:ph,alt:`${r.title} photo ${idx + 1}`,referrerPolicy:"no-referrer",className:"h-full w-full object-cover",onError:s=>{
                      s.currentTarget.onerror = null;
                      s.currentTarget.src = getEquipmentFallbackImage(r.category, r.title);
                    }
                  })
                },idx))
              })]
            }),r.description&&jsxs("div",{
              className:"card mt-6 p-6",children:[jsx("h2",{
                className:"mb-3 text-lg font-bold text-gray-900 dark:text-white",children:"Description"
              }),jsx("p",{
                className:"text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line",children:r.description
              })]
            }),jsxs("div",{
              className:"card mt-6 p-6",children:[jsx("h2",{
                className:"mb-4 text-lg font-bold text-gray-900 dark:text-white",children:"Specifications"
              }),jsx("div",{
                className:"grid grid-cols-1 gap-3 sm:grid-cols-2",children:C.map(f=>jsxs("div",{
                  className:"flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-3",children:[jsx("span",{
                    className:"text-sm font-medium text-gray-500 dark:text-gray-400",children:f.label
                  }),jsx("span",{
                    className:"text-sm font-bold text-gray-900 dark:text-gray-100",children:f.value||"—"
                  })]
                },f.label))
              })]
            })]
          }),jsx("div",{
            className:"lg:col-span-2",children:jsxs("div",{
              className:"sticky top-24 space-y-4",children:[jsxs("div",{
                className:"card p-6",children:[jsx("h1",{
                  className:"text-xl font-extrabold leading-tight text-gray-900 dark:text-white",children:r.title
                }),jsx("div",{
                  className:"mt-3 flex items-center gap-2",children:jsx("span",{
                    className:"text-3xl font-extrabold text-primary-600 dark:text-primary-400",children:formatPrice(r.price)
                  })
                }),jsxs("div",{
                  className:"mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400",children:[jsxs("span",{
                    className:"flex items-center gap-1",children:[jsx(MapPin,{
                      className:"h-4 w-4 text-primary-500"
                    }),r.city]
                  }),jsxs("span",{
                    className:"flex items-center gap-1",children:[jsx(Calendar,{
                      className:"h-4 w-4"
                    }),g]
                  })]
                }),jsxs("div",{
                  className:"mt-5 space-y-3",children:[
                    jsxs("button",{
                      onClick:handleWhatsApp,
                      className:"flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer",children:[jsx(MessageCircle,{
                        className:"h-5 w-5 fill-white"
                      }),"Contact Seller via WhatsApp"]
                    }),
                    w?jsxs(Fragment,{
                    children:[jsxs("a",{
                      href:`tel:${w}`,className:"btn-primary w-full",children:[jsx(Phone,{
                        className:"h-5 w-5"
                      }),"Call Seller"]
                    }),!d&&jsxs("button",{
                      onClick:()=>h(!0),className:"btn-ghost w-full",children:[jsx(Eye,{
                        className:"h-4 w-4"
                      }),"Show Phone Number"]
                    }),d&&jsxs("div",{
                      className:"rounded-xl bg-primary-50 dark:bg-primary-950/50 p-4 text-center border border-primary-100 dark:border-primary-800",children:[jsx("div",{
                        className:"text-xs font-semibold text-gray-500 dark:text-gray-400",children:"Phone Number"
                      }),jsx("div",{
                        className:"mt-1 text-lg font-extrabold text-primary-700 dark:text-primary-300",children:w
                      })]
                    })]
                  }):jsx("div",{
                    className:"rounded-xl bg-gray-50 dark:bg-gray-800 p-4 text-center text-sm text-gray-500 dark:text-gray-400",children:"No phone number provided"
                  }),jsxs("button",{
                    onClick:()=>setInquiryModalOpen(!0),className:"flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer",children:[jsx(Mail,{
                      className:"h-4 w-4"
                    }),"Send Online Message / Inquiry"]
                  }),jsxs("button",{
                    onClick:handleWhatsApp,className:"btn-ghost w-full",children:[jsx(MessageCircle,{
                      className:"h-4 w-4 text-emerald-600"
                    }),"Send WhatsApp Inquiry"]
                  }),jsxs("button",{
                    onClick:()=>{
                      if(navigator.share){
                        navigator.share({title:r.title,url:window.location.href}).catch(()=>{});
                      }else if(navigator.clipboard){
                        navigator.clipboard.writeText(window.location.href);
                        if(toastCtx && toastCtx.showToast){
                          toastCtx.showToast({title:"Link Copied",message:"Listing link copied to clipboard",type:"success"});
                        }
                      }
                    },className:"btn-ghost w-full",children:[jsx(Share2,{
                      className:"h-4 w-4"
                    }),"Share Listing"]
                  })]
                })]
              }),jsxs("div",{
                className:"card p-6",children:[jsx("h3",{
                  className:"mb-4 text-sm font-bold uppercase tracking-wide text-gray-500",children:"Seller Information"
                }),jsxs("div",{
                  className:"flex items-center gap-3",children:[jsx("div",{
                    className:"flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600",children:j?jsx(Store,{
                      className:"h-6 w-6 text-white"
                    }):jsx("span",{
                      className:"text-lg font-bold text-white",children:y.charAt(0).toUpperCase()
                    })
                  }),jsxs("div",{
                    className:"min-w-0 flex-1",children:[jsxs("div",{
                      className:"flex items-center gap-2",children:[jsx("h4",{
                        className:"truncate text-sm font-bold text-gray-900",children:y
                      }),j&&(s==null?void 0:s.is_verified_dealer)&&jsx(BadgeCheck,{
                        className:"h-4 w-4 shrink-0 text-secondary-500"
                      })]
                    }),j&&jsx("span",{
                      className:"text-xs font-semibold text-primary-600",children:s!=null&&s.is_verified_dealer?"Verified Dealer":"Dealer"
                    })]
                  })]
                }),jsxs("div",{
                  className:"mt-4 space-y-2 text-sm text-gray-600",children:[s!=null&&s.phone||r.seller_phone?jsxs("div",{
                    className:"flex items-center gap-2",children:[jsx(Phone,{
                      className:"h-4 w-4 text-gray-400"
                    }),(s==null?void 0:s.phone)||r.seller_phone]
                  }):null,(s==null?void 0:s.city)&&jsxs("div",{
                    className:"flex items-center gap-2",children:[jsx(MapPin,{
                      className:"h-4 w-4 text-gray-400"
                    }),s.city]
                  }),j&&(s==null?void 0:s.business_address)&&jsxs("div",{
                    className:"flex items-start gap-2",children:[jsx(Store,{
                      className:"h-4 w-4 mt-0.5 text-gray-400 shrink-0"
                    }),jsx("span",{
                      className:"line-clamp-2",children:s.business_address
                    })]
                  }),j&&(s==null?void 0:s.cnic)&&jsxs("div",{
                    className:"flex items-center gap-2",children:[jsx(ShieldCheck,{
                      className:"h-4 w-4 text-gray-400"
                    }),"CNIC: ",s.cnic.slice(0,5),"••••••",s.cnic.slice(-1)]
                  })]
                })]
              }),jsxs("div",{
                className:"card bg-warning-50/50 p-4 ring-1 ring-warning-100",children:[jsxs("h4",{
                  className:"flex items-center gap-1.5 text-sm font-bold text-warning-700",children:[jsx(ShieldCheck,{
                    className:"h-4 w-4"
                  }),"Safety Tips"]
                }),jsxs("ul",{
                  className:"mt-2 space-y-1 text-xs text-warning-600",children:[jsx("li",{
                    children:"• Meet in a safe, public place"
                  }),jsx("li",{
                    children:"• Check the item before paying"
                  }),jsx("li",{
                    children:"• Never pay in advance"
                  }),jsx("li",{
                    children:"• Verify seller identity"
                  })]
                })]
              })]
            })
          })]
        })]
      })
    })]
  }),
  jsx(EmailContactModal, {
    isOpen: inquiryModalOpen,
    onClose: () => setInquiryModalOpen(!1),
    recipientEmail: r.seller_email || "info@sellsolar.pk",
    defaultSubject: `Inquiry: ${r.title} (${formatPrice(r.price)})`
  })
]
});
}
function BrandLogosRow({ onSelectBrand }) {
  const brands = [
    { name: "Longi Solar", short: "Longi", color: "from-blue-600 to-blue-800" },
    { name: "Jinko Solar", short: "Jinko", color: "from-blue-500 to-blue-700" },
    { name: "Canadian Solar", short: "Canadian", color: "from-red-600 to-red-800" },
    { name: "Inverex", short: "Inverex", color: "from-emerald-600 to-emerald-800" },
    { name: "Growatt", short: "Growatt", color: "from-amber-500 to-amber-700" },
    { name: "Knox Solar", short: "Knox", color: "from-purple-600 to-purple-800" }
  ];
  return jsx("section", {
    className: "bg-white dark:bg-gray-950 py-1.5 sm:py-2 border-b border-gray-200/60 dark:border-gray-800 transition-colors",
    children: jsx("div", {
      className: "container-page",
      children: jsxs("div", {
        className: "flex items-center gap-1.5 sm:gap-2.5",
        children: [
          jsxs("span", {
            className: "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0",
            children: [
              jsx(Award, { className: "h-3 w-3 text-primary-500 shrink-0" }),
              jsx("span", { className: "hidden xs:inline", children: "Top" }),
              "Brands:"
            ]
          }),
          jsx("div", {
            className: "grid grid-cols-6 gap-1 sm:gap-1.5 flex-1 min-w-0",
            children: brands.map(b => jsxs("button", {
              onClick: () => onSelectBrand(b.name),
              className: `h-6 sm:h-7.5 w-full rounded-md bg-gradient-to-br ${b.color} flex items-center justify-center shadow-2xs hover:opacity-90 active:scale-95 transition-all cursor-pointer px-0.5`,
              children: [
                jsx("span", { className: "text-white font-bold text-[9px] sm:text-xs tracking-tight truncate", children: b.short })
              ]
            }, b.name))
          })
        ]
      })
    })
  });
}

const Vu={
  category:"",brand:"",condition:"",city:"",minPrice:"",maxPrice:"",query:""
};
function _x({
  onSelectListing:t,onNavigate:nav,initialFilters,isHome
}){
  const { settings } = useSiteSettings();
  const calcBanner = settings?.homePageCms?.calculatorBanner;
  const[e,r]=useState(()=>initialFilters?{...Vu,...initialFilters}:Vu),[n,s]=useState([]),[a,l]=useState(!0),[o,c]=useState(null),[u,d]=useState(0),[h,p]=useState(0),y=useCallback((g,m)=>{
    r(v=>({
      ...v,[g]:m
    }))
  },[]),w=useCallback(()=>{
    p(f=>f+1);
    const g=document.getElementById("listings");
    g&&g.scrollIntoView({
      behavior:"smooth",block:"start"
    })
  },[]),j=useCallback(()=>{
    r(Vu),p(g=>g+1)
  },[]),C=useCallback(g=>{
    r(m=>({
      ...m,category:g
    })),p(m=>m+1);
    const f=document.getElementById("listings");
    f&&f.scrollIntoView({
      behavior:"smooth",block:"start"
    })
  },[]);

  useEffect(()=>{
    if(initialFilters){
      r(prev=>({
        ...prev,
        ...initialFilters
      }));
      p(cnt=>cnt+1);
      setTimeout(()=>{
        const g=document.getElementById("listings");
        g&&g.scrollIntoView({
          behavior:"smooth",block:"start"
        });
      }, 100);
    }
  },[initialFilters]);

  useEffect(()=>{
    let active = true;
    (async()=>{
      l(!0),c(null);
      try{
        let f=supabase.from("solar_listings").select("*",{
          count:"exact"
        }).order("featured",{
          ascending:!1
        }).order("created_at",{
          ascending:!1
        });
        e.category&&(f=f.eq("category",e.category)),e.brand&&(f=f.eq("brand",e.brand)),e.condition&&(f=f.eq("condition",e.condition)),e.city&&(f=f.eq("city",e.city)),e.minPrice&&(f=f.gte("price",parseFloat(e.minPrice))),e.maxPrice&&(f=f.lte("price",parseFloat(e.maxPrice))),e.query&&(f=f.or(`title.ilike.%${e.query}%,brand.ilike.%${e.query}%,description.ilike.%${e.query}%`));
        const{
          data:m,error:v,count:k
        }=await f.limit(16);
        if(!active) return;
        if(!v && m && m.length > 0){
          s(m);
          d(k || m.length);
        } else {
          const fallback = getLocalOrSeedListings(e);
          s(fallback);
          d(fallback.length);
        }
      }catch(f){
        if(!active) return;
        const fallback = getLocalOrSeedListings(e);
        s(fallback);
        d(fallback.length);
      }finally{
        if(active) l(!1);
      }
    })();
    return () => { active = false; };
  },[h,e.category,e.brand,e.condition,e.city,e.minPrice,e.maxPrice,e.query]);

  return jsxs(Fragment,{
    children:[jsx(nx,{
      filters:e,onFilterChange:y,onSearch:w,onReset:j,onNavigatePrices:nav?()=>nav("prices"):void 0,onNavigateCalculator:nav?()=>nav("calculator"):void 0,onNavigateDealers:nav?()=>nav("dealers"):void 0,onNavigateInstallation:nav?()=>nav("installation"):void 0
    }),jsx(PakWheelsSellCards,{
      onPostAd:()=>nav?nav("post-ad"):void 0,
      onInstall:()=>nav?nav("installation"):void 0,
      onNavigate:nav
    }),jsx(DailyMarketRates,{
      onNavigate:nav,
      onSelectCategory:C,
      compact:true
    }),jsx(ix,{
      onSelectCategory:C,
      onSelectCity:(cityName)=>{
        y("city", cityName);
        setTimeout(w, 50);
      },
      onSelectBrand:(brandName)=>{
        y("brand", brandName);
        setTimeout(w, 50);
      }
    }),jsx(BrandLogosRow, { onSelectBrand: (brandName) => { y("brand", brandName); setTimeout(w, 50); } }),jsx(lx,{
      isCarousel:isHome,
      listings:n,loading:a,error:o,totalCount:u,onSelectListing:t,onResetFilters:j,onNavigate:nav,currentCondition:e.condition,onConditionChange:(newCond)=>{
        y("condition", newCond);
        p(cnt => cnt + 1);
      },
      currentCategory:e.category,
      onCategoryChange:(newCat)=>{
        y("category", newCat);
        p(cnt => cnt + 1);
      }
    })]
  })
}

export default function App({ initialPathname, initialSlug }){
  const {
    user: t, profile: e, loading: r, passwordRecovery: pr, isSuperAdmin, isAdmin
  } = useAuth();
  const isUserAdmin = Boolean(t && (isSuperAdmin || isAdmin || e?.is_admin || e?.is_super_admin || e?.role === 'super_admin' || e?.role === 'admin' || t?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()));
  
  const getInitialLocation = () => {
    if (typeof window !== 'undefined') {
      return parseLocation(window.location.pathname, window.location.hash);
    }
    if (initialPathname) {
      return parseLocation(initialPathname, '');
    }
    if (initialSlug && initialSlug.length > 0) {
      return parseLocation(`/${initialSlug.join('/')}`, '');
    }
    return { page: 'home', listingId: null };
  };

  const initialLoc = getInitialLocation();
  const [n, s] = useState(initialLoc.page || "home");
  const [a, l] = useState(initialLoc.listingId || null);
  const [customPageData, setCustomPageData] = useState(initialLoc.customPage || null);
  const [searchFilters, setSearchFilters] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loc = parseLocation(window.location.pathname, window.location.hash);
      if (loc.page && loc.page !== n) {
        s(loc.page);
        if (loc.listingId) l(loc.listingId);
        if (loc.customPage) setCustomPageData(loc.customPage);
      }
    }
  }, []);

  useEffect(() => {
    applyPageSeo(n, { listingId: a });
    recordPageView(typeof window !== 'undefined' ? window.location.pathname : '/');
  }, [n, a]);

  useEffect(() => {
    const handlePopState = () => {
      const loc = parseLocation(window.location.pathname, window.location.hash);
      s(loc.page || 'home');
      l(loc.listingId || null);
      if (loc.customPage) setCustomPageData(loc.customPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const o = d => {
    s(d);
    try {
      const newPath = pageToPath(d, a);
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    } catch {
      // ignore
    }
    window.scrollTo({
      top: 0, behavior: "smooth"
    });
  };

  const c = () => {
    o(t ? "post-ad" : "login");
  };

  const handleNavigate = d => {
    if (d === "post-ad") {
      c();
    } else if (d === "admin" || d === "admin-dashboard") {
      if (!t) {
        o("login");
      } else if (isUserAdmin) {
        o("admin-dashboard");
      } else {
        o("dashboard");
      }
    } else if (d === "dashboard") {
      o(t ? "dashboard" : "login");
    } else if (d === "inbox") {
      if (!t) {
        o("login");
      } else if (isUserAdmin) {
        o("inbox");
      } else {
        o("dashboard");
      }
    } else if (d === "password" || d === "change-password") {
      o("password");
    } else if (typeof d === 'string' && (d.startsWith('custom:') || d.startsWith('/'))) {
      const loc = parseLocation(d.startsWith('/') ? d : d.replace('custom:', ''), '');
      if (loc.customPage) setCustomPageData(loc.customPage);
      o(loc.page);
    } else {
      o(d);
    }
  };

  const u = d => {
    l(d);
    recordProductView(d);
    s("listing-detail");
    try {
      const newPath = pageToPath("listing-detail", d);
      window.history.pushState({}, '', newPath);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGlobalSearchSubmit = filterObj => {
    const formatted = typeof filterObj === 'string' ? { query: filterObj } : (filterObj || {});
    setSearchFilters(formatted);
    if (n !== "home") {
      o("home");
    }
    setTimeout(() => {
      const el = document.getElementById("listings");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const isAuthProtectedPage = n === "dashboard" || n === "admin-dashboard" || n === "post-ad";
  const pageContent = (r && isAuthProtectedPage) ? jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-white dark:bg-gray-950", children: jsx("div", {
      className: "flex h-12 w-12 animate-spin rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-500"
    })
  }) : pr ? jsx(PasswordPage, {
    initialMode: "reset", onSuccess: () => o("home"), onBack: () => o("home")
  }) : n === "password" || n === "change-password" ? jsx(PasswordPage, {
    initialMode: t ? "change" : "forgot", onSuccess: () => o(t ? "dashboard" : "home"), onBack: () => o("home")
  }) : n === "forgot-password" ? jsx(PasswordPage, {
    initialMode: "forgot", onSuccess: () => o("home"), onBack: () => o("home")
  }) : n === "reset-password" ? jsx(PasswordPage, {
    initialMode: "reset", onSuccess: () => o("home"), onBack: () => o("home")
  }) : n === "login" ? jsx(Bn, {
    onSuccess: () => o("home"), onBack: () => o("home"), onForgotPassword: () => o("forgot-password")
  }) : n === "dealers" ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(DealersPage, {
        onNavigate: handleNavigate, onBack: () => o("home"), hasOuterNavbar: true
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  }) : n === "install" || n === "installation" || n === "request-installation" ? jsx(InstallationRequestPage, {
    onBack: () => o("home")
  }) : n === "calculator" || n === "load-calculator" ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(LoadCalculatorPage, {
        onNavigate: handleNavigate, onSelectCategory: cat => {
          handleGlobalSearchSubmit(typeof cat === 'object' ? cat : { category: cat });
        }
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  }) : n === "prices" || n === "today-prices" ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(TodayPricesPage, {
        onNavigate: handleNavigate, onSelectCategory: cat => {
          handleGlobalSearchSubmit(typeof cat === 'object' ? cat : { category: cat });
        }
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  }) : n === "verification" || n === "tier-1-verification" || n === "panel-verification" || n === "tier1-verification" ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(Tier1VerificationPage, {
        onNavigate: handleNavigate
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  }) : KEYWORD_LANDING_KEYS.includes(n) ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(KeywordLandingPage, {
        pageKey: n, onNavigate: handleNavigate
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  }) : FOOTER_PAGES_KEYS.includes(n) ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(CompanyMarketplacePage, {
        page: n, onNavigate: handleNavigate, onPostAd: c
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  }) : (n && typeof n === 'string' && (n.startsWith('custom:') || n === 'custom-page')) ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(CustomPageView, {
        pageData: customPageData || {
          title: n.replace('custom:', '').replace(/^\//, '').toUpperCase(),
          path: n.replace('custom:', '')
        },
        onNavigate: handleNavigate,
        onPostAd: c
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  }) : n === "post-ad" ? t ? jsx(yx, {
    onBack: () => o("home"), onPosted: () => o("home")
  }) : jsx(Bn, {
    onSuccess: () => o("post-ad"), onBack: () => o("home"), onForgotPassword: () => o("forgot-password")
  }) : n === "admin" || n === "admin-dashboard" || n === "dashboard" || n === "inbox" ? (!t) ? jsx(Bn, {
    onSuccess: () => o(n), onBack: () => o("home"), onForgotPassword: () => o("forgot-password")
  }) : jsx(AdminSuperDashboard, {
    onBack: () => o("home"),
    onNavigateToListing: u,
    onPostAd: c,
    onChangePassword: () => o("password"),
    initialTab: n === "inbox" ? "inbox" : "dashboard"
  }) : n === "listing-detail" && a ? jsx(jx, {
    listingId: a, onBack: () => o("home")
  }) : n === "not-found" ? jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100",
    children: [
      jsx(Xy, {
        onNavigate: handleNavigate,
        currentPage: "home",
        onSelectListing: u,
        onSearchSubmit: handleGlobalSearchSubmit
      }),
      jsx("main", {
        id: "main",
        className: "container-page pt-24 sm:pt-28 pb-12 sm:pb-16 text-center max-w-4xl mx-auto px-4",
        children: jsxs("div", {
          className: "flex flex-col items-center",
          children: [
            jsx("div", {
              className: "inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold tracking-wide shadow-sm",
              children: [
                jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }),
                "HTTP 404 • Marketplace Operational"
              ]
            }),
            jsx("h1", {
              className: "text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-2xl leading-tight mb-4",
              children: "This page is missing, but SellSolar is online"
            }),
            jsx("p", {
              className: "text-gray-600 dark:text-gray-300 max-w-xl text-base sm:text-lg leading-relaxed mb-8",
              children: "The link you followed may be broken, outdated, or mistyped. Don't worry — our marketplace, daily rates, load calculator, and seller directory are running normally."
            }),
            jsxs("div", {
              className: "flex flex-wrap items-center justify-center gap-3 mb-10",
              children: [
                jsx("button", {
                  type: "button",
                  onClick: () => o("home"),
                  className: "btn-primary",
                  id: "app-404-btn-home",
                  children: "Return to Homepage"
                }),
                jsx("button", {
                  type: "button",
                  onClick: () => o("buy-solar"),
                  className: "btn-secondary",
                  id: "app-404-btn-buy",
                  children: "Browse Solar Marketplace"
                }),
                jsx("button", {
                  type: "button",
                  onClick: () => o("calculator"),
                  className: "btn-secondary",
                  id: "app-404-btn-calc",
                  children: "Load Calculator"
                })
              ]
            }),
            jsxs("div", {
              className: "w-full text-left mb-10",
              children: [
                jsx("h2", {
                  className: "text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 text-center",
                  children: "Helpful Sections You Might Be Looking For"
                }),
                jsxs("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5",
                  children: [
                    jsx("button", {
                      type: "button",
                      onClick: () => o("prices"),
                      className: "p-4 text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-500 transition-all group",
                      id: "app-404-card-rates",
                      children: jsxs("div", {
                        children: [
                          jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600", children: "📈 Today's Solar Rates" }),
                          jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Live daily market prices for panels, inverters & batteries." })
                        ]
                      })
                    }),
                    jsx("button", {
                      type: "button",
                      onClick: () => o("calculator"),
                      className: "p-4 text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-500 transition-all group",
                      id: "app-404-card-calc",
                      children: jsxs("div", {
                        children: [
                          jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600", children: "⚡ Solar Load Calculator" }),
                          jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Calculate required kW system size & battery backup." })
                        ]
                      })
                    }),
                    jsx("button", {
                      type: "button",
                      onClick: () => o("buy-solar"),
                      className: "p-4 text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-500 transition-all group",
                      id: "app-404-card-buy",
                      children: jsxs("div", {
                        children: [
                          jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600", children: "🛒 Buy Solar Equipment" }),
                          jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Browse verified listings for new & used solar panels." })
                        ]
                      })
                    }),
                    jsx("button", {
                      type: "button",
                      onClick: () => o("dealers"),
                      className: "p-4 text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-500 transition-all group",
                      id: "app-404-card-dealers",
                      children: jsxs("div", {
                        children: [
                          jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600", children: "🛡 Verified Dealers" }),
                          jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Directory of certified distributors in major cities." })
                        ]
                      })
                    }),
                    jsx("button", {
                      type: "button",
                      onClick: () => o("install"),
                      className: "p-4 text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-500 transition-all group",
                      id: "app-404-card-install",
                      children: jsxs("div", {
                        children: [
                          jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600", children: "🔧 Solar Installation" }),
                          jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Professional installation and net-metering consultancy." })
                        ]
                      })
                    }),
                    jsx("button", {
                      type: "button",
                      onClick: c,
                      className: "p-4 text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-500 transition-all group",
                      id: "app-404-card-post",
                      children: jsxs("div", {
                        children: [
                          jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600", children: "➕ Sell Solar (Free Ad)" }),
                          jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "List your equipment for free to thousands of buyers." })
                        ]
                      })
                    })
                  ]
                })
              ]
            }),
            jsxs("div", {
              className: "w-full max-w-2xl rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-gray-900 p-5 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
              children: [
                jsxs("div", {
                  children: [
                    jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white", children: "Found a broken link or technical bug?" }),
                    jsx("p", { className: "text-xs text-gray-600 dark:text-gray-300 mt-1", children: "Help us keep SellSolar working smoothly by reporting missing links or errors." })
                  ]
                }),
                jsxs("div", {
                  className: "flex items-center gap-2 shrink-0",
                  children: [
                    jsx("button", {
                      type: "button",
                      onClick: () => o("report-issue"),
                      className: "px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 text-xs font-bold transition-colors",
                      id: "app-404-report-btn",
                      children: "Report Issue"
                    }),
                    jsx("button", {
                      type: "button",
                      onClick: () => o("contact"),
                      className: "px-3.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                      id: "app-404-contact-btn",
                      children: "Contact"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),
      jsx(hx, {
        onPostAd: c, onNavigate: o
      })
    ]
  }) : jsxs("div", {
    className: "min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200", children: [jsx(Xy, {
      onNavigate: handleNavigate, currentPage: n, onSelectListing: u, onSearchSubmit: handleGlobalSearchSubmit
    }), jsx("main", {
      id: "main",
      children: jsx(_x, {
        onSelectListing: u, onNavigate: handleNavigate, initialFilters: searchFilters, isHome: n === "home" || !n
      })
    }), jsx(hx, {
      onPostAd: c, onNavigate: handleNavigate
    })]
  });

  const showFloatingPostBtn = !r && !pr && n !== "post-ad" && n !== "login" && n !== "password" && n !== "forgot-password" && n !== "reset-password";

  const showMobileBottomNav = !r && !pr && n !== "post-ad" && n !== "login" && n !== "password" && n !== "forgot-password" && n !== "reset-password";

  return jsx(SiteSettingsProvider, {
    children: jsxs(Fragment, {
      children: [
        pageContent,
        showFloatingPostBtn ? jsx(FloatingPostAdButton, { onPostAd: c }) : null,
        jsx(FloatingWhatsAppWidget, {}),
        showMobileBottomNav ? jsx(MobileBottomNav, {
          currentPage: n,
          onNavigate: handleNavigate,
          onPostAd: c
        }) : null
      ]
    })
  });
}


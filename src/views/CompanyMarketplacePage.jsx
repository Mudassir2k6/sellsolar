import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Building2,
  Briefcase,
  Newspaper,
  BookOpen,
  ShoppingBag,
  CircleDollarSign,
  HelpCircle,
  Phone,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Lock,
  Cookie,
  Info,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles,
  Clock,
  UserCheck,
  Send,
  Search,
  Check,
  Zap,
  Sun,
  Shield,
  Layers,
  Award,
  Users,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Share2,
  Eye,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Trash2,
  Paperclip
} from 'lucide-react';

// Navigation groups definition
export const FOOTER_PAGES = {
  about: { category: 'Company', label: 'About Us', icon: Building2, path: '/about' },
  careers: { category: 'Company', label: 'Careers', icon: Briefcase, path: '/careers' },
  press: { category: 'Company', label: 'Press & Media', icon: Newspaper, path: '/press' },
  blog: { category: 'Company', label: 'Blog & Guides', icon: BookOpen, path: '/blog' },

  'buy-solar': { category: 'Marketplace', label: 'Buy Solar', icon: ShoppingBag, path: '/buy-solar' },
  'sell-solar': { category: 'Marketplace', label: 'Sell Solar', icon: Sun, path: '/sell-solar' },
  'how-it-works': { category: 'Marketplace', label: 'How It Works', icon: Zap, path: '/how-it-works' },
  pricing: { category: 'Marketplace', label: 'Pricing & Plans', icon: CircleDollarSign, path: '/pricing' },

  help: { category: 'Support', label: 'Help Center', icon: HelpCircle, path: '/help' },
  contact: { category: 'Support', label: 'Contact Us', icon: Phone, path: '/contact' },
  safety: { category: 'Support', label: 'Safety Tips', icon: ShieldCheck, path: '/safety' },
  'report-issue': { category: 'Support', label: 'Report an Issue', icon: AlertTriangle, path: '/report-issue' },

  terms: { category: 'Legal', label: 'Terms of Service', icon: FileText, path: '/terms' },
  privacy: { category: 'Legal', label: 'Privacy Policy', icon: Lock, path: '/privacy' },
  cookies: { category: 'Legal', label: 'Cookie Policy', icon: Cookie, path: '/cookies' },
  disclaimer: { category: 'Legal', label: 'Disclaimer', icon: Info, path: '/disclaimer' }
};

export const FOOTER_NAV_CONFIG = {
  Company: [
    { id: 'about', label: 'About Us' },
    { id: 'careers', label: 'Careers' },
    { id: 'press', label: 'Press' },
    { id: 'blog', label: 'Blog' }
  ],
  Marketplace: [
    { id: 'buy-solar', label: 'Buy Solar' },
    { id: 'sell-solar', label: 'Sell Solar' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' }
  ],
  Support: [
    { id: 'help', label: 'Help Center' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'safety', label: 'Safety Tips' },
    { id: 'report-issue', label: 'Report an Issue' }
  ],
  Legal: [
    { id: 'terms', label: 'Terms of Service' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'cookies', label: 'Cookie Policy' },
    { id: 'disclaimer', label: 'Disclaimer' }
  ]
};

export default function CompanyMarketplacePage({
  page = 'about',
  onNavigate,
  onPostAd
}) {
  const [internalPage, setInternalPage] = useState(page);

  // Synchronize internal state when prop changes from URL or router
  useEffect(() => {
    if (page && FOOTER_PAGES[page]) {
      setInternalPage(page);
    }
  }, [page]);

  const activePageKey = FOOTER_PAGES[internalPage] ? internalPage : (FOOTER_PAGES[page] ? page : 'about');
  const pageMeta = FOOTER_PAGES[activePageKey] || FOOTER_PAGES.about;

  // Helper to switch sub-pages smoothly
  const handlePageSelect = (key) => {
    if (FOOTER_PAGES[key]) {
      setInternalPage(key);
      if (onNavigate) {
        onNavigate(key);
      }
      // Scroll to content top smoothly
      const contentEl = document.getElementById('company-content-view');
      if (contentEl) {
        contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-200 pt-20 sm:pt-24 lg:pt-28">
      {/* Top Banner / Breadcrumb & Category Bar */}
      <div className="border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs">
        <div className="container-page py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('home')}
                className="hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Home
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {pageMeta.category}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {pageMeta.label}
              </span>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('home')}
                className="btn-ghost text-xs px-2.5 py-1"
              >
                ← Back to Marketplace
              </button>
              {onPostAd && (
                <button
                  type="button"
                  onClick={onPostAd}
                  className="btn-primary text-xs px-3 py-1 shadow-xs"
                >
                  Post Free Ad
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Navigation Tabs (Always accessible on Mobile, Tablet & Desktop) */}
          <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {Object.entries(FOOTER_NAV_CONFIG).map(([category, items]) => (
              <div key={category} className="flex items-center gap-1.5 shrink-0 bg-gray-50 dark:bg-gray-800/40 p-1 rounded-xl border border-gray-200/60 dark:border-gray-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2">
                  {category}
                </span>
                {items.map((item) => {
                  const isCurrent = activePageKey === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePageSelect(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        isCurrent
                          ? 'bg-primary-500 text-white shadow-xs font-bold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout Container */}
      <div id="company-content-view" className="container-page py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Navigation (Visible on lg desktop screens) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-32 space-y-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-2">
                Browse Pages
              </h3>

              <div className="space-y-4">
                {Object.entries(FOOTER_NAV_CONFIG).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-2 mb-1.5">
                      {category}
                    </p>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const isCurrent = activePageKey === item.id;
                        const Icon = FOOTER_PAGES[item.id]?.icon || FileText;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handlePageSelect(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                              isCurrent
                                ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-bold border border-primary-200/70 dark:border-primary-800 shadow-2xs'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Solar Help Card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white shadow-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 mb-3">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-bold text-sm">Need Solar Guidance?</h4>
              <p className="text-xs text-primary-100 mt-1 leading-relaxed">
                Check live market per-watt rates or calculate your exact home kW load instantly.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('prices')}
                  className="w-full text-center rounded-lg bg-white text-primary-700 font-bold text-xs py-2 hover:bg-primary-50 transition-colors shadow-xs"
                >
                  Today's Solar Rates
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('calculator')}
                  className="w-full text-center rounded-lg bg-primary-800/60 hover:bg-primary-800 text-white font-medium text-xs py-2 transition-colors border border-white/10"
                >
                  Load Calculator
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area: Immediately visible on mobile, tablet, and desktop */}
          <main className="w-full lg:col-span-9 space-y-8 min-w-0">
            {activePageKey === 'about' && <AboutUsContent onNavigate={onNavigate} onPostAd={onPostAd} />}
            {activePageKey === 'careers' && <CareersContent onNavigate={onNavigate} />}
            {activePageKey === 'press' && <PressContent onNavigate={onNavigate} />}
            {activePageKey === 'blog' && <BlogContent onNavigate={onNavigate} />}

            {activePageKey === 'buy-solar' && <BuySolarContent onNavigate={onNavigate} />}
            {activePageKey === 'sell-solar' && <SellSolarContent onNavigate={onNavigate} onPostAd={onPostAd} />}
            {activePageKey === 'how-it-works' && <HowItWorksContent onNavigate={onNavigate} onPostAd={onPostAd} />}
            {activePageKey === 'pricing' && <PricingContent onNavigate={onNavigate} onPostAd={onPostAd} />}

            {activePageKey === 'help' && <HelpCenterContent onNavigate={onNavigate} />}
            {activePageKey === 'contact' && <ContactUsContent onNavigate={onNavigate} />}
            {activePageKey === 'safety' && <SafetyTipsContent onNavigate={onNavigate} />}
            {activePageKey === 'report-issue' && <ReportIssueContent onNavigate={onNavigate} />}

            {activePageKey === 'terms' && <TermsContent />}
            {activePageKey === 'privacy' && <PrivacyContent />}
            {activePageKey === 'cookies' && <CookiePolicyContent />}
            {activePageKey === 'disclaimer' && <DisclaimerContent onNavigate={onNavigate} />}

            {/* Mobile / Tablet Quick Link Footer Navigation (When sidebar is hidden on small screens) */}
            <div className="lg:hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mt-10 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                More Information & Pages
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(FOOTER_NAV_CONFIG).flat().map((item) => {
                  const isCurrent = activePageKey === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePageSelect(item.id)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-all truncate ${
                        isCurrent
                          ? 'bg-primary-500 text-white font-bold'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   1. COMPANY PAGES: About Us, Careers, Press, Blog
   ========================================================================= */

function AboutUsContent({ onNavigate, onPostAd }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <Sun className="h-3.5 w-3.5 text-primary-500" />
          Pakistan's Dedicated Solar Exchange
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          Powering Pakistan With Transparent, Accessible Clean Energy
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Founded in Islamabad, <strong>SellSolar.pk</strong> was built to solve the biggest challenges in Pakistan's fast-growing solar market: erratic pricing, unverified equipment, and difficult buyer-seller communication. Today, we are Pakistan's most trusted solar marketplace connecting thousands of homeowners, commercial clients, verified dealers, and solar installers every day.
        </p>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
            <p className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">10,000+</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Solar Ads Posted</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
            <p className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">120+</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Cities Across Pakistan</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
            <p className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">1,500+</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Verified Solar Dealers</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
            <p className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">Rs. 2.5B+</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Solar Trade Volume</p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Our 4 Core Commitments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 font-bold">
              1
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Anti-Counterfeit Protection</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                We empower buyers to check manufacturer barcodes, verify Tier-1 certificates, and spot fraudulent re-labeled modules.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 font-bold">
              2
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Real-Time Price Transparency</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Daily updated per-watt solar panel benchmarks and hybrid inverter rates so every consumer knows fair market value before negotiating.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 font-bold">
              3
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Direct WhatsApp Deals</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                No middleman commissions. Buyers connect directly with sellers and dealers for transparent site inspections and faster transactions.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 font-bold">
              4
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Pakistan Net-Metering Aligned</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                We prioritize three-phase inverters, dual-MPPT compatibility, and standards compliant with NEPRA, LESCO, IESCO, and K-Electric.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Ready to switch to solar or sell equipment?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Join thousands of Pakistani households saving up to 85% on electricity bills.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('home')}
              className="btn-secondary text-xs px-4 py-2"
            >
              Browse Listings
            </button>
            {onPostAd && (
              <button
                type="button"
                onClick={onPostAd}
                className="btn-primary text-xs px-4 py-2 shadow-xs"
              >
                Post Free Ad
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CareersContent({ onNavigate }) {
  const [appliedRole, setAppliedRole] = useState(null);
  const [formSent, setFormSent] = useState(false);
  const [applicant, setApplicant] = useState({
    name: '',
    email: '',
    phone: '',
    portfolioLink: '',
    note: '',
    resume: null
  });
  const [resumeError, setResumeError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const jobs = [
    {
      id: 'solar-engineer',
      title: 'Solar Technical Auditor & QA Specialist',
      dept: 'Engineering & Quality',
      location: 'Islamabad / Hybrid',
      type: 'Full-time',
      experience: '2-4 Years',
      description: 'Audit listed solar modules, inspect dealer warehouse batches, and author verified equipment reviews for Tier-1 solar technologies.'
    },
    {
      id: 'fullstack-dev',
      title: 'Senior Full-Stack Engineer (React / Node / PostgreSQL)',
      dept: 'Product Engineering',
      location: 'Remote (Pakistan)',
      type: 'Full-time',
      experience: '3+ Years',
      description: 'Scale our real-time marketplace search, solar load calculator engines, and verified dealer dashboards.'
    },
    {
      id: 'growth-marketing',
      title: 'Solar Community & Growth Marketing Lead',
      dept: 'Marketing',
      location: 'Lahore / Hybrid',
      type: 'Full-time',
      experience: '2-5 Years',
      description: 'Lead consumer education campaigns on net metering, manage YouTube and TikTok solar breakdowns, and scale organic user acquisition.'
    },
    {
      id: 'dealer-manager',
      title: 'Dealer Partnerships & Verification Specialist',
      dept: 'Operations',
      location: 'Karachi / Field',
      type: 'Full-time',
      experience: '1-3 Years',
      description: 'Onboard Tier-1 solar importers, verify dealer business licenses and CNICs, and manage merchant satisfaction.'
    }
  ];

  const handleFileChange = (file) => {
    if (!file) return;
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setResumeError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeError('File size is larger than 10MB limit. Please upload a smaller file.');
      return;
    }

    setResumeError('');
    const reader = new FileReader();
    reader.onload = () => {
      const formattedSize = file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setApplicant((prev) => ({
        ...prev,
        resume: {
          name: file.name,
          size: formattedSize,
          type: file.type || ext,
          dataUrl: reader.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveResume = () => {
    setApplicant((prev) => ({ ...prev, resume: null }));
    setResumeError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applicant.resume && !applicant.portfolioLink && !applicant.note.trim()) {
      setResumeError('Please upload your resume or provide a portfolio/LinkedIn link.');
      return;
    }
    setFormSent(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <Briefcase className="h-3.5 w-3.5 text-primary-500" />
          Careers at SellSolar
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Join the Clean Energy Revolution in Pakistan
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          We are a mission-driven team solving real power and energy problems for Pakistani homes and industries. At SellSolar, you will work on products directly helping thousands of families achieve energy independence.
        </p>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary-500" /> Competitive Pay & Stipends
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Top market compensation with annual solar equipment home allowances.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary-500" /> Hybrid & Remote Culture
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Work from anywhere across Pakistan with modern equipment setups.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary-500" /> Rapid Career Growth
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Direct ownership, high impact, and mentorship from industry pioneers.
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">Current Open Positions ({jobs.length})</h2>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-500 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-850/40"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {job.title}
                  </span>
                  <span className="rounded-md bg-gray-200/80 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    {job.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                  {job.description}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" /> {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.dept}</span>
                  <span>•</span>
                  <span>Exp: {job.experience}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAppliedRole(job);
                  setFormSent(false);
                }}
                className="btn-primary shrink-0 text-xs px-4 py-2 shadow-xs"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Application Modal / Drawer */}
      {appliedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-2xl animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Job Application
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                  {appliedRole.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {appliedRole.location} • {appliedRole.dept}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAppliedRole(null)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {formSent ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-7 w-7 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">Application Received!</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm mx-auto mt-1 leading-relaxed">
                    Thank you for applying for <span className="font-semibold text-gray-900 dark:text-white">{appliedRole.title}</span>. Our hiring team will review your resume and reach out via WhatsApp/email.
                  </p>
                </div>

                {applicant.resume && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Uploaded: <strong className="font-bold">{applicant.resume.name}</strong> ({applicant.resume.size})</span>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedRole(null);
                      setApplicant({ name: '', email: '', phone: '', portfolioLink: '', note: '', resume: null });
                    }}
                    className="btn-primary text-xs px-6 py-2 mt-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Usman"
                    value={applicant.name}
                    onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="usman@example.com"
                      value={applicant.email}
                      onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">WhatsApp / Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={applicant.phone}
                      onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Upload Resume Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-primary-500" />
                      Upload Resume / CV *
                    </label>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      PDF, DOC, DOCX (Max 10MB)
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {applicant.resume ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {applicant.resume.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                              {applicant.resume.size}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <Check className="h-3 w-3" /> Attached
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline px-2 py-1"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveResume}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition-all text-center ${
                        isDragging
                          ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 scale-[1.01]'
                          : 'border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 hover:border-primary-400'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-primary-500 shadow-2xs mb-2">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        <span className="text-primary-600 dark:text-primary-400 hover:underline">Click to upload</span> or drag & drop resume
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        PDF, DOC or DOCX (up to 10MB)
                      </p>
                    </div>
                  )}

                  {resumeError && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {resumeError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    LinkedIn Profile or Portfolio Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username or Google Drive portfolio link"
                    value={applicant.portfolioLink}
                    onChange={(e) => setApplicant({ ...applicant, portfolioLink: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Cover Note / Relevant Experience (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly highlight your background or why you'd like to join SellSolar..."
                    value={applicant.note}
                    onChange={(e) => setApplicant({ ...applicant, note: e.target.value })}
                    className="input-field py-2"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAppliedRole(null)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs px-6 py-2 shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PressContent({ onNavigate }) {
  const articles = [
    {
      date: 'May 14, 2026',
      outlet: 'Dawn Business',
      title: 'SellSolar Crosses 10,000 Verified Solar Listings as Pakistan Embraces Clean Rooftop Power',
      snippet: 'Driven by steep electricity tariff increases, SellSolar reported a 280% year-on-year surge in residential solar transactions.'
    },
    {
      date: 'March 28, 2026',
      outlet: 'Profit Magazine',
      title: 'How Transparency in Per-Watt Solar Rates is Helping Pakistani Consumers Dodge Counterfeit Panels',
      snippet: 'A look into SellSolar’s real-time rate tracker and barcode inspection program protecting buyers across Lahore and Islamabad.'
    },
    {
      date: 'January 10, 2026',
      outlet: 'Business Recorder',
      title: 'SellSolar Introduces Free Load Sizing Engine for Solar Net-Metering Applications',
      snippet: 'New online calculator computes required kW capacity and panel counts according to DISCO three-phase net metering guidelines.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <Newspaper className="h-3.5 w-3.5 text-primary-500" />
          Press & Media Relations
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          SellSolar in the News
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Welcome to our newsroom. Find our latest press releases, company announcements, industry whitepapers on Pakistan's solar power evolution, and official brand assets for media professionals.
        </p>

        {/* Media Kit Contact */}
        <div className="mt-8 p-5 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Media Inquiries & Interview Requests</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Email our press desk for comments, market data, and expert solar analysis.
            </p>
          </div>
          <a
            href="mailto:press@sellsolar.pk"
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 shadow-xs"
          >
            <Mail className="h-3.5 w-3.5" /> press@sellsolar.pk
          </a>
        </div>
      </div>

      {/* Press Coverage List */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">Featured Press Releases & Stories</h2>
        <div className="space-y-4">
          {articles.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-600 bg-gray-50/40 dark:bg-gray-800/20 transition-all"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold text-primary-600 dark:text-primary-400 mb-1">
                <span>{item.outlet}</span>
                <span>•</span>
                <span className="text-gray-400 font-normal">{item.date}</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.snippet}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogContent({ onNavigate }) {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Buying Guides', 'Technical', 'Net Metering', 'Market Rates'];

  const posts = [
    {
      id: 1,
      title: 'Tier-1 Solar Panels in Pakistan: Longi vs Jinko vs Canadian Solar',
      category: 'Buying Guides',
      readTime: '6 min read',
      date: 'May 2026',
      author: 'Engr. Haris Tariq',
      summary: 'A detailed breakdown of efficiency ratings, temperature coefficients, and degradation curves for Pakistan’s hottest summer climates.',
      content: `### Comparing the Top 3 Tier-1 Modules in Pakistan\n\nWhen purchasing solar panels in Pakistan, choosing a Tier-1 BloombergNEF manufacturer ensures genuine cell quality, verified warranty backing, and superior performance during scorching 45°C+ summer days.\n\n#### 1. Longi Hi-MO 6 & Hi-MO 7\n- **Cell Type:** HPBC / N-Type TopCon\n- **Efficiency:** Up to 22.8%\n- **Best For:** Residential rooftops where aesthetic appearance and maximum per-square-foot yield are required.\n\n#### 2. Jinko Tiger Neo N-Type\n- **Cell Type:** N-Type TOPCon\n- **Efficiency:** 22.5% - 23.2%\n- **Temperature Coefficient:** -0.30%/°C (exceptional in Multan, Bahawalpur, and interior Sindh).\n\n#### 3. Canadian Solar HiKu7\n- **Cell Type:** Bifacial PERC / TopCon\n- **Durability:** Robust 35mm frame designed to withstand heavy wind loads on elevated mounting structures.\n\n**Buyer Caution:** Always scan the serial barcode located beneath the top tempered glass. If the barcode is printed on an external adhesive sticker, it is likely a re-labeled counterfeit!`
    },
    {
      id: 2,
      title: 'Net Metering in Pakistan: Complete Step-by-Step Guide (2026)',
      category: 'Net Metering',
      readTime: '8 min read',
      date: 'April 2026',
      author: 'SellSolar Policy Desk',
      summary: 'Everything you need to apply for a green bidirectional meter with LESCO, IESCO, K-Electric, and FESCO.',
      content: `### How to Successfully Get a Net-Metering Connection in Pakistan\n\nNet metering allows you to export excess solar electricity generated during midday back to the national grid, earning units that offset your nighttime consumption.\n\n#### Key Prerequisites:\n1. **Three-Phase Connection:** Net-metering is only permitted on sanctioned three-phase domestic or commercial meters.\n2. **Inverter Certification:** Your inverter must be on the AEDB (Alternative Energy Development Board) approved list.\n3. **Earthing & Lightning Arrestor:** Proper dual-pit earthing with earth resistance under 5 Ohms.\n\n#### The 5 Steps:\n1. **Site Assessment & Application Preparation:** Fill Form-A with single-line diagrams.\n2. **Submission to DISCO Division:** Submit through an AEDB-certified Tier-1 installer.\n3. **NOC & Inspection:** SDO/XEN site inspection to verify inverter safety disconnection.\n4. **Signing Connection Agreement:** Bilateral agreement with DISCO.\n5. **Bidirectional Green Meter Installation:** Meter testing in laboratory and final commissioning.`
    },
    {
      id: 3,
      title: 'Hybrid vs On-Grid Inverters: Which Saves More Money During Load Shedding?',
      category: 'Technical',
      readTime: '5 min read',
      date: 'April 2026',
      author: 'Team SellSolar',
      summary: 'Understanding battery backup, EPS transfer times, and ROI when grid outages occur during peak tariff hours.',
      content: `### On-Grid vs Hybrid: The Reality of Pakistan's Grid\n\n- **On-Grid Inverters:** Require the grid voltage and frequency reference to operate. When grid power drops, on-grid inverters immediately shut down for anti-islanding safety.\n- **Hybrid Inverters:** Seamlessly switch to battery storage (often within 10 milliseconds), running critical home loads like inverter ACs, refrigerators, and lights uninterrupted.\n\n**Recommendation:** For areas with more than 2 hours of daily load-shedding, hybrid inverters paired with lithium LiFePO4 batteries provide far superior comfort and peak-tariff savings.`
    },
    {
      id: 4,
      title: '5 Warning Signs of Fake or Re-labeled Solar Panels in Local Markets',
      category: 'Buying Guides',
      readTime: '4 min read',
      date: 'March 2026',
      author: 'SellSolar Verification Team',
      summary: 'Learn how to detect B-grade cells, duplicated serial numbers, and altered wattage stickers before paying.',
      content: `### How to Spot Fake Solar Equipment in Pakistan\n\n1. **Sticker vs Under-Glass Barcode:** Genuine Tier-1 modules laminate the barcode *underneath* the glass layer during factory vacuum seal. If you can peel off the barcode, reject it.\n2. **Mismatched Busbars:** Low-cost counterfeit panels use older 5BB (busbar) cells while claiming to be 9BB or 16BB half-cell modules.\n3. **Suspicious Price-Per-Watt:** If current market rate is Rs. 38/W and a seller is offering 'Tier-1 brand new' at Rs. 26/W, it is almost certainly B-grade, factory reject, or refurbished.\n4. **Uneven Soldering & Snail Trails:** Look closely under bright daylight for cracked wafers, discoloration, or inconsistent cell spacing.\n5. **Check Seller Credentials:** Always buy from verified dealers with a physical shop address and positive feedback on SellSolar.pk.`
    }
  ];

  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <BookOpen className="h-3.5 w-3.5 text-primary-500" />
          Solar Knowledge Hub
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Expert Solar Guides & Market Insights
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Written by engineers and renewable energy specialists for Pakistani consumers. Learn how to size your system, avoid common installation pitfalls, and maximize your electricity savings.
        </p>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  {post.category}
                </span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {post.title}
              </h3>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {post.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium text-[11px]">
                By {post.author} • {post.date}
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(post)}
                className="font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                Read Full Guide <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-bold">
                <span>{selectedArticle.category}</span>
                <span>•</span>
                <span className="text-gray-400 font-normal">{selectedArticle.readTime}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-4">
              {selectedArticle.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Authored by {selectedArticle.author} • Published {selectedArticle.date}
            </p>

            <div className="mt-6 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line space-y-4">
              {selectedArticle.content}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="btn-primary text-xs px-6 py-2"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   2. MARKETPLACE PAGES: Buy Solar, Sell Solar, How It Works, Pricing
   ========================================================================= */

function BuySolarContent({ onNavigate }) {
  const categories = [
    { title: 'Solar Panels', desc: 'Monofacial & Bifacial TopCon, PERC, N-Type modules (550W - 710W)', icon: Sun, filter: 'panel' },
    { title: 'Inverters', desc: 'On-Grid, Hybrid & Off-Grid inverters with dual MPPT & net-metering support', icon: Zap, filter: 'inverter' },
    { title: 'Lithium & Tubular Batteries', desc: 'LiFePO4 wall mounts & tubular deep-cycle batteries for long backup', icon: Layers, filter: 'battery' },
    { title: 'Complete Solar Systems', desc: 'Pre-packaged 3kW, 5kW, 10kW & 15kW turnkey setups with mounting structures', icon: Building2, filter: 'system' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <ShoppingBag className="h-3.5 w-3.5 text-primary-500" />
          Buyer's Marketplace Hub
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          How to Buy Solar Equipment With Confidence
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Whether you are setting up a new residential 10kW system or adding replacement batteries, SellSolar makes it simple to compare prices, verify seller authenticity, and connect directly on WhatsApp.
        </p>

        {/* Categories to Explore */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate('home')}
              className="cursor-pointer p-5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary-500 hover:shadow-sm transition-all group bg-gray-50/50 dark:bg-gray-850/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer's 5 Golden Rules */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">Buyer Inspection Checklist in Pakistan</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20 flex gap-3 items-start">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-gray-900 dark:text-white">Verify Barcode Under the Glass</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Always ensure the serial number barcode is embedded *under* the front glass, matching the manufacturer's official warranty portal.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20 flex gap-3 items-start">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-gray-900 dark:text-white">Compare Against Today's Per-Watt Rates</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Check our live prices page before bargaining so you know the prevailing wholesale and retail market price per watt.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20 flex gap-3 items-start">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-gray-900 dark:text-white">Prefer Verified Dealers or Safe In-Person Handover</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Inspect physical equipment condition, check open-circuit voltage with a multimeter, and only pay upon satisfaction.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('home')}
            className="btn-primary text-xs px-6 py-2.5 shadow-xs flex items-center gap-2"
          >
            Explore Active Solar Listings <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SellSolarContent({ onNavigate, onPostAd }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-4 border border-amber-200/60 dark:border-amber-800/60">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          100% Free Listing for Homeowners & Sellers
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Turn Your Solar Panels & Inverters into Cash Fast
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Upgrading to higher-wattage N-Type panels? Selling excess inverters from an upgraded system? Reach thousands of ready buyers across Pakistan with a free listing on SellSolar.pk.
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onPostAd}
            className="btn-primary text-sm px-6 py-3 shadow-md inline-flex items-center gap-2 font-extrabold"
          >
            <Sun className="h-4 w-4" /> Post Your Solar Ad Now — Free
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Takes less than 2 minutes • No credit card required
          </span>
        </div>
      </div>

      {/* 4 Steps to Sell Fast */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">4 Easy Steps to Sell on SellSolar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850/40 border border-gray-100 dark:border-gray-800 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-extrabold text-sm mb-3">
              01
            </span>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Take Clear Photos</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Capture front surface, frame edges, and a crisp close-up of the manufacturer label/barcode.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850/40 border border-gray-100 dark:border-gray-800 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-extrabold text-sm mb-3">
              02
            </span>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Set Your Per-Watt Price</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              State total price or price per watt. Competitive market pricing sells 3x faster.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850/40 border border-gray-100 dark:border-gray-800 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-extrabold text-sm mb-3">
              03
            </span>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Receive WhatsApp Leads</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Interested buyers message you directly on your verified phone or WhatsApp number.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-850/40 border border-gray-100 dark:border-gray-800 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-extrabold text-sm mb-3">
              04
            </span>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Close Safe Deal</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Arrange local inspection, receive secure payment, and mark your listing as sold!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksContent({ onNavigate, onPostAd }) {
  const [activeTab, setActiveTab] = useState('buyers');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <Zap className="h-3.5 w-3.5 text-primary-500" />
          The SellSolar Process
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          How SellSolar Works
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          SellSolar is engineered to eliminate friction between Pakistani solar buyers, sellers, and dealers. Choose your role below to see how our platform works for you.
        </p>

        {/* Tab Switcher */}
        <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('buyers')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'buyers'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            For Solar Buyers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sellers')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'sellers'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            For Individual Sellers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dealers')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'dealers'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            For Verified Dealers
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-6">
        {activeTab === 'buyers' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Seamless Solar Shopping</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">1. Search & Filter</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Filter by city (Lahore, Karachi, Rawalpindi, Islamabad), wattage, inverter phase, or brand (Longi, Jinko, Inverex, Growatt, Nitrox).
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">2. Instant WhatsApp</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Click 'WhatsApp Seller' to chat immediately. Confirm stock, request live testing videos, and schedule on-site inspection.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">3. Install with Peace of Mind</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Request site assessment or professional net-metering assistance through our verified installer network.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Sell Your Solar Stock in 3 Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">1. Free Ad Creation</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Add photos, select your city, and enter key specs like wattage, brand, condition, and warranty status.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">2. Targeted Exposure</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Your ad is immediately indexed in Google and displayed to buyers searching specifically in your city.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">3. Fast Local Pickup</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Agree on terms, meet the buyer locally, verify payment, and transfer equipment.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dealers' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Grow Your Solar Wholesale & Retail Business</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">1. Get Verified Badge</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Submit your business NTN, shop location, and CNIC for verification to gain verified badge trust.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">2. Bulk Inventory Tools</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Post unlimited inventory lots, container arrivals, and container-split wholesale deals.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <span className="font-black text-primary-600 dark:text-primary-400 text-lg">3. Nationwide Reach</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  Receive high-intent leads from buyers and smaller regional installers across all four provinces.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingContent({ onNavigate, onPostAd }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <CircleDollarSign className="h-3.5 w-3.5 text-primary-500" />
          Transparent Plans & Packages
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Simple, Fair Pricing for Everyone
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Posting individual ads is 100% free forever. If you are an active solar merchant or want maximum exposure, upgrade to our premium dealer tools.
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Free */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Individual Seller</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Free Ad</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              For homeowners and individuals selling solar gear.
            </p>
            <div className="mt-5 text-3xl font-black text-gray-900 dark:text-white">
              Rs. 0 <span className="text-xs font-medium text-gray-400">/ forever</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Post up to 5 active equipment ads
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Direct buyer WhatsApp & Phone connection
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Up to 8 high-resolution photos
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                60 days listing validity
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onPostAd}
              className="w-full btn-secondary text-xs py-2.5"
            >
              Post Free Ad
            </button>
          </div>
        </div>

        {/* Tier 2: Featured Boost */}
        <div className="rounded-3xl border-2 border-primary-500 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-lg flex flex-col justify-between relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 shadow-sm">
            Most Popular
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary-600 dark:text-primary-400">Quick Sale</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Featured Ad</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Pin your listing to the top of category searches.
            </p>
            <div className="mt-5 text-3xl font-black text-primary-600 dark:text-primary-400">
              Rs. 999 <span className="text-xs font-medium text-gray-400">/ 14 days</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-500 shrink-0" />
                <strong>5x more buyer views</strong> on average
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-500 shrink-0" />
                Featured golden border & badge
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-500 shrink-0" />
                Pinned to top of search results
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-500 shrink-0" />
                Highlighted in social media channels
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('post-ad')}
              className="w-full btn-primary text-xs py-2.5 shadow-sm"
            >
              Get Featured Ad
            </button>
          </div>
        </div>

        {/* Tier 3: Verified Dealer Pro */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Solar Merchants</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Dealer Pro</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              For commercial importers, distributors, and shops.
            </p>
            <div className="mt-5 text-3xl font-black text-gray-900 dark:text-white">
              Rs. 2,999 <span className="text-xs font-medium text-gray-400">/ month</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <strong>Unlimited</strong> equipment listings
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Official Verified Dealer Blue Badge
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Dedicated storefront profile page
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                Priority listing in Dealer Directory
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dealers')}
              className="w-full btn-secondary text-xs py-2.5"
            >
              Explore Dealer Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. SUPPORT PAGES: Help Center, Contact Us, Safety Tips, Report Issue
   ========================================================================= */

function HelpCenterContent({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Is it completely free to post an ad on SellSolar.pk?',
      a: 'Yes, posting standard ads on SellSolar.pk is 100% free with zero commission fees. You can list solar panels, inverters, batteries, or full systems without paying a rupee.'
    },
    {
      q: 'How do buyers contact me after I post an ad?',
      a: 'When posting an ad, you provide your phone number. Buyers can click the green "WhatsApp Seller" button or call your number directly to discuss terms and arrange inspection.'
    },
    {
      q: 'How can I verify if solar panels are authentic Tier-1 and not fake?',
      a: 'Inspect the serial barcode laminated underneath the top glass. It should be crisp, straight, and scan cleanly on the manufacturer warranty portal (such as Longi, Jinko, or JA Solar verification apps). Also verify open circuit voltage (Voc) under direct sunlight.'
    },
    {
      q: 'What should I do if an inverter is showing fault codes during inspection?',
      a: 'Do not buy inverters showing persistent error codes (e.g., Error 04, Error 08, or Bus Voltage high) unless inspected and certified by an authorized warranty repair center.'
    },
    {
      q: 'How does the Solar Load Calculator work?',
      a: 'Our Load Calculator allows you to choose your appliances (fans, inverter ACs, refrigerator, water pump) to calculate your required kW capacity, inverter size, and recommended number of solar panels tailored to Pakistan climate conditions.'
    },
    {
      q: 'How do I become a Verified Dealer on SellSolar?',
      a: 'Sign up for an account, choose "Dealer" as your account type, and provide your business shop address and CNIC details. Our verification team audits your credentials to award the blue verified badge.'
    },
    {
      q: 'Can I edit or delete my ad after posting?',
      a: 'Yes. Log into your account and navigate to "My Dashboard" to update price, photos, description, or mark the item as sold.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <HelpCircle className="h-3.5 w-3.5 text-primary-500" />
          Help & Frequently Asked Questions
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          How Can We Help You Today?
        </h1>

        {/* Search Bar */}
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. barcode, posting ads, net-metering)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11 py-3 text-xs sm:text-sm rounded-2xl"
          />
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-3">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
          Common Questions ({filteredFaqs.length})
        </h2>

        {filteredFaqs.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No matching questions found. Contact our support team directly for assistance!
          </p>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/30 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-primary-600 dark:text-primary-400 font-extrabold text-base ml-2">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100/80 dark:border-gray-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Need Help? */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">Still have questions?</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Our customer support team is happy to help on WhatsApp or email.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('contact')}
          className="btn-primary text-xs px-5 py-2.5 shadow-xs"
        >
          Contact Support Desk
        </button>
      </div>
    </div>
  );
}

function ContactUsContent() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-4 border border-primary-200/60 dark:border-primary-800/60">
          <Phone className="h-3.5 w-3.5 text-primary-500" />
          Get In Touch
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          We’d Love to Hear From You
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Have a suggestion, need help with your solar ad, or want to register as a verified Tier-1 dealer? Reach our Islamabad headquarters directly.
        </p>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mb-2" />
            <p className="font-bold text-xs text-gray-900 dark:text-white">Email Us</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">info@sellsolar.pk</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">support@sellsolar.pk</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400 mb-2" />
            <p className="font-bold text-xs text-gray-900 dark:text-white">Call / WhatsApp</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">+92 300 1234567</p>
            <p className="text-[10px] text-gray-400">Mon-Sat: 9am - 7pm PKT</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mb-2" />
            <p className="font-bold text-xs text-gray-900 dark:text-white">Head Office</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Blue Area, Sector G-7</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Islamabad, Pakistan</p>
          </div>
        </div>
      </div>

      {/* Interactive Form */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Send Us a Direct Message</h2>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Message Sent Successfully!</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Thank you for reaching out. Ticket #SLR-{Math.floor(100000 + Math.random() * 900000)} has been created. Our team will contact you within 4 business hours.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn-secondary text-xs px-4 py-2 mt-2"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="tariq@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="select-field"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Ad Assistance">Help with my Ad</option>
                  <option value="Dealer Verification">Become Verified Dealer</option>
                  <option value="Partnership">Commercial Partnership</option>
                  <option value="Feedback">Feedback / Suggestion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Message *</label>
              <textarea
                rows={4}
                required
                placeholder="How can our solar support team assist you?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field py-2"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-primary text-xs px-6 py-2.5 shadow-xs inline-flex items-center gap-2 font-bold"
              >
                <Send className="h-3.5 w-3.5" /> Submit Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SafetyTipsContent({ onNavigate }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-4 border border-amber-200/60 dark:border-amber-800/60">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
          Consumer Protection Guidelines
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Solar Safety & Anti-Fraud Guide in Pakistan
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          High-value solar equipment attracts counterfeiters and unauthorized distributors. Follow these practical safeguards to protect your hard-earned money.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border border-red-200/80 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 space-y-2">
            <h3 className="font-bold text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> 1. Never Pay 100% Upfront Online
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Scammers often ask for full payment via EasyPaisa or JazzCash before dispatching goods. Always insist on physical inspection, COD with open parcel inspection, or payment upon arrival.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" /> 2. Verify Embedded Barcodes
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Genuine Tier-1 manufacturers (Longi, Jinko, JA Solar, Trina) place the barcode *inside* the lamination under the glass. If a sticker is glued on top of the glass, do not accept it.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
            <h3 className="font-bold text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" /> 3. Multimeter Sunlight Voltage Test
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Before accepting panels, test the open circuit voltage (Voc) under clear sun. A 550W panel should typically output between 48V to 52V Voc.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 4. Meet at Established Commercial Shops
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Whenever possible, complete deals at a physical solar shop or warehouse with a documented cash memo and warranty card stamp.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Encountered suspicious activity or a scammer?
          </p>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('report-issue')}
            className="btn-danger text-xs px-4 py-2"
          >
            Report Fraudulent Ad
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportIssueContent() {
  const [reported, setReported] = useState(false);
  const [report, setReport] = useState({
    type: 'Counterfeit / Fake Solar Panel',
    adLink: '',
    sellerContact: '',
    details: ''
  });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReported(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold mb-4 border border-red-200/60 dark:border-red-800/60">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          Trust & Safety Desk
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Report an Issue or Fraudulent Listing
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          We maintain zero tolerance for counterfeit solar panels, advance-payment scammers, or deceptive listings. Our trust and safety team investigates every complaint within 12 hours.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
        {reported ? (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Complaint Logged</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Case Ref #{Math.floor(100000 + Math.random() * 900000)} has been prioritized. The listing has been flagged for moderation review. Thank you for keeping Pakistan's solar community safe!
            </p>
            <button
              type="button"
              onClick={() => setReported(false)}
              className="btn-secondary text-xs px-4 py-2 mt-3"
            >
              Report Another Issue
            </button>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Issue Category *</label>
              <select
                value={report.type}
                onChange={(e) => setReport({ ...report, type: e.target.value })}
                className="select-field"
              >
                <option value="Counterfeit / Fake Solar Panel">Counterfeit / Re-labeled Solar Panel</option>
                <option value="Advance Payment Scam">Advance Payment / Bank Scam</option>
                <option value="Inaccurate Price or Specs">Misleading Price / Inaccurate Specs</option>
                <option value="Defective / Damaged Equipment">Defective Inverter or Swollen Battery</option>
                <option value="Technical Website Bug">Website Bug / Broken Page</option>
                <option value="Other">Other Violation</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Ad Title, Listing ID or URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. 550W Longi Panel Ad in Lahore"
                  value={report.adLink}
                  onChange={(e) => setReport({ ...report, adLink: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Seller Contact / Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="03xx xxxxxxx"
                  value={report.sellerContact}
                  onChange={(e) => setReport({ ...report, sellerContact: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Describe the Issue *</label>
              <textarea
                rows={4}
                required
                placeholder="Please describe what occurred, what evidence you observed (e.g. pasted sticker, refusal to meet), or what needs fixing..."
                value={report.details}
                onChange={(e) => setReport({ ...report, details: e.target.value })}
                className="input-field py-2"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-danger text-xs px-6 py-2.5 shadow-xs font-bold"
              >
                Submit Urgent Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   4. LEGAL PAGES: Terms of Service, Privacy Policy, Cookie Policy, Disclaimer
   ========================================================================= */

function TermsContent() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold mb-4">
          <FileText className="h-3.5 w-3.5 text-gray-500" />
          Legal Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last updated: June 2026 • Governing Law: Islamic Republic of Pakistan
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">1. Acceptance of Terms</h3>
            <p className="mt-1">
              By accessing, browsing, or posting listings on SellSolar.pk ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using the Platform.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">2. Role of SellSolar as a Marketplace Facilitator</h3>
            <p className="mt-1">
              SellSolar acts solely as an online venue connecting independent buyers, sellers, and dealers of solar equipment. SellSolar is not a party to any transaction, does not own the listed goods, and makes no warranties regarding the fitness, electrical output, or warranty claims of equipment sold by third parties.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">3. Listing Rules & Prohibited Items</h3>
            <p className="mt-1">
              Users agree to only list genuine solar equipment. The following are strictly prohibited and will result in immediate ban:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Counterfeit or falsely re-labeled solar panels, inverters, or batteries.</li>
              <li>Stolen, damaged, or hazardous electrical components.</li>
              <li>Deceptive pricing (such as listing Rs. 1 for items costing thousands).</li>
              <li>Multiple duplicate listings of the same lot.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">4. Safety & Independent Verification</h3>
            <p className="mt-1">
              All buyers must independently test equipment, verify open circuit voltage, and confirm warranty validity with the respective brand importer before executing payment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold mb-4">
          <Lock className="h-3.5 w-3.5 text-gray-500" />
          Data Protection
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last updated: June 2026
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">1. Information We Collect</h3>
            <p className="mt-1">
              We collect information necessary to facilitate solar trading:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Contact Information:</strong> Phone/WhatsApp number, full name, and email address provided during ad submission or account registration.</li>
              <li><strong>Listing Details:</strong> Equipment photos, specifications, city, and pricing.</li>
              <li><strong>Device & Usage Data:</strong> Anonymized browser information, IP addresses, and search telemetry to improve search relevancy.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">2. How We Use Your Data</h3>
            <p className="mt-1">
              Your contact number is displayed on your active listings to enable prospective solar buyers to communicate with you. We do <strong>not</strong> sell, rent, or trade your private personal information to third-party telemarketers.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">3. Account Deletion & Rights</h3>
            <p className="mt-1">
              You can modify or remove your listings at any time through your dashboard. To request permanent account deletion, contact our privacy desk at <code>privacy@sellsolar.pk</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function CookiePolicyContent() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold mb-4">
          <Cookie className="h-3.5 w-3.5 text-gray-500" />
          Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Cookie & Storage Policy
        </h1>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last updated: June 2026
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">1. What Are Cookies?</h3>
            <p className="mt-1">
              Cookies and local browser storage are small files saved on your computer or mobile device to remember your preferences and ensure website functionality.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">2. How SellSolar Uses Local Storage</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Theme Preference:</strong> Remembers whether you selected Light or Dark Mode.</li>
              <li><strong>Authentication:</strong> Keeps you securely logged in to manage your solar listings.</li>
              <li><strong>Search Filters:</strong> Remembers your chosen city (e.g. Lahore, Karachi) for quicker browsing.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">3. Managing Preferences</h3>
            <p className="mt-1">
              You can clear cookies and localStorage at any time via your browser settings. Note that disabling storage may log you out of your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function DisclaimerContent({ onNavigate }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold mb-4">
          <Info className="h-3.5 w-3.5 text-gray-500" />
          Legal Notice
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Disclaimer & Technical Warnings
        </h1>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">1. Market Price Estimations</h3>
            <p className="mt-1">
              The rates listed in our "Today's Solar Rates" section reflect prevailing spot market benchmarks reported by major wholesale distributors in Lahore (Hall Road), Karachi (Saddar), and Rawalpindi. Actual retail shop prices may fluctuate based on currency exchange rates, freight costs, and inventory availability.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">2. Electrical Safety & Qualified Installation</h3>
            <p className="mt-1">
              High voltage DC power produced by solar PV arrays presents severe shock and fire hazards. All solar installations, net-metering synchronization, and inverter wiring must be performed by PEC-registered electrical engineers or AEDB-certified solar technicians.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">3. DISCO Net-Metering Rules</h3>
            <p className="mt-1">
              Net-metering approval is subject to policy guidelines set by NEPRA and regional distribution companies (LESCO, IESCO, K-Electric, FESCO, MEPCO). SellSolar cannot guarantee grid-tie approval for unapproved or non-standard equipment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

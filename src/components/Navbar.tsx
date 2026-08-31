import React, { useState, useEffect } from 'react';
import {
  Sun,
  PlusCircle,
  User,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Calculator,
  Users,
  Search,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenAuth: () => void;
  onPostAd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentPage,
  onOpenAuth,
  onPostAd,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const { user, signOut, switchDemoUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: string, hash?: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      {/* Top micro banner with Live Demo switch */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-xs py-1.5 px-4">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-primary-500/20 text-primary-400 font-semibold px-2 py-0.5 rounded-full border border-primary-500/30">
              <Sparkles className="w-3 h-3" /> Pakistan's Premier Solar Exchange
            </span>
            <span className="hidden md:inline text-gray-300">
              Verified Tier-1 Panels, Hybrid Inverters & Net Metering EPCs
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded-md text-xs font-medium text-gray-200 transition-colors border border-gray-700"
              >
                <span>Role: </span>
                <span className="text-primary-400 font-semibold">
                  {user?.is_admin
                    ? 'Admin'
                    : user?.account_type === 'dealer'
                    ? 'Verified Dealer'
                    : user
                    ? 'Individual'
                    : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-gray-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => {
                      switchDemoUser('dealer');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-primary-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-secondary-600" />
                        Verified Dealer
                      </div>
                      <div className="text-gray-500 text-[10px]">Premier Energy (Post & Manage)</div>
                    </div>
                    {user?.account_type === 'dealer' && !user.is_admin && (
                      <CheckCircle2 className="w-4 h-4 text-primary-500" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('admin');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-primary-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary-600" />
                        Platform Admin
                      </div>
                      <div className="text-gray-500 text-[10px]">Approve Ads & Dealers</div>
                    </div>
                    {user?.is_admin && <CheckCircle2 className="w-4 h-4 text-primary-500" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('individual');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-primary-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                        Individual Buyer
                      </div>
                      <div className="text-gray-500 text-[10px]">Ahmad Ali (Standard User)</div>
                    </div>
                    {user?.account_type === 'individual' && !user.is_admin && (
                      <CheckCircle2 className="w-4 h-4 text-primary-500" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoUser('guest');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-primary-50 transition-colors border-t border-gray-100"
                  >
                    <div className="font-medium text-gray-700">Guest Visitor</div>
                    {!user && <CheckCircle2 className="w-4 h-4 text-primary-500" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container-page py-3.5 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Sell<span className="text-primary-500">Solar</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-900 text-white px-1.5 py-0.5 rounded">
                PK
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">
              Solar Equipment Marketplace
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-gray-700">
          <button
            onClick={() => handleNav('home', '#listings')}
            className={`hover:text-primary-600 transition-colors flex items-center gap-1.5 ${
              currentPage === 'home' ? 'text-gray-900' : ''
            }`}
          >
            <Search className="w-4 h-4 text-gray-400" />
            Buy Solar
          </button>

          <button
            onClick={() => handleNav('home', '#categories')}
            className="hover:text-primary-600 transition-colors"
          >
            Categories
          </button>

          <button
            onClick={() => handleNav('dealers')}
            className={`hover:text-primary-600 transition-colors flex items-center gap-1.5 ${
              currentPage === 'dealers' ? 'text-primary-600 font-bold' : ''
            }`}
          >
            <Users className="w-4 h-4 text-gray-400" />
            Dealers Directory
          </button>

          <button
            onClick={() => handleNav('calculator')}
            className={`hover:text-primary-600 transition-colors flex items-center gap-1.5 ${
              currentPage === 'calculator' ? 'text-primary-600 font-bold' : ''
            }`}
          >
            <Calculator className="w-4 h-4 text-gray-400" />
            Solar Calculator
          </button>

          <button
            onClick={() => handleNav('home', '#how-it-works')}
            className="hover:text-primary-600 transition-colors"
          >
            How It Works
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Post an Ad CTA */}
          <button
            onClick={onPostAd}
            className="btn-primary py-2.5 px-4 text-sm font-bold shadow-md shadow-primary-500/25 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post an Ad</span>
            <span className="hidden sm:inline bg-white/20 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded">
              Free
            </span>
          </button>

          {/* User Account / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-gray-300 transition-all bg-white hover:bg-gray-50"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-800 leading-tight flex items-center gap-1">
                    {user.full_name?.split(' ')[0]}
                    {user.is_verified_dealer && (
                      <ShieldCheck className="w-3.5 h-3.5 text-secondary-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 capitalize">
                    {user.is_admin ? 'Admin' : user.account_type}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    {user.is_verified_dealer && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-secondary-700 bg-secondary-50 px-2 py-0.5 rounded-full border border-secondary-200">
                        <ShieldCheck className="w-3 h-3 text-secondary-600" /> Verified Solar Dealer
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleNav('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                    My Listings & Dashboard
                  </button>

                  {user.is_admin && (
                    <button
                      onClick={() => {
                        handleNav('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-primary-700 hover:bg-primary-50 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-primary-600" />
                      Admin Control Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleNav('dealers');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-gray-500" />
                    Dealers Directory
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={async () => {
                      await signOut();
                      setUserDropdownOpen(false);
                      handleNav('home');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-ghost py-2 px-3 text-sm font-semibold flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>Login / Sign Up</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNav('home', '#listings')}
            className="w-full text-left py-2 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-gray-500" />
            Buy Solar Equipment
          </button>

          <button
            onClick={() => handleNav('home', '#categories')}
            className="w-full text-left py-2 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
          >
            Browse Categories
          </button>

          <button
            onClick={() => handleNav('dealers')}
            className="w-full text-left py-2 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-gray-500" />
            Verified Dealers Directory
          </button>

          <button
            onClick={() => handleNav('calculator')}
            className="w-full text-left py-2 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-gray-500" />
            Solar Sizing Calculator
          </button>

          <button
            onClick={() => handleNav('home', '#how-it-works')}
            className="w-full text-left py-2 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
          >
            How It Works
          </button>

          {user && (
            <div className="border-t border-gray-100 pt-2 space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left py-2 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-500" />
                My Dashboard
              </button>

              {user.is_admin && (
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full text-left py-2 px-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-primary-600" />
                  Admin Panel
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

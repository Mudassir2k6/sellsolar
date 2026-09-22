import React from 'react';
import { Home, Zap, Calculator, PlusCircle, User, ShieldCheck } from 'lucide-react';
import { useAuth, DEFAULT_ADMIN_EMAIL } from '../context/AuthContext';

export default function MobileBottomNav({
  currentPage = 'home',
  onNavigate,
  onPostAd
}) {
  const { user, profile, isSuperAdmin, isAdmin } = useAuth();
  const isUserAdmin = Boolean(
    user && (isSuperAdmin || isAdmin || profile?.is_admin || profile?.is_super_admin || profile?.role === 'super_admin' || profile?.role === 'admin' || user?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())
  );

  const isHome = currentPage === 'home' || currentPage === 'buy-solar';
  const isRates = currentPage === 'prices' || currentPage === 'today-prices';
  const isCalc = currentPage === 'calculator' || currentPage === 'load-calculator';
  const isDealers = currentPage === 'dealers';
  const isAccount = currentPage === 'dashboard' || currentPage === 'admin' || currentPage === 'admin-dashboard' || currentPage === 'login' || currentPage === 'inbox';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] md:hidden transition-colors safe-area-bottom"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {/* Home */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors select-none ${
            isHome
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Home className={`h-5 w-5 ${isHome ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 leading-none">Home</span>
        </button>

        {/* Rates */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('prices')}
          className={`flex flex-col items-center justify-center py-1 transition-colors select-none relative ${
            isRates
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium'
          }`}
        >
          <div className="relative">
            <Zap className={`h-5 w-5 ${isRates ? 'fill-amber-500 text-amber-500 stroke-[2]' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Rates</span>
        </button>

        {/* Post Ad (Center CTA highlight) */}
        <button
          type="button"
          onClick={onPostAd}
          className="flex flex-col items-center justify-center py-1 -mt-4 transition-transform active:scale-95 select-none"
          aria-label="Post Free Ad"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-amber-500 text-white shadow-lg shadow-primary-500/35 border-2 border-white dark:border-gray-900">
            <PlusCircle className="h-6 w-6 stroke-[2.3]" />
          </div>
          <span className="text-[10px] font-extrabold text-gray-800 dark:text-gray-200 mt-0.5 leading-none">
            Post Ad
          </span>
        </button>

        {/* Sizing / Calculator */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('calculator')}
          className={`flex flex-col items-center justify-center py-1 transition-colors select-none ${
            isCalc
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Calculator className={`h-5 w-5 ${isCalc ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 leading-none">Calc</span>
        </button>

        {/* Account / Dashboard */}
        <button
          type="button"
          onClick={() => {
            if (!user) {
              onNavigate && onNavigate('login');
            } else if (isUserAdmin) {
              onNavigate && onNavigate('admin-dashboard');
            } else {
              onNavigate && onNavigate('dashboard');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors select-none ${
            isAccount
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium'
          }`}
        >
          {user ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-amber-500 text-[10px] font-extrabold text-white">
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          ) : (
            <User className={`h-5 w-5 ${isAccount ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          )}
          <span className="text-[10px] mt-0.5 leading-none truncate max-w-[50px]">
            {user ? 'Account' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
}

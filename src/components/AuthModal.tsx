import React, { useState } from 'react';
import {
  X,
  Sun,
  ShieldCheck,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, switchDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [accountType, setAccountType] = useState<'individual' | 'dealer'>('individual');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [businessName, setBusinessName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email || 'demo@sellsolar.pk', password || 'password');
      } else {
        await signUp(email, password, {
          full_name: fullName,
          phone,
          city,
          account_type: accountType,
          business_name: accountType === 'dealer' ? businessName : undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'dealer' | 'admin' | 'individual') => {
    switchDemoUser(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-gray-900 mx-auto mb-3 shadow-md">
            <Sun className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome Back to SellSolar' : 'Create Your Solar Account'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login'
              ? 'Access your listings, respond to buyers, and track solar equipment'
              : 'Join Pakistan’s largest solar exchange network today'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Access Bar */}
          <div className="bg-primary-50/70 border border-primary-200 p-3 rounded-xl">
            <div className="text-[11px] font-bold text-primary-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-600" /> 1-Click Demo Login
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('dealer')}
                className="bg-white hover:bg-primary-500 hover:text-white border border-primary-300 text-gray-800 text-[11px] font-bold py-1 px-1.5 rounded-lg transition-colors"
              >
                Dealer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="bg-white hover:bg-primary-500 hover:text-white border border-primary-300 text-gray-800 text-[11px] font-bold py-1 px-1.5 rounded-lg transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('individual')}
                className="bg-white hover:bg-primary-500 hover:text-white border border-primary-300 text-gray-800 text-[11px] font-bold py-1 px-1.5 rounded-lg transition-colors"
              >
                Individual
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <>
                {/* Account Type Tabs */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">I am a:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('individual')}
                      className={`py-2 px-3 rounded-lg font-bold border text-xs flex items-center justify-center gap-1.5 ${
                        accountType === 'individual'
                          ? 'border-primary-500 bg-primary-50 text-primary-800'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('dealer')}
                      className={`py-2 px-3 rounded-lg font-bold border text-xs flex items-center justify-center gap-1.5 ${
                        accountType === 'dealer'
                          ? 'border-primary-500 bg-primary-50 text-primary-800'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" /> Solar Dealer / EPC
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Mehmood"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {accountType === 'dealer' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Business / Shop Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SkyPower Solar Systems"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="03001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs font-bold shadow-md mt-2"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In to Account'
                : 'Create My Account'}
            </button>
          </form>

          {/* Toggle between mode */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-bold text-primary-600 hover:underline"
                >
                  Sign Up Free
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-primary-600 hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

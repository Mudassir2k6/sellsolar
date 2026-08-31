import { useEffect, useState } from 'react';
import {
  CircleAlert,
  CreditCard,
  Eye,
  EyeOff,
  Image,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  Sun,
  User,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../lib/constants';
import { isValidEmail, normalizePhone } from '../lib/auth';

function authErrorMessage(error) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error?.message || '').toLowerCase();
  if (
    error?.code === '23505' ||
    message.includes('profiles_email_unique') ||
    ((message.includes('already registered') || message.includes('already been registered') || message.includes('already exists')) && message.includes('email'))
  ) {
    return 'This email already exists.';
  }
  if (message.includes('profiles_phone_unique') || (message.includes('already exists') && message.includes('phone'))) {
    return 'This phone number already exists.';
  }
  if (message.includes('already registered') || message.includes('already been registered') || message.includes('already exists')) {
    return 'This email already exists.';
  }
  if (message.includes('weak_password') || message.includes('pwned') || message.includes('password is known')) {
    return 'Password must be at least 8 characters.';
  }
  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (message.includes('rate limit') || message.includes('email_rate_limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before logging in.';
  }
  if ((message.includes('invalid email') || message.includes('unable to validate email')) || (message.includes('email address') && message.includes('invalid'))) {
    return 'Please enter a valid email address.';
  }
  return error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.';
}

async function contactAlreadyExists(email, phone) {
  const { data, error } = await supabase.rpc('contact_already_exists', {
    p_email: email.trim(),
    p_phone: phone.trim(),
  });
  if (!error && data) {
    const row = Array.isArray(data) ? data[0] : data;
    return {
      emailExists: Boolean(row?.email_exists),
      phoneExists: Boolean(row?.phone_exists),
    };
  }

  const [{ data: emailRow }, { data: phoneRow }] = await Promise.all([
    supabase.from('profiles').select('id').ilike('email', email.trim()).maybeSingle(),
    supabase.from('profiles').select('id').eq('phone', normalizePhone(phone)).maybeSingle(),
  ]);

  return {
    emailExists: Boolean(emailRow?.id),
    phoneExists: Boolean(phoneRow?.id),
  };
}

export default function AuthPage({ onSuccess, onBack, initialView = 'login' }) {
  const { refreshProfile, completePasswordRecovery } = useAuth();
  const [view, setView] = useState(initialView);
  const [accountType, setAccountType] = useState('individual');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [cnic, setCnic] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [visitingCard, setVisitingCard] = useState('');
  const isDealer = accountType === 'dealer';

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const go = (next) => {
    setView(next);
    setError(null);
    setInfo(null);
  };

  const handleSignup = async () => {
    setError(null);
    if (isDealer && !cnic.trim()) {
      setError('CNIC number is mandatory for dealers');
      return;
    }
    if (isDealer && !businessName.trim()) {
      setError('Business name is mandatory for dealers');
      return;
    }
    if (!fullName.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      setError('Please fill in name, email, phone, and password');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (normalizePhone(phone).length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      const taken = await contactAlreadyExists(email, phone);
      if (taken.emailExists) {
        setError('This email already exists.');
        return;
      }
      if (taken.phoneExists) {
        setError('This phone number already exists.');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            account_type: accountType,
            full_name: fullName.trim(),
            phone: normalizePhone(phone),
            city: city || null,
            cnic: isDealer ? cnic : null,
            business_name: isDealer ? businessName : null,
            business_address: isDealer ? businessAddress : null,
            visiting_card_url: isDealer ? visitingCard : null,
          },
        },
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Sign up failed — no user returned');

      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email.trim().toLowerCase(),
        phone: normalizePhone(phone),
        full_name: fullName.trim(),
        city: city || null,
        account_type: accountType,
        cnic: isDealer ? cnic : null,
        business_name: isDealer ? businessName : null,
        business_address: isDealer ? businessAddress : null,
      });

      await refreshProfile(data.user.id);
      onSuccess();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      await refreshProfile();
      onSuccess();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    setError(null);
    setInfo(null);
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      });
      if (resetError) throw resetError;
      setInfo('Reset link sent. Check your email and click the link to set a new password.');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      completePasswordRecovery?.();
      setInfo('Password updated. You can now use your new password.');
      setTimeout(() => onSuccess(), 800);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (view === 'login') return handleLogin();
    if (view === 'signup') return handleSignup();
    if (view === 'forgot') return handleForgot();
    return handleReset();
  };

  const titles = {
    login: ['Welcome back', 'Sign in to post ads and manage your listings'],
    signup: ['Create your account', 'Join SellSolar to buy and sell solar equipment'],
    forgot: ['Reset your password', 'We will email you a reset link'],
    reset: ['Set a new password', 'Enter a new password for your account'],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="container-page flex h-16 items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30">
              <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Sell<span className="text-primary-500">Solar</span>
            </span>
          </button>
          <button type="button" onClick={onBack} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            Back to Home
          </button>
        </div>
      </div>

      <div className="container-page flex flex-col items-center justify-center py-12 lg:py-16">
        <div className="w-full max-w-md">
          {(view === 'login' || view === 'signup') && (
            <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => go('login')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${view === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => go('signup')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${view === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="card p-6 shadow-xl sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{titles[view][0]}</h1>
            <p className="mt-1 text-sm text-gray-500">{titles[view][1]}</p>

            {view === 'signup' && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-gray-700">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('individual')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${accountType === 'individual' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <User className={`h-6 w-6 ${accountType === 'individual' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${accountType === 'individual' ? 'text-primary-700' : 'text-gray-600'}`}>Individual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('dealer')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${isDealer ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Store className={`h-6 w-6 ${isDealer ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${isDealer ? 'text-primary-700' : 'text-gray-600'}`}>Dealer</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {view === 'signup' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="input-field pl-11" />
                  </div>
                </div>
              )}

              {view !== 'reset' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`input-field pl-11 ${email.trim() && !isValidEmail(email) ? 'border-error-400' : ''}`}
                    />
                  </div>
                  {email.trim() && !isValidEmail(email) ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">Please enter a valid email address</p>
                  ) : null}
                </div>
              )}

              {(view === 'login' || view === 'signup' || view === 'reset') && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {view === 'reset' ? 'New password *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="input-field pl-11 pr-11"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Minimum 8 characters.</p>
                </div>
              )}

              {view === 'reset' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirm password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="input-field"
                  />
                </div>
              )}

              {view === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => go('forgot')} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </button>
                </div>
              )}

              {view === 'signup' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03001234567" className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <select value={city} onChange={(e) => setCity(e.target.value)} className="select-field pl-11">
                        <option value="">Select your city</option>
                        {CITIES.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {isDealer && (
                    <div className="space-y-4 rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary-700">
                        <Store className="h-4 w-4" />
                        Dealer Information (Mandatory)
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">CNIC Number *</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={cnic} onChange={(e) => setCnic(e.target.value)} placeholder="12345-1234567-1" className="input-field pl-11" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Business Name *</label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. SolarTech Pakistan" className="input-field" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Business Address</label>
                        <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Shop address" className="input-field" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Visiting Card Image URL</label>
                        <div className="relative">
                          <Image className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={visitingCard} onChange={(e) => setVisitingCard(e.target.value)} placeholder="https://..." className="input-field pl-11" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {info && (
                <div className="rounded-lg bg-secondary-50 p-3 text-sm font-medium text-secondary-700">{info}</div>
              )}

              <button type="button" onClick={submit} disabled={busy} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Please wait...
                  </>
                ) : view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Send reset link' : 'Save new password'}
              </button>

              {view === 'login' && (
                <p className="text-center text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => go('signup')} className="font-semibold text-primary-600 hover:text-primary-700">Sign up</button>
                </p>
              )}
              {view === 'signup' && (
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => go('login')} className="font-semibold text-primary-600 hover:text-primary-700">Login</button>
                </p>
              )}
              {(view === 'forgot' || view === 'reset') && (
                <p className="text-center text-sm text-gray-500">
                  <button type="button" onClick={() => go('login')} className="font-semibold text-primary-600 hover:text-primary-700">Back to login</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

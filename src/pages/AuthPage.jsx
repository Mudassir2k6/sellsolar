import { useEffect, useState } from 'react';
import {
  CircleAlert,
  CircleCheck,
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
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth, getStoredUsers, DEFAULT_ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CITIES } from '../lib/constants';
import { digitsOnlyPhone, isValidEmail, isValidPhone, normalizePhone } from '../lib/auth';

function authErrorMessage(error, activeView = 'login') {
  if (!error) return 'An error occurred. Please try again.';
  const rawMsg = error instanceof Error ? error.message : String(error?.message || error || '');
  const message = rawMsg.toLowerCase();

  if (
    error?.code === '23505' ||
    message.includes('profiles_email_unique') ||
    ((message.includes('already registered') || message.includes('already been registered') || message.includes('already exists')) && message.includes('email'))
  ) {
    return 'This email address is already registered. Please login instead.';
  }
  if (message.includes('profiles_phone_unique') || (message.includes('already exists') && message.includes('phone'))) {
    return 'This phone number is already registered with another account.';
  }
  if (message.includes('already registered') || message.includes('already been registered') || message.includes('already exists')) {
    return activeView === 'signup'
      ? 'An account with this email already exists. Please log in.'
      : 'This account already exists. Please login.';
  }
  if (error?.code === 'weak_password' || message.includes('weak_password') || message.includes('pwned') || message.includes('password is known')) {
    return 'Please use a password of at least 8 characters.';
  }
  if (message.includes('rate limit') || message.includes('email_rate_limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please check your email to confirm your account, or sign in directly.';
  }
  if (message.includes('invalid email') || message.includes('unable to validate email') || (message.includes('email address') && message.includes('invalid'))) {
    return 'Please enter a valid email address (e.g. you@example.com).';
  }

  // Filter out any raw API key / backend auth internal messages
  if (
    message.includes('invalid login') ||
    message.includes('invalid credentials') ||
    message.includes('invalid api key') ||
    message.includes('api key') ||
    message.includes('apikey') ||
    message.includes('jwt') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    if (activeView === 'signup') {
      return 'Could not complete registration. Please check your details and try again.';
    }
    return 'Incorrect email or password. Please try again or create an account.';
  }

  if (activeView === 'signup') {
    return rawMsg && !message.includes('api') && !message.includes('key')
      ? rawMsg
      : 'Registration failed. Please check your information and try again.';
  }

  return rawMsg && !message.includes('api') && !message.includes('key')
    ? rawMsg
    : 'Incorrect email or password. Please try again or create an account.';
}

async function contactAlreadyExists(email, phone) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = normalizePhone(phone);

  // 1. Check local storage users
  const localUsers = getStoredUsers();
  if (localUsers[cleanEmail]) {
    return { emailExists: true, phoneExists: false };
  }
  
  // Note: Only check duplicate phone against non-admin accounts to avoid blocking demo testers
  for (const k of Object.keys(localUsers)) {
    if (k === DEFAULT_ADMIN_EMAIL.toLowerCase()) continue;
    const p = localUsers[k].profile;
    if (p && normalizePhone(p.phone) === cleanPhone) {
      return { emailExists: false, phoneExists: true };
    }
  }

  // 2. If Supabase is configured and reachable, check remote DB
  if (isSupabaseConfigured()) {
    try {
      const [{ data: emailRow }, { data: phoneRow }] = await Promise.all([
        supabase.from('profiles').select('id').ilike('email', cleanEmail).maybeSingle(),
        supabase.from('profiles').select('id').eq('phone', cleanPhone).maybeSingle(),
      ]);

      return {
        emailExists: Boolean(emailRow?.id),
        phoneExists: Boolean(phoneRow?.id),
      };
    } catch {
      // Ignore network / key errors
    }
  }

  return { emailExists: false, phoneExists: false };
}

export default function AuthPage({ onSuccess, onBack, initialView = 'login' }) {
  const { signIn, signUp, updatePassword, refreshProfile, completePasswordRecovery } = useAuth();
  const { showToast } = useToast();
  const [view, setView] = useState(initialView);
  const [accountType, setAccountType] = useState('individual');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [cnic, setCnic] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [visitingCard, setVisitingCard] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const isDealer = accountType === 'dealer';

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const clearSignupFields = () => {
    setAccountType('individual');
    setShowPassword(false);
    setEmail('');
    setEmailTouched(false);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setCity('');
    setCnic('');
    setBusinessName('');
    setBusinessAddress('');
    setVisitingCard('');
    setFieldErrors({});
    setError(null);
    setInfo(null);
  };

  const clearFieldError = (key) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  };

  const fieldClass = (key, extra = '') =>
    `input-field ${extra} ${
      fieldErrors[key] ? 'border-error-400 ring-1 ring-error-200 dark:border-error-500' : ''
    }`.trim();

  const go = (next) => {
    if (next === 'signup') {
      clearSignupFields();
    } else {
      setError(null);
      setInfo(null);
      setFieldErrors({});
    }
    setView(next);
  };

  const handleSignup = async () => {
    setError(null);
    const nextErrors = {
      fullName: !fullName.trim(),
      email: !email.trim() || !isValidEmail(email),
      password: !password.trim() || password.length < 8,
      phone: !isValidPhone(phone),
      city: !city.trim(),
      cnic: isDealer && !cnic.trim(),
      businessName: isDealer && !businessName.trim(),
      businessAddress: isDealer && !businessAddress.trim(),
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setBusy(true);
    try {
      const taken = await contactAlreadyExists(email, phone);
      if (taken.emailExists) {
        setError('This email is already registered. Please log in or use another email.');
        return;
      }
      if (taken.phoneExists) {
        setError('This phone number is already registered with another account.');
        return;
      }

      const res = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: normalizePhone(phone),
        city: city || null,
        accountType,
        cnic: isDealer ? cnic : null,
        businessName: isDealer ? businessName : null,
        businessAddress: isDealer ? businessAddress : null,
        visitingCard: isDealer ? visitingCard : null,
      });

      if (!res?.success) {
        throw new Error('Could not create account. Please try again.');
      }

      showToast({
        title: 'Account Created Successfully',
        message: `Welcome to SellSolar! You are now logged in as ${email.trim()}.`,
        type: 'success',
      });
      window.setTimeout(() => onSuccess(), 800);
    } catch (err) {
      setError(authErrorMessage(err, 'signup'));
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    const nextErrors = {
      email: !email.trim() || !isValidEmail(email),
      password: !password.trim(),
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    setBusy(true);
    try {
      const res = await signIn(email.trim(), password.trim());
      showToast({
        title: 'Successfully Logged In',
        message: `Welcome back! Signed in as ${email.trim()}.`,
        type: 'success',
      });
      onSuccess();
    } catch (err) {
      setError(authErrorMessage(err, 'login'));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    setError(null);
    setInfo(null);
    const emailInvalid = !email.trim() || !isValidEmail(email);
    setFieldErrors({ email: emailInvalid });
    if (emailInvalid) {
      return;
    }
    setBusy(true);
    try {
      if (isSupabaseConfigured()) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`,
        });
        if (resetError) {
          setInfo(`Reset instructions recorded for ${email.trim()}. You can set your new password directly below.`);
          setTimeout(() => go('reset'), 1000);
          return;
        }
        setInfo('Reset link sent. Check your email inbox to set a new password.');
      } else {
        setInfo(`Password reset initiated for ${email.trim()}. Please enter your new password below.`);
        setTimeout(() => go('reset'), 1000);
      }
    } catch (err) {
      setError(authErrorMessage(err, 'forgot'));
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
      if (updatePassword) {
        await updatePassword(password, email.trim());
      }
      completePasswordRecovery?.();
      showToast({
        title: 'Password Updated',
        message: 'Your password has been reset successfully.',
        type: 'success',
      });
      setInfo('Password updated successfully! You can now sign in.');
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(authErrorMessage(err, 'reset'));
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
    forgot: ['Reset your password', 'We will help you securely recover your account'],
    reset: ['Set a new password', 'Enter a new password for your account'],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      <div className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container-page flex h-16 items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30">
              <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Sell<span className="text-primary-500">Solar</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Back to Home
          </button>
        </div>
      </div>

      <div className="container-page flex flex-col items-center justify-center py-12 lg:py-16">
        <div className="w-full max-w-md">
          {(view === 'login' || view === 'signup') && (
            <div className="mb-6 flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
              <button
                type="button"
                onClick={() => go('login')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  view === 'login'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => go('signup')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  view === 'signup'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="card p-6 shadow-xl sm:p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {titles[view][0]}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{titles[view][1]}</p>

            {view === 'signup' && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('individual')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      accountType === 'individual'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <User
                      className={`h-6 w-6 ${
                        accountType === 'individual'
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        accountType === 'individual'
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Individual
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('dealer')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      isDealer
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Store
                      className={`h-6 w-6 ${
                        isDealer ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        isDealer
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Dealer
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {view === 'signup' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                        fieldErrors.fullName ? 'text-error-500' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearFieldError('fullName');
                      }}
                      placeholder="Enter your full name"
                      className={fieldClass('fullName', 'pl-11 pr-11')}
                    />
                    {fieldErrors.fullName ? (
                      <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                    ) : null}
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-1.5 text-xs font-medium text-error-600">Full Name is required.</p>
                  )}
                </div>
              )}

              {view !== 'reset' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                        fieldErrors.email || (email.trim() && !isValidEmail(email))
                          ? 'text-error-500'
                          : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value.replace(/\s/g, ''));
                        clearFieldError('email');
                        setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="you@example.com"
                      className={fieldClass(
                        'email',
                        `pl-11 pr-11 ${
                          email.trim() && !isValidEmail(email) ? 'border-error-400' : ''
                        }`
                      )}
                    />
                    {fieldErrors.email ||
                    (emailTouched && email.trim() && !isValidEmail(email)) ? (
                      <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                    ) : null}
                  </div>
                  {fieldErrors.email && !email.trim() ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">Email is required.</p>
                  ) : email.trim() && !isValidEmail(email) ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">
                      Please enter a valid email address (e.g. you@example.com).
                    </p>
                  ) : null}
                </div>
              )}

              {(view === 'login' || view === 'signup' || view === 'reset') && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {view === 'reset' ? 'New password *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                        fieldErrors.password ? 'text-error-500' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError('password');
                      }}
                      placeholder="At least 8 characters"
                      className={fieldClass('password', 'pl-11 pr-16')}
                    />
                    {fieldErrors.password ? (
                      <CircleAlert className="absolute right-11 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">
                      {password.trim()
                        ? 'Password must be at least 8 characters.'
                        : 'Password is required.'}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-gray-400">Any 8 or more characters.</p>
                  )}
                </div>
              )}

              {view === 'reset' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Confirm password *
                  </label>
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
                  <button
                    type="button"
                    onClick={() => go('forgot')}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {view === 'signup' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone
                        className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                          fieldErrors.phone ? 'text-error-500' : 'text-gray-400'
                        }`}
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        value={phone}
                        onChange={(e) => {
                          setPhone(digitsOnlyPhone(e.target.value));
                          clearFieldError('phone');
                        }}
                        placeholder="03001234567"
                        className={fieldClass('phone', 'pl-11 pr-11')}
                      />
                      {fieldErrors.phone ? (
                        <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                      ) : null}
                    </div>
                    {fieldErrors.phone ? (
                      <p className="mt-1.5 text-xs font-medium text-error-600">
                        {phone ? 'Phone number must be exactly 11 digits.' : 'Phone is required.'}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-gray-400">
                        Must be 11 digits, e.g. 03001234567
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin
                        className={`absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${
                          fieldErrors.city ? 'text-error-500' : 'text-gray-400'
                        }`}
                      />
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          clearFieldError('city');
                        }}
                        className={`select-field pl-11 pr-11 bg-white dark:bg-gray-900 ${
                          fieldErrors.city ? 'border-error-400 ring-1 ring-error-200' : ''
                        }`}
                      >
                        <option value="">Select your city</option>
                        {CITIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.city ? (
                        <CircleAlert className="pointer-events-none absolute right-8 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                      ) : null}
                    </div>
                    {fieldErrors.city ? (
                      <p className="mt-1.5 text-xs font-medium text-error-600">City is required.</p>
                    ) : null}
                  </div>
                  {isDealer && (
                    <div className="space-y-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 p-4 ring-1 ring-primary-100 dark:ring-primary-900">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                        <Store className="h-4 w-4" />
                        Dealer Information (Mandatory)
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          CNIC Number *
                        </label>
                        <div className="relative">
                          <CreditCard
                            className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                              fieldErrors.cnic ? 'text-error-500' : 'text-gray-400'
                            }`}
                          />
                          <input
                            type="text"
                            value={cnic}
                            onChange={(e) => {
                              setCnic(e.target.value);
                              clearFieldError('cnic');
                            }}
                            placeholder="12345-1234567-1"
                            className={fieldClass('cnic', 'pl-11 pr-11')}
                          />
                          {fieldErrors.cnic ? (
                            <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Business Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={businessName}
                            onChange={(e) => {
                              setBusinessName(e.target.value);
                              clearFieldError('businessName');
                            }}
                            placeholder="e.g. SolarTech Pakistan"
                            className={fieldClass('businessName', 'pr-11')}
                          />
                          {fieldErrors.businessName ? (
                            <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Business Address *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={businessAddress}
                            onChange={(e) => {
                              setBusinessAddress(e.target.value);
                              clearFieldError('businessAddress');
                            }}
                            placeholder="Shop address"
                            className={fieldClass('businessAddress', 'pr-11')}
                          />
                          {fieldErrors.businessAddress ? (
                            <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Visiting Card Image URL
                        </label>
                        <div className="relative">
                          <Image className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={visitingCard}
                            onChange={(e) => setVisitingCard(e.target.value)}
                            placeholder="https://..."
                            className="input-field pl-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-lg bg-error-50 dark:bg-error-950/40 p-3 text-sm text-error-700 dark:text-error-300 border border-error-200 dark:border-error-800">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex-1">
                      <span>{error}</span>
                    </div>
                  </div>
                  {error.includes('already registered') && (
                    <button
                      type="button"
                      onClick={() => go('login')}
                      className="w-full text-center text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1"
                    >
                      Click here to go to Login &rarr;
                    </button>
                  )}
                </div>
              )}
              {info && (
                <div className="flex items-start gap-2 rounded-lg bg-secondary-50 dark:bg-secondary-950/40 p-3 text-sm font-medium text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-800">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{info}</span>
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Please wait...
                  </>
                ) : view === 'login' ? (
                  'Sign In'
                ) : view === 'signup' ? (
                  'Create Account'
                ) : view === 'forgot' ? (
                  'Send reset link'
                ) : (
                  'Save new password'
                )}
              </button>

              {view === 'login' && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => go('signup')}
                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Sign up
                  </button>
                </p>
              )}
              {view === 'signup' && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => go('login')}
                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Login
                  </button>
                </p>
              )}
              {(view === 'forgot' || view === 'reset') && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={() => go('login')}
                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Back to login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

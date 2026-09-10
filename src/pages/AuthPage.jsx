import { useEffect, useRef, useState } from 'react';
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
    message.includes('profiles_email_unique') ||
    ((message.includes('already registered') || message.includes('already been registered') || message.includes('already exists')) && message.includes('email'))
  ) {
    return 'This Email Address is already registered. Please log in or use a different email.';
  }
  if (
    error?.code === '23505' ||
    message.includes('unique_username') ||
    message.includes('profiles_username_unique') ||
    ((message.includes('already registered') || message.includes('already been registered') || message.includes('already exists')) && message.includes('username'))
  ) {
    return 'This Username is already taken. Please choose a different username.';
  }
  if (message.includes('profiles_phone_unique') || (message.includes('already exists') && message.includes('phone'))) {
    return 'This Phone Number is already registered. Please use another number or log in.';
  }
  if (message.includes('already registered') || message.includes('already been registered') || message.includes('already exists')) {
    return activeView === 'signup'
      ? 'This account or identifier is already taken. Please choose another or log in.'
      : 'This account already exists. Please log in.';
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
    return 'Please enter a valid username, mobile, or email address.';
  }

  // Account not found / not registered check
  if (
    message.includes('no account found') ||
    message.includes('user not found') ||
    message.includes('sign up first') ||
    message.includes('not registered')
  ) {
    return 'No account found with this username or ID. Please sign up first.';
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
    return 'Incorrect username or password. If you do not have an account, please sign up first.';
  }

  if (activeView === 'signup') {
    return rawMsg && !message.includes('api') && !message.includes('key')
      ? rawMsg
      : 'Registration failed. Please check your information and try again.';
  }

  return rawMsg && !message.includes('api') && !message.includes('key')
    ? rawMsg
    : 'Incorrect username or password. Please try again or create an account.';
}

async function contactAlreadyExists({ username, email, phone, cnic }) {
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = normalizePhone(phone || '');
  const cleanCnic = (cnic || '').trim().toLowerCase();

  // 0. Check default admin username / email
  if (cleanUsername === 'mudassir2k6' || cleanUsername === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
    return {
      field: 'username',
      message: 'This Username is already taken. Please choose a different username.',
    };
  }
  if (cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
    return {
      field: 'signupEmail',
      message: 'This Email Address is already registered. Please log in or use a different email.',
    };
  }

  // 1. If Supabase is configured and reachable, check live DB first
  if (isSupabaseConfigured()) {
    try {
      if (cleanUsername) {
        const { data: idRow } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', cleanUsername)
          .maybeSingle();
        if (idRow?.id) {
          return {
            field: 'username',
            message: 'This Username is already taken. Please choose a different username.',
          };
        }
      }

      if (cleanEmail) {
        const { data: emailRow } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', cleanEmail)
          .maybeSingle();
        if (emailRow?.id) {
          return {
            field: 'signupEmail',
            message: 'This Email Address is already registered. Please log in or use a different email.',
          };
        }
      }

      if (cleanPhone) {
        const { data: phoneRow } = await supabase
          .from('profiles')
          .select('id, email, username')
          .eq('phone', cleanPhone)
          .maybeSingle();
        if (
          phoneRow?.id &&
          phoneRow.id !== DEFAULT_ADMIN_ID &&
          phoneRow.email?.toLowerCase() !== DEFAULT_ADMIN_EMAIL.toLowerCase() &&
          phoneRow.username?.toLowerCase() !== 'mudassir2k6'
        ) {
          return {
            field: 'phone',
            message: 'This Phone Number is already registered. Please use another number or log in.',
          };
        }
      }

      if (cleanCnic) {
        const { data: cnicRow } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('cnic', cleanCnic)
          .maybeSingle();
        if (
          cnicRow?.id &&
          cnicRow.id !== DEFAULT_ADMIN_ID &&
          cnicRow.email?.toLowerCase() !== DEFAULT_ADMIN_EMAIL.toLowerCase()
        ) {
          return {
            field: 'cnic',
            message: 'This CNIC is already registered with another account.',
          };
        }
      }

      // Live Supabase check passed with no duplicate found.
      // Do not allow stale browser localStorage cache to block valid registrations.
      return null;
    } catch {
      // Network/service error, fall back to offline local check below
    }
  }

  // 2. Fallback offline local storage check (when Supabase not configured or offline)
  const localUsers = getStoredUsers();
  for (const k of Object.keys(localUsers)) {
    const p = localUsers[k]?.profile;
    if (
      !p ||
      p.is_admin ||
      k.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      p.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      p.username?.toLowerCase() === 'mudassir2k6'
    ) {
      continue;
    }

    if (cleanUsername && p.username && p.username.toLowerCase() === cleanUsername) {
      return {
        field: 'username',
        message: 'This Username is already taken. Please choose a different username.',
      };
    }

    if (cleanEmail && p.email && p.email.toLowerCase() === cleanEmail) {
      return {
        field: 'signupEmail',
        message: 'This Email Address is already registered. Please log in or use a different email.',
      };
    }

    if (cleanPhone && p.phone && normalizePhone(p.phone) === cleanPhone) {
      return {
        field: 'phone',
        message: 'This Phone Number is already registered. Please use another number or log in.',
      };
    }

    if (cleanCnic && p.cnic && p.cnic.trim().toLowerCase() === cleanCnic) {
      return {
        field: 'cnic',
        message: 'This CNIC is already registered with another account.',
      };
    }
  }

  return null;
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
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupEmailTouched, setSignupEmailTouched] = useState(false);
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
  const [fieldErrorMessages, setFieldErrorMessages] = useState({});
  const isDealer = accountType === 'dealer';

  // Input element refs for moving cursor/focus into the exact field
  const fullNameRef = useRef(null);
  const signupUsernameRef = useRef(null);
  const signupEmailRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);
  const cityRef = useRef(null);
  const cnicRef = useRef(null);
  const businessNameRef = useRef(null);
  const businessAddressRef = useRef(null);

  const focusField = (fieldKey) => {
    setTimeout(() => {
      const refMap = {
        fullName: fullNameRef.current,
        username: signupUsernameRef.current,
        signupUsername: signupUsernameRef.current,
        email: view === 'signup' ? signupEmailRef.current : emailRef.current,
        signupEmail: signupEmailRef.current,
        password: passwordRef.current,
        confirmPassword: confirmPasswordRef.current,
        phone: phoneRef.current,
        city: cityRef.current,
        cnic: cnicRef.current,
        businessName: businessNameRef.current,
        businessAddress: businessAddressRef.current,
      };
      const target = refMap[fieldKey];
      if (target) {
        try {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {
          // ignore
        }
        target.focus();
        if (typeof target.select === 'function') {
          target.select();
        }
      }
    }, 50);
  };

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const clearSignupFields = () => {
    setAccountType('individual');
    setShowPassword(false);
    setSignupUsername('');
    setSignupEmail('');
    setSignupEmailTouched(false);
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
    setFieldErrorMessages({});
    setError(null);
    setInfo(null);
  };

  const clearFieldError = (key) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
    setFieldErrorMessages((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
    setError(null);
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
      setFieldErrorMessages({});
    }
    setView(next);
  };

  const handleSignup = async () => {
    setError(null);
    setFieldErrorMessages({});
    const cleanUName = signupUsername.trim();
    const cleanMail = signupEmail.trim().toLowerCase();
    const isMailValid = isValidEmail(cleanMail);

    const nextErrors = {
      fullName: !fullName.trim(),
      username: !cleanUName || cleanUName.length < 3,
      signupEmail: !cleanMail || !isMailValid,
      password: !password.trim() || password.length < 8,
      phone: !isValidPhone(phone),
      city: !city.trim(),
      cnic: isDealer && !cnic.trim(),
      businessName: isDealer && !businessName.trim(),
      businessAddress: isDealer && !businessAddress.trim(),
    };
    setFieldErrors(nextErrors);

    // If validation fails, focus the first erroneous field immediately
    if (nextErrors.fullName) {
      focusField('fullName');
      return;
    }
    if (nextErrors.username) {
      focusField('username');
      return;
    }
    if (nextErrors.signupEmail) {
      if (!cleanMail) {
        setFieldErrorMessages((prev) => ({ ...prev, signupEmail: 'Email address is required.' }));
      } else if (!isMailValid) {
        setFieldErrorMessages((prev) => ({
          ...prev,
          signupEmail: 'Please enter a valid email address (e.g. you@example.com).',
        }));
      }
      focusField('signupEmail');
      return;
    }
    if (nextErrors.password) {
      focusField('password');
      return;
    }
    if (nextErrors.phone) {
      focusField('phone');
      return;
    }
    if (nextErrors.city) {
      focusField('city');
      return;
    }
    if (nextErrors.cnic) {
      focusField('cnic');
      return;
    }
    if (nextErrors.businessName) {
      focusField('businessName');
      return;
    }
    if (nextErrors.businessAddress) {
      focusField('businessAddress');
      return;
    }

    setBusy(true);
    try {
      const duplicate = await contactAlreadyExists({
        username: cleanUName,
        email: cleanMail,
        phone,
        cnic: isDealer ? cnic : null,
      });
      if (duplicate) {
        setError(duplicate.message);
        setFieldErrors((prev) => ({ ...prev, [duplicate.field]: true }));
        setFieldErrorMessages((prev) => ({ ...prev, [duplicate.field]: duplicate.message }));
        focusField(duplicate.field);
        return;
      }

      const res = await signUp({
        username: cleanUName,
        email: cleanMail,
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
        message: `Welcome to SellSolar! You are now logged in as ${cleanUName || cleanMail}.`,
        type: 'success',
      });
      window.setTimeout(() => onSuccess(), 800);
    } catch (err) {
      const errMsg = authErrorMessage(err, 'signup');
      const lower = (err?.message || '').toLowerCase();
      if (
        lower.includes('email') ||
        lower.includes('user already')
      ) {
        const msg = 'This Email Address is already registered. Please log in or use a different email.';
        setError(msg);
        setFieldErrors((prev) => ({ ...prev, signupEmail: true }));
        setFieldErrorMessages((prev) => ({ ...prev, signupEmail: msg }));
        focusField('signupEmail');
      } else if (lower.includes('username') || lower.includes('23505')) {
        const msg = 'This Username is already taken. Please choose a different username.';
        setError(msg);
        setFieldErrors((prev) => ({ ...prev, username: true }));
        setFieldErrorMessages((prev) => ({ ...prev, username: msg }));
        focusField('username');
      } else if (lower.includes('phone')) {
        const msg = 'This Phone Number is already registered. Please use another number or log in.';
        setError(msg);
        setFieldErrors((prev) => ({ ...prev, phone: true }));
        setFieldErrorMessages((prev) => ({ ...prev, phone: msg }));
        focusField('phone');
      } else if (lower.includes('cnic')) {
        const msg = 'This CNIC is already registered with another account.';
        setError(msg);
        setFieldErrors((prev) => ({ ...prev, cnic: true }));
        setFieldErrorMessages((prev) => ({ ...prev, cnic: msg }));
        focusField('cnic');
      } else {
        setError(errMsg);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setFieldErrorMessages({});
    const nextErrors = {
      email: !email.trim(),
      password: !password.trim(),
    };
    setFieldErrors(nextErrors);
    if (nextErrors.email) {
      focusField('email');
      return;
    }
    if (nextErrors.password) {
      focusField('password');
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
      focusField('password');
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
      setError('Please enter a valid email address (e.g. you@example.com) to receive the password reset link.');
      focusField('email');
      return;
    }
    setBusy(true);
    try {
      if (isSupabaseConfigured()) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`,
        });
        if (resetError) {
          console.warn('Supabase reset link notice:', resetError);
        }
      }
      showToast({
        title: 'Reset Link Sent',
        message: `A password reset link has been sent to ${email.trim()}. Please check your email inbox.`,
        type: 'success',
      });
      setInfo(`Password reset link sent to ${email.trim()}! Please check your email inbox to reset your password.`);
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
    login: ['Welcome back', 'Sign in using your username, mobile, or CNIC'],
    signup: ['Create your account', 'Join SellSolar with any unique username or identifier'],
    forgot: ['Reset your password', 'Enter your registered email and we will send you a password reset link'],
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
                    onClick={() => {
                      setAccountType('individual');
                      setError(null);
                    }}
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
                    onClick={() => {
                      setAccountType('dealer');
                      setError(null);
                    }}
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
                <>
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
                        ref={fullNameRef}
                        id="signup-fullname-input"
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

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Username *
                      </label>
                      <span className="text-[11px] font-medium text-primary-600 dark:text-primary-400">
                        Unique ID
                      </span>
                    </div>
                    <div className="relative">
                      <User
                        className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                          fieldErrors.username ? 'text-error-500' : 'text-gray-400'
                        }`}
                      />
                      <input
                        ref={signupUsernameRef}
                        id="signup-username-input"
                        type="text"
                        autoComplete="username"
                        required
                        value={signupUsername}
                        onChange={(e) => {
                          setSignupUsername(e.target.value.trim());
                          clearFieldError('username');
                        }}
                        placeholder="e.g. mudassir2k6 or solar_tech"
                        className={fieldClass('username', 'pl-11 pr-11')}
                      />
                      {fieldErrors.username ? (
                        <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                      ) : null}
                    </div>
                    {fieldErrors.username && fieldErrorMessages.username ? (
                      <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                        {fieldErrorMessages.username}
                      </p>
                    ) : fieldErrors.username && !signupUsername.trim() ? (
                      <p className="mt-1.5 text-xs font-medium text-error-600">Username is required.</p>
                    ) : fieldErrors.username && signupUsername.trim().length < 3 ? (
                      <p className="mt-1.5 text-xs font-medium text-error-600">Username must be at least 3 characters.</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Unique handle for your public solar profile.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                          fieldErrors.signupEmail ? 'text-error-500' : 'text-gray-400'
                        }`}
                      />
                      <input
                        ref={signupEmailRef}
                        id="signup-email-input"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value.replace(/\s/g, ''));
                          clearFieldError('signupEmail');
                          setSignupEmailTouched(true);
                        }}
                        onBlur={() => setSignupEmailTouched(true)}
                        placeholder="you@example.com"
                        className={fieldClass(
                          'signupEmail',
                          `pl-11 pr-11 ${
                            signupEmail.trim() && !isValidEmail(signupEmail) ? 'border-error-400' : ''
                          }`
                        )}
                      />
                      {fieldErrors.signupEmail ||
                      (signupEmailTouched && signupEmail.trim() && !isValidEmail(signupEmail)) ? (
                        <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                      ) : null}
                    </div>
                    {fieldErrors.signupEmail && fieldErrorMessages.signupEmail ? (
                      <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                        {fieldErrorMessages.signupEmail}
                      </p>
                    ) : fieldErrors.signupEmail && !signupEmail.trim() ? (
                      <p className="mt-1.5 text-xs font-medium text-error-600">Email address is mandatory.</p>
                    ) : (signupEmailTouched || fieldErrors.signupEmail) &&
                      signupEmail.trim() &&
                      !isValidEmail(signupEmail) ? (
                      <p className="mt-1.5 text-xs font-medium text-error-600">
                        Please enter a valid email address (e.g. you@example.com).
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Mandatory. Official notifications and account recovery will be sent here.
                      </p>
                    )}
                  </div>
                </>
              )}

              {view === 'forgot' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Registered Email Address *
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
                      ref={emailRef}
                      id="forgot-email-input"
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
                    <p className="mt-1.5 text-xs font-medium text-error-600">Email address is required.</p>
                  ) : email.trim() && !isValidEmail(email) ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">
                      Please enter a valid email address (e.g. you@example.com) to receive the password reset link.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      ✉️ A secure password reset link will be sent to your verified email address.
                    </p>
                  )}
                </div>
              )}

              {view === 'login' && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Username *
                    </label>
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                      Unique ID / Mobile / CNIC
                    </span>
                  </div>
                  <div className="relative">
                    <User
                      className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                        fieldErrors.email ? 'text-error-500' : 'text-gray-400'
                      }`}
                    />
                    <input
                      ref={emailRef}
                      id="login-username-input"
                      type="text"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value.trim());
                        clearFieldError('email');
                        setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="e.g. mudassir2k6, 03001234567, or 35201-1234567-1"
                      className={fieldClass('email', 'pl-11 pr-11')}
                    />
                    {fieldErrors.email ? (
                      <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                    ) : null}
                  </div>
                  {fieldErrors.email && !email.trim() ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">
                      Username is required.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      💡 <span className="font-semibold text-gray-700 dark:text-gray-300">Hint:</span> Enter your unique username, mobile number (03XXXXXXXXX), or CNIC.
                    </p>
                  )}
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
                      ref={passwordRef}
                      id="auth-password-input"
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
                    ref={confirmPasswordRef}
                    id="auth-confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
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
                        ref={phoneRef}
                        id="signup-phone-input"
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
                    {fieldErrors.phone && fieldErrorMessages.phone ? (
                      <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                        {fieldErrorMessages.phone}
                      </p>
                    ) : fieldErrors.phone ? (
                      <p className="mt-1.5 text-xs font-medium text-error-600">
                        {phone ? 'Phone number must be exactly 11 digits (e.g. 03001234567).' : 'Phone is required.'}
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
                        ref={cityRef}
                        id="signup-city-select"
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
                            ref={cnicRef}
                            id="signup-cnic-input"
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
                        {fieldErrors.cnic && fieldErrorMessages.cnic ? (
                          <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                            {fieldErrorMessages.cnic}
                          </p>
                        ) : fieldErrors.cnic ? (
                          <p className="mt-1.5 text-xs font-medium text-error-600">CNIC is required for dealers.</p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Business Name *
                        </label>
                        <div className="relative">
                          <input
                            ref={businessNameRef}
                            id="signup-business-name-input"
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
                            ref={businessAddressRef}
                            id="signup-business-address-input"
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
                            onChange={(e) => {
                              setVisitingCard(e.target.value);
                              setError(null);
                            }}
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
                  <div
                    id="auth-error-alert"
                    tabIndex={-1}
                    className="flex items-start gap-2.5 rounded-xl bg-error-50 dark:bg-error-950/50 p-3.5 text-sm font-medium text-error-700 dark:text-error-300 border border-error-200 dark:border-error-800 shadow-xs"
                  >
                    <CircleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-error-600 dark:text-error-400" />
                    <div className="flex-1">
                      <span className="font-semibold">{error}</span>
                    </div>
                  </div>
                  {(error.toLowerCase().includes('already taken') ||
                    error.toLowerCase().includes('already registered') ||
                    error.toLowerCase().includes('already exists')) && (
                    <button
                      type="button"
                      onClick={() => go('login')}
                      className="w-full text-center text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors cursor-pointer"
                    >
                      Already registered? Click here to Log In &rarr;
                    </button>
                  )}
                  {(error.toLowerCase().includes('sign up') ||
                    error.toLowerCase().includes('no account') ||
                    error.toLowerCase().includes('not registered')) && (
                    <button
                      type="button"
                      onClick={() => go('signup')}
                      className="w-full text-center text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors cursor-pointer"
                    >
                      Don&apos;t have an account? Click here to Sign Up &rarr;
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

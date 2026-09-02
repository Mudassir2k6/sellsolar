import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CircleAlert,
  Home,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  Wrench,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { digitsOnlyPhone, isValidPhone, normalizePhone } from '../lib/auth';
import { CITIES } from '../lib/constants';
import { submitInstallationRequest, ADMIN_NOTIFICATION_EMAIL } from '../lib/installation';

const PAKISTAN_CITIES = [
  ...CITIES,
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhang',
  'Rahim Yar Khan',
  'Mardan',
  'Kasur',
  'Dera Ghazi Khan',
  'Wah Cantt',
  'Other',
];

const SYSTEM_SIZES = [
  '3 kW (Small Home / Essential Load)',
  '5 kW (Standard 5-10 Marla Home)',
  '10 kW (1 Kanal Luxury Residence / AC load)',
  '15 kW (Large Residence / Small Commercial)',
  '20 kW (Commercial / Plaza)',
  '30+ kW (Industrial / Heavy Load)',
  'Custom / Need Expert Site Assessment',
];

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Agricultural / Farm'];

export default function InstallationRequestPage({ onBack }) {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [city, setCity] = useState(profile?.city || '');
  const [customCity, setCustomCity] = useState('');
  const [address, setAddress] = useState(profile?.business_address || '');
  const [phone, setPhone] = useState(digitsOnlyPhone(profile?.phone || ''));
  const [systemSize, setSystemSize] = useState('5 kW (Standard 5-10 Marla Home)');
  const [propertyType, setPropertyType] = useState('Residential');
  const [notes, setNotes] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const clearFieldError = (key) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  };

  const selectedCityValue = city === 'Other' ? (customCity.trim() || 'Other') : city;

  const fieldClass = (key, extra = '') =>
    `input-field transition-all duration-200 ${extra} ${
      fieldErrors[key]
        ? 'border-error-400 ring-2 ring-error-200 dark:border-error-500 dark:ring-error-900/50'
        : 'focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950/60'
    }`.trim();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    const actualCity = city === 'Other' ? customCity.trim() : city.trim();

    // STRICT MANDATORY VALIDATION: Name, City, Address, Contact No
    const nextErrors = {
      fullName: !fullName.trim(),
      city: !actualCity,
      address: !address.trim() || address.trim().length < 5,
      phone: !isValidPhone(phone),
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      // Scroll to first error
      const firstErrKey = Object.keys(nextErrors).find((k) => nextErrors[k]);
      if (firstErrKey) {
        const el = document.getElementById(`field-${firstErrKey}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setBusy(true);
    try {
      const res = await submitInstallationRequest({
        fullName: fullName.trim(),
        city: actualCity,
        address: address.trim(),
        phone: normalizePhone(phone),
        systemSize,
        propertyType,
        notes: notes.trim(),
        userId: user?.id || null,
      });

      if (!res.success) {
        throw new Error('Could not submit request. Please verify your connection.');
      }

      setSubmittedData({
        fullName: fullName.trim(),
        city: actualCity,
        address: address.trim(),
        phone: normalizePhone(phone),
        systemSize,
        propertyType,
        notes: notes.trim(),
        adminEmail: ADMIN_NOTIFICATION_EMAIL,
        emailStatus: res.emailStatus,
        submittedAt: new Date().toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
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
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>
        </div>
      </header>

      <main id="main" className="container-page py-8 lg:py-14">
        <div className="mx-auto max-w-2xl">
          {submittedData ? (
            /* SUCCESS CARD WITH ADMIN EMAIL NOTIFICATION CONFIRMATION */
            <div className="card overflow-hidden border border-emerald-100 dark:border-emerald-900/40 p-6 sm:p-10 shadow-2xl bg-white dark:bg-gray-900 text-center animate-slide-down">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-200 dark:border-emerald-800 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3.5 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Turnkey Solar Request Registered
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Request Complete Installation
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Thank you, <strong className="text-gray-900 dark:text-white">{submittedData.fullName}</strong>! Your solar installation request has been submitted successfully.
              </p>

              {/* ADMIN EMAIL NOTIFICATION BADGE */}
              <div className="mt-6 rounded-2xl border border-primary-200 dark:border-primary-800/80 bg-gradient-to-r from-primary-50/80 via-amber-50/60 to-primary-50/80 dark:from-primary-950/40 dark:via-amber-950/20 dark:to-primary-950/40 p-4 sm:p-5 text-left shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md shadow-primary-500/30">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Admin Email Notification Sent
                      </h4>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                        DISPATCHED
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Instant notification with your site requirements and contact info has been emailed to the lead administrator at{' '}
                      <span className="font-bold text-primary-700 dark:text-primary-300">
                        {ADMIN_NOTIFICATION_EMAIL}
                      </span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* DETAILS SUMMARY TABLE */}
              <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 p-4 sm:p-5 text-left text-xs sm:text-sm">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-[11px] mb-3 text-gray-500 dark:text-gray-400">
                  Request Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Customer Name:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{submittedData.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">City:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{submittedData.city}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Contact Number:</span>
                    <p className="font-semibold text-primary-600 dark:text-primary-400">{submittedData.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">System Capacity:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{submittedData.systemSize}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">Address / Location:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{submittedData.address}</p>
                  </div>
                </div>
              </div>

              {/* NEXT STEPS */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Our certified installation engineer will contact you shortly for a site survey.
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="btn-primary flex-1 py-3 text-sm font-bold shadow-lg shadow-primary-500/25"
                >
                  Return to Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedData(null);
                    setAddress('');
                    setNotes('');
                  }}
                  className="btn-ghost flex-1 py-3 text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            /* INSTALLATION REQUEST FORM */
            <div className="card overflow-hidden border border-gray-200/80 dark:border-gray-800 p-6 sm:p-9 shadow-xl bg-white dark:bg-gray-900">
              {/* Badge & Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-secondary-50 dark:bg-secondary-950/60 border border-secondary-200/60 dark:border-secondary-800/60 px-3 py-1 text-xs font-bold text-secondary-800 dark:text-secondary-300">
                    <Wrench className="h-3.5 w-3.5" />
                    Turnkey Engineering Service
                  </div>
                  <h1 className="mt-2.5 text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                    Request Complete Installation
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Fill in your details below for full solar design, net metering & onsite installation.
                  </p>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 p-3.5 text-xs text-amber-900 dark:text-amber-300">
                <CircleAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong className="font-bold">Mandatory Fields:</strong> Name, City, Address, and Contact Number are all required. On saving, an instant notification is automatically dispatched to the admin email.
                </div>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                {/* 1. Full Name (MANDATORY) */}
                <div id="field-fullName">
                  <label className="mb-1.5 flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>
                      Full Name <span className="text-error-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-gray-400">Mandatory</span>
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
                      onChange={(ev) => {
                        setFullName(ev.target.value);
                        clearFieldError('fullName');
                      }}
                      placeholder="e.g. Muhammad Ali"
                      className={fieldClass('fullName', 'pl-11 pr-11')}
                    />
                    {fieldErrors.fullName && (
                      <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                    )}
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                      Full Name is a mandatory field.
                    </p>
                  )}
                </div>

                {/* 2. City (MANDATORY) */}
                <div id="field-city">
                  <label className="mb-1.5 flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>
                      City <span className="text-error-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-gray-400">Mandatory</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${
                        fieldErrors.city ? 'text-error-500' : 'text-gray-400'
                      }`}
                    />
                    <select
                      value={city}
                      onChange={(ev) => {
                        setCity(ev.target.value);
                        clearFieldError('city');
                      }}
                      className={fieldClass('city', 'pl-11 pr-10 appearance-none bg-white dark:bg-gray-900')}
                    >
                      <option value="">Select your City...</option>
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.city && (
                      <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                    )}
                  </div>
                  {city === 'Other' && (
                    <div className="mt-2.5 animate-slide-down">
                      <input
                        type="text"
                        value={customCity}
                        onChange={(ev) => {
                          setCustomCity(ev.target.value);
                          clearFieldError('city');
                        }}
                        placeholder="Enter your specific city / town name..."
                        className={fieldClass('city', 'px-3.5')}
                      />
                    </div>
                  )}
                  {fieldErrors.city && (
                    <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                      City is a mandatory field. Please select or enter your city.
                    </p>
                  )}
                </div>

                {/* 3. Address (MANDATORY) */}
                <div id="field-address">
                  <label className="mb-1.5 flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>
                      Installation Address <span className="text-error-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-gray-400">Mandatory</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      className={`absolute left-3.5 top-3.5 h-5 w-5 ${
                        fieldErrors.address ? 'text-error-500' : 'text-gray-400'
                      }`}
                    />
                    <textarea
                      value={address}
                      onChange={(ev) => {
                        setAddress(ev.target.value);
                        clearFieldError('address');
                      }}
                      placeholder="House / Plot / Building No, Street, Sector, Phase, Area Landmark"
                      rows={3}
                      className={fieldClass('address', 'pl-11 pr-11 min-h-[90px] resize-y')}
                    />
                    {fieldErrors.address && (
                      <CircleAlert className="absolute right-3.5 top-3.5 h-5 w-5 text-error-500" />
                    )}
                  </div>
                  {fieldErrors.address ? (
                    <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                      Address is mandatory (minimum 5 characters).
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Provide exact location details for rooftop inspection and cable routing estimates.
                    </p>
                  )}
                </div>

                {/* 4. Contact No (MANDATORY) */}
                <div id="field-phone">
                  <label className="mb-1.5 flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>
                      Contact No (Mobile) <span className="text-error-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-gray-400">Mandatory (11 Digits)</span>
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
                      onChange={(ev) => {
                        setPhone(digitsOnlyPhone(ev.target.value));
                        clearFieldError('phone');
                      }}
                      placeholder="03001234567"
                      className={fieldClass('phone', 'pl-11 pr-11 font-mono font-medium')}
                    />
                    {fieldErrors.phone && (
                      <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
                    )}
                  </div>
                  {fieldErrors.phone ? (
                    <p className="mt-1.5 text-xs font-semibold text-error-600 dark:text-error-400">
                      {phone
                        ? 'Contact number must be exactly 11 digits (e.g. 03001234567).'
                        : 'Contact No is a mandatory field.'}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Format: 11 digits starting with 03 (e.g., 03001234567). Engineers will call on this number.
                    </p>
                  )}
                </div>

                {/* SYSTEM CAPACITY & PROPERTY PREFERENCES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                      <Zap className="h-3.5 w-3.5 text-primary-500" />
                      Desired System Size
                    </label>
                    <select
                      value={systemSize}
                      onChange={(ev) => setSystemSize(ev.target.value)}
                      className="input-field text-xs sm:text-sm bg-white dark:bg-gray-900"
                    >
                      {SYSTEM_SIZES.map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                      <Home className="h-3.5 w-3.5 text-secondary-500" />
                      Property Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(ev) => setPropertyType(ev.target.value)}
                      className="input-field text-xs sm:text-sm bg-white dark:bg-gray-900"
                    >
                      {PROPERTY_TYPES.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Additional Instructions / Inverter & Panel Preferences (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(ev) => setNotes(ev.target.value)}
                    placeholder="e.g. Need Net Metering 3-phase green meter, Tier-1 Longi 585W panels with Inverex Nitrox Inverter..."
                    rows={2}
                    className="input-field text-xs sm:text-sm min-h-[64px]"
                  />
                </div>

                {/* Admin Email Notification Notice */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 p-3.5 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                  <span>
                    Saving this request will automatically send a real-time lead notification to the admin email:{' '}
                    <strong className="text-gray-900 dark:text-gray-200">{ADMIN_NOTIFICATION_EMAIL}</strong>.
                  </span>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-error-50 dark:bg-error-950/40 border border-error-200 dark:border-error-800 p-3.5 text-sm text-error-700 dark:text-error-300">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Saving Request & Notifying Admin...
                    </>
                  ) : (
                    <>
                      <Wrench className="h-5 w-5" />
                      Submit & Notify Admin
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

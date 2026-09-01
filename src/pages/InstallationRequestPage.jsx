import { useState } from 'react';
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  MapPin,
  Phone,
  Sun,
  User,
  Wrench,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { digitsOnlyPhone, isValidPhone, normalizePhone } from '../lib/auth';

export default function InstallationRequestPage({ onBack }) {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [address, setAddress] = useState(profile?.business_address || '');
  const [phone, setPhone] = useState(digitsOnlyPhone(profile?.phone || ''));
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const clearFieldError = (key) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  };

  const fieldClass = (key, extra = '') =>
    `input-field ${extra} ${fieldErrors[key] ? 'border-error-400 ring-1 ring-error-200' : ''}`.trim();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    const nextErrors = {
      fullName: !fullName.trim(),
      address: !address.trim(),
      phone: !isValidPhone(phone),
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setBusy(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        address: address.trim(),
        contact_phone: normalizePhone(phone),
      };
      if (user?.id) payload.user_id = user.id;
      let { error: insertError } = await supabase.from('installation_requests').insert(payload);
      if (insertError && payload.user_id) {
        delete payload.user_id;
        ({ error: insertError } = await supabase.from('installation_requests').insert(payload));
      }
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <button type="button" onClick={onBack} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30">
              <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Sell<span className="text-primary-500">Solar</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      <main id="main" className="container-page flex flex-col items-center py-12 lg:py-16">
        <div className="w-full max-w-lg">
          {submitted ? (
            <div className="card p-8 text-center shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100">
                <CircleCheck className="h-8 w-8 text-secondary-600" />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">Request submitted</h1>
              <p className="mt-2 text-sm text-gray-500">
                Thank you, {fullName.trim()}. Our team will contact you at {normalizePhone(phone)} about solar installation.
              </p>
              <button type="button" onClick={onBack} className="btn-primary mt-6 w-full">
                Back to Home
              </button>
            </div>
          ) : (
            <div className="card p-6 shadow-xl sm:p-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                <Wrench className="h-3.5 w-3.5" />
                Installation service
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Request for solar installation</h1>
              <p className="mt-1 text-sm text-gray-500">
                Share your details and we will contact you to arrange a site visit and system installation.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Name *</label>
                  <div className="relative">
                    <User className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${fieldErrors.fullName ? 'text-error-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(ev) => {
                        setFullName(ev.target.value);
                        clearFieldError('fullName');
                      }}
                      placeholder="Your full name"
                      className={fieldClass('fullName', 'pl-11 pr-11')}
                    />
                    {fieldErrors.fullName ? <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" /> : null}
                  </div>
                  {fieldErrors.fullName ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">Name is required.</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Address *</label>
                  <div className="relative">
                    <MapPin className={`absolute left-3.5 top-3.5 h-5 w-5 ${fieldErrors.address ? 'text-error-500' : 'text-gray-400'}`} />
                    <textarea
                      value={address}
                      onChange={(ev) => {
                        setAddress(ev.target.value);
                        clearFieldError('address');
                      }}
                      placeholder="House / street, area, city"
                      rows={3}
                      className={fieldClass('address', 'pl-11 pr-11 min-h-[96px] resize-y')}
                    />
                    {fieldErrors.address ? <CircleAlert className="absolute right-3.5 top-3.5 h-5 w-5 text-error-500" /> : null}
                  </div>
                  {fieldErrors.address ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">Address is required.</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Contact no *</label>
                  <div className="relative">
                    <Phone className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${fieldErrors.phone ? 'text-error-500' : 'text-gray-400'}`} />
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
                      className={fieldClass('phone', 'pl-11 pr-11')}
                    />
                    {fieldErrors.phone ? <CircleAlert className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" /> : null}
                  </div>
                  {fieldErrors.phone ? (
                    <p className="mt-1.5 text-xs font-medium text-error-600">
                      {phone ? 'Contact number must be exactly 11 digits.' : 'Contact number is required.'}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-gray-400">Must be 11 digits, e.g. 03001234567</p>
                  )}
                </div>

                {error ? (
                  <div className="flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <button type="submit" disabled={busy} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                  {busy ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Wrench className="h-4 w-4" />
                      Submit request
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

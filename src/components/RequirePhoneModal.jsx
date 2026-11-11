'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Phone, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isValidPhone, normalizePhone } from '../lib/auth';
import { isGoogleAuthUser, persistUserPhoneAndAttachToAds } from '../lib/userPhone';

const SKIP_PAGES = new Set([
  'login',
  'auth',
  'password',
  'forgot-password',
  'reset-password',
  'change-password',
]);

/**
 * Blocking popup: logged-in users (especially Google OAuth) without a saved
 * mobile number must add one. Saves to profile + attaches to their ads.
 */
export default function RequirePhoneModal({ currentPage = 'home' }) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const toastCtx = useToast();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dismissedSession, setDismissedSession] = useState(false);

  const existingPhone = normalizePhone(profile?.phone || user?.user_metadata?.phone || '');
  const needsPhone = Boolean(user) && !loading && !existingPhone;
  const isGoogle = isGoogleAuthUser(user);
  const pageBlocked = SKIP_PAGES.has(String(currentPage || '').toLowerCase());

  const open = useMemo(
    () => needsPhone && !pageBlocked && !dismissedSession,
    [needsPhone, pageBlocked, dismissedSession],
  );

  useEffect(() => {
    if (!open) return;
    setPhone('');
    setError('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // If profile later gets a phone (another tab / refresh), close automatically
  useEffect(() => {
    if (existingPhone) setDismissedSession(false);
  }, [existingPhone]);

  if (!open) return null;

  const onSave = async (e) => {
    e?.preventDefault?.();
    setError('');
    const clean = normalizePhone(phone);
    if (!clean) {
      setError('Mobile number is required (11 digits, e.g. 03001234567).');
      return;
    }
    if (!isValidPhone(clean)) {
      setError('Phone number must be exactly 11 digits (e.g. 03001234567).');
      return;
    }

    setSaving(true);
    try {
      await persistUserPhoneAndAttachToAds({ phone: clean, user, profile });
      if (typeof refreshProfile === 'function') {
        await refreshProfile(user?.id).catch(() => {});
      }
      if (toastCtx?.showToast) {
        toastCtx.showToast({
          title: 'Mobile Saved',
          message: `${clean} saved to your profile and attached to your ads.`,
          type: 'success',
        });
      }
      setDismissedSession(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save mobile number. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Add mobile number"
    >
      <div className="card w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Add Mobile Number
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isGoogle
                  ? 'Google login detected — WhatsApp/mobile is mandatory for buyers to contact you.'
                  : 'Save your WhatsApp/mobile so buyers can call or message you on your ads.'}
              </p>
            </div>
          </div>
          {/* Soft close only if not Google — Google users must save */}
          {!isGoogle && (
            <button
              type="button"
              onClick={() => setDismissedSession(true)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={onSave} className="mt-4 space-y-3.5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Number is saved to your profile and attached to all your ads.
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Mobile / WhatsApp (Pakistan) *
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                maxLength={15}
                required
                value={phone}
                onChange={(e) => {
                  setError('');
                  setPhone(e.target.value);
                }}
                placeholder="03001234567"
                className="input-field w-full pl-10"
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              Exactly 11 digits, starting with 03 (e.g. 03001234567).
            </p>
          </div>

          {error ? (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save Mobile Number'}
          </button>
        </form>
      </div>
    </div>
  );
}

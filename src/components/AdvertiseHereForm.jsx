'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Megaphone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../views/AuthPage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { compressImageFile } from '../lib/images';
import { addPartnerAdSubmission } from '../lib/partnerAdSubmissions';
import { useToast } from '../context/ToastContext';
import { isValidPhone, normalizePhone } from '../lib/auth';

/** Set while the sign-in gate is open so the form can re-open after an OAuth (Google) redirect. */
export const PENDING_ADVERTISE_KEY = 'sellsolar_pending_advertise';

function readLocalPhone(user, profile) {
  try {
    const map = JSON.parse(localStorage.getItem('sellsolar_user_phones') || '{}');
    const email = (user?.email || profile?.email || '').toLowerCase();
    return (user?.id && map[user.id]) || (email && map[email]) || '';
  } catch {
    return '';
  }
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdvertiseHereForm({ isOpen, onClose }) {
  const toastCtx = useToast();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [advertiser, setAdvertiser] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const accountEmail = (() => {
    const e = String(user?.email || profile?.email || '').trim();
    return e && !/@sellsolar\.local$/i.test(e) ? e : '';
  })();

  // Contact details that come from the signed-in account are locked (shown, not editable).
  const accountName = String(
    profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  ).trim();
  const accountPhone = String(
    profile?.phone || user?.user_metadata?.phone || (user ? readLocalPhone(user, profile) : '') || ''
  ).trim();
  const lockedField =
    'cursor-not-allowed bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 focus:ring-0 focus:border-gray-200';

  // Remember that the user wanted to advertise (survives a Google redirect); clear it once signed in.
  useEffect(() => {
    if (!isOpen) return;
    try {
      if (!user && !authLoading) sessionStorage.setItem(PENDING_ADVERTISE_KEY, '1');
      if (user) sessionStorage.removeItem(PENDING_ADVERTISE_KEY);
    } catch {
      /* private mode */
    }
  }, [isOpen, user, authLoading]);

  // Auto-fetch name / email / mobile from the signed-in account (never overwrite what the user typed).
  useEffect(() => {
    if (!isOpen || !user) return;
    // Account values always win for locked fields; a field with no account value stays typeable.
    setContactName((cur) => accountName || cur);
    setContactEmail((cur) => accountEmail || cur);
    setContactPhone((cur) => accountPhone || cur);
  }, [isOpen, user, accountName, accountEmail, accountPhone]);

  // Clear everything (image, text, errors) so the next open always starts with a blank form.
  const reset = () => {
    setTitle('');
    setSubtitle('');
    setAdvertiser('');
    setLinkUrl('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setImagePreview('');
    setImageDataUrl('');
    setError('');
    setSaving(false);
  };

  const closeAndForget = () => {
    reset();
    try {
      sessionStorage.removeItem(PENDING_ADVERTISE_KEY);
    } catch {
      /* ignore */
    }
    onClose?.();
  };

  if (!isOpen) return null;

  // Not signed in yet: show sign in / create account first, then land straight on this form.
  if (authLoading && !user) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }
  if (!user) {
    return (
      <div
        className="fixed inset-0 z-[80] overflow-y-auto bg-white dark:bg-gray-950"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to advertise"
      >
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/80 dark:text-amber-200">
          <Megaphone className="h-4 w-4 shrink-0" />
          Sign in or create a free account to submit your banner. You will come straight back to the form.
        </div>
        <AuthPage
          initialView="login"
          hasOuterNavbar={false}
          onBack={closeAndForget}
          onSuccess={() => {}}
          onForgotPassword={() => {
            closeAndForget();
            window.location.assign('/forgot-password');
          }}
        />
      </div>
    );
  }

  const onPickImage = async (file) => {
    setError('');
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }
    try {
      const compressed = await compressImageFile(file, { maxEdge: 900, quality: 0.7 });
      const dataUrl = await fileToDataUrl(compressed);
      // Banner is stored in the database and served to every visitor — keep it small
      if (typeof dataUrl === 'string' && dataUrl.length > 400_000) {
        setError('Image is still too large after compression. Try a smaller photo.');
        return;
      }
      setImageDataUrl(dataUrl);
      setImagePreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process image.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Headline is required.');
      return;
    }
    if (!isValidPhone(normalizePhone(contactPhone))) {
      setError('Mobile / WhatsApp number is required: 11 digits (e.g. 03001234567).');
      return;
    }
    setSaving(true);
    try {
      await addPartnerAdSubmission({
        title: cleanTitle,
        subtitle: subtitle.trim(),
        advertiser: advertiser.trim() || cleanTitle,
        linkUrl: linkUrl.trim(),
        imageUrl: imageDataUrl,
        contactName: contactName.trim(),
        contactPhone: normalizePhone(contactPhone),
        contactEmail: contactEmail.trim(),
      });
      if (toastCtx?.showToast) {
        toastCtx.showToast({
          title: 'Ad submitted',
          message: 'Your banner was sent for admin review. It will appear after approval.',
          type: 'success',
        });
      }
      // Keep the account profile in sync (Google sign-ups have no number until now).
      try {
        const cleanPhone = normalizePhone(contactPhone);
        if (user?.id && cleanPhone && cleanPhone !== (profile?.phone || '') && isSupabaseConfigured() && supabase) {
          await supabase.from('profiles').update({ phone: cleanPhone }).eq('id', user.id).then(
            () => {},
            () => {}
          );
          if (typeof refreshProfile === 'function') await refreshProfile();
        }
      } catch {
        /* profile sync is best-effort */
      }
      closeAndForget();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit ad.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Advertise here"
      onClick={closeAndForget}
    >
      <div
        className="card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Advertise here</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Submit your banner for the homepage scroll. Admin reviews before it goes live.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAndForget}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Headline *
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="e.g. 10kW Home Solar — From Rs. 899,000"
              className="input-field mt-1 text-sm font-normal"
            />
          </label>

          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Subtitle
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. Green Volt Lahore • Free site survey"
              className="input-field mt-1 text-sm font-normal"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Business / brand
              <input
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
                maxLength={60}
                placeholder="Your company name"
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Click link (optional)
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://… or /dealers"
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">Banner image (optional)</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center hover:border-amber-300 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-amber-700">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-20 w-full max-w-xs rounded-lg object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-7 w-7 text-amber-500" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Upload logo / banner</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = ''; // allow picking the same file again after a reset
                  onPickImage(file);
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 sm:col-span-1">
              Your name
              <input
                value={contactName}
                readOnly={Boolean(accountName)}
                aria-readonly={Boolean(accountName)}
                title={accountName ? 'Taken from your account' : undefined}
                onChange={(e) => setContactName(e.target.value)}
                className={`input-field mt-1 text-sm font-normal ${accountName ? lockedField : ''}`}
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Mobile / WhatsApp *
              <input
                required
                type="tel"
                value={contactPhone}
                readOnly={Boolean(accountPhone)}
                aria-readonly={Boolean(accountPhone)}
                title={accountPhone ? 'Taken from your account' : undefined}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="03001234567"
                className={`input-field mt-1 text-sm font-normal ${accountPhone ? lockedField : ''}`}
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Email
              <input
                type="email"
                value={contactEmail}
                readOnly={Boolean(accountEmail)}
                aria-readonly={Boolean(accountEmail)}
                title={accountEmail ? 'Taken from your account' : undefined}
                onChange={(e) => setContactEmail(e.target.value)}
                className={`input-field mt-1 text-sm font-normal ${accountEmail ? lockedField : ''}`}
              />
            </label>
          </div>

          {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
            {saving ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>
      </div>
    </div>
  );
}

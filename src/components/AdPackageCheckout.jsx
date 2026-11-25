'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ImagePlus,
  Loader2,
  Send,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { compressImageFile } from '../lib/images';
import { isValidPhone, normalizePhone } from '../lib/auth';
import {
  PAYMENT_ACCOUNT,
  MAX_SCREENSHOT_CHARS,
  addAdPackageOrder,
  parsePackageAmount,
} from '../lib/adPackageOrders';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Payment screenshots must stay readable, so shrink in steps until the data URL fits the database limit. */
async function screenshotToDataUrl(file) {
  const attempts = [
    { maxEdge: 1400, quality: 0.72 },
    { maxEdge: 1100, quality: 0.6 },
    { maxEdge: 800, quality: 0.5 },
  ];
  for (const opts of attempts) {
    const compressed = await compressImageFile(file, opts);
    const dataUrl = await fileToDataUrl(compressed);
    if (typeof dataUrl === 'string' && dataUrl.length <= MAX_SCREENSHOT_CHARS) return dataUrl;
  }
  throw new Error('Screenshot is still too large. Please crop it or upload a smaller image.');
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch {
        /* clipboard unavailable */
      }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300 cursor-pointer"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/**
 * "Next page" after picking a homepage ad package: order summary, Easypaisa payment details,
 * contact form and payment-screenshot upload.
 */
export default function AdPackageCheckout({ pkg, onBack, onNavigate }) {
  const toastCtx = useToast();
  const { user, profile } = useAuth();
  const amount = parsePackageAmount(pkg);
  const isFree = amount === 0;
  const priceText = pkg.priceLabel || (isFree ? 'Rs. 0' : `Rs. ${amount.toLocaleString('en-PK')}`);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Prefill from the signed-in account (never overwrite what the visitor already typed).
  useEffect(() => {
    if (!user) return;
    const name = String(profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '').trim();
    const phone = String(profile?.phone || user?.user_metadata?.phone || '').trim();
    const email = String(user?.email || profile?.email || '').trim();
    setContactName((cur) => cur || name);
    setContactPhone((cur) => cur || phone);
    setContactEmail((cur) => cur || (/@sellsolar\.local$/i.test(email) ? '' : email));
  }, [user, profile]);

  const onPickScreenshot = async (file) => {
    setError('');
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      setError('Please choose an image (JPG, PNG or WebP) of your payment screenshot.');
      return;
    }
    try {
      setScreenshot(await screenshotToDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process the screenshot.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!contactName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidPhone(normalizePhone(contactPhone))) {
      setError('Mobile / WhatsApp number is required: 11 digits (e.g. 03001234567).');
      return;
    }
    if (!isFree && !screenshot) {
      setError('Please upload the screenshot of your Easypaisa payment.');
      return;
    }
    setSaving(true);
    try {
      const order = await addAdPackageOrder({
        packageId: pkg.id,
        packageName: pkg.name,
        priceLabel: priceText,
        period: pkg.period,
        amount,
        contactName,
        contactPhone: normalizePhone(contactPhone),
        contactEmail,
        businessName,
        transactionId,
        note,
        paymentScreenshot: isFree ? '' : screenshot,
      });
      setDone(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toastCtx?.showToast?.({
        title: 'Order submitted',
        message: isFree
          ? 'Your free launch request was sent. We will contact you shortly.'
          : 'Payment screenshot received. We will verify it and activate your slot.',
        type: 'success',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your order.');
    } finally {
      setSaving(false);
    }
  };

  const summaryRows = [
    ['Package', pkg.name],
    ['Duration', pkg.period],
    ['Amount to pay', priceText],
  ];

  if (done) {
    return (
      <div className="mx-auto max-w-xl animate-fade-in space-y-5 rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm dark:border-emerald-900/60 dark:bg-gray-900 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order submitted</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isFree
            ? 'We received your free launch request. Our team will contact you on WhatsApp.'
            : 'We received your payment screenshot. Our team will verify the payment and activate your slot, usually within a few hours.'}
        </p>
        <dl className="mx-auto max-w-sm space-y-2 rounded-2xl bg-gray-50 p-4 text-left text-sm dark:bg-gray-800/50">
          {[['Reference', done.id], ...summaryRows, ['Contact', done.contactPhone]].map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
              <dd className="break-all text-right font-bold text-gray-900 dark:text-white">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => onNavigate?.('home')} className="btn-primary px-5 py-2.5 text-sm font-bold cursor-pointer">
            Back to home
          </button>
          <button type="button" onClick={onBack} className="btn-secondary px-5 py-2.5 text-sm font-bold cursor-pointer">
            View packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Change package
      </button>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Summary + payment details */}
        <div className="space-y-5 xl:col-span-2">
          <div className="rounded-3xl border-2 border-blue-500 bg-blue-50/60 p-5 shadow-sm dark:border-blue-500/70 dark:bg-blue-950/30">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-300">
              Your selected package
            </span>
            <h2 className="mt-1 text-xl font-black text-gray-900 dark:text-white">{pkg.name}</h2>
            {pkg.description ? <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{pkg.description}</p> : null}
            <ul className="mt-3 space-y-1.5 text-xs text-gray-700 dark:text-gray-200">
              {(pkg.features || []).map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  {f}
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-blue-200/70 pt-3 text-sm dark:border-blue-900/60">
              {summaryRows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className={`font-black ${k === 'Amount to pay' ? 'text-lg text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {isFree ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
              This package is free during the launch period. No payment is needed. Just send your details and we
              will contact you.
            </div>
          ) : (
            <div className="rounded-3xl border border-emerald-300 bg-white p-5 shadow-sm dark:border-emerald-800 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">Pay via {PAYMENT_ACCOUNT.method}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Send {priceText}, then upload the screenshot</p>
                </div>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Account title</dt>
                    <dd className="font-black text-gray-900 dark:text-white">{PAYMENT_ACCOUNT.accountTitle}</dd>
                  </div>
                  <CopyButton value={PAYMENT_ACCOUNT.accountTitle} label="account title" />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Account no.</dt>
                    <dd className="font-mono text-lg font-black tracking-wide text-gray-900 dark:text-white">
                      {PAYMENT_ACCOUNT.accountNumber}
                    </dd>
                  </div>
                  <CopyButton value={PAYMENT_ACCOUNT.accountNumber} label="account number" />
                </div>
              </dl>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                Check that the account title shows “{PAYMENT_ACCOUNT.accountTitle}” before you confirm the transfer.
              </p>
            </div>
          )}
        </div>

        {/* Contact + screenshot form */}
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 xl:col-span-3"
        >
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              {isFree ? 'Your details' : 'Submit payment proof'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isFree
                ? 'We will contact you to set up your banner.'
                : 'Upload the payment screenshot. We verify it and activate your slot.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Your name *
              <input
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                maxLength={120}
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Mobile / WhatsApp *
              <input
                required
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="03001234567"
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Business / brand
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                maxLength={120}
                placeholder="Your company name"
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Email (optional)
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                maxLength={160}
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
            {!isFree && (
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 sm:col-span-2">
                Transaction ID (optional)
                <input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  maxLength={60}
                  placeholder="Easypaisa TID"
                  className="input-field mt-1 text-sm font-normal"
                />
              </label>
            )}
          </div>

          {!isFree && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">Payment screenshot *</p>
              {screenshot ? (
                <div className="relative inline-block">
                  <img
                    src={screenshot}
                    alt="Payment screenshot preview"
                    className="max-h-64 rounded-xl border border-gray-200 object-contain dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setScreenshot('')}
                    aria-label="Remove screenshot"
                    className="absolute -right-2 -top-2 rounded-full bg-rose-600 p-1 text-white shadow cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 px-4 py-8 text-center hover:border-blue-500 dark:border-blue-800 dark:bg-blue-950/20">
                  <ImagePlus className="h-8 w-8 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Tap to upload your Easypaisa payment screenshot
                  </span>
                  <span className="text-[10px] text-gray-400">JPG, PNG or WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      onPickScreenshot(file);
                    }}
                  />
                </label>
              )}
            </div>
          )}

          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Note (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Anything we should know about your banner?"
              className="input-field mt-1 text-sm font-normal"
            />
          </label>

          {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {saving ? 'Submitting…' : isFree ? 'Send request' : 'Submit payment screenshot'}
          </button>
        </form>
      </div>
    </div>
  );
}

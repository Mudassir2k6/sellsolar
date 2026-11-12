'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Megaphone, X } from 'lucide-react';
import { compressImageFile } from '../lib/images';
import { addPartnerAdSubmission } from '../lib/partnerAdSubmissions';
import { useToast } from '../context/ToastContext';
import { isValidPhone, normalizePhone } from '../lib/auth';

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

  if (!isOpen) return null;

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
      // Keep localStorage safe — reject very large payloads
      if (typeof dataUrl === 'string' && dataUrl.length > 900_000) {
        setError('Image is still too large after compression. Try a smaller photo.');
        return;
      }
      setImageDataUrl(dataUrl);
      setImagePreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process image.');
    }
  };

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
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Headline is required.');
      return;
    }
    if (contactPhone && !isValidPhone(normalizePhone(contactPhone))) {
      setError('Phone must be 11 digits (e.g. 03001234567) or leave blank.');
      return;
    }
    setSaving(true);
    try {
      addPartnerAdSubmission({
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
      reset();
      onClose?.();
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
      onClick={onClose}
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
            onClick={onClose}
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
                onChange={(e) => onPickImage(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 sm:col-span-1">
              Your name
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              WhatsApp
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="03001234567"
                className="input-field mt-1 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Email
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="input-field mt-1 text-sm font-normal"
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

'use client';

import { useState } from 'react';
import { Flag, X, CheckCircle2, Loader2 } from 'lucide-react';
import { sendContactMessage } from '../services/inboxService';

const REASONS = [
  'Fake / scam listing',
  'Wrong or misleading price',
  'Item already sold',
  'Duplicate listing',
  'Wrong category or photos',
  'Offensive / prohibited content',
  'Other',
];

/** Lets a buyer flag a listing; routes to the admin inbox / enquiries via sendContactMessage. */
export default function ReportAdModal({ isOpen, onClose, listing, defaultName = '', defaultEmail = '' }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState('');

  if (!isOpen) return null;

  const origin = (typeof window !== 'undefined' && window.location.origin) || 'https://sellsolar.pk';
  const adUrl = `${origin}/listing/${encodeURIComponent(listing?.id || '')}`;

  const close = () => {
    setTicket('');
    setError('');
    setDetails('');
    onClose();
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await sendContactMessage({
        name: name.trim() || 'Anonymous visitor',
        email: email.trim() || 'anonymous@sellsolar.pk',
        subject: `Ad report: ${listing?.title || listing?.id}`,
        category: 'Ad Report',
        message: `Reason: ${reason}\n\nAd: ${listing?.title}\nID: ${listing?.id}\nSeller: ${listing?.seller_name || '-'} (${
          listing?.seller_email || '-'
        })\nLink: ${adUrl}\n\nDetails:\n${details.trim() || '(none)'}`,
      });
      setTicket(res?.ticketNumber || 'submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={close}>
      <div
        className="card w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Report this ad"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Report this ad</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Our team reviews every report.</p>
            </div>
          </div>
          <button type="button" onClick={close} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {ticket ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Thank you! Report received.</p>
            {ticket !== 'submitted' && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Reference: {ticket}</p>
            )}
            <button type="button" onClick={close} className="btn-primary mt-5 rounded-xl px-6 py-2.5 text-sm font-bold cursor-pointer">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Details (optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={1000}
                placeholder="Tell us what is wrong with this ad…"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              {submitting ? 'Sending…' : 'Submit report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

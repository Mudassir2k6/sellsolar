'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Trash2, XCircle, Wallet, X } from 'lucide-react';
import {
  AD_ORDERS_EVENT,
  deleteAdOrder,
  fetchAdminAdOrders,
  setAdOrderStatus,
} from '../lib/adPackageOrders';

const STATUS_STYLE = {
  verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
};

/** Admin list of homepage ad package orders with the Easypaisa payment screenshot. */
export default function AdminAdPackageOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items, error: err } = await fetchAdminAdOrders();
    setOrders(items);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(AD_ORDERS_EVENT, refresh);
    return () => window.removeEventListener(AD_ORDERS_EVENT, refresh);
  }, [refresh]);

  const run = async (action) => {
    const err = await action();
    if (err) setError(err);
    else await refresh();
  };

  const pending = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-3 pt-2 border-t border-violet-200/60 dark:border-violet-900/40">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-white">
            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            Package orders &amp; payments
            {pending > 0 ? (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                {pending} new
              </span>
            ) : null}
          </p>
          <p className="text-[10px] text-gray-400">
            Check the Easypaisa screenshot, then mark the order verified (or reject it).
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold dark:bg-gray-800"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400 dark:border-gray-700">
          No package orders yet.
        </p>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center"
            >
              {o.paymentScreenshot ? (
                <button
                  type="button"
                  onClick={() => setPreview(o.paymentScreenshot)}
                  title="View payment screenshot"
                  className="shrink-0 cursor-zoom-in"
                >
                  <img src={o.paymentScreenshot} alt="Payment screenshot" className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-700" />
                </button>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[10px] font-bold text-gray-400 dark:bg-gray-800">
                  {o.amount === 0 ? 'Free' : 'No proof'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                  {o.packageName} · {o.priceLabel}
                  {o.period ? ` / ${o.period}` : ''}
                </p>
                <p className="truncate text-[10px] text-gray-500">
                  {o.contactName || '—'} · {o.contactPhone}
                  {o.businessName ? ` · ${o.businessName}` : ''}
                  {o.contactEmail ? ` · ${o.contactEmail}` : ''}
                </p>
                <p className="truncate text-[10px] text-gray-400">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                  {o.transactionId ? ` · TID ${o.transactionId}` : ''}
                  {o.note ? ` · ${o.note}` : ''}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[o.status] || STATUS_STYLE.pending}`}>
                  {o.status === 'verified' ? 'payment verified' : o.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {o.status !== 'verified' && (
                  <button
                    type="button"
                    onClick={() => run(() => setAdOrderStatus(o.id, 'verified'))}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Verify payment
                  </button>
                )}
                {o.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => run(() => setAdOrderStatus(o.id, 'rejected'))}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700"
                  >
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                )}
                <button
                  type="button"
                  title="Delete"
                  onClick={() => {
                    if (window.confirm('Delete this order permanently?')) run(() => deleteAdOrder(o.id));
                  }}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview('')}
          role="dialog"
          aria-modal="true"
          aria-label="Payment screenshot"
        >
          <button
            type="button"
            onClick={() => setPreview('')}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={preview} alt="Payment screenshot" className="max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}

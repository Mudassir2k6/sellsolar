/**
 * Homepage advertisement package orders (Easypaisa payment + screenshot proof).
 *
 * Supabase is the source of truth (table `ad_package_orders`, see
 * supabase/migrations/20261125_ad_package_orders.sql):
 *  - visitors insert rows as `pending` (nothing is readable back by clients)
 *  - admins list / verify / reject / delete through their signed-in Supabase session
 * When Supabase is not configured (local dev) everything falls back to localStorage.
 */
import { supabase, isSupabaseConfigured } from './supabase';

/** Where advertisers send the payment. */
export const PAYMENT_ACCOUNT = {
  method: 'Easypaisa',
  accountTitle: 'sellsolar.pk',
  accountNumber: '03083888043',
};

export const AD_ORDERS_KEY = 'sellsolar_ad_package_orders';
export const AD_ORDERS_EVENT = 'sellsolar_ad_orders_updated';
const TABLE = 'ad_package_orders';
/** Same ceiling the database enforces (characters of the data URL). */
export const MAX_SCREENSHOT_CHARS = 600_000;

function notify() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AD_ORDERS_EVENT));
}

function readLocal() {
  if (typeof window === 'undefined') return [];
  try {
    const list = JSON.parse(localStorage.getItem(AD_ORDERS_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeLocal(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AD_ORDERS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  } catch (e) {
    console.warn('Ad order cache notice:', e?.message || e);
  }
  notify();
}

/** "Rs. 1,000" / 1000 / "1000" -> 1000 (0 when free or unparsable). */
export function parsePackageAmount(pkg) {
  // "Rs. 1,000" -> first number in the label (the "." after "Rs" must not be read as a decimal point)
  const match = String(pkg?.priceLabel || '').match(/\d[\d,]*(?:\.\d+)?/);
  const fromLabel = match ? match[0].replace(/,/g, '') : '';
  const n = Number(fromLabel !== '' ? fromLabel : pkg?.price);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

function rowToOrder(row) {
  return {
    id: row.id,
    packageId: row.package_id || '',
    packageName: row.package_name || '',
    priceLabel: row.price_label || '',
    period: row.period || '',
    amount: Number(row.amount) || 0,
    contactName: row.contact_name || '',
    contactPhone: row.contact_phone || '',
    contactEmail: row.contact_email || '',
    businessName: row.business_name || '',
    transactionId: row.transaction_id || '',
    note: row.note || '',
    paymentScreenshot: row.payment_screenshot || '',
    status: row.status || 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Visitor submits an order. Resolves with the order; rejects with a readable Error. */
export async function addAdPackageOrder(payload) {
  const now = new Date().toISOString();
  const order = {
    id: `ado-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    packageId: String(payload.packageId || '').slice(0, 40),
    packageName: String(payload.packageName || '').trim().slice(0, 120),
    priceLabel: String(payload.priceLabel || '').trim().slice(0, 40),
    period: String(payload.period || '').trim().slice(0, 40),
    amount: Number(payload.amount) > 0 ? Math.round(Number(payload.amount)) : 0,
    contactName: String(payload.contactName || '').trim().slice(0, 120),
    contactPhone: String(payload.contactPhone || '').trim().slice(0, 30),
    contactEmail: String(payload.contactEmail || '').trim().slice(0, 160),
    businessName: String(payload.businessName || '').trim().slice(0, 120),
    transactionId: String(payload.transactionId || '').trim().slice(0, 60),
    note: String(payload.note || '').trim().slice(0, 500),
    paymentScreenshot: payload.paymentScreenshot || '',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  if (order.paymentScreenshot.length > MAX_SCREENSHOT_CHARS) {
    throw new Error('Screenshot is too large. Please upload a smaller image.');
  }

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from(TABLE).insert({
      id: order.id,
      package_id: order.packageId,
      package_name: order.packageName,
      price_label: order.priceLabel,
      period: order.period,
      amount: order.amount,
      contact_name: order.contactName,
      contact_phone: order.contactPhone,
      contact_email: order.contactEmail,
      business_name: order.businessName,
      transaction_id: order.transactionId,
      note: order.note,
      payment_screenshot: order.paymentScreenshot,
      status: 'pending',
    });
    if (error) {
      console.warn('Ad order submit failed:', error.message);
      throw new Error('Could not submit your order right now. Please try again in a moment.');
    }
    return order;
  }

  writeLocal([order, ...readLocal()]);
  return order;
}

/** Admin: every order (pending / verified / rejected). Requires the admin's Supabase session. */
export async function fetchAdminAdOrders() {
  if (!isSupabaseConfigured()) return { items: readLocal(), error: '' };
  const { data, error } = await supabase.rpc('admin_list_ad_package_orders');
  if (error) {
    return {
      items: [],
      error: /not authorized|42501|JWT|permission/i.test(`${error.code} ${error.message}`)
        ? 'Sign in with your Supabase admin account to see package orders.'
        : `Could not load orders: ${error.message}`,
    };
  }
  return { items: (data || []).map(rowToOrder), error: '' };
}

/** Admin: verify / reject / back to pending. Returns an error string ('' on success). */
export async function setAdOrderStatus(id, status) {
  if (!isSupabaseConfigured()) {
    writeLocal(readLocal().map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
    return '';
  }
  const { error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return `Could not update: ${error.message}`;
  notify();
  return '';
}

/** Admin: delete permanently. Returns an error string ('' on success). */
export async function deleteAdOrder(id) {
  if (!isSupabaseConfigured()) {
    writeLocal(readLocal().filter((o) => o.id !== id));
    return '';
  }
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return `Could not delete: ${error.message}`;
  notify();
  return '';
}

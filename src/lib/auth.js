export function isValidEmail(value) {
  const email = String(value || '').trim();
  if (!email || email.length > 254) return false;
  if (/\s/.test(email) || email.includes('..')) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email);
}

export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

export function digitsOnlyPhone(value) {
  return normalizePhone(value).slice(0, 11);
}

export function isValidPhone(value) {
  return /^\d{11}$/.test(normalizePhone(value));
}

export function isValidUuid(value) {
  if (!value || typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function generateUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

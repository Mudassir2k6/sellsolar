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

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
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

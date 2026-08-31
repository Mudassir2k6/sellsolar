export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

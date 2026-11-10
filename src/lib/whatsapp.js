/** Canonical SellSolar support WhatsApp (E.164 without +). */
export const DEFAULT_WHATSAPP_NUMBER = '923083888043';
export const DEFAULT_WHATSAPP_DISPLAY = '+92 308 3888043';
export const DEFAULT_SUPPORT_PHONE = '+92 308 3888043';

/** Old placeholder numbers that must never open in production. */
const PLACEHOLDER_WHATSAPP_NUMBERS = new Set([
  '923001234567',
  '3001234567',
  '03001234567',
  '92300123456',
]);

/**
 * Strip to digits only. Accepts +92..., 03..., 923... formats.
 */
export function normalizeWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';

  // Local PK mobile: 03XXXXXXXXX → 923XXXXXXXXX
  if (digits.startsWith('03') && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  // Missing country code but 10 digits starting with 3
  if (digits.startsWith('3') && digits.length === 10) {
    return `92${digits}`;
  }
  // Already international
  if (digits.startsWith('92') && digits.length >= 12) {
    return digits;
  }
  return digits;
}

export function isPlaceholderWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return !digits || PLACEHOLDER_WHATSAPP_NUMBERS.has(digits);
}

/**
 * Resolve the live WhatsApp chat number from site settings,
 * falling back to the real SellSolar desk number (never the old placeholder).
 */
export function resolveWhatsAppNumber(settingsOrNumber) {
  const raw =
    typeof settingsOrNumber === 'string' || typeof settingsOrNumber === 'number'
      ? settingsOrNumber
      : settingsOrNumber?.whatsAppNumber;

  const normalized = normalizeWhatsAppNumber(raw);
  if (normalized && !isPlaceholderWhatsAppNumber(normalized)) {
    return normalized;
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(numberOrSettings, message = '') {
  const num = resolveWhatsAppNumber(numberOrSettings);
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${num}${text}`;
}

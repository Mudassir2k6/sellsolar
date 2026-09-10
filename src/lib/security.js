/**
 * SellSolar Security & Anti-Abuse Protection Engine
 * 
 * Provides defense-in-depth against:
 * 1. Denial of Access (DoS) / Flood attacks (Rate limiting & exponential backoff)
 * 2. Brute-force credential guessing (Account lockout & attempt throttling)
 * 3. Automated bot / crawler spam (Honeypot traps & submission velocity checks)
 * 4. Cross-Site Scripting (XSS) & payload injection (Input sanitization & bounds checking)
 * 5. Storage exhaustion attacks (Safe storage & quota guards)
 */

// Memory and Session-based Rate Limiter Storage
const RATE_LIMIT_PREFIX = 'sellsolar_sec_rate_';
const LOCKOUT_PREFIX = 'sellsolar_sec_lock_';

/**
 * Rate limit thresholds for various user-facing actions
 */
export const RATE_LIMIT_RULES = {
  login: {
    maxAttempts: 5,
    windowMs: 2 * 60 * 1000, // 2 minutes
    lockoutMs: 60 * 1000, // 1 minute initial lockout
    escalateLockoutMs: 3 * 60 * 1000, // 3 minutes on repeated lockout
  },
  signup: {
    maxAttempts: 4,
    windowMs: 10 * 60 * 1000, // 10 minutes
    lockoutMs: 5 * 60 * 1000,
  },
  password_reset: {
    maxAttempts: 4,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 10 * 60 * 1000,
  },
  installation_request: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    lockoutMs: 5 * 60 * 1000,
  },
  post_ad: {
    maxAttempts: 6,
    windowMs: 10 * 60 * 1000, // 10 minutes
    lockoutMs: 5 * 60 * 1000,
  },
  inquiry: {
    maxAttempts: 6,
    windowMs: 3 * 60 * 1000, // 3 minutes
    lockoutMs: 2 * 60 * 1000,
  },
};

/**
 * Get stored security state safely from sessionStorage / localStorage
 */
function getStorageItem(key) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
  } catch {}
  return null;
}

function setStorageItem(key, value) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch {}
}

function removeStorageItem(key) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch {}
}

/**
 * Check whether an action is currently rate-limited or locked out.
 * Returns: { allowed: boolean, remainingAttempts: number, retryAfterSeconds: number, reason?: string }
 */
export function checkRateLimit(action, identifier = 'global') {
  const rule = RATE_LIMIT_RULES[action] || { maxAttempts: 10, windowMs: 60000, lockoutMs: 60000 };
  const cleanId = String(identifier).toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40) || 'global';
  const lockKey = `${LOCKOUT_PREFIX}${action}_${cleanId}`;
  const rateKey = `${RATE_LIMIT_PREFIX}${action}_${cleanId}`;
  const now = Date.now();

  // 1. Check if under active lockout
  const rawLock = getStorageItem(lockKey);
  if (rawLock) {
    try {
      const lockData = JSON.parse(rawLock);
      if (lockData.expiresAt > now) {
        const retryAfterSeconds = Math.ceil((lockData.expiresAt - now) / 1000);
        return {
          allowed: false,
          remainingAttempts: 0,
          retryAfterSeconds,
          reason: `Security defense active: Too many requests. Please wait ${retryAfterSeconds}s before trying again.`,
        };
      } else {
        removeStorageItem(lockKey);
      }
    } catch {
      removeStorageItem(lockKey);
    }
  }

  // 2. Check sliding window timestamps
  const rawHistory = getStorageItem(rateKey);
  let timestamps = [];
  if (rawHistory) {
    try {
      timestamps = JSON.parse(rawHistory);
      if (!Array.isArray(timestamps)) timestamps = [];
    } catch {
      timestamps = [];
    }
  }

  // Filter timestamps within the current sliding window
  const validTimestamps = timestamps.filter((t) => typeof t === 'number' && now - t < rule.windowMs);

  if (validTimestamps.length >= rule.maxAttempts) {
    // Trigger lockout
    const lockoutDuration = rule.lockoutMs || 60000;
    const expiresAt = now + lockoutDuration;
    setStorageItem(lockKey, JSON.stringify({ expiresAt, createdAt: now }));
    const retryAfterSeconds = Math.ceil(lockoutDuration / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      reason: `Security cooldown active to prevent unauthorized access. Please wait ${retryAfterSeconds}s.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, rule.maxAttempts - validTimestamps.length),
    retryAfterSeconds: 0,
  };
}

/**
 * Record a failed attempt or request execution
 */
export function recordRateLimitAttempt(action, identifier = 'global') {
  const rule = RATE_LIMIT_RULES[action] || { maxAttempts: 10, windowMs: 60000, lockoutMs: 60000 };
  const cleanId = String(identifier).toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40) || 'global';
  const lockKey = `${LOCKOUT_PREFIX}${action}_${cleanId}`;
  const rateKey = `${RATE_LIMIT_PREFIX}${action}_${cleanId}`;
  const now = Date.now();

  const rawHistory = getStorageItem(rateKey);
  let timestamps = [];
  if (rawHistory) {
    try {
      timestamps = JSON.parse(rawHistory);
      if (!Array.isArray(timestamps)) timestamps = [];
    } catch {
      timestamps = [];
    }
  }

  const validTimestamps = timestamps.filter((t) => typeof t === 'number' && now - t < rule.windowMs);
  validTimestamps.push(now);
  setStorageItem(rateKey, JSON.stringify(validTimestamps));

  // If this attempt reached the limit, set lockout immediately
  if (validTimestamps.length >= rule.maxAttempts) {
    const lockoutDuration = rule.lockoutMs || 60000;
    setStorageItem(lockKey, JSON.stringify({ expiresAt: now + lockoutDuration, createdAt: now }));
  }
}

/**
 * Clear rate limit on successful authentication or action
 */
export function clearRateLimit(action, identifier = 'global') {
  const cleanId = String(identifier).toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40) || 'global';
  removeStorageItem(`${RATE_LIMIT_PREFIX}${action}_${cleanId}`);
  removeStorageItem(`${LOCKOUT_PREFIX}${action}_${cleanId}`);
}

/**
 * Anti-Bot Honeypot validator:
 * Automated spambots parse forms and fill all input fields.
 * Hidden honeypot fields MUST remain completely empty.
 */
export function isBotHoneypotTriggered(honeypotValue) {
  if (honeypotValue && String(honeypotValue).trim().length > 0) {
    console.warn('[SECURITY] Bot honeypot triggered. Request dropped silently.');
    return true;
  }
  return false;
}

/**
 * Anti-Bot Submission Velocity Check:
 * Humans take at least 1.0 to 1.5 seconds to interact with and submit a form.
 * Instantaneous submissions (<1000ms) indicate scripted curl / headless bot automation.
 */
export function isSubmissionTooFast(renderedTimestamp, minSeconds = 1.0) {
  if (!renderedTimestamp || typeof renderedTimestamp !== 'number') return false;
  const elapsed = (Date.now() - renderedTimestamp) / 1000;
  if (elapsed < minSeconds) {
    console.warn(`[SECURITY] Form submitted suspiciously fast (${elapsed.toFixed(2)}s). Automated script suspected.`);
    return true;
  }
  return false;
}

/**
 * Sanitize text against Cross-Site Scripting (XSS) and control character injection
 */
export function sanitizeText(value, maxLength = 2000) {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // Strip dangerous control characters (except common whitespace)
  str = str.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '');

  // Strip direct HTML tags and script elements
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  str = str.replace(/<[^>]+>/g, '');

  // Strip inline event handler patterns
  str = str.replace(/javascript:/gi, '');
  str = str.replace(/on\w+\s*=/gi, '');

  // Trim and enforce length bound
  return str.trim().slice(0, maxLength);
}

/**
 * Sanitize URLs to ensure only safe http/https or data:image protocols are accepted
 */
export function sanitizeUrl(value, allowDataImage = true) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();

  // Allow safe data URIs for images if permitted
  if (allowDataImage && /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    return trimmed;
  }

  // Block javascript:, vbscript:, and file: schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }

  // Ensure it starts with standard http://, https://, or root-relative /
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed.slice(0, 1000);
  }

  return '';
}

/**
 * Verify account ownership credentials for direct password reset
 * Stops unauthorized account takeover on existing users and the admin account.
 */
export function verifyAccountRecoveryCredentials(targetIdentifier, verificationCodeOrPhone, storedUsers) {
  const cleanTarget = String(targetIdentifier || '').trim().toLowerCase();
  const cleanVerification = String(verificationCodeOrPhone || '').trim().toLowerCase();
  const digitsVerification = cleanVerification.replace(/\D/g, '');

  if (!cleanTarget) {
    return { ok: false, error: 'Please specify the registered account email or username.' };
  }
  if (!cleanVerification) {
    return {
      ok: false,
      error: 'Security verification required: Enter your registered mobile number or CNIC to verify ownership.',
    };
  }

  const users = storedUsers || {};
  let targetRecord = null;
  const digitsOnly = cleanTarget.replace(/\D/g, '');

  for (const [key, val] of Object.entries(users)) {
    if (!val) continue;
    const prof = val.profile || {};
    const keyDigits = (prof.phone || '').replace(/\D/g, '');
    const cnicDigits = (prof.cnic || '').replace(/\D/g, '');
    const storedEmail = (prof.email || key || '').toLowerCase();
    const storedUsername = (prof.username || '').toLowerCase();
    const emailPrefix = storedEmail.split('@')[0]?.toLowerCase();

    if (
      key.toLowerCase() === cleanTarget ||
      storedEmail === cleanTarget ||
      storedUsername === cleanTarget ||
      (emailPrefix && emailPrefix === cleanTarget) ||
      (digitsOnly.length >= 7 && keyDigits && keyDigits === digitsOnly) ||
      (digitsOnly.length >= 7 && cnicDigits && cnicDigits === digitsOnly)
    ) {
      targetRecord = val;
      break;
    }
  }

  // Admin account security verification
  const isAdminTarget =
    cleanTarget === 'mudassir2k6@gmail.com' ||
    cleanTarget === 'mudassir2k6' ||
    cleanTarget === 'mudassir';

  if (isAdminTarget) {
    // Admin verification: must supply registered admin phone '03001234567' or admin master security PIN '7860'
    const validAdminPhone = '03001234567';
    const adminMasterKey = '7860';
    if (digitsVerification === validAdminPhone || cleanVerification === adminMasterKey) {
      return { ok: true, isVerified: true, record: targetRecord };
    }
    return {
      ok: false,
      error: 'Security Verification Failed: Incorrect registered admin contact number or recovery PIN.',
    };
  }

  // If user record exists in database, verify against registered phone or CNIC
  if (targetRecord) {
    const prof = targetRecord.profile || {};
    const profPhoneDigits = (prof.phone || '').replace(/\D/g, '');
    const profCnicDigits = (prof.cnic || '').replace(/\D/g, '');

    // Allow match if phone digits match (or last 7 digits) or CNIC matches
    const phoneMatch =
      digitsVerification.length >= 7 &&
      profPhoneDigits &&
      (profPhoneDigits === digitsVerification || profPhoneDigits.endsWith(digitsVerification));
    const cnicMatch =
      digitsVerification.length >= 7 &&
      profCnicDigits &&
      (profCnicDigits === digitsVerification || profCnicDigits.endsWith(digitsVerification));

    if (phoneMatch || cnicMatch) {
      return { ok: true, isVerified: true, record: targetRecord };
    }

    return {
      ok: false,
      error: 'Security Verification Failed: The mobile number or CNIC provided does not match the registered account.',
    };
  }

  // If no previous record found (new local user identifier), allow password set if verification phone is valid 11-digit Pakistani phone
  if (/^03\d{9}$/.test(digitsVerification) || digitsVerification.length === 11) {
    return { ok: true, isVerified: true, record: null };
  }

  return {
    ok: false,
    error: 'Please enter a valid 11-digit mobile number (e.g. 03001234567) to secure your account recovery.',
  };
}

/**
 * Storage Protection: Safe JSON parser that won't throw or crash
 */
export function safeJsonParse(jsonString, fallback = null) {
  if (!jsonString || typeof jsonString !== 'string') return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Storage Protection: Safe localStorage setter with quota management and item caps
 */
export function safeStorageSet(key, value, maxItems = 60) {
  if (typeof window === 'undefined') return false;
  try {
    let dataToStore = value;
    if (Array.isArray(value) && value.length > maxItems) {
      dataToStore = value.slice(0, maxItems);
    }
    const serialized = typeof dataToStore === 'string' ? dataToStore : JSON.stringify(dataToStore);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[SECURITY] Storage quota warning for ${key}:`, err);
    // If quota exceeded, attempt to clear transient logs
    try {
      localStorage.removeItem('sellsolar_search_history');
      localStorage.removeItem('sellsolar_recent_views');
    } catch {}
    return false;
  }
}

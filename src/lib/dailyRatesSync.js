import { supabase } from './supabase';
import {
  CUSTOM_DAILY_RATES_STORAGE_KEY,
  RAW_BASE_DAILY_SHEET,
  saveCustomDailyRates,
} from '../data/todayPricesData';
import { getPakistanDateDetails } from './dateUtils';

export const DAILY_RATES_SETTINGS_KEY = 'daily_rates_override';

let inFlightSync = null;
let lastSyncAttemptMs = 0;

/**
 * Pull admin-published live rates from Supabase site_settings (publicly readable via RLS)
 * and sync into localStorage if newer than the static repo sheet and local cache.
 */
export async function syncDailyRatesFromSupabase(force = false) {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (!force && inFlightSync) return inFlightSync;
  if (!force && now - lastSyncAttemptMs < 30000) return null;

  lastSyncAttemptMs = now;
  inFlightSync = (async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value, updated_at')
        .eq('key', DAILY_RATES_SETTINGS_KEY)
        .maybeSingle();

      if (error || !data?.value || typeof data.value !== 'object') {
        return null;
      }

      const remoteWrapper = data.value;
      const remoteSheet = remoteWrapper.sheet || remoteWrapper;
      if (!remoteSheet || !Array.isArray(remoteSheet.rates)) {
        return null;
      }

      const repoPublishedMs =
        Date.parse(RAW_BASE_DAILY_SHEET?.publishedIso || '2026-11-23T00:00:00+05:00') || 0;
      const remotePublishedMs =
        Date.parse(remoteWrapper.publishedAt || remoteSheet.publishedAt || data.updated_at || '') || 0;

      // Never overwrite a newer static repo release with an older remote override
      if (remotePublishedMs < repoPublishedMs) {
        return null;
      }

      // Check existing local override timestamp to avoid redundant events
      try {
        const localRaw = localStorage.getItem(CUSTOM_DAILY_RATES_STORAGE_KEY);
        if (localRaw) {
          const localParsed = JSON.parse(localRaw);
          const localPublishedMs = Date.parse(localParsed?.publishedAt || '') || 0;
          if (localPublishedMs >= remotePublishedMs && localParsed?.sheetVersion === remoteSheet.sheetVersion) {
            return localParsed;
          }
        }
      } catch {
        // ignore localStorage read errors
      }

      const payload = {
        ...remoteSheet,
        publishedAt: remoteWrapper.publishedAt || data.updated_at || new Date().toISOString(),
        sheetVersion: remoteWrapper.sheetVersion || remoteSheet.sheetVersion || RAW_BASE_DAILY_SHEET?.sheetVersion,
        isGlobalAdminOverride: true,
      };

      localStorage.setItem(CUSTOM_DAILY_RATES_STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('sellsolar_daily_rates_updated', { detail: payload }));
      return payload;
    } catch (err) {
      console.warn('[SellSolar] Remote daily rates sync skipped:', err?.message || err);
      return null;
    } finally {
      inFlightSync = null;
    }
  })();

  return inFlightSync;
}

/**
 * Save custom daily rates locally AND publish globally to Supabase site_settings
 * so every visitor on sellsolar.pk receives the updated prices immediately.
 */
export async function publishDailyRatesGlobal(updatedSheetData) {
  const payload = saveCustomDailyRates(updatedSheetData) || updatedSheetData;
  if (typeof window === 'undefined') {
    return { ok: false, syncedGlobal: false, payload };
  }

  try {
    const publishedAt = payload.publishedAt || new Date().toISOString();
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: DAILY_RATES_SETTINGS_KEY,
          value: {
            sheetVersion: payload.sheetVersion || RAW_BASE_DAILY_SHEET?.sheetVersion,
            publishedAt,
            reportDate: payload.date || getPakistanDateDetails().todayStr,
            source: 'admin_live_sync',
            sheet: payload,
          },
          updated_at: publishedAt,
        },
        { onConflict: 'key' }
      );

    if (error) {
      return {
        ok: true,
        syncedGlobal: false,
        payload,
        error: error.message || 'Admin Supabase permission required for global sync',
      };
    }

    return { ok: true, syncedGlobal: true, payload };
  } catch (err) {
    return {
      ok: true,
      syncedGlobal: false,
      payload,
      error: err?.message || 'Network error while syncing globally',
    };
  }
}

const BRAND_CANONICAL_MAP = [
  { regex: /\blongi\b/i, brand: 'LONGi', short: 'Longi' },
  { regex: /\b(?:astronergy|astro)\b/i, brand: 'Astronergy', short: 'Astro' },
  { regex: /\bja\s*solar\b|\bja\b/i, brand: 'JA Solar', short: 'JA' },
  { regex: /\bcanadian(?:\s*solar)?\b/i, brand: 'Canadian Solar', short: 'Canadian' },
  { regex: /\bjinko(?:\s*solar)?\b/i, brand: 'Jinko Solar', short: 'Jinko' },
  { regex: /\bosda\b/i, brand: 'OSDA', short: 'Osda' },
  { regex: /\btrox\b/i, brand: 'Trox', short: 'Trox' },
  { regex: /\bkorean\b/i, brand: 'Korean', short: 'Korean' },
  { regex: /\binverex\b/i, brand: 'Inverex', short: 'Inverex' },
  { regex: /\byingli\b/i, brand: 'Yingli', short: 'Yingli' },
  { regex: /\btcl\b/i, brand: 'TCL', short: 'TCL' },
  { regex: /\baiko\b/i, brand: 'Aiko', short: 'Aiko' },
  { regex: /\blefn\b/i, brand: 'LEFN', short: 'LEFN' },
  { regex: /\brisen\b/i, brand: 'Risen', short: 'Risen' },
  { regex: /\bjesco\b/i, brand: 'Jesco', short: 'Jesco' },
];

function detectBrandFromLine(text) {
  for (const entry of BRAND_CANONICAL_MAP) {
    if (entry.regex.test(text)) return entry;
  }
  return null;
}

function normalizeModelName(rawModel, brandEntry) {
  let clean = rawModel
    .replace(/^[-•*\d.)\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure wattage has trailing W if missing (e.g. "Canadian 585" -> "Canadian 585W", "Longi 645 BF" -> "Longi 645W BF")
  clean = clean.replace(/\b(\d{3,4})\b(?!\s*[wWkKvVaA])/g, '$1W');

  if (brandEntry) {
    const hasBrandWord = new RegExp(`\\b${brandEntry.short}\\b|\\b${brandEntry.brand.split(' ')[0]}\\b`, 'i').test(clean);
    if (!hasBrandWord) {
      clean = `${brandEntry.short} ${clean}`;
    } else {
      // Standardize prefix capitalization gently while preserving qualifiers like Mustang / Jollywood / HJT / BF
      clean = clean.replace(new RegExp(`^${brandEntry.short}\\b`, 'i'), brandEntry.short);
    }
  }
  return clean.replace(/\s+/g, ' ').trim();
}

function findMatchingExistingPanel(existingRates, canonicalBrand, modelName) {
  const wattMatch = modelName.match(/\b(\d{3,4})\s*w\b/i);
  const watt = wattMatch ? wattMatch[1] : null;
  const brandNorm = canonicalBrand.toLowerCase().replace(/\s*solar$/i, '').trim();
  const modelNorm = modelName.toLowerCase();

  return (existingRates || []).find((item) => {
    const iBrandNorm = String(item.brand || '').toLowerCase().replace(/\s*solar$/i, '').trim();
    const brandMatches = iBrandNorm === brandNorm || iBrandNorm.includes(brandNorm) || brandNorm.includes(iBrandNorm);
    if (!brandMatches) return false;
    const iModelNorm = String(item.model || '').toLowerCase();
    if (watt && !iModelNorm.includes(watt)) return false;
    if (modelNorm.includes('hjt') !== iModelNorm.includes('hjt')) return false;
    if (modelNorm.includes('jollywood') !== iModelNorm.includes('jollywood')) return false;
    if (modelNorm.includes('mustang') !== iModelNorm.includes('mustang')) return false;
    return true;
  });
}

/**
 * Parse a distributor WhatsApp solar panel rate list into structured benchmark rows
 * with automatic diffing against the current sheet.
 */
export function parseWhatsAppRateSheet(rawText, currentSheet, { mode = 'replace' } = {}) {
  const existingRates = Array.isArray(currentSheet?.rates) ? currentSheet.rates : [];
  const lines = String(rawText || '').split(/\r?\n/);

  let currentBrandEntry = null;
  const parsedItems = [];
  const skippedLines = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Ignore conversational footer lines like "yh 23 nov ki list ha..."
    if (/\b(?:list ha|confirm krn|difference ha|kya kya|rate list|updated list)\b/i.test(trimmed) && !/\b\d{3,4}\b/.test(trimmed)) {
      continue;
    }

    // Extract price token: e.g. "Rs. 36.25/W", "Rs 41/W", "PKR 38.50 / w", "- 39.25/w", "- Rs. 42"
    const priceMatch = trimmed.match(/(?:[-–—]\s*)?(?:(?:rs\.?|pkr)\s*)?(\d{2,3}(?:\.\d{1,2})?)\s*(?:\/\s*w(?:att)?|per\s*watt)?(?=$|\s*[-–—(|•,]|\s+[A-Za-z])/i);

    // Check if this line is purely a brand header (no 3-digit wattage & no price)
    const hasWattage = /\b[3-9]\d{2}\s*w?\b/i.test(trimmed);
    if (!hasWattage && !/(?:rs\.?|pkr)\s*\d/i.test(trimmed)) {
      const detectedHeader = detectBrandFromLine(trimmed);
      if (detectedHeader) {
        currentBrandEntry = detectedHeader;
        continue;
      }
    }

    // Line has a model and a price
    const cleanedBody = trimmed.replace(/^[-•*]+\s*/, '').trim();
    const rateRegex = /(?:[-–—:]\s*)?(?:rs\.?|pkr)\s*(\d{2,3}(?:\.\d{1,2})?)(?:\s*\/\s*w(?:att)?)?|\s[-–—]\s*(\d{2,3}(?:\.\d{1,2})?)\s*\/\s*w(?:att)?/i;
    const rateMatch = cleanedBody.match(rateRegex) || (hasWattage ? priceMatch : null);

    if (!rateMatch) {
      if (cleanedBody.length > 2) skippedLines.push(trimmed);
      continue;
    }

    const rateVal = Number(rateMatch[1] || rateMatch[2]);
    if (!Number.isFinite(rateVal) || rateVal < 20 || rateVal > 120) {
      skippedLines.push(trimmed);
      continue;
    }

    const rateStartIdx = rateMatch.index ?? cleanedBody.length;
    const rateEndIdx = rateStartIdx + rateMatch[0].length;

    const rawModelPart = cleanedBody.slice(0, rateStartIdx).replace(/[-–—:]+$/, '').trim();
    let rawNotePart = cleanedBody.slice(rateEndIdx).replace(/^[\s\-–—/|]+/, '').trim();
    // Clean leading "/W" leftover if regex didn't consume it
    rawNotePart = rawNotePart.replace(/^\/\s*w(?:att)?\s*[-–—/|]*\s*/i, '').trim();

    if (!rawModelPart) {
      skippedLines.push(trimmed);
      continue;
    }

    const inlineBrand = detectBrandFromLine(rawModelPart);
    const brandEntry = inlineBrand || currentBrandEntry;
    const brandName = brandEntry ? brandEntry.brand : rawModelPart.split(/\s+/)[0];
    const modelName = normalizeModelName(rawModelPart, brandEntry);

    const existing = findMatchingExistingPanel(existingRates, brandName, modelName);
    const prevRate = existing && typeof existing.rate === 'number' ? existing.rate : rateVal;
    const change = Number((rateVal - prevRate).toFixed(2));
    const status = !existing ? 'new' : change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    const defaultBadge = brandName === 'Inverex' ? 'A-Grade w/ Docs' : 'Ready Stock';
    const badge = rawNotePart ? rawNotePart : defaultBadge;

    parsedItems.push({
      brand: brandName,
      model: modelName,
      rate: rateVal,
      prevRate,
      change,
      status,
      badge,
      ...(rawNotePart ? { note: rawNotePart } : {}),
      isCarriedForward: false,
      rateSource: 'admin_whatsapp_sync',
      _isNew: !existing,
    });
  }

  let nextRates = [];
  if (mode === 'merge') {
    const matchedIndices = new Set();
    nextRates = existingRates.map((existing) => {
      const parsedIdx = parsedItems.findIndex(
        (p) =>
          p.brand.toLowerCase() === String(existing.brand || '').toLowerCase() &&
          p.model.toLowerCase() === String(existing.model || '').toLowerCase()
      );
      if (parsedIdx >= 0) {
        matchedIndices.add(parsedIdx);
        const { _isNew, ...cleanItem } = parsedItems[parsedIdx];
        return cleanItem;
      }
      return existing;
    });
    parsedItems.forEach((p, idx) => {
      if (!matchedIndices.has(idx)) {
        const { _isNew, ...cleanItem } = p;
        nextRates.push(cleanItem);
      }
    });
  } else {
    nextRates = parsedItems.map(({ _isNew, ...cleanItem }) => cleanItem);
  }

  const summary = {
    total: parsedItems.length,
    up: parsedItems.filter((p) => !p._isNew && p.change > 0).length,
    down: parsedItems.filter((p) => !p._isNew && p.change < 0).length,
    unchanged: parsedItems.filter((p) => !p._isNew && p.change === 0).length,
    added: parsedItems.filter((p) => p._isNew).length,
    changed: parsedItems.filter((p) => !p._isNew && p.change !== 0).length,
  };

  return {
    parsedItems,
    nextRates,
    summary,
    skippedLines,
  };
}

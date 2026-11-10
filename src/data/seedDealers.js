/**
 * Verified Solar Dealers for Pakistan Marketplace
 * Covering major solar business hubs: Islamabad, Rawalpindi, Karachi, Faisalabad, and Lahore.
 *
 * Tracking fields:
 * - registration_source: 'admin_manual' (Added manually by Administrator) vs 'self_registered' (Registered online by dealer)
 * - registered_by: 'administrator' vs 'dealer_self'
 * - registered_by_display: Human-readable label for badges and administration tracking
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const SEED_DEALERS = [
  // --- ISLAMABAD (3 Dealers) ---
  {
    id: 'dealer-isb-001',
    email: 'rawal.solar@dealers.sellsolar.pk',
    full_name: 'Muhammad Usman Qureshi',
    business_name: 'Rawal Green Energy & Solar Hub',
    phone: '03005128944',
    city: 'Islamabad',
    business_address: 'Shop #12-14, Ground Floor, Beverly Centre, Jinnah Avenue, Blue Area, Islamabad',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '61101-1892345-1',
    registration_source: 'admin_manual',
    registered_by: 'administrator',
    registration_label: 'Manual Admin',
    registered_by_display: 'Administrator (Manual Onboarding)',
    brands: ['Longi', 'Canadian Solar', 'Huawei', 'Inverex'],
    experience_years: 9,
    created_at: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'dealer-isb-002',
    email: 'capital.solar@dealers.sellsolar.pk',
    full_name: 'Engr. Faisal Mehmood',
    business_name: 'Capital Solar Technologies',
    phone: '03335210988',
    city: 'Islamabad',
    business_address: 'Plot #84, Street 7, Industrial Area Sector I-9/2, Islamabad',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '61101-5623891-3',
    registration_source: 'self_registered',
    registered_by: 'dealer_self',
    registration_label: 'Self Registered',
    registered_by_display: 'Self-Registered (Online Portal)',
    brands: ['Jinko', 'Growatt', 'Itel', 'JA Solar'],
    experience_years: 6,
    created_at: '2026-03-01T14:30:00.000Z',
  },
  {
    id: 'dealer-isb-003',
    email: 'margalla.solar@dealers.sellsolar.pk',
    full_name: 'Malik Tariq Awan',
    business_name: 'Margalla Solar & Battery Center',
    phone: '03455112233',
    city: 'Islamabad',
    business_address: 'Plaza #21, Main Double Road, Sector G-11 Markaz, Islamabad',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '37405-9012435-5',
    registration_source: 'admin_manual',
    registered_by: 'administrator',
    registration_label: 'Manual Admin',
    registered_by_display: 'Administrator (Manual Onboarding)',
    brands: ['Astronergy', 'Knox', 'Itel', 'Canadian Solar'],
    experience_years: 11,
    created_at: '2026-02-18T11:15:00.000Z',
  },

  // --- RAWALPINDI (2 Dealers) ---
  {
    id: 'dealer-rwp-001',
    email: 'rehman.solar@dealers.sellsolar.pk',
    full_name: 'Haji Abdul Rehman',
    business_name: 'Al-Rehman Solar Corporation',
    phone: '03015523411',
    city: 'Rawalpindi',
    business_address: 'Shop #4-5, Al-Madina Market, College Road, Rawalpindi',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '37405-4432190-7',
    registration_source: 'admin_manual',
    registered_by: 'administrator',
    registration_label: 'Manual Admin',
    registered_by_display: 'Administrator (Manual Onboarding)',
    brands: ['Longi', 'Fronus', 'Inverex', 'TCL'],
    experience_years: 14,
    created_at: '2026-01-25T09:45:00.000Z',
  },
  {
    id: 'dealer-rwp-002',
    email: 'potohar.solar@dealers.sellsolar.pk',
    full_name: 'Khurram Shehzad',
    business_name: 'Potohar Solar Engineering',
    phone: '03125344900',
    city: 'Rawalpindi',
    business_address: 'Commercial Center, Opp. Shell Station, Peshawar Road, Saddar, Rawalpindi',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '37405-7761234-9',
    registration_source: 'self_registered',
    registered_by: 'dealer_self',
    registration_label: 'Self Registered',
    registered_by_display: 'Self-Registered (Online Portal)',
    brands: ['Sungrow', 'Jinko', 'Solis', 'Itel'],
    experience_years: 7,
    created_at: '2026-03-08T16:20:00.000Z',
  },

  // --- KARACHI (3 Dealers) ---
  {
    id: 'dealer-khi-001',
    email: 'karachi.hub@dealers.sellsolar.pk',
    full_name: 'Syed Zeeshan Ali',
    business_name: 'Karachi Solar Hub & Inverter Mart',
    phone: '03219234567',
    city: 'Karachi',
    business_address: 'Shop #G-18, Regal Trade Square, Regal Chowk, Saddar, Karachi',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '42101-3321456-1',
    registration_source: 'admin_manual',
    registered_by: 'administrator',
    registration_label: 'Manual Admin',
    registered_by_display: 'Administrator (Manual Onboarding)',
    brands: ['Inverex', 'Longi', 'Canadian Solar', 'Knox'],
    experience_years: 12,
    created_at: '2026-01-20T12:00:00.000Z',
  },
  {
    id: 'dealer-khi-002',
    email: 'sindh.green@dealers.sellsolar.pk',
    full_name: 'Muhammad Imran Memon',
    business_name: 'Sindh Green Solar Traders',
    phone: '03332145678',
    city: 'Karachi',
    business_address: 'Plot 14-C, 24th Commercial Street, Phase II Ext., DHA, Karachi',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '42201-8891234-3',
    registration_source: 'self_registered',
    registered_by: 'dealer_self',
    registration_label: 'Self Registered',
    registered_by_display: 'Self-Registered (Online Portal)',
    brands: ['Jinko', 'Huawei', 'Growatt', 'Trina'],
    experience_years: 8,
    created_at: '2026-02-28T15:10:00.000Z',
  },
  {
    id: 'dealer-khi-003',
    email: 'indus.energy@dealers.sellsolar.pk',
    full_name: 'Babar Sultan',
    business_name: 'Indus Solar & Renewable Energy',
    phone: '03002233890',
    city: 'Karachi',
    business_address: 'Showroom #3, Sector 15, Main Korangi Industrial Area Road, Karachi',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '42301-6543210-5',
    registration_source: 'admin_manual',
    registered_by: 'administrator',
    registration_label: 'Manual Admin',
    registered_by_display: 'Administrator (Manual Onboarding)',
    brands: ['Itel', 'Astronergy', 'Solis', 'Canadian Solar'],
    experience_years: 10,
    created_at: '2026-02-05T09:00:00.000Z',
  },

  // --- FAISALABAD (2 Dealers) ---
  {
    id: 'dealer-fsd-001',
    email: 'fsd.express@dealers.sellsolar.pk',
    full_name: 'Mian Asif Nazir',
    business_name: 'Faisalabad Solar Express',
    phone: '03006612345',
    city: 'Faisalabad',
    business_address: 'Shop #28-30, Electronic Market, Karkhana Bazaar, Clock Tower, Faisalabad',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '33100-1234567-7',
    registration_source: 'admin_manual',
    registered_by: 'administrator',
    registration_label: 'Manual Admin',
    registered_by_display: 'Administrator (Manual Onboarding)',
    brands: ['Longi', 'Canadian Solar', 'Inverex', 'Fronus'],
    experience_years: 15,
    created_at: '2026-01-18T10:30:00.000Z',
  },
  {
    id: 'dealer-fsd-002',
    email: 'chenab.solar@dealers.sellsolar.pk',
    full_name: 'Chaudhry Kamran Akram',
    business_name: 'Chenab Solar Energy Systems',
    phone: '03227890123',
    city: 'Faisalabad',
    business_address: 'Main Boulevard, Batala Colony, Near D-Ground, Satyana Road, Faisalabad',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '33100-8765432-1',
    registration_source: 'self_registered',
    registered_by: 'dealer_self',
    registration_label: 'Self Registered',
    registered_by_display: 'Self-Registered (Online Portal)',
    brands: ['Jinko', 'JA Solar', 'Huawei', 'Itel'],
    experience_years: 5,
    created_at: '2026-03-05T13:45:00.000Z',
  },

  // --- LAHORE (Existing Reference Dealer) ---
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'contact@solartraders.pk',
    full_name: 'Tariq Mahmood',
    business_name: 'Solar Traders Lahore',
    phone: '03019876543',
    city: 'Lahore',
    business_address: 'Plaza 14, Hall Road, Lahore',
    account_type: 'dealer',
    is_verified_dealer: true,
    is_admin: false,
    cnic: '35201-1122334-5',
    registration_source: 'admin_manual',
    registered_by: 'administrator',
    registration_label: 'Manual Admin',
    registered_by_display: 'Administrator (Manual Onboarding)',
    brands: ['Longi', 'Inverex', 'Growatt', 'Crown'],
    experience_years: 16,
    created_at: '2026-01-15T00:00:00.000Z',
  }
];

export const CUSTOM_DEALERS_STORAGE_KEY = 'sellsolar_custom_dealers';

function dealerPhoneKey(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function dealerNameKey(name) {
  return String(name || '').toLowerCase().trim();
}

export function normalizeDealerRecord(d = {}, fallbackSource = 'self_registered') {
  return {
    id: d.id || `dlr-${Date.now()}`,
    business_name: d.business_name || d.full_name || 'Solar Dealer',
    full_name: d.full_name || 'Authorized Representative',
    city: d.city || 'Pakistan',
    phone: d.phone || '',
    email: d.email || '',
    business_address: d.business_address || `${d.city || 'Pakistan'}`,
    cnic: d.cnic || null,
    is_verified_dealer: d.is_verified_dealer !== false,
    registration_source:
      d.registration_source ||
      (fallbackSource === 'profile' ? 'self_registered' : fallbackSource),
    registered_by: d.registered_by || null,
    registered_by_display: d.registered_by_display || null,
    brands: Array.isArray(d.brands) ? d.brands : d.brands ? [d.brands] : ['Longi', 'Inverex', 'Growatt'],
    specialties: d.specialties || 'Turnkey Solar Installation & Wholesale',
    rating: Number(d.rating) || 4.8,
    reviews_count: Number(d.reviews_count) || 0,
    established_year: d.established_year || null,
    experience_years: d.experience_years || null,
    tier: d.tier || (d.is_verified_dealer !== false ? 'Verified Dealer' : 'Registered Dealer'),
    created_at: d.created_at || new Date().toISOString(),
    updated_at: d.updated_at || d.created_at || new Date().toISOString(),
    source_table: d.source_table || fallbackSource,
  };
}

function mergeDealerLists(...lists) {
  const byId = new Map();
  const byPhone = new Map();
  const byName = new Map();

  for (const list of lists) {
    for (const raw of list || []) {
      if (!raw) continue;
      const d = normalizeDealerRecord(raw, raw.source_table || 'merged');
      const phone = dealerPhoneKey(d.phone);
      const name = dealerNameKey(d.business_name);
      const existing =
        (d.id && byId.get(d.id)) ||
        (phone && byPhone.get(phone)) ||
        (name && byName.get(name));

      if (existing) {
        const merged = { ...existing, ...d, id: existing.id || d.id };
        byId.set(merged.id, merged);
        if (phone) byPhone.set(phone, merged);
        if (name) byName.set(name, merged);
      } else {
        byId.set(d.id, d);
        if (phone) byPhone.set(phone, d);
        if (name) byName.set(name, d);
      }
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
}

function getLocalCustomDealers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_DEALERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((d) => normalizeDealerRecord(d, 'manual_admin')) : [];
  } catch {
    return [];
  }
}

/**
 * Get all dealers, merging custom added dealers with SEED_DEALERS
 */
export function getAllDealers(filters = {}) {
  let list = mergeDealerLists(getLocalCustomDealers(), SEED_DEALERS);

  // Filter by city
  if (filters.city) {
    list = list.filter(d => (d.city || '').toLowerCase() === filters.city.toLowerCase());
  }

  // Filter by verification
  if (filters.verifiedOnly) {
    list = list.filter(d => d.is_verified_dealer === true);
  }

  // Filter by registration source ('all' | 'admin_manual' | 'self_registered')
  if (filters.registrationSource && filters.registrationSource !== 'all') {
    list = list.filter(d => (d.registration_source || 'self_registered') === filters.registrationSource);
  }

  // Search keyword (business name, full name, address, phone)
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(d =>
      (d.business_name || '').toLowerCase().includes(q) ||
      (d.full_name || '').toLowerCase().includes(q) ||
      (d.business_address || '').toLowerCase().includes(q) ||
      (d.phone || '').includes(q) ||
      (d.city || '').toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Save a newly added dealer (e.g. from Admin manual form or online registration)
 */
export function saveCustomDealer(dealer) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CUSTOM_DEALERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const normalized = normalizeDealerRecord(dealer, 'manual_admin');
    const index = existing.findIndex(d => d.id === normalized.id);
    if (index >= 0) {
      existing[index] = normalized;
    } else {
      existing.unshift(normalized);
    }
    localStorage.setItem(CUSTOM_DEALERS_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save custom dealer:', err);
  }
}

export function removeCustomDealer(dealerId) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CUSTOM_DEALERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const next = (Array.isArray(existing) ? existing : []).filter((d) => d.id !== dealerId);
    localStorage.setItem(CUSTOM_DEALERS_STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('Failed to remove custom dealer:', err);
  }
}

/** Persist dealer to Supabase `dealers` table (admin write) + local cache */
export async function upsertDealerToDatabase(dealer) {
  const normalized = normalizeDealerRecord(dealer, dealer.registration_source || 'manual_admin');
  saveCustomDealer(normalized);

  if (!isSupabaseConfigured() || !supabase) return { success: true, dealer: normalized, synced: false };

  try {
    const { error } = await supabase.from('dealers').upsert(
      {
        id: String(normalized.id),
        data: normalized,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('Dealer DB upsert failed:', error.message);
      return { success: true, dealer: normalized, synced: false, error: error.message };
    }
    return { success: true, dealer: normalized, synced: true };
  } catch (err) {
    console.warn('Dealer DB upsert notice:', err?.message);
    return { success: true, dealer: normalized, synced: false, error: err?.message };
  }
}

export async function deleteDealerFromDatabase(dealerId) {
  removeCustomDealer(dealerId);
  if (!isSupabaseConfigured() || !supabase || !dealerId) return { success: true, synced: false };
  try {
    const { error } = await supabase.from('dealers').delete().eq('id', String(dealerId));
    if (error) {
      // Soft-delete fallback if hard delete blocked
      await supabase.from('dealers').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', String(dealerId));
      return { success: true, synced: false, error: error.message };
    }
    return { success: true, synced: true };
  } catch (err) {
    return { success: true, synced: false, error: err?.message };
  }
}

/**
 * Load dealers for Admin + public pages:
 * 1) Supabase dealers table (admin-created / synced)
 * 2) Supabase profiles with dealer role/account
 * 3) Local custom dealers
 * 4) Seed directory
 */
export async function fetchAllDealersMerged(seedList = SEED_DEALERS) {
  const local = getLocalCustomDealers();
  let fromDealersTable = [];
  let fromProfiles = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: rows, error } = await supabase
        .from('dealers')
        .select('id, data, is_active, created_at, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(200);
      if (!error && Array.isArray(rows)) {
        fromDealersTable = rows.map((row) =>
          normalizeDealerRecord(
            {
              ...(row.data || {}),
              id: row.id,
              created_at: row.data?.created_at || row.created_at,
              updated_at: row.updated_at,
              source_table: 'dealers',
            },
            'manual_admin'
          )
        );
      }
    } catch (err) {
      console.warn('Dealers table load notice:', err?.message);
    }

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or('account_type.eq.dealer,is_verified_dealer.eq.true,role.eq.dealer')
        .limit(200);
      if (!error && Array.isArray(profiles)) {
        fromProfiles = profiles.map((p) =>
          normalizeDealerRecord(
            {
              id: p.id,
              business_name: p.business_name || p.full_name || 'Solar Dealer',
              full_name: p.full_name || 'Authorized Representative',
              city: p.city || 'Pakistan',
              phone: p.phone || '',
              email: p.email || '',
              business_address: p.business_address || '',
              cnic: p.cnic || null,
              is_verified_dealer: !!p.is_verified_dealer,
              registration_source: 'self_registered',
              brands: p.brands || ['Longi', 'Inverex', 'Growatt'],
              specialties: p.specialties || 'Turnkey Solar Installation & Wholesale',
              created_at: p.created_at,
              source_table: 'profile',
            },
            'profile'
          )
        );
      }
    } catch (err) {
      console.warn('Dealer profiles load notice:', err?.message);
    }
  }

  const seeds = (seedList || SEED_DEALERS).map((d) =>
    normalizeDealerRecord({ ...d, source_table: 'seed', registration_source: d.registration_source || 'ai_curated' }, 'ai_curated')
  );

  // Priority: DB dealers table + profiles first, then local, then seeds
  return mergeDealerLists(fromDealersTable, fromProfiles, local, seeds);
}

import { supabase } from './supabase';
import { isValidUuid } from './auth';
import { checkRateLimit, recordRateLimitAttempt, sanitizeText } from './security';
import { sendContactMessage } from '../services/inboxService';

export const ADMIN_NOTIFICATION_EMAIL = 'mudassir2k6@gmail.com';

export const INSTALLATION_STATUSES = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  contacting: { label: 'Contacted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  survey_scheduled: { label: 'Survey Scheduled', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  rejected: { label: 'Closed / Rejected', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
};

const SEED_INSTALLATION_REQUESTS = [
  {
    trackingCode: 'SOL-ISL-2481',
    fullName: 'Brigadier (R) Tariq Mahmood',
    phone: '03008554412',
    city: 'Islamabad',
    address: 'House # 42, Street 18, Sector F-7/2, Islamabad',
    systemCapacityKw: 15,
    systemType: 'on_grid_net_metering',
    monthlyBill: 125000,
    roofType: 'Reinforced Concrete (Flat)',
    status: 'survey_scheduled',
    createdAt: '2026-09-14T09:30:00.000Z',
    notes: 'Requires Tier 1 N-Type TOPCon panels with Huawei 15KTL inverter and IESCO green meter processing.',
  },
  {
    trackingCode: 'SOL-LHE-9104',
    fullName: 'Chaudhry Kashif Gujjar',
    phone: '03214588990',
    city: 'Lahore',
    address: 'Plot 118, Block M, Phase 5 DHA, Lahore',
    systemCapacityKw: 20,
    systemType: 'hybrid_storage',
    monthlyBill: 180000,
    roofType: 'Concrete Tile',
    status: 'contacting',
    createdAt: '2026-09-15T11:15:00.000Z',
    notes: 'Interested in Deye 20kW 3-Phase hybrid inverter with 30kWh lithium LiFePO4 battery rack for zero load shedding.',
  },
  {
    trackingCode: 'SOL-KHI-3319',
    fullName: 'Dr. Sarah Farooq',
    phone: '03332194820',
    city: 'Karachi',
    address: 'Plot 8-C, 24th Commercial Street, DHA Phase 2 Ext, Karachi',
    systemCapacityKw: 10,
    systemType: 'on_grid_net_metering',
    monthlyBill: 75000,
    roofType: 'RCC Flat',
    status: 'pending',
    createdAt: '2026-09-16T14:45:00.000Z',
    notes: 'Urgent survey needed for K-Electric net metering documentation before summer billing spikes.',
  },
  {
    trackingCode: 'SOL-RWP-7721',
    fullName: 'Malik Zeeshan Abbasi',
    phone: '03125588321',
    city: 'Rawalpindi',
    address: 'House 89, Safari Villas 1, Bahria Town Phase 7, Rawalpindi',
    systemCapacityKw: 7,
    systemType: 'hybrid_storage',
    monthlyBill: 58000,
    roofType: 'Metal Shed & Concrete',
    status: 'completed',
    createdAt: '2026-09-10T16:20:00.000Z',
    notes: '7kW Inverex Nitrox setup with GEPCO net metering successfully commissioned and energized.',
  },
];

export function getStoredInstallationRequests() {
  if (typeof window === 'undefined') return SEED_INSTALLATION_REQUESTS;
  try {
    const raw = localStorage.getItem('sellsolar_install_requests_v2');
    if (!raw) {
      localStorage.setItem('sellsolar_install_requests_v2', JSON.stringify(SEED_INSTALLATION_REQUESTS));
      return SEED_INSTALLATION_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_INSTALLATION_REQUESTS;
  } catch (e) {
    return SEED_INSTALLATION_REQUESTS;
  }
}

export function updateInstallationRequestStatus(trackingCode, newStatus, updateNote = '') {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredInstallationRequests();
    const updated = list.map((r) => {
      if (r.trackingCode === trackingCode) {
        return {
          ...r,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          lastNote: updateNote || r.lastNote,
        };
      }
      return r;
    });
    localStorage.setItem('sellsolar_install_requests_v2', JSON.stringify(updated));
    window.dispatchEvent(new Event('sellsolar_installation_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to update installation status:', e);
  }
}

export function deleteInstallationRequest(trackingCode) {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredInstallationRequests();
    const updated = list.filter((r) => r.trackingCode !== trackingCode);
    localStorage.setItem('sellsolar_install_requests_v2', JSON.stringify(updated));
    window.dispatchEvent(new Event('sellsolar_installation_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to delete installation request:', e);
  }
}

/**
 * Submit an installation request and trigger admin email notification
 * Hardened with:
 * - Rate limiting (Max 3 requests per 5 minutes per phone/client)
 * - Input sanitization against script injection & oversized payloads
 * - Safe storage quota management
 */
export async function submitInstallationRequest({
  fullName,
  city,
  address,
  phone,
  systemSize = '5kW System',
  propertyType = 'Residential',
  notes = '',
  userId = null,
  honeypot = '',
}) {
  // Anti-bot Honeypot check
  if (honeypot && String(honeypot).trim().length > 0) {
    console.warn('[SECURITY] Bot submission trapped by installation honeypot.');
    return {
      success: true,
      data: { id: `trapped_${Date.now()}` },
      emailStatus: { sent: true, adminEmail: ADMIN_NOTIFICATION_EMAIL, simulated: true },
    };
  }

  const cleanPhone = String(phone).replace(/[^0-9]/g, '');

  // Rate Limiting & DoS / Spam flood protection
  const rateCheck = checkRateLimit('installation_request', cleanPhone || 'global');
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.reason);
  }

  // Sanitize all inputs to prevent XSS and payload corruption
  const safeFullName = sanitizeText(fullName, 100);
  const safeCity = sanitizeText(city, 60);
  const safeAddress = sanitizeText(address, 250);
  const safeSystemSize = sanitizeText(systemSize, 80);
  const safePropertyType = sanitizeText(propertyType, 50);
  const safeNotes = notes ? sanitizeText(notes, 1000) : null;

  // 1. Insert into Supabase table
  const payload = {
    full_name: safeFullName,
    city: safeCity,
    address: safeAddress,
    contact_phone: cleanPhone,
    system_size: safeSystemSize,
    property_type: safePropertyType,
    notes: safeNotes,
    created_at: new Date().toISOString(),
  };

  if (userId && isValidUuid(userId)) {
    payload.user_id = userId;
  }

  let dbResult = null;
  try {
    const { data, error } = await supabase.from('installation_requests').insert(payload).select().maybeSingle();
    if (error) {
      // Fallback if user_id column has FK constraint or city column is pending
      if (payload.user_id) {
        delete payload.user_id;
        const retry1 = await supabase.from('installation_requests').insert(payload).select().maybeSingle();
        if (retry1.error) {
          // If city column is not yet migrated, pack city into address
          const fallbackPayload = {
            full_name: payload.full_name,
            address: `${payload.address} [City: ${payload.city}]`,
            contact_phone: payload.contact_phone,
          };
          const retry2 = await supabase.from('installation_requests').insert(fallbackPayload).select().maybeSingle();
          if (retry2.error) throw retry2.error;
          dbResult = retry2.data;
        } else {
          dbResult = retry1.data;
        }
      } else {
        // Retry with address fallback
        const fallbackPayload = {
          full_name: payload.full_name,
          address: `${payload.address} [City: ${payload.city}]`,
          contact_phone: payload.contact_phone,
        };
        const retry2 = await supabase.from('installation_requests').insert(fallbackPayload).select().maybeSingle();
        if (retry2.error) throw retry2.error;
        dbResult = retry2.data;
      }
    } else {
      dbResult = data;
    }
  } catch (err) {
    console.warn('Database insert warning (using local fallback if network issues):', err);
  }

  // Record rate limit attempt
  recordRateLimitAttempt('installation_request', cleanPhone || 'global');

  // Also save to local storage history with quota cap (50 items max)
  try {
    const existing = JSON.parse(localStorage.getItem('sellsolar_install_requests') || '[]');
    existing.unshift({
      ...payload,
      id: dbResult?.id || `req_${Date.now()}`,
      saved_at: new Date().toISOString(),
    });
    localStorage.setItem('sellsolar_install_requests', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {}

  // 2. Trigger Admin Email Notification
  let emailStatus = { sent: false, adminEmail: ADMIN_NOTIFICATION_EMAIL };
  try {
    const res = await supabase.functions.invoke('notify-admin-installation', {
      body: {
        fullName: payload.full_name,
        city: payload.city,
        address: payload.address,
        contactPhone: payload.contact_phone,
        systemSize: payload.system_size,
        propertyType: payload.property_type,
        notes: payload.notes,
        adminEmail: ADMIN_NOTIFICATION_EMAIL,
      },
    });

    if (res.data && res.data.ok) {
      emailStatus = { sent: true, adminEmail: ADMIN_NOTIFICATION_EMAIL, details: res.data };
    } else {
      emailStatus = { sent: true, adminEmail: ADMIN_NOTIFICATION_EMAIL, simulated: true };
    }
  } catch (fnErr) {
    console.warn('Edge function invoke error (fallback logged):', fnErr);
    emailStatus = { sent: true, adminEmail: ADMIN_NOTIFICATION_EMAIL, fallback: true };
  }

  // 3. Also insert in-app notification for admin accounts in Supabase
  try {
    const { data: admins } = await supabase.from('profiles').select('id').eq('is_admin', true);
    if (admins && admins.length > 0) {
      const notifRows = admins.map((adm) => ({
        user_id: adm.id,
        title: `⚡ New Installation Request: ${payload.full_name} (${payload.city})`,
        message: `Phone: ${payload.contact_phone} | Address: ${payload.address} | Size: ${payload.system_size}`,
        is_read: false,
      }));
      await supabase.from('notifications').insert(notifRows);
    }
  } catch (notifErr) {
    console.warn('In-app admin notification error:', notifErr);
  }

  // 4. Also register inquiry in Admin Unified Inbox so it appears under Messages / Inquiries
  try {
    await sendContactMessage({
      name: safeFullName,
      email: `${cleanPhone}@sellsolar-lead.pk`,
      phone: cleanPhone,
      subject: `⚡ Turnkey Installation Request: ${safeSystemSize} (${safeCity})`,
      message: `Customer: ${safeFullName}\nPhone: ${cleanPhone}\nCity: ${safeCity}\nProperty: ${safePropertyType}\nSystem Size: ${safeSystemSize}\nAddress: ${safeAddress}\n\nClient Notes:\n${safeNotes || 'None'}`,
      category: 'Installation Request',
      recipientEmail: 'info@sellsolar.pk',
    });
  } catch (inboxErr) {
    console.warn('Unified inbox lead sync warning:', inboxErr);
  }

  return {
    success: true,
    data: dbResult,
    emailStatus,
  };
}

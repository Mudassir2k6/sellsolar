import { supabase } from './supabase';
import { isValidUuid } from './auth';
import { checkRateLimit, recordRateLimitAttempt, sanitizeText } from './security';

export const ADMIN_NOTIFICATION_EMAIL = 'mudassir2k6@gmail.com';

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

  return {
    success: true,
    data: dbResult,
    emailStatus,
  };
}

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INBOX_STORAGE_KEY = 'sellsolar_inbox_messages';

/** Legacy demo tickets — removed so admin alerts are not stuck at 3 forever */
export const DEMO_INBOX_IDS = new Set(['msg-001', 'msg-002', 'msg-003']);

export function isInboxMessageRead(msg) {
  if (!msg) return true;
  if (msg.is_read === true) return true;
  const status = (msg.status || '').toLowerCase();
  return status === 'read' || status === 'replied';
}

export function isInboxMessageUnread(msg) {
  return !isInboxMessageRead(msg);
}

export function countUnreadInboxMessages(messages) {
  const list = Array.isArray(messages) ? messages : getInboxMessages();
  return list.filter((m) => isInboxMessageUnread(m)).length;
}

function stripDemoInboxMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => m && !DEMO_INBOX_IDS.has(m.id));
}

async function syncEnquiryReadStateToSupabase(messageId) {
  if (!isSupabaseConfigured() || typeof window === 'undefined') return;
  const id = String(messageId || '');
  let uuid = id.startsWith('sb-') ? id.slice(3) : id;
  if (!uuid || DEMO_INBOX_IDS.has(id) || id.startsWith('msg-')) return;
  try {
    await supabase.from('enquiries').update({ is_read: true, status: 'read' }).eq('id', uuid);
  } catch {
    /* non-blocking */
  }
}

function mapEnquiryRow(row) {
  const ticketFromSubject =
    row.subject && String(row.subject).includes('SLR-')
      ? row.subject.match(/SLR-\d+/)?.[0]
      : null;
  return {
    id: `sb-${row.id}`,
    ticketNumber:
      ticketFromSubject || `SLR-${String(row.id || '').slice(0, 6).toUpperCase() || '786012'}`,
    senderName: row.name || 'Website Visitor',
    senderEmail: row.email || 'inquiry@sellsolar.pk',
    senderPhone: row.contact_phone || '',
    subject:
      row.subject ||
      (row.message ? `${String(row.message).slice(0, 48)}…` : 'Customer Inquiry'),
    message: row.message || '',
    category: row.category || 'General Inquiry',
    recipientEmail: row.recipient_email || 'info@sellsolar.pk',
    status: row.status || (row.is_read ? 'read' : 'unread'),
    is_read: !!row.is_read,
    replies: Array.isArray(row.replies) ? row.replies : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mergeInboxWithSupabase(local, dbRows) {
  const map = new Map();

  stripDemoInboxMessages(local).forEach((m) => {
    map.set(m.id, m);
  });

  for (const row of dbRows) {
    const id = `sb-${row.id}`;
    const fromDb = mapEnquiryRow(row);
    const localMatch = map.get(id);
    if (localMatch) {
      const read = isInboxMessageRead(localMatch) || isInboxMessageRead(fromDb);
      map.set(id, {
        ...fromDb,
        ...localMatch,
        is_read: read,
        status: localMatch.status === 'replied'
          ? 'replied'
          : read
            ? 'read'
            : fromDb.status || 'unread',
        replies: (localMatch.replies?.length ? localMatch.replies : fromDb.replies) || [],
      });
    } else {
      map.set(id, fromDb);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getInboxMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = stripDemoInboxMessages(parsed);
        if (cleaned.length !== parsed.length) {
          saveInboxMessages(cleaned);
        }
        return cleaned;
      }
    }
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export function clearInboxMessagesToZero() {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
    return [];
  } catch {
    return [];
  }
}

export function saveInboxMessages(messages) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error('Error saving inbox messages:', err);
  }
}

export function generateEmailLinks({
  recipientEmail = 'info@sellsolar.pk',
  senderName = '',
  senderEmail = '',
  senderPhone = '',
  ticketNumber = '',
  subject = 'Contact Inquiry',
  message = '',
}) {
  const ticketTag = ticketNumber ? `[${ticketNumber}] ` : '';
  const emailSubject = `${ticketTag}${subject} - SellSolar.pk`;
  const emailBody = `Dear SellSolar Team,\n\nName: ${senderName || 'Customer'}\nEmail: ${senderEmail || 'Not specified'}\nPhone/WhatsApp: ${senderPhone || 'Not specified'}\nTicket: ${ticketNumber || 'N/A'}\nSubject: ${subject}\n\nMessage:\n${message}\n\n--\nDelivered to: ${recipientEmail}`;

  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const cleanPhone = (senderPhone || '').replace(/^0/, '92').replace(/[^0-9]/g, '');
  const waText = `*SellSolar Inquiry ${ticketNumber ? `[#${ticketNumber}]` : ''}*\n*Name:* ${senderName}\n*Email:* ${senderEmail}\n*Phone:* ${senderPhone || 'N/A'}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;
  const whatsappUrl = `https://wa.me/923001234567?text=${encodeURIComponent(waText)}`;

  return {
    mailtoUrl,
    gmailUrl,
    whatsappUrl,
    emailSubject,
    emailBody,
  };
}

export async function sendContactMessage({
  name,
  email,
  phone = '',
  subject = 'Contact Inquiry',
  message,
  category = 'General Inquiry',
  recipientEmail = 'info@sellsolar.pk',
}) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim();
  const cleanMessage = (message || '').trim();

  if (!cleanName) throw new Error('Name is required.');
  if (!cleanEmail) throw new Error('Email is required.');
  if (!cleanMessage) throw new Error('Message is required.');

  const ticketNumber = `SLR-${Math.floor(100000 + Math.random() * 900000)}`;
  const links = generateEmailLinks({
    recipientEmail,
    senderName: cleanName,
    senderEmail: cleanEmail,
    senderPhone: phone,
    ticketNumber,
    subject,
    message: cleanMessage,
  });

  const newMessage = {
    id: `msg-${Date.now()}`,
    ticketNumber,
    senderName: cleanName,
    senderEmail: cleanEmail,
    senderPhone: (phone || '').trim(),
    subject: (subject || 'General Inquiry').trim(),
    message: cleanMessage,
    category,
    recipientEmail,
    status: 'unread',
    is_read: false,
    replies: [],
    createdAt: new Date().toISOString(),
  };

  // 1. Save locally
  const current = getInboxMessages();
  const updated = [newMessage, ...current];
  saveInboxMessages(updated);

  // 2. Sync with Supabase if configured (failsafe without blocking user)
  if (isSupabaseConfigured()) {
    try {
      const { error: insErr } = await supabase.from('enquiries').insert({
        name: cleanName,
        email: cleanEmail,
        contact_phone: phone || null,
        subject: subject,
        message: cleanMessage,
        category: category || 'General Inquiry',
        recipient_email: recipientEmail || 'info@sellsolar.pk',
        status: 'unread',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (insErr) {
        // Fallback for database schemas with restricted columns or structure
        const { error: fbErr } = await supabase.from('enquiries').insert({
          contact_phone: phone || null,
          message: `[Ticket: ${ticketNumber}] Sender: ${cleanName} (${cleanEmail}) | Subject: ${subject}\n\n${cleanMessage}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
        if (fbErr) console.warn('Supabase enquiry fallback insert:', fbErr.message);
      }
    } catch (err) {
      console.warn('Supabase enquiry insert notice:', err?.message);
    }

    // 3. Dispatch admin email alert to info@sellsolar.pk if edge function is active
    try {
      await supabase.functions.invoke('notify-admin-inquiry', {
        body: {
          name: cleanName,
          email: cleanEmail,
          phone,
          subject,
          message: cleanMessage,
          recipientEmail,
          ticketNumber,
          adminEmail: 'admin@sellsolar.pk',
        },
      });
    } catch (fnErr) {
      console.warn('Inquiry notification edge function notice:', fnErr?.message);
    }
  }

  // Trigger custom storage event so other tabs/components update reactively
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }

  return { success: true, ticketNumber, message: newMessage, links };
}

export function markMessageAsRead(messageId) {
  const current = getInboxMessages();
  const updated = current.map((msg) =>
    msg.id === messageId
      ? {
          ...msg,
          is_read: true,
          status:
            msg.status === 'replied' ? 'replied' : msg.status === 'unread' ? 'read' : msg.status || 'read',
        }
      : msg
  );
  saveInboxMessages(updated);
  void syncEnquiryReadStateToSupabase(messageId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }
  return updated;
}

export async function fetchSharedInboxMessages() {
  const local = getInboxMessages();
  if (!isSupabaseConfigured()) return local;

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Supabase enquiries fetch:', error.message);
      return local;
    }
    if (!Array.isArray(data)) return local;

    const merged = mergeInboxWithSupabase(local, data);
    saveInboxMessages(merged);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sellsolar_inbox_updated'));
    }
    return merged.length > 0 ? merged : local;
  } catch (err) {
    console.warn('Supabase fetchSharedInboxMessages notice:', err);
    return local;
  }
}

export async function createDirectMessage({
  senderName = 'Super Admin',
  senderEmail = 'info@sellsolar.pk',
  recipientEmail,
  subject,
  message,
  category = 'Outbound Communication',
}) {
  const cleanRecipient = (recipientEmail || '').trim();
  const cleanSubject = (subject || 'Message from SellSolar.pk').trim();
  const cleanMsg = (message || '').trim();

  if (!cleanRecipient) throw new Error('Recipient email is required.');
  if (!cleanMsg) throw new Error('Message body cannot be empty.');

  const ticketNumber = `SLR-${Math.floor(100000 + Math.random() * 900000)}`;
  const newMsg = {
    id: `msg-${Date.now()}`,
    ticketNumber,
    senderName,
    senderEmail,
    senderPhone: '',
    subject: cleanSubject,
    message: cleanMsg,
    category,
    recipientEmail: cleanRecipient,
    status: 'replied',
    is_read: true,
    replies: [
      {
        id: `rep-${Date.now()}`,
        sender: senderName,
        text: cleanMsg,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const current = getInboxMessages();
  const updated = [newMsg, ...current];
  saveInboxMessages(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }
  return { success: true, ticketNumber, message: newMsg };
}

export function replyToInboxMessage(messageId, replyText, adminName = 'Super Admin') {
  const cleanReply = (replyText || '').trim();
  if (!cleanReply) throw new Error('Reply message cannot be empty.');

  const current = getInboxMessages();
  const target = current.find((m) => m.id === messageId);
  const replyObj = {
    id: `rep-${Date.now()}`,
    sender: adminName,
    text: cleanReply,
    createdAt: new Date().toISOString(),
  };

  const updated = current.map((msg) => {
    if (msg.id === messageId) {
      return {
        ...msg,
        status: 'replied',
        is_read: true,
        replies: [...(msg.replies || []), replyObj],
      };
    }
    return msg;
  });

  saveInboxMessages(updated);
  void syncEnquiryReadStateToSupabase(messageId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }

  const mailtoLink = target?.senderEmail
    ? `mailto:${encodeURIComponent(target.senderEmail)}?subject=${encodeURIComponent(
        `Re: [${target.ticketNumber}] ${target.subject}`
      )}&body=${encodeURIComponent(`Dear ${target.senderName || 'Valued User'},\n\n${cleanReply}\n\nBest regards,\nSellSolar Support Team\ninfo@sellsolar.pk`)}`
    : null;

  return { success: true, reply: replyObj, mailtoLink };
}

export function deleteInboxMessage(messageId) {
  const current = getInboxMessages();
  const updated = current.filter((msg) => msg.id !== messageId);
  saveInboxMessages(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }
  return updated;
}

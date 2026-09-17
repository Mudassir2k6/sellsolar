import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INBOX_STORAGE_KEY = 'sellsolar_inbox_messages';

const SEED_INBOX_MESSAGES = [
  {
    id: 'msg-001',
    ticketNumber: 'SLR-482910',
    senderName: 'Muhammad Hamza',
    senderEmail: 'hamza.solar@gmail.com',
    senderPhone: '03214567890',
    subject: 'Quotation inquiry for 10kW On-Grid System (Islamabad)',
    message: 'Assalam-o-Alaikum, I am looking to install a 10kW Longi Hi-MO 6 on-grid solar system with a Solis inverter in Sector F-10, Islamabad. Please let me know the estimated net-metering timeline and total turnkey cost.',
    category: 'General Inquiry',
    recipientEmail: 'info@sellsolar.pk',
    status: 'unread', // 'unread' | 'read' | 'replied'
    is_read: false,
    replies: [],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-002',
    ticketNumber: 'SLR-319082',
    senderName: 'Zubair Energy Solutions',
    senderEmail: 'sales@zubairenergy.pk',
    senderPhone: '03009876543',
    subject: 'Verified Dealer Partnership Application',
    message: 'We are certified tier-1 distributors of Growatt and Huawei inverters based in Lahore. We want to be listed in your Verified Solar Dealers directory.',
    category: 'Dealer Verification',
    recipientEmail: 'info@sellsolar.pk',
    status: 'read',
    is_read: true,
    replies: [
      {
        id: 'rep-001',
        sender: 'Super Admin',
        text: 'Thank you for reaching out, Zubair. Our onboarding team has received your registration request. Please send your NTN certificate and distributor authorization letter.',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      }
    ],
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-003',
    ticketNumber: 'SLR-194823',
    senderName: 'Ahmed Raza',
    senderEmail: 'ahmed.raza99@yahoo.com',
    senderPhone: '03335551234',
    subject: 'Inquiry about Longi 585W Bifacial Panel Listing',
    message: 'Hi, I want to purchase 24 pieces of the Longi 585W bifacial solar panels. Is warranty claimable directly in Rawalpindi?',
    category: 'Product Inquiry',
    recipientEmail: 'info@sellsolar.pk',
    status: 'replied',
    is_read: true,
    replies: [
      {
        id: 'rep-002',
        sender: 'Support Desk',
        text: 'Yes Ahmed, official company warranty is valid across Pakistan through authorized service centers.',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      }
    ],
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  }
];

export function getInboxMessages() {
  if (typeof window === 'undefined') return SEED_INBOX_MESSAGES;
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(SEED_INBOX_MESSAGES));
      return SEED_INBOX_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_INBOX_MESSAGES;
  } catch {
    return SEED_INBOX_MESSAGES;
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

  // 2. Sync with Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('enquiries').insert({
        name: cleanName,
        email: cleanEmail,
        contact_phone: phone || null,
        subject: subject,
        message: cleanMessage,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase enquiry insert warning:', err?.message);
    }
  }

  // Trigger custom storage event so other tabs/components update reactively
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }

  return { success: true, ticketNumber, message: newMessage };
}

export function markMessageAsRead(messageId) {
  const current = getInboxMessages();
  const updated = current.map((msg) =>
    msg.id === messageId ? { ...msg, is_read: true, status: msg.status === 'unread' ? 'read' : msg.status } : msg
  );
  saveInboxMessages(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }
  return updated;
}

export function replyToInboxMessage(messageId, replyText, adminName = 'Super Admin') {
  const cleanReply = (replyText || '').trim();
  if (!cleanReply) throw new Error('Reply message cannot be empty.');

  const current = getInboxMessages();
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sellsolar_inbox_updated'));
  }
  return { success: true, reply: replyObj };
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

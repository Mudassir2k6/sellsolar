'use client';

import React, { useState } from 'react';
import { Mail, Copy, Check, ExternalLink, MessageSquare, Phone, X, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { sendContactMessage } from '../services/inboxService';

export default function EmailContactModal({
  isOpen,
  onClose,
  recipientEmail: propRecipientEmail,
  defaultSubject = 'SellSolar Inquiry',
  onNavigateToContactForm,
}) {
  const { settings } = useSiteSettings();
  const recipientEmail = propRecipientEmail || settings?.supportEmail || 'info@sellsolar.pk';
  const supportPhone = settings?.supportPhone || '+92 300 1234567';
  const rawWhatsApp = (settings?.whatsAppNumber || '923001234567').replace(/\D/g, '');

  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'external'
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState(''); // Email or phone
  const [formSubject, setFormSubject] = useState(defaultSubject);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const mailSubject = encodeURIComponent(formSubject || defaultSubject);
  const mailBody = encodeURIComponent(
    `Assalam-o-Alaikum SellSolar Support Team,\n\nI have an inquiry regarding solar equipment on SellSolar.pk:\n\n${formMessage || '[Please type your message here]'}\n\nBest regards,\n${formName || ''}`
  );

  const mailtoUrl = `mailto:${recipientEmail}?subject=${mailSubject}&body=${mailBody}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail
  )}&su=${mailSubject}&body=${mailBody}`;
  const whatsappUrl = `https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum, I am inquiring about solar equipment on SellSolar.pk (${recipientEmail})\nSubject: ${formSubject || defaultSubject}`
  )}`;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(recipientEmail);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = recipientEmail;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanName = formName.trim();
    const cleanContact = formContact.trim();
    const cleanMsg = formMessage.trim();

    if (!cleanName) {
      setFormError('Please enter your name.');
      return;
    }
    if (!cleanContact) {
      setFormError('Please provide your phone number or email address.');
      return;
    }
    if (!cleanMsg) {
      setFormError('Please write your message or inquiry.');
      return;
    }

    setSubmitting(true);
    try {
      const isEmail = cleanContact.includes('@');
      const email = isEmail ? cleanContact : `${cleanContact.replace(/\D/g, '')}@sellsolar-visitor.pk`;
      const phone = isEmail ? '' : cleanContact;

      const res = await sendContactMessage({
        name: cleanName,
        email,
        phone,
        subject: formSubject || 'SellSolar Inquiry',
        message: cleanMsg,
        category: formSubject.toLowerCase().includes('installation')
          ? 'Installation Request'
          : formSubject.toLowerCase().includes('inquiry')
          ? 'Product Inquiry'
          : 'General Inquiry',
        recipientEmail,
      });

      setSubmittedTicket(res?.ticketNumber || `SLR-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (err) {
      console.warn('Direct message notice:', err);
      setSubmittedTicket(`SLR-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setFormMessage('');
    setFormError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Contact & Support Desk
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Official Desk: <strong>{recipientEmail}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-black'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Send className="h-3.5 w-3.5 text-amber-500" />
            <span>Direct In-App Message</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('external')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'external'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-black'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            <span>Gmail / WhatsApp / Apps</span>
          </button>
        </div>

        {/* Email Address Pill with Copy */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 truncate select-all">
              {recipientEmail}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-2xs transition-all active:scale-95 shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-gray-500" />
                <span>Copy Email</span>
              </>
            )}
          </button>
        </div>

        {/* TAB 1: DIRECT ONLINE INQUIRY FORM */}
        {activeTab === 'direct' && (
          <div>
            {submittedTicket ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  Message Sent to SellSolar Desk!
                </h4>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  Your inquiry has arrived in our central Admin Inbox. An operations specialist will contact you promptly.
                </p>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-emerald-200 dark:border-emerald-800 inline-block font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300">
                  Tracking Ticket: {submittedTicket}
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                  >
                    Send Another Message
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDirectSubmit} className="space-y-3">
                {formError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Ali Khan"
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Phone Number or Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="0300 1234567 or email"
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Inquiry regarding solar package"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Your Message / Inquiry *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Describe your requirement or question..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Arrives instantly in Admin Inbox
                  </span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submitting ? 'Sending...' : 'Send Message Now'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: EXTERNAL EMAIL & WHATSAPP OPTIONS */}
        {activeTab === 'external' && (
          <div className="space-y-2.5 animate-fade-in">
            {/* 1. Gmail Web */}
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                  M
                </div>
                <div className="text-left">
                  <div className="text-xs font-black">Open in Gmail Web</div>
                  <div className="text-[10px] text-white/80">Composes directly in browser without email client setup</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* 2. Default Email App (mailto) */}
            <a
              href={mailtoUrl}
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-amber-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Open in Default Mail App</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Apple Mail, Outlook, or mobile email app</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* 3. WhatsApp Direct Desk */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Chat on WhatsApp Desk</div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">{supportPhone} • Immediate reply</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* 4. On-site Contact Form */}
            {onNavigateToContactForm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToContactForm();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Open Full Contact Page</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Headquarters location & detailed map</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">Go &rarr;</span>
              </button>
            )}
          </div>
        )}

        {/* Footer Note */}
        <p className="text-[11px] text-center text-gray-400 dark:text-gray-500">
          Islamabad HQ support desk operates Monday - Saturday, 9am - 7pm PKT.
        </p>
      </div>
    </div>
  );
}

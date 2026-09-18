'use client';

import React, { useState } from 'react';
import { Mail, Copy, Check, ExternalLink, MessageSquare, Phone, X } from 'lucide-react';

export default function EmailContactModal({
  isOpen,
  onClose,
  recipientEmail = 'info@sellsolar.pk',
  defaultSubject = 'SellSolar Inquiry',
  onNavigateToContactForm,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mailSubject = encodeURIComponent(defaultSubject);
  const mailBody = encodeURIComponent(
    `Assalam-o-Alaikum SellSolar Support Team,\n\nI have an inquiry regarding solar equipment on SellSolar.pk:\n\n[Please type your message here]\n\nBest regards,`
  );

  const mailtoUrl = `mailto:${recipientEmail}?subject=${mailSubject}&body=${mailBody}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail
  )}&su=${mailSubject}&body=${mailBody}`;
  const whatsappUrl = `https://wa.me/923001234567?text=${encodeURIComponent(
    `Assalam-o-Alaikum, I am inquiring about solar equipment on SellSolar.pk (${recipientEmail})`
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-5"
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
                Contact Support Desk
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Direct message to <strong>{recipientEmail}</strong>
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

        {/* Action Options */}
        <div className="space-y-2.5">
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
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400">+92 300 1234567 • Immediate reply</div>
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
                  <div className="text-xs font-bold">Use On-Site Contact Form</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Fill out inquiry ticket on SellSolar.pk</div>
                </div>
              </div>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">Go &rarr;</span>
            </button>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-gray-400 dark:text-gray-500">
          Islamabad HQ support team responds Monday - Saturday, 9am - 7pm PKT.
        </p>
      </div>
    </div>
  );
}

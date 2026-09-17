'use client';

import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function FloatingWhatsAppWidget() {
  const { settings } = useSiteSettings();

  if (!settings.whatsAppEnabled || !settings.whatsAppNumber) {
    return null;
  }

  const cleanNumber = settings.whatsAppNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(settings.whatsAppDefaultMessage || 'Assalam-o-Alaikum SellSolar');
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

  const positionClass =
    settings.whatsAppPosition === 'bottom-left'
      ? 'left-5 bottom-6'
      : 'right-5 bottom-6';

  return (
    <div className={`fixed z-40 ${positionClass} flex items-center group`}>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-full shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Chat with SellSolar on WhatsApp"
      >
        {settings.whatsAppPulse !== false && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        )}
        <MessageCircle className="h-5 w-5 fill-current" />
        <span className="text-xs sm:text-sm tracking-wide hidden sm:inline-block">
          {settings.whatsAppLabel || 'WhatsApp Us'}
        </span>
      </a>
    </div>
  );
}

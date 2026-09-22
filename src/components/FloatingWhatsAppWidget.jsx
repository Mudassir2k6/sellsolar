'use client';

import { useSiteSettings } from '../context/SiteSettingsContext';

// Official crisp WhatsApp vector icon
function WhatsAppIcon({ className = 'h-7 w-7' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.72 14.82 12.16 15.87C12.74 16.12 13.19 16.27 13.55 16.38C14.13 16.57 14.67 16.54 15.08 16.48C15.55 16.41 16.52 15.89 16.72 15.33C16.92 14.77 16.92 14.29 16.86 14.19C16.8 14.09 16.64 14.03 16.4 13.91C16.16 13.79 14.98 13.21 14.76 13.13C14.54 13.05 14.38 13.01 14.22 13.25C14.06 13.49 13.6 14.03 13.46 14.19C13.32 14.35 13.18 14.37 12.94 14.25C12.7 14.13 11.93 13.88 11.01 13.06C10.3 12.43 9.81 11.65 9.67 11.41C9.53 11.17 9.66 11.04 9.78 10.92C9.89 10.81 10.03 10.63 10.15 10.49C10.27 10.35 10.31 10.25 10.39 10.09C10.47 9.93 10.43 9.79 10.37 9.67C10.31 9.55 9.85 8.42 9.65 7.96C9.46 7.51 9.27 7.57 9.13 7.56C8.99 7.56 8.83 7.33 8.53 7.33Z" />
    </svg>
  );
}

export default function FloatingWhatsAppWidget() {
  const { settings } = useSiteSettings();

  if (!settings.whatsAppEnabled || !settings.whatsAppNumber) {
    return null;
  }

  const cleanNumber = settings.whatsAppNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(settings.whatsAppDefaultMessage || 'Assalam-o-Alaikum SellSolar');
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

  const isBottomLeft = settings.whatsAppPosition !== 'bottom-right';

  return (
    <div
      className={`fixed z-40 ${
        isBottomLeft
          ? 'left-4 sm:left-6 bottom-18 md:bottom-6'
          : 'right-4 sm:right-6 bottom-18 md:bottom-24'
      } flex items-center group`}
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl shadow-[#25D366]/35 hover:shadow-[#25D366]/50 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/30 dark:border-gray-800/40"
        aria-label="Chat with SellSolar on WhatsApp"
      >
        <WhatsAppIcon className="h-7 w-7 text-white drop-shadow-xs" />

        {/* Hover label tooltip */}
        <span
          className={`pointer-events-none absolute ${
            isBottomLeft
              ? 'left-full ml-3 group-hover:translate-x-0 -translate-x-1'
              : 'right-full mr-3 group-hover:translate-x-0 translate-x-1'
          } whitespace-nowrap rounded-xl bg-gray-900/90 dark:bg-gray-800/95 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100`}
        >
          {settings.whatsAppLabel || 'Chat on WhatsApp'}
        </span>
      </a>
    </div>
  );
}


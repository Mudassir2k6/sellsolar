'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SITE_SETTINGS_KEY = 'sellsolar_site_settings';

export const DEFAULT_SITE_SETTINGS = {
  // Brand & Headings
  siteTitle: 'SellSolar.pk',
  tagline: "Pakistan's #1 Solar Marketplace & Daily Price Benchmark",
  heroHeading: 'Buy & Sell Solar Equipment at Live Market Rates',
  heroSubheading: 'Compare verified solar panel, inverter & battery listings across Lahore, Karachi, Islamabad & 30+ cities in Pakistan.',
  logoUrl: '',
  logoText: 'SellSolar',
  faviconUrl: '/favicon.ico',
  ogImageUrl: '/og-image.jpg',

  // Top Announcement Bar
  topBannerEnabled: true,
  topBannerText: "Pakistan's #1 Solar Marketplace — Verified Dealers & Daily Price Benchmark",
  topBannerLink: '/prices',

  // Footer & Content
  footerAboutText: "Pakistan's leading online marketplace dedicated exclusively to solar equipment, verified dealer inventories, and live market pricing benchmarks.",
  copyrightText: '© 2026 SellSolar Pakistan. All rights reserved.',

  // Contact Info
  supportEmail: 'info@sellsolar.pk',
  salesEmail: 'sales@sellsolar.pk',
  supportPhone: '+92 300 1234567',
  headOfficeAddress: 'Sector G-7, Blue Area, Islamabad, Pakistan',

  // WhatsApp Configuration
  whatsAppEnabled: true,
  whatsAppNumber: '923001234567',
  whatsAppDisplayNumber: '+92 300 1234567',
  whatsAppDefaultMessage: 'Assalam-o-Alaikum, I am inquiring about solar equipment on SellSolar.pk',
  whatsAppPosition: 'bottom-right', // 'bottom-right' | 'bottom-left'
  whatsAppLabel: 'WhatsApp Us',
  whatsAppPulse: true,

  // Social Media Links
  socialLinks: {
    facebook: 'https://facebook.com/sellsolar.pk',
    twitter: 'https://twitter.com/sellsolarpk',
    instagram: 'https://instagram.com/sellsolar.pk',
    youtube: 'https://youtube.com/@sellsolarpk',
    linkedin: 'https://linkedin.com/company/sellsolarpk',
    tiktok: 'https://tiktok.com/@sellsolarpk',
    whatsappCommunity: 'https://chat.whatsapp.com/sellsolarpk',
  },

  // Custom Pages managed from Admin
  customPages: [],
};

export const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SITE_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          socialLinks: {
            ...prev.socialLinks,
            ...(parsed.socialLinks || {}),
          },
        }));
      }
    } catch (e) {
      console.warn('Error reading site settings:', e);
    }
  }, []);

  const updateSiteSettings = useCallback((newPartialSettings) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...newPartialSettings,
        socialLinks: {
          ...prev.socialLinks,
          ...(newPartialSettings.socialLinks || {}),
        },
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('sellsolar_settings_updated', { detail: updated }));
        } catch (err) {
          console.error('Error saving site settings:', err);
        }
      }

      return updated;
    });
  }, []);

  const resetToDefaultSettings = useCallback(() => {
    setSettings(DEFAULT_SITE_SETTINGS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SITE_SETTINGS_KEY);
        window.dispatchEvent(new CustomEvent('sellsolar_settings_updated', { detail: DEFAULT_SITE_SETTINGS }));
      } catch (err) {
        console.error('Error resetting site settings:', err);
      }
    }
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        updateSiteSettings,
        resetToDefaultSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    // Return safe fallback if used outside provider
    return {
      settings: DEFAULT_SITE_SETTINGS,
      updateSiteSettings: () => {},
      resetToDefaultSettings: () => {},
    };
  }
  return ctx;
}

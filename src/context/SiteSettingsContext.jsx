'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SELL_SOLAR_PROMO_IMAGE, TURNKEY_INSTALL_PROMO_IMAGE } from '../utils/solarImages';
import { DEFAULT_ADVERTISEMENT_SETTINGS, normalizeAdvertisementSettings } from '../lib/advertisementDefaults';
import {
  DEFAULT_WHATSAPP_NUMBER,
  DEFAULT_WHATSAPP_DISPLAY,
  DEFAULT_SUPPORT_PHONE,
  isPlaceholderWhatsAppNumber,
  resolveWhatsAppNumber,
} from '../lib/whatsapp';

const SITE_SETTINGS_KEY = 'sellsolar_site_settings';

export const DEFAULT_SITE_SETTINGS = {
  // Brand & Headings
  siteTitle: 'SellSolar.pk',
  tagline: "Pakistan's #1 Used Solar Marketplace — Buy and Sell Solar Panels, Inverters, Batteries and Systems",
  headerTagline: "Pakistan's #1 Used Solar Marketplace",
  heroHeading: 'Buy & Sell Solar Equipment at Live Market Rates',
  heroSubheading: 'Compare verified solar panel, inverter & battery listings across Lahore, Karachi, Islamabad & 30+ cities in Pakistan.',
  logoUrl: '',
  logoText: 'SellSolar',
  faviconUrl: '/favicon.ico',
  ogImageUrl: '/og-image.jpg',

  // Top Announcement Bar
  topBannerEnabled: true,
  topBannerText: "Pakistan's #1 Used Solar Marketplace — Buy and Sell Solar Panels, Inverters, Batteries and Systems",
  topBannerLink: '/prices',

  // Footer & Content
  footerAboutText: "Pakistan's #1 Used Solar Marketplace. Buy and sell used and new solar panels, inverters, batteries, and complete systems with total confidence.",
  copyrightText: '© 2026 SellSolar Pakistan. All rights reserved.',

  // Contact Info
  supportEmail: 'info@sellsolar.pk',
  salesEmail: 'sales@sellsolar.pk',
  supportPhone: DEFAULT_SUPPORT_PHONE,
  headOfficeAddress: 'Sector G-7, Blue Area, Islamabad, Pakistan',

  // WhatsApp Configuration
  whatsAppEnabled: true,
  whatsAppNumber: DEFAULT_WHATSAPP_NUMBER,
  whatsAppDisplayNumber: DEFAULT_WHATSAPP_DISPLAY,
  whatsAppDefaultMessage: 'Assalam-o-Alaikum, I am inquiring about solar equipment on SellSolar.pk',
  whatsAppPosition: 'bottom-right', // 'bottom-right' | 'bottom-left'
  whatsAppLabel: 'WhatsApp Us',
  whatsAppPulse: true,

  // Social Media Links
  socialLinks: {
    facebook: 'https://www.facebook.com/profile.php?id=61595656010103',
    twitter: 'https://twitter.com/sellsolarpk',
    instagram: 'https://instagram.com/sellsolar.pk',
    youtube: 'https://youtube.com/@sellsolarpk',
    linkedin: 'https://linkedin.com/company/sellsolarpk',
    tiktok: 'https://tiktok.com/@sellsolarpk',
    whatsappCommunity: 'https://chat.whatsapp.com/sellsolarpk',
  },

  // Custom Pages managed from Admin
  customPages: [],

  // Dynamic Visual CMS content for Home Page (Cards, Hero, Text, Images)
  homePageCms: {
    hero: {
      badgeText: "Pakistan's #1 Solar Marketplace",
      heading: 'Buy & Sell Solar Equipment at Live Market Rates',
      subheading: 'Compare verified solar panel, inverter & battery listings across Lahore, Karachi, Islamabad & 30+ cities in Pakistan.',
      searchPlaceholder: 'Search panels, inverters, batteries or cities (e.g. Longi, Solis, Lahore)...',
      primaryCtaText: 'Post a Free Ad',
      primaryCtaLink: 'post-ad',
      secondaryCtaText: "Today's Solar Rates",
      secondaryCtaLink: 'prices',
      heroImageUrl: '',
    },
    cards: [
      {
        id: 'card-sell-solar',
        badge: 'Post Solar Ad',
        badgeColor: 'amber',
        icon: 'Sun',
        title: 'Sell Your Solar Equipment on SellSolar',
        description: 'Post your solar panels, inverters, batteries or complete setups and connect directly with genuine buyers across Pakistan.',
        points: [
          'Post your ad in 30 seconds for FREE',
          'Direct inquiries via WhatsApp and phone calls',
          '10,000+ monthly active solar buyers'
        ],
        ctaText: 'Post an Ad — Free',
        ctaLink: 'post-ad',
        imageUrl: SELL_SOLAR_PROMO_IMAGE,
        enabled: true,
      },
      {
        id: 'card-turnkey-install',
        badge: 'EPC & Net-Metering',
        badgeColor: 'emerald',
        icon: 'Wrench',
        title: 'SellSolar Turnkey Installation Service',
        description: 'Get complete on-grid, hybrid or off-grid solar systems engineered, installed and net-metered with Tier-1 warranty equipment.',
        points: [
          'Tier-1 25-yr warranty panels & hybrid inverters',
          'WAPDA / K-Electric Net-Metering license processing',
          'Free rooftop engineering survey & kW sizing'
        ],
        ctaText: 'Request Installation',
        ctaLink: 'installation',
        imageUrl: TURNKEY_INSTALL_PROMO_IMAGE,
        enabled: true,
      }
    ],
    calculatorBanner: {
      enabled: true,
      badge: 'Instant System Sizing Tool',
      title: 'Calculate Your Solar Load in 30 Seconds',
      description: 'Enter your Fans, LED Bulbs, Inverter ACs, Water Pumps, Iron & Fridge. Find your required kW system size, panel count, and battery backup.',
      calculateButtonText: 'Calculate Here (Instant kW)',
      fullPageButtonText: 'Full Page'
    },
    trustMetrics: [
      { id: 'm1', label: 'Verified Dealers', value: '250+', icon: 'ShieldCheck' },
      { id: 'm2', label: 'Daily Benchmarks', value: '100% Live', icon: 'TrendingUp' },
      { id: 'm3', label: 'Equipment Listed', value: '1,500+', icon: 'Sun' },
      { id: 'm4', label: 'Cities Covered', value: '35+ Cities', icon: 'MapPin' },
    ]
  },

  // Per-page visual custom content overrides
  pagesCmsMap: {},

  // Homepage scroll + static ads & packages (admin-editable)
  advertisementSettings: DEFAULT_ADVERTISEMENT_SETTINGS,
};

export const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(SITE_SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          let adSettings = normalizeAdvertisementSettings(
            parsed.advertisementSettings || undefined
          );
          // Local dev: restore marquee if an old localStorage snapshot turned ads off
          if (process.env.NODE_ENV === 'development') {
            const saved = parsed.advertisementSettings || {};
            const marqueeOff =
              adSettings.enabled === false ||
              saved.scrollEnabled === false ||
              saved.staticEnabled === false;
            if (marqueeOff) {
              adSettings = normalizeAdvertisementSettings({
                ...saved,
                enabled: true,
                scrollEnabled: true,
                staticEnabled: true,
              });
            }
          }
          const mergedWhatsAppNumber = resolveWhatsAppNumber(parsed.whatsAppNumber);
          const mergedSupportPhone = isPlaceholderWhatsAppNumber(parsed.supportPhone)
            ? DEFAULT_SUPPORT_PHONE
            : (parsed.supportPhone || DEFAULT_SUPPORT_PHONE);
          const mergedDisplay = isPlaceholderWhatsAppNumber(parsed.whatsAppDisplayNumber)
            ? DEFAULT_WHATSAPP_DISPLAY
            : (parsed.whatsAppDisplayNumber || DEFAULT_WHATSAPP_DISPLAY);

          setSettings((prev) => ({
            ...prev,
            ...parsed,
            supportPhone: mergedSupportPhone,
            whatsAppNumber: mergedWhatsAppNumber,
            whatsAppDisplayNumber: mergedDisplay,
            socialLinks: {
              ...prev.socialLinks,
              ...(parsed.socialLinks || {}),
              facebook: (parsed.socialLinks?.facebook && !parsed.socialLinks.facebook.includes('sellsolar.pk'))
                ? parsed.socialLinks.facebook
                : 'https://www.facebook.com/profile.php?id=61595656010103',
            },
            homePageCms: {
              ...prev.homePageCms,
              ...(parsed.homePageCms || {}),
              hero: {
                ...prev.homePageCms.hero,
                ...(parsed.homePageCms?.hero || {}),
              },
              cards: Array.isArray(parsed.homePageCms?.cards) && parsed.homePageCms.cards.length > 0
                ? parsed.homePageCms.cards.map((c) => {
                    if (!c.imageUrl || c.imageUrl.includes('images.unsplash.com')) {
                      return {
                        ...c,
                        imageUrl: (c.id === 'card-turnkey-install' || c.ctaLink === 'installation')
                          ? TURNKEY_INSTALL_PROMO_IMAGE
                          : SELL_SOLAR_PROMO_IMAGE
                      };
                    }
                    return c;
                  })
                : prev.homePageCms.cards,
              calculatorBanner: {
                ...prev.homePageCms.calculatorBanner,
                ...(parsed.homePageCms?.calculatorBanner || {}),
              },
              trustMetrics: Array.isArray(parsed.homePageCms?.trustMetrics) && parsed.homePageCms.trustMetrics.length > 0
                ? parsed.homePageCms.trustMetrics
                : prev.homePageCms.trustMetrics,
            },
            pagesCmsMap: {
              ...prev.pagesCmsMap,
              ...(parsed.pagesCmsMap || {}),
            },
            advertisementSettings: adSettings,
          }));
        }
      } catch (e) {
        console.warn('Error reading site settings:', e);
      }
    }
  }, []);

  const updateSiteSettings = useCallback((newPartialSettings) => {
    setSettings((prev) => {
      const nextPartial = { ...newPartialSettings };
      if (Object.prototype.hasOwnProperty.call(nextPartial, 'whatsAppNumber')) {
        nextPartial.whatsAppNumber = resolveWhatsAppNumber(nextPartial.whatsAppNumber);
      }
      if (Object.prototype.hasOwnProperty.call(nextPartial, 'supportPhone') && isPlaceholderWhatsAppNumber(nextPartial.supportPhone)) {
        nextPartial.supportPhone = DEFAULT_SUPPORT_PHONE;
      }
      if (Object.prototype.hasOwnProperty.call(nextPartial, 'whatsAppDisplayNumber') && isPlaceholderWhatsAppNumber(nextPartial.whatsAppDisplayNumber)) {
        nextPartial.whatsAppDisplayNumber = DEFAULT_WHATSAPP_DISPLAY;
      }

      const updated = {
        ...prev,
        ...nextPartial,
        whatsAppNumber: resolveWhatsAppNumber(
          Object.prototype.hasOwnProperty.call(nextPartial, 'whatsAppNumber')
            ? nextPartial.whatsAppNumber
            : prev.whatsAppNumber
        ),
        socialLinks: {
          ...prev.socialLinks,
          ...(nextPartial.socialLinks || {}),
        },
        homePageCms: nextPartial.homePageCms ? {
          ...prev.homePageCms,
          ...nextPartial.homePageCms,
          hero: {
            ...prev.homePageCms.hero,
            ...(nextPartial.homePageCms?.hero || {}),
          },
          cards: Array.isArray(nextPartial.homePageCms?.cards)
            ? nextPartial.homePageCms.cards
            : prev.homePageCms.cards,
          calculatorBanner: {
            ...prev.homePageCms.calculatorBanner,
            ...(nextPartial.homePageCms?.calculatorBanner || {}),
          },
          trustMetrics: Array.isArray(nextPartial.homePageCms?.trustMetrics)
            ? nextPartial.homePageCms.trustMetrics
            : prev.homePageCms.trustMetrics,
        } : prev.homePageCms,
        pagesCmsMap: nextPartial.pagesCmsMap ? {
          ...prev.pagesCmsMap,
          ...nextPartial.pagesCmsMap,
        } : prev.pagesCmsMap,
        advertisementSettings: nextPartial.advertisementSettings
          ? normalizeAdvertisementSettings({
              ...prev.advertisementSettings,
              ...nextPartial.advertisementSettings,
            })
          : prev.advertisementSettings,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(updated));
          // Keep legacy key in sync for older listeners
          localStorage.setItem('sellsolar_settings', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('sellsolar_settings_updated', { detail: updated }));
        } catch (err) {
          console.error('Error saving site settings:', err);
        }
      }

      return updated;
    });
  }, []);

  const updateHomePageCms = useCallback((partialHomeCms) => {
    updateSiteSettings({
      homePageCms: partialHomeCms
    });
  }, [updateSiteSettings]);

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
        updateHomePageCms,
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
      updateHomePageCms: () => {},
      resetToDefaultSettings: () => {},
    };
  }
  return ctx;
}

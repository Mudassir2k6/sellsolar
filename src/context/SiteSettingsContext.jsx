'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SELL_SOLAR_PROMO_IMAGE, TURNKEY_INSTALL_PROMO_IMAGE } from '../utils/solarImages';

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

  // Dynamic Visual CMS content for Home Page (Cards, Hero, Text, Images)
  homePageCms: {
    hero: {
      badgeText: "⚡ Pakistan's #1 Solar Directory",
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
  pagesCmsMap: {}
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
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            socialLinks: {
              ...prev.socialLinks,
              ...(parsed.socialLinks || {}),
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
            }
          }));
        }
      } catch (e) {
        console.warn('Error reading site settings:', e);
      }
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
        homePageCms: newPartialSettings.homePageCms ? {
          ...prev.homePageCms,
          ...newPartialSettings.homePageCms,
          hero: {
            ...prev.homePageCms.hero,
            ...(newPartialSettings.homePageCms?.hero || {}),
          },
          cards: Array.isArray(newPartialSettings.homePageCms?.cards)
            ? newPartialSettings.homePageCms.cards
            : prev.homePageCms.cards,
          calculatorBanner: {
            ...prev.homePageCms.calculatorBanner,
            ...(newPartialSettings.homePageCms?.calculatorBanner || {}),
          },
          trustMetrics: Array.isArray(newPartialSettings.homePageCms?.trustMetrics)
            ? newPartialSettings.homePageCms.trustMetrics
            : prev.homePageCms.trustMetrics,
        } : prev.homePageCms,
        pagesCmsMap: newPartialSettings.pagesCmsMap ? {
          ...prev.pagesCmsMap,
          ...newPartialSettings.pagesCmsMap,
        } : prev.pagesCmsMap,
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

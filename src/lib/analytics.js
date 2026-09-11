// Google Analytics 4 (GA4) Integration & SEO Diagnostics

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) ||
  (typeof window !== 'undefined' && window.ENV_GA_ID) ||
  'G-SELLSOLAR01';

/**
 * Ensures gtag is safely available on window
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // Managed manually for Single Page Application
      cookie_domain: 'auto',
      cookie_flags: 'SameSite=None;Secure',
    });
  }
}

/**
 * Track SPA Pageviews for SEO diagnostics and traffic attribution
 * @param {string} path - current path e.g. /prices, /calculator
 * @param {string} title - page title
 */
export function trackPageView(path = '/', title = document.title) {
  if (typeof window === 'undefined') return;

  try {
    initAnalytics();
    if (typeof window.gtag === 'function') {
      const pageLocation = `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
      window.gtag('event', 'page_view', {
        page_title: title,
        page_location: pageLocation,
        page_path: path,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  } catch (err) {
    // Non-blocking: analytics should never disrupt application UX
    console.debug('Analytics pageview log error:', err);
  }
}

/**
 * Track custom SEO & engagement events (e.g. search, quote request, load calculation)
 * @param {string} eventName
 * @param {object} params
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  try {
    initAnalytics();
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  } catch (err) {
    console.debug('Analytics event log error:', err);
  }
}

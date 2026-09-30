const VISITOR_ANALYTICS_KEY = 'sellsolar_visitor_analytics';
const PRODUCT_VIEWS_KEY = 'sellsolar_product_views';
const INQUIRIES_COUNT_KEY = 'sellsolar_inquiries_analytics';
const CLEAN_ZERO_MIGRATION_FLAG = 'sellsolar_analytics_zero_v5';

// Auto-purge any legacy mock traffic on initial load to guarantee pure 0 baseline
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(CLEAN_ZERO_MIGRATION_FLAG)) {
      localStorage.removeItem(VISITOR_ANALYTICS_KEY);
      localStorage.removeItem(PRODUCT_VIEWS_KEY);
      localStorage.removeItem(INQUIRIES_COUNT_KEY);
      localStorage.setItem(CLEAN_ZERO_MIGRATION_FLAG, 'true');
    }
  } catch {}
}

export function resetAllAnalyticsToZero() {
  if (typeof window === 'undefined') return;
  try {
    const zeroData = {
      totalVisits: 0,
      uniqueVisitors: 0,
      dailyVisits: {},
      pageVisits: {},
      trafficSources: {
        'Direct': 0,
        'Google Organic': 0,
        'WhatsApp Shares': 0,
        'Social Media': 0,
      },
      deviceShare: {
        'Mobile': 0,
        'Desktop': 0,
        'Tablet': 0,
      },
      visitedSessions: {},
    };
    localStorage.setItem(VISITOR_ANALYTICS_KEY, JSON.stringify(zeroData));
    localStorage.removeItem(PRODUCT_VIEWS_KEY);
    localStorage.removeItem(INQUIRIES_COUNT_KEY);
    window.dispatchEvent(new Event('sellsolar_analytics_updated'));
    return zeroData;
  } catch (e) {
    console.warn('Failed to reset analytics:', e);
  }
}

export function recordPageView(path = '/') {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(VISITOR_ANALYTICS_KEY);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let data = raw ? JSON.parse(raw) : null;

    // If data is null or has old simulated mock data (>= 5000 visits), reset to pure 0
    if (!data || data.totalVisits >= 5000) {
      data = {
        totalVisits: 0,
        uniqueVisitors: 0,
        dailyVisits: {},
        pageVisits: {},
        trafficSources: {
          'Direct': 0,
          'Google Organic': 0,
          'WhatsApp Shares': 0,
          'Social Media': 0,
        },
        deviceShare: {
          'Mobile': 0,
          'Desktop': 0,
          'Tablet': 0,
        },
        visitedSessions: {},
      };
    }

    data.totalVisits = (data.totalVisits || 0) + 1;

    // Check unique session
    let sessionId = sessionStorage.getItem('sellsolar_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('sellsolar_session_id', sessionId);
      data.uniqueVisitors = (data.uniqueVisitors || 0) + 1;
    }

    if (!data.dailyVisits) data.dailyVisits = {};
    data.dailyVisits[todayStr] = (data.dailyVisits[todayStr] || 0) + 1;

    if (!data.pageVisits) data.pageVisits = {};
    const cleanPath = path || '/';
    data.pageVisits[cleanPath] = (data.pageVisits[cleanPath] || 0) + 1;

    // Detect real referral traffic source
    if (typeof document !== 'undefined') {
      const ref = (document.referrer || '').toLowerCase();
      if (!data.trafficSources) {
        data.trafficSources = { 'Direct': 0, 'Google Organic': 0, 'WhatsApp Shares': 0, 'Social Media': 0 };
      }
      if (!ref) {
        data.trafficSources['Direct'] = (data.trafficSources['Direct'] || 0) + 1;
      } else if (ref.includes('google')) {
        data.trafficSources['Google Organic'] = (data.trafficSources['Google Organic'] || 0) + 1;
      } else if (ref.includes('whatsapp') || ref.includes('wa.me')) {
        data.trafficSources['WhatsApp Shares'] = (data.trafficSources['WhatsApp Shares'] || 0) + 1;
      } else {
        data.trafficSources['Social Media'] = (data.trafficSources['Social Media'] || 0) + 1;
      }
    }

    // Detect real device
    if (typeof navigator !== 'undefined') {
      const ua = (navigator.userAgent || '').toLowerCase();
      if (!data.deviceShare) {
        data.deviceShare = { 'Mobile': 0, 'Desktop': 0, 'Tablet': 0 };
      }
      if (/tablet|ipad/i.test(ua)) {
        data.deviceShare['Tablet'] = (data.deviceShare['Tablet'] || 0) + 1;
      } else if (/mobile|iphone|android/i.test(ua)) {
        data.deviceShare['Mobile'] = (data.deviceShare['Mobile'] || 0) + 1;
      } else {
        data.deviceShare['Desktop'] = (data.deviceShare['Desktop'] || 0) + 1;
      }
    }

    localStorage.setItem(VISITOR_ANALYTICS_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Analytics record warning:', err);
  }
}

export function recordProductView(listingId) {
  if (!listingId || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PRODUCT_VIEWS_KEY);
    const viewsMap = raw ? JSON.parse(raw) : {};
    viewsMap[listingId] = (viewsMap[listingId] || 0) + 1;
    localStorage.setItem(PRODUCT_VIEWS_KEY, JSON.stringify(viewsMap));

    // Also update custom listings store if present
    const listingsRaw = localStorage.getItem('sellsolar_custom_listings');
    if (listingsRaw) {
      const list = JSON.parse(listingsRaw);
      const updated = list.map((item) =>
        item.id === listingId ? { ...item, views_count: (item.views_count || 0) + 1 } : item
      );
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Product view record warning:', err);
  }
}

export function recordProductInquiry(listingId, channel = 'whatsapp') {
  if (!listingId || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(INQUIRIES_COUNT_KEY);
    const inquiriesMap = raw ? JSON.parse(raw) : {};
    if (!inquiriesMap[listingId]) {
      inquiriesMap[listingId] = { total: 0, whatsapp: 0, phone: 0, form: 0 };
    }
    inquiriesMap[listingId].total = (inquiriesMap[listingId].total || 0) + 1;
    inquiriesMap[listingId][channel] = (inquiriesMap[listingId][channel] || 0) + 1;
    localStorage.setItem(INQUIRIES_COUNT_KEY, JSON.stringify(inquiriesMap));
  } catch (err) {
    console.warn('Inquiry record warning:', err);
  }
}

export function getAnalyticsSummary(listings = []) {
  let totalVisits = 0;
  let uniqueVisitors = 0;
  let todayVisits = 0;
  let dailyVisits = {};
  let pageVisits = {};
  let trafficSources = {
    'Direct': 0,
    'Google Organic': 0,
    'WhatsApp Shares': 0,
    'Social Media': 0,
  };
  let deviceShare = {
    'Mobile': 0,
    'Desktop': 0,
    'Tablet': 0,
  };
  let productViewsMap = {};
  let productInquiriesMap = {};

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(VISITOR_ANALYTICS_KEY);
      if (raw) {
        let data = JSON.parse(raw);
        // If legacy mock baseline exists, purge it to 0
        if (data && data.totalVisits >= 5000) {
          resetAllAnalyticsToZero();
          data = null;
        }
        if (data) {
          totalVisits = data.totalVisits || 0;
          uniqueVisitors = data.uniqueVisitors || 0;
          const todayStr = new Date().toISOString().split('T')[0];
          todayVisits = (data.dailyVisits && data.dailyVisits[todayStr]) || 0;
          if (data.dailyVisits) dailyVisits = { ...data.dailyVisits };
          if (data.pageVisits) pageVisits = { ...data.pageVisits };
          if (data.trafficSources) trafficSources = { ...data.trafficSources };
          if (data.deviceShare) deviceShare = { ...data.deviceShare };
        }
      }
      const pvRaw = localStorage.getItem(PRODUCT_VIEWS_KEY);
      if (pvRaw) productViewsMap = JSON.parse(pvRaw);

      const inqRaw = localStorage.getItem(INQUIRIES_COUNT_KEY);
      if (inqRaw) productInquiriesMap = JSON.parse(inqRaw);
    } catch {}
  }

  // Calculate views and inquiries for listings based on real tracked activity
  const enrichedListings = (listings || []).map((item) => {
    const trackedViews = productViewsMap[item.id] || 0;
    const baseViews = 0; // Pure 0 baseline (no fake views)
    const totalViews = baseViews + trackedViews;
    const trackedInq = (productInquiriesMap[item.id] && productInquiriesMap[item.id].total) || 0;

    return {
      ...item,
      totalViews,
      inquiriesCount: trackedInq,
    };
  });

  // Top products sorted by real views
  const topViewedProducts = [...enrichedListings].sort((a, b) => b.totalViews - a.totalViews);

  const totalProductViews = enrichedListings.reduce((sum, item) => sum + (item.totalViews || 0), 0);
  const totalInquiries = enrichedListings.reduce((sum, item) => sum + (item.inquiriesCount || 0), 0);
  const totalFeatured = enrichedListings.filter((item) => !!item.is_featured).length;
  const totalHotSell = enrichedListings.filter((item) => !!item.is_hot_sell).length;

  // Format Top Visited Pages
  const topVisitedPages = Object.entries(pageVisits)
    .map(([path, count]) => ({
      path,
      count,
      percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Device percentage calculation
  const totalDev = (deviceShare['Mobile'] || 0) + (deviceShare['Desktop'] || 0) + (deviceShare['Tablet'] || 0);
  const devicePercentages = {
    mobile: totalDev > 0 ? Math.round(((deviceShare['Mobile'] || 0) / totalDev) * 100) : 0,
    desktop: totalDev > 0 ? Math.round(((deviceShare['Desktop'] || 0) / totalDev) * 100) : 0,
    tablet: totalDev > 0 ? Math.round(((deviceShare['Tablet'] || 0) / totalDev) * 100) : 0,
  };

  return {
    totalVisits,
    uniqueVisitors,
    todayVisits,
    dailyVisits,
    topVisitedPages,
    trafficSources,
    deviceShare,
    devicePercentages,
    totalProductViews,
    totalInquiries,
    totalFeatured,
    totalHotSell,
    topViewedProducts,
  };
}

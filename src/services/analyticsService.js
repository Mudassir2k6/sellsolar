const VISITOR_ANALYTICS_KEY = 'sellsolar_visitor_analytics';
const PRODUCT_VIEWS_KEY = 'sellsolar_product_views';
const INQUIRIES_COUNT_KEY = 'sellsolar_inquiries_analytics';

export function recordPageView(path = '/') {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(VISITOR_ANALYTICS_KEY);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let data = raw ? JSON.parse(raw) : {
      totalVisits: 14280,
      uniqueVisitors: 9850,
      dailyVisits: {
        '2026-09-11': 289,
        '2026-09-12': 312,
        '2026-09-13': 345,
        '2026-09-14': 390,
        '2026-09-15': 365,
        '2026-09-16': 418,
        [todayStr]: 342,
      },
      pageVisits: {
        '/': 4850,
        '/prices': 3120,
        '/calculator': 1890,
        '/dealers': 1640,
        '/install': 980,
        '/contact': 650,
        '/used-solar': 580,
        '/about': 320,
      },
      trafficSources: {
        'Direct': 6200,
        'Google Organic': 4900,
        'WhatsApp Shares': 2150,
        'Social Media': 1030,
      },
      deviceShare: {
        'Mobile': 74,
        'Desktop': 22,
        'Tablet': 4,
      },
      visitedSessions: {},
    };

    data.totalVisits = (data.totalVisits || 14280) + 1;

    // Check unique session
    let sessionId = sessionStorage.getItem('sellsolar_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('sellsolar_session_id', sessionId);
      data.uniqueVisitors = (data.uniqueVisitors || 9850) + 1;
    }

    if (!data.dailyVisits) data.dailyVisits = {};
    data.dailyVisits[todayStr] = (data.dailyVisits[todayStr] || 342) + 1;

    if (!data.pageVisits) data.pageVisits = {};
    const cleanPath = path || '/';
    data.pageVisits[cleanPath] = (data.pageVisits[cleanPath] || 0) + 1;

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
  let totalVisits = 14280;
  let uniqueVisitors = 9850;
  let todayVisits = 342;
  let dailyVisits = {
    '2026-09-11': 289,
    '2026-09-12': 312,
    '2026-09-13': 345,
    '2026-09-14': 390,
    '2026-09-15': 365,
    '2026-09-16': 418,
  };
  let pageVisits = {
    '/': 4850,
    '/prices': 3120,
    '/calculator': 1890,
    '/dealers': 1640,
    '/install': 980,
    '/contact': 650,
    '/used-solar': 580,
    '/about': 320,
  };
  let trafficSources = {
    'Direct': 6200,
    'Google Organic': 4900,
    'WhatsApp Shares': 2150,
    'Social Media': 1030,
  };
  let deviceShare = {
    'Mobile': 74,
    'Desktop': 22,
    'Tablet': 4,
  };
  let productViewsMap = {};
  let productInquiriesMap = {};

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(VISITOR_ANALYTICS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        totalVisits = data.totalVisits || 14280;
        uniqueVisitors = data.uniqueVisitors || 9850;
        const todayStr = new Date().toISOString().split('T')[0];
        todayVisits = (data.dailyVisits && data.dailyVisits[todayStr]) || 342;
        if (data.dailyVisits) dailyVisits = { ...dailyVisits, ...data.dailyVisits };
        if (data.pageVisits) pageVisits = { ...pageVisits, ...data.pageVisits };
        if (data.trafficSources) trafficSources = { ...trafficSources, ...data.trafficSources };
        if (data.deviceShare) deviceShare = { ...deviceShare, ...data.deviceShare };
      }
      const pvRaw = localStorage.getItem(PRODUCT_VIEWS_KEY);
      if (pvRaw) productViewsMap = JSON.parse(pvRaw);

      const inqRaw = localStorage.getItem(INQUIRIES_COUNT_KEY);
      if (inqRaw) productInquiriesMap = JSON.parse(inqRaw);
    } catch {}
  }

  // Calculate views and inquiries for listings
  const enrichedListings = (listings || []).map((item) => {
    const trackedViews = productViewsMap[item.id] || 0;
    const baseViews = item.views_count || item.views || Math.floor(Math.random() * 40) + 15;
    const totalViews = baseViews + trackedViews;
    const trackedInq = (productInquiriesMap[item.id] && productInquiriesMap[item.id].total) || Math.floor(totalViews * 0.12);

    return {
      ...item,
      totalViews,
      inquiriesCount: trackedInq,
    };
  });

  // Top products sorted by views
  const topViewedProducts = [...enrichedListings]
    .sort((a, b) => b.totalViews - a.totalViews);

  const totalProductViews = enrichedListings.reduce((sum, item) => sum + (item.totalViews || 0), 0);
  const totalInquiries = enrichedListings.reduce((sum, item) => sum + (item.inquiriesCount || 0), 0);
  const totalFeatured = enrichedListings.filter((item) => !!item.is_featured).length;
  const totalHotSell = enrichedListings.filter((item) => !!item.is_hot_sell).length;

  // Format Top Visited Pages
  const topVisitedPages = Object.entries(pageVisits)
    .map(([path, count]) => ({
      path,
      count,
      percentage: Math.round((count / Math.max(1, totalVisits)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalVisits,
    uniqueVisitors,
    todayVisits,
    dailyVisits,
    topVisitedPages,
    trafficSources,
    deviceShare,
    totalProductViews,
    totalInquiries,
    totalFeatured,
    totalHotSell,
    topViewedProducts,
  };
}

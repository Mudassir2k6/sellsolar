
export function getDateRange(filterType = 'all', customStart = null, customEnd = null) {
  const now = new Date();
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatYMD(now);

  if (filterType === 'today') {
    return { start: todayStr, end: todayStr, label: 'Today (' + now.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ')' };
  }

  if (filterType === 'last_day' || filterType === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yStr = formatYMD(y);
    return { start: yStr, end: yStr, label: 'Yesterday (' + y.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ')' };
  }

  if (filterType === 'last_week' || filterType === '7_days') {
    const w = new Date(now);
    w.setDate(w.getDate() - 6);
    return {
      start: formatYMD(w),
      end: todayStr,
      label: 'Last 7 Days (' + w.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ' – ' + now.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ')',
    };
  }

  if (filterType === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: formatYMD(firstDay),
      end: todayStr,
      label: 'This Month (' + now.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }) + ')',
    };
  }

  if (filterType === 'last_month') {
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      start: formatYMD(firstDayLastMonth),
      end: formatYMD(lastDayLastMonth),
      label: 'Last Month (' + firstDayLastMonth.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }) + ')',
    };
  }

  if (filterType === 'custom' && customStart && customEnd) {
    return {
      start: customStart,
      end: customEnd,
      label: `Custom (${customStart} to ${customEnd})`,
    };
  }

  return { start: null, end: null, label: 'All Time' };
}

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
    let detectedSource = 'Direct';
    if (typeof document !== 'undefined') {
      const ref = (document.referrer || '').toLowerCase();
      if (!data.trafficSources) {
        data.trafficSources = { 'Direct': 0, 'Google Organic': 0, 'WhatsApp Shares': 0, 'Social Media': 0 };
      }
      if (!ref) {
        detectedSource = 'Direct';
      } else if (ref.includes('google')) {
        detectedSource = 'Google Organic';
      } else if (ref.includes('whatsapp') || ref.includes('wa.me')) {
        detectedSource = 'WhatsApp Shares';
      } else {
        detectedSource = 'Social Media';
      }
      data.trafficSources[detectedSource] = (data.trafficSources[detectedSource] || 0) + 1;
    }

    // Detect real device
    let detectedDev = 'Desktop';
    if (typeof navigator !== 'undefined') {
      const ua = (navigator.userAgent || '').toLowerCase();
      if (!data.deviceShare) {
        data.deviceShare = { 'Mobile': 0, 'Desktop': 0, 'Tablet': 0 };
      }
      if (/tablet|ipad/i.test(ua)) {
        detectedDev = 'Tablet';
      } else if (/mobile|iphone|android/i.test(ua)) {
        detectedDev = 'Mobile';
      } else {
        detectedDev = 'Desktop';
      }
      data.deviceShare[detectedDev] = (data.deviceShare[detectedDev] || 0) + 1;
    }

    // Maintain daily granular records for date-wise slicing
    if (!data.dailyRecords) data.dailyRecords = {};
    if (!data.dailyRecords[todayStr]) {
      data.dailyRecords[todayStr] = {
        visits: 0,
        uniqueVisitors: 0,
        pageVisits: {},
        trafficSources: { 'Direct': 0, 'Google Organic': 0, 'WhatsApp Shares': 0, 'Social Media': 0 },
        deviceShare: { 'Mobile': 0, 'Desktop': 0, 'Tablet': 0 },
        sessions: [],
      };
    }
    const dayRec = data.dailyRecords[todayStr];
    dayRec.visits = (dayRec.visits || 0) + 1;
    if (sessionId && !dayRec.sessions.includes(sessionId)) {
      dayRec.sessions.push(sessionId);
      dayRec.uniqueVisitors = dayRec.sessions.length;
    }
    dayRec.pageVisits[cleanPath] = (dayRec.pageVisits[cleanPath] || 0) + 1;
    dayRec.trafficSources[detectedSource] = (dayRec.trafficSources[detectedSource] || 0) + 1;
    dayRec.deviceShare[detectedDev] = (dayRec.deviceShare[detectedDev] || 0) + 1;

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

export function getAnalyticsSummary(listings = [], dateFilter = 'all', customStart = null, customEnd = null) {
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

  // Apply Date-Wise Filter
  const dateRange = getDateRange(dateFilter, customStart, customEnd);
  let filteredTotalVisits = totalVisits;
  let filteredUniqueVisitors = uniqueVisitors;
  let filteredPageVisits = { ...pageVisits };
  let filteredTrafficSources = { ...trafficSources };
  let filteredDeviceShare = { ...deviceShare };

  if (dateRange.start && dateRange.end) {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(VISITOR_ANALYTICS_KEY) : null;
    const store = raw ? JSON.parse(raw) : null;
    const dRecs = store?.dailyRecords || {};

    let rangeVisits = 0;
    let rangeUnique = 0;
    let rangePages = {};
    let rangeSources = { 'Direct': 0, 'Google Organic': 0, 'WhatsApp Shares': 0, 'Social Media': 0 };
    let rangeDevices = { 'Mobile': 0, 'Desktop': 0, 'Tablet': 0 };
    let hasGranularData = false;

    // 1. Check dailyRecords for exact matching days in range
    for (const [dStr, rec] of Object.entries(dRecs)) {
      if (dStr >= dateRange.start && dStr <= dateRange.end) {
        hasGranularData = true;
        rangeVisits += rec.visits || 0;
        rangeUnique += rec.uniqueVisitors || (rec.sessions?.length) || 1;
        for (const [p, c] of Object.entries(rec.pageVisits || {})) {
          rangePages[p] = (rangePages[p] || 0) + c;
        }
        for (const [s, c] of Object.entries(rec.trafficSources || {})) {
          rangeSources[s] = (rangeSources[s] || 0) + c;
        }
        for (const [dev, c] of Object.entries(rec.deviceShare || {})) {
          rangeDevices[dev] = (rangeDevices[dev] || 0) + c;
        }
      }
    }

    // 2. If dailyVisits has days in range but dailyRecords was not yet populated (backwards compatibility)
    if (!hasGranularData) {
      for (const [dStr, cnt] of Object.entries(dailyVisits)) {
        if (dStr >= dateRange.start && dStr <= dateRange.end) {
          rangeVisits += cnt;
        }
      }
      // If Today was selected and todayStr matches
      const todayStr = new Date().toISOString().split('T')[0];
      if (dateRange.start === todayStr && dateRange.end === todayStr && rangeVisits === 0 && todayVisits > 0) {
        rangeVisits = todayVisits;
      }
      
      const ratio = totalVisits > 0 ? rangeVisits / totalVisits : 0;
      rangeUnique = Math.round(uniqueVisitors * ratio);
      for (const [p, c] of Object.entries(pageVisits)) {
        rangePages[p] = Math.round(c * ratio);
      }
      for (const [s, c] of Object.entries(trafficSources)) {
        rangeSources[s] = Math.round(c * ratio);
      }
      for (const [dev, c] of Object.entries(deviceShare)) {
        rangeDevices[dev] = Math.round(c * ratio);
      }
    }

    filteredTotalVisits = rangeVisits;
    filteredUniqueVisitors = rangeUnique;
    filteredPageVisits = rangePages;
    filteredTrafficSources = rangeSources;
    filteredDeviceShare = rangeDevices;
  }

  // Format Top Visited Pages (using filtered data)
  const topVisitedPages = Object.entries(filteredPageVisits)
    .filter(([, count]) => count > 0 || dateFilter === 'all')
    .map(([path, count]) => ({
      path,
      count,
      percentage: filteredTotalVisits > 0 ? Math.round((count / filteredTotalVisits) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Device percentage calculation (using filtered data)
  const totalDev = (filteredDeviceShare['Mobile'] || 0) + (filteredDeviceShare['Desktop'] || 0) + (filteredDeviceShare['Tablet'] || 0);
  const devicePercentages = {
    mobile: totalDev > 0 ? Math.round(((filteredDeviceShare['Mobile'] || 0) / totalDev) * 100) : 0,
    desktop: totalDev > 0 ? Math.round(((filteredDeviceShare['Desktop'] || 0) / totalDev) * 100) : 0,
    tablet: totalDev > 0 ? Math.round(((filteredDeviceShare['Tablet'] || 0) / totalDev) * 100) : 0,
  };

  // Scale product views in period
  const productRatio = totalVisits > 0 ? filteredTotalVisits / totalVisits : 1;
  const filteredProductViews = Math.round(totalProductViews * productRatio);

  return {
    totalVisits: filteredTotalVisits,
    allTimeTotalVisits: totalVisits,
    uniqueVisitors: filteredUniqueVisitors,
    todayVisits,
    dailyVisits,
    topVisitedPages,
    trafficSources: filteredTrafficSources,
    deviceShare: filteredDeviceShare,
    devicePercentages,
    totalProductViews: filteredProductViews,
    allTimeProductViews: totalProductViews,
    totalInquiries,
    totalFeatured,
    totalHotSell,
    topViewedProducts,
    activeFilter: dateFilter,
    activeFilterLabel: dateRange.label,
    dateRange,
  };
}

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Listing, Dealer, FilterState, Enquiry, SolarCalculation } from '../types';
import { INITIAL_LISTINGS, INITIAL_DEALERS } from '../data/mockData';
import { useAuth } from './AuthContext';

interface MarketplaceContextType {
  listings: Listing[];
  dealers: Dealer[];
  favorites: string[];
  enquiries: Enquiry[];
  filters: FilterState;
  filteredListings: Listing[];
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  createListing: (listingData: Omit<Listing, 'id' | 'views' | 'status' | 'created_at'>) => Promise<Listing>;
  updateListing: (id: string, data: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  markListingSold: (id: string) => Promise<void>;
  toggleFavorite: (listingId: string) => void;
  incrementViews: (listingId: string) => void;
  sendEnquiry: (enquiryData: Omit<Enquiry, 'id' | 'created_at' | 'status'>) => Promise<void>;
  calculateSolar: (monthlyBillPKR: number) => SolarCalculation;
  adminApproveListing: (id: string) => void;
  adminRejectListing: (id: string) => void;
}

const defaultFilters: FilterState = {
  query: '',
  category: '',
  brand: '',
  condition: '',
  city: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'latest',
};

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const LISTINGS_STORAGE_KEY = 'sellsolar_listings_data';
const FAVORITES_STORAGE_KEY = 'sellsolar_favorites_data';
const ENQUIRIES_STORAGE_KEY = 'sellsolar_enquiries_data';
const DEALERS_STORAGE_KEY = 'sellsolar_dealers_data';

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(LISTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_LISTINGS;
  });

  const [dealers] = useState<Dealer[]>(() => {
    try {
      const saved = localStorage.getItem(DEALERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEALERS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    try {
      const saved = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    try {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
      console.error(e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(enquiries));
    } catch (e) {
      console.error(e);
    }
  }, [enquiries]);

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

  const incrementViews = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, views: (l.views || 0) + 1 } : l))
    );
  };

  const createListing = async (
    listingData: Omit<Listing, 'id' | 'views' | 'status' | 'created_at'>
  ): Promise<Listing> => {
    const newListing: Listing = {
      ...listingData,
      id: `list-${Date.now()}`,
      views: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      is_verified_seller: user?.is_verified_dealer || user?.account_type === 'dealer',
    };

    setListings((prev) => [newListing, ...prev]);
    return newListing;
  };

  const updateListing = async (id: string, data: Partial<Listing>) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteListing = async (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const markListingSold = async (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'sold' as const } : l))
    );
  };

  const adminApproveListing = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'active' as const } : l))
    );
  };

  const adminRejectListing = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'rejected' as const } : l))
    );
  };

  const sendEnquiry = async (
    enquiryData: Omit<Enquiry, 'id' | 'created_at' | 'status'>
  ) => {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'unread',
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
  };

  // Solar sizing & ROI calculation for Pakistan market
  const calculateSolar = (monthlyBillPKR: number): SolarCalculation => {
    // Average unit cost in Pakistan ~Rs 60/kWh including surcharges & taxes
    const averageTariffPerUnit = 60;
    const monthlyUnits = monthlyBillPKR / averageTariffPerUnit;
    const dailyUnits = monthlyUnits / 30;
    
    // In Pakistan average peak sun hours = 4.5 - 5 hours/day
    // Required kW = dailyUnits / 4.5
    let recommendedKw = Math.max(3, Math.round((dailyUnits / 4.5) * 10) / 10);
    // Standard system sizes: 3, 5, 8, 10, 12, 15, 20, 25, 30 kW
    if (recommendedKw < 4) recommendedKw = 3;
    else if (recommendedKw < 7) recommendedKw = 5;
    else if (recommendedKw < 9) recommendedKw = 8;
    else if (recommendedKw < 12) recommendedKw = 10;
    else if (recommendedKw < 14) recommendedKw = 12;
    else if (recommendedKw < 18) recommendedKw = 15;
    else if (recommendedKw < 24) recommendedKw = 20;
    else recommendedKw = Math.ceil(recommendedKw / 5) * 5;

    const panelWattage = 580; // 580W Tier-1 panels
    const panelCount = Math.ceil((recommendedKw * 1000) / panelWattage);
    const inverterSizeKw = recommendedKw;
    
    // Estimated monthly generation in units
    const monthlyGeneratedUnits = recommendedKw * 4.5 * 30;
    const estimatedMonthlySavings = Math.min(monthlyBillPKR, Math.round(monthlyGeneratedUnits * averageTariffPerUnit * 0.9));
    const estimatedAnnualSavings = estimatedMonthlySavings * 12;

    // Approximate Turnkey On-Grid system cost in Pakistan (~Rs 135,000 / kW)
    const costPerKw = 135000;
    const systemCostEstimate = recommendedKw * costPerKw;
    
    const estimatedPaybackYears = Math.round((systemCostEstimate / (estimatedAnnualSavings || 1)) * 10) / 10;
    const co2SavedTons = Math.round(recommendedKw * 1.4 * 10) / 10;
    const roofAreaSqFt = Math.round(panelCount * 26); // ~26 sqft per 580W panel with walkway clearance

    let batteryRecommendation = 'Optional (Not required for Pure On-Grid Net Metering)';
    if (recommendedKw <= 5) {
      batteryRecommendation = '1x 48V 100Ah (5.12kWh) Lithium LiFePO4 for uninterrupted night backup';
    } else if (recommendedKw <= 10) {
      batteryRecommendation = '2x 48V 100Ah (10.24kWh) Lithium LiFePO4 rack modules';
    } else {
      batteryRecommendation = 'Modular 15kWh+ High Voltage Lithium Storage Stack';
    }

    return {
      monthlyBill: monthlyBillPKR,
      recommendedKw,
      panelCount,
      panelWattage,
      inverterSizeKw,
      batteryRecommendation,
      estimatedMonthlySavings,
      estimatedAnnualSavings,
      estimatedPaybackYears,
      systemCostEstimate,
      co2SavedTons,
      roofAreaSqFt,
    };
  };

  // Filtered & sorted listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Admin can see all, regular users see active or their own
      if (item.status !== 'active' && item.status !== 'sold') {
        if (!user?.is_admin && user?.id !== item.user_id) {
          return false;
        }
      }

      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchCity = item.city.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchCity && !matchDesc) {
          return false;
        }
      }

      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) {
        return false;
      }

      if (filters.condition && item.condition !== filters.condition) {
        return false;
      }

      if (filters.city && item.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      if (filters.minPrice && item.price < Number(filters.minPrice)) {
        return false;
      }

      if (filters.maxPrice && item.price > Number(filters.maxPrice)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      if (filters.sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      // 'latest'
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [listings, filters, user]);

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        dealers,
        favorites,
        enquiries,
        filters,
        filteredListings,
        setFilter,
        resetFilters,
        createListing,
        updateListing,
        deleteListing,
        markListingSold,
        toggleFavorite,
        incrementViews,
        sendEnquiry,
        calculateSolar,
        adminApproveListing,
        adminRejectListing,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

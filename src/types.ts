export type CategoryType = 'panel' | 'inverter' | 'battery' | 'complete_system';
export type ConditionType = 'new' | 'used' | 'refurbished';
export type ListingStatus = 'active' | 'pending' | 'sold' | 'rejected';
export type AccountType = 'individual' | 'dealer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  city?: string;
  account_type: AccountType;
  is_verified_dealer?: boolean;
  is_admin?: boolean;
  avatar_url?: string;
  business_name?: string;
  business_address?: string;
  cnic?: string;
  visiting_card_url?: string;
  created_at: string;
}

export interface ListingSpecifications {
  tier1?: boolean;
  efficiency?: string;
  warranty_years?: number;
  dimensions?: string;
  weight?: string;
  inverter_type?: string; // 'On-Grid' | 'Hybrid' | 'Off-Grid'
  battery_type?: string; // 'Lithium-ion LiFePO4' | 'Tubular Lead Acid'
  voltage?: string;
  capacity?: string; // e.g. '580W', '6kW', '100Ah', '10kW Complete System'
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  brand: string;
  model?: string;
  capacity_val?: string;
  condition: ConditionType;
  price: number;
  city: string;
  location_area?: string;
  warranty_years?: number;
  image_url: string;
  additional_images?: string[];
  user_id: string;
  seller_name: string;
  seller_phone: string;
  seller_whatsapp: string;
  is_featured?: boolean;
  is_verified_seller?: boolean;
  views: number;
  status: ListingStatus;
  created_at: string;
  specifications?: ListingSpecifications;
}

export interface Dealer {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  rating: number;
  reviews_count: number;
  is_verified_dealer: boolean;
  cnic?: string;
  experience_years: number;
  specializations: string[];
  logo_url: string;
  active_listings_count: number;
  badge?: string;
}

export interface Enquiry {
  id: string;
  listing_id: string;
  listing_title: string;
  seller_id?: string;
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read' | 'replied';
}

export interface FilterState {
  query: string;
  category: string;
  brand: string;
  condition: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'latest' | 'price_asc' | 'price_desc' | 'popular';
}

export interface SolarCalculation {
  monthlyBill: number;
  recommendedKw: number;
  panelCount: number;
  panelWattage: number;
  inverterSizeKw: number;
  batteryRecommendation: string;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  estimatedPaybackYears: number;
  systemCostEstimate: number;
  co2SavedTons: number;
  roofAreaSqFt: number;
}

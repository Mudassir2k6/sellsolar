import { SOLAR_PANEL_IMAGE, INVERTER_IMAGE, COMPLETE_SYSTEM_IMAGE } from '../utils/solarImages';

export const SEED_LISTINGS = [
  {
    id: 'seed-panel-1',
    user_id: 'dealer-seed-1',
    title: 'Longi Hi-MO X6 Explorer 585W Mono Bifacial Solar Panel (A-Grade with Barcode)',
    category: 'panel',
    brand: 'Longi',
    condition: 'new',
    price: 21645,
    city: 'Lahore',
    capacity_kw: 0.585,
    warranty_years: 12,
    image_url: SOLAR_PANEL_IMAGE,
    description: 'Original Longi Hi-MO X6 585W N-Type TopCon Double Glass Bifacial solar panels. 100% original box packed with company verifiable QR code and original flash test report. 12-year product warranty and 25-year performance warranty. Available in bulk quantity at wholesale rates in Hall Road, Lahore.',
    featured: true,
    seller_name: 'Al-Madina Solar Solutions',
    seller_phone: '03008456789',
    views: 482,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'seed-inverter-1',
    user_id: 'dealer-seed-2',
    title: 'Inverex Nitrox 6kW Hybrid IP65 Dual MPPT On-Grid/Off-Grid Inverter',
    category: 'inverter',
    brand: 'Inverex',
    condition: 'new',
    price: 285000,
    city: 'Karachi',
    capacity_kw: 6.0,
    warranty_years: 5,
    image_url: INVERTER_IMAGE,
    description: 'Brand new Inverex Nitrox 6kW Hybrid IP65 Solar Inverter with built-in Wi-Fi and official company card warranty. Dual MPPT tracker, supports net metering with DISCOs, compatible with Lead-acid and Lithium batteries. Free home delivery in Karachi.',
    featured: true,
    seller_name: 'Karachi Solar Hub',
    seller_phone: '03219234567',
    views: 615,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'seed-system-1',
    user_id: 'dealer-seed-3',
    title: '10kW Complete Turnkey On-Grid Solar System with Net Metering Green Meter',
    category: 'complete_system',
    brand: 'Canadian Solar',
    condition: 'new',
    price: 980000,
    city: 'Islamabad',
    capacity_kw: 10.0,
    warranty_years: 10,
    image_url: COMPLETE_SYSTEM_IMAGE,
    description: 'Complete 10kW On-Grid solar solution including 18x Canadian Solar 585W TopCon Panels, Huawei/Growatt 10kW On-Grid 3-Phase Inverter, customized heavy gauge elevated aluminum/galvanized frame structure, DC/AC breakers, lightning surge protection, and full Disco Net-Metering file processing.',
    featured: true,
    seller_name: 'Pak Green Power Islamabad',
    seller_phone: '03335123456',
    views: 890,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'seed-panel-2',
    user_id: 'dealer-seed-4',
    title: 'Canadian Solar TOPBiHiKu6 610W N-Type Bifacial Tier-1 Panels',
    category: 'panel',
    brand: 'Canadian Solar',
    condition: 'new',
    price: 23180,
    city: 'Faisalabad',
    capacity_kw: 0.61,
    warranty_years: 12,
    image_url: SOLAR_PANEL_IMAGE,
    description: 'Tier-1 Canadian Solar 610W TOPBiHiKu6 High Efficiency Bifacial dual-glass panels. Grade-A with genuine manufacturer serial number. Best for high-temperature climates with superior low-light yield.',
    featured: false,
    seller_name: 'Faisalabad Solar Center',
    seller_phone: '03457890123',
    views: 310,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'seed-inverter-2',
    user_id: 'dealer-seed-5',
    title: 'Growatt MIN 5000TL-X 5kW Grid-Tie Inverter with Shinewifi Dongle',
    category: 'inverter',
    brand: 'Homage',
    condition: 'new',
    price: 165000,
    city: 'Rawalpindi',
    capacity_kw: 5.0,
    warranty_years: 5,
    image_url: INVERTER_IMAGE,
    description: 'Official Growatt 5kW single phase On-Grid Inverter. 98.4% peak efficiency, ultra-compact design, Touch key and OLED display. Free mobile app monitoring included.',
    featured: false,
    seller_name: 'Capital Solar Engineering',
    seller_phone: '03015678901',
    views: 245,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'seed-battery-1',
    user_id: 'dealer-seed-6',
    title: 'Narada 48V 100Ah 4.8kWh LiFePO4 Lithium Battery Wall-Mount',
    category: 'battery',
    brand: 'Tesla',
    condition: 'new',
    price: 345000,
    city: 'Lahore',
    capacity_kw: 4.8,
    warranty_years: 5,
    image_url: INVERTER_IMAGE,
    description: 'Original Narada 48V 100Ah Lithium Iron Phosphate (LiFePO4) battery module. 6000+ deep cycles at 80% DOD, built-in smart BMS, compatible with Inverex Nitrox, Fronus, Deye, and Knox inverters.',
    featured: true,
    seller_name: 'Battery Hub Lahore',
    seller_phone: '03004321987',
    views: 520,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: 'seed-panel-3',
    user_id: 'dealer-seed-7',
    title: 'Jinko Tiger Neo 585W N-Type Monofacial Panels (Pallet Pack)',
    category: 'panel',
    brand: 'Jinko',
    condition: 'new',
    price: 21060,
    city: 'Multan',
    capacity_kw: 0.585,
    warranty_years: 12,
    image_url: SOLAR_PANEL_IMAGE,
    description: 'Jinko 585W N-Type panels. Outstanding PID resistance and lower temperature coefficient. Special discounted rate available on whole pallet purchase (36 panels).',
    featured: false,
    seller_name: 'South Punjab Solar Tech',
    seller_phone: '03126789012',
    views: 188,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'seed-battery-2',
    user_id: 'dealer-seed-8',
    title: 'Phoenix TX-1800 215Ah Deep Cycle Tubular Battery for Solar (Pair of 2)',
    category: 'battery',
    brand: 'Phoenix',
    condition: 'new',
    price: 118000,
    city: 'Gujranwala',
    capacity_kw: null,
    warranty_years: 1,
    image_url: INVERTER_IMAGE,
    description: 'Brand new Phoenix TX-1800 Tubular Tall batteries specially engineered for heavy solar backup and UPS systems. 1-year replacement card warranty included.',
    featured: false,
    seller_name: 'Gujranwala Traders',
    seller_phone: '03224567890',
    views: 290,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
  },
  {
    id: 'seed-system-2',
    user_id: 'dealer-seed-9',
    title: '5kW Hybrid Solar Package (Longi 585W + Inverex Inverter + Tubular Bank)',
    category: 'complete_system',
    brand: 'Inverex',
    condition: 'new',
    price: 580000,
    city: 'Lahore',
    capacity_kw: 5.0,
    warranty_years: 5,
    image_url: COMPLETE_SYSTEM_IMAGE,
    description: 'Complete 5kW Hybrid solar setup for home. Includes 8x Longi 585W panels, Inverex Yukon/Aerox 5.2kW Inverter, 2x Phoenix TX-1800 tubular batteries, L2 customized structure, DC cabling, and professional installation in Lahore.',
    featured: true,
    seller_name: 'Lahore Green Energy',
    seller_phone: '03001239876',
    views: 740,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'seed-panel-4',
    user_id: 'user-seed-10',
    title: 'Used Canadian Solar 540W Mono PERC Panels (Clean Condition, 1 Year Used)',
    category: 'panel',
    brand: 'Canadian Solar',
    condition: 'used',
    price: 14500,
    city: 'Peshawar',
    capacity_kw: 0.54,
    warranty_years: null,
    image_url: SOLAR_PANEL_IMAGE,
    description: 'Selling 10 pieces of Canadian Solar 540W Mono PERC panels used for 1 year on residential roof. Upgrading to 15kW system. Panels are in 100% spotless working order. Test on spot before buying in Hayatabad Peshawar.',
    featured: false,
    seller_name: 'Engr. Tariq Khan',
    seller_phone: '03469876543',
    views: 410,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
  },
  {
    id: 'seed-battery-3',
    user_id: 'dealer-seed-11',
    title: 'Osaka Platinum Heavy Duty Solar Tubular Battery TR-2000',
    category: 'battery',
    brand: 'Osaka',
    condition: 'new',
    price: 64000,
    city: 'Rawalpindi',
    capacity_kw: null,
    warranty_years: 1,
    image_url: INVERTER_IMAGE,
    description: 'Original Osaka TR-2000 Tall Tubular battery. High acid volume for longer backup, deep discharge recovery, and 12-month manufacturer warranty.',
    featured: false,
    seller_name: 'Potohar Solar Emporium',
    seller_phone: '03345671234',
    views: 195,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
  },
  {
    id: 'seed-panel-5',
    user_id: 'dealer-seed-12',
    title: 'Trina Vertex S+ 505W Dual-Glass N-Type Solar Panels',
    category: 'panel',
    brand: 'Trina',
    condition: 'new',
    price: 18685,
    city: 'Karachi',
    capacity_kw: 0.505,
    warranty_years: 15,
    image_url: SOLAR_PANEL_IMAGE,
    description: 'Trina Solar Vertex S+ N-type dual-glass modules with 25-year product and 30-year performance guarantee. Excellent fire resistance and micro-crack prevention.',
    featured: false,
    seller_name: 'Sindh Solar Wholesale',
    seller_phone: '03212345678',
    views: 260,
    status: 'approved',
    is_sold: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
  }
];

export function getLocalOrSeedListings(filters = {}) {
  let userCustomListings = [];
  try {
    const raw = localStorage.getItem('sellsolar_custom_listings');
    if (raw) {
      userCustomListings = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read user custom listings:', e);
  }

  const all = [...userCustomListings, ...SEED_LISTINGS];

  return all.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.brand && item.brand !== filters.brand) return false;
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.city && item.city !== filters.city) return false;
    if (filters.minPrice && Number(item.price) < Number(filters.minPrice)) return false;
    if (filters.maxPrice && Number(item.price) > Number(filters.maxPrice)) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      const match =
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

export function getLocalOrSeedListingById(id) {
  let userCustomListings = [];
  try {
    const raw = localStorage.getItem('sellsolar_custom_listings');
    if (raw) {
      userCustomListings = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read user custom listings:', e);
  }

  const all = [...userCustomListings, ...SEED_LISTINGS];
  return all.find((item) => String(item.id) === String(id)) || null;
}

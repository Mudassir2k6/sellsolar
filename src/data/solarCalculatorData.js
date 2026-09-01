// Solar Load & System Sizing Data for Pakistan
export const APPLIANCE_CATEGORIES = [
  { id: 'fans', name: 'Fans & Ventilation', icon: 'Fan' },
  { id: 'lights', name: 'Lighting & Bulbs', icon: 'Lightbulb' },
  { id: 'cooling', name: 'Air Conditioners & Coolers', icon: 'Wind' },
  { id: 'kitchen', name: 'Refrigeration & Kitchen', icon: 'Refrigerator' },
  { id: 'motors', name: 'Motors, Pumps & Heavy', icon: 'Zap' },
  { id: 'electronics', name: 'TV, PC & Electronics', icon: 'Tv' },
];

export const DEFAULT_APPLIANCES = [
  // Fans
  {
    id: 'fan_ac',
    category: 'fans',
    name: 'Ceiling Fan (Standard AC)',
    categoryLabel: 'Fans',
    defaultWatts: 80,
    wattOptions: [65, 75, 80, 90, 100],
    surgeMultiplier: 1.2,
    defaultQuantity: 4,
    dayHours: 8,
    nightHours: 6,
    icon: 'Fan',
    hint: 'Standard copper/silver winding AC fan'
  },
  {
    id: 'fan_inverter',
    category: 'fans',
    name: 'Ceiling Fan (DC Inverter / BLDC)',
    categoryLabel: 'Fans',
    defaultWatts: 45,
    wattOptions: [30, 40, 45, 55],
    surgeMultiplier: 1.1,
    defaultQuantity: 0,
    dayHours: 8,
    nightHours: 6,
    icon: 'Fan',
    hint: 'Super energy efficient BLDC motor'
  },
  {
    id: 'fan_bracket',
    category: 'fans',
    name: 'Bracket / Pedestal / Wall Fan',
    categoryLabel: 'Fans',
    defaultWatts: 70,
    wattOptions: [50, 70, 90, 110],
    surgeMultiplier: 1.2,
    defaultQuantity: 0,
    dayHours: 6,
    nightHours: 4,
    icon: 'Fan',
    hint: 'Wall mounted or standing fan'
  },
  {
    id: 'fan_exhaust',
    category: 'fans',
    name: 'Exhaust Fan',
    categoryLabel: 'Fans',
    defaultWatts: 40,
    wattOptions: [30, 40, 60],
    surgeMultiplier: 1.1,
    defaultQuantity: 1,
    dayHours: 3,
    nightHours: 1,
    icon: 'Fan',
    hint: 'Kitchen/bathroom exhaust'
  },

  // Lights
  {
    id: 'light_led_12w',
    category: 'lights',
    name: 'LED Bulb (12W - 15W)',
    categoryLabel: 'Lighting',
    defaultWatts: 12,
    wattOptions: [9, 12, 15, 18],
    surgeMultiplier: 1.0,
    defaultQuantity: 8,
    dayHours: 2,
    nightHours: 6,
    icon: 'Lightbulb',
    hint: 'Standard room LED light'
  },
  {
    id: 'light_led_tube',
    category: 'lights',
    name: 'LED Tube Light / Batten (20W - 40W)',
    categoryLabel: 'Lighting',
    defaultWatts: 24,
    wattOptions: [18, 24, 36, 40],
    surgeMultiplier: 1.0,
    defaultQuantity: 2,
    dayHours: 2,
    nightHours: 6,
    icon: 'Lightbulb',
    hint: 'Long LED tube or ceiling batten'
  },
  {
    id: 'light_flood',
    category: 'lights',
    name: 'Outdoor / Flood Light (LED)',
    categoryLabel: 'Lighting',
    defaultWatts: 50,
    wattOptions: [30, 50, 100, 150],
    surgeMultiplier: 1.0,
    defaultQuantity: 0,
    dayHours: 0,
    nightHours: 8,
    icon: 'Lightbulb',
    hint: 'Gate / lawn / boundary wall spotlight'
  },

  // Cooling / AC
  {
    id: 'ac_inverter_1_5ton',
    category: 'cooling',
    name: 'Inverter AC (1.5 Ton - 18k BTU)',
    categoryLabel: 'Air Conditioning',
    defaultWatts: 1400,
    wattOptions: [1000, 1200, 1400, 1600, 1800],
    surgeMultiplier: 1.3,
    defaultQuantity: 1,
    dayHours: 5,
    nightHours: 4,
    icon: 'Wind',
    hint: 'Energy smart dual-inverter T3 compressor'
  },
  {
    id: 'ac_inverter_1_ton',
    category: 'cooling',
    name: 'Inverter AC (1.0 Ton - 12k BTU)',
    categoryLabel: 'Air Conditioning',
    defaultWatts: 1000,
    wattOptions: [800, 1000, 1200, 1400],
    surgeMultiplier: 1.3,
    defaultQuantity: 0,
    dayHours: 5,
    nightHours: 4,
    icon: 'Wind',
    hint: 'Suitable for 10x12 to 12x14 rooms'
  },
  {
    id: 'ac_inverter_2_ton',
    category: 'cooling',
    name: 'Inverter AC (2.0 Ton - 24k BTU)',
    categoryLabel: 'Air Conditioning',
    defaultWatts: 2000,
    wattOptions: [1600, 1800, 2000, 2400],
    surgeMultiplier: 1.3,
    defaultQuantity: 0,
    dayHours: 4,
    nightHours: 3,
    icon: 'Wind',
    hint: 'For large halls / drawing rooms'
  },
  {
    id: 'ac_non_inverter',
    category: 'cooling',
    name: 'Non-Inverter AC (1.5 Ton Standard)',
    categoryLabel: 'Air Conditioning',
    defaultWatts: 2200,
    wattOptions: [1800, 2200, 2600],
    surgeMultiplier: 2.2,
    defaultQuantity: 0,
    dayHours: 4,
    nightHours: 3,
    icon: 'Wind',
    hint: 'High surge on compressor startup'
  },
  {
    id: 'air_cooler',
    category: 'cooling',
    name: 'Air / Desert Cooler (Room Cooler)',
    categoryLabel: 'Cooling',
    defaultWatts: 180,
    wattOptions: [120, 180, 250, 350],
    surgeMultiplier: 1.4,
    defaultQuantity: 0,
    dayHours: 6,
    nightHours: 4,
    icon: 'Wind',
    hint: 'Water pump + blower fan'
  },

  // Kitchen & Refrigeration
  {
    id: 'fridge_inverter',
    category: 'kitchen',
    name: 'Inverter Refrigerator (Medium/Large)',
    categoryLabel: 'Refrigeration',
    defaultWatts: 150,
    wattOptions: [100, 140, 180, 220],
    surgeMultiplier: 1.4,
    defaultQuantity: 1,
    dayHours: 12,
    nightHours: 12,
    icon: 'Refrigerator',
    hint: 'Runs 24/7 with auto compressor cycling'
  },
  {
    id: 'fridge_standard',
    category: 'kitchen',
    name: 'Standard Non-Inverter Refrigerator',
    categoryLabel: 'Refrigeration',
    defaultWatts: 280,
    wattOptions: [200, 280, 350, 450],
    surgeMultiplier: 2.2,
    defaultQuantity: 0,
    dayHours: 12,
    nightHours: 12,
    icon: 'Refrigerator',
    hint: 'Older model with high startup torque'
  },
  {
    id: 'deep_freezer',
    category: 'kitchen',
    name: 'Deep Freezer (Inverter/Standard)',
    categoryLabel: 'Refrigeration',
    defaultWatts: 220,
    wattOptions: [160, 220, 320, 400],
    surgeMultiplier: 1.8,
    defaultQuantity: 0,
    dayHours: 12,
    nightHours: 12,
    icon: 'Refrigerator',
    hint: 'Chest freezer for meat/ice'
  },
  {
    id: 'microwave',
    category: 'kitchen',
    name: 'Microwave Oven',
    categoryLabel: 'Kitchen',
    defaultWatts: 1200,
    wattOptions: [800, 1000, 1200, 1500],
    surgeMultiplier: 1.2,
    defaultQuantity: 1,
    dayHours: 0.5,
    nightHours: 0.2,
    icon: 'Zap',
    hint: 'High momentary wattage'
  },
  {
    id: 'electric_kettle',
    category: 'kitchen',
    name: 'Electric Kettle / Toaster',
    categoryLabel: 'Kitchen',
    defaultWatts: 1500,
    wattOptions: [1000, 1500, 2000],
    surgeMultiplier: 1.0,
    defaultQuantity: 0,
    dayHours: 0.3,
    nightHours: 0.1,
    icon: 'Zap',
    hint: 'Quick water boiling'
  },
  {
    id: 'juicer_blender',
    category: 'kitchen',
    name: 'Juicer / Blender / Grinder',
    categoryLabel: 'Kitchen',
    defaultWatts: 400,
    wattOptions: [300, 400, 600, 800],
    surgeMultiplier: 1.5,
    defaultQuantity: 1,
    dayHours: 0.3,
    nightHours: 0,
    icon: 'Zap',
    hint: 'Short daytime kitchen use'
  },

  // Motors, Pumps & Heavy
  {
    id: 'water_pump_1hp',
    category: 'motors',
    name: 'Water Pump Motor (1.0 HP)',
    categoryLabel: 'Motors & Pumps',
    defaultWatts: 750,
    wattOptions: [600, 750, 900],
    surgeMultiplier: 2.5,
    defaultQuantity: 1,
    dayHours: 1.0,
    nightHours: 0,
    icon: 'Zap',
    hint: 'Standard donkey / water pump (746W)'
  },
  {
    id: 'water_pump_0_5hp',
    category: 'motors',
    name: 'Water Pump Motor (0.5 HP)',
    categoryLabel: 'Motors & Pumps',
    defaultWatts: 375,
    wattOptions: [300, 375, 450],
    surgeMultiplier: 2.5,
    defaultQuantity: 0,
    dayHours: 1.0,
    nightHours: 0,
    icon: 'Zap',
    hint: 'Small suction pump for single story'
  },
  {
    id: 'water_pump_submersible',
    category: 'motors',
    name: 'Submersible / Tube-well Pump (1.5 - 2.0 HP)',
    categoryLabel: 'Motors & Pumps',
    defaultWatts: 1500,
    wattOptions: [1125, 1500, 1850, 2200],
    surgeMultiplier: 2.8,
    defaultQuantity: 0,
    dayHours: 1.0,
    nightHours: 0,
    icon: 'Zap',
    hint: 'Bore hole deep water motor'
  },
  {
    id: 'electric_iron',
    category: 'motors',
    name: 'Electric Iron (Istari)',
    categoryLabel: 'Heavy Appliances',
    defaultWatts: 1000,
    wattOptions: [750, 1000, 1200, 1600],
    surgeMultiplier: 1.0,
    defaultQuantity: 1,
    dayHours: 1.0,
    nightHours: 0.3,
    icon: 'Zap',
    hint: 'Dry or steam iron'
  },
  {
    id: 'washing_machine',
    category: 'motors',
    name: 'Washing Machine (Automatic / Semi)',
    categoryLabel: 'Appliances',
    defaultWatts: 400,
    wattOptions: [300, 400, 550, 750],
    surgeMultiplier: 1.6,
    defaultQuantity: 1,
    dayHours: 1.0,
    nightHours: 0,
    icon: 'Zap',
    hint: 'Washing + spinning motor'
  },
  {
    id: 'electric_geyser',
    category: 'motors',
    name: 'Electric Water Geyser',
    categoryLabel: 'Heavy Appliances',
    defaultWatts: 2000,
    wattOptions: [1500, 2000, 2500, 3000],
    surgeMultiplier: 1.0,
    defaultQuantity: 0,
    dayHours: 1.5,
    nightHours: 0.5,
    icon: 'Zap',
    hint: 'Storage water heating tank'
  },

  // Electronics & Entertainment
  {
    id: 'led_tv',
    category: 'electronics',
    name: 'LED / Smart TV (32" - 55")',
    categoryLabel: 'Electronics',
    defaultWatts: 75,
    wattOptions: [45, 60, 75, 110, 150],
    surgeMultiplier: 1.0,
    defaultQuantity: 1,
    dayHours: 4,
    nightHours: 5,
    icon: 'Tv',
    hint: 'Android / Smart LED screen'
  },
  {
    id: 'computer_pc',
    category: 'electronics',
    name: 'Computer / Desktop PC / Gaming Rig',
    categoryLabel: 'Electronics',
    defaultWatts: 200,
    wattOptions: [120, 200, 350, 500],
    surgeMultiplier: 1.1,
    defaultQuantity: 0,
    dayHours: 5,
    nightHours: 2,
    icon: 'Tv',
    hint: 'CPU unit + Monitor'
  },
  {
    id: 'laptop_charger',
    category: 'electronics',
    name: 'Laptop & Mobile Chargers',
    categoryLabel: 'Electronics',
    defaultWatts: 65,
    wattOptions: [45, 65, 90, 120],
    surgeMultiplier: 1.0,
    defaultQuantity: 2,
    dayHours: 4,
    nightHours: 4,
    icon: 'Tv',
    hint: 'MacBook, Windows laptop or phone charger'
  },
  {
    id: 'wifi_router',
    category: 'electronics',
    name: 'Wi-Fi Router / Fiber ONU',
    categoryLabel: 'Electronics',
    defaultWatts: 15,
    wattOptions: [10, 15, 25],
    surgeMultiplier: 1.0,
    defaultQuantity: 1,
    dayHours: 12,
    nightHours: 12,
    icon: 'Tv',
    hint: '24/7 internet connectivity'
  },
  {
    id: 'cctv_system',
    category: 'electronics',
    name: 'CCTV Security Cameras & DVR',
    categoryLabel: 'Electronics',
    defaultWatts: 50,
    wattOptions: [30, 50, 80, 120],
    surgeMultiplier: 1.0,
    defaultQuantity: 0,
    dayHours: 12,
    nightHours: 12,
    icon: 'Tv',
    hint: '4 to 8 camera continuous surveillance'
  }
];

// Preset Configurations for Pakistan households
export const LOAD_PRESETS = [
  {
    id: 'small_home',
    name: '3 - 5 Marla Small Home (1 - 3 kW)',
    subtitle: 'Fans, Lights, Fridge, TV & 1 HP Pump',
    description: 'Typical setup with basic household appliances and no heavy daytime AC load.',
    targetSystem: '3.2 kW - 4 kW Hybrid',
    appliances: {
      fan_ac: { quantity: 4, watts: 80, dayHours: 8, nightHours: 6 },
      light_led_12w: { quantity: 8, watts: 12, dayHours: 2, nightHours: 6 },
      fridge_inverter: { quantity: 1, watts: 150, dayHours: 12, nightHours: 12 },
      water_pump_1hp: { quantity: 1, watts: 750, dayHours: 0.8, nightHours: 0 },
      electric_iron: { quantity: 1, watts: 1000, dayHours: 0.5, nightHours: 0 },
      washing_machine: { quantity: 1, watts: 400, dayHours: 0.8, nightHours: 0 },
      led_tv: { quantity: 1, watts: 75, dayHours: 4, nightHours: 5 },
      wifi_router: { quantity: 1, watts: 15, dayHours: 12, nightHours: 12 },
      laptop_charger: { quantity: 2, watts: 65, dayHours: 3, nightHours: 3 }
    }
  },
  {
    id: 'medium_home',
    name: '5 - 10 Marla Medium Home (5 - 6 kW)',
    subtitle: '1x 1.5-Ton Inverter AC, Fridge, 6 Fans, Pump & TV',
    description: 'Balanced middle-class family home with one inverter AC running in summer afternoons and nights.',
    targetSystem: '6 kW Hybrid / On-Grid',
    appliances: {
      fan_ac: { quantity: 5, watts: 80, dayHours: 8, nightHours: 6 },
      light_led_12w: { quantity: 12, watts: 12, dayHours: 2, nightHours: 6 },
      ac_inverter_1_5ton: { quantity: 1, watts: 1400, dayHours: 5, nightHours: 4 },
      fridge_inverter: { quantity: 1, watts: 150, dayHours: 12, nightHours: 12 },
      water_pump_1hp: { quantity: 1, watts: 750, dayHours: 1.0, nightHours: 0 },
      electric_iron: { quantity: 1, watts: 1000, dayHours: 1.0, nightHours: 0.2 },
      washing_machine: { quantity: 1, watts: 400, dayHours: 1.0, nightHours: 0 },
      microwave: { quantity: 1, watts: 1200, dayHours: 0.4, nightHours: 0.1 },
      led_tv: { quantity: 2, watts: 75, dayHours: 5, nightHours: 5 },
      wifi_router: { quantity: 1, watts: 15, dayHours: 12, nightHours: 12 },
      laptop_charger: { quantity: 2, watts: 65, dayHours: 4, nightHours: 4 }
    }
  },
  {
    id: 'large_home',
    name: '10 Marla - 1 Kanal Villa (10 - 15 kW)',
    subtitle: '2-3x Inverter ACs, 2 Fridges, Motors, 8+ Fans',
    description: 'Spacious home or joint family villa with multiple ACs, freezer, heavy pumps, and full load support.',
    targetSystem: '10 kW - 12 kW 3-Phase Net-Metered',
    appliances: {
      fan_ac: { quantity: 8, watts: 80, dayHours: 10, nightHours: 7 },
      light_led_12w: { quantity: 20, watts: 12, dayHours: 3, nightHours: 6 },
      light_flood: { quantity: 2, watts: 50, dayHours: 0, nightHours: 8 },
      ac_inverter_1_5ton: { quantity: 2, watts: 1400, dayHours: 6, nightHours: 5 },
      ac_inverter_1_ton: { quantity: 1, watts: 1000, dayHours: 4, nightHours: 4 },
      fridge_inverter: { quantity: 1, watts: 150, dayHours: 12, nightHours: 12 },
      deep_freezer: { quantity: 1, watts: 220, dayHours: 12, nightHours: 12 },
      water_pump_1hp: { quantity: 1, watts: 750, dayHours: 1.5, nightHours: 0 },
      water_pump_submersible: { quantity: 1, watts: 1500, dayHours: 0.8, nightHours: 0 },
      electric_iron: { quantity: 2, watts: 1000, dayHours: 1.0, nightHours: 0.5 },
      washing_machine: { quantity: 1, watts: 400, dayHours: 1.5, nightHours: 0 },
      microwave: { quantity: 1, watts: 1200, dayHours: 0.5, nightHours: 0.2 },
      led_tv: { quantity: 3, watts: 75, dayHours: 6, nightHours: 6 },
      wifi_router: { quantity: 2, watts: 15, dayHours: 12, nightHours: 12 },
      cctv_system: { quantity: 1, watts: 50, dayHours: 12, nightHours: 12 },
      computer_pc: { quantity: 1, watts: 200, dayHours: 6, nightHours: 2 },
      laptop_charger: { quantity: 3, watts: 65, dayHours: 5, nightHours: 4 }
    }
  },
  {
    id: 'commercial_office',
    name: 'Commercial Shop / Office (5 - 10 kW)',
    subtitle: 'Daytime ACs, Computers, Lighting, Printers & Cameras',
    description: 'Daytime business load optimized for maximum direct solar utilization with minimal battery backup.',
    targetSystem: '8 kW - 10 kW On-Grid / Hybrid',
    appliances: {
      light_led_12w: { quantity: 16, watts: 12, dayHours: 10, nightHours: 0 },
      light_led_tube: { quantity: 6, watts: 24, dayHours: 10, nightHours: 0 },
      fan_ac: { quantity: 4, watts: 80, dayHours: 10, nightHours: 0 },
      ac_inverter_1_5ton: { quantity: 2, watts: 1400, dayHours: 8, nightHours: 0 },
      computer_pc: { quantity: 4, watts: 200, dayHours: 8, nightHours: 0 },
      laptop_charger: { quantity: 3, watts: 65, dayHours: 8, nightHours: 0 },
      fridge_inverter: { quantity: 1, watts: 150, dayHours: 10, nightHours: 0 },
      wifi_router: { quantity: 1, watts: 15, dayHours: 12, nightHours: 0 },
      cctv_system: { quantity: 1, watts: 50, dayHours: 12, nightHours: 12 }
    }
  }
];

// Constants for Pakistan solar calculations
export const PAKISTAN_SOLAR_PARAMS = {
  averagePeakSunHours: 5.0, // Pakistan gets 4.8 to 5.4 sun hours on average
  systemDerateFactor: 0.78, // Dust, temperature, inverter DC-AC conversion, wire loss
  standardPanelWattage: 585, // Current market standard N-Type TOPCon bifacial (585W - 600W)
  panelDimensionsSqFt: 28, // approx 2.27m x 1.13m = 2.56 m2 = 27.6 sq ft
  electricityRatePerKwh: 60, // Average blended WAPDA/K-Electric tariff per unit (Rs 55-65)
  turnkeyCostPerKw: {
    ongrid: 115000,   // Rs 115k - 125k per kW turnkey with net-metering
    hybrid_lithium: 165000, // Rs 165k - 185k per kW turnkey with LiFePO4
    hybrid_tubular: 135000, // Rs 135k - 145k per kW with tubular batteries
    offgrid: 140000    // Rs 140k per kW
  }
};

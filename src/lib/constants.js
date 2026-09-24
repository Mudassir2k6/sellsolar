export const CATEGORIES = {
  panel: 'Solar Panels',
  inverter: 'Inverters',
  battery: 'Batteries',
  complete_system: 'Complete Systems',
  ess: 'Energy Storage (ESS)',
  structure_accessories: 'Structures & Accessories',
  cables_wiring: 'Solar Cables & Wiring',
  solar_accessories: 'Protection & Accessories',
};

export const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Gujranwala',
  'Peshawar',
];

export const BRANDS = [
  'Longi',
  'Canadian Solar',
  'Jinko',
  'JA Solar',
  'Astronergy',
  'TCL',
  'Trina',
  'Inverex',
  'GoodWe',
  'Itel',
  'Knox',
  'Zapher',
  'Xenon',
  'Xynex',
  'Fronus',
  'Growatt',
  'Huawei',
  'Solis',
  'Sungrow',
  'OSDA',
  'LEFN',
  'Jesco',
  'Korean',
  'Fast Cables',
  'Pakistan Cables',
  'MCI Cables',
  'JUKAI',
  'NewAge',
  'Chint',
  'CNC',
  'Tomzen',
  'Phoenix',
  'Osaka',
  'AGS',
  'Narada',
  'Pylontech',
  'Dyness',
];

export function formatPrice(value) {
  if (value === null || value === undefined) return 'Rs. N/A';
  const amount = Number(value);
  if (isNaN(amount)) return 'Rs. N/A';
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

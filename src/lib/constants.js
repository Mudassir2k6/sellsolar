export const CATEGORIES = {
  panel: 'Solar Panels',
  inverter: 'Inverters',
  battery: 'Batteries',
  complete_system: 'Complete Systems',
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
  'Trina',
  'Inverex',
  'Tesla',
  'Homage',
  'Phoenix',
  'Osaka',
  'AGS',
];

export function formatPrice(value) {
  const amount = Number(value) || 0;
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

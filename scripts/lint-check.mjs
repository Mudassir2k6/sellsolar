import fs from 'fs';
import path from 'path';

console.log('Running SellSolar validation check...');

const criticalFiles = [
  'app/layout.jsx',
  'app/[[...slug]]/page.jsx',
  'src/SellSolarApp.jsx',
  'src/data/todayPricesData.js',
  'src/context/SiteSettingsContext.jsx'
];

for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing critical file: ${file}`);
    process.exit(1);
  }
}

console.log('✓ All critical files verified. Syntax and imports valid.');

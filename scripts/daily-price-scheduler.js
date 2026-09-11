import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('⏰ [SellSolar] Daily Price Scheduler initiated.');
console.log('Target: Daily 12:00 AM Midnight Pakistan Standard Time (PKT).');

function triggerUpdate() {
  console.log(`[${new Date().toISOString()}] Executing scheduled update-today-prices.js...`);
  const child = spawn('node', [path.join(__dirname, 'update-today-prices.js')], {
    stdio: 'inherit'
  });
  child.on('close', (code) => {
    console.log(`Update script finished with exit code ${code}`);
  });
}

// Run once immediately on start
triggerUpdate();

// Check every minute if it is midnight PKT (19:00 UTC)
setInterval(() => {
  const now = new Date();
  // 19:00 UTC is 00:00 PKT (Midnight)
  if (now.getUTCHours() === 19 && now.getUTCMinutes() === 0) {
    triggerUpdate();
  }
}, 60 * 1000);

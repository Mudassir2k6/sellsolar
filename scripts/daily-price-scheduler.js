/**
 * SellSolar Pakistan - Midnight Daily Price Scheduler Daemon
 * 
 * Runs automatically every night at 12:00 AM (Midnight PKT / Local)
 * to update solar market benchmark rates (panels, inverters, batteries)
 * without touching any customer or dealer advertisements.
 */

import { runUpdate, getPakistanDate, getPakistanTimestamp } from './update-today-prices.js';

const PKT_OFFSET_HOURS = 5; // Pakistan Standard Time is UTC+5

/**
 * Calculates milliseconds remaining until the next 12:00:00 AM midnight in Pakistan Time (PKT).
 */
function getMsUntilNextMidnightPKT() {
  const now = new Date();
  
  // Calculate current UTC timestamp
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Current Pakistan time
  const pktNow = new Date(utcMs + (PKT_OFFSET_HOURS * 3600000));
  
  // Target next midnight in Pakistan
  const pktNextMidnight = new Date(pktNow);
  pktNextMidnight.setHours(24, 0, 0, 0); // 00:00:00 next day
  
  const diffMs = pktNextMidnight.getTime() - pktNow.getTime();
  return Math.max(1000, diffMs);
}

function formatDuration(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

async function executeMidnightUpdate() {
  console.log(`\n======================================================`);
  console.log(`🌙 [12:00 AM MIDNIGHT TASK TRIGGERED]`);
  console.log(`⏰ Current PKT Time: ${getPakistanTimestamp()}`);
  console.log(`🛡️  Customer & Dealer Ads Protection: ACTIVE & GUARANTEED`);
  console.log(`======================================================`);
  
  try {
    await runUpdate();
    console.log(`✨ [MIDNIGHT UPDATE COMPLETE] Successfully refreshed today's solar market prices.`);
  } catch (error) {
    console.error(`❌ [MIDNIGHT UPDATE ERROR] Failed to update solar prices:`, error);
  }
}

function scheduleNextMidnight() {
  const msUntilMidnight = getMsUntilNextMidnightPKT();
  console.log(`🕒 Next scheduled 12:00 AM midnight update in: ${formatDuration(msUntilMidnight)}`);
  
  setTimeout(async () => {
    await executeMidnightUpdate();
    // Re-schedule for next 24 hours
    scheduleNextMidnight();
  }, msUntilMidnight);
}

// Main scheduler initialization
async function startScheduler() {
  console.log(`=======================================================`);
  console.log(`🌟 SellSolar Pakistan - Midnight Price Scheduler Started`);
  console.log(`🕒 Current Time: ${getPakistanTimestamp()}`);
  console.log(`📅 Current Date: ${getPakistanDate()}`);
  console.log(`🔒 RULE: DO NOT CHANGE PRICES OF CUSTOMER OR DEALER ADS.`);
  console.log(`⏱️  Schedule: Every day at 12:00 AM (Midnight PKT)`);
  console.log(`=======================================================`);

  // If invoked with --now or first boot, perform a sync immediately so prices are accurate for today
  if (process.argv.includes('--now') || process.env.RUN_ON_BOOT === 'true') {
    console.log(`⚡ Running initial price sync for today...`);
    await executeMidnightUpdate();
  }

  scheduleNextMidnight();

  // Hourly heartbeat to keep log active and confirm readiness
  setInterval(() => {
    const msUntilMidnight = getMsUntilNextMidnightPKT();
    console.log(`[Heartbeat 💓] Midnight scheduler active. Next update in: ${formatDuration(msUntilMidnight)}`);
  }, 3600000); // every 1 hour
}

// Handle termination signals cleanly
process.on('SIGINT', () => {
  console.log('\n🛑 Midnight Price Scheduler stopped gracefully.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Midnight Price Scheduler terminated gracefully.');
  process.exit(0);
});

startScheduler();

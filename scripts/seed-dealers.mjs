import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { VERIFIED_DEALERS } from '../src/data/dealersData.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgfycrnmivfybbclflwf.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZnljcm5taXZmeWJiY2xmbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjMzNDQsImV4cCI6MjEwMzczOTM0NH0.30oiwuVIdIjaMMZGyobVqZk8HA18vVIhq2jN6jFgyao';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateDeterministicUuid(seed) {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

async function seedDealers() {
  console.log(`[Seed] Preparing to sync ${VERIFIED_DEALERS.length} verified dealers across 8 cities to Supabase...`);

  let successCount = 0;
  let skipCount = 0;

  for (const dealer of VERIFIED_DEALERS) {
    const dealerUuid = generateDeterministicUuid(`sellsolar-dealer-${dealer.phone}-${dealer.city}`);
    const email = `dealer.${dealer.phone.replace(/[^0-9]/g, '')}@dealers.sellsolar.pk`;

    const profilePayload = {
      id: dealerUuid,
      email,
      phone: dealer.phone,
      full_name: dealer.full_name,
      city: dealer.city,
      account_type: 'dealer',
      cnic: dealer.cnic,
      business_name: dealer.business_name,
      business_address: dealer.business_address,
      is_verified_dealer: true,
      registration_source: dealer.registration_source || 'ai_curated'
    };

    try {
      const { error } = await supabase.from('profiles').upsert(profilePayload, {
        onConflict: 'id'
      });

      if (error) {
        // If column registration_source doesn't exist yet in Supabase schema, fallback without it
        if (error.message?.includes('registration_source')) {
          delete profilePayload.registration_source;
          const { error: fallbackErr } = await supabase.from('profiles').upsert(profilePayload, {
            onConflict: 'id'
          });
          if (fallbackErr) {
            console.warn(`[Seed] Fallback error for ${dealer.business_name}:`, fallbackErr.message);
            skipCount++;
            continue;
          }
        } else {
          console.warn(`[Seed] Note for ${dealer.business_name}:`, error.message);
          skipCount++;
          continue;
        }
      }
      successCount++;
    } catch (e) {
      console.warn(`[Seed] Exception for ${dealer.business_name}:`, e.message);
      skipCount++;
    }
  }

  console.log(`[Seed] Complete! Synced: ${successCount}, Skipped/Existing: ${skipCount}`);
}

seedDealers();

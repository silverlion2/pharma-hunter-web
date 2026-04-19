/* eslint-disable no-undef */
/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import { fallbackData } from './src/data/mockData.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updatePatents() {
  console.log(`Updating patent data for ${fallbackData.length} assets...`);
  
  let successCount = 0;
  for (const asset of fallbackData) {
    if (asset.ip_score !== undefined) {
      const { error } = await supabase
        .from('assets')
        .update({
          ip_score: asset.ip_score,
          patent_families: asset.patent_families,
          fto_risk: asset.fto_risk,
          defensive_strategy: asset.defensive_strategy,
          key_patents: asset.key_patents
        })
        .eq('ticker', asset.ticker);
      
      if (error) {
        console.error(`Error updating ${asset.ticker}:`, error);
      } else {
        successCount++;
        console.log(`Updated ${asset.ticker}`);
      }
    }
  }
  
  console.log(`Successfully updated ${successCount} assets with patent data.`);
}

updatePatents();

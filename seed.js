/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js';
import { fallbackData } from './src/data/mockData.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedAssets() {
  console.log(`Seeding ${fallbackData.length} records into assets table...`);
  
  // Format the data to match the schema
  const rowsToInsert = fallbackData.map(asset => {
    return {
      ticker: asset.ticker,
      name: asset.name,
      score: asset.score || null,
      target_area: asset.target_area || null,
      is_past_deal: asset.is_past_deal || false,
      warning_flag: asset.warning_flag || null,
      clinical_score: asset.clinical_score || null,
      cash_score: asset.cash_score || null,
      scarcity_score: asset.scarcity_score || null,
      milestone_score: asset.milestone_score || null,
      valuation_score: asset.valuation_score || null,
      cash_amount: asset.cash_amount || null,
      runway_years: asset.runway_years || null,
      market_cap: asset.market_cap || null,
      latest_news_headline: asset.latest_news_headline || null,
      predicted_time: asset.predicted_time || null,
      estimated_premium: asset.estimated_premium || null,
      shadow_signals: asset.shadow_signals || [],
      digest: asset.digest || null
    };
  });

  const { error } = await supabase
    .from('assets')
    .upsert(rowsToInsert);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Successfully seeded assets!");
  }
}

seedAssets();

/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js';
import { outLicensingDeals } from './src/data/mockData.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedDeals() {
  console.log(`Seeding ${outLicensingDeals.length} deals into outbound_deals table...`);
  
  // Format the data to match the schema
  const rowsToInsert = outLicensingDeals.map(deal => {
    return {
      date: deal.date,
      licensor: deal.licensor,
      licensee: deal.licensee,
      value: deal.value,
      upfront: deal.upfront,
      drug: deal.drug,
      target: deal.target,
      therapeutic_area: deal.therapeuticArea,
      stage: deal.stage,
      structure: deal.structure,
      modality: deal.modality,
      notes: deal.notes
    };
  });

  const { error } = await supabase
    .from('outbound_deals')
    .insert(rowsToInsert);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Successfully seeded deals!");
  }
}

seedDeals();

-- ==========================================
-- BioQuantix Phase 6: Pipeline Gap Map Expansion
-- ==========================================

-- 1. Add new enriched columns to mnc_pipeline_gaps table
ALTER TABLE mnc_pipeline_gaps
  ADD COLUMN IF NOT EXISTS strategic_focus TEXT,
  ADD COLUMN IF NOT EXISTS budget_estimate TEXT,
  ADD COLUMN IF NOT EXISTS recent_acquisitions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_pipeline JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS key_assets JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS market_size TEXT,
  ADD COLUMN IF NOT EXISTS expiring_patents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS scientific_data_overview TEXT,
  ADD COLUMN IF NOT EXISTS primary_target_area TEXT,
  ADD COLUMN IF NOT EXISTS secondary_targets JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data's target_area to primary_target_area if needed, or keeping both
-- We'll keep target_area for backward compatibility mini-widgets, but populate primary_target_area as the SSOT going forward.
UPDATE mnc_pipeline_gaps 
SET primary_target_area = target_area 
WHERE primary_target_area IS NULL;

-- 2. Clean out old basic mock data to make room for enriched data
DELETE FROM mnc_pipeline_gaps;

-- 3. Insert Enriched Mock Data
INSERT INTO mnc_pipeline_gaps (
  mnc_name, 
  target_area, 
  primary_target_area,
  urgency_level, 
  color_code,
  strategic_focus,
  budget_estimate,
  recent_acquisitions,
  current_pipeline,
  key_assets,
  market_size,
  expiring_patents,
  scientific_data_overview,
  secondary_targets
) VALUES
-- Metabolic Candidates
(
  'Pfizer (PFE)', 
  'Metabolic', 
  'Metabolic',
  92, 
  'bg-blue-500',
  'Aggressive expansion into oral weight loss; recovering from Danuglipron clinical setbacks. Seeking differentiated MoAs in obesity/MASH to compete with NVO/LLY.',
  '$15B - $25B',
  '[{"name": "Seagen", "year": 2023, "value": "$43B", "area": "Oncology"}, {"name": "Arena Pharma", "year": 2021, "value": "$6.7B", "area": "Immunology"}]'::jsonb,
  '[{"name": "Danuglipron (Daily)", "phase": "Phase 2b", "type": "Oral GLP-1"}, {"name": "PF-06954522", "phase": "Phase 1", "type": "FGF21"}]'::jsonb,
  '[{"name": "Eliquis", "revenue_2023": "$6.7B"}, {"name": "Prevnar", "revenue_2023": "$6.4B"}]'::jsonb,
  '$100B+ Estimated TAM by 2030 (Obesity/MASH)',
  '[{"asset": "Eliquis", "year": 2026, "revenue_at_risk": "$6.7B"}, {"asset": "Ibrance", "year": 2027, "revenue_at_risk": "$4.7B"}]'::jsonb,
  'Clinical focus prioritizing lean mass preservation, gastrointestinal tolerability in oral formulations, and combo-therapies (GLP/GIP/Glucagon). Needs clean safety signals.',
  '["GLP-1", "FGF21", "Amylin"]'::jsonb
),
(
  'Novartis (NVS)', 
  'Metabolic', 
  'Metabolic',
  85, 
  'bg-cyan-500',
  'Building a radioligand and cardiovascular-metabolic powerhouse post-Sandoz spin-off. Looking for next-gen incretins or muscle-sparing metabolic assets.',
  '$10B - $15B',
  '[{"name": "MorphoSys", "year": 2024, "value": "$2.9B", "area": "Oncology"}, {"name": "DTx Pharma", "year": 2023, "value": "$1.0B", "area": "Neuro"}]'::jsonb,
  '[{"name": "Pelacarsen", "phase": "Phase 3", "type": "Lp(a)"}, {"name": "Ianalumab", "phase": "Phase 3", "type": "Sjogrens"}]'::jsonb,
  '[{"name": "Entresto", "revenue_2023": "$6.0B"}, {"name": "Cosentyx", "revenue_2023": "$5.0B"}]'::jsonb,
  '$60B+ (Cardio-Metabolic Combos)',
  '[{"asset": "Entresto", "year": 2025, "revenue_at_risk": "$6.0B"}, {"asset": "Promacta", "year": 2026, "revenue_at_risk": "$2.3B"}]'::jsonb,
  'Highly focused on long-acting (monthly/quarterly) formulations or genetic medicines (siRNA) targeting cardiovascular risk outcomes inherent to obesity.',
  '["siRNA", "PCSK9", "Glucagon"]'::jsonb
),
-- Autoimmune Candidates
(
  'AbbVie (ABBV)', 
  'Autoimmune', 
  'Autoimmune',
  95, 
  'bg-indigo-500',
  'Desperate necessity to replace Humira revenue cliff via Skyrizi/Rinvoq expansion and acquiring novel immunology blockbusters.',
  '$20B - $30B',
  '[{"name": "Cerevel", "year": 2023, "value": "$8.7B", "area": "Neuro"}, {"name": "ImmunoGen", "year": 2023, "value": "$10.1B", "area": "Oncology"}]'::jsonb,
  '[{"name": "Lutikizumab", "phase": "Phase 2", "type": "IL-1a/b"}, {"name": "Upadacitinib (expansions)", "phase": "Phase 3", "type": "JAK1"}]'::jsonb,
  '[{"name": "Humira", "revenue_2023": "$14.4B (Falling)"}, {"name": "Skyrizi", "revenue_2023": "$7.7B"}]'::jsonb,
  '$150B+ Immunology Sector',
  '[{"asset": "Humira", "year": "2023 (Active Cliff)", "revenue_at_risk": "$-8.0B YoY"}, {"asset": "Imbruvica", "year": 2026, "revenue_at_risk": "$3.6B"}]'::jsonb,
  'Seeking differentiated MoAs for IBD, Rheumatology, and Derm that can demonstrate superiority over existing TL1A or JAK inhibitors.',
  '["IL-23", "TL1A", "JAK", "FcRn"]'::jsonb
),
(
  'Sanofi (SNY)', 
  'Autoimmune', 
  'Autoimmune',
  88, 
  'bg-blue-500',
  'Pivoting hard into "Immunology First" strategy to ride the Dupixent wave and discover its oral successor. Aggressively licensing early-stage auto-immune assets.',
  '$8B - $12B',
  '[{"name": "Inhibrx", "year": 2024, "value": "$1.7B", "area": "Rare"}, {"name": "Provention Bio", "year": 2023, "value": "$2.9B", "area": "Autoimmune"}]'::jsonb,
  '[{"name": "Amlitelimab", "phase": "Phase 2", "type": "OX40L"}, {"name": "Frexalimab", "phase": "Phase 2", "type": "CD40L"}]'::jsonb,
  '[{"name": "Dupixent", "revenue_2023": "€10.7B"}, {"name": "Aubagio", "revenue_2023": "€0.9B (Fallen)"}]'::jsonb,
  '$80B+ (Dermatology & Respiratory Immunology)',
  '[{"asset": "Aubagio", "year": "2023 (Active Cliff)", "revenue_at_risk": "€1.0B"}, {"asset": "Dupixent", "year": "2031", "revenue_at_risk": "€15B+"}]'::jsonb,
  'Urgent need for oral immunology assets (degraders, IRAK4, BTK) to protect the franchise from oral competition to Dupixent.',
  '["OX40L", "IRAK4", "Oral Degraders", "BTK"]'::jsonb
),
-- Oncology Candidates
(
  'Merck (MRK)', 
  'Oncology', 
  'Oncology',
  98, 
  'bg-red-500',
  'The Keytruda 2028 patent cliff represents the largest single-drug revenue hole in pharma history. Merck is buying everything with ADC or Next-Gen IO potential.',
  '$30B+',
  '[{"name": "Prometheus", "year": 2023, "value": "$10.8B", "area": "Immunology"}, {"name": "Seagen (Attempt)", "year": 2023, "value": "Missed", "area": "ADC"}]'::jsonb,
  '[{"name": "V116 (Vaccine)", "phase": "Pre-Registration"}, {"name": "MK-2870", "phase": "Phase 3", "type": "TROP2 ADC"}]'::jsonb,
  '[{"name": "Keytruda", "revenue_2023": "$25.0B"}, {"name": "Gardasil", "revenue_2023": "$8.9B"}]'::jsonb,
  '$250B+ Broad Oncology TAM',
  '[{"asset": "Keytruda", "year": "2028 (LOE)", "revenue_at_risk": "$25B+"}, {"asset": "Januvia", "year": 2026, "revenue_at_risk": "$2.0B"}]'::jsonb,
  'Primarily seeking Antibody-Drug Conjugates (ADCs), radiopharma, and novel IO combos to secure market dominance post-Keytruda.',
  '["ADC", "TROP2", "Claudin", "Radiopharma"]'::jsonb
);

-- Note: In a real Supabase environment with RLS, ensure appropriate policies exist.
-- Doing nothing for policies here assuming they were handled in basic setup or admin has total bypass.

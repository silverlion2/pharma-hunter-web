-- 12_dual_compliance_radar.sql
-- Adds Geopolitical Risk and FDA Readiness tracking for US investors looking at China assets.

-- Ensure the base assets table exists before altering
CREATE TABLE IF NOT EXISTS public.assets (
    ticker text PRIMARY KEY,
    name text,
    score real,
    target_area text,
    is_past_deal boolean DEFAULT false,
    warning_flag text,
    clinical_score real,
    cash_score real,
    scarcity_score real,
    milestone_score real,
    valuation_score real,
    cash_amount text,
    runway_years text,
    market_cap text,
    latest_news_headline text,
    predicted_time text,
    estimated_premium text,
    shadow_signals jsonb DEFAULT '[]'::jsonb,
    digest text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    if not exists (select 1 from pg_policies where policyname = 'Allow public read access on assets') then
        CREATE POLICY "Allow public read access on assets" ON public.assets FOR SELECT USING (true);
    end if;
END
$$;


-- Now add the geopolitical columns
ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS biosecure_flag boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hgr_conflict boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS geopolitical_risk_score real DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS fda_readiness_score real DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS cross_border_deal_comps jsonb DEFAULT '[]'::jsonb;

-- biosecure_flag: True if asset has reliance on Persons of Concern (e.g. WuXi AppTec/Biologics)
-- hgr_conflict: True if asset clinical data relies heavily on China-only genomic/patient data protected under Decree 834.
-- geopolitical_risk_score: 0 to 100 limit (where 100 means high risk of US rejection or tech-transfer blockage)
-- fda_readiness_score: 0 to 100 limit (where 100 means MRCT validated and non-China SOC compliant)

-- 08_assets_table.sql
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

-- Note: RLS policies can be added if needed, but for now we assume admin bypass or anon reads if public
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on assets"
ON public.assets FOR SELECT
USING (true);

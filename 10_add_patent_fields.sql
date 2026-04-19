-- 10_add_patent_fields.sql

ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS ip_score numeric,
ADD COLUMN IF NOT EXISTS patent_families integer,
ADD COLUMN IF NOT EXISTS fto_risk text,
ADD COLUMN IF NOT EXISTS defensive_strategy text,
ADD COLUMN IF NOT EXISTS key_patents jsonb;

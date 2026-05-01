-- 13_analytics_rpc.sql

-- Drop the function if it exists to allow re-running
DROP FUNCTION IF EXISTS public.get_analytics_leaderboard();

-- Create an RPC to fetch top assets for the 5 analytics categories concurrently
CREATE OR REPLACE FUNCTION public.get_analytics_leaderboard()
RETURNS jsonb AS $$
DECLARE
    scarcity_data jsonb;
    cash_data jsonb;
    clinical_data jsonb;
    milestone_data jsonb;
    valuation_data jsonb;
    result jsonb;
BEGIN
    -- Top Scarcity
    SELECT jsonb_agg(row_to_json(t)) INTO scarcity_data FROM (
        SELECT ticker, name, scarcity_score, score, target_area, is_past_deal
        FROM public.assets
        WHERE is_past_deal = false
        ORDER BY scarcity_score DESC NULLS LAST, score DESC NULLS LAST
        LIMIT 10
    ) t;

    -- Top Cash Pressure
    SELECT jsonb_agg(row_to_json(t)) INTO cash_data FROM (
        SELECT ticker, name, cash_score, score, target_area, is_past_deal
        FROM public.assets
        WHERE is_past_deal = false
        ORDER BY cash_score DESC NULLS LAST, score DESC NULLS LAST
        LIMIT 10
    ) t;

    -- Top Clinical
    SELECT jsonb_agg(row_to_json(t)) INTO clinical_data FROM (
        SELECT ticker, name, clinical_score, score, target_area, is_past_deal
        FROM public.assets
        WHERE is_past_deal = false
        ORDER BY clinical_score DESC NULLS LAST, score DESC NULLS LAST
        LIMIT 10
    ) t;

    -- Top Milestone / Catalyst
    SELECT jsonb_agg(row_to_json(t)) INTO milestone_data FROM (
        SELECT ticker, name, milestone_score, score, target_area, is_past_deal, predicted_time
        FROM public.assets
        WHERE is_past_deal = false
        ORDER BY milestone_score DESC NULLS LAST, score DESC NULLS LAST
        LIMIT 10
    ) t;

    -- Top Valuation Gap
    SELECT jsonb_agg(row_to_json(t)) INTO valuation_data FROM (
        SELECT ticker, name, valuation_score, score, target_area, is_past_deal
        FROM public.assets
        WHERE is_past_deal = false
        ORDER BY valuation_score DESC NULLS LAST, score DESC NULLS LAST
        LIMIT 10
    ) t;

    -- Build composite JSON result
    result := jsonb_build_object(
        'topScarcity', COALESCE(scarcity_data, '[]'::jsonb),
        'topCashPressure', COALESCE(cash_data, '[]'::jsonb),
        'topClinical', COALESCE(clinical_data, '[]'::jsonb),
        'topCatalysts', COALESCE(milestone_data, '[]'::jsonb),
        'topValue', COALESCE(valuation_data, '[]'::jsonb)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public/anon to allow frontend to call it
GRANT EXECUTE ON FUNCTION public.get_analytics_leaderboard() TO anon, authenticated;

-- 09_deals_and_alerts.sql

-- 1. Create outbound_deals table
CREATE TABLE IF NOT EXISTS public.outbound_deals (
    id serial PRIMARY KEY,
    date text,
    licensor text,
    licensee text,
    value text,
    upfront text,
    drug text,
    target text,
    therapeutic_area text,
    stage text,
    structure text,
    modality text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.outbound_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on outbound_deals"
ON public.outbound_deals FOR SELECT
USING (true);

-- 2. Create the Alert Notification Trigger on assets.shadow_signals
CREATE OR REPLACE FUNCTION notify_high_intent_shadow_signal()
RETURNS trigger AS $$
DECLARE
    new_signal jsonb;
    ticker_val text;
    user_record RECORD;
BEGIN
    ticker_val := NEW.ticker;
    
    -- In a real production scenario, we'd iterate over NEW.shadow_signals and compare with OLD.shadow_signals
    -- Next, we find users tracking this ticker who should be notified.
    
    -- Very basic check: If the lengths are different, assume a new signal was added
    IF jsonb_array_length(NEW.shadow_signals) > COALESCE(jsonb_array_length(OLD.shadow_signals), 0) THEN
        -- Get the latest signal added (assuming the last element is newest, or just checking if any exists)
        FOR new_signal IN SELECT * FROM jsonb_array_elements(NEW.shadow_signals)
        LOOP
            -- If we find a HIGH-INTENT or STRATEGIC signal, we push to alert_notifications
            IF new_signal->>'mood' IN ('HIGH-INTENT', 'STRATEGIC') THEN
                
                -- Find all users tracking this ticker
                FOR user_record IN SELECT user_id FROM public.user_tracked_tickers WHERE ticker = ticker_val
                LOOP
                    -- Insert notification
                    INSERT INTO public.alert_notifications (user_id, ticker, title, message)
                    VALUES (
                        user_record.user_id,
                        ticker_val,
                        'New ' || (new_signal->>'type') || ' Signal',
                        new_signal->>'desc'
                    );
                END LOOP;
                
                -- Break after processing to avoid duplicate notifications per update
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_new_shadow_signals ON public.assets;
CREATE TRIGGER check_new_shadow_signals
AFTER UPDATE OF shadow_signals ON public.assets
FOR EACH ROW
EXECUTE FUNCTION notify_high_intent_shadow_signal();

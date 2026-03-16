-- Table for user-configured alerts
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker text NOT NULL,
  alert_type text NOT NULL, -- 'QUANT_RISE', 'QUANT_DROP', 'SCARCITY_RISE', 'CASH_STRAIN', 'STATUS_CHANGE', 'NEW_NEWS', 'SMART_MONEY'
  threshold_value numeric,  -- Used for numeric comparisons
  threshold_text text,      -- Used for text comparisons (e.g. 'IMMINENT')
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_alerts
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own alerts
CREATE POLICY "Users can view their own alerts" ON public.user_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" ON public.user_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.user_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON public.user_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Table for generated in-app notifications
CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for alert_notifications
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own notifications
CREATE POLICY "Users can view their own notifications" ON public.alert_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.alert_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications are typically inserted by a backend process using the Service Role Key, 
-- which bypasses RLS. But here is the policy just in case.
CREATE POLICY "Backend can insert notifications" ON public.alert_notifications
  FOR INSERT WITH CHECK (true); 

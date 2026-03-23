-- 07_free_pro_trial.sql
-- Enables the 15-Day Free PRO Trial Promotion for new signups

-- 1. Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'free',
    trial_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own role
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Create or replace RPC to get user role with auto-downgrade logic
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TABLE (role TEXT) AS $$
DECLARE
    v_role TEXT;
    v_trial_expires TIMESTAMPTZ;
BEGIN
    -- Fetch current role and trial status
    SELECT ur.role, ur.trial_expires_at 
    INTO v_role, v_trial_expires
    FROM public.user_roles ur
    WHERE ur.user_id = $1;

    -- If no record exists, default to free
    IF v_role IS NULL THEN
        RETURN QUERY SELECT 'free'::TEXT;
        RETURN;
    END IF;

    -- Auto-downgrade logic: If they are 'pro', have an expiry date, and it has passed
    IF v_role = 'pro' AND v_trial_expires IS NOT NULL AND v_trial_expires < now() THEN
        UPDATE public.user_roles 
        SET role = 'free'
        WHERE public.user_roles.user_id = $1;
        
        v_role := 'free';
    END IF;

    RETURN QUERY SELECT v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger function to give 15 days free PRO on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, trial_expires_at)
  VALUES (new.id, 'pro', now() + interval '15 days')
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'pro', 
      trial_expires_at = now() + interval '15 days';
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_trial();

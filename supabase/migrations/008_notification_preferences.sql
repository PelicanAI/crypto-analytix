-- 008: notification_preferences table
-- Per-user notification type toggles

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  funding_rate bool DEFAULT true,
  whale_moves bool DEFAULT true,
  analyst_calls bool DEFAULT true,
  price_levels bool DEFAULT true,
  correlation bool DEFAULT false,
  daily_brief bool DEFAULT true,
  calendar_events bool DEFAULT true,
  trading_rule_violations bool DEFAULT true
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.notification_preferences;
CREATE POLICY "Users can view own data" ON public.notification_preferences
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.notification_preferences;
CREATE POLICY "Users can insert own data" ON public.notification_preferences
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.notification_preferences;
CREATE POLICY "Users can update own data" ON public.notification_preferences
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.notification_preferences;
CREATE POLICY "Users can delete own data" ON public.notification_preferences
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.notification_preferences;
CREATE POLICY "Service role full access" ON public.notification_preferences
  TO service_role USING (true) WITH CHECK (true);

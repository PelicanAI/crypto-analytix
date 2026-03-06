-- 001: user_credits table
-- User profile, subscription, and onboarding state

CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_balance int DEFAULT 0,
  credits_used_this_month int DEFAULT 0,
  plan_type text DEFAULT 'free',
  plan_credits_monthly int DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  free_questions_remaining int DEFAULT 10,
  is_admin bool DEFAULT false,
  terms_accepted bool DEFAULT false,
  experience_level text,
  onboarding_complete bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.user_credits;
CREATE POLICY "Users can view own data" ON public.user_credits
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.user_credits;
CREATE POLICY "Users can insert own data" ON public.user_credits
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.user_credits;
CREATE POLICY "Users can update own data" ON public.user_credits
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.user_credits;
CREATE POLICY "Users can delete own data" ON public.user_credits
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.user_credits;
CREATE POLICY "Service role full access" ON public.user_credits
  TO service_role USING (true) WITH CHECK (true);

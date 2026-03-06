-- 005: portfolio_snapshots table
-- Daily portfolio value snapshots for historical charts

CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value numeric,
  btc_allocation numeric,
  eth_allocation numeric,
  alt_allocation numeric,
  tradfi_allocation numeric,
  btc_correlation numeric,
  snapshot_date date
);

ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.portfolio_snapshots;
CREATE POLICY "Users can view own data" ON public.portfolio_snapshots
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.portfolio_snapshots;
CREATE POLICY "Users can insert own data" ON public.portfolio_snapshots
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.portfolio_snapshots;
CREATE POLICY "Users can update own data" ON public.portfolio_snapshots
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.portfolio_snapshots;
CREATE POLICY "Users can delete own data" ON public.portfolio_snapshots
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.portfolio_snapshots;
CREATE POLICY "Service role full access" ON public.portfolio_snapshots
  TO service_role USING (true) WITH CHECK (true);

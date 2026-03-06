-- 004: crypto_positions table
-- Unified portfolio positions from SnapTrade + wallets

CREATE TABLE IF NOT EXISTS public.crypto_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  source text,
  source_id text,
  asset text,
  chain text,
  quantity numeric,
  avg_entry_price numeric,
  current_price numeric,
  unrealized_pnl numeric,
  unrealized_pnl_pct numeric,
  allocation_pct numeric,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE public.crypto_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.crypto_positions;
CREATE POLICY "Users can view own data" ON public.crypto_positions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.crypto_positions;
CREATE POLICY "Users can insert own data" ON public.crypto_positions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.crypto_positions;
CREATE POLICY "Users can update own data" ON public.crypto_positions
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.crypto_positions;
CREATE POLICY "Users can delete own data" ON public.crypto_positions
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.crypto_positions;
CREATE POLICY "Service role full access" ON public.crypto_positions
  TO service_role USING (true) WITH CHECK (true);

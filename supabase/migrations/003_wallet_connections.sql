-- 003: wallet_connections table
-- User-pasted wallet addresses (EVM/Solana/Bitcoin)

CREATE TABLE IF NOT EXISTS public.wallet_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  chain text,
  address text,
  label text,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.wallet_connections;
CREATE POLICY "Users can view own data" ON public.wallet_connections
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.wallet_connections;
CREATE POLICY "Users can insert own data" ON public.wallet_connections
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.wallet_connections;
CREATE POLICY "Users can update own data" ON public.wallet_connections
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.wallet_connections;
CREATE POLICY "Users can delete own data" ON public.wallet_connections
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.wallet_connections;
CREATE POLICY "Service role full access" ON public.wallet_connections
  TO service_role USING (true) WITH CHECK (true);

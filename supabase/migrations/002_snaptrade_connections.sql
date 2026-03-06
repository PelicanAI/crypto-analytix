-- 002: snaptrade_connections table
-- Exchange/broker connections via SnapTrade OAuth

CREATE TABLE IF NOT EXISTS public.snaptrade_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  snaptrade_user_id text,
  snaptrade_user_secret_encrypted text,
  broker_name text,
  account_ids text[],
  last_sync timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.snaptrade_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.snaptrade_connections;
CREATE POLICY "Users can view own data" ON public.snaptrade_connections
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.snaptrade_connections;
CREATE POLICY "Users can insert own data" ON public.snaptrade_connections
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.snaptrade_connections;
CREATE POLICY "Users can update own data" ON public.snaptrade_connections
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.snaptrade_connections;
CREATE POLICY "Users can delete own data" ON public.snaptrade_connections
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.snaptrade_connections;
CREATE POLICY "Service role full access" ON public.snaptrade_connections
  TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- Crypto Analytix — Combined Database Setup
-- =============================================================================
-- Run this file to set up the complete database schema from scratch.
-- Individual migrations are in supabase/migrations/
-- Generated from migrations 001-010
-- =============================================================================

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

-- =============================================================================

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

-- =============================================================================

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

-- =============================================================================

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

-- =============================================================================

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

-- =============================================================================

-- 006: pelican_conversations table
-- Pelican AI conversation sessions with context

CREATE TABLE IF NOT EXISTS public.pelican_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type text,
  context_data jsonb,
  persist bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pelican_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.pelican_conversations;
CREATE POLICY "Users can view own data" ON public.pelican_conversations
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.pelican_conversations;
CREATE POLICY "Users can insert own data" ON public.pelican_conversations
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.pelican_conversations;
CREATE POLICY "Users can update own data" ON public.pelican_conversations
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.pelican_conversations;
CREATE POLICY "Users can delete own data" ON public.pelican_conversations
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.pelican_conversations;
CREATE POLICY "Service role full access" ON public.pelican_conversations
  TO service_role USING (true) WITH CHECK (true);

-- =============================================================================

-- 007: pelican_messages table
-- Individual messages within Pelican conversations
-- RLS joins through pelican_conversations for user_id check

CREATE TABLE IF NOT EXISTS public.pelican_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.pelican_conversations(id) ON DELETE CASCADE,
  role text,
  content text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE public.pelican_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.pelican_messages;
CREATE POLICY "Users can view own data" ON public.pelican_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.pelican_conversations
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own data" ON public.pelican_messages;
CREATE POLICY "Users can insert own data" ON public.pelican_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.pelican_conversations
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own data" ON public.pelican_messages;
CREATE POLICY "Users can update own data" ON public.pelican_messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM public.pelican_conversations
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own data" ON public.pelican_messages;
CREATE POLICY "Users can delete own data" ON public.pelican_messages
  FOR DELETE USING (
    conversation_id IN (
      SELECT id FROM public.pelican_conversations
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Service role full access" ON public.pelican_messages;
CREATE POLICY "Service role full access" ON public.pelican_messages
  TO service_role USING (true) WITH CHECK (true);

-- =============================================================================

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

-- =============================================================================

-- 009: education_progress table
-- Tracks which education modules each user has completed

CREATE TABLE IF NOT EXISTS public.education_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug text,
  completed bool DEFAULT false,
  completed_at timestamptz
);

ALTER TABLE public.education_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.education_progress;
CREATE POLICY "Users can view own data" ON public.education_progress
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own data" ON public.education_progress;
CREATE POLICY "Users can insert own data" ON public.education_progress
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.education_progress;
CREATE POLICY "Users can update own data" ON public.education_progress
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own data" ON public.education_progress;
CREATE POLICY "Users can delete own data" ON public.education_progress
  FOR DELETE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full access" ON public.education_progress;
CREATE POLICY "Service role full access" ON public.education_progress
  TO service_role USING (true) WITH CHECK (true);

-- =============================================================================

-- 010: Functions and triggers
-- handle_new_user: auto-creates user_credits + notification_preferences on signup
-- get_crypto_context: assembles all user context for Pelican AI

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_crypto_context(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_positions jsonb;
  v_snapshot jsonb;
  v_snaptrade jsonb;
  v_user_profile jsonb;
  v_education jsonb;
BEGIN
  -- Current positions
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', cp.id,
      'source', cp.source,
      'asset', cp.asset,
      'chain', cp.chain,
      'quantity', cp.quantity,
      'avg_entry_price', cp.avg_entry_price,
      'current_price', cp.current_price,
      'unrealized_pnl', cp.unrealized_pnl,
      'unrealized_pnl_pct', cp.unrealized_pnl_pct,
      'allocation_pct', cp.allocation_pct,
      'last_updated', cp.last_updated
    )
  ), '[]'::jsonb)
  INTO v_positions
  FROM public.crypto_positions cp
  WHERE cp.user_id = p_user_id;

  -- Latest portfolio snapshot
  SELECT COALESCE(
    jsonb_build_object(
      'total_value', ps.total_value,
      'btc_allocation', ps.btc_allocation,
      'eth_allocation', ps.eth_allocation,
      'alt_allocation', ps.alt_allocation,
      'tradfi_allocation', ps.tradfi_allocation,
      'btc_correlation', ps.btc_correlation,
      'snapshot_date', ps.snapshot_date
    ),
    '{}'::jsonb
  )
  INTO v_snapshot
  FROM public.portfolio_snapshots ps
  WHERE ps.user_id = p_user_id
  ORDER BY ps.snapshot_date DESC
  LIMIT 1;

  IF v_snapshot IS NULL THEN
    v_snapshot := '{}'::jsonb;
  END IF;

  -- SnapTrade connection status
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'broker_name', sc.broker_name,
      'status', sc.status,
      'last_sync', sc.last_sync,
      'account_ids', sc.account_ids
    )
  ), '[]'::jsonb)
  INTO v_snaptrade
  FROM public.snaptrade_connections sc
  WHERE sc.user_id = p_user_id;

  -- User profile (experience level, onboarding)
  SELECT COALESCE(
    jsonb_build_object(
      'experience_level', uc.experience_level,
      'onboarding_complete', uc.onboarding_complete,
      'plan_type', uc.plan_type,
      'credits_balance', uc.credits_balance,
      'free_questions_remaining', uc.free_questions_remaining
    ),
    '{}'::jsonb
  )
  INTO v_user_profile
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;

  IF v_user_profile IS NULL THEN
    v_user_profile := '{}'::jsonb;
  END IF;

  -- Education progress
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'module_slug', ep.module_slug,
      'completed', ep.completed,
      'completed_at', ep.completed_at
    )
  ), '[]'::jsonb)
  INTO v_education
  FROM public.education_progress ep
  WHERE ep.user_id = p_user_id;

  -- Assemble final result
  result := jsonb_build_object(
    'positions', v_positions,
    'portfolio_snapshot', v_snapshot,
    'snaptrade_connections', v_snaptrade,
    'user_profile', v_user_profile,
    'education_progress', v_education
  );

  RETURN result;
END;
$$;

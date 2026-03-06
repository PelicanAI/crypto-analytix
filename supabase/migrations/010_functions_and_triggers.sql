-- 010: Functions and triggers
-- handle_new_user: auto-creates user_credits + notification_preferences on signup
-- get_crypto_context: assembles all user context for Pelican AI

-- =============================================================================
-- handle_new_user() — Trigger function on auth.users INSERT
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user_credits row with free tier defaults
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create notification_preferences row with defaults
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (drop first for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- get_crypto_context(p_user_id) — Assembles all user context for Pelican AI
-- =============================================================================
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

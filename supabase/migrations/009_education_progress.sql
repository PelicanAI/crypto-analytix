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

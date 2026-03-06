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

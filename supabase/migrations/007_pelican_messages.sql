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

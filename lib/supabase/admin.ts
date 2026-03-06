import { createClient } from '@supabase/supabase-js'

/**
 * Admin client with service role key — bypasses RLS.
 * ONLY for server-side admin/backend operations.
 * NEVER import this in client components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

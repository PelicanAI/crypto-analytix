import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// POST /api/brief/activity — upsert last_active timestamp
// ---------------------------------------------------------------------------

export async function POST() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: upsertError } = await supabase
      .from('user_sessions')
      .upsert(
        { user_id: user.id, last_active: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      logger.error('Failed to upsert user_sessions', { error: upsertError.message })
      return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Activity update failed', { error: error.message })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

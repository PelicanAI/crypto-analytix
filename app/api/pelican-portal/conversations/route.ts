import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/pelican-portal/conversations
 * List conversations for the authenticated user, ordered by most recent.
 */
export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('pelican_portal_conversations')
      .select('id, title, last_message_preview, message_count, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(30)

    if (error) {
      logger.error('Failed to fetch portal conversations', { error: error.message })
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    return NextResponse.json({ conversations: data || [] })
  } catch (err) {
    logger.error('Portal conversations GET error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/pelican-portal/conversations
 * Create a new conversation.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === 'string' ? body.title.slice(0, 200) : null

    const { data, error } = await supabase
      .from('pelican_portal_conversations')
      .insert({
        user_id: user.id,
        title,
        last_message_preview: null,
        message_count: 0,
      })
      .select('id, title, last_message_preview, message_count, created_at, updated_at')
      .single()

    if (error) {
      logger.error('Failed to create portal conversation', { error: error.message })
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ conversation: data }, { status: 201 })
  } catch (err) {
    logger.error('Portal conversations POST error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

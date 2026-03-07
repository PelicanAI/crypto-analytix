import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/pelican-portal/conversations/[id]
 * Delete a conversation and its messages. Verifies ownership.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify conversation belongs to user
    const { data: conversation, error: fetchError } = await supabase
      .from('pelican_portal_conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Delete messages first (child records)
    await supabase
      .from('pelican_portal_messages')
      .delete()
      .eq('conversation_id', id)

    // Delete conversation
    const { error: deleteError } = await supabase
      .from('pelican_portal_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      logger.error('Failed to delete portal conversation', { error: deleteError.message })
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('Portal conversation DELETE error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

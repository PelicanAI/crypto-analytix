import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/pelican-portal/conversations/[id]/messages
 * List messages for a conversation. Verifies ownership.
 */
export async function GET(
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
    const { data: conversation, error: convError } = await supabase
      .from('pelican_portal_conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('pelican_portal_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch portal messages', { error: error.message })
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: data || [] })
  } catch (err) {
    logger.error('Portal messages GET error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/pelican-portal/conversations/[id]/messages
 * Add a message to a conversation. Verifies ownership.
 * If role=assistant: updates conversation preview + count.
 * If role=user and no title: sets title from first 50 chars.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role, content } = body

    if (!role || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing role or content' }, { status: 400 })
    }

    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('pelican_portal_conversations')
      .select('id, title, message_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('pelican_portal_messages')
      .insert({
        conversation_id: id,
        role,
        content,
      })
      .select('id, role, content, created_at')
      .single()

    if (insertError) {
      logger.error('Failed to insert portal message', { error: insertError.message })
      return NextResponse.json({ error: 'Failed to add message' }, { status: 500 })
    }

    // Update conversation metadata
    const updates: Record<string, unknown> = {
      message_count: (conversation.message_count || 0) + 1,
      updated_at: new Date().toISOString(),
    }

    // Assistant message: update preview
    if (role === 'assistant') {
      updates.last_message_preview = content.slice(0, 120)
    }

    // User message with no title: set title from content
    if (role === 'user' && !conversation.title) {
      updates.title = content.slice(0, 50)
    }

    await supabase
      .from('pelican_portal_conversations')
      .update(updates)
      .eq('id', id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    logger.error('Portal messages POST error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

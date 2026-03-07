import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { registerUser, generateConnectionLink, SnapTradeError } from '@/lib/snaptrade'
import { logger } from '@/lib/logger'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check for existing SnapTrade connection
    const { data: existing, error: fetchError } = await supabase
      .from('snaptrade_connections')
      .select('snaptrade_user_id, snaptrade_user_secret_encrypted')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      logger.error('Failed to fetch SnapTrade connection', { userId: user.id, error: fetchError.message })
      return NextResponse.json({ error: 'Failed to check connection status' }, { status: 500 })
    }

    let snapTradeUserId: string
    let snapTradeUserSecret: string

    if (existing) {
      // Use existing SnapTrade credentials
      snapTradeUserId = existing.snaptrade_user_id
      snapTradeUserSecret = existing.snaptrade_user_secret_encrypted
    } else {
      // Register new SnapTrade user
      const registration = await registerUser(user.id)
      snapTradeUserId = registration.userId
      snapTradeUserSecret = registration.userSecret

      const { error: insertError } = await supabase
        .from('snaptrade_connections')
        .insert({
          user_id: user.id,
          snaptrade_user_id: snapTradeUserId,
          snaptrade_user_secret_encrypted: snapTradeUserSecret,
          broker_name: 'pending',
          account_ids: [],
          status: 'active',
        })

      if (insertError) {
        logger.error('Failed to store SnapTrade connection', { userId: user.id, error: insertError.message })
        return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
      }
    }

    // Parse optional broker preference from request body
    let broker: string | undefined
    try {
      const body = await request.json()
      broker = body.broker
    } catch {
      // No body or invalid JSON — that's fine, broker is optional
    }

    const redirectUrl = await generateConnectionLink(snapTradeUserId, snapTradeUserSecret, broker)

    return NextResponse.json({ redirectUrl })
  } catch (error) {
    if (error instanceof SnapTradeError) {
      logger.error('SnapTrade connect error', { userId: user.id, code: error.code })
      // Return a fallback so the UI can handle gracefully
      return NextResponse.json(
        { redirectUrl: '#', error: 'Exchange connection service is temporarily unavailable' },
        { status: 503 }
      )
    }

    logger.error('Unexpected error in snaptrade connect', {
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const maxDuration = 10
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (authError || !user) {
    logger.warn('Unauthenticated SnapTrade callback')
    return NextResponse.redirect(`${appUrl}/auth/login?error=unauthorized`)
  }

  try {
    const { searchParams } = request.nextUrl
    const authorizationId = searchParams.get('authorizationId')
    const brokerName = searchParams.get('brokerage') || searchParams.get('broker')

    if (!authorizationId) {
      logger.warn('SnapTrade callback missing authorizationId', { userId: user.id })
      return NextResponse.redirect(`${appUrl}/portfolio?connected=false&error=missing_auth`)
    }

    // Update the connection record
    const updateData: Record<string, unknown> = {
      status: 'active',
      last_sync: new Date().toISOString(),
    }
    if (brokerName) {
      updateData.broker_name = brokerName
    }

    const { error: updateError } = await supabase
      .from('snaptrade_connections')
      .update(updateData)
      .eq('user_id', user.id)

    if (updateError) {
      logger.error('Failed to update SnapTrade connection on callback', {
        userId: user.id,
        error: updateError.message,
      })
    }

    logger.info('SnapTrade connection callback successful', {
      userId: user.id,
      authorizationId,
      broker: brokerName,
    })

    return NextResponse.redirect(`${appUrl}/portfolio?connected=true`)
  } catch (error) {
    logger.error('Unexpected error in SnapTrade callback', {
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.redirect(`${appUrl}/portfolio?connected=false&error=callback_failed`)
  }
}

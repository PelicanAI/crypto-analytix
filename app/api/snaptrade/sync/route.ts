import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { listAccounts, getPositions, getBalances, SnapTradeError } from '@/lib/snaptrade'
import { logger } from '@/lib/logger'
import type { CryptoPosition } from '@/types/portfolio'
import type { SnapTradePosition } from '@/types/snaptrade'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

function extractTicker(symbol: string): string {
  // SnapTrade symbols may come as "BTC.USD", "BTC-USD", "BTCUSD", etc.
  // Extract the base asset ticker
  const cleaned = symbol.replace(/[.\-/]?(USD|USDT|USDC|EUR|GBP|CAD)$/i, '')
  return cleaned.toUpperCase()
}

function normalizePosition(
  snapPosition: SnapTradePosition,
  userId: string,
  accountId: string
): Omit<CryptoPosition, 'id' | 'allocation_pct'> {
  const entryPrice = snapPosition.average_purchase_price ?? snapPosition.price
  const currentPrice = snapPosition.price
  const unrealizedPnl = (currentPrice - entryPrice) * snapPosition.units
  const unrealizedPnlPct = entryPrice > 0
    ? ((currentPrice - entryPrice) / entryPrice) * 100
    : 0

  return {
    user_id: userId,
    source: 'snaptrade' as const,
    source_id: accountId,
    asset: extractTicker(snapPosition.symbol),
    chain: null,
    quantity: snapPosition.units,
    avg_entry_price: entryPrice,
    current_price: currentPrice,
    unrealized_pnl: Math.round(unrealizedPnl * 100) / 100,
    unrealized_pnl_pct: Math.round(unrealizedPnlPct * 100) / 100,
    last_updated: new Date().toISOString(),
  }
}

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch active connections
    const { data: connections, error: connError } = await supabase
      .from('snaptrade_connections')
      .select('id, snaptrade_user_id, snaptrade_user_secret_encrypted, status')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (connError) {
      logger.error('Failed to fetch SnapTrade connections', { userId: user.id, error: connError.message })
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({ positions: [], synced: false })
    }

    const allPositions: Omit<CryptoPosition, 'id' | 'allocation_pct'>[] = []
    let partial = false

    for (const connection of connections) {
      try {
        const accounts = await listAccounts(
          connection.snaptrade_user_id,
          connection.snaptrade_user_secret_encrypted
        )

        for (const account of accounts) {
          try {
            const [positions, balances] = await Promise.all([
              getPositions(connection.snaptrade_user_id, connection.snaptrade_user_secret_encrypted, account.id),
              getBalances(connection.snaptrade_user_id, connection.snaptrade_user_secret_encrypted, account.id),
            ])

            // Normalize positions
            for (const pos of positions) {
              if (pos.units > 0) {
                allPositions.push(normalizePosition(pos, user.id, account.id))
              }
            }

            // Include cash balances as positions for portfolio tracking
            for (const bal of balances) {
              if (bal.cash > 0 && bal.currency) {
                allPositions.push({
                  user_id: user.id,
                  source: 'snaptrade',
                  source_id: account.id,
                  asset: bal.currency.toUpperCase(),
                  chain: null,
                  quantity: bal.cash,
                  avg_entry_price: 1,
                  current_price: 1,
                  unrealized_pnl: 0,
                  unrealized_pnl_pct: 0,
                  last_updated: new Date().toISOString(),
                })
              }
            }
          } catch (error) {
            partial = true
            logger.error('Failed to sync account', {
              userId: user.id,
              accountId: account.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }

        // Update last_sync on the connection
        await supabase
          .from('snaptrade_connections')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', connection.id)
      } catch (error) {
        partial = true
        logger.error('Failed to sync connection', {
          userId: user.id,
          connectionId: connection.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Calculate allocation percentages
    const totalValue = allPositions.reduce(
      (sum, pos) => sum + pos.quantity * pos.current_price,
      0
    )

    const positionsWithAllocation = allPositions.map(pos => ({
      ...pos,
      allocation_pct: totalValue > 0
        ? Math.round((pos.quantity * pos.current_price / totalValue) * 10000) / 100
        : 0,
    }))

    // Upsert positions: match on user_id + asset + source_id
    if (positionsWithAllocation.length > 0) {
      // Delete existing snaptrade positions for this user that are no longer present
      const currentAssetKeys = positionsWithAllocation.map(
        p => `${p.asset}:${p.source_id}`
      )

      const { data: existingPositions } = await supabase
        .from('crypto_positions')
        .select('id, asset, source_id')
        .eq('user_id', user.id)
        .eq('source', 'snaptrade')

      if (existingPositions) {
        const toDelete = existingPositions.filter(
          ep => !currentAssetKeys.includes(`${ep.asset}:${ep.source_id}`)
        )
        if (toDelete.length > 0) {
          await supabase
            .from('crypto_positions')
            .delete()
            .in('id', toDelete.map(d => d.id))
        }
      }

      // Upsert current positions
      const { error: upsertError } = await supabase
        .from('crypto_positions')
        .upsert(
          positionsWithAllocation.map(pos => ({
            user_id: pos.user_id,
            source: pos.source,
            source_id: pos.source_id,
            asset: pos.asset,
            chain: pos.chain,
            quantity: pos.quantity,
            avg_entry_price: pos.avg_entry_price,
            current_price: pos.current_price,
            unrealized_pnl: pos.unrealized_pnl,
            unrealized_pnl_pct: pos.unrealized_pnl_pct,
            allocation_pct: pos.allocation_pct,
            last_updated: pos.last_updated,
          })),
          { onConflict: 'user_id,asset,source_id' }
        )

      if (upsertError) {
        logger.error('Failed to upsert positions', { userId: user.id, error: upsertError.message })
        return NextResponse.json(
          { positions: positionsWithAllocation, synced: true, partial: true, error: 'Positions synced but failed to persist' },
          { status: 200 }
        )
      }
    }

    logger.info('SnapTrade sync complete', {
      userId: user.id,
      positionCount: positionsWithAllocation.length,
      partial,
    })

    return NextResponse.json({
      positions: positionsWithAllocation,
      synced: true,
      partial,
    })
  } catch (error) {
    if (error instanceof SnapTradeError) {
      logger.error('SnapTrade sync error', { userId: user.id, code: error.code })
      return NextResponse.json(
        { error: 'Exchange sync service is temporarily unavailable', positions: [], synced: false },
        { status: 503 }
      )
    }

    logger.error('Unexpected error in SnapTrade sync', {
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

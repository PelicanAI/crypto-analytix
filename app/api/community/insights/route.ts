import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sanitizeInput } from '@/lib/sanitize'
import { MOCK_SHARED_INSIGHTS } from '@/lib/mock-data'
import type { SharedInsight, ShareLimitStatus } from '@/types/community'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const DAILY_SHARE_LIMIT = 3
const MAX_INPUT_LENGTH = 3000

/**
 * Strip portfolio-specific data from Pelican answers before sharing.
 * Removes dollar amounts associated with "your" positions, specific quantities held, etc.
 * Keeps general market prices and percentages intact.
 */
function stripPortfolioData(text: string): string {
  let cleaned = text

  // "your $43,799 BTC position" → "your BTC position"
  cleaned = cleaned.replace(
    /\byour\s+\$[\d,]+(?:\.\d+)?\s+([A-Z]{2,10})\s+position/gi,
    'your $1 position'
  )

  // "you hold 0.52 BTC worth $43,799" → "you hold BTC"
  cleaned = cleaned.replace(
    /\byou\s+hold\s+[\d,.]+\s+([A-Z]{2,10})\s+worth\s+\$[\d,]+(?:\.\d+)?/gi,
    'you hold $1'
  )

  // "you hold 0.52 BTC" → "you hold BTC"
  cleaned = cleaned.replace(
    /\byou\s+hold\s+[\d,.]+\s+([A-Z]{2,10})\b/gi,
    'you hold $1'
  )

  // "your 200 SOL" → "your SOL"
  cleaned = cleaned.replace(
    /\byour\s+[\d,.]+\s+([A-Z]{2,10})\b/gi,
    'your $1'
  )

  // "your portfolio is worth $123,456" → "your portfolio"
  cleaned = cleaned.replace(
    /\byour\s+portfolio\s+is\s+worth\s+\$[\d,]+(?:\.\d+)?/gi,
    'your portfolio'
  )

  // "your unrealized gain on BTC is +$3,031" → "your BTC position"
  cleaned = cleaned.replace(
    /\byour\s+unrealized\s+(?:gain|loss)\s+on\s+([A-Z]{2,10})\s+is\s+[+\-−]?\$[\d,]+(?:\.\d+)?/gi,
    'your $1 position'
  )

  // "your $X,XXX" (generic possessive dollar amounts) → "your"
  cleaned = cleaned.replace(
    /\byour\s+\$[\d,]+(?:\.\d+)?\b/gi,
    'your'
  )

  return cleaned
}

function getStartOfTodayUTC(): string {
  const now = new Date()
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return startOfDay.toISOString()
}

function getResetTime(): string {
  const now = new Date()
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return tomorrow.toISOString()
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch user's shared insights
    const { data: insights, error: insightsError } = await supabase
      .from('shared_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (insightsError) {
      logger.warn('Failed to fetch shared insights from DB, using mock', { error: insightsError.message })
    }

    // Count today's shares for limit status
    const todayStart = getStartOfTodayUTC()
    const { count: todayCount, error: countError } = await supabase
      .from('shared_insights')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart)

    if (countError) {
      logger.warn('Failed to count today shares', { error: countError.message })
    }

    const sharesToday = todayCount ?? 0
    const resolvedInsights: SharedInsight[] = (insights && insights.length > 0)
      ? insights
      : MOCK_SHARED_INSIGHTS

    const limit: ShareLimitStatus = {
      shares_today: sharesToday,
      limit: DAILY_SHARE_LIMIT,
      can_share: sharesToday < DAILY_SHARE_LIMIT,
      resets_at: getResetTime(),
    }

    return NextResponse.json({ insights: resolvedInsights, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { question, answer, portal_conversation_id } = body as {
      question?: string
      answer?: string
      portal_conversation_id?: string
    }

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    // Sanitize inputs
    const cleanQuestion = sanitizeInput(question, MAX_INPUT_LENGTH)
    const cleanAnswer = sanitizeInput(answer, MAX_INPUT_LENGTH)

    if (!cleanQuestion || !cleanAnswer) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Strip portfolio-specific data from the answer
    const safeAnswer = stripPortfolioData(cleanAnswer)

    // Check daily share limit
    const todayStart = getStartOfTodayUTC()
    const { count: todayCount, error: countError } = await supabase
      .from('shared_insights')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart)

    if (countError) {
      logger.error('Failed to check share limit', { error: countError.message })
      return NextResponse.json({ error: 'Failed to verify share limit' }, { status: 500 })
    }

    const sharesToday = todayCount ?? 0
    if (sharesToday >= DAILY_SHARE_LIMIT) {
      return NextResponse.json(
        {
          error: 'Daily share limit reached',
          limit: {
            shares_today: sharesToday,
            limit: DAILY_SHARE_LIMIT,
            can_share: false,
            resets_at: getResetTime(),
          },
        },
        { status: 429 }
      )
    }

    // Derive username from user metadata
    const username =
      (user.user_metadata?.display_name as string) ||
      (user.user_metadata?.full_name as string) ||
      (user.email ? user.email.split('@')[0] : 'Anonymous')

    // Insert the shared insight
    const { data: insight, error: insertError } = await supabase
      .from('shared_insights')
      .insert({
        user_id: user.id,
        username,
        question: cleanQuestion,
        answer: safeAnswer,
        portal_conversation_id: portal_conversation_id || null,
        shared_to: 'clipboard',
        likes_count: 0,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Failed to insert shared insight', { error: insertError.message })
      // Still return formatted text even if DB insert fails
    }

    // Format clipboard text
    const clipboardText = formatClipboardText(cleanQuestion, safeAnswer, username)

    const newLimit: ShareLimitStatus = {
      shares_today: sharesToday + 1,
      limit: DAILY_SHARE_LIMIT,
      can_share: sharesToday + 1 < DAILY_SHARE_LIMIT,
      resets_at: getResetTime(),
    }

    return NextResponse.json({
      insight: insight || {
        id: crypto.randomUUID(),
        user_id: user.id,
        username,
        question: cleanQuestion,
        answer: safeAnswer,
        portal_conversation_id: portal_conversation_id || null,
        shared_to: 'clipboard',
        likes_count: 0,
        created_at: new Date().toISOString(),
      },
      clipboard_text: clipboardText,
      limit: newLimit,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to share insight' }, { status: 500 })
  }
}

function formatClipboardText(question: string, answer: string, username: string): string {
  return [
    `--- Pelican Insight shared by @${username} ---`,
    '',
    `Q: ${question}`,
    '',
    `A: ${answer}`,
    '',
    '--- Shared via Crypto Analytix Pelican Portal ---',
  ].join('\n')
}

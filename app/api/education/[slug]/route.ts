import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  MOCK_EDUCATION_MODULES,
  MOCK_EDUCATION_PROGRESS,
} from '@/lib/mock-data'
import type { EducationModule, EducationProgress } from '@/types/education'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

// ---------------------------------------------------------------------------
// GET — return a single education module with its content + user progress
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const { searchParams } = request.nextUrl
  const useMock = searchParams.get('mock') === 'true'

  try {
    let eduModule: EducationModule | null = null
    let progress: EducationProgress | null = null

    if (useMock) {
      eduModule = MOCK_EDUCATION_MODULES.find((m) => m.slug === slug) || null
      progress = MOCK_EDUCATION_PROGRESS[slug] || null
    } else {
      // Try database first
      const { data: dbModule } = await supabase
        .from('education_modules')
        .select('*')
        .eq('slug', slug)
        .single()

      if (dbModule) {
        eduModule = {
          ...dbModule,
          content: typeof dbModule.content === 'string'
            ? JSON.parse(dbModule.content)
            : dbModule.content,
          prerequisites: dbModule.prerequisites || [],
        }
      }

      const { data: dbProgress } = await supabase
        .from('education_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_slug', slug)
        .single()

      if (dbProgress) {
        progress = dbProgress
      }

      // Fall back to mock data if module not found in DB
      if (!eduModule) {
        eduModule = MOCK_EDUCATION_MODULES.find((m) => m.slug === slug) || null
        if (!progress) {
          progress = MOCK_EDUCATION_PROGRESS[slug] || null
        }
      }
    }

    if (!eduModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json({ module: eduModule, progress })
  } catch (err) {
    logger.error('Failed to fetch education module', { error: String(err) })
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST — record education progress (start or complete a module)
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  let body: { action: 'start' | 'complete'; quiz_score?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.action || !['start', 'complete'].includes(body.action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "start" or "complete".' },
      { status: 400 }
    )
  }

  try {
    const now = new Date().toISOString()

    // Check if progress record already exists
    const { data: existing } = await supabase
      .from('education_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_slug', slug)
      .single()

    let updatedProgress: EducationProgress

    if (body.action === 'start') {
      if (existing) {
        // Already started — update started_at only if not already set
        if (!existing.started_at) {
          const { data, error } = await supabase
            .from('education_progress')
            .update({ started_at: now })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) throw error
          updatedProgress = data
        } else {
          updatedProgress = existing
        }
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('education_progress')
          .insert({
            user_id: user.id,
            module_slug: slug,
            completed: false,
            started_at: now,
            completed_at: null,
            quiz_score: null,
          })
          .select()
          .single()

        if (error) throw error
        updatedProgress = data
      }
    } else {
      // action === 'complete'
      const updates = {
        completed: true,
        completed_at: now,
        quiz_score: body.quiz_score ?? null,
      }

      if (existing) {
        const { data, error } = await supabase
          .from('education_progress')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        updatedProgress = data
      } else {
        const { data, error } = await supabase
          .from('education_progress')
          .insert({
            user_id: user.id,
            module_slug: slug,
            started_at: now,
            ...updates,
          })
          .select()
          .single()

        if (error) throw error
        updatedProgress = data
      }
    }

    return NextResponse.json({ progress: updatedProgress })
  } catch (err) {
    logger.error('Failed to update education progress', { error: String(err) })
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

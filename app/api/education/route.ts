import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getMockEducationOverview } from '@/lib/mock-data'
import type { EducationOverview, EducationProgress } from '@/types/education'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const useMock = searchParams.get('mock') === 'true'

  try {
    if (useMock) {
      return NextResponse.json(getMockEducationOverview())
    }

    // Try fetching from database
    const overview = await fetchFromDatabase(supabase, user.id)

    // Fall back to mock if no modules in DB
    if (!overview) {
      return NextResponse.json(getMockEducationOverview())
    }

    return NextResponse.json(overview)
  } catch (err) {
    logger.error('Failed to fetch education overview', { error: String(err) })
    return NextResponse.json({ error: 'Failed to fetch education data' }, { status: 500 })
  }
}

async function fetchFromDatabase(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string
): Promise<EducationOverview | null> {
  // Fetch all education modules ordered by sort_order
  const { data: modules, error: modulesError } = await supabase
    .from('education_modules')
    .select('*')
    .order('sort_order', { ascending: true })

  if (modulesError || !modules || modules.length === 0) {
    return null
  }

  // Fetch user's progress
  const { data: progressRows } = await supabase
    .from('education_progress')
    .select('*')
    .eq('user_id', userId)

  // Build progress record keyed by module_slug
  const progress: Record<string, EducationProgress> = {}
  if (progressRows) {
    for (const row of progressRows) {
      progress[row.module_slug] = row
    }
  }

  const completedCount = Object.values(progress).filter((p) => p.completed).length

  // Determine recommended next: first non-completed module with all prerequisites met
  let recommendedNext: string | null = null
  for (const mod of modules) {
    const prog = progress[mod.slug]
    if (prog?.completed) continue
    const prereqs: string[] = mod.prerequisites || []
    const prereqsMet = prereqs.every((pre: string) => progress[pre]?.completed)
    if (prereqsMet) {
      // Prefer a module already started
      if (prog?.started_at) {
        recommendedNext = mod.slug
        break
      }
      if (!recommendedNext) {
        recommendedNext = mod.slug
      }
    }
  }

  // Parse content JSON if stored as jsonb
  const parsedModules = modules.map((mod) => ({
    ...mod,
    content: typeof mod.content === 'string' ? JSON.parse(mod.content) : mod.content,
    prerequisites: mod.prerequisites || [],
  }))

  return {
    modules: parsedModules,
    progress,
    completedCount,
    totalCount: modules.length,
    recommendedNext,
  }
}

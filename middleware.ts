import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware handles:
 * 1. Refresh Supabase auth session on every request
 * 2. Protect (features)/* routes — require authentication
 * 3. Enforce terms_accepted via DATABASE query (not JWT/cookie — Pelican v2 lesson)
 * 4. Fail CLOSED on any Supabase error
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response we can modify
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not remove this. Refreshes the auth token.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // --- Public routes: no auth required ---
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/api/health') ||
    pathname === '/accept-terms' ||
    pathname === '/onboarding'

  if (isPublicRoute) {
    return supabaseResponse
  }

  // --- Protected routes: (features)/* and anything else not public ---

  // Fail CLOSED: if auth errored, redirect to login
  if (authError) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // No user → redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // --- Terms check: query database server-side ---
  // CRITICAL: Must be DB query, not JWT claim or cookie.
  // Google OAuth users bypassed terms in Pelican v2 because it was client-only.
  const { data: userCredits, error: creditsError } = await supabase
    .from('user_credits')
    .select('terms_accepted, onboarding_complete')
    .eq('user_id', user.id)
    .single()

  // Fail CLOSED: if DB query errors, redirect to login
  if (creditsError || !userCredits) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  // Terms not accepted → redirect to accept-terms
  if (!userCredits.terms_accepted) {
    const termsUrl = request.nextUrl.clone()
    termsUrl.pathname = '/accept-terms'
    return NextResponse.redirect(termsUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

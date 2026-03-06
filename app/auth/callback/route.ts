import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/portfolio'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore errors from Server Components
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check terms_accepted and onboarding_complete to route correctly
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: userCredits } = await supabase
          .from('user_credits')
          .select('terms_accepted, onboarding_complete')
          .eq('user_id', user.id)
          .single()

        if (!userCredits?.terms_accepted) {
          return NextResponse.redirect(`${origin}/accept-terms`)
        }

        if (!userCredits?.onboarding_complete) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      // Validated — send to intended destination
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Auth failed — redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}

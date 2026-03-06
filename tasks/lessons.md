# Lessons Learned

## Session 3 — Auth + Middleware + Providers

1. **`'use client'` pages with `createBrowserClient()` fail during SSG** — @supabase/ssr throws when NEXT_PUBLIC env vars are missing at build time. Fix: split into Server Component page (exports `force-dynamic`) + Client Component form.

2. **`useSearchParams()` requires Suspense boundary** — Next.js 14 enforces this at build time. Wrap components using `useSearchParams` in `<Suspense>`.

3. **Pattern: Server Component page wrapper for auth pages** — `page.tsx` is a Server Component that exports `dynamic = 'force-dynamic'` and renders the client form component. This prevents prerendering issues and satisfies Suspense requirements.

4. **Supabase browser client should be created inside event handlers** — Don't create at component body level to avoid SSR issues. Create lazily inside `onClick`/`onSubmit` handlers.

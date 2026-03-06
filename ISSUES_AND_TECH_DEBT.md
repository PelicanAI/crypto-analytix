# Crypto Analytix — Issues & Tech Debt Tracker

Last updated: March 6, 2026 (after Session 5)

## Priority Levels
- **P0 — Fix before next session.** Will cause bugs or security issues if left.
- **P1 — Fix this week.** Will cause problems as features are built on top.
- **P2 — Fix before launch.** Won't break anything now but needs addressing.
- **P3 — Improve eventually.** Nice to have, not blocking.

---

## P0 — Fix Before Session 6

### 1. API route stubs need auth scaffolding
**Files:** All files in `app/api/*/route.ts` and `app/api/*/*/route.ts`
**Issue:** Every API route returns a placeholder `{ message: 'portfolio' }` with zero auth checking. When Session 6 implements the portfolio route for real, the pattern needs to be established from the start.
**Fix:** Add auth check boilerplate to every stub route now. Even while returning placeholder data, the pattern should be there:
```typescript
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Implement in Session X
  return NextResponse.json({ message: 'portfolio', user_id: user.id })
}
```
**Why P0:** If Session 6 copies the pattern from existing stubs, it copies the pattern WITHOUT auth. Establishing the auth-first pattern now prevents every future session from potentially shipping unprotected routes.

### 2. Stub hooks missing 'use client' directive
**Files:** `hooks/use-portfolio.ts`, `hooks/use-credits.ts`, `hooks/use-snaptrade.ts`, `hooks/use-notifications.ts`, `hooks/use-watchlist.ts`
**Issue:** These stubs export plain functions without `'use client'`. When they're implemented with React hooks (useState, useEffect, etc.), the build will fail if the directive is missing.
**Fix:** Add `'use client'` to the top of each stub file now.
**Why P0:** Someone implementing these hooks might forget to add the directive and waste time debugging a build error.

### 3. Panel width is a magic number in two files
**Files:** `app/(features)/layout.tsx` (line: `marginRight: state.isOpen ? 440 : 0`), `components/pelican-panel/pelican-chat-panel.tsx` (width: 440px)
**Fix:** Add `PELICAN_PANEL_WIDTH = 440` to `lib/constants.ts`. Import and use in both files.
**Why P0:** If someone changes the panel width during Session 6 testing and only updates one file, the layout breaks with a gap or overlap. Takes 2 minutes to fix now, prevents a confusing bug later.

---

## P1 — Fix This Week

### 4. Atmosphere gradient hardcodes accent color
**File:** `app/(features)/layout.tsx`
**Issue:** The atmosphere background uses `rgba(29, 161, 196, 0.05)` instead of referencing CSS variables. If the brand color changes again, this won't update.
**Fix:** Use `var(--accent-dim)` and `var(--accent-glow)` or create a dedicated `--atmosphere-primary` and `--atmosphere-secondary` token in globals.css.
**Why P1:** Not breaking anything, but violates the "all colors from CSS variables" principle that makes brand changes a one-file edit.

### 5. console.log in tracking.ts
**File:** `lib/tracking.ts` line 3
**Issue:** Uses `console.log` instead of `logger.info()` for dev-mode tracking events. Inconsistent with the "no console.log, use logger" rule.
**Fix:** Replace with `logger.info(\`[TRACK] ${name}\`, properties)`.
**Why P1:** Minor consistency issue. Won't break anything but sets a bad precedent if other developers see console.log in an approved file.

### 6. Duplicate pelican-icon.tsx
**Files:** `components/shared/pelican-icon.tsx` (99 lines, real implementation) AND `components/pelican-panel/pelican-icon.tsx` (unclear if duplicate or different)
**Issue:** Two pelican icon files exist. Need to verify they're not duplicates. If they are, one should be deleted and all imports pointed to the canonical version.
**Fix:** Check both files. Keep one canonical version in `components/shared/pelican-icon.tsx`. Delete the duplicate. Update imports.
**Why P1:** Duplicate components lead to inconsistent behavior when one gets updated and the other doesn't.

### 7. Updated CLAUDE.md not in repo
**Issue:** The CLAUDE.md in this Claude.ai conversation has the Pelican Intelligence Alerts section, updated notification_history schema, and updated feature roadmap. The version in the repo may be the older version without these additions.
**Fix:** Push the latest CLAUDE.md to the repo so Sessions 6-10 pick up the Intelligence Alerts architecture, the extensible notification schema, and the cross-asset translation layers.
**Why P1:** Future sessions reference CLAUDE.md. If it's stale, Claude Code won't know about Intelligence Alerts or the three-layer analyst integration.

---

## P2 — Fix Before Launch

### 8. No rate limiting on API routes
**Files:** All `app/api/` routes
**Issue:** The Upstash rate limiting utility exists in `lib/rate-limit.ts` but no API route uses it yet. Free tier users could spam the Pelican API or portfolio sync endpoint.
**Fix:** When implementing each API route (Sessions 6-10), wrap cost-incurring endpoints with the rate limiter. At minimum: `/api/pelican`, `/api/portfolio/sync`, `/api/brief` (generation endpoint).
**When:** Each session that implements an API route should add rate limiting to that route.

### 9. No error tracking (Sentry) configured
**Issue:** `@sentry/nextjs` is installed but not configured. No `sentry.client.config.ts`, `sentry.server.config.ts`, or `sentry.edge.config.ts` files exist. Errors in production will be invisible.
**Fix:** Configure Sentry when a Sentry DSN is available. Add the three config files, wrap the root layout error boundary with Sentry, and add Sentry.captureException calls to the logger.error() function.
**When:** Before first production deploy.

### 10. No CSP (Content Security Policy) headers
**File:** `next.config.mjs`
**Issue:** No Content Security Policy configured. When TradingView charts, Stripe checkout, or other third-party embeds are added, missing CSP entries will cause silent iframe failures (Pelican v2 lesson).
**Fix:** Add CSP headers in next.config.mjs. Will need frame-src entries for TradingView, Stripe, SnapTrade connection portal.
**When:** When the first third-party embed is added (likely Session 6 with SnapTrade).

### 11. No OG image / social sharing meta
**Issue:** `metadataBase` is set in root layout but no OG image exists. Social shares will have no preview image.
**Fix:** Create an OG image (1200x630) with the CryptoAnalytix branding. Add to public/ directory. Reference in root layout metadata.
**When:** Before any marketing or public-facing launch.

### 12. Login/signup pages need production polish
**Files:** `app/auth/login/login-form.tsx`, `app/auth/signup/signup-form.tsx`
**Issue:** These are functional but may need visual polish, better error messages, loading states during OAuth redirect, and "forgot password" flow.
**Fix:** Visual pass during a polish session before launch.
**When:** Before beta launch with ForexAnalytix subscribers.

### 13. Terms of service is placeholder text
**File:** `app/accept-terms/page.tsx`
**Issue:** The terms content is likely placeholder. Needs real legal terms before any user signs up.
**Fix:** Draft real terms with legal counsel. Update the page content.
**When:** Before beta launch.

### 14. No email templates configured
**Issue:** Resend is installed and the API key placeholder exists, but no email templates are built. Auth confirmation emails, password reset, welcome emails, etc. use Supabase defaults.
**Fix:** Create branded HTML email templates via Resend. Configure Supabase to use custom SMTP (Resend) instead of default Supabase mailer.
**When:** Before beta launch.

---

## P3 — Improve Eventually

### 15. No test coverage
**Issue:** Vitest and Playwright are installed but no tests exist. The formatters, sanitizers, and utility functions should have unit tests. Critical user flows (signup → terms → portfolio) should have e2e tests.
**Fix:** Write unit tests for lib/ utilities. Write Playwright e2e tests for auth flow, Pelican panel interaction, and portfolio view.
**When:** After core features are built (post-Session 10).

### 16. No CI/CD pipeline
**Issue:** No GitHub Actions workflow for running build checks, linting, or tests on pull requests.
**Fix:** Add `.github/workflows/ci.yml` with: npm install, npm run build, npm run lint, npm run test (when tests exist).
**When:** When the team grows beyond solo development.

### 17. i18n not implemented
**Issue:** The Pelican v2 codebase had 30-language support. Crypto Analytix is English-only.
**Fix:** Only implement if the user base requires it. Not a priority for ForexAnalytix's primarily English-speaking audience.
**When:** If/when expanding beyond English-speaking markets.

### 18. No accessibility audit
**Issue:** Components have basic accessibility (cursor-pointer, focus states, tap targets) but no formal WCAG audit has been done.
**Fix:** Run axe-core or Lighthouse accessibility audit. Fix any issues flagged.
**When:** Before public launch.

### 19. Placeholder hooks return untyped empty objects
**Files:** `hooks/use-portfolio.ts`, `hooks/use-credits.ts`, etc.
**Issue:** Stubs return `{}` which TypeScript treats as `Record<string, never>`. When these are implemented, the return types need to be fully specified from the start.
**Fix:** When implementing each hook (Sessions 6-10), define the return interface first, then implement.
**When:** Each session that implements a hook.

### 20. No database backup strategy
**Issue:** Supabase free tier has limited backup options. Production data (user portfolios, conversation history, trade grades) needs backup.
**Fix:** Configure Supabase database backups or implement a pg_dump cron job.
**When:** Before going to production with real user data.

---

## Resolved Issues

(Move items here when fixed, with date and session number)

| # | Issue | Fixed | Session |
|---|-------|-------|---------|
| — | — | — | — |

# CRYPTO ANALYTIX — BUILD INITIATION

## Current State
- **Repo:** github.com/PelicanAI/crypto-analytix
- **CLAUDE.md:** Already in repo. Read it in full before doing anything.
- **Supabase:** Project created. Connected via MCP. Ready for migrations.
- **Vercel:** Project created. Connected to repo.
- **Stripe:** Deferred. Will add later. Skip all Stripe/payment code for now.
- **API Keys:** SnapTrade, Upstash, Resend, Sentry, CoinGecko, Coinalyze will be added after initial structure is built. Build with placeholder env vars and graceful fallbacks where these services are referenced.

## How This Document Works

This is the master build plan. It lives in the repo root. Do NOT paste this entire document into Claude Code as a single prompt. Instead, use one focused session prompt per phase. Each session prompt tells Claude Code to read CLAUDE.md and this document for context, then execute a specific phase.

The session prompts are at the bottom of this document.

---

## Before Writing Any Code

### Step 1: Read Everything
1. CLAUDE.md — The entire product spec, architecture, design system, database schema, security rules, coding standards, and 15 lessons learned from the Pelican Trading AI build
2. This file — The build plan, directory structure, phase order, and session prompts

### Step 2: Generate the Design System
Install UI UX Pro Max and generate the design system:

    # Install the skill (if uipro-cli is installed globally)
    uipro init --ai claude

    # Generate the master design system
    python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto trading dashboard dark mode premium" --design-system --persist -p "Crypto Analytix"

    # Page-specific overrides
    python3 .claude/skills/ui-ux-pro-max/scripts/search.py "portfolio dashboard dark trading" --design-system --persist -p "Crypto Analytix" --page "portfolio"
    python3 .claude/skills/ui-ux-pro-max/scripts/search.py "news feed signals dark" --design-system --persist -p "Crypto Analytix" --page "signals"
    python3 .claude/skills/ui-ux-pro-max/scripts/search.py "morning briefing AI summary dark" --design-system --persist -p "Crypto Analytix" --page "brief"
    python3 .claude/skills/ui-ux-pro-max/scripts/search.py "community chat room dark" --design-system --persist -p "Crypto Analytix" --page "community"
    python3 .claude/skills/ui-ux-pro-max/scripts/search.py "education learning modules dark" --design-system --persist -p "Crypto Analytix" --page "learn"

If UI UX Pro Max is not available, proceed with the design system defined in CLAUDE.md. The oklch color palette, typography, spacing, animation standards, and component patterns in CLAUDE.md are the fallback source of truth.

### Step 3: Plan Before Building
Enter plan mode for every non-trivial task. Write the plan. Get confirmation. Then build.

---

## Directory Structure

Create this exact structure. Every directory has a purpose.

    crypto-analytix/
    ├── .claude/                     # Claude Code skills (UI UX Pro Max if installed)
    ├── app/
    │   ├── (marketing)/             # Public pages (light mode, SSR)
    │   │   ├── layout.tsx           # Marketing layout with ForceLightTheme
    │   │   ├── page.tsx             # Landing page
    │   │   ├── pricing/
    │   │   └── faq/
    │   ├── (features)/              # Authenticated feature pages (dark mode)
    │   │   ├── layout.tsx           # Features layout: sidebar, header, PelicanPanelProvider
    │   │   ├── portfolio/           # Home screen — portfolio view
    │   │   │   └── page.tsx
    │   │   ├── signals/             # CT signals + analyst feed + wallet tracking
    │   │   │   └── page.tsx
    │   │   ├── brief/               # Daily brief + What I Missed
    │   │   │   └── page.tsx
    │   │   ├── community/           # Chat room
    │   │   │   └── page.tsx
    │   │   ├── learn/               # Education modules
    │   │   │   └── page.tsx
    │   │   ├── calendar/            # Crypto event calendar
    │   │   │   └── page.tsx
    │   │   ├── watchlist/           # Watchlist + alert config
    │   │   │   └── page.tsx
    │   │   └── settings/            # Account, connections, preferences
    │   │       └── page.tsx
    │   ├── auth/
    │   │   ├── login/
    │   │   ├── signup/
    │   │   └── callback/
    │   ├── onboarding/              # 3-question onboarding flow
    │   │   └── page.tsx
    │   ├── api/
    │   │   ├── snaptrade/           # SnapTrade connection + sync (Phase C)
    │   │   │   ├── connect/
    │   │   │   ├── sync/
    │   │   │   └── callback/
    │   │   ├── portfolio/           # Portfolio data endpoints
    │   │   ├── pelican/             # Pelican panel proxy (if needed)
    │   │   ├── signals/             # Signal aggregation endpoints
    │   │   ├── brief/               # Daily brief generation
    │   │   ├── notifications/       # Notification management
    │   │   ├── education/           # Education progress tracking
    │   │   └── health/              # Health check
    │   ├── accept-terms/
    │   ├── layout.tsx               # Root layout
    │   ├── globals.css              # Design tokens, base styles
    │   └── not-found.tsx
    ├── components/
    │   ├── pelican-panel/
    │   │   ├── pelican-chat-panel.tsx
    │   │   └── pelican-icon.tsx
    │   ├── portfolio/
    │   │   ├── holdings-table.tsx
    │   │   ├── portfolio-header.tsx
    │   │   ├── portfolio-metrics.tsx
    │   │   └── sparkline.tsx
    │   ├── brief/
    │   │   ├── brief-card.tsx
    │   │   └── what-i-missed.tsx
    │   ├── signals/
    │   │   ├── signal-card.tsx
    │   │   ├── ct-signal.tsx
    │   │   ├── analyst-card.tsx
    │   │   └── wallet-signal.tsx
    │   ├── navigation/
    │   │   ├── sidebar.tsx
    │   │   ├── header-bar.tsx
    │   │   └── mobile-nav.tsx
    │   ├── onboarding/
    │   ├── education/
    │   ├── community/
    │   ├── calendar/
    │   ├── settings/
    │   ├── shared/
    │   │   ├── severity-tag.tsx
    │   │   ├── live-dot.tsx
    │   │   ├── empty-state.tsx
    │   │   ├── loading-skeleton.tsx
    │   │   └── error-boundary.tsx
    │   ├── ui/                      # shadcn/ui primitives
    │   └── landing/
    ├── hooks/
    │   ├── use-pelican-panel.ts
    │   ├── use-streaming-chat.ts
    │   ├── use-portfolio.ts
    │   ├── use-snaptrade.ts
    │   ├── use-signals.ts
    │   ├── use-notifications.ts
    │   ├── use-brief.ts
    │   ├── use-behavior.ts
    │   ├── use-education.ts
    │   ├── use-watchlist.ts
    │   ├── use-credits.ts           # Stub until Stripe
    │   ├── use-toast.ts
    │   └── use-mobile.ts
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── admin.ts
    │   ├── snaptrade.ts
    │   ├── coinalyze.ts
    │   ├── defillama.ts
    │   ├── coingecko.ts
    │   ├── pelican.ts
    │   ├── constants.ts
    │   ├── utils.ts
    │   ├── formatters.ts
    │   ├── rate-limit.ts            # Stub until keys added
    │   ├── sanitize.ts
    │   ├── logger.ts
    │   ├── tracking.ts
    │   └── glossary/
    │       └── crypto-terms.json
    ├── providers/
    │   ├── pelican-panel-provider.tsx
    │   ├── credits-provider.tsx     # Stub until Stripe
    │   ├── theme-provider.tsx
    │   └── force-light-theme.tsx
    ├── types/
    │   ├── portfolio.ts
    │   ├── signals.ts
    │   ├── pelican.ts
    │   ├── notifications.ts
    │   ├── education.ts
    │   └── snaptrade.ts
    ├── supabase/
    │   ├── migrations/
    │   └── setup-database.sql
    ├── design-system/
    │   ├── MASTER.md
    │   └── pages/
    ├── tasks/
    │   ├── lessons.md
    │   ├── todo.md
    │   └── architecture-plan.md
    ├── CLAUDE.md
    ├── CRYPTO_ANALYTIX_BUILD_PROMPT.md
    ├── middleware.ts
    ├── next.config.mjs
    ├── vercel.json
    ├── tsconfig.json
    ├── .env.example
    └── package.json

---

## Dependencies

Install all at once during Session 1.

Core:
    npm install @supabase/ssr @supabase/supabase-js swr next-themes framer-motion

UI:
    npm install @phosphor-icons/react @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-separator @radix-ui/react-scroll-area @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-alert-dialog class-variance-authority clsx tailwind-merge

Data & Charts:
    npm install recharts date-fns zod uuid

Infrastructure (stubs work without keys):
    npm install @upstash/ratelimit @upstash/redis @sentry/nextjs @vercel/analytics resend

Fonts:
    npm install geist

Security:
    npm install isomorphic-dompurify

Dev:
    npm install -D @types/node @types/react @types/react-dom @playwright/test @testing-library/jest-dom @testing-library/react vitest @vitejs/plugin-react jsdom sharp

---

## Build Phases

Phase A: Foundation — Project init, deps, directory structure, design system, globals.css, layouts, auth, middleware, providers, navigation, shared components, utilities, types. npm run build must pass.

Phase B: Pelican Panel — use-pelican-panel.ts, use-streaming-chat.ts (READ-ONLY after working), pelican-panel-provider.tsx, pelican-chat-panel.tsx. Panel pushes content left. Mobile bottom sheet. npm run build must pass.

Phase C: SnapTrade + Portfolio — lib/snaptrade.ts, API routes, lib/coingecko.ts, lib/coinalyze.ts, use-portfolio.ts, portfolio page with holdings table, sparklines, Pelican icons. npm run build must pass.

Phase D: Brief + What I Missed — Brief API, use-brief.ts, brief page, What I Missed overlay. npm run build must pass.

Phase E: Signals + Analyst Feed — Signal API, use-signals.ts, signals page with filters, CT translations, analyst cards. npm run build must pass.

Phase F: Onboarding + Education — 3-question onboarding, education modules, crypto glossary, progress tracking. npm run build must pass.

Phase G: Community + Calendar + Watchlist + Settings — Chat, calendar, watchlist alerts, settings. npm run build must pass.

---

## Session Prompts

### SESSION 1 — Project Init + Design System

Read CLAUDE.md and CRYPTO_ANALYTIX_BUILD_PROMPT.md in full.

Initialize this Next.js 14 project. Install ALL dependencies listed in CRYPTO_ANALYTIX_BUILD_PROMPT.md (core, UI, data, infrastructure, fonts, security, dev).

Create the complete directory structure from CRYPTO_ANALYTIX_BUILD_PROMPT.md with placeholder page.tsx files that export a simple component with the page name.

Create tasks/lessons.md with a header and empty list. Create tasks/todo.md with the phase list.

Create .env.example listing every environment variable from CLAUDE.md without values.

Create vercel.json with function timeout set to 30s for streaming routes.

Try to install UI UX Pro Max (uipro init --ai claude) and generate the design system. If the CLI is not available, skip and use the design system from CLAUDE.md directly.

Create globals.css implementing the full design system: oklch color palette from CLAUDE.md, CSS custom properties for all colors/typography/spacing, Tailwind base layer customizations, dark mode as default, scrollbar styles, selection styles.

Create the Geist Sans + Geist Mono font loading in the root layout via next/font.

Verify: npm run build passes with zero errors. Update ISSUES_AND_TECH_DEBT.md (resolve fixed items, add new issues found).

---

### SESSION 2 — Database Schema

Read CLAUDE.md database schema section and CRYPTO_ANALYTIX_BUILD_PROMPT.md.

Using the Supabase MCP, create ALL tables from the CLAUDE.md database schema. Create them as numbered migration files in supabase/migrations/ AND apply them via MCP.

Tables: user_credits, snaptrade_connections, wallet_connections, crypto_positions, portfolio_snapshots, auto_trades, analyst_posts, ct_signals, wallet_signals, pelican_conversations, pelican_messages, saved_insights, watchlist, trading_rules, user_behavior, analyst_follows, calendar_events, milestones, notification_preferences, notification_history, education_progress.

For EVERY table: RLS enabled. SELECT/INSERT/UPDATE/DELETE policies with user_id = (SELECT auth.uid()). NO is_admin() in user-facing policies. Service role policy with USING (true). All migrations use IF NOT EXISTS.

Create RPC functions: get_crypto_context(p_user_id), handle_new_user() trigger. All with SECURITY DEFINER + SET search_path = public.

Create supabase/setup-database.sql as single-file reference.

Verify: query pg_policies via MCP to confirm every table has RLS. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 3 — Auth + Middleware + Providers

Read CLAUDE.md security section.

Create lib/supabase/client.ts (browser), lib/supabase/server.ts (server), lib/supabase/admin.ts (service role admin only).

Create middleware.ts: refresh auth session, redirect unauthenticated to /auth/login for (features) routes, redirect without terms_accepted to /accept-terms, fail CLOSED on errors.

Create auth pages: login (email + Google OAuth), signup, callback handler.

Create accept-terms page with server-side enforcement.

Create providers: theme-provider.tsx (next-themes, dark default), force-light-theme.tsx, credits-provider.tsx (stub, free tier default).

Create root layout with Geist fonts, ThemeProvider, metadataBase, metadata.

Create (marketing)/layout.tsx with ForceLightTheme. Create (features)/layout.tsx (will add sidebar + Pelican in Session 4).

Verify: npm run build passes. Auth redirects work. Terms enforcement works. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 4 — Navigation + Layout + Shared Components

Read CLAUDE.md design system section and design-system/MASTER.md if it exists.

Reference during component design: 21st.dev (https://21st.dev/community/components), Laws of UX (https://lawsofux.com/), Component Gallery (https://component.gallery/).

Build sidebar (5 nav items, Phosphor Icons, active state with teal accent), header bar (portfolio value placeholder, live dot, glass-morphism), mobile navigation.

Update (features)/layout.tsx with sidebar + header. Content area will respond to Pelican panel state.

Build ALL shared components: pelican-icon (THE most important UI element — hover glow, pulse option, tooltip), severity-tag, live-dot, empty-state, loading-skeleton, error-boundary, sparkline.

Build ALL utilities: cn(), formatters (currency/percent/number with tabular-nums), constants, logger (no console.log), sanitize, all TypeScript types.

Verify: npm run build passes. App renders with sidebar, header, empty portfolio page with skeleton. Mobile responsive at 375px, 768px, 1024px. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 5 — Pelican Panel

Read CLAUDE.md Pelican Panel Architecture section. This is the most important component in the entire product.

Build use-pelican-panel.ts: state management, context types (portfolio, position, analyst-content, ct-signal, wallet-tracking, funding-rate, news, metric, education, what-i-missed, daily-brief), two-part message pattern { visibleMessage, fullPrompt }, persist vs no-persist mode, openWithPrompt/sendMessage/close/clearMessages.

Build use-streaming-chat.ts: SSE streaming from Pelican API. If PELICAN_API_URL is not set, mock streaming function that simulates response character by character. AbortController for cancellation. Error handling + retry. ONCE WORKING: THIS FILE IS READ-ONLY.

Build pelican-panel-provider.tsx: React context, noop fallback, memoized value.

Build pelican-chat-panel.tsx: slides right on desktop (440px), bottom sheet on mobile, glass-morphism, Pelican avatar with gradient glow, streaming text with markdown rendering, teal cursor, follow-up input, Framer Motion animations. Main content pushes left (margin-right), NOT overlay.

Update (features)/layout.tsx: wrap with PelicanPanelProvider, add PelicanChatPanel.

Add temporary test button on portfolio page to verify panel opens, streams, closes, works on mobile.

Verify: npm run build passes. Panel works end-to-end. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 6 — SnapTrade + Portfolio

Read CLAUDE.md SnapTrade and portfolio sections.

Build lib/snaptrade.ts: HMAC signature, registerUser, generateConnectionLink, listAccounts, getPositions, getBalances, getTransactions. If SNAPTRADE_CLIENT_ID not set, return mock data with warning.

Build SnapTrade API routes: connect, callback, sync. All with auth checks.

Build lib/coingecko.ts and lib/coinalyze.ts with graceful fallback to mock data if no keys.

Build use-portfolio.ts: SWR hook, 60s refresh, computed totals.

Build portfolio page: progressive disclosure Level 1 (holdings table with sparklines, P&L, funding rates, Pelican icons), empty state for no connection, loading skeletons. Every row Pelican icon calls openWithPrompt with full position context.

Verify: npm run build passes. Portfolio renders (mock or real data). Pelican icons work. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 7 — Brief + What I Missed

Read CLAUDE.md Daily Brief and What I Missed sections.

Build brief API route, use-brief.ts hook, brief page with 2x2 card grid, severity tags, Pelican icons. What I Missed overlay for >4h absence. Use mock data for brief content.

Verify: npm run build passes. Brief renders. What I Missed overlay works. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 8 — Signals + Analyst Feed

Read CLAUDE.md Signal Aggregation section.

Build signal API route, use-signals.ts, signals page with filter tabs (All, Analysts, CT, On-Chain). CT signal cards with original + translation. Analyst cards with methodology. Wallet signals with track record. Pelican icons everywhere. Mock data.

Verify: npm run build passes. Signals page works. Filters work. Pelican icons work. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 9 — Onboarding + Education

Read CLAUDE.md onboarding and education sections.

Build onboarding page (3 questions, stores in user_credits, redirects to portfolio). Build education page with 7 modules. Build crypto-terms.json glossary. Build glossary tooltip component. Education progress tracking.

Verify: npm run build passes. Onboarding works. Education renders. Glossary tooltips work. Update ISSUES_AND_TECH_DEBT.md.

---

### SESSION 10 — Community + Calendar + Watchlist + Settings

Read CLAUDE.md community, calendar, watchlist sections.

Build community chat (Supabase Realtime, Pelican @mention, never reveals portfolio data). Crypto calendar (event types, Pelican icons). Watchlist with multi-type alerts. Settings page (account, connections, preferences).

Verify: npm run build passes. All pages functional. Update ISSUES_AND_TECH_DEBT.md.

---

## Critical Rules (Every Session)

- Read CLAUDE.md at session start. Every time.
- npm run build must pass before marking any phase complete.
- Update tasks/lessons.md after every bug, mistake, or discovery.
- Update ISSUES_AND_TECH_DEBT.md at the end of every session: move resolved items to the Resolved table with date and session number, add any new issues discovered with priority level (P0/P1/P2/P3). Never close a session without checking this file.
- No any TypeScript types. Use proper types or unknown.
- No console.log in production. Use lib/logger.ts.
- Every number: font-mono tabular-nums. No exceptions.
- Every clickable element: cursor-pointer + hover state + transition.
- Every async component: loading skeleton + empty state + error handling.
- RLS on every table. Auth on every API route. Sanitize every input.
- Pelican icons everywhere. Every data point the user might want explained.
- Agent team file collisions: one agent per file. Shared files need lead approval.
- Start fresh sessions for new phases. Don't accumulate stale context.

---

## Reference Materials

- CLAUDE.md — Product spec, architecture, all rules
- ISSUES_AND_TECH_DEBT.md — Running tech debt tracker. Read at session start, update at session end.
- design-system/MASTER.md — Visual source of truth (if generated)
- 21st.dev (https://21st.dev/community/components) — Component patterns
- Laws of UX (https://lawsofux.com/) — UX principles
- Component Gallery (https://component.gallery/) — Real-world patterns
- tasks/lessons.md — Read at session start, write after every fix
- Pelican Trading AI repo (github.com/PelicanAI/trade-journal-frontend) — Reference for patterns only, don't copy code

# Build Phases

## Phase A: Foundation
- [x] Project init, deps, directory structure
- [x] Design system, globals.css
- [x] Layouts, auth, middleware, providers
- [x] Navigation, shared components, utilities, types
- [x] `npm run build` must pass

## Phase B: Pelican Panel
- [x] types/pelican.ts — extensible PelicanContext (string | null) + PELICAN_CONTEXTS constants
- [x] lib/pelican.ts — Layer 1 API client (stream, generate, buildContext)
- [x] use-streaming-chat.ts — Layer 2 SSE streaming hook with mock mode (READ-ONLY)
- [x] use-pelican-panel.ts — Panel state, openWithPrompt, sendMessage, close, auto-close on route change
- [x] use-mobile.ts — Mobile breakpoint detection
- [x] pelican-panel-provider.tsx — React context with noop fallback
- [x] pelican-chat-panel.tsx — Desktop slide-right (440px), mobile bottom sheet, glassmorphism, markdown rendering, streaming cursor
- [x] (features)/layout.tsx — Wired with PelicanPanelProvider, content pushes left when panel open
- [x] portfolio/page.tsx — Temporary test buttons (BTC Position, SOL Funding, Daily Brief)
- [x] `npm run build` passes with zero errors

## Phase C: SnapTrade + Portfolio
- [x] lib/snaptrade.ts, API routes
- [x] lib/coingecko.ts, lib/coinalyze.ts
- [x] use-portfolio.ts, portfolio page with holdings table
- [x] Sparklines, Pelican icons
- [x] `npm run build` must pass

## Phase D: Brief + What I Missed
- [x] Brief API, use-brief.ts
- [x] Brief page with 2x2 card grid, severity tags, Pelican icons
- [x] What I Missed overlay
- [x] `npm run build` must pass

## Phase E: Signals + Analyst Feed
- [x] Signal API, use-signals.ts
- [x] Signals page with filter tabs
- [x] CT translations, analyst cards, wallet signals
- [x] `npm run build` must pass

## Phase F: Onboarding + Education
- [x] 3-question onboarding
- [x] Education modules, crypto glossary
- [x] Progress tracking
- [x] `npm run build` must pass

## Phase G: Community + Calendar + Watchlist + Settings + Pelican Portal
- [x] Community link-out to ForexAnalytix + shared insights with clipboard copy + 3/day limit
- [x] Crypto event calendar with month grid, event dots, event cards, Pelican integration
- [x] Watchlist with add/remove, table with prices/funding/sparklines, alert CRUD
- [x] Settings page (account, connections, notifications, Pelican preferences, delete account)
- [x] Pelican Portal — full-chat tab with streaming, conversation history, share to community
- [x] Navigation updated: 6 items (Home, Pelican, Signals, Calendar, Learn, Chat external)
- [x] Database migrations: shared_insights, calendar_events, watchlist, watchlist_alerts, pelican_portal_conversations, pelican_portal_messages
- [x] `npm run build` passes with zero errors (39 routes)

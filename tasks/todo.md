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
- [ ] lib/snaptrade.ts, API routes
- [ ] lib/coingecko.ts, lib/coinalyze.ts
- [ ] use-portfolio.ts, portfolio page with holdings table
- [ ] Sparklines, Pelican icons
- [ ] `npm run build` must pass

## Phase D: Brief + What I Missed
- [ ] Brief API, use-brief.ts
- [ ] Brief page with 2x2 card grid, severity tags, Pelican icons
- [ ] What I Missed overlay
- [ ] `npm run build` must pass

## Phase E: Signals + Analyst Feed
- [ ] Signal API, use-signals.ts
- [ ] Signals page with filter tabs
- [ ] CT translations, analyst cards, wallet signals
- [ ] `npm run build` must pass

## Phase F: Onboarding + Education
- [ ] 3-question onboarding
- [ ] Education modules, crypto glossary
- [ ] Progress tracking
- [ ] `npm run build` must pass

## Phase G: Community + Calendar + Watchlist + Settings
- [ ] Community chat (Supabase Realtime)
- [ ] Crypto event calendar
- [ ] Watchlist with alerts
- [ ] Settings page
- [ ] `npm run build` must pass

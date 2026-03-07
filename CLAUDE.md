# CLAUDE.md — Crypto Analytix

## What This Is

Crypto Analytix is a crypto analysis, education, and intelligence platform for traditional finance traders entering crypto. It is NOT a dashboard for crypto natives. It is NOT a Nansen competitor. It is the product that turns forex, futures, and equity traders into confident crypto participants.

The product combines: Pelican AI (contextual intelligence embedded everywhere), human analysis from veteran TradFi traders (ForexAnalytix team: Blake Morrow, Grega Horvat, Ryan Littlestone), a live community, and progressive education that meets users where they are.

**The user is a futures trader who understands charts, risk, and macro but doesn't know what a funding rate is.** Every design decision flows from this.

---

## Core Product Principles

### 1. Portfolio-First
The entry point is always the user's holdings. Not the market. Not a dashboard. Their positions. Everything flows from there: analysis is about their portfolio, news is filtered by their holdings, alerts are triggered by their exposure. When they connect their exchange, the product works immediately with zero manual input. This solves the cold-start problem that killed engagement in previous builds (72 of 75 users never logged data when it required manual entry).

### 2. Progressive Disclosure
The user sees only what they need at their current level. The platform reveals more as they grow. A first-time user sees their portfolio, one Pelican insight, and the daily brief. A power user sees performance metrics, CT signals, wallet tracking, and custom alerts. Features surface based on user behavior, not feature flags. Never overwhelm. Never hide.

### 3. Pelican Lives Everywhere (Two Modes)
Pelican AI operates in two modes, both powered by the same three-layer architecture:

**Contextual Pop-Outs (free/Lite):** Every data point has a Pelican icon. Click it, panel slides open with context pre-loaded. Quick, focused, one-click intelligence. This is the free taste that demonstrates Pelican's value.

**Pelican Portal (paid):** A dedicated full-chat tab where users ask anything. Open-ended conversations, full history, "Share to Community" button. This is the premium product. Every pop-out response includes "Want to go deeper? Open Pelican Portal →" as the conversion funnel.

The pop-outs sell the Portal. The Portal feeds the community. The community sells the platform.

### 4. TradFi Language, Crypto Content
Every piece of copy, every tooltip, every Pelican response speaks the language of a traditional trader. "Funding rate" is explained as "similar to overnight repo rates, paid 3x daily." "Liquidation cascade" is explained as "like a short squeeze on ES futures but happening 24/7." The user learns crypto by seeing it mapped to concepts they already know.

### 5. The Moat Is Accumulated Intelligence
After 6 months, leaving Crypto Analytix means losing: an AI that knows your portfolio, your risk profile, your learning progress, and your behavioral patterns. Hundreds of contextualized Pelican insights. Analyst calls overlaid on your holdings. A community where you know names. The combination is unreplicable.

### 6. Sticky Through Habit, Not Lock-In
The "What I Missed" feature creates a daily reason to open the app. The Daily Brief creates a morning ritual. Smart notifications create throughout-the-day touchpoints. The community creates social belonging. Stickiness comes from genuine value delivered consistently, not from data hostage-taking.

---

## Team

- **Jack** — Co-founder. Crypto-native expert. The only person in the partnership with deep crypto knowledge (DeFi, on-chain analysis, CT culture, tokenomics). Pelican AI owner. Product vision.
- **Nick** — Co-founder. Technical build lead. Frontend architecture, Pelican AI integration, UI/UX design. Built Pelican Trading AI v2/v3 in Claude Code.
- **Blake Morrow** — Partner. CEO of ForexAnalytix. 30-year trading veteran. Distribution (25K email list), analyst team, NinjaTrader/Kraken relationships. Covers API and infrastructure costs.
- **ForexAnalytix Analyst Team** — Blake (harmonics), Grega Horvat (Elliott Wave), Ryan Littlestone (PFI/macro), Stelios, Steve, Kevin. 180+ years combined experience.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | SSR for SEO, API routes, React Server Components |
| Language | TypeScript (strict) | No `any` where proper types exist |
| Auth/DB | Supabase (PostgreSQL) | RLS on all tables. RPC for computed data. |
| Payments | Stripe | Free / Lite $29 / Pro $99 / Bundle $149 |
| Styling | Tailwind CSS + CSS custom properties | oklch color space for theming |
| Icons | Phosphor Icons (`@phosphor-icons/react`) | Weight system for hierarchy |
| Fonts | Geist Sans (UI) + Geist Mono (numbers) | via `next/font` |
| Animations | Framer Motion | All interactive animations |
| State | SWR (server state) + React Context (client state) | Don't mix patterns |
| Charts | Recharts + TradingView widgets | Recharts for portfolio, TV for market charts |
| AI Backend | Pelican AI (existing) | SSE streaming. Frontend POSTs to Pelican API. |
| Crypto Data | CoinGecko, Coinalyze, DefiLlama | Pricing, OI/funding/liquidations, DeFi TVL/yields |
| Exchange/Broker Connection | SnapTrade | Unified API for Kraken, Coinbase, IBKR, Fidelity, 20+ brokers. Read-only by default. Handles OAuth. |
| Wallet Auth (Phase 3) | Privy.io | Embedded wallets, wallet connect, social login → wallet. For on-chain interaction. |
| Wallet Data | Moralis (EVM), Helius (Solana) | On-chain balance/history for pasted wallet addresses |
| Rate Limiting | Upstash Redis | Fails CLOSED when unavailable |
| Hosting | Vercel | Auto-deploy from GitHub |
| Email | Resend | Branded HTML templates |
| Error Tracking | Sentry | `@sentry/nextjs` |

---

## Workflow Orchestration (Claude Code)

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Write detailed specs upfront to reduce ambiguity

### 2. Agent Teams
- Use freely for parallel workstreams. No limits on agent count.
- Best for: cross-layer features (DB + API + UI), component splitting, multi-angle code review
- Bad for: sequential edits, tightly coupled code, quick bug fixes
- CRITICAL: Assign file ownership per agent. Agent file collisions cause silent overwrites.

### 3. Self-Improvement Loop
- After ANY correction: update `tasks/lessons.md` with the pattern
- After EVERY session: update `ISSUES_AND_TECH_DEBT.md` with resolved items and new discoveries
- Write rules that prevent the same mistake
- Review both files at session start

### 4. Verification Before Done
- `npm run build` must pass before any commit
- Test the actual user flow, not just the component in isolation
- Ask: "Would a staff engineer approve this?"

### 5. Context Window Management
- Start fresh sessions for new phases
- Provide context dumps as separate files, not inline conversation
- One-fix-per-commit for clean git history
- Targeted surgical fixes over broad refactoring

### 6. Where Claude Code Struggles (Push Harder)
- CSS visual precision: values like rgba(255,255,255,0.06) are invisible. Push 2-3x harder.
- Marketing copy: write it yourself, have Claude Code place it.
- Maintaining existing patterns: explicitly say "read the closest existing implementation first"
- Complex dark theme CSS: gradient stacking, oklch, z-index need multiple iterations

### 7. Tech Debt Tracking
- After EVERY session: read and update `ISSUES_AND_TECH_DEBT.md`
- Move resolved items to the Resolved table with date and session number
- Add any new issues discovered during the session
- Assign priority: P0 (fix before next session), P1 (fix this week), P2 (fix before launch), P3 (improve eventually)
- Never close a session without checking this file
- This is as important as `npm run build` passing. A clean build with growing hidden debt is a false signal.

---

## Design System

### Philosophy
Cinematic, minimal, premium dark mode. Crypto-native aesthetic that feels approachable to TradFi traders. Dark enough to feel like it belongs in the crypto world, clean enough that a NinjaTrader user doesn't feel lost. Depth through light and negative space, not decoration. Two-color discipline for UI chrome, with data colors (green/red) reserved strictly for financial data.

### NOT Allowed
- Flat, outlined boxes everywhere. Cards should feel elevated, not caged.
- Color noise — multiple accent colors competing. UI chrome is quiet; data colors speak.
- Dense, cramped layouts. Premium means breathing room.
- Generic icon usage. Phosphor weight system creates hierarchy.
- Static, lifeless interactions. Every clickable element needs hover/transition.
- CT degen aesthetic (neon gradients, meme energy). We're a bridge, not a casino.
- TradFi corporate sterility (all blue and white). We're crypto-aware, not a bank.
- Overwhelming data density on first visit. Progressive disclosure always.

### Color Palette
```
/* Backgrounds — layered depth */
--bg-base: oklch(0.13 0.015 250);       /* Deepest layer */
--bg-surface: oklch(0.17 0.015 250);     /* Cards, panels */
--bg-elevated: oklch(0.21 0.015 250);    /* Modals, popovers, hover states */
--bg-overlay: rgba(0,0,0,0.6);           /* Backdrops */

/* Borders — subtle */
--border-subtle: rgba(255,255,255,0.06);
--border-default: rgba(255,255,255,0.1);
--border-hover: rgba(255,255,255,0.15);

/* Text — clear hierarchy */
--text-primary: #e8e8ed;       /* Headings, important content */
--text-secondary: #9898a6;     /* Body text, descriptions */
--text-muted: #5a5a6e;         /* Labels, captions, timestamps */

/* Accent — teal/green for crypto identity, used sparingly */
--accent-primary: #0f7b6c;
--accent-hover: #10a88f;
--accent-muted: rgba(15,123,108,0.15);

/* Data colors — ONLY for financial data */
--data-positive: #22c55e;      /* Profit, gains, bullish */
--data-negative: #ef4444;      /* Loss, drops, bearish */
--data-neutral: #6b7280;       /* Unchanged */
--data-warning: #f59e0b;       /* Alerts, caution */
```

### Typography
```
--font-sans: 'Geist Sans', system-ui, sans-serif;  /* All UI text */
--font-mono: 'Geist Mono', monospace;               /* ALL numbers */

/* RULE: Every number on every page uses font-mono + tabular-nums */
/* Prices, P&L, quantities, percentages, dates — ALL mono */
```

### Design Resources & Build Tools

These resources are active references during development. Consult them before building any new component or page.

**UI UX Pro Max** (installed as Claude Code skill)
- Repo: github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Generates tailored design systems via reasoning engine
- 67 UI styles, 96 color palettes, 57 font pairings, 100 industry rules
- Use the "Fintech/Trading Dashboard" + "Glassmorphism" + "Dark Mode (OLED)" style combinations
- Run design system generation at project start: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto trading dashboard" --design-system -p "Crypto Analytix"`
- Persist the generated design system: `--persist` flag creates design-system/MASTER.md as source of truth

**21st.dev** — https://21st.dev/community/components
- Community React component library with production-quality examples
- Browse before building any new component. Don't reinvent patterns that already exist well.
- Particularly useful for: data tables, cards, navigation, modals, notification centers, settings pages

**Laws of UX** — https://lawsofux.com/
- Core UX principles that govern every layout decision
- Key laws for Crypto Analytix:
  - **Jakob's Law**: Users spend most time on other sites. The portfolio view should feel familiar to TradFi traders (like their brokerage dashboard), not alien.
  - **Hick's Law**: More choices = longer decisions. Progressive disclosure. Don't show everything at once.
  - **Miller's Law**: People can hold ~7 items in working memory. Keep dashboard sections to 5-7 data points max before requiring interaction.
  - **Fitts's Law**: Important targets should be large and close. Pelican icons must be easy to hit on every screen size.
  - **Peak-End Rule**: Users judge an experience by its peak and its end. The "What I Missed" briefing is the peak. The Pelican panel streaming response is the memorable moment. Make both excellent.
  - **Aesthetic-Usability Effect**: Users perceive aesthetically pleasing design as more usable. The premium dark theme is functional, not decorative.

**Component Gallery** — https://component.gallery/
- Catalog of UI component patterns from real-world production sites
- Before designing any component (sidebar, data table, alert system, settings, onboarding flow), check how the best products solve it
- Reference for: navigation patterns, dashboard layouts, notification centers, empty states, loading states, error states

### Design System Generation Workflow
```
1. Install UI UX Pro Max skill in the repo
2. Run: python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto trading dark dashboard" --design-system --persist -p "Crypto Analytix"
3. This generates design-system/MASTER.md with: recommended pattern, style, colors, typography, effects, anti-patterns, pre-delivery checklist
4. For page-specific overrides: --page "portfolio" or --page "signals" or --page "brief"
5. Every Claude Code session reads MASTER.md before generating any UI code
6. Deviations from the design system require explicit justification
```

### Pelican Icon
The Pelican icon appears next to every data point that can be analyzed. It should be:
- Small (16-20px), subtle but discoverable
- Consistent placement (always right-aligned or trailing the data)
- Hover state: slight glow + tooltip "Ask Pelican"
- Active state (panel open): filled variant, accent color
- The icon is the most important UI element in the product. It IS the product.

---

### Data Flow
```
User opens app
  ├── SnapTrade → pulls exchange/broker positions (Kraken, Coinbase, IBKR, Fidelity)
  ├── Moralis/Helius (Phase 2) → reads on-chain wallet balances
  ├── Unified portfolio model in Supabase
  │     ├── Coinalyze → enriches crypto positions with funding rate, OI, liquidation data
  │     ├── DefiLlama → DeFi position data (TVL, yields, stablecoin flows)
  │     └── CoinGecko → pricing, market cap, market data
  ├── Signal sources → analyst posts, CT translations, wallet tracking
  └── Pelican AI → reads everything, contextualizes against user's portfolio
        └── Delivered via contextual pop-outs at every data point
```

---

## Pelican Panel Architecture

### How It Works
The PelicanPanelProvider wraps the app. Any component anywhere can call `openWithPrompt(context, prompt)` and the panel slides open from the right (or bottom on mobile) with Pelican pre-loaded.

### Context Types
```typescript
type PelicanContext =
  | 'portfolio'        // Clicked from portfolio overview
  | 'position'         // Clicked from specific position/asset
  | 'analyst-content'  // Clicked from analyst's call
  | 'ct-signal'        // Clicked from translated CT signal
  | 'wallet-tracking'  // Clicked from smart money alert
  | 'funding-rate'     // Clicked from funding rate dashboard
  | 'news'             // Clicked from news item
  | 'metric'           // Clicked from any performance metric
  | 'education'        // Clicked from education module
  | 'what-i-missed'    // Clicked from catch-up summary
  | 'daily-brief'      // Clicked from morning brief
  | null
```

### Two-Part Message Pattern
```typescript
openWithPrompt(
  'position',
  {
    visibleMessage: "Tell me about my SOL position",
    fullPrompt: `[CRYPTO ANALYTIX - POSITION ANALYSIS]
    POSITION: SOL | 200 units | Entry: $142 | Current: $138 | P&L: -2.8%
    PORTFOLIO CONTEXT: SOL is 18% of portfolio. BTC correlation: 0.82.
    MARKET DATA: SOL funding rate: +0.012% (positive, longs paying shorts)
    ANALYST: Grega EW count targets $128 (wave 4 correction)
    ON-CHAIN: Exchange outflows up 15% in 24h (accumulation signal)
    Provide a contextual analysis of this position.`
  }
)
```
The user sees "Tell me about my SOL position." Pelican receives the full context. This is how every pop-out works.

### Panel Behavior
- Each pop-out creates a lightweight conversation context
- Quick analyses use 'no-persist' mode (disposable, not saved)
- Deep analyses persist and appear in conversation history
- Panel closes on page navigation
- Only one panel open at a time

---

## Pelican Portal (Premium Chat Tab)

### The Concept
The contextual pop-outs are the free taste. Pelican Portal is the full meal. It's a dedicated chat tab in the sidebar navigation where users can have open-ended conversations with Pelican about anything: any token, any market condition, any strategy question, any "explain this to me like I'm a futures trader" request. No contextual constraint. No one-question limit. Full conversation history.

This is behind a paywall ($30/month standalone, or included in Pro $99). The conversion funnel is built into every pop-out: at the bottom of every contextual Pelican response, a CTA reads "Want to go deeper? Open Pelican Portal →". User clicks, lands on the Portal tab. If not subscribed, sees the paywall. If subscribed, starts chatting immediately with the context from their pop-out pre-loaded.

### Why This Matters Strategically
- Every contextual pop-out is a product demo for Pelican Portal. Users experience the value for free, then pay for unlimited access.
- The Portal captures users who would otherwise go to ChatGPT or Perplexity for crypto questions. Keep them inside Crypto Analytix where Pelican has their portfolio context.
- Community share mechanic (below) turns every Portal conversation into social proof in the chatroom.
- Blake and ForexAnalytix earn 15% of Pelican Portal revenue, aligning their incentive to drive users toward it.

### "Share My Insight" → Community Loop
Every Pelican Portal response has a "Share to Community" button. When clicked:
1. The user's question + Pelican's answer are packaged into a "Shared Insight" card
2. The card is injected into the community chatroom with attribution: "Shared via Pelican Portal by @username"
3. Free users in the chatroom see high-quality AI analysis and think "I want that"
4. The shared insight card has a subtle "Get Pelican Portal" CTA for non-subscribers
5. The community becomes a living showcase of Pelican's intelligence. Every shared insight is organic marketing.

This creates a virtuous cycle: Portal users share insights → free users see the value → free users subscribe → more insights shared → community grows.

### Architecture
The Portal uses the same three-layer Pelican architecture:
- Layer 1: `lib/pelican.ts` handles all API communication
- Layer 2: `hooks/use-streaming-chat.ts` handles streaming (same hook as pop-outs)
- Portal page: `app/(features)/pelican-portal/page.tsx` — full chat interface with conversation history, saved conversations, and share button
- Portal is a SEPARATE consumer from the panel. It has its own conversation state, its own UI, its own persistence. But it uses the same streaming infrastructure.

### Portal vs. Pop-Outs
| | Contextual Pop-Outs | Pelican Portal |
|---|---|---|
| Access | Free tier (limited) / Lite+ (unlimited) | $30/month or Pro tier |
| Trigger | Click Pelican icon on any data point | Navigate to Portal tab |
| Context | Pre-loaded with specific data (position, signal, metric) | Open-ended, user types anything |
| Conversation | Short, 1-3 exchanges, often no-persist | Full conversations, saved history |
| UX | Sliding side panel / bottom sheet | Full-page chat interface |
| Share | No | Yes — "Share to Community" button |
| History | Ephemeral (unless persisted) | Full conversation list, searchable |

### Data Model Additions (when building this feature)
```
pelican_portal_conversations: id, user_id, title,
  last_message_preview, message_count, created_at, updated_at

shared_insights: id, user_id, username,
  question (text), answer (text),
  portal_conversation_id (uuid),
  community_message_id (uuid),    -- Links to community chat
  likes_count (int default 0),
  created_at
```

### Revenue Model
- Pelican Portal: $30/month standalone
- Included in Pro tier ($99/month)
- Blake / ForexAnalytix: 15% of Portal revenue
- At 1,000 Portal subscribers: $30,000/month gross, $4,500/month to Blake's side

---

## Data Architecture

### Exchange & Broker Connection via SnapTrade (BUILD THIS FIRST)
```
User clicks "Connect Account" →
  SnapTrade Connection Portal opens (hosted OAuth flow) →
    User authenticates with Kraken / Coinbase / IBKR / Fidelity / etc. →
      SnapTrade returns: accounts, positions, balances, transactions →
        Normalize into unified portfolio data model →
          Store in Supabase →
            Available to Pelican via get_crypto_context() RPC
```

SnapTrade handles all broker-specific complexity. One API for 20+ brokers.
Read-only by default. Users never give Crypto Analytix trading permissions.
Supports both crypto exchanges (Kraken, Coinbase, Binance) AND TradFi brokers (IBKR, Fidelity, Schwab, E*TRADE).
This means users can see their FULL financial picture (stocks + crypto) and Pelican can say "your overall portfolio is 80% equities, 20% crypto — here's how adding more BTC changes your correlation to the S&P 500."

Wallet connection (Phase 2): paste EVM/Solana address → Moralis/Helius reads balances.
Privy embedded wallets (Phase 3): for users who want on-chain interaction without managing keys.

### Portfolio Data Model
```
crypto_positions: id, user_id, source (snaptrade/wallet),
  snaptrade_account_id, asset, quantity, avg_entry_price,
  current_price, unrealized_pnl, unrealized_pnl_pct,
  allocation_pct, last_updated

portfolio_snapshots: id, user_id, total_value, btc_value, eth_value,
  alt_value, tradfi_value, btc_correlation,
  snapshot_date (daily snapshots for historical charts)

snaptrade_connections: id, user_id, snaptrade_user_id,
  snaptrade_user_secret_encrypted, broker_name,
  account_ids[], last_sync, status (active/error/revoked)

wallet_connections: id, user_id, chain (evm/solana/bitcoin),
  address, label, last_sync
```

### Stickiness Data Model
```
-- Trade Tracking (auto-detected via SnapTrade)
auto_trades: id, user_id, snaptrade_account_id,
  asset, direction (buy/sell), quantity, price,
  timestamp, pelican_grade (jsonb), r_multiple,
  pnl_amount, pnl_pct

-- Saved Insights
saved_insights: id, user_id, pelican_response_text,
  context_type, context_data, tags[], created_at

-- Watchlist
watchlist: id, user_id, asset, notes,
  alert_funding_above, alert_funding_below,
  alert_price_above, alert_price_below,
  alert_whale_activity (bool), alert_analyst_posts (bool)

-- Trading Rules
trading_rules: id, user_id, rule_text, rule_type
  (max_allocation/funding_threshold/time_restriction/custom),
  parameters (jsonb), active (bool), violations_count

-- Behavioral Patterns (Pelican learns over time)
user_behavior: id, user_id, metric_name,
  metric_value, computed_at
  -- Examples: avg_session_duration, first_check_metric,
  -- sell_winner_early_rate, check_frequency_by_asset

-- Crypto Calendar Events
calendar_events: id, event_type (unlock/governance/expiry/fed/earnings),
  asset, title, description, event_date, impact_level,
  source_url

-- Performance Milestones
milestones: id, user_id, milestone_type
  (streak/outperformance/learning/portfolio),
  title, achieved_at, value
```

### Context RPC: get_crypto_context()
The single most important function. Assembles all user context for Pelican:
- Current positions with P&L
- Portfolio allocation percentages
- Portfolio correlation to BTC
- Recent trades (last 7 days)
- Active alerts and notifications
- User's experience level (from onboarding)
- Which education modules they've completed
- Which analysts they follow / engage with most
- Behavioral patterns (what they check first, what metrics they use)

---

## Feature Architecture

### Route Structure
```
app/(marketing)/         Landing, pricing, FAQ (light mode, SSR)
app/(features)/          Authenticated feature pages:
  portfolio/               Portfolio overview (THE home screen)
  pelican-portal/          Pelican AI full chat ($30/mo or Pro tier)
  asset/[ticker]/          Individual asset deep dive
  signals/                 CT signals + wallet tracking + analyst feed
  brief/                   Daily brief / What I Missed
  community/               Chat room (with shared Pelican insights)
  learn/                   Education modules
  alerts/                  Notification settings + history
  settings/                Account, exchange connections, preferences
app/auth/                Login, signup, callback
app/api/                 API routes
```

### Navigation (6 items)
```
Home (portfolio) → Pelican Portal → Signals → Calendar → Learn → Chat
```
The Portal tab sits right next to Home. It's the second thing in the nav. When a free user clicks it and isn't subscribed, they see the paywall with examples of what Portal can do.

### Home Screen: Portfolio View
This is the first thing users see after connecting their exchange. Progressive disclosure in action:

**Level 1 (Everyone sees):**
- Total portfolio value + 24h change
- List of holdings with current price, P&L, allocation %
- One Pelican insight ("Here's something you should know about your portfolio today")
- Link to Daily Brief

**Level 2 (Surfaces after engagement):**
- Portfolio performance chart (equity curve)
- Asset correlation matrix
- Funding rate summary for held assets
- Top analyst call relevant to their holdings

**Level 3 (Power users):**
- Full performance metrics suite
- Risk dashboard (beta, max drawdown, concentration)
- Comparison benchmarks (vs BTC, vs ETH, vs S&P)
- Custom alert configurations

### Onboarding (3 Questions, Under 30 Seconds)
```
Q1: How would you describe your trading experience?
    [ ] New to trading
    [ ] I trade stocks, forex, or futures
    [ ] I already trade crypto

Q2: Do you have a crypto exchange account?
    [ ] Yes → connect it (Kraken/Coinbase/Binance)
    [ ] No → pick 3-5 assets you're interested in (creates watchlist)

Q3: What are you most interested in?
    [ ] Learning about crypto
    [ ] Analyzing specific assets
    [ ] Getting daily market intelligence
    [ ] All of the above
```
Answers set: language level, portfolio source, home screen layout. No 12-step wizard.

---

## Features by Priority

### Phase 1: MVP (Weeks 1-12)
**Core Platform:**
- Exchange/broker connection via SnapTrade (Kraken, Coinbase, IBKR, Fidelity — unified OAuth flow)
- Portfolio view with Pelican contextual pop-outs
- Pelican Portal: full chat tab, $30/month standalone or included in Pro. "Open Pelican Portal →" CTA at the bottom of every pop-out response.
- Daily Brief (Pelican Market Pulse at 6 AM ET)
- "What I Missed" engine (catch-up summary on app open after >4 hours away)
- Analyst content feed with Pelican icons (Blake, Grega, Ryan)
- Onboarding flow (3 questions, under 30 seconds)
- Education modules (7 confusion points: spot vs futures, perpetuals, funding rates, custody, exchange risk, 24/7 trading, asset selection)
- Basic performance metrics (P&L daily/weekly/monthly, allocation breakdown, portfolio value history)
- Stripe subscription: Free (limited pop-outs) / Lite $29 (unlimited pop-outs + analyst feed) / Pelican Portal $30 (full AI chat) / Pro $99 (everything)
- Community chat room with Pelican @mention bot + "Share my insight" from Portal users

**Phase 1 Stickiness:**
- Auto-detected trades via SnapTrade with Pelican grading (was the entry/exit good? what was the R-multiple?)
- Saved Pelican insights (bookmark any Pelican response to a personal knowledge library)
- Analyst follow system (follow Blake, Grega, Ryan — their content surfaces first in your feed)
- Watchlist with intelligent alerts (not just price — funding rate thresholds, whale activity, analyst calls on watched assets)
- Crypto calendar (token unlocks, protocol governance votes, Fed meetings mapped to crypto impact, major expirations)
- Portfolio performance streaks and milestones (subtle, not gamified — "outperformed BTC 12 consecutive days")

### Phase 2: Intelligence Layer (Months 4-6)
**Core Features:**
- CT signal aggregation (Pelican monitors + translates curated accounts)
- Smart money wallet tracking with Pelican explanations and behavioral archetypes
- Pelican Intelligence Alerts: portfolio-relative briefings, not generic price alerts (derivatives intelligence, whale alerts with context, analyst-triggered, cross-asset macro translation alerts, multi-signal convergence alerts)
- Full performance metrics suite (drawdown, Sharpe ratio, correlation matrix, benchmark comparison vs BTC/ETH/S&P)
- Wallet connection (paste address for EVM/Solana holdings via Moralis/Helius)
- News feed filtered by portfolio holdings
- Mobile app (iOS + Android)
- Crypto PFI (Ryan's Peak Fear Index adapted with funding rates + stablecoin flows via DefiLlama)

**Phase 2 Stickiness:**
- Behavioral pattern tracking (Pelican learns when you check the app, what you look at first, your trading tendencies — "you tend to sell winners too early, last 3 SOL exits were premature by an average of 8%")
- Personal trading rules with Pelican enforcement ("never enter SOL when funding >0.02%", "max 25% single asset allocation" — Pelican flags violations post-trade)
- Correlation tracker over time (not just today's snapshot — historical chart of how your portfolio correlation has evolved)
- Custom dashboard layout (drag and arrange which data appears on home screen — once configured, switching platforms means rebuilding)
- TradingView chart integration with Pelican overlay (funding rate lines, on-chain support/resistance, analyst targets on the chart)
- Telegram/Discord bot for Pelican Intelligence Alerts and quick queries outside the app (full briefings delivered to the channels users already live in)
- X/Twitter integration (connect account, Pelican monitors your timeline for crypto signals from accounts you follow)
- Leaderboard / anonymous performance sharing (opt-in, returns only not holdings)

### Phase 3: Scale & Transactions (Months 7-12)
**Core Features:**
- Privy integration (embedded wallets, wallet auth, on-chain transactions from within the app)
- Token screener with TradFi-grade filters
- DeFi dashboards (TVL, yield, liquidity pools via DefiLlama)
- NinjaTrader/Kraken partnership conversations (earned through traction)
- API access for power users
- Additional wallet chain support (Bitcoin, Arbitrum, Base)

**Phase 3 Stickiness:**
- Scenario simulator ("what if I added 2 ETH? How does that change my correlation, risk, allocation?" — Pelican runs against your actual portfolio and risk preferences)
- Tax tracking (auto-tracked via SnapTrade trade history, cost basis, short/long-term gains, wash sale monitoring, year-end export)
- Community reputation system (subtle — "Member since March 2026", contribution indicators)
- Custom Pelican personality (after months of interaction, Pelican adapts its communication style to how you respond best — more data-heavy for quant types, more narrative for macro traders)

---

## Stickiness Architecture

The product is designed around five stickiness levers. Every feature should pull at least one.

### Lever 1: Accumulated Intelligence
The longer you use it, the more you lose by leaving. Pelican learns your portfolio, trading patterns, behavioral tendencies, and knowledge level. After 3 months, Pelican is the only AI that understands you as a crypto trader. Auto-detected trade history, saved insights, behavioral pattern data, and correlation tracking over time all compound. None of this is exportable.

### Lever 2: Daily Habits
The Daily Brief creates a morning ritual. "What I Missed" creates a reason to open after every absence. Smart notifications create throughout-the-day touchpoints. The crypto calendar creates forward-looking engagement ("SOL unlock in 3 days, here's what to watch"). Portfolio performance streaks create subtle progress tracking.

### Lever 3: Social Ties
The community chat room creates relationships. Analyst follow system creates loyalty to specific voices. Leaderboard/performance sharing creates peer competition. Once someone has asked a question and gotten a helpful answer from Blake or another member, they're not leaving.

### Lever 4: Personalized Workflows
Custom dashboard layout, intelligent watchlist with multi-type alerts, personal trading rules with Pelican enforcement, and analyst follow preferences. All configured over weeks. Switching platforms means rebuilding everything from scratch.

### Lever 5: Data You Can't Get Elsewhere
Portfolio correlation tracking over time (not just today's snapshot). Pelican's behavioral insights about YOUR trading tendencies. Trade grading history with AI analysis. Tax tracking built from auto-detected trade history. Performance benchmarking against BTC/ETH/S&P with YOUR actual portfolio. No other platform has this data because no other platform has your history + your portfolio + an AI that's been learning your patterns.

### The Stickiness Test
Before shipping any feature, ask: "Does this make it harder for a user to leave after 3 months?" If the answer is no, the feature is utility, not stickiness. Utility features are fine but they don't retain users on their own.

---

## Signal Aggregation Architecture

Three signal sources → one Pelican intelligence layer → personalized to user's portfolio.

### Source 1: Human Analysts
Content table: analyst, timestamp, asset, direction, methodology, body, confidence.
Feed renders as cards with Pelican icons. Clicking icon: "Blake says BTC to $92K via Crab pattern. Pelican, do you agree? Here's my BTC exposure."

### Source 2: CT Trader Signals
Curated accounts monitored via Twitter/X API or scraping.
Raw CT content stored, then Pelican translates into TradFi language.
Translation template: original post → "Why valuable" → "What jargon means" → "How it affects your portfolio."

### Source 3: Smart Money Wallets
On-chain monitoring via Arkham/Dune/custom tracking.
Wallet profiles: track record, win rate, avg hold time, behavioral archetype.
Pelican contextualizes: "This wallet accumulated $2M SOL. You hold SOL. Here's what happened last 3 times they did this."

---

## Pelican Intelligence Alerts

### The Core Difference
Every other platform sends alerts. Crypto Analytix sends intelligence briefings.

Traditional alert: "BTC hit $85,000."
Pelican alert: "BTC hit $85,000 and here's why it matters to YOUR portfolio right now. Three signals converging: whale sell-off on Binance, funding flipped negative for first time in 14 days (historically precedes a bounce within 48h in 4 of 6 instances), and Grega's EW target of $82,400 is now 3% away. Your unrealized gain on BTC is +$3,031 but your trading rules say max acceptable drawdown per position is -10%. Here are your options."

Every alert is a mini Pelican analysis. Not a data point. An intelligence briefing delivered to your phone.

### Alert Taxonomy

**Portfolio-Relative Alerts (nobody else has these):**
```
portfolio_drawdown:       "Your portfolio just crossed below your max drawdown threshold. 
                          Here's what's driving it and what your options are."

correlation_spike:        "Your BTC correlation increased to 0.95. You're basically 
                          holding leveraged BTC right now. Here's what that means 
                          for your risk if BTC drops 10%."

position_reversal:        "Your best-performing position (ETH) just reversed, giving 
                          back 40% of its gains in 4 hours. On-chain data shows 
                          exchange inflows spiked. Here's the full picture."

good_exit_confirmation:   "A position you exited last week (SOL at $142) is now at $128. 
                          Your exit was well-timed. Here's the data that validated 
                          your decision — useful for building your pattern recognition."

concentration_warning:    "BTC is now 72% of your portfolio after today's rally. Your 
                          max allocation rule is 60%. Consider whether to rebalance."

rule_violation:           "You just bought SOL while funding is +0.018%. Your trading 
                          rule says never enter when funding >0.02%. You're close to 
                          the threshold. Here's the historical context for what happens 
                          at these levels."
```

**Analyst-Triggered Alerts:**
```
analyst_call_on_holding:  "Blake just published a bearish harmonic on BTC. You hold 
                          BTC. His harmonic calls have 71% accuracy. Here's the 
                          pattern he's seeing and what it means for your position."

multi_analyst_alignment:  "Two analysts (Grega + Blake) independently turned bearish 
                          on ETH using different methodologies. When they align, 
                          directional accuracy is historically 83%. You hold ETH."

analyst_target_hit:       "BTC just reached Grega's Wave 4 target of $78,200 that 
                          he published 3 days ago. He's calling for a Wave 5 rally 
                          to $105K from here. You hold 0.52 BTC."
```

**Derivatives Intelligence Alerts:**
```
oi_extreme:               "Open interest on BTC perps just hit an all-time high. 
                          Last 3 times this happened, a 10%+ move followed within 
                          72 hours. Direction was 2 up, 1 down. You're long BTC."

funding_with_context:     "SOL funding rate crossed your +0.01% threshold. But here's 
                          context most platforms won't give you: the last time funding 
                          was this elevated while exchange outflows were also increasing, 
                          price actually went UP 12% (short squeeze). The signals 
                          partially conflict."

liquidation_cascade:      "A $340M liquidation cascade just hit BTC longs. Price 
                          dropped 4.2% in 8 minutes. Your portfolio is down $1,890. 
                          Historically, cascades of this size mark a local bottom 
                          within 4-12 hours. Here's the funding rate reset context."
```

**Whale and On-Chain Alerts:**
```
smart_money_move:         "A wallet that's been right 78% of the time just bought $4M 
                          of ETH. You hold ETH. Here's their track record and what 
                          happened last 3 times they accumulated at this rate."

exchange_flow_anomaly:    "Exchange inflows for ETH just spiked 300% above 30-day 
                          average. This usually means selling pressure incoming. 
                          You hold ETH. However, the last time inflows spiked 
                          while funding was negative, it was institutions repositioning, 
                          not dumping."

whale_sell_on_holding:    "The 'Accumulation Whale' wallet (78% win rate) that bought 
                          $4M ETH last week just moved 50% of it to Binance. This 
                          often precedes selling. Their average hold was 14 days, 
                          it's been 8. Could be early exit or partial profit-taking."
```

**Cross-Asset Translation Alerts (ForexAnalytix Integration):**
```
macro_crypto_correlation: "DXY just broke below 104 support. Blake flagged this in his 
                          macro read this morning. Historically when DXY breaks support, 
                          BTC rallies 8-15% over the following 2 weeks. You hold BTC. 
                          Here's how derivatives are positioned relative to this shift."

yield_curve_signal:       "10Y yield inverted against 2Y. This macro signal has preceded 
                          crypto rallies in 3 of the last 4 instances. Blake's team is 
                          watching this. Here's the derivatives positioning context."

risk_sentiment_shift:     "Blake's risk sentiment model just flipped to 'risk-on' based 
                          on VIX, credit spreads, and equity momentum. When this model 
                          turns risk-on, BTC has a 72% probability of positive returns 
                          over the following 30 days. Your portfolio is positioned for this."
```

### Alert Delivery UX

The notification experience is as important as the content:

1. **Push notification** = the headline. "SOL dropped 8% — 3 signals converging on your position."
2. **User taps** → app opens directly into the Pelican panel with the FULL analysis pre-loaded. No dashboard. No loading. The intelligence briefing is already there.
3. **Pre-loaded context**: The `notification_history` table stores a `pelican_context` jsonb column with the complete Pelican analysis. When the user taps, the panel loads from this cached analysis instead of regenerating (saves credits, eliminates latency).
4. **Follow-up capable**: The panel is a live Pelican conversation. After reading the briefing, the user can ask "Should I sell?" or "What happened last time?" and Pelican responds with full portfolio context.
5. **Expandable in-app**: If the user is already in the app, the alert appears as a card in the notification center with the headline. Tapping expands the full Pelican analysis inline, or opens the panel.

### Alert Configuration

Users configure which alert categories they want (notification_preferences table):
- Pro tier: all categories enabled by default
- Lite tier: portfolio-relative + analyst-triggered only
- Free tier: daily brief notification only

Per-asset overrides: "I want derivatives alerts for SOL and BTC but not ETH."
Frequency controls: "Don't send me more than 5 alerts per day" or "Batch non-urgent alerts into a digest every 4 hours."
Quiet hours: "No alerts between 11 PM and 7 AM except for portfolio drawdown >5%."

### Database Impact

Update notification_history table (when building this feature) to include:
```
notification_history:
  + pelican_context (jsonb)          -- Full cached Pelican analysis for instant panel load
  + pelican_conversation_id (uuid)   -- Links to pelican_conversations for follow-up
  + alert_category (text)            -- portfolio/analyst/derivatives/onchain/macro
  + severity (text)                  -- info/warning/critical
  + assets_involved (text[])         -- Which of user's holdings are relevant
  + expired (bool default false)     -- Alert no longer relevant (price moved away, etc.)
```

### Implementation Phasing

Phase 1 (Sessions 1-6): Build the notification_preferences table (done), the Pelican panel with pre-loaded context (Session 5), and the notification UI patterns.

Phase 2: Build the alert trigger engine. Each alert type has a trigger condition, a Pelican prompt template, and a delivery pipeline. The trigger monitors data sources (Coinalyze for derivatives, on-chain APIs for whale moves, ForexAnalytix feed for macro), evaluates conditions against the user's portfolio, generates the Pelican briefing, caches it, and delivers via push notification + in-app notification center.

Phase 3: Advanced alert types (cross-asset translation, multi-analyst alignment, behavioral pattern alerts).

---

## "What I Missed" Engine

The stickiest feature. Creates a daily reason to open the app.

When user opens the app after being away (>4 hours since last session):
1. Calculate time since last visit
2. Gather: price changes on holdings, relevant news, analyst calls published, CT signals fired, whale moves, funding rate shifts
3. Pelican synthesizes into a concise catch-up:
   "You've been away 14 hours. Your portfolio is down 3.2%. Here's why: BTC dropped 4% on tariff news (Blake called this in his morning macro). SOL outperformed on strong exchange outflows. One thing to watch: funding rates just flipped positive across the board."
4. User can click any element for the full Pelican pop-out

---

## Daily Brief (Pelican Market Pulse)

Published 6 AM ET. Cached by date. Personalized per user's portfolio.

Structure:
- **Overnight summary**: what happened in macro + crypto while they slept
- **Portfolio impact**: how their holdings were affected specifically
- **Key levels today**: analyst-identified support/resistance for their assets
- **Funding rate snapshot**: across their held assets
- **On-chain highlight**: one notable event, explained simply
- **Today's watchlist**: 2-3 things Pelican thinks they should pay attention to
- **One thing to learn**: progressive education tied to their current knowledge level

---

## Community Chat

NOT a Discord for degens. A moderated community of TradFi traders learning crypto.

- ForexAnalytix analysts participate (Blake, Grega, Ryan)
- Pelican AI responds when @mentioned (rate limited to prevent spam)
- Pelican NEVER reveals another user's portfolio data in community context
- Jack provides crypto-native context
- Crypto-to-TradFi migrants serve as organic culture bridges
- Built on Supabase Realtime (evaluate scaling needs if >500 concurrent users)

### Shared Pelican Insights (Portal → Community Pipeline)
Pelican Portal users can hit "Share my insight" on any Portal response. This creates a special "Shared Insight" card in the community chatroom:
- Displays: the user's question, Pelican's full answer, who shared it, timestamp
- Styled as a distinct card type (visually differentiated from normal chat messages)
- Non-subscribers see a subtle "Get Pelican Portal" CTA on each shared insight card
- Users can like/react to shared insights (surfacing the best ones)
- Creates organic social proof: free users see real Pelican analysis in the community, driving Portal conversions
- Shared insights are stripped of any portfolio-specific data (prices are fine, specific holdings are redacted)

---

## Language Guide

Based on NinjaTrader community research (290+ trader reactions):

| Use This | Not This |
|----------|----------|
| Regulated crypto futures | "Crypto" (unqualified) |
| Cash-settled, no wallet needed | Digital assets |
| CME-listed | Decentralized |
| Bitcoin and Ethereum (to start) | All cryptocurrencies |
| Your money stays at your FCM | Your funds on the blockchain |
| Trade the setup, not the hype | Bull run / Moon / WAGMI |
| Institutional-grade analysis | DeFi / NFT / Web3 |
| Similar to overnight repo rates | Funding rate (without explanation) |
| Position crowding (like ES open interest) | OI at highs |
| Stop-hunt above resistance | Swept top-side liquidity |

Pelican should always translate crypto concepts using TradFi analogs on first mention.

---

## Database Schema

### Core Tables
```
-- User & Auth
user_credits: user_id (PK), credits_balance, credits_used_this_month,
  plan_type, plan_credits_monthly, stripe_customer_id,
  stripe_subscription_id, free_questions_remaining,
  is_admin, terms_accepted, experience_level, onboarding_complete

-- Portfolio (SnapTrade powered)
snaptrade_connections: id, user_id, snaptrade_user_id,
  snaptrade_user_secret_encrypted, broker_name (kraken/coinbase/ibkr/fidelity),
  account_ids[], last_sync, status, created_at

wallet_connections: id, user_id, chain (evm/solana/bitcoin),
  address, label, last_sync, created_at

crypto_positions: id, user_id, source (snaptrade/wallet), source_id,
  asset, chain, quantity, avg_entry_price, current_price,
  unrealized_pnl, unrealized_pnl_pct, allocation_pct,
  last_updated

portfolio_snapshots: id, user_id, total_value,
  btc_allocation, eth_allocation, alt_allocation, tradfi_allocation,
  btc_correlation, snapshot_date

-- Auto-Detected Trades (via SnapTrade transaction history)
auto_trades: id, user_id, snaptrade_account_id,
  asset, direction (buy/sell), quantity, price, timestamp,
  pelican_grade (jsonb), r_multiple, pnl_amount, pnl_pct

-- Content & Signals
analyst_posts: id, analyst_id, asset, direction,
  methodology (harmonic/ew/macro/pfi), title, body,
  confidence, created_at

ct_signals: id, source_handle, original_text,
  translated_text, assets[], signal_type, engagement,
  created_at

wallet_signals: id, wallet_address, wallet_label,
  archetype, action (accumulate/distribute/transfer),
  asset, amount_usd, created_at

-- Pelican
pelican_conversations: id, user_id, context_type, context_data,
  persist (boolean), created_at

pelican_messages: id, conversation_id, role, content,
  timestamp

-- Stickiness Features
saved_insights: id, user_id, pelican_response_text,
  context_type, context_data, tags[], created_at

watchlist: id, user_id, asset, notes,
  alert_funding_above, alert_funding_below,
  alert_price_above, alert_price_below,
  alert_whale_activity (bool), alert_analyst_posts (bool)

trading_rules: id, user_id, rule_text,
  rule_type (max_allocation/funding_threshold/time_restriction/custom),
  parameters (jsonb), active (bool), violations_count

user_behavior: id, user_id, metric_name,
  metric_value, computed_at

analyst_follows: id, user_id, analyst_id, created_at

calendar_events: id, event_type (unlock/governance/expiry/fed/earnings),
  asset, title, description, event_date, impact_level, source_url

milestones: id, user_id, milestone_type,
  title, achieved_at, value

-- Notifications
notification_preferences: id, user_id, funding_rate (bool),
  whale_moves (bool), analyst_calls (bool), price_levels (bool),
  correlation (bool), daily_brief (bool), calendar_events (bool),
  trading_rule_violations (bool)

notification_history: id, user_id, type, title, body,
  asset, read (bool), created_at,
  pelican_context (jsonb),              -- Full cached Pelican analysis for instant panel load
  pelican_conversation_id (uuid),       -- Links to pelican_conversations for follow-up
  alert_category (text),                -- portfolio/analyst/derivatives/onchain/macro
  severity (text),                      -- info/warning/critical
  assets_involved (text[]),             -- Which of user's holdings are relevant
  expired (bool)                        -- Alert no longer relevant

-- Education
education_progress: id, user_id, module_slug, completed (bool),
  completed_at
```

### RLS Rules (Non-Negotiable)
- Every user-facing SELECT: `user_id = (SELECT auth.uid())` — no exceptions
- NO `OR is_admin()` on user-facing policies. Service role for admin.
- All RPC functions: `SECURITY DEFINER` + `SET search_path = public`
- Exchange API keys encrypted at rest. Never exposed to client.

---

## Security Rules

- **Rate limiting**: Upstash Redis on all cost-incurring routes. Fails CLOSED.
- **Auth on every API route**: `supabase.auth.getUser()` check. No exceptions for authenticated routes.
- **Stripe**: Server-side plan derivation from priceId. Never trust client-supplied plan names or credit amounts.
- **SnapTrade credentials**: Consumer key stored server-side only. Per-user snaptrade_user_secret encrypted in Supabase. Never exposed to client. SnapTrade handles all exchange OAuth — no exchange API keys touch our system.
- **Input validation**: All user inputs sanitized. Parameterized queries everywhere (no string interpolation in Supabase .or() filters).
- **RLS**: Every table. Users only see own data. Service role for admin/backend.
- **No in-memory rate limiting**: Vercel serverless resets Maps on cold starts. Use Upstash.
- **CSP**: Configure frame-src for any third-party embeds (TradingView, Stripe).

---

## Coding Standards

- TypeScript strict. No `any` where proper types exist. Types in `types/` directory.
- Functional components + hooks. React.memo for expensive list renders.
- Tailwind utilities + CSS custom properties for design tokens.
- PascalCase components, camelCase functions, kebab-case files.
- All mutations in try/catch with user-facing error messages.
- SWR for server state, React Context for client state. Don't mix.
- `tabular-nums` + `font-mono` on ALL numeric data. No exceptions.
- `next/dynamic` instead of React.lazy (App Router compatibility).
- Framer Motion for all animations. No raw CSS transitions for interactive elements.
- Phosphor Icons only. No mixing icon libraries. Weight system for hierarchy.
- `next/image` for all images. No raw `<img>` tags.
- `IF NOT EXISTS` in all migrations. Never break production.
- No console.log in production except intentional error logging via `lib/logger.ts`.

---

## What NOT to Do

- Do NOT add `OR is_admin()` to user-facing RLS policies. (Bug that exposed all data across 37 tables in Pelican v2.)
- Do NOT use in-memory Maps for rate limiting on Vercel.
- Do NOT trust client-supplied plan names or credit amounts. (Billing fraud vector from Pelican v2.)
- Do NOT build a standalone /chat page. Pelican lives in contextual pop-outs only.
- Do NOT assume exchange API data is always available. Cache + graceful degradation.
- Do NOT reveal user portfolio data in community chat context.
- Do NOT use CT jargon without TradFi translation on first mention.
- Do NOT overwhelm first-time users with data density. Progressive disclosure.
- Do NOT use flat outlined boxes. Cards need depth.
- Do NOT skip hover/transition states on clickable elements.
- Do NOT use raw `<img>` tags. Use `next/image`.
- Do NOT leave console.log in production code.
- Do NOT store exchange API keys in client state or localStorage. SnapTrade handles all exchange auth server-side.
- Do NOT use `export const dynamic = 'force-static'` on pages needing auth/DB.

---

## Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Pelican AI
PELICAN_API_URL              # Pelican streaming endpoint
PELICAN_API_KEY              # If applicable

# SnapTrade
SNAPTRADE_CLIENT_ID          # SnapTrade API client ID
SNAPTRADE_CONSUMER_KEY       # SnapTrade API consumer key (SENSITIVE)

# Crypto Data
COINGECKO_API_KEY
COINALYZE_API_KEY
MORALIS_API_KEY              # EVM wallet data (Phase 2)
HELIUS_API_KEY               # Solana wallet data (Phase 2)
# DefiLlama                  # Free, no key needed

# Exchange APIs (per-user, stored encrypted in DB, NOT in env)
# SnapTrade handles all exchange auth via OAuth — no per-user keys in env

# Infrastructure
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
SENTRY_DSN
```

---

## Lessons From Pelican v2 Build (Apply From Day One)

1. `'use client'` pages can't export `metadata`. Use a sibling `layout.tsx`.
2. Set `metadataBase` in layout metadata when using relative OG image paths.
3. Font removal without CSS update breaks all headings. Always grep CSS for hardcoded font names.
4. DOMPurify is browser-only. Dynamic import with `ssr: false`.
5. TranslationProvider returning null during async load unmounts the entire React tree. Render children immediately with fallback strings.
6. Blob URLs are destroyed on page unload. Use Supabase Storage with signed URLs for persistent images.
7. In Vercel serverless, set function timeout to 30s for streaming routes in vercel.json.
8. `export const dynamic = 'force-dynamic'` on all pages needing auth/DB at build time.
9. Satori (OG images): no `justifyContent: 'space-evenly'`, no boolean short-circuit JSX, no 8-digit hex, every div needs `display: 'flex'`.
10. SWR retries infinitely on 400 errors. Add error boundaries and handle 400s in hooks.
11. Agent team file collisions: assign file ownership strictly. One agent per file.
12. Route groups `(admin)` don't add path segments. Use real directories for middleware-protected paths.
13. Supabase FK joins may not exist. Query IDs first, then batch-fetch with `.in()`.
14. Stripe checkout route fails build without env vars. Use `force-dynamic`.
15. CSS values too subtle for dark mode: push contrast 2-3x harder than you think looks right.

---

## MCP Servers

- **Supabase MCP**: Direct database operations, policy management, migrations, live data queries. Essential for security audits and RLS debugging.
- **Vercel MCP**: Deployment management. Lacks domain management (use dashboard).
- Both significantly accelerate development. Configure from session start.

---

## File Ownership (For Agent Teams)

### Shared (Coordinate First)
- `app/layout.tsx` — Root layout
- `lib/supabase/*` — Shared client setup
- `providers/` — Context providers (including PelicanPanelProvider)
- `globals.css` — Design tokens
- `package.json` — Dependencies
- `middleware.ts` — Auth + routing
- `ISSUES_AND_TECH_DEBT.md` — Tech debt tracker (read at start, update at end of every session)
- `tasks/lessons.md` — Lessons learned (update after every bug/fix)

### Feature-Specific (One Agent Each)
- `app/(features)/portfolio/` — Portfolio page
- `app/(features)/signals/` — Signals feed
- `app/(features)/brief/` — Daily brief + What I Missed
- `app/(features)/community/` — Chat room
- `app/(features)/learn/` — Education
- `app/(features)/calendar/` — Crypto calendar
- `app/(features)/watchlist/` — Watchlist + alert config
- `components/pelican-panel/` — Pelican pop-out component
- `hooks/use-pelican-panel.ts` — Pelican panel state
- `hooks/use-snaptrade.ts` — SnapTrade connection + portfolio sync
- `hooks/use-portfolio.ts` — Portfolio data management
- `hooks/use-signals.ts` — Signal aggregation (analysts + CT + wallets)
- `hooks/use-notifications.ts` — Smart notification system
- `hooks/use-behavior.ts` — User behavioral pattern tracking
- `lib/coinalyze.ts` — Funding rate, OI, liquidation data
- `lib/defillama.ts` — DeFi TVL, yield, stablecoin flow data
- `lib/snaptrade.ts` — SnapTrade API client utilities

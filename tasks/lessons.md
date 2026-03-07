# Lessons Learned

## Session 3 — Auth + Middleware + Providers

1. **`'use client'` pages with `createBrowserClient()` fail during SSG** — @supabase/ssr throws when NEXT_PUBLIC env vars are missing at build time. Fix: split into Server Component page (exports `force-dynamic`) + Client Component form.

2. **`useSearchParams()` requires Suspense boundary** — Next.js 14 enforces this at build time. Wrap components using `useSearchParams` in `<Suspense>`.

3. **Pattern: Server Component page wrapper for auth pages** — `page.tsx` is a Server Component that exports `dynamic = 'force-dynamic'` and renders the client form component. This prevents prerendering issues and satisfies Suspense requirements.

4. **Supabase browser client should be created inside event handlers** — Don't create at component body level to avoid SSR issues. Create lazily inside `onClick`/`onSubmit` handlers.

## Session 4 — Navigation, Layout, Shared Components, Utilities, Types

5. **Phosphor Icons `Icon` type** — When mapping string icon names to Phosphor components dynamically, import `type Icon` from `@phosphor-icons/react` for the record value type. Don't manually specify `ComponentType<{ size?: number; weight?: string }>` — the Phosphor `Icon` type handles all props correctly.

6. **CSS `rgba(from ...)` relative color syntax** — Works in modern browsers for extracting r/g/b channels from CSS variables (e.g., `rgba(from var(--bg-base) r g b / 0.95)`). Useful for glassmorphism backgrounds without duplicating hex values.

7. **Agent team file collision prevention** — Shared components agent touched nav files to fix type errors, which the nav agent also wrote. The later agent's fixes were correct, but this reinforces: assign strict file ownership and check for overwrites. In this case both agents ended in the same correct state, but it was a race condition.

8. **Loading skeleton shimmer injection** — Self-injecting CSS keyframes via `useEffect` avoids dependency on globals.css when multiple agents own different CSS concerns. Pattern: check `document.getElementById(keyframe-id)` before injecting.

9. **`color-mix(in srgb, ...)` for dynamic opacity** — Used in severity-tag to derive 12% and 20% opacity backgrounds from any CSS color value. Works in all modern browsers, avoids needing separate rgba variants for each color.

## Session 5 — Pelican Panel

10. **`use-streaming-chat.ts` is READ-ONLY** — This file is fragile and works. Do not modify in future sessions. The streaming hook handles SSE parsing, AbortController cleanup, mock mode, and retry logic. Any change risks breaking streaming. Lesson from Pelican Trading AI v2/v3.

11. **Three-layer Pelican architecture** — Layer 1 (`lib/pelican.ts`) is a pure utility callable from API routes/cron jobs. Layer 2 (`hooks/use-streaming-chat.ts`) wraps it for React streaming. Layer 3 (`hooks/use-pelican-panel.ts` + `components/pelican-panel/`) is panel-specific UI. Future consumers (alerts, daily brief, community bot) use Layer 1 directly without needing the panel.

12. **Streaming text must flow through state** — When adding `streamingText` to the panel architecture, it must be included in `PelicanPanelState` type, exposed from the hook, and included in the noop fallback. Missing it in the noop causes a TypeScript error at build time.

13. **Features layout must be 'use client' for PelicanPanelProvider** — The `(features)/layout.tsx` uses React context (PelicanPanelProvider), which requires client-side rendering. Use the inner component pattern: `FeaturesLayout` wraps with Provider, `FeaturesContent` consumes the context.

14. **Panel content push, not overlay** — Desktop panel uses `marginRight: 440px` on the main content area so content pushes left. The panel doesn't overlay content. Mobile uses a bottom sheet with backdrop overlay instead.

## Session 7 — Signals Intelligence Feed

15. **Suspense boundary propagation via hooks** — If a hook uses `useSearchParams()` (like `usePortfolio`), EVERY component that calls that hook needs a Suspense boundary in its rendering tree. When the header bar started using `usePortfolio` for dynamic portfolio data, it inherited the Suspense requirement. Wrap the component in `<Suspense fallback={...}>` at the call site, not in the hook.

16. **Stub component cleanup** — When replacing stub components (e.g., `signal-card.tsx` returning `null`) with real implementations using different file names (e.g., `analyst-card.tsx`), delete the old stubs. Otherwise imports from other files may reference the dead stubs and cause confusion. Always check for imports of deleted files.

17. **Mock data fallback pattern for API routes** — API routes that query Supabase tables can fall back to mock data when tables are empty. This enables full UI development without requiring data pipelines. Pattern: query DB → if empty → return mock data. The `?mock=true` query param forces mock mode regardless. Remove when real data flows are built.

## Session 8 — Onboarding + Education + Glossary

18. **Agent team file ownership prevents collisions** — Session 8 used 4 parallel agents with strict file ownership. No file was touched by more than one agent. This eliminated the collision issues from Session 4 (lesson 7). Agent file ownership: glossary (lib/glossary/, components/shared/glossary-tooltip.tsx), onboarding (app/onboarding/, hooks/use-onboarding.ts), API routes (app/api/education/, lib/mock-data.ts additions), education page (app/(features)/learn/, hooks/use-education.ts).

19. **Supabase upsert column mismatches** — The onboarding hook initially used `updated_at` in the upsert payload, but the `onboarding_responses` table schema has `completed_at`, not `updated_at`. Supabase silently ignores unknown columns in some cases but this creates a hidden bug where the timestamp is never set. Always verify column names against the actual table schema before writing upsert/insert payloads.

20. **Context providers nest inside PelicanPanelProvider** — New providers (GlossaryProvider) go inside PelicanPanelProvider, not outside. This ensures any provider that needs Pelican panel context can access it. The nesting order in features layout: PelicanPanelProvider → GlossaryProvider → FeaturesContent.

21. **Mock education content is product content** — The 7 education modules with TradFi-bridged explanations are core product content, not throwaway mock data. When seeding the database, use the exact same content from MOCK_EDUCATION_MODULES. The TradFi analogs (e.g., "funding rate is like overnight repo rate") are the product's key differentiator from generic crypto education.

## Session 10 — Community, Calendar, Watchlist, Settings, Pelican Portal

22. **Client components cannot export route segment configs** — `export const dynamic = 'force-dynamic'` is a Next.js route segment config that only works in Server Components (page.tsx without 'use client') or layout.tsx. If a page.tsx has 'use client', the dynamic export is silently ignored or causes issues. Only use it on API routes and Server Component pages.

23. **Lazy Supabase client init in client components** — Creating `createBrowserClient()` at the component body level can cause SSR hydration issues when NEXT_PUBLIC env vars aren't available during SSG. Use `useRef` with lazy initialization inside a getter function to defer creation until first use in an event handler or effect.

24. **Streaming hook reuse across consumers** — The `useStreamingChat` hook (Layer 2) works identically for both the Pelican Panel (contextual pop-outs) and Pelican Portal (full chat). The Portal hook (`use-pelican-portal.ts`) wraps `useStreamingChat` with conversation state management, proving the three-layer architecture works: same streaming layer, different UI consumers.

25. **Portfolio data stripping for shared insights** — When users share Pelican insights to the community, portfolio-specific data must be stripped. Use regex patterns to catch dollar amounts preceded by possessives ("your $43,799 BTC position" → "your BTC position") while preserving general market prices ("BTC is trading at $84,230"). Seven regex patterns cover the common cases.

26. **6-agent parallel build with strict file ownership** — Session 10 used 6 agents (1 shared/DB agent + 5 feature agents) running in parallel with zero file collisions. The key: Agent 6 (shared deps) runs first and completes before launching the 5 feature agents. Each feature agent owns a strict set of files (page, hook, API route). Review agent runs last to catch cross-cutting issues.

## Cleanup Session — Post-Build Security & Code Quality Audit

27. **use-streaming-chat.ts was NOT modified in Session 10** — `git diff HEAD~1 -- hooks/use-streaming-chat.ts` returned empty. The file was included in the commit tree but had zero code changes. The READ-ONLY policy (lesson 10) held. Verified: the Pelican Portal reuses the hook without modification, confirming the three-layer architecture.

28. **Stub API routes are a security smell** — `api/pelican/route.ts` existed as dead code with auth scaffolding but no purpose. Even with auth checks, stub routes increase attack surface and confuse audits. Delete stubs that have no consumers. If a route exists, it should do something real.

29. **All API routes need top-level try/catch** — Supabase `createServerClient()` and `.auth.getUser()` can throw unexpectedly (e.g., missing env vars, network issues). Without a top-level try/catch, the user gets an opaque 500 with no server-side logging. Pattern: wrap the entire handler body, log via `logger.error()`, return a generic 500 JSON response.

## Polish Session A — Pelican Portal Production Upgrade

30. **Shared MarkdownRenderer eliminates duplicate rendering code** — Both the Pelican Panel and Portal need markdown rendering with code blocks, tables, lists, and inline formatting. Extract a shared `components/shared/markdown-renderer.tsx` so both consumers render identically without duplicating parsing/styling logic.

31. **Gradient fade above input creates smooth content-to-input transition** — A `pointer-events-none` absolute-positioned div with a gradient from transparent to the background color above the input area eliminates the hard border between scrollable content and the fixed input. Users can still click through the fade area to interact with content beneath it.

32. **Equalizer typing indicator is more distinctive than bouncing dots** — Three animated bars at different heights and speeds (equalizer pattern) create a more unique and branded typing indicator than the standard bouncing dots pattern. Use Framer Motion with staggered `repeatDelay` and different `duration` values per bar.

33. **Delayed loading spinner prevents flash on fast loads** — Show a loading spinner only after a 200ms delay (`setTimeout` in `useEffect`). If the content loads faster than 200ms, the user never sees the spinner, avoiding a distracting flash. Clean up the timeout on unmount.

34. **File splitting: large page → orchestrator + focused sub-components** — An 805-line `page.tsx` becomes unmanageable. Split into a ~160-line orchestrator that handles state/layout and 6 focused sub-components under 200 lines each (e.g., conversation sidebar, message list, input area, starter prompts, message bubble, empty state). Each sub-component owns one concern. The orchestrator composes them.

## Polish Session B — Sidebar, Header Bar, Portfolio Page

35. **Right-align number columns in data tables** — The single biggest change for making a financial table feel professional. TradFi traders expect right-aligned numbers (ThinkOrSwim, Bloomberg, NinjaTrader all do this). Add `text-right` on all number `<th>` and `<td>` cells, and `items-end` on flex column layouts within cells. This was the most impactful single-line change across the portfolio table.

36. **Gradient tint replaces accent border for card depth** — A `linear-gradient(135deg, rgba(color, 0.04) 0%, var(--bg-surface) 60%)` background gives cards a whisper of color identity without the flat "colored stripe on top" pattern. Each stat card can have its own tint color (green for positive P&L, red for negative, cyan for default).

37. **Make entire table rows clickable for Fitts's Law** — On a financial table, users want to click a row to see details. Adding `cursor-pointer` and `onClick` to the `<tr>` element is a major mobile usability win. Use `e.stopPropagation()` on specific interactive elements within the row (like the Pelican icon) to prevent double-firing.

38. **3-agent parallel polish with strict file ownership** — Polish Session B used 3 agents (sidebar, header, portfolio) with zero file collisions. Each agent owned its specific files and couldn't touch others. The shared CSS changes (globals.css) were made before launching agents to prevent conflicts. Pattern confirmed from Sessions 8, 10, Polish A.

39. **Shimmer loading class in globals.css beats self-injecting keyframes** — The old `loading-skeleton.tsx` injected keyframes via `useEffect` + `document.createElement('style')`. Better to define `.shimmer` as a global CSS class with the keyframe and `background-size: 200% 100%` pattern. Components just add `className="shimmer"` — no runtime style injection needed.

## Polish Session C — Signals, Brief, Calendar, Watchlist, Education, Onboarding, Settings, Community

40. **4-agent worktree-isolated parallel polish with review agent** — Polish Session C used 4 agents in isolated git worktrees with strict file ownership (signals, brief+calendar, watchlist+onboarding, edu+settings+community). After all 4 completed, changes were copied from worktrees to main (no merge conflicts since zero file overlap). A 5th review agent then audited all 22 files for cross-page consistency and made 6 surgical fixes. Pattern: worktree isolation is overkill when file ownership is strict, but provides safety net at no cost.

41. **Left accent borders color-code signal types** — A 3px left border on signal cards creates instant visual categorization: cyan (analyst), purple (CT), green (on-chain), amber (macro). Combined with a matching gradient tint at 4% opacity, each card type has a distinct identity without clashing. The border is the primary signal; the tint is the secondary reinforcement.

42. **Review agent catches cross-agent inconsistencies** — When 4 agents polish independently, they each interpret specs slightly differently. The review agent found: heading sizes varied (18px vs 20px vs 22px), "In your portfolio" badges had extra styling in calendar vs signals, toggle switch dimensions were overridden by min-height. A dedicated review pass is essential after parallel polish work.

43. **Standardize heading sizes with Tailwind utilities, not pixel values** — Agents independently chose `text-[18px]`, `text-[20px]`, `text-[22px]` for page headings. The fix: standardize on `text-xl` (Tailwind utility = 20px) across all pages. Using Tailwind utilities instead of arbitrary values prevents drift.

44. **Settings page decomposition pattern** — A 1165-line settings page was split into 6 sub-components (account, connections, notifications, pelican, privacy, quick-links) averaging 175 lines each, with a 333-line composition page.tsx. Each section is self-contained with its own state management. The page.tsx handles layout and section ordering only.

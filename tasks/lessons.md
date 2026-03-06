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

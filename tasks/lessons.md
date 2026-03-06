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

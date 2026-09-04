# AGENTS.md — schholerp (Apex School ERP)

Next.js 15 + React 19 + Tailwind 3 + shadcn-style UI. Single package. No tests, no CI.
Repo root is `schholerp/` (has `.git`, `package.json`). The parent folder contains nothing else.

## Shell (Windows PowerShell 5.1 — non-negotiable)

- No `&&`, no `tail`, no `||`. Chain with `;` or `cmd1; if ($?) { cmd2 }`.
- Paging: `... 2>&1 | Select-Object -Last 25` (not `| tail`).
- Run commands with `workdir="D:\\projects\\mikesh-scchool-erp\\schholerp"`, never `cd` inside the command.
- File ops: use Read/Write/Edit/Glob/Grep tools, not `cat`/`sed`/`echo`-redirect.

## Verify (only gate that matters)

- `npm run build` — typecheck is enforced (`typescript.ignoreBuildErrors: false`), eslint is ignored during builds. Build passing = safe to deploy to Vercel.
- There is no test runner. `npm run typecheck` (`tsc --noEmit`) is the fast check; `npm run lint` exists but gates nothing.
- Preferred: after edits, run `npm run build` once at the end, not after every file.

## Dev-server gotchas (seen in practice)

- `next/font/google` hard-fails offline (`ENOTFOUND fonts.googleapis.com`) and breaks dev/build. Never use it. Fonts load via runtime `<link>` injection (`SettingsProvider`), offline-safe with system fallback.
- Stale `.next` causes bogus errors (`SegmentViewNode` client-manifest errors, `.nft.json` ENOENT during trace collection) even though code is fine. Fix: stop dev (`Ctrl+C`), `Remove-Item -Recurse -Force .\.next`, restart. The running dev process holds old state in memory — cache delete alone is not enough.
- `experimental.optimizePackageImports` in `next.config.ts` prints a warning; leave it.

## Architecture (follow the existing pattern)

- Routes: `src/app/<domain>/page.tsx` (+ `[id]/page.tsx`). Every page is `"use client"` and composes sections as `<Suspense fallback={<XSkeleton />}>`. Global `loading.tsx`/`error.tsx`/`not-found.tsx` exist at `src/app/`.
- Sections: `src/sections/<domain>/<name>/<name>.tsx` + `<name>.skeleton.tsx`, re-exported via barrel `index.ts`; pages import from `@/sections/<domain>`. Path alias `@/*` → `src/*`.
- Heavy charts (recharts) must be `next/dynamic(..., { ssr: false })` with a skeleton `loading` — see `src/app/page.tsx`. Never static-import recharts in a page.
- Data: `src/lib/services/mock-db.ts` — synchronous localStorage singleton (`"use client"`), keys `school_erp_*_v1`, returns `initial*` fallbacks when not in browser. No async, no pagination server-side. State lives in `ERPProvider` (`src/components/providers/erp-provider.tsx`, value already memoized); user appearance prefs live in `SettingsProvider` (key `school_erp_settings_v1`, applies `--primary`/`--secondary`/`--radius`/`--app-font` CSS vars + next-themes mode).
- Remote images: only `images.unsplash.com` is allowlisted (`next.config.ts` `remotePatterns`). Avatars: use `AppImage` (`components/ui/app-image.tsx`, lazy + fallback), not raw `<img>` (`@next/next/no-img-element` is off, but AppImage is the convention).
- Lists: client filter with 300ms `useDebouncedValue` + `usePagination`/`ListPagination` (`src/lib/hooks/`, `components/ui/list-pagination.tsx`). Memoize row cards with `React.memo`, handlers with `useCallback`.
- Forms: `react-hook-form` + `zod` + `@hookform/resolvers/zod` everywhere. Schema → `useForm({ resolver: zodResolver(schema) })`, text inputs via `register`, Radix `Select` via `watch`/`setValue`, edit-mode prefill via `reset()` in `useEffect` on `open`. Inline per-field errors; `isSubmitting` comes from `formState`.
- Defensively code directory filters/rendering: mock data has missing fields — use `?.` on `.toLowerCase()`/`.map()`/`.length` (e.g. `(s.heads ?? []).map`, `p.items?.length ?? 0`). Past runtime crashes were all this class.
- Styling: Tailwind + CSS vars in `src/app/globals.css` (`font-sans` reads `var(--app-font)` first). Dark mode via `next-themes` class strategy. Keep the existing `Card`/`Badge`/`Table`/`Dialog` vocabulary; don't introduce new component libraries.

## Extending the sidebar / modules

- Nav lives in `src/components/layout/sidebar.tsx` (`navGroups`). Icons from `lucide-react`. Breadcrumb labels in `src/components/layout/breadcrumbs.tsx` (add the route key or it falls back silently).
- 31 modules across 7 groups (Core, Academics & Faculty, HR & Support, Finance & Operations, Communication & Events, Intelligence & Audit, System & DevOps). New module = route + `src/sections/<domain>/` trio (header, metrics-ribbon, directory-view, each with `.skeleton.tsx`) + barrel + sidebar entry.

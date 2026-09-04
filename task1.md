Admin Panel — Dashboard Page Architecture Spec
1. Context & Constraints
Framework: Next.js (App Router)
Rendering mode: This is an internal admin panel, not a public marketing site — SSR/SSG is unnecessary. All dashboard routes should be Client-Side Rendered (CSR) only.
Language: TypeScript, strict mode
Styling: Tailwind CSS + shadcn/ui (+ Framer Motion for transitions where useful)
Goal: A single dashboard page composed of small, isolated, independently-loading sections — not one large monolithic component.
2. Folder Structure

Keep reusable UI primitives in /components (buttons, cards, inputs — already exists) and keep page-specific composed blocks in a separate /sections folder. Sections consume components; they are not the same thing.

src/
├── app/
│   └── (admin)/
│       └── dashboard/
│           └── page.tsx          # thin composition layer only
│
├── components/                    # generic reusable UI (existing)
│   ├── ui/
│   └── shared/
│
├── sections/                      # page-specific, composed sections
│   └── dashboard/
│       ├── quick-action-command-hub/
│       │   ├── index.tsx
│       │   ├── quick-action-command-hub.tsx
│       │   └── quick-action-command-hub.skeleton.tsx
│       ├── executive-dashboard/
│       ├── attendance-rate-trends/
│       ├── fee-collections/
│       ├── performance-overview/
│       ├── campus-capacity-quotas/
│       ├── notices-and-circulars/
│       └── campus-branch-roster/
Naming convention
Folders: lowercase, kebab-case → quick-action-command-hub/
Component files: match folder name, kebab-case → quick-action-command-hub.tsx
Export name inside file: PascalCase → export function QuickActionCommandHub()
Each section folder gets its own index.tsx (barrel export) and its own .skeleton.tsx (loading fallback) — this keeps every section self-contained and independently swappable.
<div align="center">

# 🏫✨ Apex School ERP — `schholerp`

### A Next-Gen Multi-Campus School Management Platform
### 🎓 Academics · 💰 Finance · 👥 HR · 🚌 Transport · 📊 BI · 🛡️ Audit · 🚀 DevOps

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3.24-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.15-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

![Modules](https://img.shields.io/badge/Modules-31-success?style=flat-square)
![Groups](https://img.shields.io/badge/Nav_Groups-7-blueviolet?style=flat-square)
![Routes](https://img.shields.io/badge/Routes-40+-blue?style=flat-square)
![Build](https://img.shields.io/badge/Build-passing-brightgreen?style=flat-square)
![No Tests](https://img.shields.io/badge/Tests-none-lightgrey?style=flat-square)

**One ERP to run every campus — admissions → alumni, fees → payroll, buses → books.**
**Offline-safe demo • Role-aware sidebar • localStorage mock backend • Vercel-ready**

[🚀 Quick Start](#-quick-start-5-minutes) • [🔑 Demo Logins](#-demo-accounts--role-based-access) • [🧭 Modules](#-modules--31-routes-across-7-groups) • [🏗️ Architecture](#️-architecture--conventions) • [🛠️ Troubleshooting](#️-troubleshooting--gotchas)

</div>

---

## 🌈 Why Apex ERP?

| 🎯 Pain | 💊 Apex Cure |
|---|---|
| Data scattered across Excel / registers / WhatsApp | ✅ **Single source of truth** — students, staff, fees, buses, books in one UI |
| Principals can't see cross-campus numbers | ✅ **Multi-campus dashboard** with Recharts BI + Reports module |
| Fee defaulters discovered too late | ✅ **Fees & Collections** pipeline with dues, receipts & badges |
| Timetable clashes every term | ✅ **Timetable grid** + class/section manager |
| No audit trail for edits | ✅ **Audit Logs** + role-guarded routes (Super Admin only) |
| Ugly admin panels nobody wants to use | ✅ **shadcn-style UI**, dark mode, collapsible sidebar, skeletons everywhere |

---

## ✨ Feature Highlights

- 🧭 **Role-aware navigation** — sidebar reshapes itself per role (Super Admin / Principal / Accountant / HR Manager)
- 📊 **BI dashboards** — lazy-loaded Recharts (`next/dynamic`, `ssr:false`) with skeleton fallbacks, never blocking first paint
- 🔍 **Fast directories everywhere** — 300ms debounced search + `usePagination` + `ListPagination`, memoized row cards
- 📝 **Bulletproof forms** — `react-hook-form` + `zod` + `@hookform/resolvers`, inline errors, `reset()` prefill on edit
- 🌙 **Theming at runtime** — `SettingsProvider` injects `--primary / --secondary / --radius / --app-font` CSS vars + `next-themes` dark mode, persisted in `localStorage`
- 🖼️ **Smart images** — `AppImage` component (lazy + fallback), only `images.unsplash.com` allowlisted
- 💾 **Zero-backend demo** — synchronous `mock-db.ts` singleton over `localStorage` (`school_erp_*_v1` keys) with `initial*` fallbacks, works offline
- 🛡️ **Defensive rendering** — every directory codes `?.` guards (`(s.heads ?? []).map`, `p.items?.length ?? 0`) — no crashes on incomplete mock data
- ⚡ **Instant-feel nav** — `prefetch` links + optimistic active-state + `Suspense` skeletons per section (`loading.tsx` / `error.tsx` / `not-found.tsx` global)

---

## 🧭 Modules — 31 Routes Across 7 Groups

> Nav source of truth: `src/components/layout/sidebar.tsx` → `getNavForRole()` in `src/lib/auth/role-navigation.ts`. Breadcrumb labels: `src/components/layout/breadcrumbs.tsx`.

### 🟦 1. Core Management

| Module | Route | Badge | Who sees it |
|---|---|---|---|
| 📊 Dashboard | `/` | — | Everyone |
| 🏢 Campus Branches | `/branches` | `6 Active` | Super Admin, Principal |

### 🟩 2. Academics & Faculty

| Module | Route | Badge | Notes |
|---|---|---|---|
| 🎟️ Admissions | `/admissions` | `Pipeline` | Lead → enrolled funnel |
| 🎓 Students | `/students` + `/students/[id]` | `Roster` | Detail pages per student |
| 📚 Classes & Sections | `/classes` | — | Class → section tree |
| 👩‍🏫 Faculty / Teachers | `/teachers` + `/teachers/[id]` | — | HR-visible directory |
| 🗓️ Timetable | `/timetable` | `5` | Weekly grid |
| 📝 Homework | `/homework` + `/homework/[id]` | `5` | Class-wise assignments |
| 📄 Exams & Results | `/exams` + `/exams/[id]` | `5` | Results + report cards |
| 📖 Library | `/library` | `8` | Books, issues, returns |

### 🟨 3. HR & Support Staff

| Module | Route | Badge | Notes |
|---|---|---|---|
| 💼 HR / Staff Directory | `/hr` | `HR` | Leaves, directory, biometric link |

### 🟧 4. Finance & Operations

| Module | Route | Badge | Who |
|---|---|---|---|
| 💳 Fees & Collections | `/fees` | `9` | Accountant + Principal |
| 🫆 Attendance & Biometric | `/attendance` | `Live` | Staff + student presence |
| 🚌 Transport & Fleet | `/transport` + `/transport/[id]` | `5` | Buses, routes, drivers |
| 📦 Inventory & Stock | `/inventory` + `/inventory/[id]` | `7` | Everyone — consumables & assets |
| 🧾 Expenses & Ledger | `/expenses` + `/expenses/[id]` | `7` | Finance + Principal |
| 💵 Payroll | `/payroll` + `/payroll/[id]` | `7` | Finance + HR |
| 📁 Documents | `/documents` | `7` | Certificates, uploads |

### 🟪 5. Communication & Events

| Module | Route | Badge |
|---|---|---|
| 📢 Announcements | `/announcements` | `6` |
| 💬 Messages | `/messages` + `/messages/[id]` | `3` |
| 🔔 Notifications | `/notifications` | `5` |
| 🎉 Events Calendar | `/events` | `8` |
| ❤️ Parent Portal | `/parents` | `Live` |

### 🟥 6. Intelligence & Audit

| Module | Route | Badge | Guard |
|---|---|---|---|
| 📈 Reports & BI | `/reports` | `7` | Everyone |
| 🐞 QA & Bug Tracker | `/qa` + `/qa/bugs` + `/qa/bugs/[id]` + `/qa/test-cases` | `8` | Super Admin only 🔒 |
| 🛡️ Audit Logs | `/audit` | `10` | Super Admin only 🔒 |
| 🧪 Engineering | `/engineering` | `10` | Super Admin only 🔒 |

### ⬛ 7. System & DevOps

| Module | Route | Badge | Guard |
|---|---|---|---|
| 🚀 Builds | `/builds` | `9` | Super Admin only 🔒 |
| 🖥️ Deployments | `/deployments` | `9` | Super Admin only 🔒 |
| ⚙️ Settings | `/settings` | — | Super Admin only 🔒 (theme, font, radius) |

> ➕ **Adding a module?** Create route `src/app/<domain>/page.tsx` (+ `[id]/page.tsx`) → trio in `src/sections/<domain>/` (header, metrics-ribbon, directory-view, each with `.skeleton.tsx`) → barrel `index.ts` → sidebar entry in `role-navigation.ts` → breadcrumb key.

---

## 🔑 Demo Accounts & Role-Based Access

All demo passwords are identical for easy testing:

| 🧑‍💼 Role | 📧 Email | 🔒 Password | 🏁 Lands on | 🎯 Sees |
|---|---|---|---|---|
| 👑 **Super Admin** — Dr. Alexander Wright | `admin@gmail.com` | `admin123` | `/` | Everything (31 modules) |
| 🎓 **Principal** — Dr. Clara Higgins | `principal@gmail.com` | `admin123` | `/` | Academics, campus, fees-read, events |
| 🧾 **Chief Accountant** — Hannah Montgomery | `accountant@gmail.com` | `admin123` | `/fees` | Fees, payroll, expenses, students, attendance |
| 🤝 **HR Manager** — Daniel Okafor | `hr@gmail.com` | `admin123` | `/hr` | HR, payroll, events, attendance |

> Logic: `src/lib/auth/demo-accounts.ts` (`authenticateDemoUser`) + `src/lib/auth/role-navigation.ts` (`getNavForRole`, `canRoleAccessPath`, `getLandingPageForRole`). State: `ERPProvider` (`src/components/providers/erp-provider.tsx`).

---

## 🛠️ Tech Stack

| Layer | Choice | Version |
|---|---|---|
| 🖥️ Framework | Next.js (App Router) | `^15.1.7` |
| ⚛️ UI runtime | React + React DOM | `^19.0.0` |
| 🔷 Language | TypeScript (`ignoreBuildErrors: false`) | `^5.7.3` |
| 🎨 Styling | Tailwind CSS + `tailwind-merge` + `clsx` | `^3.4.17` |
| 🧩 Components | Radix UI (Avatar, Dialog, Select, Tabs, Tooltip…) + shadcn-style wrappers | various `^1.x / ^2.x` |
| 📊 Charts | Recharts (always `next/dynamic`, `ssr:false`) | `^2.15.1` |
| 📝 Forms | react-hook-form + zod + @hookform/resolvers | `^7.54 / ^3.24` |
| 🎭 Icons | lucide-react | `^0.475` |
| 🌙 Theme | next-themes (class strategy) | `^0.4.4` |
| 🔔 Toasts | sonner | `^1.7.4` |
| 📋 Tables | @tanstack/react-table | `^8.21` |

> ⚠️ Never use `next/font/google` — it hard-fails offline (`ENOTFOUND fonts.googleapis.com`). Fonts load via runtime `<link>` in `SettingsProvider` with system fallback.

---

## 🚀 Quick Start (5 Minutes)

### 1️⃣ Prerequisites

- Node.js 18.18+ / 20+ and npm
- Windows PowerShell 5.1 (commands below are PowerShell-safe — no `&&`, no `tail`, no `||`)

### 2️⃣ Install & run

```powershell
npm install
npm run dev
```

Open 👉 http://localhost:3000/login — pick any demo card or type an email above with `admin123`.

### 3️⃣ Useful scripts

| Command | What it does | When to use |
|---|---|---|
| `npm run dev` | Start dev server | Daily dev |
| `npm run build` | Production build (**typecheck enforced**, eslint ignored) | ✅ **Only gate that matters — must pass before deploy** |
| `npm run typecheck` | `tsc --noEmit` fast check | Quick sanity after edits |
| `npm run lint` | `next lint` | Informational, gates nothing |
| `npm run start` / `npm run preview` | Serve production build | Pre-deploy smoke test |

> 💡 Preferred loop: edit → `npm run build` **once at the end** (not after every file).

---

## 🏗️ Architecture & Conventions

```text
src/
├── app/<domain>/page.tsx (+ [id]/page.tsx)   # "use client", Suspense + XSkeleton sections
│   ├── loading.tsx / error.tsx / not-found.tsx
│   └── globals.css                            # Tailwind + --primary/--secondary/--radius/--app-font vars
├── sections/<domain>/                         # header / metrics-ribbon / directory-view
│   ├── <name>/<name>.tsx + <name>.skeleton.tsx
│   └── index.ts                               # barrel — pages import via @/sections/<domain>
├── components/
│   ├── layout/   (sidebar.tsx, breadcrumbs.tsx, topbar…)
│   ├── providers/ (erp-provider.tsx, settings-provider.tsx)
│   └── ui/       (Card, Badge, Table, Dialog, AppImage, ListPagination…)
├── lib/
│   ├── services/mock-db.ts     # sync localStorage singleton, school_erp_*_v1 keys
│   ├── mock-data/*.ts          # initial* fallbacks per domain
│   ├── auth/                   # demo-accounts.ts, role-navigation.ts
│   ├── hooks/                  # useDebouncedValue (300ms), usePagination
│   └── settings.ts / india.ts / utils.ts
└── types/                      # Role, UserSession, domain entities
```

### 🧩 Page pattern (copy-paste this)

```tsx
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader, MetricsRibbon, DirectoryView } from "@/sections/dashboard";
import { DashboardHeaderSkeleton, MetricsRibbonSkeleton, DirectoryViewSkeleton } from "@/sections/dashboard";

// Heavy charts: NEVER static-import recharts in a page
const BigChart = dynamic(() => import("@/sections/dashboard/big-chart"), {
  ssr: false,
  loading: () => <MetricsRibbonSkeleton />,
});

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <Suspense fallback={<DashboardHeaderSkeleton />}><DashboardHeader /></Suspense>
      <Suspense fallback={<MetricsRibbonSkeleton />}><MetricsRibbon /></Suspense>
      <Suspense fallback={<DirectoryViewSkeleton />}><DirectoryView /></Suspense>
    </main>
  );
}
```

### 📝 Form pattern

```tsx
const schema = z.object({ name: z.string().min(2, "Name is required") });
const { register, watch, setValue, reset, formState: { errors, isSubmitting } } =
  useForm({ resolver: zodResolver(schema) });
// Radix Select via watch/setValue • edit prefill via reset() in useEffect on `open`
```

### 🖼️ Images & lists

- Avatars/remote → `<AppImage>` (`components/ui/app-image.tsx`), not raw `<img>`.
- Lists → `useDebouncedValue(300ms)` + `usePagination` + `<ListPagination>`; memoize cards (`React.memo`), handlers (`useCallback`).
- Path alias `@/*` → `src/*`. Keep `Card` / `Badge` / `Table` / `Dialog` vocabulary — no new component libs.

---

## 💾 Data Layer (No Backend Needed)

`src/lib/services/mock-db.ts` — synchronous, `"use client"` singleton:

- Keys: `school_erp_*_v1` (settings: `school_erp_settings_v1`)
- Returns `initial*` fallbacks when `window` is absent (SSR-safe)
- `ERPProvider` holds app state (memoized value); `SettingsProvider` holds appearance prefs and writes CSS vars live

Reset demo data anytime:

```powershell
# In browser DevTools console:
localStorage.clear(); location.reload()
```

---

## 🧪 Verification Checklist

- [ ] `npm run build` passes (typecheck enforced) ✅
- [ ] Login works for all 4 demo roles, sidebars differ correctly
- [ ] Every directory: search (debounced) + pagination + empty-state render with no crash on missing fields
- [ ] Dark mode + accent/radius/font changes persist after reload
- [ ] No static `recharts` import in any `page.tsx` (`grep -r "from \"recharts\""` should only hit section internals)

---

## 🛠️ Troubleshooting & Gotchas

| 🔥 Symptom | 🧯 Fix |
|---|---|
| `ENOENT ... .next/routes-manifest.json`, `SegmentViewNode` manifest errors, `.nft.json ENOENT` | **Stale `.next`** — code is fine. Stop dev (`Ctrl+C`), then `Remove-Item -Recurse -Force .\.next`, restart with `npm run dev`. Deleting cache while dev still runs is NOT enough (holds state in memory). |
| `ENOTFOUND fonts.googleapis.com` | You (or a dep) used `next/font/google`. Remove it — fonts come from `SettingsProvider` runtime `<link>`. |
| `experimental.optimizePackageImports` warning | Harmless — leave it (`next.config.ts`). |
| Images 400 / unoptimized | Only `images.unsplash.com` is allowlisted (`remotePatterns`). Use `AppImage`. |
| Sidebar item missing breadcrumb | Add the route key in `src/components/layout/breadcrumbs.tsx` (fails silently otherwise). |
| Blank page after `localStorage` edit | Corrupt key — `localStorage.clear(); location.reload()`. |

---

## 🗺️ Roadmap Ideas

- 🔐 Real auth (NextAuth) + DB (Postgres/Prisma) replacing `mock-db`
- 🧾 Fee receipts PDF + UPI/Razorpay hooks
- 📱 PWA + biometric attendance kiosk mode
- 🚌 GPS live bus tracking + parent SMS/push
- 📊 Exportable BI (CSV/PDF) from Reports
- ✅ Vitest + Playwright (repo currently has **no tests / no CI**)

---

## 🤝 Contributing

1. New module = route + `src/sections/<domain>/` trio (header, metrics-ribbon, directory-view + skeletons) + barrel + sidebar + breadcrumb.
2. Follow the file patterns above (client pages, dynamic charts, RHF+zod forms, debounced lists).
3. Run `npm run build` once at the end — must stay green.
4. PowerShell-safe commands only (`;` / `if ($?)`, `Select-Object -Last 25` for paging, `workdir` instead of `cd`).

---

<div align="center">

### 💜 Built for schools that deserve beautiful software

**Apex ERP** • Multi-Campus Group • `schholerp/`

⭐ Star it • 🍴 Fork it • 🎓 Ship it to your campus

</div>

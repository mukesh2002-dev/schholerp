---
name: ui-spacing-alignment
description: Production-grade spacing, padding, margin, and alignment rules for React/Next.js + Tailwind CSS + shadcn/ui components. Use this skill whenever building, reviewing, or fixing UI components, pages, sections, cards, forms, tables, sidebars, or dashboards — especially when the user asks to make something "look better," "more aligned," "cleaner spacing," "more polished," "production-grade," or complains that spacing/padding/margin/alignment looks off, inconsistent, cramped, or unbalanced. Enforces a strict 4px-based spacing scale so every component in the codebase stays visually consistent. Trigger this proactively for ANY new component or page creation, not just explicit spacing complaints.
---

# UI Spacing & Alignment — Production Grade

A hard, non-negotiable spacing/alignment system for Tailwind + shadcn/ui + React/Next.js codebases. The goal: every screen looks like it came from the same design system, with zero "eyeballed" spacing.

## Core rule: the 4px grid

Every margin, padding, gap, and dimension must be a multiple of 4px. Never use arbitrary values (`p-[13px]`, `mt-[7px]`) unless matching a fixed external constraint (e.g. icon size from a library).

| Tailwind class | px | Use for |
|---|---|---|
| `1` | 4px | icon-to-text gap, tightest inline spacing |
| `2` | 8px | gap between related inline items (badge + label) |
| `3` | 12px | input padding-y, small card padding |
| `4` | 16px | default component padding, gap between form fields |
| `6` | 24px | card padding, gap between grouped sections inside a card |
| `8` | 32px | gap between distinct sections on a page |
| `12` | 48px | gap between major page regions (header → content) |
| `16` | 64px | page-level top/bottom breathing room |

Never mix arbitrary px values with this scale in the same component. If a design need falls between steps, round up to the next step — don't introduce a new one-off value.

## Component padding standards

- **Cards / panels**: `p-6` (24px) default. Dense data cards (e.g. stat tiles): `p-4`.
- **Buttons**: shadcn defaults are already correct — don't override `px`/`py` on `<Button>` unless building a custom variant.
- **Inputs / form fields**: `px-3 py-2` (shadcn default) — keep consistent across every form in the app.
- **Table cells**: `px-4 py-3`. Never let header cells and body cells use different horizontal padding — headers and rows must align on the same grid.
- **Modals / dialogs**: `p-6` body, `pb-4` for the header separator area.
- **Sidebar nav items**: `px-3 py-2`, with `gap-2` between icon and label.

## Spacing between elements (margin/gap, not padding)

Prefer `gap` (flex/grid) over `margin` for spacing between sibling elements — it avoids collapsing-margin bugs and is easier to reason about.

```tsx
// Good — gap-based, no margin juggling
<div className="flex flex-col gap-4">
  <Field label="Student Name" />
  <Field label="Class" />
</div>

// Avoid — margin on children, fragile and inconsistent
<div>
  <Field label="Student Name" className="mb-4" />
  <Field label="Class" />
</div>
```

- Vertical rhythm between stacked form fields: `gap-4` (16px)
- Vertical rhythm between stacked sections in a page: `gap-8` (32px)
- Horizontal rhythm between inline action buttons: `gap-2` (8px)
- Horizontal rhythm between icon and adjacent text: `gap-2` (8px)

## Section and page-level layout

```tsx
// Page shell pattern — use this structure for every module page
<div className="flex flex-col gap-8 p-6 md:p-8">
  <header className="flex items-center justify-between">
    <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
    <Button>Add Student</Button>
  </header>

  <section className="flex flex-col gap-4">
    {/* filters/search bar */}
  </section>

  <section className="rounded-lg border p-6">
    {/* main content: table, cards, etc. */}
  </section>
</div>
```

Rules:
- Page container: `p-6` on mobile, `p-8` on `md:` and up. Never let content touch the viewport edge.
- Gap between page header, filter bar, and main content block: `gap-8`.
- Every distinct "section" (card, table wrapper, form block) gets `rounded-lg border p-6` unless it's explicitly meant to be borderless/inline.

## Alignment rules

1. **Baseline-align icon + text pairs.** Use `flex items-center gap-2`, never `items-start` or manual top margin to nudge an icon into place.
2. **Right-align numeric/currency columns** in tables (`text-right tabular-nums`); left-align everything else. Never center table cells — centering makes columns hard to scan.
3. **Form label + input alignment**: labels sit directly above inputs (`flex flex-col gap-1.5`), never inline-left-aligned with fixed-width labels — that pattern breaks on mobile and with translated labels.
4. **Button groups**: right-align in modals/forms (`flex justify-end gap-2`), left-align in toolbars.
5. **Empty/loading/error states** inside a section must use the *same padding* as the populated state (`p-6`) — don't let empty states look cramped or full-bleed just because there's less content.

## Responsive behavior

- Reduce section padding by one step on mobile: `p-6` desktop → `p-4` mobile (`className="p-4 md:p-6"`).
- Stack horizontal layouts vertically below `md:` — never let `flex-row` cause horizontal scroll on small screens; use `flex flex-col md:flex-row`.
- Sidebar: collapse to icon-only or drawer below `md:` — don't just shrink padding to force-fit a 240px sidebar on mobile.

## Pre-ship checklist (run this before calling any component "done")

- [ ] Every padding/margin/gap value is on the 4px scale — no arbitrary `[Npx]` values
- [ ] Related items use `gap`, not manual `margin` on children
- [ ] Icon+text pairs are `items-center`, not `items-start`
- [ ] Numeric table columns are right-aligned; text columns are left-aligned
- [ ] Section padding is consistent across populated, loading, empty, and error states
- [ ] Mobile breakpoint reduces padding by exactly one scale step, not ad hoc
- [ ] No two sibling cards/sections in the same page use different padding values without a stated reason

## When reviewing existing code

If asked to "fix spacing/alignment" on an existing component: read the file, find every arbitrary or inconsistent spacing value, and normalize all of them to the nearest scale step in one pass — don't fix only the one the user pointed at. Flag (but don't silently change) any spacing tied to a hard external constraint (e.g. a third-party embed with fixed dimensions).
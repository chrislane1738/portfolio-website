# Projects Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/projects` timeline with a dated, tagged index and a live detail panel.

**Architecture:** Pure helpers in `src/lib/projects.ts` (date formatting, sort, filter, counts, selection logic) are unit-tested. `ProjectIndex` (client) owns filter/selection state and renders the list; `ProjectDetail` renders one project and is reused by the desktop side panel and the mobile accordion. Data lives in `src/data/projects.ts`.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind, Vitest (node env).

**Spec:** `docs/superpowers/specs/2026-10-25-projects-index-design.md`

## Global Constraints

- Tags: `'work' | 'muse' | 'venture' | 'tool' | 'club'`; labels Work, Muse, Venture, Tool, Club.
- `date` is `'YYYY-MM'`; display as `Mon YYYY`.
- Copy: no em-dashes, no slogans, no "obsessed"/"leveraging"; work items vague.
- Theme tokens only (`bg-bg-elevated`, `text-text-*`, `border-hairline`, `accent`); fonts `font-display` / `font-sans`.
- Selection mirrored to `?p=<id>` via `history.replaceState`.

## Review Focus

- `?p=` with an unknown id → first visible item selected, no crash. (Task 1: `resolveSelection` test)
- Selected item filtered out by a tag change → first visible item becomes selected. (Task 1: `resolveSelection` test)
- ↑ on first row / ↓ on last row → selection stays put (no wrap, no undefined). (Task 1: `moveSelection` test)
- Malformed `date` string → rendered verbatim instead of `undefined NaN`. (Task 1: `formatProjectDate` test)
- Project with no image, link, or tech → panel renders with no empty boxes. (Task 3: Playwright check on a work item)

---

### Task 1: Project helpers

**Files:**
- Create: `src/lib/projects.ts`
- Test: `src/lib/projects.test.ts`

**Interfaces:**
- Consumes: `Project`, `ProjectTag` from `@/data/projects` (Task 2 adds `date`/`tag`; tests use local fixtures typed via `Pick`).
- Produces: `TagFilter`, `TAG_LABELS`, `TAG_ORDER`, `formatProjectDate(date: string): string`, `sortProjects<T extends {date: string}>(list: readonly T[]): T[]`, `filterProjects<T extends {tag: ProjectTag}>(list: readonly T[], filter: TagFilter): T[]`, `tagCounts(list: readonly {tag: ProjectTag}[]): Record<TagFilter, number>`, `resolveSelection(list: readonly {id: string}[], id: string | null): string | null`, `moveSelection(list: readonly {id: string}[], id: string | null, delta: 1 | -1): string | null`.

- [ ] **Step 1: Write failing tests** (`src/lib/projects.test.ts`)

```ts
import { describe, expect, it } from 'vitest'
import { filterProjects, formatProjectDate, moveSelection, resolveSelection, sortProjects, tagCounts } from './projects'

const items = [
  { id: 'a', date: '2026-02', tag: 'tool' as const },
  { id: 'b', date: '2026-07', tag: 'work' as const },
  { id: 'c', date: '2026-07', tag: 'tool' as const },
  { id: 'd', date: '2026-10', tag: 'muse' as const },
]

describe('formatProjectDate', () => {
  it('formats YYYY-MM', () => expect(formatProjectDate('2026-10')).toBe('Oct 2026'))
  it('returns malformed input verbatim', () => {
    expect(formatProjectDate('Oct 2026')).toBe('Oct 2026')
    expect(formatProjectDate('2026-13')).toBe('2026-13')
  })
})

describe('sortProjects', () => {
  it('sorts newest first, keeping file order within a month', () => {
    expect(sortProjects(items).map(p => p.id)).toEqual(['d', 'b', 'c', 'a'])
  })
})

describe('filterProjects / tagCounts', () => {
  it('filters by tag and passes everything for all', () => {
    expect(filterProjects(items, 'tool').map(p => p.id)).toEqual(['a', 'c'])
    expect(filterProjects(items, 'all')).toHaveLength(4)
  })
  it('counts per tag including zeros', () => {
    expect(tagCounts(items)).toEqual({ all: 4, work: 1, muse: 1, venture: 0, tool: 2, club: 0 })
  })
})

describe('resolveSelection', () => {
  it('keeps a visible id', () => expect(resolveSelection(items, 'c')).toBe('c'))
  it('falls back to first item for unknown or filtered-out id', () => {
    expect(resolveSelection(items, 'nope')).toBe('a')
    expect(resolveSelection(filterProjects(items, 'tool'), 'b')).toBe('a')
    expect(resolveSelection(items, null)).toBe('a')
  })
  it('returns null for an empty list', () => expect(resolveSelection([], 'a')).toBeNull())
})

describe('moveSelection', () => {
  it('moves and clamps at the ends', () => {
    expect(moveSelection(items, 'a', 1)).toBe('b')
    expect(moveSelection(items, 'a', -1)).toBe('a')
    expect(moveSelection(items, 'd', 1)).toBe('d')
  })
  it('starts from the first item when nothing valid is selected', () => {
    expect(moveSelection(items, 'nope', 1)).toBe('a')
    expect(moveSelection([], null, 1)).toBeNull()
  })
})
```

- [ ] **Step 2: Run, expect FAIL** — `npx vitest run src/lib/projects.test.ts` → "Failed to resolve import ./projects".

- [ ] **Step 3: Implement** (`src/lib/projects.ts`)

```ts
import type { ProjectTag } from '@/data/projects'

export type TagFilter = ProjectTag | 'all'

export const TAG_ORDER: ProjectTag[] = ['work', 'muse', 'venture', 'tool', 'club']

export const TAG_LABELS: Record<ProjectTag, string> = {
  work: 'Work',
  muse: 'Muse',
  venture: 'Venture',
  tool: 'Tool',
  club: 'Club',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatProjectDate(date: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(date)
  const month = match ? Number(match[2]) : 0
  if (!match || month < 1 || month > 12) return date
  return `${MONTHS[month - 1]} ${match[1]}`
}

/** Newest first. Array.prototype.sort is stable, so same-month items keep file order. */
export function sortProjects<T extends { date: string }>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
}

export function filterProjects<T extends { tag: ProjectTag }>(list: readonly T[], filter: TagFilter): T[] {
  return filter === 'all' ? [...list] : list.filter(p => p.tag === filter)
}

export function tagCounts(list: readonly { tag: ProjectTag }[]): Record<TagFilter, number> {
  const counts: Record<TagFilter, number> = { all: list.length, work: 0, muse: 0, venture: 0, tool: 0, club: 0 }
  for (const p of list) counts[p.tag]++
  return counts
}

/** The selected id if it's in the list, otherwise the first item's id. */
export function resolveSelection(list: readonly { id: string }[], id: string | null): string | null {
  if (id && list.some(p => p.id === id)) return id
  return list[0]?.id ?? null
}

/** Step the selection by one row, clamped to the ends of the list. */
export function moveSelection(list: readonly { id: string }[], id: string | null, delta: 1 | -1): string | null {
  const index = list.findIndex(p => p.id === id)
  if (index === -1) return list[0]?.id ?? null
  const next = Math.min(list.length - 1, Math.max(0, index + delta))
  return list[next].id
}
```

- [ ] **Step 4: Run, expect PASS** — `npx vitest run src/lib/projects.test.ts`. (Typecheck waits for Task 2, which adds `ProjectTag`.)

### Task 2: Data model + copy, remove old timeline

**Files:**
- Modify: `src/data/projects.ts` (full rewrite)
- Delete: `src/components/{ProjectTimeline,ProjectNode,ProjectModal,FavoritesFilterButton,TimelineTeaser,SectionDivider}.tsx`
- Modify: `src/app/globals.css` (drop `.timeline-node`, floating-card, modal-fade-in, favorites-toast blocks; add `.detail-in`)

**Interfaces:**
- Produces: `ProjectTag`, `Project` (`id, title, description, date, tag, org?, image?, tech?, link?`), `projects: Project[]`.

- [ ] **Step 1: Rewrite `src/data/projects.ts`** with the type below and all 16 entries (dates/tags per spec table; descriptions plain, per Global Constraints; existing `image`, `tech`, `link` values carried over unchanged).

```ts
export type ProjectTag = 'work' | 'muse' | 'venture' | 'tool' | 'club'

export interface Project {
  id: string
  title: string
  description: string
  /** 'YYYY-MM' */
  date: string
  tag: ProjectTag
  /** Shown as "Internal · <org>" on work items. */
  org?: string
  image?: string
  tech?: string[]
  link?: { url: string; label: string; external: boolean }
}
```

New entries:

```ts
{ id: 'pokemon-stock-checker', title: 'Pokemon Card Stock Checker', date: '2026-10', tag: 'muse',
  description: 'Watches retail stores and free Discord servers for Pokemon cards in stock at MSRP.', tech: ['Muse'] },
{ id: 'daily-technicals', title: 'Daily Technicals', date: '2026-09', tag: 'muse',
  description: 'A bigger version of IB Daily Question with far more depth. Built and hosted on Muse.', tech: ['Muse'] },
{ id: 'populate-financials', title: 'Populate Financials', date: '2026-07', tag: 'work', org: 'TeedUp',
  description: "Reads a new deal's CIM or financials and fills the historicals into our LBO model on SharePoint. Cuts about 20 minutes of manual entry down to 2." },
{ id: 'portco-reporting', title: 'Portco Reporting Dashboard', date: '2026-06', tag: 'work', org: 'TeedUp',
  description: 'Tracks transactions, financials, and fund reporting across our portfolio companies.' },
```

- [ ] **Step 2: Delete old components and their CSS; add detail fade**

```bash
git rm -q src/components/{ProjectTimeline,ProjectNode,ProjectModal,FavoritesFilterButton,TimelineTeaser,SectionDivider}.tsx
```

```css
/* Project detail panel crossfade */
@keyframes detail-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.detail-in { animation: detail-in 0.2s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .detail-in { animation: none; }
}
```

- [ ] **Step 3: Verify** — `npx vitest run` passes. `npx tsc --noEmit` fails only on `src/app/projects/page.tsx` importing `ProjectTimeline` (fixed in Task 3).

### Task 3: ProjectIndex + ProjectDetail + page

**Files:**
- Create: `src/components/ProjectDetail.tsx`, `src/components/ProjectIndex.tsx`
- Modify: `src/app/projects/page.tsx`

**Interfaces:**
- Consumes: Task 1 helpers, Task 2 `projects`.
- Produces: `<ProjectIndex />` (no props), `<ProjectDetail project={Project} />`.

- [ ] **Step 1: `ProjectDetail`** renders image (16:10, `object-cover object-top`, only if present), title, `date · tag[ · Internal · org]`, description, tech chips (only if non-empty), link (`↗` external `<a target=_blank>`, `→` internal `<Link>`; only if present).

- [ ] **Step 2: `ProjectIndex`** — state `filter`, `selectedId`, `openId`. `visible = filterProjects(sorted, filter)`, `activeId = resolveSelection(visible, selectedId)`. On mount read `?p`; effect mirrors `activeId` to URL. Chips (`All` + `TAG_ORDER`, with counts). List rows are buttons: hover/focus select; click selects and toggles mobile accordion. `onKeyDown` on the list: ↑/↓ → `moveSelection` + focus row; Enter → open `active.link`. Desktop aside renders `<ProjectDetail>` keyed by id inside `.detail-in`. Empty list shows "Nothing here yet."

- [ ] **Step 3: Page** — `src/app/projects/page.tsx` renders `<h1>Projects</h1>` + `<ProjectIndex />` in a `md:h-[100svh]` flex column so the list scrolls internally on desktop.

- [ ] **Step 4: Verify** — `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build` all pass. Playwright at 1440×900 and 390×844: chips filter (Work → 2 rows), ↓ moves selection and updates `?p=`, `/projects?p=daily-technicals` loads with it selected, `/projects?p=bogus` selects first row, work item panel has no empty image/tech/link boxes, mobile tap expands inline.

- [ ] **Step 5: Commit** spec, plan, and Tasks 1–3 together as `feat(projects): dated tagged index with live detail panel`.

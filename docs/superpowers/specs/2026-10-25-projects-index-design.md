# Projects Index — Design

**Date:** 2026-10-25
**Branch:** `redesign/landing`

## Goal

Replace the scroll-heavy `/projects` timeline with a compact, dated, tagged index plus a live detail panel. Accommodate 16+ items, including vague work items with no links or images. Rewrite descriptions in plain language.

## Layout

**Desktop (md+):** normal page flow; only the timeline box scrolls.

- Header: small `Projects` heading, then tag filter chips: `All · Work · Muse · Venture · Tool · Club`, each with a count. Clicking filters the list.
- Left (~55%): vertical timeline, newest first, in a 520px box that scrolls internally (top/bottom fade). Row = `Mon YYYY` · dot on a vertical line · title · tag label. Hovered/selected dot grows and turns accent. (Revised 2026-10-25: timeline instead of plain list.)
- Right (~45%): detail for hovered/selected item: image (if any), title, `date · tag` (+ `Internal · TEEDUP` for work), description, tech list, link (if any). Content crossfades on change.
- First visible item selected on load and after filter change.
- Keyboard: ↑/↓ move selection, Enter opens link.
- Selection mirrored in URL as `?p=<id>` (replaceState); valid `?p` on load selects that item.

**Mobile (<md):** no side panel. Chips scroll horizontally. Tapping a row expands its detail inline (accordion, one open).

## Data model (`src/data/projects.ts`)

```ts
type ProjectTag = 'work' | 'muse' | 'venture' | 'tool' | 'club'
interface Project {
  id: string; title: string; description: string;
  date: string;        // 'YYYY-MM', sort key
  tag: ProjectTag;
  org?: string;        // e.g. 'TEEDUP'
  image?: string; tech?: string[];
  link?: { url: string; label: string; external: boolean };
}
```

- `year` string → `date: 'YYYY-MM'`, formatted for display (`Oct 2026`).
- `favorite` and `visibility` removed.
- Pure helpers in `src/lib/projects.ts`: `formatProjectDate`, `sortProjects` (newest first, stable), `filterProjects(projects, tag | 'all')`, `tagCounts`. Unit-tested.

### Tags

| Tag | Items |
|---|---|
| work | Populate Financials (2026-07), Portco Reporting Dashboard (2026-06) |
| muse | Pokemon Card Stock Checker (2026-10), Daily Technicals (2026-09) |
| venture | Stralane, Delta Fightwear |
| tool | Compound Interest Calculator, Graham Screener, P/E Comparative Analysis, Portfolio Builder, UFC ML Model, Trading Bot, Equity Research Agent Team, IB Daily Question |
| club | VFC Research Dashboard, PE Curriculum |

## Copy

Every description rewritten: short, plain, first person where natural. No em-dashes, no slogans, no "obsessed"/"leveraging". Work items stay vague (no client names, no numbers beyond the 20→2 min time saving).

## Removed

`ProjectTimeline`, `ProjectNode`, `ProjectModal`, `FavoritesFilterButton`, `TimelineTeaser`, `SectionDivider` (all unused after this change) and their CSS (`.timeline-node`, floating-card keyframes).

## Verification

Unit tests for helpers; `tsc`, lint, `vitest`, `next build` pass. Playwright: desktop + mobile screenshots, filter click, keyboard nav, `?p=` deep link.

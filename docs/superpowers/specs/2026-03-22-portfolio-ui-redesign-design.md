# Portfolio Website UI Redesign — Design Spec

**Date:** 2026-03-22
**Status:** Approved
**Approach:** Monolith

---

## Overview

Full UI redesign of the portfolio website. The site has three navigable pages (Landing, Projects, About) plus four hidden tool pages preserved at their current routes. The design direction is "Monolith" — dark, technical, and architecturally minimal with a scroll-driven hero morph on the landing page and a timeline-based project progression.

### Audience

- **Primary:** Recruiters/hiring managers (quick credibility, clean professionalism)
- **Secondary:** Peers/community (technical depth, craft)

### Pages & Routes

| Page | Route | In Nav | Notes |
|------|-------|--------|-------|
| Landing | `/` | — | Hero morph + timeline teaser |
| Projects | `/projects` | Yes | Full project timeline |
| About | `/about` | Yes | Two-column bio |
| Calculator | `/calculator` | No | Hidden — inherits new global layout (Header/Footer) |
| Graham Screener | `/graham-screener` | No | Hidden — inherits new global layout (Header/Footer) |
| P/E Analyzer | `/pe-analyzer` | No | Hidden — inherits new global layout (Header/Footer) |
| Stralane | Removed | — | Becomes a project card on `/projects` |

All seven routes share the same global layout (`layout.tsx`) with the new Header and Footer components. Hidden tool pages inherit the new fonts, colors, Header, and Footer automatically but keep their existing content layouts.

### Responsive Breakpoints

All responsive behavior uses Tailwind's `md` breakpoint (768px):
- **Below 768px:** Mobile layout (single column, stacked elements, simplified timeline)
- **768px and above:** Desktop layout (multi-column, full timeline positioning)

---

## Design Language

### Typography

- **Headlines:** DM Serif Display — serif, editorial weight, used for the hero name, page titles, project titles, and section headings.
- **Body / UI:** IBM Plex Mono — monospace, used for all body text, labels, navigation, metadata, descriptions, and interactive elements.
- **No other fonts.** These two carry the entire site.

### Color

- **Background:** Near-black (#050505 for hero, #080808 for content sections, #0a0a0a for cards/elevated surfaces). Subtle depth shifts between sections, never flat.
- **Text hierarchy (5 levels):**
  - White (#ffffff) — headlines and strong emphasis
  - Light gray (#e0e0e0) — primary body text
  - Mid gray (#888888) — secondary body text, descriptions
  - Subtle gray (#666666) — tertiary text, personal interests, supporting copy
  - Dark gray (#444444) — metadata, muted labels, timestamps
- **Accent:** Ice blue (#5ba4cf) — used sparingly for: timeline nodes and line, interactive links, overline labels, hover states, the nav active indicator. No other accent colors.
- **Borders:** rgba(255,255,255,0.06) for structural lines, rgba(255,255,255,0.08) for slightly more visible dividers.

### Spacing & Layout

- Max-width container: 1200px, centered.
- Generous vertical padding between sections (80-120px).
- Monospace body text at 13px with 1.7 line-height for comfortable reading.
- Headline sizes: hero name ~32-40px, page titles ~36px, project titles ~20-22px, overline labels ~10px letterspaced.

### Motion

- **Scroll-triggered reveals:** Intersection Observer API exclusively. No CSS scroll-timeline (browser support is insufficient as of March 2026). No external animation libraries.
- **Hero morph:** Uses a scroll event listener with `requestAnimationFrame` to drive the initials fade, name reveal, and line draw based on scroll position. This is the only place a scroll listener is used.
- **Card reveals:** opacity + translateY via Intersection Observer, duration 0.6-0.8s, ease-out.
- **The hero morph is the one dramatic moment.** Everything else is subtle.
- No hover animations on cards besides a slight border brightness change.

---

## Landing Page (`/`)

### Viewport 1 — The Monolith (100vh)

- Background: #050505, full viewport height.
- Massive ghosted initials "CL" centered in viewport. DM Serif Display, ~40vw font size, color at ~3% white opacity (rgba(255,255,255,0.03)). These are purely decorative and atmospheric.
- **Scroll behavior (scroll position as % of first viewport height):**
  - 0-30%: "CL" initials fade from 3% opacity to 0%.
  - 15-45%: "Chris Lane" fades in from 0% to 100% opacity. DM Serif Display, ~36px, crisp white, letter-spacing 1px.
  - 35-55%: Tagline fades in: `Finance · Builder · Operator` in accent blue (#5ba4cf), 11px, letter-spacing 4px, uppercase, IBM Plex Mono.
- The overlapping ranges (15-45% and 0-30%) create a smooth crossfade where the initials are disappearing as the name begins to appear.

### Viewport 2 — The Line (scroll transition)

- **55-80% scroll:** A 1px vertical line in accent blue draws downward from below the tagline, growing in height as the user scrolls.
- **60-85% scroll:** A brief intro paragraph fades in beside the line in monospace, subtle gray (#666666):
  > "A finance student and operator who believes in learning by doing — building tools, leading teams, and turning ideas into products."
  (This is placeholder copy — the user may revise it.)
- The line continues drawing downward and becomes the timeline spine — seamless transition into the projects teaser.

### Viewport 3 — Projects Teaser

- The vertical line now has 2-3 glowing nodes — small circles in accent blue with box-shadow glow.
- Each node shows a year label and project title in monospace, fading in on scroll.
- This is a preview, not the full projects list. Shows the most recent/notable work.
- Below the teaser: a monospace link "View all projects →" in accent blue, navigating to `/projects`.

### Navigation (global)

- Fixed header across all pages.
- Left: "Chris Lane" in IBM Plex Mono, 12px, white, font-weight 500. Clicking navigates to `/`.
- Right: two page links in monospace — `Projects` and `About`. Plus a small envelope icon (Unicode ✉ or simple SVG) linking to `mailto:chrislane1738@gmail.com`. The icon is 14px, white, with accent blue hover state.
- Header starts fully transparent over the hero. On scroll (past 50px), gains background `rgba(5,5,5,0.92)` with a 1px bottom border in `rgba(255,255,255,0.06)`.
- No hamburger menu. On mobile (below `md`), the links and icon remain visible with reduced horizontal spacing. The nav is simple enough to never need a hamburger.
- Active page gets accent blue text color.

---

## Projects Page (`/projects`)

### Page Header

- Monospace overline: `PROJECTS` — 10px, letterspaced (3-4px), accent blue, uppercase.
- Serif headline: "What I've Built" — DM Serif Display, ~36px, white.
- Monospace subtitle: "Tools, platforms, and experiments — built to learn, built to ship." — 13px, subtle gray (#666666). (Placeholder copy — user may revise.)
- Generous spacing below (60-80px) before the timeline starts.

### Timeline Structure

- The vertical 1px accent blue line runs the full page length.
- **Desktop (md+):** Positioned ~15% from the left edge.
- **Mobile (below md):** Positioned ~5% from the left edge, cards take full remaining width.

### Section Dividers — Public / Private

- The timeline has two labeled sections, separated by a horizontal rule that crosses the line.
- Label format: `// PUBLIC` and `// PRIVATE` in monospace, 10px, letterspaced (2px), muted gray (#444).
- The divider is a horizontal 1px line in rgba(255,255,255,0.06) extending right from the timeline.
- Both sections use the same card format — no visual distinction besides the label and each card's individual public/private tag.

### Project Cards (nodes on the timeline)

Each project is a node on the vertical line:

- **Node dot:** Small circle (7px) on the timeline line, accent blue with a subtle glow (box-shadow: 0 0 8px rgba(91,164,207,0.4)). Activates (brighter glow, slight scale to 9px) when the card is in the viewport.
- **Year label:** Positioned on or near the timeline line. Monospace, 10px, muted gray (#444), letterspaced.
- **Card body:** Extends to the right of the timeline. Contains:
  - **Project title:** DM Serif Display, ~20-22px, white.
  - **Public/Private label:** Every card has either `public` or `private` label — monospace, 9px, accent blue, 1px border in rgba(91,164,207,0.2), small padding (2px 8px). Positioned inline after the title, vertically centered.
  - **Description:** Monospace, 12px, mid gray (#888), 2-3 lines. The user will provide specific descriptions for each project.
  - **Tech/metadata:** Monospace, 10px, very muted (#444). Year, tech stack, or other context.
  - **Link (optional):** If the project has an internal route or external URL, a subtle "View →" link in accent blue, 11px monospace.
- **Alternating offset:** Even-indexed cards get 0px left margin (from the timeline). Odd-indexed cards get 24px additional left margin. All cards remain right of the timeline.
- Cards have minimal styling — no visible card border or background by default. The timeline and spacing create the structure.

### Scroll Behavior

- Cards fade in (opacity 0→1, translateY 20px→0) as their node enters the viewport via Intersection Observer.
- Staggered: one card at a time, top to bottom.
- Node dots activate (brighter) when their card is visible.
- Smooth, restrained — no dramatic fly-ins.

### Project Data Strategy

Projects are defined as a typed array in a data file (`src/data/projects.ts`) with the following shape:

```typescript
interface Project {
  title: string;
  description: string;
  year: string;
  visibility: 'public' | 'private';
  tech?: string[];
  link?: { url: string; label: string; external: boolean };
}
```

The implementer should populate this array with the 7 known projects using brief placeholder descriptions. The user will provide final order, descriptions, and classifications in a follow-up session. The array order determines the timeline display order within each public/private section.

Known projects:

- Compound Interest Calculator (public, link: `/calculator`)
- Graham Intrinsic Value Screener (public, link: `/graham-screener`)
- P/E Comparative Analysis (public, link: `/pe-analyzer`)
- Portfolio Builder Dashboard (public, external link to Streamlit)
- VFC Research Dashboard (public, external link to Streamlit)
- Delta Fightwear (public, external link)
- Stralane (private/in-development, external link to stralane.com)

---

## About Page (`/about`)

### Layout

- Two-column on desktop (md+): left ~40% photo, right ~60% text.
- On mobile (below md): photo stacks on top (full width, max-height 400px), text below.
- Max-width container (narrower than projects — ~900px) to keep the reading experience intimate.

### Photo

- Existing headshot image (`about-headshot.jpg`).
- Sharp rectangle — no rounded corners, no circle crop.
- Very subtle 1px border in accent blue at low opacity (rgba(91,164,207,0.15)).
- Object-fit: cover, maintaining aspect ratio.
- **Desktop:** max-height 500px, width fills the 40% column.
- **Mobile:** full width, max-height 400px.

### Text Content

- **Overline:** `ABOUT` — monospace, 10px, letterspaced, accent blue. Matches the projects page header pattern.
- **Headline:** "Chris Lane" — DM Serif Display, ~36px, white.
- **Subtitle:** "Finance student. Builder. Operator." — monospace, 13px, subtle gray (#666666).

### Body Sections

Three short sections, each with a small serif subheading (DM Serif Display, ~18px, white):

1. **Finance** — Fundamental analysis, equity portfolios, AI-assisted tools.
2. **Building** — Stralane, the tools on this site, learning by doing.
3. **Leadership** — DVC Foundation, Viking Fund Club, non-profit work.

Body text: monospace, 13px, mid gray (#888), line-height 1.7-1.8. No yellow highlights — section headings use white, key terms are white text against the gray body for emphasis.

### Personal Interests

- Small section at the bottom: "Outside of work" heading in DM Serif Display, ~18px, white.
- Brief mentions of jiu-jitsu, bouldering, poker.
- Same monospace, slightly smaller (12px), subtle gray (#666666). Present for personality, doesn't compete with professional content.

---

## Footer (global)

- Consistent across all pages (including hidden tool pages via the global layout).
- Single line, centered, monospace, 12px.
- Content: `chrislane1738@gmail.com · LinkedIn · GitHub`
  - Email links to `mailto:chrislane1738@gmail.com`
  - LinkedIn links to `https://www.linkedin.com/in/chris-lane-concord/`
  - GitHub link TBD — user to provide URL
- Links in accent blue, middot separators in muted gray (#444).
- Generous top padding (80-100px) separating it from page content.
- No background change — it floats at the bottom of the content.
- **Phone number is intentionally removed.** The current site shows (925)-542-2284 — this is dropped in the redesign. Contact is email-first.

---

## Technical Decisions

### Framework & Stack

- **Keep Next.js 14.2.5 with App Router** — no framework upgrade during this redesign.
- **Keep Tailwind CSS 3.3.x** — all styling via Tailwind utility classes. Extend the Tailwind config with the custom color palette and font definitions.
- **Fonts:** Load DM Serif Display and IBM Plex Mono via `next/font/google` for zero layout shift.
- **Remove Inter** — replaced entirely by the two new fonts.
- **No changes to `next.config.js`** — images currently use `<img>` tags, no new domain config needed.

### Scroll Animations

- **Intersection Observer API** for all scroll-triggered reveals (card fade-ins, node activations, teaser nodes). No external animation library.
- **Hero morph:** A single scroll event listener with `requestAnimationFrame` drives the initials fade, name reveal, tagline appear, and line draw. Thresholds defined in the Landing Page section above. This listener is only active on the landing page and cleans up on unmount.
- CSS transitions handle the actual property changes (opacity, transform). JS only toggles classes or sets CSS custom properties based on scroll position.

### Components to Create/Modify

| Component | Action | Purpose |
|-----------|--------|---------|
| `Header.tsx` | Rewrite | New minimal nav with scroll-aware background |
| `Hero.tsx` | Rewrite | Monolith hero morph with scroll-driven animation |
| `TimelineTeaser.tsx` | New | Landing page projects preview (2-3 nodes) |
| `ProjectTimeline.tsx` | New | Full projects page timeline with nodes and cards |
| `ProjectNode.tsx` | New | Individual project card on the timeline |
| `SectionDivider.tsx` | New | `// PUBLIC` / `// PRIVATE` timeline divider |
| `AboutLayout.tsx` | New | Two-column about page layout |
| `Footer.tsx` | New | Global footer with contact links |
| `ProjectsGrid.tsx` | Delete | Replaced by ProjectTimeline |
| `ProjectCard.tsx` | Delete | Replaced by ProjectNode |
| `FeaturedProject.tsx` | Delete | Dead code — not imported anywhere, safe to remove |
| `Contact.tsx` | Delete | Replaced by Footer |
| `About.tsx` (component) | Delete | Replaced by AboutLayout |

### New Files

| File | Purpose |
|------|---------|
| `src/data/projects.ts` | Typed project array — single source of truth for timeline content |

### Pages to Modify

| Page | Action |
|------|--------|
| `src/app/page.tsx` | Rewrite — hero morph + timeline teaser |
| `src/app/projects/page.tsx` | Rewrite — full timeline progression |
| `src/app/about/page.tsx` | Rewrite — two-column layout |
| `src/app/stralane/page.tsx` | Delete — Stralane becomes a project card |
| `src/app/layout.tsx` | Modify — new fonts, updated Header/Footer |
| `src/app/globals.css` | Rewrite — new color system, animation keyframes |

### Files Untouched

- All API routes (`/api/*`) — no changes needed.
- All lib files (`/lib/*`) — calculation logic stays the same.
- Tool page components (InterestCalculator, ScreenerInterface, etc.) — these will get a styling pass later if desired, but are not part of this redesign scope.
- Tool pages (`/calculator`, `/graham-screener`, `/pe-analyzer`) — remain at their routes, inherit new global layout (Header, Footer, fonts, colors) automatically.
- `next.config.js` — no changes needed.

### Tailwind Config Extensions

```typescript
colors: {
  bg: { deep: '#050505', base: '#080808', elevated: '#0a0a0a' },
  accent: { DEFAULT: '#5ba4cf', glow: 'rgba(91,164,207,0.4)', dim: 'rgba(91,164,207,0.15)' },
  text: {
    primary: '#ffffff',
    secondary: '#e0e0e0',
    body: '#888888',
    subtle: '#666666',
    muted: '#444444'
  }
}
fontFamily: {
  serif: ['DM Serif Display', 'serif'],
  mono: ['IBM Plex Mono', 'monospace']
}
```

---

## Out of Scope

- Tool page redesign (calculator, screener, analyzer) — they inherit new fonts/colors/layout but keep their existing content layouts.
- New project content — the user will provide project order, descriptions, and public/private classifications separately. Implementer uses placeholder descriptions.
- Mobile-specific animations — scroll animations gracefully degrade on mobile (simpler or disabled), but no mobile-specific animation design.
- SEO / metadata optimization — not part of this visual redesign.
- Dark/light mode toggle — the site is dark only.
- GitHub URL for footer — user to provide.

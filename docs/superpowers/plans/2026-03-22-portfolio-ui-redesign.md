# Portfolio UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio website with the "Monolith" aesthetic — dark technical design, DM Serif Display + IBM Plex Mono typography, scroll-driven hero morph, and timeline-based project progression.

**Architecture:** Three navigable pages (Landing, Projects, About) sharing a global layout with new Header and Footer. Tool pages remain at their routes and inherit the new layout. A centralized project data file drives both the landing page teaser and the full projects timeline. Scroll animations use Intersection Observer and a single requestAnimationFrame scroll listener for the hero.

**Tech Stack:** Next.js 14.2.5, React 18, TypeScript, Tailwind CSS 3.3.x, next/font/google (DM Serif Display, IBM Plex Mono)

**Spec:** `docs/superpowers/specs/2026-03-22-portfolio-ui-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `tailwind.config.ts` | Modify | Add custom colors, font families |
| `src/app/globals.css` | Rewrite | New base styles, animation keyframes, scroll utilities |
| `src/app/layout.tsx` | Modify | Swap fonts, replace Header/Contact with new Header/Footer |
| `src/data/projects.ts` | Create | Typed project data array — single source of truth |
| `src/components/Header.tsx` | Rewrite | Minimal fixed nav with scroll-aware background |
| `src/components/Footer.tsx` | Create | Global footer with contact links |
| `src/components/Hero.tsx` | Rewrite | Monolith hero morph with scroll-driven animation |
| `src/components/TimelineTeaser.tsx` | Create | Landing page 2-3 node project preview |
| `src/components/ProjectTimeline.tsx` | Create | Full projects page timeline container |
| `src/components/ProjectNode.tsx` | Create | Individual project card on timeline |
| `src/components/SectionDivider.tsx` | Create | `// PUBLIC` / `// PRIVATE` label on timeline |
| `src/components/AboutLayout.tsx` | Create | Two-column about page layout |
| `src/app/page.tsx` | Rewrite | Hero + TimelineTeaser composition |
| `src/app/projects/page.tsx` | Rewrite | ProjectTimeline composition |
| `src/app/about/page.tsx` | Rewrite | AboutLayout composition |
| `src/app/stralane/page.tsx` | Delete | Stralane becomes a project card |
| `src/components/ProjectsGrid.tsx` | Delete | Replaced by ProjectTimeline |
| `src/components/ProjectCard.tsx` | Delete | Replaced by ProjectNode |
| `src/components/FeaturedProject.tsx` | Delete | Dead code, never imported |
| `src/components/Contact.tsx` | Delete | Replaced by Footer |
| `src/components/About.tsx` | Delete | Replaced by AboutLayout |

---

## Task 1: Foundation — Tailwind Config + Global CSS + Fonts

**Files:**
- Modify: `tailwind.config.ts`
- Rewrite: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update Tailwind config with new design tokens**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#050505',
          base: '#080808',
          elevated: '#0a0a0a',
        },
        accent: {
          DEFAULT: '#5ba4cf',
          glow: 'rgba(91,164,207,0.4)',
          dim: 'rgba(91,164,207,0.15)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e0e0e0',
          body: '#888888',
          subtle: '#666666',
          muted: '#444444',
        },
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'serif'],
        mono: ['var(--font-ibm-plex)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Rewrite globals.css**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  height: 100%;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #080808;
  color: #e0e0e0;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Scroll-triggered reveal animation */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Timeline node activation */
.timeline-node {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
}

.timeline-node.active {
  transform: scale(1.28);
  box-shadow: 0 0 12px rgba(91, 164, 207, 0.6);
}
```

- [ ] **Step 3: Update layout.tsx — swap fonts only, do NOT add Header/Footer yet**

Replace the Inter import with DM Serif Display and IBM Plex Mono. Do NOT change the Header/Contact imports or add them to layout — the existing pages still import them individually. The layout migration to centralized Header/Footer happens in Task 4.

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Serif_Display, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex',
})

export const metadata: Metadata = {
  title: "Chris Lane's Portfolio",
  description: 'Personal portfolio website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${ibmPlexMono.variable}`}>
      <body className="font-mono bg-bg-base text-text-secondary">
        {children}
      </body>
    </html>
  )
}
```

**Note:** This temporarily breaks the Header/Contact on existing pages since they were imported in layout.tsx before. That's expected — existing pages will look rough until they're rewritten in Tasks 6, 8, and 9. The header and footer will be centralized in layout.tsx in Task 4.

- [ ] **Step 4: Verify the app builds and renders**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds. The site should render with the new fonts (IBM Plex Mono as default body, DM Serif Display available via `font-serif`). Colors and layout may look rough — that's fine, we're building incrementally.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx
git commit -m "feat: add design tokens, new fonts, and global styles for redesign"
```

---

## Task 2: Project Data File

**Files:**
- Create: `src/data/projects.ts`

- [ ] **Step 1: Create the project data file**

```typescript
// src/data/projects.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  year: string;
  visibility: 'public' | 'private';
  tech?: string[];
  link?: {
    url: string;
    label: string;
    external: boolean;
  };
}

export const projects: Project[] = [
  {
    id: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    description: 'Interactive tool for visualizing compound growth with configurable monthly contributions and compounding frequencies.',
    year: '2024',
    visibility: 'public',
    tech: ['Next.js', 'Chart.js', 'TypeScript'],
    link: { url: '/calculator', label: 'Try it', external: false },
  },
  {
    id: 'graham-screener',
    title: 'Graham Intrinsic Value Screener',
    description: 'Stock screening tool implementing Benjamin Graham\'s value investing methodology with real-time market data.',
    year: '2024',
    visibility: 'public',
    tech: ['Next.js', 'yahoo-finance2', 'TypeScript'],
    link: { url: '/graham-screener', label: 'Try it', external: false },
  },
  {
    id: 'pe-analyzer',
    title: 'P/E Comparative Analysis',
    description: 'Compare target stock P/E ratios against industry peers with trailing and forward metrics.',
    year: '2024',
    visibility: 'public',
    tech: ['Next.js', 'yahoo-finance2', 'Chart.js'],
    link: { url: '/pe-analyzer', label: 'Try it', external: false },
  },
  {
    id: 'portfolio-builder',
    title: 'Portfolio Builder Dashboard',
    description: 'Dashboard for constructing and analyzing investment portfolios with performance tracking.',
    year: '2024',
    visibility: 'public',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://personalanalytics-juf6xlhx6valr7qpabuupu.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'vfc-research-dashboard',
    title: 'VFC Research Dashboard',
    description: 'Research dashboard built for the Viking Fund Club to streamline equity analysis and team collaboration.',
    year: '2025',
    visibility: 'public',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://vikingfunddashboard.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'delta-fightwear',
    title: 'Delta Fightwear',
    description: 'E-commerce brand for combat sports apparel — from supply chain to storefront.',
    year: '2024',
    visibility: 'public',
    tech: ['E-commerce', 'Supply Chain'],
    link: { url: 'https://deltafightwear.com/', label: 'Visit', external: true },
  },
  {
    id: 'stralane',
    title: 'Stralane',
    description: 'Investing platform for retail investors — currently in a developing beta with rapid feature updates.',
    year: '2025',
    visibility: 'private',
    tech: ['In Development'],
    link: { url: 'https://stralane.com', label: 'Visit', external: true },
  },
];

export const publicProjects = projects.filter(p => p.visibility === 'public');
export const privateProjects = projects.filter(p => p.visibility === 'private');
```

- [ ] **Step 2: Create the `src/data/` directory and verify TypeScript compiles**

Run: `mkdir -p /Users/chrislane/Desktop/Claude_Code/portfolio-website/src/data` (if the directory doesn't exist yet — the Write tool may create it automatically).

Then verify: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npx tsc --noEmit`
Expected: No type errors across the whole project.

- [ ] **Step 3: Commit**

```bash
git add src/data/projects.ts
git commit -m "feat: add centralized project data file"
```

---

## Task 3: Header — Rewrite

**Files:**
- Rewrite: `src/components/Header.tsx`

- [ ] **Step 1: Rewrite the Header component**

```tsx
// src/components/Header.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(5,5,5,0.92)] border-b border-[rgba(255,255,255,0.06)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="font-mono text-[12px] font-medium text-white tracking-wide hover:text-accent transition-colors duration-300"
        >
          Chris Lane
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/projects"
            className={`font-mono text-[12px] tracking-wide transition-colors duration-300 ${
              pathname === '/projects' ? 'text-accent' : 'text-text-body hover:text-white'
            }`}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className={`font-mono text-[12px] tracking-wide transition-colors duration-300 ${
              pathname === '/about' ? 'text-accent' : 'text-text-body hover:text-white'
            }`}
          >
            About
          </Link>
          <a
            href="mailto:chrislane1738@gmail.com"
            className="text-white hover:text-accent transition-colors duration-300 text-[14px]"
            aria-label="Email"
          >
            ✉
          </a>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verify the app builds**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds. The new header renders with the transparent-to-dark scroll behavior.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: rewrite header with scroll-aware background and minimal nav"
```

---

## Task 4: Footer — Create + Wire into Layout

**Files:**
- Create: `src/components/Footer.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the Footer component**

```tsx
// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="pt-20 pb-10 text-center">
      <div className="font-mono text-[12px] text-text-muted">
        <a
          href="mailto:chrislane1738@gmail.com"
          className="text-accent hover:text-white transition-colors duration-300"
        >
          chrislane1738@gmail.com
        </a>
        <span className="mx-2">·</span>
        <a
          href="https://www.linkedin.com/in/chris-lane-concord/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-white transition-colors duration-300"
        >
          LinkedIn
        </a>
        <span className="mx-2">·</span>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-white transition-colors duration-300"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Update layout.tsx — add Header and Footer to global layout**

Now that both Header and Footer are ready, centralize them in layout.tsx. This means all pages (including hidden tool pages) will get the new Header and Footer.

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Serif_Display, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex',
})

export const metadata: Metadata = {
  title: "Chris Lane's Portfolio",
  description: 'Personal portfolio website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${ibmPlexMono.variable}`}>
      <body className="font-mono bg-bg-base text-text-secondary">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

**Important:** The existing page files (`page.tsx`, `projects/page.tsx`, `about/page.tsx`) may still import old Header/Contact components individually. Those pages will be rewritten in Tasks 6, 8, and 9, which will remove those imports. Until then, check that the existing pages don't double-render the header — if they import Header directly, remove those imports from the page files now.

- [ ] **Step 3: Verify the app builds**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds. Footer renders at the bottom of every page.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx src/app/layout.tsx
git commit -m "feat: add global footer and wire into layout, replacing Contact"
```

---

## Task 5: Hero — Monolith Scroll-Driven Animation

**Files:**
- Rewrite: `src/components/Hero.tsx`

- [ ] **Step 1: Rewrite the Hero component with scroll-driven morph**

```tsx
// src/components/Hero.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (sectionRef.current) {
            const vh = sectionRef.current.offsetHeight
            const progress = Math.min(window.scrollY / vh, 1)
            setScrollProgress(progress)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll thresholds from spec
  const initialsOpacity = Math.max(0, 0.03 - (scrollProgress / 0.3) * 0.03)
  const nameOpacity = scrollProgress < 0.15 ? 0 : Math.min((scrollProgress - 0.15) / 0.3, 1)
  const taglineOpacity = scrollProgress < 0.35 ? 0 : Math.min((scrollProgress - 0.35) / 0.2, 1)
  const lineHeight = scrollProgress < 0.55 ? 0 : Math.min((scrollProgress - 0.55) / 0.25, 1) * 120
  const introOpacity = scrollProgress < 0.6 ? 0 : Math.min((scrollProgress - 0.6) / 0.25, 1)

  return (
    <section ref={sectionRef} className="relative min-h-[200vh] bg-bg-deep">
      {/* Sticky container for the viewport */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ghosted initials */}
        <span
          className="absolute font-serif select-none pointer-events-none"
          style={{
            fontSize: 'clamp(200px, 40vw, 500px)',
            color: `rgba(255, 255, 255, ${initialsOpacity})`,
            letterSpacing: '-5px',
            lineHeight: 1,
          }}
        >
          CL
        </span>

        {/* Name */}
        <h1
          className="font-serif text-[32px] md:text-[40px] text-white tracking-[1px] z-10"
          style={{ opacity: nameOpacity }}
        >
          Chris Lane
        </h1>

        {/* Tagline */}
        <p
          className="font-mono text-[11px] text-accent tracking-[4px] uppercase mt-3 z-10"
          style={{ opacity: taglineOpacity }}
        >
          Finance · Builder · Operator
        </p>

        {/* Vertical line */}
        <div
          className="mt-5 w-[1px] bg-accent z-10"
          style={{
            height: `${lineHeight}px`,
            opacity: lineHeight > 0 ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Intro paragraph */}
        <p
          className="font-mono text-[13px] text-text-subtle max-w-md text-center mt-6 leading-[1.7] z-10 px-4"
          style={{ opacity: introOpacity }}
        >
          A finance student and operator who believes in learning by doing —
          building tools, leading teams, and turning ideas into products.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify the app builds**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat: rewrite hero with monolith scroll-driven morph animation"
```

---

## Task 6: Timeline Teaser (Landing Page) + Landing Page Composition

**Files:**
- Create: `src/components/TimelineTeaser.tsx`
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: Create the TimelineTeaser component**

```tsx
// src/components/TimelineTeaser.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { projects } from '@/data/projects'

export default function TimelineTeaser() {
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.3 }
    )

    nodeRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Show 3 most recent projects
  const teaserProjects = projects.slice(-3).reverse()

  return (
    <section className="relative bg-bg-deep pb-24 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Timeline line */}
        <div className="relative ml-[15%] md:ml-[15%] pl-8">
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent" />

          {teaserProjects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => { nodeRefs.current[i] = el }}
              className="reveal relative mb-12 last:mb-0"
            >
              {/* Node dot */}
              <div className="absolute left-[-8px] top-[6px] w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_8px_rgba(91,164,207,0.4)] timeline-node" style={{ left: '-11.5px' }} />

              {/* Content */}
              <span className="font-mono text-[10px] text-text-muted tracking-[2px]">
                {project.year}
              </span>
              <h3 className="font-serif text-[18px] text-white mt-1">
                {project.title}
              </h3>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-16 text-center">
          <Link
            href="/projects"
            className="font-mono text-[12px] text-accent hover:text-white tracking-[1px] transition-colors duration-300"
          >
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Rewrite the landing page**

```tsx
// src/app/page.tsx
import Hero from '@/components/Hero'
import TimelineTeaser from '@/components/TimelineTeaser'

export default function Home() {
  return (
    <>
      <Hero />
      <TimelineTeaser />
    </>
  )
}
```

- [ ] **Step 3: Verify the app builds**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds. Landing page shows the hero morph and timeline teaser.

- [ ] **Step 4: Commit**

```bash
git add src/components/TimelineTeaser.tsx src/app/page.tsx
git commit -m "feat: add timeline teaser and rewrite landing page"
```

---

## Task 7: Project Timeline Components

**Files:**
- Create: `src/components/SectionDivider.tsx`
- Create: `src/components/ProjectNode.tsx`
- Create: `src/components/ProjectTimeline.tsx`

- [ ] **Step 1: Create the SectionDivider component**

```tsx
// src/components/SectionDivider.tsx
export default function SectionDivider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center my-12">
      <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.06)]" />
      <span className="font-mono text-[10px] text-text-muted tracking-[2px] px-4">
        {label}
      </span>
      <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.06)]" />
    </div>
  )
}
```

- [ ] **Step 2: Create the ProjectNode component**

```tsx
// src/components/ProjectNode.tsx
import Link from 'next/link'
import type { Project } from '@/data/projects'

export default function ProjectNode({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const offset = index % 2 === 1 ? 'ml-6' : 'ml-0'

  return (
    <div className={`reveal relative mb-16 last:mb-0 ${offset}`}>
      {/* Node dot */}
      <div
        className="absolute w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_8px_rgba(91,164,207,0.4)] timeline-node"
        style={{ left: '-11.5px', top: '8px' }}
      />

      {/* Year label */}
      <span className="font-mono text-[10px] text-text-muted tracking-[2px]">
        {project.year}
      </span>

      {/* Title + visibility label */}
      <div className="flex items-center gap-3 mt-1">
        <h3 className="font-serif text-[20px] md:text-[22px] text-white">
          {project.title}
        </h3>
        <span className="font-mono text-[9px] text-accent border border-[rgba(91,164,207,0.2)] px-2 py-[2px] tracking-[1px] whitespace-nowrap">
          {project.visibility}
        </span>
      </div>

      {/* Description */}
      <p className="font-mono text-[12px] text-text-body leading-[1.7] mt-2 max-w-lg">
        {project.description}
      </p>

      {/* Tech tags */}
      {project.tech && (
        <p className="font-mono text-[10px] text-text-muted mt-2">
          {project.tech.join(' · ')}
        </p>
      )}

      {/* Link */}
      {project.link && (
        project.link.external ? (
          <a
            href={project.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-[11px] text-accent hover:text-white transition-colors duration-300 mt-3"
          >
            {project.link.label} →
          </a>
        ) : (
          <Link
            href={project.link.url}
            className="inline-block font-mono text-[11px] text-accent hover:text-white transition-colors duration-300 mt-3"
          >
            {project.link.label} →
          </Link>
        )
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create the ProjectTimeline component**

```tsx
// src/components/ProjectTimeline.tsx
'use client'

import { useEffect, useRef } from 'react'
import { publicProjects, privateProjects } from '@/data/projects'
import ProjectNode from './ProjectNode'
import SectionDivider from './SectionDivider'

export default function ProjectTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Activate the timeline node dot
            const node = entry.target.querySelector('.timeline-node')
            if (node) node.classList.add('active')
          }
        })
      },
      { threshold: 0.2 }
    )

    const reveals = containerRef.current.querySelectorAll('.reveal')
    reveals.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  let globalIndex = 0

  return (
    <div ref={containerRef}>
      {/* Timeline line container */}
      <div className="relative ml-[5%] md:ml-[15%] pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent opacity-30" />

        {/* Public section */}
        <SectionDivider label="// PUBLIC" />
        {publicProjects.map((project) => {
          const idx = globalIndex++
          return <ProjectNode key={project.id} project={project} index={idx} />
        })}

        {/* Private section */}
        <SectionDivider label="// PRIVATE" />
        {privateProjects.map((project) => {
          const idx = globalIndex++
          return <ProjectNode key={project.id} project={project} index={idx} />
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify the app builds**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/SectionDivider.tsx src/components/ProjectNode.tsx src/components/ProjectTimeline.tsx
git commit -m "feat: add project timeline components (node, divider, timeline)"
```

---

## Task 8: Projects Page — Rewrite

**Files:**
- Rewrite: `src/app/projects/page.tsx`

- [ ] **Step 1: Rewrite the projects page**

```tsx
// src/app/projects/page.tsx
import ProjectTimeline from '@/components/ProjectTimeline'

export default function ProjectsPage() {
  return (
    <section className="bg-bg-base pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        {/* Page header */}
        <div className="mb-16 md:mb-20">
          <span className="font-mono text-[10px] text-accent tracking-[3px] uppercase">
            PROJECTS
          </span>
          <h1 className="font-serif text-[36px] text-white mt-2">
            What I&apos;ve Built
          </h1>
          <p className="font-mono text-[13px] text-text-subtle mt-3 max-w-lg leading-[1.7]">
            Tools, platforms, and experiments — built to learn, built to ship.
          </p>
        </div>

        {/* Timeline */}
        <ProjectTimeline />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify the app builds**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds. The projects page shows the full timeline with public and private sections.

- [ ] **Step 3: Commit**

```bash
git add src/app/projects/page.tsx
git commit -m "feat: rewrite projects page with timeline progression"
```

---

## Task 9: About Page — Rewrite

**Files:**
- Create: `src/components/AboutLayout.tsx`
- Rewrite: `src/app/about/page.tsx`

- [ ] **Step 1: Create the AboutLayout component**

```tsx
// src/components/AboutLayout.tsx
'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function AboutLayout() {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.2 }
    )

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex flex-col md:flex-row gap-12 md:gap-16">
        {/* Photo — left column */}
        <div className="md:w-[40%] shrink-0">
          <div className="relative border border-accent-dim overflow-hidden">
            <Image
              src="/about-headshot.jpg"
              alt="Chris Lane"
              width={400}
              height={500}
              className="w-full h-auto max-h-[400px] md:max-h-[500px] object-cover"
              priority
            />
          </div>
        </div>

        {/* Text — right column */}
        <div className="md:w-[60%]">
          <span className="font-mono text-[10px] text-accent tracking-[3px] uppercase">
            ABOUT
          </span>
          <h1 className="font-serif text-[36px] text-white mt-2">
            Chris Lane
          </h1>
          <p className="font-mono text-[13px] text-text-subtle mt-2">
            Finance student. Builder. Operator.
          </p>

          {/* Finance */}
          <div
            ref={(el) => { revealRefs.current[0] = el }}
            className="reveal mt-10"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Finance</h2>
            <p className="font-mono text-[13px] text-text-body leading-[1.8]">
              Obsessed with fundamental analysis and leveraging AI for deeper market
              insights. I&apos;ve managed a personal long-term portfolio since age 18,
              building tools along the way to sharpen my process — from Graham-style
              screeners to P/E comparison engines.
            </p>
          </div>

          {/* Building */}
          <div
            ref={(el) => { revealRefs.current[1] = el }}
            className="reveal mt-8"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Building</h2>
            <p className="font-mono text-[13px] text-text-body leading-[1.8]">
              Currently building Stralane, an investing platform for retail investors
              in a developing beta. Every tool on this site started as a problem I
              wanted to solve — the best way to learn is to ship something real.
            </p>
          </div>

          {/* Leadership */}
          <div
            ref={(el) => { revealRefs.current[2] = el }}
            className="reveal mt-8"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Leadership</h2>
            <p className="font-mono text-[13px] text-text-body leading-[1.8]">
              From the DVC Foundation to founding the Viking Fund Club, I&apos;m
              passionate about building platforms that help others succeed —
              spearheading digital transformation for non-profits and creating
              sustainable value through community.
            </p>
          </div>

          {/* Personal interests */}
          <div
            ref={(el) => { revealRefs.current[3] = el }}
            className="reveal mt-10"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Outside of Work</h2>
            <p className="font-mono text-[12px] text-text-subtle leading-[1.8]">
              On the mats practicing jiu-jitsu, bouldering, or playing a (likely
              losing) hand of poker. Always happy to talk markets, tech, and strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite the about page**

```tsx
// src/app/about/page.tsx
import AboutLayout from '@/components/AboutLayout'

export default function AboutPage() {
  return (
    <section className="bg-bg-base pt-32 pb-24 px-4 min-h-screen">
      <AboutLayout />
    </section>
  )
}
```

- [ ] **Step 3: Verify the app builds**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds. About page shows two-column layout with headshot and bio sections.

- [ ] **Step 4: Commit**

```bash
git add src/components/AboutLayout.tsx src/app/about/page.tsx
git commit -m "feat: rewrite about page with two-column layout"
```

---

## Task 10: Cleanup — Delete Old Components and Pages

**Files:**
- Delete: `src/components/ProjectsGrid.tsx`
- Delete: `src/components/ProjectCard.tsx`
- Delete: `src/components/FeaturedProject.tsx`
- Delete: `src/components/Contact.tsx`
- Delete: `src/components/About.tsx`
- Delete: `src/app/stralane/page.tsx` (and the `stralane/` directory)

- [ ] **Step 1: Delete the old components and stralane page**

```bash
rm src/components/ProjectsGrid.tsx
rm src/components/ProjectCard.tsx
rm src/components/FeaturedProject.tsx
rm src/components/Contact.tsx
rm src/components/About.tsx
rm -r src/app/stralane/
```

- [ ] **Step 2: Verify no remaining imports of deleted files**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && grep -r "ProjectsGrid\|ProjectCard\|FeaturedProject\|Contact\|About\|stralane" src/app/ src/components/ --include="*.tsx" --include="*.ts" -l`

Expected: No matches (or only `src/data/projects.ts` referencing stralane as a project ID, which is fine).

If any files still import deleted components, fix those imports.

- [ ] **Step 3: Verify the app builds cleanly**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Build succeeds with no errors about missing modules.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old components and stralane page, replaced by redesign"
```

---

## Task 11: Final Verification + Polish

**Files:**
- Possibly modify: any file needing adjustments

- [ ] **Step 1: Full build verification**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run build`
Expected: Clean build, no warnings about unused imports or missing references.

- [ ] **Step 2: Run linter**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run lint`
Expected: No errors. Fix any lint issues found.

- [ ] **Step 3: Visual verification with dev server**

Run: `cd /Users/chrislane/Desktop/Claude_Code/portfolio-website && npm run dev`

Manually verify in browser at `http://localhost:3000`:
- [ ] Landing page: hero morph animation works on scroll (CL fades → name appears → tagline → line → intro)
- [ ] Landing page: timeline teaser shows 3 projects with glowing nodes
- [ ] Navigation: header starts transparent, darkens on scroll, active page highlighted
- [ ] Projects page: timeline with public/private sections, each card has visibility label
- [ ] Projects page: cards fade in on scroll
- [ ] About page: two-column layout with headshot and bio sections
- [ ] Footer: renders on all pages with email, LinkedIn, GitHub links
- [ ] Tool pages (`/calculator`, `/graham-screener`, `/pe-analyzer`): still work, now have new header/footer
- [ ] Mobile: all pages render cleanly at narrow widths

- [ ] **Step 4: Fix any issues found during visual verification**

Address layout problems, missing styles, or broken interactions.

- [ ] **Step 5: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix: polish and visual fixes from final verification"
```

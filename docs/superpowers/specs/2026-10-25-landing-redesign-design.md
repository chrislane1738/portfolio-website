# Landing Redesign — Design

**Date:** 2026-10-25
**Branch:** `redesign/landing` (off `main`; Muse's `redesign/landing-overhaul` not used)

## Goal

Replace the market-simulation hero with a minimal, sleek single-screen landing page. Remove copy that reads as AI-generated. Establish a new dark, refined palette and type system site-wide.

## Landing page (`/`)

Single full-viewport screen. Nothing below it except the footer.

- **Desktop:** two columns, vertically centered.
  - Left: `Christopher Lane` — Inter Tight 700, ~88px, tight tracking, `#F2F2F2`.
    Two subtext lines below, Inter 400, ~18px, `#8A92A6`:
    - `Diablo Valley College → Santa Clara University`
    - `Private Equity at TEEDUP`
  - Right: background-removed headshot (`public/headshot.png`) sitting directly on the page, no frame. Bottom fades out via CSS mask gradient. Faint slate-lavender radial glow (~10% opacity) behind the head.
- **Mobile:** photo on top (~60vw), name and subtext stacked below, left-aligned.
- **Motion:** single fade-in on load. Respects `prefers-reduced-motion`.

## Palette & type (site-wide)

| Token | Value |
|---|---|
| bg deep / base | `#0B0E13` / `#0F1218` |
| bg elevated | `#161A22` |
| text primary | `#F2F2F2` |
| text secondary/body | `#8A92A6` |
| accent | `#A3ACD9` (hover/active only) |
| hairline | `rgba(255,255,255,0.06)` |

- Fonts: Inter Tight (display), Inter (body). DM Serif Display and IBM Plex Mono removed.
- Existing token names (`bg-*`, `accent`, `text-*`, `font-serif`, `font-mono`) are remapped to the new values so other pages inherit the theme without layout changes. Those pages get their own redesign passes later.

## Header

Fixed, thin hairline bottom border. Left: `Christopher Lane` (small, bold). Right: `Projects`, `About`, `Contact` (mailto) as plain text links; accent on active/hover. Tagline removed. Mobile keeps hamburger overlay.

## Footer

One quiet grey line: email · LinkedIn · GitHub (`github.com/chrislane1738`). Phone number removed.

## Out of scope

- `/projects`, `/about`, tool pages (redesigned separately).
- `MarketHero` and `marketSim` stay in the repo, just no longer rendered on `/`.

## Verification

`vitest`, `tsc --noEmit`, `next build` pass. Playwright screenshots at desktop (1440×900) and mobile (390×844) reviewed before commit.

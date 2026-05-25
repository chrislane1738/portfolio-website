# Market Hero — Design Spec

**Date:** 2026-05-25
**Status:** Approved, awaiting implementation plan
**Scope:** Replace `Hero.tsx` with a new `MarketHero` component. Keep `TimelineTeaser` and all other components untouched.

---

## 1. Goal

Replace the current cinematic ghost-"CL" scroll hero with a signature, finance-coded hero that feels alive without requiring user interaction. The hero is a single-viewport "live market" simulation: a self-playing candlestick chart behind the title, with a reactive order book on the sides, all anchored by the existing name + tagline + intro hierarchy.

The win condition: the page feels rooted in Chris Lane's identity (finance + builder) and is the kind of thing a visitor screenshots.

## 2. User-facing behavior

### 2.1 Layout (single viewport, 100vh)

Three zones:

- **Top strip:** ticker-symbol header reading `CL  $<price>  <Δ%>  ·  Spread <s>  ·  Mid <m>  ·  Vol <v>  ·  <HH:MM ET>` with a small flashing "LIVE" pip on the right.
- **Side ladders (~22% width each):** bids on the left (accent blue), asks on the right (muted brick red). Each shows ~7 levels with depth bars + price + size.
- **Center column (~56% width):** the existing hero hierarchy — name `Chris Lane` (DM Serif Display), tagline `Finance · Builder · Operator` (accent blue, monospace, tracked), vertical accent line, intro paragraph (`A finance student and operator who believes in learning by doing. Building tools, leading teams, and turning ideas into products.`). The candle chart lives **behind** this column at low opacity.
- **Bottom strip:** small status row reading `LAST $<price>  ·  Spread <s>  ·  scroll ↓  ·  SESSION ALIVE`.

### 2.2 Live edge anchoring

The currently-forming candle is anchored under the name. Past candles trail off to the left and fade as they recede. The right ~30% of the chart area sits under the name's bounding box; new candles always appear there. When a candle closes, the entire history shifts one slot left to make room.

### 2.3 Self-playing market behavior

- 5-second candles, 5 intra-candle ticks (one tick per 1000ms).
- Each tick may move the close, extend the high, or extend the low.
- ~40% of the visible chart (~24 of ~60 candles) is pre-generated on load so the page already looks like an active session.
- Volatility is theatrical: calm regimes and volatile bursts alternate, with a bias toward volatile.
- Order book reacts to the chart: when a tick pierces a depth level, that bar visibly "absorbs" (shrinks + flashes + refills).
- No cursor interaction with the simulation. Cursor doesn't drive anything.

## 3. The market simulator (`src/lib/marketSim.ts`)

A pure TypeScript module — no DOM, no React. Returns a simulator instance that can be driven by an external animation loop.

### 3.1 Public API

```ts
type Candle = { o: number; h: number; l: number; c: number; closed: boolean }

type BookLevel = { price: number; size: number; widthPct: number; touched: boolean; flashUntil: number }

type Regime = 'calm' | 'volatile'

type SimState = {
  candles: Candle[]            // rolling window, oldest first
  price: number                // current last-tick price
  bestBid: number
  bestAsk: number
  spread: number
  bids: BookLevel[]            // 7 levels, best first
  asks: BookLevel[]            // 7 levels, best first
  regime: Regime
  tickIndex: 0 | 1 | 2 | 3 | 4
  volume: number               // cumulative session volume
}

interface Simulator {
  tick(now: number): SimState  // advance one tick if 1000ms have elapsed; otherwise return unchanged state
  getState(): SimState         // current snapshot without advancing
  pregenerate(candleCount: number): void  // run forward N candles synchronously to fill history on init
}

function createSimulator(opts: {
  initialPrice?: number        // default 412.50
  tickStep?: number            // base step as a fraction of midPrice; default 0.0015 (≈0.15%)
  candleCount?: number         // visible buffer size; default 60
  bookLevels?: number          // levels per side; default 7
  bookIncrement?: number       // default 0.05
  seed?: number                // optional, for deterministic test runs
}): Simulator
```

### 3.2 Tick logic

On each call to `tick(now)`:

1. If `now - lastTickTime < 1000`, return current state unchanged.
2. Compute `delta = noise() * tickStep * regimeMultiplier + meanReversion()`.
   - `noise()`: zero-mean Gaussian-ish (sum of 3 uniforms, scaled).
   - `regimeMultiplier`: `calm` = 1.0, `volatile` = 3.5–5.0 (random per tick).
3. `nextPrice = currentPrice + delta`.
4. Apply soft edge containment (see 3.3).
5. Update current candle:
   - `tickIndex === 0` (first tick of a new candle): `open = priorClose`, `high = low = close = nextPrice`.
   - Otherwise: `high = max(high, nextPrice)`, `low = min(low, nextPrice)`, `close = nextPrice`.
6. Update spread + recenter `bestBid` / `bestAsk` around the new price.
7. Detect absorptions: a level at `levelPrice` is "pierced" by this tick if `min(prevPrice, nextPrice) ≤ levelPrice ≤ max(prevPrice, nextPrice)`. For each pierced level: set `flashUntil = now + 600` and at `flashUntil` replace its size with a new random value in [5000, 25000] and recompute the side's depth-bar widths.
8. Increment `tickIndex`. If `tickIndex === 4` after the update (i.e., 5th tick fired), close the candle: push to history, drop oldest if buffer is full, start the next candle with `tickIndex = 0` on the following tick.
9. Possibly transition volatility regime (see 3.4).

### 3.3 Soft edge containment (mean reversion)

```
midPrice: drifts as a slow EMA of recent closes (α = 0.02), so it shifts gently with the long-term trend
halfRange: the vertical price band the chart renders (~ ±2% of midPrice)
distFromMid = (currentPrice - midPrice) / halfRange   // -1 to +1

if |distFromMid| < 0.6:
  pull = 0
else:
  pull = -distFromMid * pullStrength * ((|distFromMid| - 0.6) / 0.4)
  // pullStrength starts at tickStep * 4 (i.e., 4× the base step) — tuned so
  // that at |distFromMid| = 1.0 the pull is ~4× a typical noise tick, which
  // dominates within 1-2 ticks. Adjust during implementation.

if |currentPrice - initialPrice| > 0.97 * halfRange:
  clamp price to initialPrice ± 0.97 * halfRange   // hard wall as last resort
  // Anchored to initialPrice (not midPrice) so the wall doesn't drift with
  // midPrice. Under realistic noise this is equivalent; under pathological
  // constant-direction noise it provides a fixed safety bound.
```

The visible result: a chart that respects "support and resistance" naturally and never escapes the rendered band.

### 3.4 Volatility regimes (theatrical)

- Each regime lasts a random 4–10 candles (20–50 seconds).
- Transition matrix (rolled at regime end):
  - From `calm`: 35% chance next is `volatile`, 65% stays `calm`.
  - From `volatile`: 35% chance next is `calm`, 65% stays `volatile` (forced cool-down after 2 consecutive volatile cycles).
- During `volatile` regimes: spread widens to $0.10–$0.15, depth bars get an extra opacity jitter (handled in the renderer, not the simulator).

### 3.5 Order book

- 7 levels per side at `bookIncrement` apart.
- Initial sizes: random in [5000, 25000], depth-bar widths normalized to the max in the side.
- `bestBid = bestAsk - spread`; both recenter on every tick.
- "Touched" = the level immediately adjacent to the current price on either side.
- "Absorbed" = the chart's tick crossed through that level's price. Triggers the 600ms flash + refill.

### 3.6 Pregeneration

`pregenerate(24)` runs `tick()` 24 candles × 5 ticks = 120 synthetic ticks at zero time cost (timer is mocked during pregen). The resulting state is the page-load snapshot — the chart already shows a plausible session history.

## 4. Renderer (`src/components/MarketHero.tsx`)

### 4.1 Structure

- `'use client'`.
- Mounts on `app/page.tsx` in place of `<Hero />`.
- Wraps everything in `<section className="relative h-screen bg-bg-deep overflow-hidden">`.
- Children:
  - Top strip (`<div>` row, mono text)
  - Bids ladder (`<ul>` of `<li>` rows, left-aligned right edge)
  - Asks ladder (mirror, left-aligned left edge)
  - Center column (the existing name + tagline + line + intro markup, unchanged copy)
  - Chart canvas (`<canvas>`, absolutely positioned behind the center column)
  - Grid background (CSS-only, `linear-gradient`)
  - Bottom strip
- All zones use existing color/typography tokens (`accent`, `bg-deep`, `text-muted`, etc.).

### 4.2 Animation loop

```ts
useEffect(() => {
  const sim = createSimulator({ initialPrice: 412.50 })
  sim.pregenerate(24)
  setState(sim.getState())

  let rafId = 0
  const loop = (now: number) => {
    if (document.visibilityState !== 'visible' || !inView.current) {
      rafId = requestAnimationFrame(loop)
      return
    }
    const next = sim.tick(now)
    setState(next)
    drawCandles(canvasRef.current, next.candles)
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(rafId)
}, [])
```

- One `setState` per tick (1Hz) — React renders top strip, ladders, bottom strip at 1Hz.
- Canvas drawing happens every frame. The live candle's high, low, and close are interpolated between the prior tick's value and the current tick's value over the 1000ms tick window using `easeOut`, so the wick visibly *grows* into its new range rather than snapping. Closed candles render directly from their stored OHLC, no interpolation.
- An IntersectionObserver toggles `inView.current` so the loop idles when the hero scrolls offscreen.

### 4.3 Canvas drawing

- Single 2D canvas the width and height of the chart area, sized via `getBoundingClientRect()` and `devicePixelRatio` on mount and on resize.
- Each frame: clear, then draw all candles right-to-left, fading opacity for the leftmost ~6 candles.
- Candle widths: `(canvas.width / candleCount) - gap`.
- Wick: 1px vertical line through `high → low`. Body: rect from `min(o, c)` to `max(o, c)`.
- Colors: green = accent `#5ba4cf`; red = `#c97064`.
- Live candle (rightmost, not yet closed) has slightly higher opacity to draw the eye.

### 4.4 Order book DOM

- 14 `<li>` rows total. Each row has an absolutely-positioned depth bar inside.
- Bar width set via inline `style.width` from `state.bids[i].widthPct`.
- Transition: `width 600ms ease-out, opacity 200ms`. So absorptions animate via CSS, no JS.
- Touched rows get a class that bumps opacity to 0.65.
- Flashing rows get a class that bumps opacity to 0.85 for the 600ms flash window.

### 4.5 Top strip / bottom strip

- Top strip: re-renders on every tick. Format `formatPrice(state.price)`, `formatDelta(...)`, etc.
- LIVE pip: CSS `@keyframes pulse` on a 6px dot.
- Bottom strip: `LAST $X.XX · Spread X.XX · scroll ↓ · SESSION ALIVE`.

### 4.6 Center column (the hero text)

Markup mirrors the existing `Hero.tsx` center hierarchy. The big ghost-"CL" and the scroll-driven opacity transitions are removed. The text is statically visible on mount.

The chart canvas sits behind this column. A radial gradient overlay, positioned over the chart and centered on the center column, dims the chart where the text sits (preserving readability) and leaves the chart brighter at the edges of the chart area.

```css
.chart-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 40% 60% at 50% 50%,
    rgba(14,17,22,0.85) 0%,
    rgba(14,17,22,0.55) 40%,
    transparent 80%
  );
}
```

The ellipse is sized roughly to the bounding box of the center text block; tune the percentages during implementation against the actual rendered text.

## 5. Accessibility & motion

- `@media (prefers-reduced-motion: reduce)`: the loop runs `pregenerate(60)` to fill the buffer and then never calls `tick()`. The chart is a static snapshot, the order book is static, the LIVE pip does not pulse, the top strip shows a fixed price. Name + tagline + intro are unaffected.
- Hero text is real DOM text — screen readers see "Chris Lane", "Finance · Builder · Operator", and the intro paragraph. The chart, ladders, and strips are marked `aria-hidden="true"` since they're purely decorative.
- Color contrast: the name and intro both meet WCAG AA against `bg-deep` via the existing `text-white` / `text-text-subtle` tokens — verify post-implementation.

## 6. Performance

- Target: <2% CPU on a modern laptop at idle, <5% during volatile bursts.
- One rAF loop. One `setState` per 1Hz tick. One canvas redraw per frame (~60fps).
- No animation libraries.
- Pauses on tab blur (`document.visibilityState`) and on offscreen scroll (IntersectionObserver).
- Pregeneration is synchronous on mount (~120 simple math ops, <1ms).

## 7. Mobile (≤768px)

- Side ladders collapse to two single-row depth strips: one above the chart showing best 3 bids, one below showing best 3 asks.
- Chart candle count drops from 60 to ~25.
- Top and bottom strips stay (top strip may abbreviate volume).
- Same component file, responsive via Tailwind breakpoints. No separate mobile component.

## 8. File changes

**New:**
- `src/lib/marketSim.ts` — the simulator module.
- `src/components/MarketHero.tsx` — the renderer.

**Modified:**
- `src/app/page.tsx` — replace `<Hero />` with `<MarketHero />`.
- `src/app/globals.css` — add `@keyframes livePulse` for the LIVE pip and `@keyframes absorbFlash` for the depth-bar absorption flash.

**Deleted:**
- `src/components/Hero.tsx`.

**Untouched:**
- `TimelineTeaser.tsx`, `ProjectNode.tsx`, `ProjectTimeline.tsx`, `ProjectModal.tsx`, `FavoritesFilterButton.tsx`, `Header.tsx`, `Footer.tsx`, `AboutLayout.tsx`, `tailwind.config.ts`, and all routes other than `/`.

## 9. Out of scope

Explicit non-goals for this change:

- No real market data. No network calls. No API keys.
- No animation library (no Framer Motion, no GSAP).
- No changes to `TimelineTeaser`, the projects page, the about page, the calculator, the screeners, or any other route.
- No mobile-specific redesign beyond the responsive collapse described in §7.
- No cursor-driven interactivity in the hero (a separate change could add this later as a secondary layer).
- The about-page headshot alignment fix is a separate one-line tweak being handled in parallel; it is not part of this spec.

## 10. Acceptance criteria

The implementation is done when:

1. Visiting `/` loads the new hero. Within ~1 second, the chart is visibly ticking and the top strip price is updating.
2. The candle history is pre-populated on mount — the chart never starts empty.
3. New candles always form at the same X position behind the name; old candles fade to the left.
4. The price never visibly escapes the chart's vertical band over a 5-minute observation window.
5. At least one volatility burst is observed within any 60-second window with `regime` distribution behaving per §3.4.
6. When a tick price crosses a visible depth level, that level's bar animates absorption + refill within 600ms.
7. Scrolling past the hero pauses the simulation; scrolling back resumes it.
8. Switching browser tabs pauses the simulation.
9. `prefers-reduced-motion: reduce` results in a static, non-ticking chart and book.
10. CPU usage is <2% on a modern laptop with the hero in view and idle.
11. The existing `TimelineTeaser` section appears below the hero, unchanged.
12. No console warnings, no React hydration errors, no layout shift between SSR and hydrate.

---

**Next step:** invoke the `writing-plans` skill to produce an implementation plan.

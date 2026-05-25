# Market Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing cinematic ghost-"CL" `Hero` component with a `MarketHero` that renders a self-playing live market simulation (candle chart + order book) anchored behind the same name + tagline + intro copy.

**Architecture:** Two new modules. (1) `src/lib/marketSim.ts` — a pure, framework-free TypeScript simulator that produces tick-by-tick OHLC candles and an order book that reacts to the simulated price. Test-driven, deterministic when seeded. (2) `src/components/MarketHero.tsx` — a `'use client'` React component that mounts the simulator, drives it with one `requestAnimationFrame` loop, renders the chart to a `<canvas>`, and renders the order book + strips as DOM.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS. Vitest added for unit tests on the pure simulator. No animation libraries.

**Reference spec:** `docs/superpowers/specs/2026-05-25-market-hero-design.md`

---

## File Structure

**New files:**
- `src/lib/marketSim.ts` — pure simulator: types, PRNG, mean-reversion math, `createSimulator()`.
- `src/lib/marketSim.test.ts` — co-located vitest unit tests.
- `src/components/MarketHero.tsx` — `'use client'` renderer.
- `vitest.config.ts` — test runner config.

**Modified files:**
- `package.json` — add `vitest`, `@vitest/ui` as devDeps, add `test` and `test:watch` scripts.
- `src/app/page.tsx` — swap `<Hero />` for `<MarketHero />`.
- `src/app/globals.css` — add `@keyframes livePulse`, `@keyframes absorbFlash`, and the chart-overlay class.

**Deleted files:**
- `src/components/Hero.tsx` — replaced by MarketHero.

---

## Tasks

### Task 1: Add vitest test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest and its UI**

```bash
npm i -D vitest@^1 @vitest/ui@^1
```

Expected: dependencies installed, lockfile updated, no errors.

- [ ] **Step 2: Create the vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, add to the `"scripts"` object:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs (with no tests yet)**

Run: `npm test`
Expected: vitest starts and reports "No test files found, exiting with code 0" — exit code 0 is acceptable for now. If vitest errors on a missing file, that's fine; we'll write tests next. Verify the binary itself is wired up.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest test runner"
```

---

### Task 2: Define marketSim types and createSimulator skeleton

**Files:**
- Create: `src/lib/marketSim.ts`
- Create: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/marketSim.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createSimulator } from './marketSim'

describe('createSimulator', () => {
  it('returns initial state with default options', () => {
    const sim = createSimulator()
    const state = sim.getState()

    expect(state.price).toBeCloseTo(412.50)
    expect(state.candles).toHaveLength(1)
    expect(state.candles[0].closed).toBe(false)
    expect(state.candles[0].o).toBeCloseTo(412.50)
    expect(state.candles[0].h).toBeCloseTo(412.50)
    expect(state.candles[0].l).toBeCloseTo(412.50)
    expect(state.candles[0].c).toBeCloseTo(412.50)
    expect(state.tickIndex).toBe(0)
    expect(state.regime).toBe('calm')
    expect(state.bids).toHaveLength(7)
    expect(state.asks).toHaveLength(7)
    expect(state.bestBid).toBeLessThan(state.price)
    expect(state.bestAsk).toBeGreaterThan(state.price)
  })

  it('respects custom initial price', () => {
    const sim = createSimulator({ initialPrice: 100 })
    expect(sim.getState().price).toBeCloseTo(100)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: FAIL — module `./marketSim` not found.

- [ ] **Step 3: Implement the minimal simulator skeleton**

Create `src/lib/marketSim.ts`:

```ts
export type Candle = { o: number; h: number; l: number; c: number; closed: boolean }

export type BookLevel = {
  price: number
  size: number
  widthPct: number
  touched: boolean
  flashUntil: number
}

export type Regime = 'calm' | 'volatile'

export type SimState = {
  candles: Candle[]
  price: number
  bestBid: number
  bestAsk: number
  spread: number
  bids: BookLevel[]
  asks: BookLevel[]
  regime: Regime
  tickIndex: 0 | 1 | 2 | 3 | 4
  volume: number
}

export type SimulatorOptions = {
  initialPrice?: number
  tickStep?: number
  candleCount?: number
  bookLevels?: number
  bookIncrement?: number
  seed?: number
  noise?: () => number
}

export interface Simulator {
  tick(now: number): SimState
  getState(): SimState
  pregenerate(candleCount: number): void
}

const DEFAULT_OPTS = {
  initialPrice: 412.50,
  tickStep: 0.0015,
  candleCount: 60,
  bookLevels: 7,
  bookIncrement: 0.05,
  seed: 1,
}

function makeInitialBook(price: number, levels: number, increment: number) {
  const spread = increment
  const bestBid = price - spread / 2
  const bestAsk = price + spread / 2

  const mkLevel = (p: number): BookLevel => ({
    price: p,
    size: 12000,
    widthPct: 0.6,
    touched: false,
    flashUntil: 0,
  })

  const bids: BookLevel[] = []
  const asks: BookLevel[] = []
  for (let i = 0; i < levels; i++) {
    bids.push(mkLevel(bestBid - i * increment))
    asks.push(mkLevel(bestAsk + i * increment))
  }
  return { bids, asks, bestBid, bestAsk, spread }
}

export function createSimulator(options: SimulatorOptions = {}): Simulator {
  const opts = { ...DEFAULT_OPTS, ...options }
  const book = makeInitialBook(opts.initialPrice, opts.bookLevels, opts.bookIncrement)

  const state: SimState = {
    candles: [{
      o: opts.initialPrice,
      h: opts.initialPrice,
      l: opts.initialPrice,
      c: opts.initialPrice,
      closed: false,
    }],
    price: opts.initialPrice,
    bestBid: book.bestBid,
    bestAsk: book.bestAsk,
    spread: book.spread,
    bids: book.bids,
    asks: book.asks,
    regime: 'calm',
    tickIndex: 0,
    volume: 0,
  }

  return {
    getState: () => state,
    tick: () => state,           // implemented in later tasks
    pregenerate: () => {},        // implemented in later tasks
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: PASS, both test cases green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): scaffold marketSim with createSimulator skeleton"
```

---

### Task 3: Implement tick() that advances price after 1000ms

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('tick timing', () => {
  it('does not advance when less than 1000ms has elapsed', () => {
    const sim = createSimulator({ noise: () => 0.5 })
    const t0 = sim.tick(0).price
    const t1 = sim.tick(500).price
    expect(t1).toBeCloseTo(t0)
  })

  it('advances the price after 1000ms has elapsed', () => {
    const sim = createSimulator({ noise: () => 0.5 })
    sim.tick(0)
    const moved = sim.tick(1000).price
    expect(moved).not.toBeCloseTo(412.50)
    // positive noise => positive move
    expect(moved).toBeGreaterThan(412.50)
  })

  it('extends the current candle high/low/close on a tick', () => {
    const sim = createSimulator({ noise: () => 0.5 })
    sim.tick(0)
    sim.tick(1000)
    const candle = sim.getState().candles[0]
    expect(candle.c).toBeGreaterThan(candle.o)
    expect(candle.h).toBeCloseTo(candle.c)
  })
})
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: the new "tick timing" suite FAILS — `tick()` is a stub.

- [ ] **Step 3: Implement tick() advancement**

In `src/lib/marketSim.ts`, replace the closure body with a real implementation. Replace the `return { ... }` block at the bottom of `createSimulator` with this — and add `lastTickAt` to the closure state:

```ts
  let lastTickAt = -Infinity
  const noise = opts.noise ?? (() => Math.random() * 2 - 1)
  const TICK_MS = 1000

  function regimeMultiplier(): number {
    return state.regime === 'volatile' ? 4 : 1
  }

  function advance(now: number) {
    const baseStep = opts.initialPrice * opts.tickStep
    const delta = noise() * baseStep * regimeMultiplier()
    const nextPrice = state.price + delta

    state.price = nextPrice
    const c = state.candles[state.candles.length - 1]
    // The current candle is always pre-seeded with OHLC = open at the moment
    // it's created (the initial candle in createSimulator, subsequent candles
    // in the candle-close push in Task 4). So advance() just extends.
    c.h = Math.max(c.h, nextPrice)
    c.l = Math.min(c.l, nextPrice)
    c.c = nextPrice
    state.tickIndex = ((state.tickIndex + 1) % 5) as SimState['tickIndex']
    lastTickAt = now
  }

  return {
    getState: () => state,
    tick(now: number) {
      if (lastTickAt === -Infinity) {
        // First call seeds the clock without advancing
        lastTickAt = now
        return state
      }
      if (now - lastTickAt < TICK_MS) return state
      advance(now)
      return state
    },
    pregenerate: () => {},
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all tests PASS, including the new "tick timing" suite.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): tick advances price after 1000ms with noise injection"
```

---

### Task 4: Close a candle every 5 ticks

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('candle close after 5 ticks', () => {
  it('closes the current candle on the 5th tick and starts a new one', () => {
    const sim = createSimulator({ noise: () => 0.3 })
    sim.tick(0)
    for (let i = 1; i <= 5; i++) sim.tick(i * 1000)

    const candles = sim.getState().candles
    expect(candles).toHaveLength(2)
    expect(candles[0].closed).toBe(true)
    expect(candles[1].closed).toBe(false)
    expect(candles[1].o).toBeCloseTo(candles[0].c)
    expect(sim.getState().tickIndex).toBe(0)
  })

  it('respects candleCount as a rolling window', () => {
    const sim = createSimulator({ noise: () => 0.1, candleCount: 3 })
    sim.tick(0)
    // produce 5 complete candles (25 ticks)
    for (let i = 1; i <= 25; i++) sim.tick(i * 1000)
    expect(sim.getState().candles).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: "candle close after 5 ticks" FAILS — we never push a new candle.

- [ ] **Step 3: Implement candle close**

In `src/lib/marketSim.ts`, modify `advance(now)` so that when `tickIndex` rolls from 4 back to 0, we close the candle and start a new one. Replace the `advance` function with:

```ts
  function advance(now: number) {
    const baseStep = opts.initialPrice * opts.tickStep
    const delta = noise() * baseStep * regimeMultiplier()
    const nextPrice = state.price + delta

    state.price = nextPrice
    const c = state.candles[state.candles.length - 1]
    // The current candle is always pre-seeded with OHLC = open at the moment
    // it's created (the initial candle in createSimulator, subsequent candles
    // in the candle-close push in Task 4). So advance() just extends.
    c.h = Math.max(c.h, nextPrice)
    c.l = Math.min(c.l, nextPrice)
    c.c = nextPrice

    const nextTickIndex = ((state.tickIndex + 1) % 5) as SimState['tickIndex']
    if (nextTickIndex === 0) {
      // close current candle, start next
      c.closed = true
      state.candles.push({
        o: c.c, h: c.c, l: c.c, c: c.c, closed: false,
      })
      if (state.candles.length > opts.candleCount) state.candles.shift()
    }
    state.tickIndex = nextTickIndex
    lastTickAt = now
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): close candle after 5 ticks and roll buffer"
```

---

### Task 5: Add seeded PRNG for deterministic noise

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('seeded determinism', () => {
  it('produces identical price sequences for the same seed', () => {
    const a = createSimulator({ seed: 42 })
    const b = createSimulator({ seed: 42 })
    a.tick(0); b.tick(0)
    const aPrices: number[] = []
    const bPrices: number[] = []
    for (let i = 1; i <= 30; i++) {
      aPrices.push(a.tick(i * 1000).price)
      bPrices.push(b.tick(i * 1000).price)
    }
    expect(aPrices).toEqual(bPrices)
  })

  it('produces different sequences for different seeds', () => {
    const a = createSimulator({ seed: 1 })
    const b = createSimulator({ seed: 2 })
    a.tick(0); b.tick(0)
    const aPrices: number[] = []
    const bPrices: number[] = []
    for (let i = 1; i <= 30; i++) {
      aPrices.push(a.tick(i * 1000).price)
      bPrices.push(b.tick(i * 1000).price)
    }
    expect(aPrices).not.toEqual(bPrices)
  })

  it('never produces NaN or Infinity over 1000 ticks', () => {
    const sim = createSimulator({ seed: 7 })
    sim.tick(0)
    for (let i = 1; i <= 1000; i++) {
      const p = sim.tick(i * 1000).price
      expect(Number.isFinite(p)).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify the determinism tests fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: the two "determinism" tests FAIL because default noise uses `Math.random()`. The NaN/Infinity test may PASS already.

- [ ] **Step 3: Implement a seeded PRNG and wire it in**

In `src/lib/marketSim.ts`, add at the top of the file (after the type definitions):

```ts
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Sum-of-3 uniforms => centered, bounded noise in roughly [-1, 1]
function makeNoise(rand: () => number): () => number {
  return () => (rand() + rand() + rand()) / 1.5 - 1
}
```

Then in `createSimulator`, replace this line:

```ts
const noise = opts.noise ?? (() => Math.random() * 2 - 1)
```

with:

```ts
const rand = mulberry32(opts.seed)
const noise = opts.noise ?? makeNoise(rand)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): seeded mulberry32 PRNG for deterministic noise"
```

---

### Task 6: Soft edge containment (mean reversion)

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('soft edge containment', () => {
  it('keeps the price within halfRange of midPrice under a strong directional push', () => {
    // Noise stuck at +1.0 would otherwise blow past halfRange in a few ticks
    const sim = createSimulator({ noise: () => 1.0 })
    sim.tick(0)
    const initial = sim.getState().price
    const halfRange = initial * 0.02

    for (let i = 1; i <= 200; i++) {
      const p = sim.tick(i * 1000).price
      expect(p).toBeLessThanOrEqual(initial + halfRange + 0.0001)
    }
  })

  it('keeps the price within halfRange under a strong downward push', () => {
    const sim = createSimulator({ noise: () => -1.0 })
    sim.tick(0)
    const initial = sim.getState().price
    const halfRange = initial * 0.02

    for (let i = 1; i <= 200; i++) {
      const p = sim.tick(i * 1000).price
      expect(p).toBeGreaterThanOrEqual(initial - halfRange - 0.0001)
    }
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: the new tests FAIL — price runs off in the direction of the bias.

- [ ] **Step 3: Implement mean reversion + hard clamp**

In `src/lib/marketSim.ts`, add a closure-scoped `midPrice` and `halfRange`, and a `meanReversion()` helper. Update `advance()`.

Add at the top of `createSimulator`, after the closure state is created:

```ts
  let midPrice = opts.initialPrice
  const halfRange = opts.initialPrice * 0.02
  const MID_EMA_ALPHA = 0.02

  function meanReversionDelta(currentPrice: number, baseStep: number): number {
    const distFromMid = (currentPrice - midPrice) / halfRange
    const abs = Math.abs(distFromMid)
    if (abs < 0.6) return 0
    const pullStrength = baseStep * 4
    const ramp = (abs - 0.6) / 0.4 // 0..1 as we go 60%..100% out
    return -Math.sign(distFromMid) * pullStrength * ramp * abs
  }
```

Then replace the `advance` function with:

```ts
  function advance(now: number) {
    const baseStep = opts.initialPrice * opts.tickStep
    const noiseDelta = noise() * baseStep * regimeMultiplier()
    const reversion = meanReversionDelta(state.price, baseStep)
    let nextPrice = state.price + noiseDelta + reversion

    // Hard clamp as last resort — anchored to initialPrice so the wall
    // doesn't drift with midPrice. Under realistic noise midPrice barely
    // moves so this matters only in pathological constant-direction cases.
    const hardMax = opts.initialPrice + halfRange * 0.97
    const hardMin = opts.initialPrice - halfRange * 0.97
    if (nextPrice > hardMax) nextPrice = hardMax
    if (nextPrice < hardMin) nextPrice = hardMin

    state.price = nextPrice
    const c = state.candles[state.candles.length - 1]
    // The current candle is always pre-seeded with OHLC = open at the moment
    // it's created (the initial candle in createSimulator, subsequent candles
    // in the candle-close push in Task 4). So advance() just extends.
    c.h = Math.max(c.h, nextPrice)
    c.l = Math.min(c.l, nextPrice)
    c.c = nextPrice

    const nextTickIndex = ((state.tickIndex + 1) % 5) as SimState['tickIndex']
    if (nextTickIndex === 0) {
      c.closed = true
      // slowly drift midPrice toward recent closes
      midPrice = midPrice * (1 - MID_EMA_ALPHA) + c.c * MID_EMA_ALPHA
      state.candles.push({
        o: c.c, h: c.c, l: c.c, c: c.c, closed: false,
      })
      if (state.candles.length > opts.candleCount) state.candles.shift()
    }
    state.tickIndex = nextTickIndex
    lastTickAt = now
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all PASS, including the new edge-containment tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): soft edge containment via mean reversion + hard clamp"
```

---

### Task 7: Volatility regime cycles

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('volatility regimes', () => {
  it('starts in a calm regime', () => {
    const sim = createSimulator({ seed: 3 })
    expect(sim.getState().regime).toBe('calm')
  })

  it('transitions regimes over a long run and visits both', () => {
    const sim = createSimulator({ seed: 3 })
    sim.tick(0)
    const observed = new Set<string>()
    for (let i = 1; i <= 600; i++) {
      observed.add(sim.tick(i * 1000).regime)
    }
    expect(observed.has('calm')).toBe(true)
    expect(observed.has('volatile')).toBe(true)
  })

  it('keeps a regime for at least 4 closed candles in a row', () => {
    const sim = createSimulator({ seed: 9 })
    sim.tick(0)
    let lastRegime = sim.getState().regime
    let lastFlipCandleIndex = 0
    const flips: number[] = []

    for (let i = 1; i <= 1000; i++) {
      sim.tick(i * 1000)
      // Each candle is 5 ticks, so floor(i / 5) closed candles so far.
      // Don't read off state.candles.length — it stops growing once the
      // rolling buffer fills at candleCount.
      const closedCandles = Math.floor(i / 5)
      if (sim.getState().regime !== lastRegime) {
        flips.push(closedCandles - lastFlipCandleIndex)
        lastFlipCandleIndex = closedCandles
        lastRegime = sim.getState().regime
      }
    }
    for (const len of flips) expect(len).toBeGreaterThanOrEqual(4)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: the regime tests FAIL — regime is hardcoded to `'calm'`.

- [ ] **Step 3: Implement regime transitions**

In `src/lib/marketSim.ts`, add to the closure state in `createSimulator`:

```ts
  let regimeRemaining = 4  // candles until regime can flip; init = 4 so the
                           // initial 'calm' regime also observes the dwell
```

Add this helper inside `createSimulator`:

```ts
  function maybeRollRegime() {
    if (regimeRemaining > 0) {
      regimeRemaining -= 1
      return
    }
    const r = rand()
    if (state.regime === 'calm') {
      state.regime = r < 0.35 ? 'volatile' : 'calm'
    } else {
      state.regime = r < 0.35 ? 'calm' : 'volatile'
    }
    // new regime lasts 4-10 candles
    regimeRemaining = 4 + Math.floor(rand() * 7)
  }
```

In the `advance()` function, replace the candle-close block with:

```ts
    if (nextTickIndex === 0) {
      c.closed = true
      midPrice = midPrice * (1 - MID_EMA_ALPHA) + c.c * MID_EMA_ALPHA
      maybeRollRegime()
      state.candles.push({
        o: c.c, h: c.c, l: c.c, c: c.c, closed: false,
      })
      if (state.candles.length > opts.candleCount) state.candles.shift()
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): volatility regime cycles with min-4-candle dwell"
```

---

### Task 8: Order book recentering on each tick

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('order book recentering', () => {
  it('keeps bestBid = price - spread/2 and bestAsk = price + spread/2 after each tick', () => {
    const sim = createSimulator({ seed: 11 })
    sim.tick(0)
    for (let i = 1; i <= 30; i++) {
      const s = sim.tick(i * 1000)
      expect(s.bestBid).toBeCloseTo(s.price - s.spread / 2, 4)
      expect(s.bestAsk).toBeCloseTo(s.price + s.spread / 2, 4)
      expect(s.bids[0].price).toBeCloseTo(s.bestBid, 4)
      expect(s.asks[0].price).toBeCloseTo(s.bestAsk, 4)
    }
  })

  it('widens the spread during volatile regimes', () => {
    const sim = createSimulator({ seed: 3 })
    sim.tick(0)
    let sawWiderSpread = false
    for (let i = 1; i <= 600; i++) {
      const s = sim.tick(i * 1000)
      if (s.regime === 'volatile' && s.spread > 0.05) sawWiderSpread = true
    }
    expect(sawWiderSpread).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: the new tests FAIL — book never recenters.

- [ ] **Step 3: Implement recentering and spread widening**

In `src/lib/marketSim.ts`, add this helper inside `createSimulator`:

```ts
  function recenterBook() {
    const baseSpread = opts.bookIncrement
    const volatileSpread = baseSpread * 2 + rand() * baseSpread // 2x..3x
    state.spread = state.regime === 'volatile' ? volatileSpread : baseSpread

    state.bestBid = state.price - state.spread / 2
    state.bestAsk = state.price + state.spread / 2

    for (let i = 0; i < state.bids.length; i++) {
      state.bids[i].price = state.bestBid - i * opts.bookIncrement
    }
    for (let i = 0; i < state.asks.length; i++) {
      state.asks[i].price = state.bestAsk + i * opts.bookIncrement
    }
  }
```

Then in `advance()`, after the price has been clamped and the candle updated (but before the `nextTickIndex` calculation), call `recenterBook()`:

```ts
    state.price = nextPrice
    const c = state.candles[state.candles.length - 1]
    // ... existing candle update ...
    recenterBook()

    const nextTickIndex = ((state.tickIndex + 1) % 5) as SimState['tickIndex']
    // ... rest unchanged ...
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): order book recenters around price and widens spread in volatile regime"
```

---

### Task 9: Absorption detection + book level refill

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('book absorption', () => {
  it('marks a flashUntil on a level whose price the tick crossed', () => {
    // Force a big upward move that will pierce at least one ask level
    const sim = createSimulator({ noise: () => 1.0, seed: 1 })
    sim.tick(0)
    const before = sim.getState()
    const initialAskPrices = before.asks.map(a => a.price)
    sim.tick(1000)

    // Some level whose price was crossed should have flashUntil set
    const anyFlash = sim.getState().asks.some(a => a.flashUntil > 0)
      || sim.getState().bids.some(b => b.flashUntil > 0)
    expect(anyFlash).toBe(true)
  })

  it('refills a flashed level with a fresh random size after the flash window', () => {
    const sim = createSimulator({ noise: () => 1.0, seed: 5 })
    sim.tick(0)
    sim.tick(1000)
    const flashedLevel = sim.getState().asks.find(a => a.flashUntil > 0)
    if (!flashedLevel) throw new Error('no flashed level')
    const sizeBefore = flashedLevel.size
    // Tick again past the flash window
    sim.tick(2000)
    // 2000 - 1000 = 1000ms elapsed, flashUntil was 1000 + 600 = 1600
    // so by now=2000 the refill should have run
    const refilled = sim.getState().asks.find(a => a.price === flashedLevel.price)
    expect(refilled).toBeTruthy()
    expect(refilled!.size).toBeGreaterThanOrEqual(5000)
    expect(refilled!.size).toBeLessThanOrEqual(25000)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: the new "book absorption" tests FAIL.

- [ ] **Step 3: Implement absorption + refill**

In `src/lib/marketSim.ts`, add a helper inside `createSimulator`:

```ts
  const FLASH_DURATION = 600

  function randomSize(): number {
    return Math.floor(5000 + rand() * 20000)
  }

  function applyAbsorptionsAndTouched(prevPrice: number, currPrice: number, now: number) {
    const lo = Math.min(prevPrice, currPrice)
    const hi = Math.max(prevPrice, currPrice)

    const allLevels = [...state.bids, ...state.asks]
    for (const lvl of allLevels) {
      // 1. refill if past flash window
      if (lvl.flashUntil > 0 && now >= lvl.flashUntil) {
        lvl.size = randomSize()
        lvl.flashUntil = 0
      }
      // 2. set flash if pierced
      if (lvl.price >= lo && lvl.price <= hi) {
        lvl.flashUntil = now + FLASH_DURATION
      }
    }

    // 3. mark "touched" for the level immediately adjacent to current price
    for (const b of state.bids) b.touched = false
    for (const a of state.asks) a.touched = false
    if (state.bids[0]) state.bids[0].touched = true
    if (state.asks[0]) state.asks[0].touched = true

    // 4. recompute widthPct from sizes per side
    const maxBid = Math.max(...state.bids.map(b => b.size), 1)
    for (const b of state.bids) b.widthPct = b.size / maxBid
    const maxAsk = Math.max(...state.asks.map(a => a.size), 1)
    for (const a of state.asks) a.widthPct = a.size / maxAsk
  }
```

Also update `makeInitialBook` so sizes start randomized — replace the function with:

```ts
function makeInitialBook(price: number, levels: number, increment: number, rand: () => number) {
  const spread = increment
  const bestBid = price - spread / 2
  const bestAsk = price + spread / 2

  const bids: BookLevel[] = []
  const asks: BookLevel[] = []
  for (let i = 0; i < levels; i++) {
    bids.push({
      price: bestBid - i * increment,
      size: Math.floor(5000 + rand() * 20000),
      widthPct: 0,
      touched: false,
      flashUntil: 0,
    })
    asks.push({
      price: bestAsk + i * increment,
      size: Math.floor(5000 + rand() * 20000),
      widthPct: 0,
      touched: false,
      flashUntil: 0,
    })
  }
  // initial widthPct
  const maxBid = Math.max(...bids.map(b => b.size), 1)
  for (const b of bids) b.widthPct = b.size / maxBid
  const maxAsk = Math.max(...asks.map(a => a.size), 1)
  for (const a of asks) a.widthPct = a.size / maxAsk

  return { bids, asks, bestBid, bestAsk, spread }
}
```

Update the call site in `createSimulator`:

```ts
  const rand = mulberry32(opts.seed)
  const noise = opts.noise ?? makeNoise(rand)
  const book = makeInitialBook(opts.initialPrice, opts.bookLevels, opts.bookIncrement, rand)
```

Finally, call `applyAbsorptionsAndTouched()` inside `advance()`. Insert this AFTER `recenterBook()`:

```ts
    applyAbsorptionsAndTouched(state.price - (nextPrice - state.price), state.price, now)
```

Wait — by this point `state.price` has already been updated to `nextPrice`. Capture the previous price explicitly. Rewrite the start of `advance()` to save it:

```ts
  function advance(now: number) {
    const baseStep = opts.initialPrice * opts.tickStep
    const noiseDelta = noise() * baseStep * regimeMultiplier()
    const reversion = meanReversionDelta(state.price, baseStep)
    let nextPrice = state.price + noiseDelta + reversion

    const hardMax = midPrice + halfRange * 0.97
    const hardMin = midPrice - halfRange * 0.97
    if (nextPrice > hardMax) nextPrice = hardMax
    if (nextPrice < hardMin) nextPrice = hardMin

    const prevPrice = state.price
    state.price = nextPrice

    const c = state.candles[state.candles.length - 1]
    // The current candle is always pre-seeded with OHLC = open at the moment
    // it's created (the initial candle in createSimulator, subsequent candles
    // in the candle-close push in Task 4). So advance() just extends.
    c.h = Math.max(c.h, nextPrice)
    c.l = Math.min(c.l, nextPrice)
    c.c = nextPrice
    // Absorption detection MUST run before recenterBook(): we need the
    // pre-recenter book prices so piercings (price crossing through old
    // levels) are detectable. After recenter, all new ask prices are above
    // the new mid and all new bid prices below, so nothing would ever pierce.
    applyAbsorptionsAndTouched(prevPrice, nextPrice, now)
    recenterBook()

    const nextTickIndex = ((state.tickIndex + 1) % 5) as SimState['tickIndex']
    if (nextTickIndex === 0) {
      c.closed = true
      midPrice = midPrice * (1 - MID_EMA_ALPHA) + c.c * MID_EMA_ALPHA
      maybeRollRegime()
      state.candles.push({
        o: c.c, h: c.c, l: c.c, c: c.c, closed: false,
      })
      if (state.candles.length > opts.candleCount) state.candles.shift()
    }
    state.tickIndex = nextTickIndex
    lastTickAt = now
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): absorption detection and refill on pierced book levels"
```

---

### Task 10: pregenerate(n) runs N candles synchronously

**Files:**
- Modify: `src/lib/marketSim.ts`
- Modify: `src/lib/marketSim.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `src/lib/marketSim.test.ts`:

```ts
describe('pregenerate', () => {
  it('produces N closed candles after pregenerate(N)', () => {
    const sim = createSimulator({ seed: 17 })
    sim.pregenerate(10)
    const state = sim.getState()
    const closed = state.candles.filter(c => c.closed).length
    expect(closed).toBeGreaterThanOrEqual(10)
  })

  it('does not advance the wall clock — subsequent tick(0) does not move price', () => {
    const sim = createSimulator({ seed: 17 })
    sim.pregenerate(10)
    const before = sim.getState().price
    // After pregenerate, calling tick at t=0 should seed the clock without advancing
    const after = sim.tick(0).price
    expect(after).toBeCloseTo(before)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: the pregenerate tests FAIL — pregenerate is a no-op.

- [ ] **Step 3: Implement pregenerate**

In `src/lib/marketSim.ts`, replace the `pregenerate: () => {}` stub with the real implementation. Add at the bottom of `createSimulator`, just before `return`:

```ts
  function pregenerate(candleCountToFill: number) {
    // Use a virtual clock so wall time is unaffected. After pregeneration,
    // reset lastTickAt to -Infinity so the next real tick() seeds the clock.
    const TICK = 1000
    let virtualNow = 0
    // First call seeds the clock; mimic that here by setting lastTickAt
    lastTickAt = virtualNow
    const ticksNeeded = candleCountToFill * 5
    for (let i = 0; i < ticksNeeded; i++) {
      virtualNow += TICK
      advance(virtualNow)
    }
    lastTickAt = -Infinity
  }
```

Update the return statement to reference the real `pregenerate`:

```ts
  return {
    getState: () => state,
    tick(now: number) { /* unchanged */ },
    pregenerate,
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/marketSim.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketSim.ts src/lib/marketSim.test.ts
git commit -m "feat(sim): pregenerate(n) fills history synchronously without advancing wall clock"
```

---

### Task 11: MarketHero skeleton replaces Hero (static text + grid background)

**Files:**
- Create: `src/components/MarketHero.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/components/Hero.tsx`

- [ ] **Step 1: Create the MarketHero skeleton**

Create `src/components/MarketHero.tsx`:

```tsx
'use client'

export default function MarketHero() {
  return (
    <section className="relative h-screen bg-bg-deep overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(91,164,207,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(91,164,207,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
        }}
      />

      {/* Center column — name + tagline + line + intro */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
        <h1 className="font-serif text-[32px] md:text-[40px] text-white tracking-[1px]">
          Chris Lane
        </h1>
        <p className="font-mono text-[11px] text-accent tracking-[4px] uppercase mt-3">
          Finance · Builder · Operator
        </p>
        <div className="mt-5 w-[1px] h-[120px] bg-accent opacity-80" />
        <p className="font-mono text-[13px] text-text-subtle max-w-md text-center mt-6 leading-[1.7]">
          A finance student and operator who believes in learning by doing.
          Building tools, leading teams, and turning ideas into products.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Swap Hero for MarketHero in page.tsx**

Replace the contents of `src/app/page.tsx`:

```tsx
import MarketHero from '@/components/MarketHero'
import TimelineTeaser from '@/components/TimelineTeaser'

export default function Home() {
  return (
    <>
      <MarketHero />
      <TimelineTeaser />
    </>
  )
}
```

- [ ] **Step 3: Delete the old Hero**

```bash
rm src/components/Hero.tsx
```

- [ ] **Step 4: Verify in the browser**

If the dev server isn't running, start it: `npm run dev -- -p 3001`.
Open `http://localhost:3001`.
Expected: the hero shows name "Chris Lane", tagline "Finance · Builder · Operator", a vertical accent line, and the intro paragraph — all immediately visible (no scroll-driven reveal). A subtle grid background is visible. The TimelineTeaser section appears below as before. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/MarketHero.tsx src/app/page.tsx
git rm src/components/Hero.tsx
git commit -m "feat(hero): skeleton MarketHero replaces cinematic Hero"
```

---

### Task 12: Top + bottom strips wired to simulator state

**Files:**
- Modify: `src/components/MarketHero.tsx`

- [ ] **Step 1: Wire up the simulator and render the strips**

Replace the contents of `src/components/MarketHero.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createSimulator, type SimState } from '@/lib/marketSim'

function formatPrice(p: number) {
  return `$${p.toFixed(2)}`
}

function formatTime() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm} ET`
}

export default function MarketHero() {
  const simRef = useRef<ReturnType<typeof createSimulator> | null>(null)
  const [state, setState] = useState<SimState | null>(null)
  const [now, setNow] = useState<string>(formatTime())

  if (!simRef.current) {
    const sim = createSimulator({ initialPrice: 412.50 })
    sim.pregenerate(24)
    simRef.current = sim
  }

  useEffect(() => {
    if (!simRef.current) return
    setState(simRef.current.getState())
    const id = setInterval(() => setNow(formatTime()), 30000)
    return () => clearInterval(id)
  }, [])

  const s = state ?? simRef.current!.getState()
  const initial = 412.50
  const deltaPct = ((s.price - initial) / initial) * 100

  return (
    <section className="relative h-screen bg-bg-deep overflow-hidden">
      {/* Top strip */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-2.5 text-[10px] uppercase tracking-[2px] text-text-body border-b border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.015)] font-mono"
           aria-hidden="true">
        <span>
          CL <span className="text-accent normal-case">{formatPrice(s.price)}</span>{' '}
          <span className={deltaPct >= 0 ? 'text-accent' : 'text-[#c97064]'}>
            {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(2)}%
          </span>
        </span>
        <span className="text-text-muted tracking-[1px] normal-case">
          Spread {s.spread.toFixed(2)} · Mid {((s.bestBid + s.bestAsk) / 2).toFixed(2)}
        </span>
        <span className="flex items-center gap-2">
          {now}
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent live-pip" />
        </span>
      </div>

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(91,164,207,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(91,164,207,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
        }}
      />

      {/* Center column */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
        <h1 className="font-serif text-[32px] md:text-[40px] text-white tracking-[1px]">
          Chris Lane
        </h1>
        <p className="font-mono text-[11px] text-accent tracking-[4px] uppercase mt-3">
          Finance · Builder · Operator
        </p>
        <div className="mt-5 w-[1px] h-[120px] bg-accent opacity-80" />
        <p className="font-mono text-[13px] text-text-subtle max-w-md text-center mt-6 leading-[1.7]">
          A finance student and operator who believes in learning by doing.
          Building tools, leading teams, and turning ideas into products.
        </p>
      </div>

      {/* Bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-2.5 text-[9px] uppercase tracking-[2px] text-text-muted border-t border-[rgba(255,255,255,0.04)] font-mono"
           aria-hidden="true">
        <span>LAST {formatPrice(s.price)} · Spread {s.spread.toFixed(2)}</span>
        <span className="text-text-body">scroll ↓</span>
        <span>SESSION ALIVE</span>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Reload `http://localhost:3001`. Expected: the top strip shows `CL $412.50 +0.00% · Spread 0.05 · Mid 412.50 · HH:MM ET · ●`. The bottom strip shows `LAST $412.50 · Spread 0.05 · scroll ↓ · SESSION ALIVE`. Price is static (no ticking yet — wired in Task 14). No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/MarketHero.tsx
git commit -m "feat(hero): top and bottom strips driven by simulator state"
```

---

### Task 13: Bid + ask ladders rendered from simulator state

**Files:**
- Modify: `src/components/MarketHero.tsx`

- [ ] **Step 1: Add the ladder markup**

In `src/components/MarketHero.tsx`, add this just before the closing `</section>`:

```tsx
      {/* Bids ladder (left) */}
      <ul className="absolute top-9 bottom-9 left-0 w-[22%] z-10 flex flex-col items-end px-3 py-3 m-0 list-none"
          aria-hidden="true">
        {s.bids.map((lvl, i) => (
          <li
            key={`b-${i}`}
            className={`relative w-full flex justify-between text-[9.5px] font-mono py-[3px] px-[6px] mb-[1px] book-row book-row-bid ${lvl.touched ? 'is-touched' : ''} ${lvl.flashUntil > 0 ? 'is-flashing' : ''}`}
          >
            <span
              className="absolute inset-y-0 left-0 -z-10 book-bar"
              style={{ width: `${lvl.widthPct * 100}%` }}
            />
            <span className="text-text-body opacity-80">{lvl.size.toLocaleString()}</span>
            <span className="text-accent">{lvl.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {/* Asks ladder (right) */}
      <ul className="absolute top-9 bottom-9 right-0 w-[22%] z-10 flex flex-col items-start px-3 py-3 m-0 list-none"
          aria-hidden="true">
        {s.asks.map((lvl, i) => (
          <li
            key={`a-${i}`}
            className={`relative w-full flex justify-between text-[9.5px] font-mono py-[3px] px-[6px] mb-[1px] book-row book-row-ask ${lvl.touched ? 'is-touched' : ''} ${lvl.flashUntil > 0 ? 'is-flashing' : ''}`}
          >
            <span
              className="absolute inset-y-0 right-0 -z-10 book-bar book-bar-ask"
              style={{ width: `${lvl.widthPct * 100}%` }}
            />
            <span className="text-[#c97064]">{lvl.price.toFixed(2)}</span>
            <span className="text-text-body opacity-80">{lvl.size.toLocaleString()}</span>
          </li>
        ))}
      </ul>
```

- [ ] **Step 2: Add base book CSS to globals.css**

In `src/app/globals.css`, append:

```css
/* Order book rows */
.book-row {
  opacity: 0.45;
  transition: opacity 200ms ease-out;
}
.book-row.is-touched {
  opacity: 0.65;
}
.book-row.is-flashing {
  opacity: 0.85;
}
.book-bar {
  background: rgba(91,164,207,0.10);
  border-radius: 1px;
  transition: width 600ms ease-out;
}
.book-bar-ask {
  background: rgba(201,112,100,0.10);
}
.book-row.is-touched .book-bar { background: rgba(91,164,207,0.22); }
.book-row.is-touched .book-bar-ask { background: rgba(201,112,100,0.22); }
```

- [ ] **Step 3: Verify in the browser**

Reload `http://localhost:3001`. Expected: bid ladder on the left (blue prices, sizes), ask ladder on the right (red prices, sizes), 7 levels each with depth bars at varying widths. Best bid/ask rows are visibly brighter (`is-touched`). No layout overlap with the center text.

- [ ] **Step 4: Commit**

```bash
git add src/components/MarketHero.tsx src/app/globals.css
git commit -m "feat(hero): render bid and ask ladders from simulator state"
```

---

### Task 14: Animation loop — tick state + canvas chart with pre-generated history

**Files:**
- Modify: `src/components/MarketHero.tsx`

- [ ] **Step 1: Add the canvas, draw helper, and animation loop**

In `src/components/MarketHero.tsx`, at the top of the file under existing imports, add:

```tsx
type Candle = SimState['candles'][number]

function drawCandles(
  ctx: CanvasRenderingContext2D,
  candles: Candle[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height)
  if (candles.length === 0) return

  // y-axis: pick range that hugs the visible candles
  let lo = Infinity, hi = -Infinity
  for (const c of candles) {
    if (c.l < lo) lo = c.l
    if (c.h > hi) hi = c.h
  }
  if (lo === hi) { lo -= 1; hi += 1 }
  const pad = (hi - lo) * 0.1
  lo -= pad; hi += pad

  const yOf = (price: number) =>
    height - ((price - lo) / (hi - lo)) * height

  const slot = width / candles.length
  const bodyW = Math.max(2, slot - 2)

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    const x = i * slot + (slot - bodyW) / 2
    const isUp = c.c >= c.o
    const color = isUp ? '#5ba4cf' : '#c97064'
    // fade leftmost candles
    const fadeIn = Math.min(1, i / 6)
    ctx.globalAlpha = fadeIn * (i === candles.length - 1 ? 0.85 : 0.55)

    // wick
    ctx.fillStyle = color
    ctx.fillRect(x + bodyW / 2 - 0.5, yOf(c.h), 1, yOf(c.l) - yOf(c.h))
    // body
    const bodyTop = yOf(Math.max(c.o, c.c))
    const bodyBot = yOf(Math.min(c.o, c.c))
    ctx.fillRect(x, bodyTop, bodyW, Math.max(1, bodyBot - bodyTop))
  }
  ctx.globalAlpha = 1
}
```

Then, inside the `MarketHero` component, add the canvas ref and the rAF loop. Replace the existing `useEffect` block with:

```tsx
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!simRef.current) return
    setState(simRef.current.getState())

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    window.addEventListener('resize', fit)

    const loop = (t: number) => {
      const next = simRef.current!.tick(t)
      setState({ ...next, bids: [...next.bids], asks: [...next.asks], candles: [...next.candles] })
      const rect = canvas.getBoundingClientRect()
      drawCandles(ctx, next.candles, rect.width, rect.height)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const timeId = setInterval(() => setNow(formatTime()), 30000)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', fit)
      clearInterval(timeId)
    }
  }, [])
```

Add the canvas element to the JSX. Insert it inside the `<section>`, between the grid background and the center column:

```tsx
      {/* Chart canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-9 bottom-9 left-[22%] right-[22%] z-[1] pointer-events-none"
        style={{ width: '56%', height: 'calc(100% - 4.5rem)' }}
        aria-hidden="true"
      />
```

- [ ] **Step 2: Verify in the browser**

Reload `http://localhost:3001`. Expected: on load the chart already shows ~24 candles of history. Within ~1 second the chart begins ticking — the rightmost candle's wick visibly grows; every 5 seconds a new candle forms and the history shifts left. The top strip price updates each second. The bottom strip's LAST also updates. The bid/ask depth bars are present (full reactivity comes in Task 15). No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/MarketHero.tsx
git commit -m "feat(hero): canvas chart with pre-generated history + animation loop"
```

---

### Task 15: CSS animations — LIVE pip pulse + absorption flash + chart overlay

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/MarketHero.tsx`

- [ ] **Step 1: Add keyframes and overlay class to globals.css**

In `src/app/globals.css`, append:

```css
/* LIVE pip pulse */
@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(91,164,207,0.7); }
  50%      { opacity: 0.5; box-shadow: 0 0 2px rgba(91,164,207,0.3); }
}
.live-pip { animation: livePulse 1.6s ease-in-out infinite; }

/* Absorption flash bumps the bar opacity briefly when flashing class is on.
   The width transition (in book-bar) already handles the shrink/refill. */
@keyframes absorbFlash {
  0%   { background: rgba(91,164,207,0.45); }
  100% { background: rgba(91,164,207,0.22); }
}
.book-row-bid.is-flashing .book-bar {
  animation: absorbFlash 600ms ease-out;
}
@keyframes absorbFlashAsk {
  0%   { background: rgba(201,112,100,0.45); }
  100% { background: rgba(201,112,100,0.22); }
}
.book-row-ask.is-flashing .book-bar-ask {
  animation: absorbFlashAsk 600ms ease-out;
}

/* Chart overlay — dims chart behind the center text block */
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
  z-index: 2;
}
```

- [ ] **Step 2: Mount the overlay above the canvas**

In `src/components/MarketHero.tsx`, immediately after the `<canvas>` element, add:

```tsx
      <div className="chart-overlay" aria-hidden="true" />
```

- [ ] **Step 3: Verify in the browser**

Reload `http://localhost:3001`. Expected: the small dot at the right of the top strip pulses once every ~1.6s. When a tick visibly pierces a depth level (it will happen within a few seconds because of theatrical volatility), that bar briefly flashes brighter, shrinks, and refills with a new width over ~600ms. The center name + tagline + intro is clearly readable over the chart thanks to the radial dim.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/MarketHero.tsx
git commit -m "feat(hero): CSS animations for LIVE pip, absorption flash, and chart overlay"
```

---

### Task 16: Lifecycle — pause offscreen, pause on tab blur, respect prefers-reduced-motion

**Files:**
- Modify: `src/components/MarketHero.tsx`

- [ ] **Step 1: Add the lifecycle logic to the useEffect**

In `src/components/MarketHero.tsx`, modify the `useEffect` so that the rAF loop early-returns when the hero is offscreen or the tab is hidden, and pre-fills the buffer + freezes the simulator when `prefers-reduced-motion: reduce` is active.

Replace the entire `useEffect(() => { ... }, [])` block with:

```tsx
  useEffect(() => {
    if (!simRef.current) return
    setState(simRef.current.getState())

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    window.addEventListener('resize', fit)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      simRef.current.pregenerate(60)
      const snap = simRef.current.getState()
      setState(snap)
      const rect = canvas.getBoundingClientRect()
      drawCandles(ctx, snap.candles, rect.width, rect.height)
      return () => window.removeEventListener('resize', fit)
    }

    let inView = true
    const io = new IntersectionObserver(
      (entries) => { inView = entries[0]?.isIntersecting ?? true },
      { threshold: 0 }
    )
    const sectionEl = canvas.closest('section')
    if (sectionEl) io.observe(sectionEl)

    const loop = (t: number) => {
      const docVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
      if (inView && docVisible) {
        const next = simRef.current!.tick(t)
        setState({ ...next, bids: [...next.bids], asks: [...next.asks], candles: [...next.candles] })
        const rect = canvas.getBoundingClientRect()
        drawCandles(ctx, next.candles, rect.width, rect.height)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const timeId = setInterval(() => setNow(formatTime()), 30000)

    return () => {
      cancelAnimationFrame(rafRef.current)
      io.disconnect()
      window.removeEventListener('resize', fit)
      clearInterval(timeId)
    }
  }, [])
```

- [ ] **Step 2: Verify in the browser**

Reload `http://localhost:3001`. Expected:
- Scroll past the hero to the projects teaser — the price should stop changing while offscreen (open DevTools Performance tab to confirm rAF idles, or just watch the top strip price freeze).
- Switch tabs and come back — price freezes while away, resumes on return.
- Toggle `prefers-reduced-motion` in DevTools (Rendering tab → Emulate CSS media feature). Reload. Expected: chart shows a full pre-generated history, no ticking, no LIVE pulse on the dot, top strip price is static.

- [ ] **Step 3: Commit**

```bash
git add src/components/MarketHero.tsx
git commit -m "feat(hero): pause offscreen + on tab blur, honor prefers-reduced-motion"
```

---

### Task 17: Mobile responsive collapse (ladders → strips)

**Files:**
- Modify: `src/components/MarketHero.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Hide side ladders below md and add compact strips**

In `src/components/MarketHero.tsx`, change the bids ladder root class from:

```tsx
"absolute top-9 bottom-9 left-0 w-[22%] z-10 flex flex-col items-end px-3 py-3 m-0 list-none"
```

to:

```tsx
"hidden md:flex absolute top-9 bottom-9 left-0 w-[22%] z-10 flex-col items-end px-3 py-3 m-0 list-none"
```

Mirror for the asks ladder. Adjust the canvas so its horizontal insets collapse on mobile — change the canvas className from:

```tsx
"absolute top-9 bottom-9 left-[22%] right-[22%] z-[1] pointer-events-none"
```

to:

```tsx
"absolute top-9 bottom-9 left-2 right-2 md:left-[22%] md:right-[22%] z-[1] pointer-events-none"
```

And change the inline `style` from `width: '56%'` to:

```tsx
style={{ width: 'auto', height: 'calc(100% - 4.5rem)' }}
```

(Width is now set by the absolute insets.)

Add the mobile depth strips. Inside the section, just after the top strip, insert:

```tsx
      {/* Mobile depth strips (best 3 each side) */}
      <div className="md:hidden absolute top-9 left-0 right-0 z-10 flex justify-around px-3 py-2 text-[9px] font-mono text-accent border-b border-[rgba(255,255,255,0.04)]"
           aria-hidden="true">
        {s.bids.slice(0, 3).map(lvl => (
          <span key={`mb-${lvl.price.toFixed(2)}`}>
            {lvl.price.toFixed(2)} <span className="text-text-muted">{lvl.size.toLocaleString()}</span>
          </span>
        ))}
      </div>
      <div className="md:hidden absolute bottom-9 left-0 right-0 z-10 flex justify-around px-3 py-2 text-[9px] font-mono text-[#c97064] border-t border-[rgba(255,255,255,0.04)]"
           aria-hidden="true">
        {s.asks.slice(0, 3).map(lvl => (
          <span key={`ma-${lvl.price.toFixed(2)}`}>
            {lvl.price.toFixed(2)} <span className="text-text-muted">{lvl.size.toLocaleString()}</span>
          </span>
        ))}
      </div>
```

- [ ] **Step 2: Reduce candle count on mobile (optional optimization)**

The default `candleCount` is 60. The chart will still render fine at narrow widths, but to make mobile candles thicker and more legible, change the simulator init in the `if (!simRef.current)` block:

```tsx
  if (!simRef.current) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sim = createSimulator({
      initialPrice: 412.50,
      candleCount: isMobile ? 25 : 60,
    })
    sim.pregenerate(isMobile ? 10 : 24)
    simRef.current = sim
  }
```

- [ ] **Step 3: Verify in the browser**

Reload `http://localhost:3001`. Resize the window narrower than 768px (or use DevTools device toolbar). Expected: side ladders disappear; two compact horizontal strips appear at the top and bottom of the chart area showing the best 3 bids and asks; chart fills most of the width; name + tagline still center cleanly. Resize back above 768px — ladders return.

- [ ] **Step 4: Commit**

```bash
git add src/components/MarketHero.tsx src/app/globals.css
git commit -m "feat(hero): mobile responsive collapse — side ladders become top/bottom depth strips"
```

---

### Task 18: Acceptance criteria verification + final cleanup

**Files:**
- (Verification only — no code changes unless a criterion fails.)

- [ ] **Step 1: Run the test suite once more**

Run: `npm test`
Expected: every test from Tasks 2–10 PASSES. No skipped tests, no flaky ones.

- [ ] **Step 2: Run a typecheck**

Run: `npx tsc --noEmit`
Expected: zero TypeScript errors. If any exist, fix them and re-run.

- [ ] **Step 3: Walk the acceptance criteria from the spec**

Open `http://localhost:3001` in a fresh browser tab. For each, confirm:

1. Within ~1 second of load, the chart is visibly ticking and the top strip price updates each second.
2. The chart shows pre-populated history on mount (never starts empty).
3. New candles always form at the same horizontal slot behind the name; old candles fade to the left as the window scrolls.
4. Watch for 5 minutes (or speed-run by leaving it open in a tab) — the price never visibly escapes the chart's vertical band.
5. Watch for 60 seconds — at least one volatility burst is observed (visibly larger candles/wicks).
6. When a tick pierces a depth level, that bar visibly absorbs (shrinks/flashes) and refills within ~600ms.
7. Scroll past the hero — top-strip price freezes. Scroll back — price resumes.
8. Switch tabs for 5 seconds and return — price was frozen.
9. Toggle `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature). Reload. Chart is a static snapshot, no ticking, LIVE pip does not pulse.
10. Open DevTools Performance, record 10s with hero in view. Confirm CPU stays under ~5% on a modern laptop.
11. Scroll down — the existing `TimelineTeaser` "Recent Work / N Projects and Counting" section is unchanged.
12. Browser console: zero warnings, zero React hydration errors. No CLS between SSR and hydrate.

If any criterion fails, fix it before continuing. Common likely failures:
- **Criterion 4 fails (price escapes band):** the canvas y-axis recomputes range each frame, so if the simulator does keep `price` within `midPrice ± halfRange` but `midPrice` itself drifts, the chart still hugs the range. Verify by logging `midPrice` and `price` in the rAF loop. If the EMA is too aggressive, lower `MID_EMA_ALPHA` from 0.02 to 0.01.
- **Criterion 12 hydration error:** the time string `formatTime()` is computed during render, which differs SSR vs client. The current implementation seeds the time inside `useState` lazily but renders it before the effect — verify by making the initial server render use a constant like `'—'` and only set the real time inside the effect.

- [ ] **Step 4: Update the project memory note if anything was learned**

If during verification you discovered a workaround that's worth remembering for next time (e.g., "Next.js hydration mismatch around `new Date()`"), save it to memory per the auto-memory rules. Otherwise skip.

- [ ] **Step 5: Final commit (only if changes were needed during verification)**

If you made any fixes during this task, commit them:

```bash
git add -u
git commit -m "fix(hero): acceptance verification cleanup"
```

If no changes were needed, no commit is necessary.

---

## Self-Review

**Spec coverage check:**

- §2.1 layout (top strip, ladders, center column, bottom strip) — Tasks 11, 12, 13 ✓
- §2.2 live edge anchoring (new candles form right behind the name; history shifts left) — Task 14 (canvas draws right-to-left with leftmost fade) ✓
- §2.3 self-playing behavior (5s candles, 5 ticks, ~40% pregenerated, theatrical vol, no cursor interaction) — Tasks 3, 4, 7, 10, 14 ✓
- §3 simulator (types, tick logic, edge containment, regimes, book, pregeneration) — Tasks 2–10 ✓
- §4 renderer (structure, anim loop, canvas, book DOM, strips, center column, overlay) — Tasks 11–15 ✓
- §5 accessibility & motion (`prefers-reduced-motion`, `aria-hidden`, real DOM text) — Task 16, plus `aria-hidden="true"` on decorative elements throughout Tasks 12-13-14 ✓
- §6 performance (one rAF, IntersectionObserver, tab blur pause) — Task 16 ✓
- §7 mobile responsive collapse — Task 17 ✓
- §8 file changes (new MarketHero + marketSim, modified page.tsx + globals.css, deleted Hero.tsx) — Tasks 11–17 ✓
- §9 out of scope — respected (no new libs, no real data, no changes outside listed files) ✓
- §10 acceptance criteria — Task 18 ✓

No gaps.

**Placeholder scan:** no "TBD", "TODO", "implement later", "add appropriate error handling", or "similar to Task N" anywhere. All code blocks are complete. ✓

**Type consistency:**
- `SimState` shape consistent across Tasks 2, 9, 12, 14.
- `BookLevel` fields (`price`, `size`, `widthPct`, `touched`, `flashUntil`) referenced consistently in Tasks 2, 9, 13.
- `createSimulator` signature stable across Tasks 2–10. Default option names (`initialPrice`, `tickStep`, `candleCount`, `bookLevels`, `bookIncrement`, `seed`, `noise`) consistent.
- `drawCandles` parameters match between Task 14 declaration and Task 16 invocation.

No inconsistencies.

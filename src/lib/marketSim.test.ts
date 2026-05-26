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
      // Each candle is 5 ticks, so floor(i / 5) closed candles so far
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

describe('book absorption', () => {
  it('marks a flashUntil on a level whose price the tick crossed', () => {
    // Force a big upward move that will pierce at least one ask level
    const sim = createSimulator({ noise: () => 1.0, seed: 1 })
    sim.tick(0)
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

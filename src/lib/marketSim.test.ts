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

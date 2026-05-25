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

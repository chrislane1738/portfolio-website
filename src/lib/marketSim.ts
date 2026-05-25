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

  let lastTickAt = -Infinity
  const rand = mulberry32(opts.seed)
  const noise = opts.noise ?? makeNoise(rand)
  const TICK_MS = 1000

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

  function regimeMultiplier(): number {
    return state.regime === 'volatile' ? 4 : 1
  }

  function advance(now: number) {
    const baseStep = opts.initialPrice * opts.tickStep
    const noiseDelta = noise() * baseStep * regimeMultiplier()
    const reversion = meanReversionDelta(state.price, baseStep)
    let nextPrice = state.price + noiseDelta + reversion

    // Hard clamp as last resort (anchored to initial price, not drifting midPrice)
    const hardMax = opts.initialPrice + halfRange * 0.97
    const hardMin = opts.initialPrice - halfRange * 0.97
    if (nextPrice > hardMax) nextPrice = hardMax
    if (nextPrice < hardMin) nextPrice = hardMin

    state.price = nextPrice
    const c = state.candles[state.candles.length - 1]
    // The current candle is always pre-seeded with OHLC = open at the moment
    // it's created (the initial candle in createSimulator, subsequent candles
    // in the candle-close push below). So advance() just extends.
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
}

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
  /** Constant per-tick drift as a fraction of baseStep. Default 0. */
  drift?: number
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

export function createSimulator(options: SimulatorOptions = {}): Simulator {
  const opts = { ...DEFAULT_OPTS, ...options }
  const rand = mulberry32(opts.seed)
  const noise = opts.noise ?? makeNoise(rand)
  const book = makeInitialBook(opts.initialPrice, opts.bookLevels, opts.bookIncrement, rand)

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
  let regimeRemaining = 4  // candles until regime can flip (initial dwell ≥ 4)
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

  function advance(now: number) {
    const baseStep = opts.initialPrice * opts.tickStep
    const noiseDelta = noise() * baseStep * regimeMultiplier()
    const reversion = meanReversionDelta(state.price, baseStep)
    // Optional constant drift per tick (fraction of baseStep). Small positive
    // values give the chart a slight long-term upward bias.
    const drift = baseStep * (opts.drift ?? 0)
    let nextPrice = state.price + noiseDelta + reversion + drift

    // Hard clamp as last resort — anchored to initialPrice so the wall
    // doesn't drift with midPrice. Under realistic noise midPrice barely
    // moves so this matters only in pathological constant-direction cases.
    const hardMax = opts.initialPrice + halfRange * 0.97
    const hardMin = opts.initialPrice - halfRange * 0.97
    if (nextPrice > hardMax) nextPrice = hardMax
    if (nextPrice < hardMin) nextPrice = hardMin

    const prevPrice = state.price
    state.price = nextPrice

    const c = state.candles[state.candles.length - 1]
    // The current candle is always pre-seeded with OHLC = open at the moment
    // it's created. So advance() just extends.
    c.h = Math.max(c.h, nextPrice)
    c.l = Math.min(c.l, nextPrice)
    c.c = nextPrice
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
    pregenerate,
  }
}

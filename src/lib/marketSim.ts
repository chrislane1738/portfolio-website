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

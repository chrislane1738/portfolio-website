'use client'

import { useEffect, useRef, useState } from 'react'
import { createSimulator, type SimState } from '@/lib/marketSim'

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
  const [now, setNow] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)

  if (!simRef.current) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sim = createSimulator({
      initialPrice: 412.50,
      candleCount: isMobile ? 25 : 60,
    })
    sim.pregenerate(isMobile ? 10 : 24)
    simRef.current = sim
  }

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

    setNow(formatTime())

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

    let lastPrice = simRef.current.getState().price
    let lastTickIndex = simRef.current.getState().tickIndex

    const loop = (t: number) => {
      const docVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
      if (inView && docVisible) {
        const next = simRef.current!.tick(t)
        if (next.price !== lastPrice || next.tickIndex !== lastTickIndex) {
          setState({ ...next, bids: [...next.bids], asks: [...next.asks], candles: [...next.candles] })
          lastPrice = next.price
          lastTickIndex = next.tickIndex
        }
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

      {/* Mobile depth strips (best 3 each side) */}
      <div className="md:hidden absolute top-9 left-0 right-0 z-10 flex justify-around px-3 py-2 text-[9px] font-mono text-accent border-b border-[rgba(255,255,255,0.04)]"
           aria-hidden="true">
        {s.bids.slice(0, 3).map((lvl, i) => (
          <span key={`mb-${i}`}>
            {lvl.price.toFixed(2)} <span className="text-text-muted">{lvl.size.toLocaleString()}</span>
          </span>
        ))}
      </div>
      <div className="md:hidden absolute bottom-9 left-0 right-0 z-10 flex justify-around px-3 py-2 text-[9px] font-mono text-[#c97064] border-t border-[rgba(255,255,255,0.04)]"
           aria-hidden="true">
        {s.asks.slice(0, 3).map((lvl, i) => (
          <span key={`ma-${i}`}>
            {lvl.price.toFixed(2)} <span className="text-text-muted">{lvl.size.toLocaleString()}</span>
          </span>
        ))}
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

      {/* Chart canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-9 bottom-9 left-2 right-2 md:left-[22%] md:right-[22%] z-[1] pointer-events-none"
        style={{ width: 'auto', height: 'calc(100% - 4.5rem)' }}
        aria-hidden="true"
      />

      <div className="chart-overlay" aria-hidden="true" />

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

      {/* Bids ladder (left) */}
      <ul className="hidden md:flex absolute top-9 bottom-9 left-0 w-[22%] z-10 flex-col items-end px-3 py-3 m-0 list-none"
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
      <ul className="hidden md:flex absolute top-9 bottom-9 right-0 w-[22%] z-10 flex-col items-start px-3 py-3 m-0 list-none"
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
    </section>
  )
}

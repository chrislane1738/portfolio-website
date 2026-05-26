'use client'

import { useEffect, useRef, useState } from 'react'
import { createSimulator, type SimState } from '@/lib/marketSim'

type Candle = SimState['candles'][number]

// Live edge of the chart (newest candle) sits this fraction across the
// canvas. With the canvas spanning left-[22%] right-0 on desktop, 0.7
// puts the live edge at ~screen-77% so candles sweep across most of the
// middle of the screen.
const LIVE_EDGE_PCT = 0.7

// How many candles are visible on screen at once. The simulator's buffer
// holds VISIBLE + WARMUP candles so longer-lookback indicators (MA 50) have
// data for every visible candle on first render.
const VISIBLE_DESKTOP = 60
const VISIBLE_MOBILE = 25
const WARMUP = 60

// ── Indicators ─────────────────────────────────────────────────────────

type IndicatorId = 'ma20' | 'ma50' | 'vwap' | 'rsi'

const COLORS = {
  ma20: '#6dc8ff',   // bright blue
  ma50: '#3a82c4',   // deeper blue
  vwap: '#b58df0',   // soft violet (line + band tint)
  rsi:  '#5bcf87',   // accent green
}

const INDICATORS: { id: IndicatorId; label: string; color: string }[] = [
  { id: 'ma20', label: 'MA 20',  color: COLORS.ma20 },
  { id: 'ma50', label: 'MA 50',  color: COLORS.ma50 },
  { id: 'vwap', label: 'VWAP',   color: COLORS.vwap },
  { id: 'rsi',  label: 'RSI 14', color: COLORS.rsi  },
]

function computeSMA(candles: Candle[], period: number): number[] {
  const out: number[] = []
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { out.push(NaN); continue }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].c
    out.push(sum / period)
  }
  return out
}

function computeRSI(candles: Candle[], period = 14): number[] {
  const out: number[] = candles.map(() => NaN)
  if (candles.length < period + 1) return out
  let gain = 0, loss = 0
  for (let i = 1; i <= period; i++) {
    const ch = candles[i].c - candles[i - 1].c
    if (ch > 0) gain += ch
    else loss -= ch
  }
  gain /= period
  loss /= period
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)
  for (let i = period + 1; i < candles.length; i++) {
    const ch = candles[i].c - candles[i - 1].c
    const g = ch > 0 ? ch : 0
    const l = ch < 0 ? -ch : 0
    gain = (gain * (period - 1) + g) / period
    loss = (loss * (period - 1) + l) / period
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)
  }
  return out
}

function computeVWAPWithBands(
  candles: Candle[],
  stdDevMult = 2,
): { vwap: number[]; upper: number[]; lower: number[] } {
  const vwap: number[] = []
  const upper: number[] = []
  const lower: number[] = []
  let cumPV = 0
  let cumV = 0
  let cumP2V = 0
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    const typical = (c.h + c.l + c.c) / 3
    // Deterministic synthetic volume so the band doesn't flicker per frame.
    const v = 5000 + (Math.sin(i * 1.3 + 17) * 0.5 + 0.5) * 15000
    cumPV += typical * v
    cumV += v
    cumP2V += typical * typical * v
    const vw = cumPV / cumV
    const variance = Math.max(0, cumP2V / cumV - vw * vw)
    const sd = Math.sqrt(variance)
    vwap.push(vw)
    upper.push(vw + stdDevMult * sd)
    lower.push(vw - stdDevMult * sd)
  }
  return { vwap, upper, lower }
}

// ── Canvas drawing ─────────────────────────────────────────────────────

type Region = { x: number; y: number; w: number; h: number }

type Series = {
  ma20?: number[]
  ma50?: number[]
  vwap?: number[]
  vwapUpper?: number[]
  vwapLower?: number[]
}

type Range = { lo: number; hi: number }

function computeMainRange(candles: Candle[], series: Series): Range {
  let lo = Infinity, hi = -Infinity
  for (const c of candles) {
    if (c.l < lo) lo = c.l
    if (c.h > hi) hi = c.h
  }
  const include = (arr?: number[]) => {
    if (!arr) return
    for (const v of arr) {
      if (!Number.isFinite(v)) continue
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  }
  include(series.ma20)
  include(series.ma50)
  include(series.vwapUpper)
  include(series.vwapLower)
  if (lo === hi) { lo -= 1; hi += 1 }
  const pad = (hi - lo) * 0.1
  return { lo: lo - pad, hi: hi + pad }
}

function drawMainPanel(
  ctx: CanvasRenderingContext2D,
  candles: Candle[],
  series: Series,
  region: Region,
  range: Range,
) {
  const { x: rx, y: ry, w: rw, h: rh } = region
  const { lo, hi } = range
  if (candles.length === 0) return

  const yOf = (price: number) => ry + rh - ((price - lo) / (hi - lo)) * rh

  const candleAreaWidth = rw * LIVE_EDGE_PCT
  const slot = candleAreaWidth / candles.length
  const bodyW = Math.max(2, slot - 2)
  const xAt = (i: number) => rx + i * slot + slot / 2

  // VWAP band fill (drawn first so candles are on top)
  if (series.vwapUpper && series.vwapLower) {
    ctx.fillStyle = 'rgba(181, 141, 240, 0.10)'
    ctx.beginPath()
    let started = false
    for (let i = 0; i < candles.length; i++) {
      const u = series.vwapUpper[i]
      if (!Number.isFinite(u)) continue
      const px = xAt(i)
      if (!started) { ctx.moveTo(px, yOf(u)); started = true }
      else ctx.lineTo(px, yOf(u))
    }
    for (let i = candles.length - 1; i >= 0; i--) {
      const l = series.vwapLower![i]
      if (!Number.isFinite(l)) continue
      ctx.lineTo(xAt(i), yOf(l))
    }
    ctx.closePath()
    ctx.fill()
  }

  // Candles
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    const x = rx + i * slot + (slot - bodyW) / 2
    const isUp = c.c >= c.o
    const color = isUp ? '#5bcf87' : '#c97064'
    const fadeIn = Math.min(1, i / 6)
    ctx.globalAlpha = fadeIn * (i === candles.length - 1 ? 0.9 : 0.55)

    ctx.fillStyle = color
    ctx.fillRect(x + bodyW / 2 - 0.5, yOf(c.h), 1, yOf(c.l) - yOf(c.h))
    const bodyTop = yOf(Math.max(c.o, c.c))
    const bodyBot = yOf(Math.min(c.o, c.c))
    ctx.fillRect(x, bodyTop, bodyW, Math.max(1, bodyBot - bodyTop))
  }
  ctx.globalAlpha = 1

  // MA lines — blue, dotted (different dash for MA 20 vs MA 50)
  const drawLine = (
    values: number[],
    color: string,
    dash: number[],
    alpha = 0.9,
    width = 1.4,
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.setLineDash(dash)
    ctx.globalAlpha = alpha
    ctx.beginPath()
    let started = false
    for (let i = 0; i < values.length; i++) {
      const v = values[i]
      if (!Number.isFinite(v)) { started = false; continue }
      const px = xAt(i)
      const py = yOf(v)
      if (!started) { ctx.moveTo(px, py); started = true }
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }

  if (series.ma20) drawLine(series.ma20, COLORS.ma20, [2, 3])
  if (series.ma50) drawLine(series.ma50, COLORS.ma50, [4, 4])
  if (series.vwap) drawLine(series.vwap, COLORS.vwap, [], 0.85)
  if (series.vwapUpper) drawLine(series.vwapUpper, COLORS.vwap, [3, 3], 0.45, 1)
  if (series.vwapLower) drawLine(series.vwapLower, COLORS.vwap, [3, 3], 0.45, 1)
}

function drawRSIPanel(
  ctx: CanvasRenderingContext2D,
  candles: Candle[],
  region: Region,
) {
  const { x: rx, y: ry, w: rw, h: rh } = region
  if (candles.length === 0) return

  const rsi = computeRSI(candles, 14)
  const panelW = rw * LIVE_EDGE_PCT

  // background tint
  ctx.fillStyle = 'rgba(255,255,255,0.015)'
  ctx.fillRect(rx, ry, panelW, rh)

  const yOf = (v: number) => ry + rh - (v / 100) * rh

  // reference lines + labels at 70 / 30
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.moveTo(rx, yOf(70))
  ctx.lineTo(rx + panelW, yOf(70))
  ctx.moveTo(rx, yOf(30))
  ctx.lineTo(rx + panelW, yOf(30))
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textBaseline = 'middle'
  ctx.fillText('70', rx + panelW + 4, yOf(70))
  ctx.fillText('30', rx + panelW + 4, yOf(30))

  // RSI line
  const slot = panelW / candles.length
  const xAt = (i: number) => rx + i * slot + slot / 2

  ctx.strokeStyle = COLORS.rsi
  ctx.lineWidth = 1.4
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  let started = false
  for (let i = 0; i < candles.length; i++) {
    const v = rsi[i]
    if (!Number.isFinite(v)) { started = false; continue }
    if (!started) { ctx.moveTo(xAt(i), yOf(v)); started = true }
    else ctx.lineTo(xAt(i), yOf(v))
  }
  ctx.stroke()
  ctx.globalAlpha = 1

  // panel label
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('RSI 14', rx + 6, ry + 14)
}

function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  mouse: { x: number; y: number } | null,
  region: Region,
  range: Range,
) {
  if (!mouse) return
  const { x: rx, y: ry, w: rw, h: rh } = region
  const { lo, hi } = range
  const panelW = rw * LIVE_EDGE_PCT
  if (mouse.x < rx || mouse.x > rx + panelW) return
  if (mouse.y < ry || mouse.y > ry + rh) return

  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 4])

  ctx.beginPath()
  ctx.moveTo(mouse.x, ry)
  ctx.lineTo(mouse.x, ry + rh)
  ctx.moveTo(rx, mouse.y)
  ctx.lineTo(rx + panelW, mouse.y)
  ctx.stroke()
  ctx.setLineDash([])

  // price label on the right edge of the chart area
  const price = lo + ((ry + rh - mouse.y) / rh) * (hi - lo)
  const text = `$${price.toFixed(2)}`
  const labelW = 56
  const labelX = rx + panelW + 2
  const labelY = mouse.y - 8
  ctx.fillStyle = 'rgba(11,13,18,0.96)'
  ctx.fillRect(labelX, labelY, labelW, 16)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  ctx.strokeRect(labelX, labelY, labelW, 16)
  ctx.fillStyle = '#fff'
  ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, labelX + 6, labelY + 8)
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

// ── Component ──────────────────────────────────────────────────────────

export default function MarketHero() {
  const simRef = useRef<ReturnType<typeof createSimulator> | null>(null)
  const [state, setState] = useState<SimState | null>(null)
  const [now, setNow] = useState<string>('')
  const [enabled, setEnabled] = useState<Set<IndicatorId>>(new Set())
  const enabledRef = useRef<Set<IndicatorId>>(enabled)
  useEffect(() => { enabledRef.current = enabled }, [enabled])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)

  if (!simRef.current) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const visible = isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP
    const sim = createSimulator({
      initialPrice: 412.50,
      // Buffer holds visible + warmup so MA 50 has history from the start.
      candleCount: visible + WARMUP,
      // Slight upward bias so the chart trends up over time.
      drift: 0.06,
    })
    // Fill the entire buffer with synthetic history so first paint shows
    // a full chart with valid MA / VWAP / RSI from the leftmost candle.
    sim.pregenerate(visible + WARMUP)
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

    const draw = (allCandles: Candle[]) => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const isMobile = window.innerWidth < 768
      const visible = isMobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP
      const candles = allCandles.slice(-visible)

      const en = enabledRef.current
      const series: Series = {}
      if (en.has('ma20')) series.ma20 = computeSMA(allCandles, 20).slice(-visible)
      if (en.has('ma50')) series.ma50 = computeSMA(allCandles, 50).slice(-visible)
      if (en.has('vwap')) {
        const { vwap, upper, lower } = computeVWAPWithBands(allCandles, 2)
        series.vwap = vwap.slice(-visible)
        series.vwapUpper = upper.slice(-visible)
        series.vwapLower = lower.slice(-visible)
      }

      const rsiOn = en.has('rsi')
      const mainH = rsiOn ? rect.height * 0.72 : rect.height
      const rsiY = rsiOn ? rect.height * 0.75 : 0
      const rsiH = rsiOn ? rect.height * 0.25 : 0

      const mainRegion: Region = { x: 0, y: 0, w: rect.width, h: mainH }
      const range = computeMainRange(candles, series)
      drawMainPanel(ctx, candles, series, mainRegion, range)
      if (rsiOn) drawRSIPanel(ctx, candles, { x: 0, y: rsiY, w: rect.width, h: rsiH })
      drawCrosshair(ctx, mouseRef.current, mainRegion, range)
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      const snap = simRef.current.getState()
      setState(snap)
      draw(snap.candles)
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

    const LERP = 0.18
    let liveRef: Candle | null = null
    let dispH = 0, dispL = 0, dispC = 0

    const loop = (t: number) => {
      const docVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
      if (inView && docVisible) {
        const next = simRef.current!.tick(t)
        if (next.price !== lastPrice || next.tickIndex !== lastTickIndex) {
          setState({ ...next, bids: [...next.bids], asks: [...next.asks], candles: [...next.candles] })
          lastPrice = next.price
          lastTickIndex = next.tickIndex
        }

        const live = next.candles[next.candles.length - 1]
        if (live !== liveRef) {
          dispH = live.h
          dispL = live.l
          dispC = live.c
          liveRef = live
        } else {
          dispH += (live.h - dispH) * LERP
          dispL += (live.l - dispL) * LERP
          dispC += (live.c - dispC) * LERP
        }

        const drawArr = next.candles.slice(0, -1)
        drawArr.push({ o: live.o, h: dispH, l: dispL, c: dispC, closed: false })

        draw(drawArr)
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

  const toggle = (id: IndicatorId) => {
    setEnabled(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Crosshair mouse handlers — attached to a transparent overlay sized to
  // the canvas. pointer-events-auto on the overlay only; the toggle column
  // sits at a higher z so its buttons stay clickable.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  const handleMouseLeave = () => { mouseRef.current = null }

  return (
    <section className="relative h-[calc(100vh-72px)] mt-[72px] bg-bg-deep overflow-hidden">
      {/* Top strip */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-2.5 text-[10px] uppercase tracking-[2px] text-text-body border-b border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.015)] font-mono"
           aria-hidden="true">
        <span className="flex items-center">
          <span className="text-accent normal-case">$CL</span>
          <span className="mx-3 inline-block w-px h-3 bg-white/15" />
          <span className="text-accent normal-case">{formatPrice(s.price)}</span>
          <span className="mx-3 inline-block w-px h-3 bg-white/15" />
          <span className={deltaPct >= 0 ? 'text-accent' : 'text-[#c97064]'}>
            {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(2)}%
          </span>
        </span>
        <span className="flex items-center gap-2">
          {now}
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent live-pip" />
        </span>
      </div>

      {/* Indicator toggle column */}
      <div className="hidden md:flex absolute top-12 right-4 z-30 flex-col gap-1.5">
        <span className="font-mono text-[9px] text-text-muted tracking-[2px] uppercase mb-1 self-end">
          Indicators
        </span>
        {INDICATORS.map((ind) => {
          const on = enabled.has(ind.id)
          return (
            <button
              key={ind.id}
              onClick={() => toggle(ind.id)}
              aria-pressed={on}
              className={`font-mono text-[9.5px] tracking-[1px] px-2.5 py-1 border rounded-sm transition-colors duration-200 flex items-center gap-2 ${
                on
                  ? 'border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.04)] text-white'
                  : 'border-[rgba(255,255,255,0.08)] text-text-muted hover:text-white hover:border-[rgba(255,255,255,0.18)]'
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: on ? ind.color : 'rgba(255,255,255,0.18)' }}
              />
              {ind.label}
            </button>
          )
        })}
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
            'linear-gradient(rgba(91, 207, 135,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(91, 207, 135,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
        }}
      />

      {/* Chart canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-9 bottom-9 left-2 right-2 md:left-[22%] md:right-0 z-[1] pointer-events-none"
        style={{ width: 'auto', height: 'calc(100% - 4.5rem)' }}
        aria-hidden="true"
      />

      {/* Crosshair mouse-capture overlay — sized to match the canvas, sits
          just above it so we can read cursor position. cursor-crosshair to
          hint at the feature. Toggle column has higher z so it stays
          clickable. */}
      <div
        className="hidden md:block absolute top-9 bottom-9 left-[22%] right-0 z-[3] cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      />

      {/* Bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-2.5 text-[9px] uppercase tracking-[2px] text-text-muted border-t border-[rgba(255,255,255,0.04)] font-mono"
           aria-hidden="true">
        <span>LAST {formatPrice(s.price)} · Spread {s.spread.toFixed(2)}</span>
        <span>SESSION ALIVE</span>
      </div>

      {/* Combined order book ladder (left): asks reversed on top, bids below. */}
      <ul className="hidden md:flex absolute top-9 bottom-9 left-0 w-[22%] z-10 flex-col items-end px-3 py-3 m-0 list-none"
          aria-hidden="true">
        {[...s.asks].reverse().map((lvl, i) => {
          const askIndex = s.asks.length - 1 - i
          return (
            <li
              key={`a-${askIndex}`}
              className={`relative w-full flex justify-between text-[9.5px] font-mono py-[3px] px-[6px] mb-[1px] book-row book-row-ask ${lvl.touched ? 'is-touched' : ''} ${lvl.flashUntil > 0 ? 'is-flashing' : ''}`}
            >
              <span
                className="absolute inset-y-0 left-0 -z-10 book-bar book-bar-ask"
                style={{ width: `${lvl.widthPct * 100}%` }}
              />
              <span className="text-text-body opacity-80">{lvl.size.toLocaleString()}</span>
              <span className="text-[#c97064]">{lvl.price.toFixed(2)}</span>
            </li>
          )
        })}
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
    </section>
  )
}

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
    </section>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'

interface CardState {
  x: number
  y: number
  targetX: number
  targetY: number
}

export default function FloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const projectsWithImages = projects.filter(p => p.image)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const container = containerRef.current
    if (!container) return

    // Wait a frame so the container has real dimensions
    const initTimeout = setTimeout(() => {
      const cards = container.querySelectorAll<HTMLDivElement>('[data-float-card]')
      if (cards.length === 0) return

      const w = container.offsetWidth
      const h = container.offsetHeight
      const cardW = 360
      const cardH = 240

      // Spread cards across a grid to start
      const states: CardState[] = Array.from(cards).map((_, i) => {
        const cols = 3
        const col = i % cols
        const row = Math.floor(i / cols)
        const cellW = (w - cardW) / cols
        const cellH = (h - cardH) / Math.ceil(cards.length / cols)
        const x = col * cellW + Math.random() * cellW * 0.5
        const y = row * cellH + Math.random() * cellH * 0.5

        return { x, y, targetX: x, targetY: y }
      })

      // Apply initial positions immediately
      cards.forEach((card, i) => {
        card.style.transform = `translate(${states[i].x}px, ${states[i].y}px)`
      })

      const pickTargets = () => {
        const cw = container.offsetWidth - cardW
        const ch = container.offsetHeight - cardH
        states.forEach((s) => {
          s.targetX = Math.max(0, Math.min(cw, s.x + (Math.random() - 0.5) * 500))
          s.targetY = Math.max(0, Math.min(ch, s.y + (Math.random() - 0.5) * 350))
        })
      }

      pickTargets()

      let raf: number
      const animate = () => {
        const ease = 0.015
        cards.forEach((card, i) => {
          const s = states[i]
          s.x += (s.targetX - s.x) * ease
          s.y += (s.targetY - s.y) * ease
          card.style.transform = `translate(${s.x}px, ${s.y}px)`
        })
        raf = requestAnimationFrame(animate)
      }

      raf = requestAnimationFrame(animate)
      const interval = setInterval(pickTargets, 2500)

      return () => {
        cancelAnimationFrame(raf)
        clearInterval(interval)
      }
    }, 100)

    return () => clearTimeout(initTimeout)
  }, [mounted, projectsWithImages.length])

  if (!mounted) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {projectsWithImages.map((project) => (
        <div
          key={project.id}
          data-float-card
          className="absolute will-change-transform"
          style={{ top: 0, left: 0 }}
        >
          <div className="relative w-[300px] md:w-[360px] rounded-sm overflow-hidden border border-[rgba(255,255,255,0.05)] opacity-[0.14]">
            <img
              src={project.image}
              alt=""
              className="w-full h-auto object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(14,17,22,0.7) 80%, #0e1116 100%)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { projects } from '@/data/projects'

export default function FloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const animationRef = useRef<number>(0)
  const positionsRef = useRef<{ x: number; y: number; targetX: number; targetY: number; vx: number; vy: number }[]>([])

  const projectsWithImages = projects.filter(p => p.image)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cards = cardsRef.current.filter(Boolean)
    if (cards.length === 0) return

    const containerRect = container.getBoundingClientRect()
    const cardW = 360
    const cardH = 220

    // Initialize positions spread across the container
    positionsRef.current = cards.map((_, i) => {
      const cols = 3
      const rows = Math.ceil(cards.length / cols)
      const col = i % cols
      const row = Math.floor(i / cols)
      const areaW = (containerRect.width - cardW) / cols
      const areaH = (containerRect.height - cardH) / rows
      const x = col * areaW + Math.random() * areaW * 0.6
      const y = row * areaH + Math.random() * areaH * 0.6

      return {
        x, y,
        targetX: x,
        targetY: y,
        vx: 0,
        vy: 0,
      }
    })

    // Apply initial positions
    cards.forEach((card, i) => {
      const pos = positionsRef.current[i]
      card.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    })

    // Pick new random targets periodically
    const pickNewTargets = () => {
      const w = container.offsetWidth - cardW
      const h = container.offsetHeight - cardH
      positionsRef.current.forEach((pos) => {
        // Move to a new random spot within ~200px of current position, clamped to bounds
        pos.targetX = Math.max(0, Math.min(w, pos.x + (Math.random() - 0.5) * 400))
        pos.targetY = Math.max(0, Math.min(h, pos.y + (Math.random() - 0.5) * 300))
      })
    }

    // Animate with easing toward targets
    const animate = () => {
      const ease = 0.008
      cards.forEach((card, i) => {
        const pos = positionsRef.current[i]
        pos.x += (pos.targetX - pos.x) * ease
        pos.y += (pos.targetY - pos.y) * ease
        card.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      })
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate)

    // Pick new targets every 3-5 seconds
    const interval = setInterval(pickNewTargets, 3500)
    pickNewTargets()

    return () => {
      cancelAnimationFrame(animationRef.current)
      clearInterval(interval)
    }
  }, [projectsWithImages.length])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {projectsWithImages.map((project, i) => (
        <div
          key={project.id}
          ref={(el) => { if (el) cardsRef.current[i] = el }}
          className="absolute will-change-transform"
          style={{ top: 0, left: 0 }}
        >
          <div className="relative w-[300px] md:w-[360px] rounded-sm overflow-hidden border border-[rgba(255,255,255,0.04)] opacity-[0.15]">
            <img
              src={project.image}
              alt=""
              className="w-full h-auto object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.7) 80%, #050505 100%)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

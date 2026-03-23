'use client'

import { useEffect, useRef } from 'react'
import { projects } from '@/data/projects'

export default function FloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const projectsWithImages = projects.filter(p => p.image)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cards = Array.from(container.querySelectorAll<HTMLDivElement>('[data-float-card]'))
    if (cards.length === 0) return

    const cardW = 360
    const cardH = 240

    // Get container size, fallback to window if 0
    const getSize = () => ({
      w: Math.max(container.offsetWidth, 800) - cardW,
      h: Math.max(container.offsetHeight, 500) - cardH,
    })

    // Initialize each card at a random position
    const size = getSize()
    const states = cards.map(() => {
      const x = Math.random() * size.w
      const y = Math.random() * size.h
      return { x, y, tx: x, ty: y }
    })

    // Set initial positions
    cards.forEach((card, i) => {
      card.style.transform = `translate(${states[i].x}px, ${states[i].y}px)`
    })

    // Pick new random targets
    const pickTargets = () => {
      const s = getSize()
      states.forEach((st) => {
        st.tx = Math.random() * s.w
        st.ty = Math.random() * s.h
      })
    }

    // Animation loop
    const animate = () => {
      cards.forEach((card, i) => {
        const st = states[i]
        st.x += (st.tx - st.x) * 0.006
        st.y += (st.ty - st.y) * 0.006
        card.style.transform = `translate(${st.x}px, ${st.y}px)`
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    pickTargets()
    rafRef.current = requestAnimationFrame(animate)
    intervalRef.current = setInterval(pickTargets, 4000)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [projectsWithImages.length])

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

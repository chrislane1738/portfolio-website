'use client'

import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (sectionRef.current) {
            const vh = sectionRef.current.offsetHeight
            const progress = Math.min(window.scrollY / vh, 1)
            setScrollProgress(progress)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll thresholds from spec
  const initialsOpacity = Math.max(0, 0.03 - (scrollProgress / 0.3) * 0.03)
  const nameOpacity = scrollProgress < 0.15 ? 0 : Math.min((scrollProgress - 0.15) / 0.3, 1)
  const taglineOpacity = scrollProgress < 0.35 ? 0 : Math.min((scrollProgress - 0.35) / 0.2, 1)
  const lineHeight = scrollProgress < 0.55 ? 0 : Math.min((scrollProgress - 0.55) / 0.25, 1) * 120
  const introOpacity = scrollProgress < 0.6 ? 0 : Math.min((scrollProgress - 0.6) / 0.25, 1)

  return (
    <section ref={sectionRef} className="relative min-h-[200vh] bg-bg-deep">
      {/* Sticky container for the viewport */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ghosted initials */}
        <span
          className="absolute font-serif select-none pointer-events-none"
          style={{
            fontSize: 'clamp(200px, 40vw, 500px)',
            color: `rgba(255, 255, 255, ${initialsOpacity})`,
            letterSpacing: '-5px',
            lineHeight: 1,
          }}
        >
          CL
        </span>

        {/* Name */}
        <h1
          className="font-serif text-[32px] md:text-[40px] text-white tracking-[1px] z-10"
          style={{ opacity: nameOpacity }}
        >
          Chris Lane
        </h1>

        {/* Tagline */}
        <p
          className="font-mono text-[11px] text-accent tracking-[4px] uppercase mt-3 z-10"
          style={{ opacity: taglineOpacity }}
        >
          Finance · Builder · Operator
        </p>

        {/* Vertical line */}
        <div
          className="mt-5 w-[1px] bg-accent z-10"
          style={{
            height: `${lineHeight}px`,
            opacity: lineHeight > 0 ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Intro paragraph */}
        <p
          className="font-mono text-[13px] text-text-subtle max-w-md text-center mt-6 leading-[1.7] z-10 px-4"
          style={{ opacity: introOpacity }}
        >
          A finance student and operator who believes in learning by doing —
          building tools, leading teams, and turning ideas into products.
        </p>
      </div>
    </section>
  )
}

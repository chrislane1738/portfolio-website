'use client'

import Link from 'next/link'
import { projects } from '@/data/projects'

// Fixed positions for floating cards so they don't overlap badly
const cardPositions = [
  { top: '5%', left: '2%', delay: '0s', duration: '11s' },
  { top: '8%', left: '55%', delay: '1.5s', duration: '13s' },
  { top: '30%', left: '35%', delay: '3s', duration: '12s' },
  { top: '25%', left: '70%', delay: '0.8s', duration: '10s' },
  { top: '55%', left: '5%', delay: '2s', duration: '11.5s' },
  { top: '50%', left: '60%', delay: '3.5s', duration: '13.5s' },
  { top: '70%', left: '25%', delay: '1.8s', duration: '10.5s' },
  { top: '72%', left: '65%', delay: '0.3s', duration: '14s' },
]

export default function TimelineTeaser() {
  const projectsWithImages = projects.filter(p => p.image)

  return (
    <section className="relative bg-bg-deep py-24 px-4 overflow-hidden min-h-[80vh]">
      {/* Floating background cards */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {projectsWithImages.map((project, i) => {
          const pos = cardPositions[i % cardPositions.length]
          return (
            <div
              key={project.id}
              className="absolute floating-card"
              style={{
                top: pos.top,
                left: pos.left,
                animationDelay: pos.delay,
                animationDuration: pos.duration,
              }}
            >
              <div className="relative w-[220px] md:w-[280px] rounded-sm overflow-hidden border border-[rgba(255,255,255,0.04)] opacity-[0.18]">
                <img
                  src={project.image}
                  alt=""
                  className="w-full h-auto object-cover"
                />
                {/* Vignette overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.7) 80%, #050505 100%)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Centered content on top */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[50vh]">
        <span className="font-mono text-[10px] text-text-muted tracking-[3px] uppercase mb-4">
          Recent Work
        </span>
        <h2 className="font-serif text-[28px] md:text-[36px] text-white text-center">
          {projects.length} Projects and Counting
        </h2>
        <p className="font-mono text-[13px] text-text-subtle mt-3 text-center max-w-md leading-[1.7]">
          From financial tools to machine learning models. Each one built to solve a real problem.
        </p>
        <Link
          href="/projects"
          className="font-mono text-[12px] text-accent hover:text-white tracking-[1px] transition-colors duration-300 mt-10"
        >
          View all projects →
        </Link>
      </div>
    </section>
  )
}

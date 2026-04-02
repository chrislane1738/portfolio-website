'use client'

import Link from 'next/link'
import { projects } from '@/data/projects'

const projectsWithImages = projects.filter(p => p.image)

const cardConfigs = [
  { top: '3%',  left: '2%',  anim: 'drift1', dur: '25s' },
  { top: '5%',  left: '52%', anim: 'drift2', dur: '30s' },
  { top: '22%', left: '20%', anim: 'drift3', dur: '28s' },
  { top: '18%', left: '62%', anim: 'drift4', dur: '22s' },
  { top: '42%', left: '5%',  anim: 'drift5', dur: '26s' },
  { top: '38%', left: '50%', anim: 'drift6', dur: '32s' },
  { top: '58%', left: '25%', anim: 'drift7', dur: '24s' },
  { top: '55%', left: '65%', anim: 'drift8', dur: '27s' },
  { top: '75%', left: '40%', anim: 'drift1', dur: '29s' },
  { top: '72%', left: '8%',  anim: 'drift3', dur: '26s' },
]

export default function TimelineTeaser() {
  return (
    <section className="relative bg-bg-deep px-4 overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Floating background cards */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {projectsWithImages.map((project, i) => {
          const cfg = cardConfigs[i % cardConfigs.length]
          return (
            <div
              key={project.id}
              className="absolute floating-card"
              style={{
                top: cfg.top,
                left: cfg.left,
                animationDuration: cfg.dur,
                animationDelay: `${i * -3}s`,
              }}
            >
              <div className="relative w-[200px] md:w-[260px] rounded-sm overflow-hidden border border-[rgba(255,255,255,0.06)] opacity-[0.12]">
                <img
                  src={project.image}
                  alt=""
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 35%, rgba(14,17,22,0.65) 75%, #0e1116 100%)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Centered content on top */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
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

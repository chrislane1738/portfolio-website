'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { projects } from '@/data/projects'

export default function TimelineTeaser() {
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.3 }
    )

    nodeRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Show 3 most recent projects
  const teaserProjects = projects.slice(-3).reverse()

  return (
    <section className="relative bg-bg-deep pb-24 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Timeline line */}
        <div className="relative ml-[15%] md:ml-[15%] pl-8">
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent" />

          {teaserProjects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => { nodeRefs.current[i] = el }}
              className="reveal relative mb-12 last:mb-0"
            >
              {/* Node dot */}
              <div className="absolute w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_8px_rgba(91,164,207,0.4)] timeline-node" style={{ left: '-11.5px', top: '6px' }} />

              {/* Content */}
              <span className="font-mono text-[10px] text-text-muted tracking-[2px]">
                {project.year}
              </span>
              <h3 className="font-serif text-[18px] text-white mt-1">
                {project.title}
              </h3>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-16 text-center">
          <Link
            href="/projects"
            className="font-mono text-[12px] text-accent hover:text-white tracking-[1px] transition-colors duration-300"
          >
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { publicProjects, privateProjects } from '@/data/projects'
import ProjectNode from './ProjectNode'
import SectionDivider from './SectionDivider'

export default function ProjectTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Activate the timeline node dot
            const node = entry.target.querySelector('.timeline-node')
            if (node) node.classList.add('active')
          }
        })
      },
      { threshold: 0.2 }
    )

    const reveals = containerRef.current.querySelectorAll('.reveal')
    reveals.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  let globalIndex = 0

  return (
    <div ref={containerRef}>
      {/* Timeline line container */}
      <div className="relative ml-[5%] md:ml-[15%] pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent opacity-30" />

        {/* Public section */}
        <SectionDivider label="// PUBLIC" />
        {publicProjects.map((project) => {
          const idx = globalIndex++
          return <ProjectNode key={project.id} project={project} index={idx} />
        })}

        {/* Private section */}
        <SectionDivider label="// PRIVATE" />
        {privateProjects.map((project) => {
          const idx = globalIndex++
          return <ProjectNode key={project.id} project={project} index={idx} />
        })}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { projects } from '@/data/projects'
import ProjectNode from './ProjectNode'

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

  return (
    <div ref={containerRef}>
      {/* Timeline line container */}
      <div className="relative ml-[5%] md:ml-[15%] pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent opacity-30" />

        {projects.map((project, index) => (
          <ProjectNode key={project.id} project={project} index={index} />
        ))}
      </div>
    </div>
  )
}

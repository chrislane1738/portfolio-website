'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { projects, type Project } from '@/data/projects'
import ProjectNode from './ProjectNode'
import ProjectModal from './ProjectModal'
import FavoritesFilterButton from './FavoritesFilterButton'

export default function ProjectTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const visibleProjects = useMemo(
    () => (favoritesOnly ? projects.filter((p) => p.favorite) : projects),
    [favoritesOnly]
  )

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
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
  }, [visibleProjects])

  return (
    <>
      <FavoritesFilterButton
        active={favoritesOnly}
        onToggle={() => setFavoritesOnly((v) => !v)}
      />
      <div ref={containerRef}>
        {/* Timeline line container */}
        <div className="relative ml-[5%] md:ml-[15%] pl-8">
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent opacity-30" />

          {visibleProjects.map((project, index) => (
            <ProjectNode
              key={project.id}
              project={project}
              index={index}
              onExpand={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </div>
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  )
}

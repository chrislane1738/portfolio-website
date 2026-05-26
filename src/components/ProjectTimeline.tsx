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
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  const visibleProjects = useMemo(
    () => (favoritesOnly ? projects.filter((p) => p.favorite) : projects),
    [favoritesOnly]
  )

  const handleToggleFavorites = () => {
    setFavoritesOnly((v) => {
      const next = !v
      const text = next ? 'Favorites only' : 'Showing all projects'
      setToast({ text, key: Date.now() })
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = window.setTimeout(() => setToast(null), 1500)
      return next
    })
  }

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
  }, [])

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
        onToggle={handleToggleFavorites}
      />
      {toast && (
        <div
          key={toast.key}
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 bottom-10 z-40 pointer-events-none font-mono text-[11px] tracking-[2px] uppercase text-accent bg-[rgba(11,13,18,0.92)] border border-accent/30 px-4 py-2 rounded-sm shadow-[0_0_24px_rgba(91,207,135,0.18)] favorites-toast"
        >
          {toast.text}
        </div>
      )}
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

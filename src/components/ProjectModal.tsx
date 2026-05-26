'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { Project } from '@/data/projects'

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!project) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [project, onClose])

  if (!project) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 modal-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div
        className="relative w-full max-w-[1400px] h-[88vh] overflow-hidden rounded-sm border border-[rgba(255,255,255,0.08)] shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background image */}
        {project.image && (
          <div className="absolute inset-0 z-0">
            <img
              src={project.image}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Left-side dark gradient so the text panel reads well */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(14,17,22,0.92) 0%, rgba(14,17,22,0.55) 45%, rgba(14,17,22,0.15) 75%, transparent 100%)',
              }}
            />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Text content on the left */}
        <div className="relative z-10 h-full flex items-center px-6 md:px-12 py-8">
          <div className="bg-[rgba(8,8,8,0.72)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-sm p-6 md:p-9 max-w-[520px]">
            <span className="font-mono text-[10px] text-text-muted tracking-[2px]">
              {project.year}
            </span>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h2 className="font-serif text-[26px] md:text-[30px] text-white leading-tight">
                {project.title}
              </h2>
              <span className="font-mono text-[9px] text-accent border border-[rgba(91, 207, 135,0.3)] px-2 py-[2px] tracking-[1px] whitespace-nowrap">
                {project.visibility}
              </span>
            </div>

            <p className="font-mono text-[12.5px] text-text-secondary leading-[1.8] mt-4">
              {project.description}
            </p>

            {project.tech && (
              <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[1px]">
                {project.tech.join(' · ')}
              </p>
            )}

            {project.link && (
              project.link.external ? (
                <a
                  href={project.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-mono text-[11px] text-accent hover:text-white hover:bg-accent/10 transition-colors duration-300 mt-6 border border-[rgba(91, 207, 135,0.35)] px-4 py-2"
                >
                  {project.link.label} →
                </a>
              ) : (
                <Link
                  href={project.link.url}
                  onClick={onClose}
                  className="inline-block font-mono text-[11px] text-accent hover:text-white hover:bg-accent/10 transition-colors duration-300 mt-6 border border-[rgba(91, 207, 135,0.35)] px-4 py-2"
                >
                  {project.link.label} →
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

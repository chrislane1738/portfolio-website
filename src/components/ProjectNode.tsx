import Link from 'next/link'
import type { Project } from '@/data/projects'

export default function ProjectNode({
  project,
  index,
  onExpand,
}: {
  project: Project
  index: number
  onExpand?: () => void
}) {
  const offset = index % 2 === 1 ? 'ml-6' : 'ml-0'

  return (
    <div className={`reveal relative mb-16 last:mb-0 ${offset}`}>
      {/* Node dot */}
      <div
        className="absolute w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_8px_rgba(91, 207, 135,0.4)] timeline-node"
        style={{ left: '-11.5px', top: '8px' }}
      />

      {/* Favorite star */}
      {project.favorite && (
        <div
          className="absolute text-accent"
          style={{ left: '-40px', top: '2px' }}
          aria-label="Favorite project"
          title="Favorite"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(91, 207, 135,0.5))' }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}

      {/* Card with background image */}
      <div
        onClick={onExpand}
        role={onExpand ? 'button' : undefined}
        tabIndex={onExpand ? 0 : undefined}
        onKeyDown={(e) => {
          if (onExpand && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onExpand()
          }
        }}
        className="group relative overflow-hidden rounded-sm border border-[rgba(255,255,255,0.04)] hover:border-[rgba(91, 207, 135,0.25)] transition-colors duration-300 cursor-pointer"
      >
        {/* Faded background image with vignette */}
        {project.image && (
          <div className="absolute inset-0 z-0">
            <img
              src={project.image}
              alt=""
              className="w-full h-full object-cover opacity-[0.55]"
            />
            {/* Vignette overlay — radial gradient from transparent center to dark edges */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 60%, rgba(14,17,22,0.35) 85%, #0e1116 100%)',
              }}
            />
            {/* Bottom fade for clean blending */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, transparent 75%, #0e1116 100%)',
              }}
            />
          </div>
        )}

        {/* Expand hint */}
        <span className="absolute top-3 right-3 z-20 font-mono text-[9px] text-text-body opacity-0 group-hover:opacity-100 tracking-[2px] uppercase transition-opacity duration-300 pointer-events-none flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9V13H7M13 7V3H9M3 13L7 9M13 3L9 7" />
          </svg>
          Expand
        </span>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 min-h-[180px] flex flex-col justify-end">
          {/* Solid text backing */}
          <div className="bg-[rgba(8,8,8,0.85)] rounded-sm px-5 py-4 inline-block self-start max-w-lg">
            {/* Year label */}
            <span className="font-mono text-[10px] text-text-muted tracking-[2px]">
              {project.year}
            </span>

            {/* Title + visibility label */}
            <div className="flex items-center gap-3 mt-1">
              <h3 className="font-serif text-[20px] md:text-[22px] text-white">
                {project.title}
              </h3>
              <span className="font-mono text-[9px] text-accent border border-[rgba(91, 207, 135,0.2)] px-2 py-[2px] tracking-[1px] whitespace-nowrap">
                {project.visibility}
              </span>
            </div>

            {/* Description */}
            <p className="font-mono text-[12px] text-text-body leading-[1.7] mt-2">
              {project.description}
            </p>

            {/* Tech tags */}
            {project.tech && (
              <p className="font-mono text-[10px] text-text-muted mt-2">
                {project.tech.join(' · ')}
              </p>
            )}

            {/* Link */}
            {project.link && (
              project.link.external ? (
                <a
                  href={project.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block font-mono text-[11px] text-accent hover:text-white transition-colors duration-300 mt-3"
                >
                  {project.link.label} →
                </a>
              ) : (
                <Link
                  href={project.link.url}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block font-mono text-[11px] text-accent hover:text-white transition-colors duration-300 mt-3"
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

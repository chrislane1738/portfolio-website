import Link from 'next/link'
import type { Project } from '@/data/projects'

export default function ProjectNode({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const offset = index % 2 === 1 ? 'ml-6' : 'ml-0'

  return (
    <div className={`reveal relative mb-16 last:mb-0 ${offset}`}>
      {/* Node dot */}
      <div
        className="absolute w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_8px_rgba(91,164,207,0.4)] timeline-node"
        style={{ left: '-11.5px', top: '8px' }}
      />

      {/* Card with background image */}
      <div className="relative overflow-hidden rounded-sm border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] transition-colors duration-300">
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
              <span className="font-mono text-[9px] text-accent border border-[rgba(91,164,207,0.2)] px-2 py-[2px] tracking-[1px] whitespace-nowrap">
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
                  className="inline-block font-mono text-[11px] text-accent hover:text-white transition-colors duration-300 mt-3"
                >
                  {project.link.label} →
                </a>
              ) : (
                <Link
                  href={project.link.url}
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

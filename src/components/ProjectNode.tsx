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
      <p className="font-mono text-[12px] text-text-body leading-[1.7] mt-2 max-w-lg">
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
  )
}

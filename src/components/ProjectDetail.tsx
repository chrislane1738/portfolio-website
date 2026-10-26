import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/data/projects'
import { TAG_LABELS, formatProjectDate } from '@/lib/projects'

const LINK_CLASS =
  'mt-6 inline-flex items-center gap-1.5 text-[14px] text-text-primary border-b border-accent/40 pb-0.5 hover:border-accent transition-colors duration-200'

export default function ProjectDetail({ project }: { project: Project }) {
  const { image, link, tech } = project

  return (
    <article>
      {image && (
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-hairline bg-bg-elevated mb-6">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover object-top"
          />
        </div>
      )}

      <h2 className="font-display font-semibold text-[22px] md:text-[26px] text-text-primary tracking-[-0.015em] leading-tight">
        {project.title}
      </h2>
      <p className="mt-1.5 text-[13px] text-text-subtle">
        {formatProjectDate(project.date)} · {TAG_LABELS[project.tag]}
        {project.org && ` · Internal · ${project.org}`}
      </p>

      <p className="mt-4 text-[15px] leading-relaxed text-text-body">{project.description}</p>

      {tech && tech.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {tech.map(t => (
            <li key={t} className="rounded-md border border-hairline px-2 py-0.5 text-[12px] text-text-subtle">
              {t}
            </li>
          ))}
        </ul>
      )}

      {link &&
        (link.external ? (
          <a href={link.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            {link.label} <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <Link href={link.url} className={LINK_CLASS}>
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        ))}
    </article>
  )
}

'use client'

import Link from 'next/link'
import { projects } from '@/data/projects'

export default function TimelineTeaser() {
  return (
    <section className="relative bg-bg-deep py-32 px-4 min-h-[80vh]">
      {/* Centered content on top */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="font-mono text-[10px] text-text-muted tracking-[3px] uppercase mb-4">
          Recent Work
        </span>
        <h2 className="font-serif text-[28px] md:text-[36px] text-white text-center">
          {projects.length} Projects and Counting
        </h2>
        <p className="font-mono text-[13px] text-text-subtle mt-3 text-center max-w-md leading-[1.7]">
          From financial tools to machine learning models. Each one built to solve a real problem.
        </p>
        <Link
          href="/projects"
          className="font-mono text-[12px] text-accent hover:text-white tracking-[1px] transition-colors duration-300 mt-10"
        >
          View all projects →
        </Link>
      </div>
    </section>
  )
}

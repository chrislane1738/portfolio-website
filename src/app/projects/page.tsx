import ProjectTimeline from '@/components/ProjectTimeline'

export default function ProjectsPage() {
  return (
    <section className="bg-bg-base pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        {/* Page header */}
        <div className="mb-16 md:mb-20">
          <span className="font-mono text-[10px] text-accent tracking-[3px] uppercase">
            PROJECTS
          </span>
          <h1 className="font-serif text-[36px] text-white mt-2">
            What I&apos;ve Built
          </h1>
          <p className="font-mono text-[13px] text-text-subtle mt-3 max-w-lg leading-[1.7]">
            Tools, platforms, and experiments. Built to learn, built to ship.
          </p>
        </div>

        {/* Timeline */}
        <ProjectTimeline />
      </div>
    </section>
  )
}

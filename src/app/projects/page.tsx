import ProjectIndex from '@/components/ProjectIndex'

export default function ProjectsPage() {
  return (
    <section className="px-6 md:px-12 pt-24 md:pt-28 pb-16 md:pb-10 md:h-[100svh] flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-1 md:min-h-0">
        <h1 className="font-display font-bold text-[32px] md:text-[40px] tracking-[-0.02em] text-text-primary mb-6">
          Projects
        </h1>
        <ProjectIndex />
      </div>
    </section>
  )
}

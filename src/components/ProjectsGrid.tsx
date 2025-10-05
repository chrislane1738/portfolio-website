import ProjectCard from './ProjectCard'

interface Project {
  title: string
  imageUrl: string
  link: string
}

export default function ProjectsGrid() {
  const projects: Project[] = [
    {
      title: 'Compound Interest Calculator',
      imageUrl: '/calculator-preview.png',
      link: '/calculator'
    },
    {
      title: 'Graham Intrinsic Value Screener',
      imageUrl: '/graham-screener-preview.png',
      link: '/graham-screener'
    }
  ]

  return (
    <section id="projects" className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          My Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              imageUrl={project.imageUrl}
              link={project.link}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

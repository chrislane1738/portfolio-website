import ProjectCard from './ProjectCard'

interface Project {
  title: string
  imageUrl: string
  link: string
}

export default function ProjectsGrid() {
  const projects: Project[] = [
    {
      title: 'Financial Dashboard',
      imageUrl: 'https://placehold.co/600x400/1f2937/ffffff?text=Financial+Dashboard',
      link: '#'
    },
    {
      title: 'Trading Bot',
      imageUrl: 'https://placehold.co/600x400/374151/ffffff?text=Trading+Bot',
      link: '#'
    },
    {
      title: 'Portfolio Tracker',
      imageUrl: 'https://placehold.co/600x400/4b5563/ffffff?text=Portfolio+Tracker',
      link: '#'
    },
    {
      title: 'Market Analysis Tool',
      imageUrl: 'https://placehold.co/600x400/6b7280/ffffff?text=Market+Analysis',
      link: '#'
    },
    {
      title: 'Investment Calculator',
      imageUrl: 'https://placehold.co/600x400/9ca3af/ffffff?text=Investment+Calculator',
      link: '#'
    },
    {
      title: 'Risk Assessment App',
      imageUrl: 'https://placehold.co/600x400/d1d5db/1f2937?text=Risk+Assessment',
      link: '#'
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

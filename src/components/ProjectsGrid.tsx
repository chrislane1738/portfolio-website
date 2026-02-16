import ProjectCard from './ProjectCard'

interface Project {
  title: string
  imageUrl: string
  link: string
  external?: boolean
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
      imageUrl: '/benjamin-graham.jpg',
      link: '/graham-screener'
    },
    {
      title: 'P/E Comparative Analysis',
      imageUrl: '/pe-comparable.png',
      link: '/pe-analyzer'
    },
    {
      title: 'Portfolio Builder Dashboard',
      imageUrl: '/Portfolio-builder.png',
      link: 'https://personalanalytics-juf6xlhx6valr7qpabuupu.streamlit.app/',
      external: true
    },
    {
      title: 'Delta Fightwear',
      imageUrl: '/delta_fightwear.png',
      link: 'https://deltafightwear.com/',
      external: true
    }
  ]

  return (
    <section id="projects" className="pt-32 pb-16 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          My Projects
        </h2>
        {/* Featured Project */}
        <div className="flex justify-center mb-8">
          <a
            href="https://vikingfunddashboard.streamlit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-[60%] group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vfc_slide_banner.png"
              alt="VFC Research Dashboard"
              className="w-full h-auto block"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-2xl md:text-3xl font-bold text-center px-4 group-hover:text-yellow-300 transition-colors duration-300">
                VFC Research Dashboard
              </h3>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.link}
              title={project.title}
              imageUrl={project.imageUrl}
              link={project.link}
              external={project.external}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

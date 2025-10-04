interface ProjectCardProps {
  title: string
  imageUrl: string
  link: string
}

export default function ProjectCard({ title, imageUrl, link }: ProjectCardProps) {
  return (
    <a
      href={link}
      className="block group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      <div
        className="h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-white text-xl font-bold text-center px-4 group-hover:text-yellow-300 transition-colors duration-300">
            {title}
          </h3>
        </div>
      </div>
    </a>
  )
}

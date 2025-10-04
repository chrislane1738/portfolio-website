import Hero from '@/components/Hero'
import ProjectsGrid from '@/components/ProjectsGrid'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <Hero />
        <ProjectsGrid />
      </div>
    </main>
  )
}

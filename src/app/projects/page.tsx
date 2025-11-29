import Header from '@/components/Header'
import ProjectsGrid from '@/components/ProjectsGrid'
import Contact from '@/components/Contact'

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <ProjectsGrid />
      <Contact />
    </main>
  )
}


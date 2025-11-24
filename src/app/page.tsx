import Header from '@/components/Header'
import FeaturedProject from '@/components/FeaturedProject'
import ProjectsGrid from '@/components/ProjectsGrid'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <FeaturedProject />
      <ProjectsGrid />
      <Contact />
    </main>
  )
}

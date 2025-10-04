import Header from '@/components/Header'
import About from '@/components/About'
import ProjectsGrid from '@/components/ProjectsGrid'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <About />
      <ProjectsGrid />
      <Contact />
    </main>
  )
}

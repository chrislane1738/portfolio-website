import Header from '@/components/Header'
import About from '@/components/About'
import Contact from '@/components/Contact'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <div className="pt-20">
        <About />
      </div>
      <Contact />
    </main>
  )
}

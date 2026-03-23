import Hero from '@/components/Hero'
import TimelineTeaser from '@/components/TimelineTeaser'
import FloatingCards from '@/components/FloatingCards'

export default function Home() {
  return (
    <>
      <Hero />
      {/* Floating cards region — covers the gap between hero and teaser text */}
      <div className="relative bg-bg-deep min-h-[80vh]">
        <FloatingCards />
        <TimelineTeaser />
      </div>
    </>
  )
}

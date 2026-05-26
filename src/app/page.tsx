import MarketHero from '@/components/MarketHero'
import TimelineTeaser from '@/components/TimelineTeaser'

export default function Home() {
  return (
    <>
      <MarketHero />
      {/* Intro banner — sits between the hero and the project teaser so it
          doesn't compete with the chart for the middle of the viewport. */}
      <section className="bg-bg-deep px-4 py-16 border-t border-[rgba(255,255,255,0.04)]">
        <p className="font-mono text-[14px] md:text-[15px] text-white max-w-2xl mx-auto text-center leading-[1.8]">
          A finance student and operator who believes in learning by doing.
          Building tools, leading teams, and turning ideas into products.
        </p>
      </section>
      <TimelineTeaser />
    </>
  )
}

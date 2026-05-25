'use client'

export default function MarketHero() {
  return (
    <section className="relative h-screen bg-bg-deep overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(91,164,207,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(91,164,207,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
        }}
      />

      {/* Center column — name + tagline + line + intro */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
        <h1 className="font-serif text-[32px] md:text-[40px] text-white tracking-[1px]">
          Chris Lane
        </h1>
        <p className="font-mono text-[11px] text-accent tracking-[4px] uppercase mt-3">
          Finance · Builder · Operator
        </p>
        <div className="mt-5 w-[1px] h-[120px] bg-accent opacity-80" />
        <p className="font-mono text-[13px] text-text-subtle max-w-md text-center mt-6 leading-[1.7]">
          A finance student and operator who believes in learning by doing.
          Building tools, leading teams, and turning ideas into products.
        </p>
      </div>
    </section>
  )
}

import Link from 'next/link'

const TOOLS = [
  {
    title: 'Graham Intrinsic Value Screener',
    description:
      'Value stocks the Graham way. Screen for margin of safety with classic intrinsic-value formulas.',
    tags: ['Valuation', 'Screening'],
    href: '/graham-screener',
  },
  {
    title: 'P/E Comparative Analysis',
    description:
      'Compare P/E ratios across peers and spot who is cheap relative to the market.',
    tags: ['Multiples', 'Comps'],
    href: '/pe-analyzer',
  },
  {
    title: 'Compound Interest Calculator',
    description:
      'See what time and compounding do to a portfolio, with interactive charts.',
    tags: ['Compounding', 'Charts'],
    href: '/calculator',
  },
]

export default function FeaturedTools() {
  return (
    <section className="bg-bg-base px-6 md:px-16 py-24 border-t border-[rgba(255,255,255,0.04)]">
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-[11px] tracking-[3px] text-accent uppercase mb-4">
          Featured Tools
        </p>
        <h2 className="font-serif text-[36px] md:text-[48px] text-white leading-[1.1]">
          Built to be used.
        </h2>
        <p className="font-mono text-[13px] text-text-body mt-4 leading-[1.8]">
          Real tools, not screenshots. Every one of these runs live.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block border border-white/[0.08] bg-white/[0.02] p-8 transition-colors duration-300 hover:border-accent"
            >
              <h3 className="font-serif text-[22px] text-white leading-snug">
                {tool.title}
              </h3>
              <p className="text-text-body text-[14px] mt-3 leading-[1.7]">
                {tool.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] tracking-[1px] text-text-muted border border-white/[0.08] px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[12px] text-accent tracking-[1px] mt-6 inline-block group-hover:text-white transition-colors duration-300">
                Try it →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

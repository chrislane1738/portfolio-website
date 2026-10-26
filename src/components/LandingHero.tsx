import Image from 'next/image'

// Fade the jacket out at the bottom and soften the cropped left/right edges.
const PHOTO_MASK = {
  maskImage:
    'linear-gradient(to bottom, black 58%, transparent 94%), linear-gradient(to right, transparent 2%, black 22%, black 78%, transparent 98%)',
  maskComposite: 'intersect',
  WebkitMaskImage:
    'linear-gradient(to bottom, black 58%, transparent 94%), linear-gradient(to right, transparent 2%, black 22%, black 78%, transparent 98%)',
  WebkitMaskComposite: 'source-in',
} as const

export default function LandingHero() {
  return (
    <section className="flex-1 flex items-center px-6 md:px-12 pt-24 pb-12 md:py-0 min-h-[100svh]">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-10 md:gap-8">
        {/* Photo: first on mobile, right column on desktop */}
        <div className="hero-in relative md:order-2 w-[64vw] max-w-[300px] md:w-full md:max-w-[480px] mx-auto md:mr-0">
          <div
            aria-hidden="true"
            className="absolute inset-[-12%] rounded-full bg-[radial-gradient(closest-side,rgba(163,172,217,0.14),transparent)]"
          />
          <Image
            src="/headshot.png"
            alt="Christopher Lane"
            width={800}
            height={800}
            priority
            sizes="(min-width: 768px) 480px, 64vw"
            className="relative w-full h-auto"
            style={PHOTO_MASK}
          />
        </div>

        <div className="hero-in md:order-1 [animation-delay:120ms]">
          <h1 className="font-display font-bold text-text-primary tracking-[-0.03em] leading-[0.95] text-[44px] sm:text-[60px] md:text-[76px] lg:text-[88px]">
            Christopher Lane
          </h1>
          <div className="mt-6 md:mt-8 space-y-1.5 text-text-body text-[15px] md:text-[18px] leading-relaxed">
            <p>
              <span className="whitespace-nowrap">Diablo Valley College →</span>{' '}
              <span className="whitespace-nowrap">Santa Clara University</span>
            </p>
            <p>Private Equity at TeedUp</p>
          </div>
        </div>
      </div>
    </section>
  )
}

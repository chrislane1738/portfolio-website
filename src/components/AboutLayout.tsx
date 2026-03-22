'use client'

import { useEffect, useRef } from 'react'

export default function AboutLayout() {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.2 }
    )

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex flex-col md:flex-row gap-12 md:gap-16">
        {/* Photo — left column */}
        <div className="md:w-[40%] shrink-0">
          <div className="relative border border-accent-dim overflow-hidden">
            <img
              src="/about-headshot.jpg"
              alt="Chris Lane"
              className="w-full h-auto max-h-[400px] md:max-h-[500px] object-cover"
            />
          </div>
        </div>

        {/* Text — right column */}
        <div className="md:w-[60%]">
          <span className="font-mono text-[10px] text-accent tracking-[3px] uppercase">
            ABOUT
          </span>
          <h1 className="font-serif text-[36px] text-white mt-2">
            Chris Lane
          </h1>
          <p className="font-mono text-[13px] text-text-subtle mt-2">
            Finance student. Builder. Operator.
          </p>

          {/* Finance */}
          <div
            ref={(el) => { revealRefs.current[0] = el }}
            className="reveal mt-10"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Finance</h2>
            <p className="font-mono text-[13px] text-text-body leading-[1.8]">
              Obsessed with fundamental analysis and leveraging AI for deeper market
              insights. I&apos;ve managed a personal long-term portfolio since age 18,
              building tools along the way to sharpen my process — from Graham-style
              screeners to P/E comparison engines.
            </p>
          </div>

          {/* Building */}
          <div
            ref={(el) => { revealRefs.current[1] = el }}
            className="reveal mt-8"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Building</h2>
            <p className="font-mono text-[13px] text-text-body leading-[1.8]">
              Currently building Stralane, an investing platform for retail investors
              in a developing beta. Every tool on this site started as a problem I
              wanted to solve — the best way to learn is to ship something real.
            </p>
          </div>

          {/* Leadership */}
          <div
            ref={(el) => { revealRefs.current[2] = el }}
            className="reveal mt-8"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Leadership</h2>
            <p className="font-mono text-[13px] text-text-body leading-[1.8]">
              From the DVC Foundation to founding the Viking Fund Club, I&apos;m
              passionate about building platforms that help others succeed —
              spearheading digital transformation for non-profits and creating
              sustainable value through community.
            </p>
          </div>

          {/* Personal interests */}
          <div
            ref={(el) => { revealRefs.current[3] = el }}
            className="reveal mt-10"
          >
            <h2 className="font-serif text-[18px] text-white mb-3">Outside of Work</h2>
            <p className="font-mono text-[12px] text-text-subtle leading-[1.8]">
              On the mats practicing jiu-jitsu, bouldering, or playing a (likely
              losing) hand of poker. Always happy to talk markets, tech, and strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

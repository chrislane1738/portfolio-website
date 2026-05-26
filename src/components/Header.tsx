'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change.
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Prevent body scroll while the mobile overlay is open.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const prev = document.body.style.overflow
    document.body.style.overflow = menuOpen ? 'hidden' : prev
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 bg-[rgba(11,13,18,0.92)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)]">
        {/* Mobile: name left with tagline stacked beside it, hamburger right */}
        <div className="flex md:hidden items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="font-serif text-[22px] text-white tracking-[1px] leading-none">
              Chris Lane
            </span>
            <span className="font-mono text-[8px] text-accent tracking-[2px] uppercase leading-[1.35] flex flex-col">
              <span>Finance</span>
              <span>Builder</span>
              <span>Operator</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="relative z-50 w-9 h-9 flex flex-col justify-center items-center gap-[5px] text-white"
          >
            <span className={`block w-5 h-[1.5px] bg-current transition-transform duration-300 ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-transform duration-300 ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Desktop: centered title + tagline with right-side nav */}
        <div className="hidden md:grid md:grid-cols-3 items-center">
          <div />
          <Link href="/" className="flex flex-col items-center group">
            <span className="font-serif text-[22px] md:text-[26px] text-white tracking-[1px] leading-tight">
              Chris Lane
            </span>
            <span className="font-mono text-[9px] text-accent tracking-[3px] uppercase mt-1">
              Finance · Builder · Operator
            </span>
          </Link>
          <div className="flex items-center gap-6 justify-self-end">
            <Link
              href="/projects"
              className={`font-mono text-[11px] tracking-[1px] transition-colors duration-300 ${
                pathname === '/projects' ? 'text-accent' : 'text-text-body hover:text-white'
              }`}
            >
              Projects
            </Link>
            <Link
              href="/about"
              className={`font-mono text-[11px] tracking-[1px] transition-colors duration-300 ${
                pathname === '/about' ? 'text-accent' : 'text-text-body hover:text-white'
              }`}
            >
              About
            </Link>
            <a
              href="mailto:chrislane1738@gmail.com"
              className="font-mono text-[10px] text-accent tracking-[1px] px-3 py-1 border border-[rgba(91, 207, 135,0.3)] hover:bg-[rgba(91, 207, 135,0.05)] hover:border-accent transition-all duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-[rgba(11,13,18,0.98)] backdrop-blur-md transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col items-center justify-center h-full gap-10 px-6">
          <Link
            href="/projects"
            onClick={() => setMenuOpen(false)}
            className={`font-serif text-[36px] tracking-[1px] transition-colors duration-200 ${
              pathname === '/projects' ? 'text-accent' : 'text-white hover:text-accent'
            }`}
          >
            Projects
          </Link>
          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className={`font-serif text-[36px] tracking-[1px] transition-colors duration-200 ${
              pathname === '/about' ? 'text-accent' : 'text-white hover:text-accent'
            }`}
          >
            About
          </Link>
          <a
            href="mailto:chrislane1738@gmail.com"
            onClick={() => setMenuOpen(false)}
            className="font-mono text-[13px] text-accent tracking-[2px] uppercase px-6 py-3 border border-[rgba(91,207,135,0.4)] hover:bg-[rgba(91,207,135,0.06)]"
          >
            Contact
          </a>
        </div>
      </div>
    </>
  )
}

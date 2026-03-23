'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(11,13,18,0.92)] border-b border-[rgba(255,255,255,0.06)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex justify-between items-center py-[14px]">
        {/* Left: Name + Tagline */}
        <Link href="/" className="flex items-center gap-4 group">
          <span className="font-serif text-[15px] text-white group-hover:text-accent transition-colors duration-300">
            Chris Lane
          </span>
          <span className="hidden md:block w-[1px] h-[14px] bg-[rgba(255,255,255,0.08)]" />
          <span className="hidden md:block font-mono text-[9px] text-text-muted tracking-[2px] uppercase">
            Finance · Builder · Operator
          </span>
        </Link>

        {/* Right: Nav links + Contact button */}
        <div className="flex items-center gap-6">
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
            className="font-mono text-[10px] text-accent tracking-[1px] px-3 py-1 border border-[rgba(91,164,207,0.3)] hover:bg-[rgba(91,164,207,0.05)] hover:border-accent transition-all duration-300"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  )
}

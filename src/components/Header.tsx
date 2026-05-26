'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-[rgba(11,13,18,0.92)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)]">
      <div className="grid grid-cols-3 items-center">
        {/* Left: empty */}
        <div />

        {/* Center: title + tagline */}
        <Link href="/" className="flex flex-col items-center group">
          <span className="font-serif text-[22px] md:text-[26px] text-white group-hover:text-accent transition-colors duration-300 tracking-[1px] leading-tight">
            Chris Lane
          </span>
          <span className="font-mono text-[9px] text-accent tracking-[3px] uppercase mt-1">
            Finance · Builder · Operator
          </span>
        </Link>

        {/* Right: Nav links + Contact button */}
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
  )
}

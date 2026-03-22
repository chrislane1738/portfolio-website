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
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(5,5,5,0.92)] border-b border-[rgba(255,255,255,0.06)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="font-mono text-[12px] font-medium text-white tracking-wide hover:text-accent transition-colors duration-300"
        >
          Chris Lane
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/projects"
            className={`font-mono text-[12px] tracking-wide transition-colors duration-300 ${
              pathname === '/projects' ? 'text-accent' : 'text-text-body hover:text-white'
            }`}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className={`font-mono text-[12px] tracking-wide transition-colors duration-300 ${
              pathname === '/about' ? 'text-accent' : 'text-text-body hover:text-white'
            }`}
          >
            About
          </Link>
          <a
            href="mailto:chrislane1738@gmail.com"
            className="text-white hover:text-accent transition-colors duration-300 text-[14px]"
            aria-label="Email"
          >
            ✉
          </a>
        </div>
      </div>
    </nav>
  )
}

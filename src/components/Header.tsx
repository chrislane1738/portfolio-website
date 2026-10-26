'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV = [
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: 'mailto:chrislane1738@gmail.com' },
]

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

  const linkClass = (href: string) =>
    `transition-colors duration-200 ${
      pathname === href ? 'text-text-primary' : 'text-text-body hover:text-text-primary'
    }`

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(15,18,24,0.85)] backdrop-blur-md border-b border-hairline">
        <div className="px-6 md:px-12">
          <div className="max-w-6xl mx-auto h-14 flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="font-display font-semibold text-[15px] text-text-primary tracking-[-0.01em]"
            >
              Christopher Lane
            </Link>
  
            <div className="hidden md:flex items-center gap-8 text-[14px]">
              {NAV.map(item => (
                <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                  {item.label}
                </Link>
              ))}
            </div>
  
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden relative z-50 w-9 h-9 -mr-2 flex flex-col justify-center items-center gap-[5px] text-text-primary"
            >
              <span className={`block w-5 h-[1.5px] bg-current transition-transform duration-300 ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-current transition-transform duration-300 ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
            </button>
        </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-bg-base transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col justify-center h-full gap-6 px-6">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`font-display font-bold text-[40px] tracking-[-0.02em] transition-colors duration-200 ${
                pathname === item.href ? 'text-accent' : 'text-text-primary hover:text-accent'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

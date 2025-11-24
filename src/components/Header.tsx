'use client'

import { useState, useEffect, useRef } from 'react'

export default function Header() {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleAbout = () => {
    setIsAboutOpen(!isAboutOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAboutOpen(false)
      }
    }

    if (isAboutOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAboutOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center relative">
          <div className="text-2xl font-bold text-white">
            Chris Lane
          </div>
          <div className="flex space-x-6 relative" ref={dropdownRef}>
            <button
              onClick={toggleAbout}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              About
            </button>
            {isAboutOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 z-50">
                <h3 className="text-2xl font-bold text-white mb-4">
                  About Me
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  I&apos;m just a finance student at community college looking deeper into coding and AI. 
                  I&apos;ve always been scared of trying new things; especially things where I feel like I&apos;d 
                  sound stupid if I did try them. To overcome this, as well as an attempt to learn more 
                  about coding, I made this website (per a friend&apos;s recommendation). Please, view some 
                  projects I&apos;m passionate about. I hope you enjoy!
                </p>
              </div>
            )}
            <a 
              href="#projects" 
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Projects
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

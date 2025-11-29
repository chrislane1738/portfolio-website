'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-6 py-4 animate-fade-in-down">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center relative">
          <div className="flex-1"></div>
          <Link 
            href="/"
            className="text-3xl md:text-4xl font-bold text-white text-center flex-1 hover:opacity-80 transition-opacity duration-300"
          >
            Chris Lane
          </Link>
          <div className="flex space-x-6 flex-1 justify-end">
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              About
            </Link>
            <Link 
              href="/delta" 
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Delta
            </Link>
            <Link 
              href="/projects" 
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Projects
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

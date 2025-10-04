export default function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white">
          Chris Lane
        </div>
        <div className="flex space-x-6">
          <a 
            href="#about" 
            className="text-gray-300 hover:text-white transition-colors duration-300"
          >
            About
          </a>
          <a 
            href="#projects" 
            className="text-gray-300 hover:text-white transition-colors duration-300"
          >
            Projects
          </a>
        </div>
      </div>
    </nav>
  )
}

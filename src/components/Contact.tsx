export default function Contact() {
  return (
    <footer id="contact" className="py-16 px-4 bg-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Contact
        </h2>
        <a 
          href="mailto:chrislane1738@gmail.com"
          className="text-xl md:text-2xl text-blue-400 hover:text-blue-300 transition-colors duration-300"
        >
          chrislane1738@gmail.com
        </a>
        
        {/* Copyright Notice */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            © 2025 Chris Lane. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Contact() {
  return (
    <footer id="contact" className="py-8 px-4 bg-gray-800 mt-auto">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-3 text-left">
          <h4 className="text-sm md:text-base font-semibold text-white">
            Contact Me
          </h4>
          <p className="text-sm md:text-base text-gray-300">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:chrislane1738@gmail.com"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              chrislane1738@gmail.com
            </a>
          </p>
          <p className="text-sm md:text-base text-gray-300">
            <span className="font-semibold">LinkedIn:</span>{' '}
            <a
              href="https://www.linkedin.com/in/chris-lane-concord/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Christopher Lane
            </a>
          </p>
          <p className="text-sm md:text-base text-gray-300">
            <span className="font-semibold">Phone:</span>{' '}
            <span>(925)-542-2284</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

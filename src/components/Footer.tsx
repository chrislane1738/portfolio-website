export default function Footer() {
  return (
    <footer className="pt-20 pb-10 text-center">
      <div className="font-mono text-[12px] text-text-muted flex flex-wrap justify-center items-center gap-x-3 gap-y-1 px-4">
        <a
          href="mailto:chrislane1738@gmail.com"
          className="text-accent hover:text-white transition-colors duration-300 whitespace-nowrap"
        >
          chrislane1738@gmail.com
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="tel:+19255422284"
          className="text-accent hover:text-white transition-colors duration-300 whitespace-nowrap"
        >
          (925) 542-2284
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://www.linkedin.com/in/chris-lane-concord/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-white transition-colors duration-300 whitespace-nowrap"
        >
          LinkedIn
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-white transition-colors duration-300 whitespace-nowrap"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}

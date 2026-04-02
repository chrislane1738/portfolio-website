export default function Footer() {
  return (
    <footer className="pt-20 pb-10 text-center">
      <div className="font-mono text-[12px] text-text-muted">
        <a
          href="mailto:chrislane1738@gmail.com"
          className="text-accent hover:text-white transition-colors duration-300"
        >
          chrislane1738@gmail.com
        </a>
        <span className="mx-2">·</span>
        <a
          href="tel:+19255422284"
          className="text-accent hover:text-white transition-colors duration-300"
        >
          (925) 542-2284
        </a>
        <span className="mx-2">·</span>
        <a
          href="https://www.linkedin.com/in/chris-lane-concord/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-white transition-colors duration-300"
        >
          LinkedIn
        </a>
        <span className="mx-2">·</span>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-white transition-colors duration-300"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}

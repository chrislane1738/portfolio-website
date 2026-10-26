const LINKS = [
  { label: 'chrislane1738@gmail.com', href: 'mailto:chrislane1738@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/chris-lane-concord/' },
  { label: 'GitHub', href: 'https://github.com/chrislane1738' },
]

export default function Footer() {
  return (
    <footer className="py-8 border-t border-hairline">
      <div className="text-[13px] text-text-subtle flex flex-wrap justify-center items-center gap-x-3 gap-y-1 px-4">
        {LINKS.map((link, i) => (
          <span key={link.href} className="flex items-center gap-x-3">
            {i > 0 && <span aria-hidden="true">·</span>}
            <a
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="hover:text-text-primary transition-colors duration-200 whitespace-nowrap"
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  )
}

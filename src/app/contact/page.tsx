import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Chris Lane',
  description: 'Get in touch with Chris Lane.',
}

const ROWS = [
  {
    label: 'Email',
    value: 'chrislane1738@gmail.com',
    href: 'mailto:chrislane1738@gmail.com',
  },
  {
    label: 'Phone',
    value: '(925) 542-2284',
    href: 'tel:+19255422284',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/chris-lane-concord',
    href: 'https://www.linkedin.com/in/chris-lane-concord/',
  },
  {
    label: 'GitHub',
    value: 'github.com/chrislane1738',
    href: 'https://github.com/chrislane1738',
  },
]

export default function ContactPage() {
  return (
    <section className="bg-bg-deep px-6 md:px-16 pt-32 pb-24 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <p className="font-mono text-[11px] tracking-[3px] text-accent uppercase mb-4">
          Contact
        </p>
        <h1 className="font-serif text-[48px] md:text-[64px] text-white leading-[1.05]">
          Get in touch.
        </h1>
        <p className="font-mono text-[14px] text-text-body mt-6 leading-[1.8]">
          The fastest way to reach me is email. I read everything.
        </p>

        <div className="mt-12 border-t border-white/[0.08]">
          {ROWS.map((row) => (
            <a
              key={row.label}
              href={row.href}
              target={row.href.startsWith('http') ? '_blank' : undefined}
              rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex items-center justify-between gap-6 py-5 border-b border-white/[0.08] transition-colors duration-300 hover:border-accent"
            >
              <span className="font-mono text-[11px] tracking-[2px] text-text-muted uppercase">
                {row.label}
              </span>
              <span className="font-mono text-[14px] text-text-secondary text-right break-all group-hover:text-white transition-colors duration-300">
                {row.value}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

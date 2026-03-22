import type { Metadata } from 'next'
import { DM_Serif_Display, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex',
})

export const metadata: Metadata = {
  title: "Chris Lane's Portfolio",
  description: 'Personal portfolio website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${ibmPlexMono.variable}`}>
      <body className="font-mono bg-bg-base text-text-secondary">
        {children}
      </body>
    </html>
  )
}

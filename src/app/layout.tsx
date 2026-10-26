import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const interTight = Inter_Tight({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Christopher Lane',
  description: 'Diablo Valley College → Santa Clara University. Private Equity at TeedUp.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-bg-base text-text-secondary">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

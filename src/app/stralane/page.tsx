import Header from '@/components/Header'
import Contact from '@/components/Contact'

export default function StralanePage() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-white py-1 px-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/stralane-logo.png"
                alt="Stralane"
                className="mx-auto w-[40%] md:w-[35%] object-contain"
              />
              <p className="text-gray-500 text-lg mt-1">Smart Investing, Simplified</p>
            </div>

            <div className="p-8 md:p-12 space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                Stralane is an investing tool built for investors of all levels — whether you&apos;re just getting started or managing a seasoned portfolio. It brings together the research, analysis, and insights you need in one streamlined platform.
              </p>

              <p className="text-gray-300 text-lg leading-relaxed">
                Stralane is currently in a developing beta with rapid feature updates shipping regularly. New tools and improvements are being added all the time as we refine the experience based on real user feedback.
              </p>

              <div className="pt-4 text-center">
                <a
                  href="https://stralane.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  Try the Beta for Free at Stralane.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Contact />
    </main>
  )
}

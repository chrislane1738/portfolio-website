import Image from 'next/image'

export default function FeaturedProject() {
  return (
    <section className="pt-24 pb-16 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/2 flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                <Image
                  src="/vfc-card.png"
                  alt="VFC Research Dashboard"
                  width={400}
                  height={400}
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
            </div>

            {/* Text Section */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Built for my university&apos;s Viking Fund Club, this investment research dashboard streamlines the equity analysis process for club members. It aggregates key financial data, valuation metrics, and performance indicators into a single interactive interface, making it easier for analysts to evaluate potential investments and present their findings to the group.
              </p>
              <div className="mt-auto">
                <a
                  href="https://vikingfunddashboard.streamlit.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  Visit Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


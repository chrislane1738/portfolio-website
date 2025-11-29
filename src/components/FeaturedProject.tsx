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
                  src="/delta_fightwear.png"
                  alt="Delta Fightwear"
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
                I noticed that countless of my favorite fighters used a high-split type of shorts in their fights. However, to my surprise, I found that my choices were limited. Either they cost too much, didn&apos;t have very good designs, or were just cheap in quality. Since I do Jiu-Jitsu mainly and I think that these shorts just look awesome in general, I really wanted some good-looking, quality shorts that matched my favorite fighters. And that&apos;s how Delta Fightwear was born. While it&apos;s still a work in progress, Delta will hold an incredible catalogue. Stay tuned and check out the site for any updates!
              </p>
              <div className="mt-auto">
                <a 
                  href="https://deltafightwear.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


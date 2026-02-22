export default function About() {
  return (
    <section id="about" className="py-20 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
          About Me
        </h2>
        <div className="flex flex-col md:flex-row gap-10 items-center">
          {/* Left side - Headshot + tagline */}
          <div className="flex flex-col items-center md:w-2/5 shrink-0">
            <img
              src="/about-headshot.jpg"
              alt="Headshot"
              className="w-80 h-96 object-cover rounded-lg border-2 border-gray-600"
            />
            <p className="mt-5 text-gray-300 text-center text-base font-bold italic">
              Finance student. Non-profit leader. Aspiring entrepreneur.
            </p>
          </div>

          {/* Right side - Bio text */}
          <div className="md:w-3/5 text-gray-300 text-lg leading-relaxed space-y-4">
            <p>
              I believe that &ldquo;the profits are quite satisfactory&rdquo; when you pair deep
              curiosity with relentless efficiency. My journey at Diablo Valley College has been
              defined by a zero-waste approach to time, leading me to manage a personal long-term
              portfolio since age 18 while founding organizations like The Viking Fund Club.
            </p>
            <p className="font-semibold text-white">My interests are as diverse as my portfolio:</p>
            <ul className="space-y-2 list-none">
              <li>
                <span className="text-yellow-300 font-semibold">Finance:</span> Obsessed with
                fundamental analysis and leveraging AI (like Claude Code) for deeper market insights.
              </li>
              <li>
                <span className="text-yellow-300 font-semibold">Entrepreneurship:</span> Building{' '}
                <a href="/stralane" className="text-blue-400 hover:text-blue-300 underline">Stralane</a>,
                an investing tool for investors of all levels — currently in a developing beta with rapid feature updates.
              </li>
              <li>
                <span className="text-yellow-300 font-semibold">Leadership:</span> From the DVC
                Foundation to the Viking Fund Club, I&apos;m passionate about building platforms that
                help others succeed.
              </li>
            </ul>
            <p>
              When I&apos;m not staring at a terminal or a spreadsheet, you&apos;ll find me on the
              mats practicing jiu-jitsu, bouldering, or playing a (likely losing) hand of poker. I
              love to talk markets, tech, and strategy. I look forward to connecting with anyone who
              is interested, and thank you for taking the time to look through this website.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

import InterestCalculator from '@/components/InterestCalculator';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <a 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Compound Interest Calculator
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Calculate how your investments will grow over time with compound interest. 
            Enter your initial investment, interest rate, compounding frequency, and time period.
          </p>
        </div>

        {/* Calculator Component */}
        <div className="flex justify-center">
          <InterestCalculator />
        </div>
      </div>
    </div>
  );
}

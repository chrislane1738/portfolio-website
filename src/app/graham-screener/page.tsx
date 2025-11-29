'use client';

import { useState, useEffect } from 'react';
import ScreenerInterface from '@/components/ScreenerInterface';
import { ScreenedStock } from '@/lib/screener';

export default function GrahamScreenerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [screenedStocks, setScreenedStocks] = useState<ScreenedStock[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScreenedStocks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/run-screener');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch screened stocks');
        }
        
        const stocks = await response.json();
        console.log('Data received from API on the client:', stocks);
        setScreenedStocks(stocks);
      } catch (err) {
        console.error('Error fetching screened stocks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch screened stocks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScreenedStocks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <a 
            href="/projects" 
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
            Back to Projects
          </a>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Graham Intrinsic Value Screener
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Screen and analyze stocks using Benjamin Graham&apos;s intrinsic value formula. 
            Find undervalued stocks based on earnings growth, dividend history, and market fundamentals.
          </p>
        </div>

        {/* Screener Interface */}
        <ScreenerInterface 
          initialStocks={screenedStocks} 
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}

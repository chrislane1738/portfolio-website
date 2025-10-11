'use client';

import { useState } from 'react';
import TickerInput from '@/components/TickerInput';
import ValuationDisplay from '@/components/ValuationDisplay';
import PeerChart from '@/components/PeerChart';
import PeerGrid from '@/components/PeerGrid';

export default function PEAnalyzerPage() {
  const [targetTicker, setTargetTicker] = useState<string>('');
  const [peerTickers, setPeerTickers] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Filter valid peer tickers from array
      const validPeerTickers = peerTickers.filter(ticker => ticker.trim().length > 0);

      // Send request to API
      const response = await fetch('/api/pe-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetTicker: targetTicker.trim(),
          peerTickers: validPeerTickers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch P/E analysis data');
      }

      const rawData = await response.json();
      
      // Import and run the analysis
      const { runFullAnalysis } = await import('@/lib/pe-calculator');
      const analysisResults = runFullAnalysis(rawData);
      
      setResults(analysisResults);
    } catch (err) {
      console.error('Error running P/E analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to run analysis');
    } finally {
      setIsLoading(false);
    }
  };

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
            P/E Comparative Analysis
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Analyze a stock&apos;s valuation by comparing its P/E ratio to industry peers 
            and historical averages. Get fair value estimates and investment insights.
          </p>
        </div>

        {/* Input Component */}
        <TickerInput
          targetTicker={targetTicker}
          setTargetTicker={setTargetTicker}
          peerTickers={peerTickers}
          setPeerTickers={setPeerTickers}
          onRunAnalysis={runAnalysis}
          isLoading={isLoading}
        />

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-8 space-y-8">
            {/* Key Metrics */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Key Metrics</h2>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Current P/E</p>
                    <p className="text-white text-xl font-bold">{results.targetPE.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Peer Average P/E</p>
                    <p className="text-white text-xl font-bold">{results.averagePE.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Peer Median P/E</p>
                    <p className="text-white text-xl font-bold">{results.medianPE.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">TTM EPS</p>
                    <p className="text-white text-xl font-bold">${results.ttmEps.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Forward EPS</p>
                    <p className="text-white text-xl font-bold">${results.forwardEps.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Valuation Analysis */}
            <ValuationDisplay results={results} />
            
            {/* Charts and Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PeerChart 
                targetTicker={results.targetTicker}
                targetPE={results.targetPE}
                peerPEs={results.peerPEs}
                peerAveragePE={results.averagePE}
                peerMedianPE={results.medianPE}
                fairEstimatePE={results.fairPE}
              />
            </div>
            
            {/* Peer Grid */}
            <PeerGrid 
              peerPEs={results.peerPEs}
              targetTicker={results.targetTicker}
              targetPE={results.targetPE}
            />
          </div>
        )}
      </div>
    </div>
  );
}

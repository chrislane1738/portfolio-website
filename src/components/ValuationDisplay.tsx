'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/calculator';

interface ValuationDisplayProps {
  results: {
    targetTicker: string;
    targetPE: number;
    historicPE: number;
    averagePE: number;
    medianPE: number;
    fairPE: number;
    ttmEps: number;
    forwardEps: number;
    currentPrice: number;
    intrinsicValue: number;
    upsidePercentage: number;
    rating: string;
    totalPeers: number;
    filteredPeers: number;
    outliersRemoved: number;
  };
}

export default function ValuationDisplay({ results }: ValuationDisplayProps) {
  const [editableFairPE, setEditableFairPE] = useState(results.fairPE);
  const [calculatedIntrinsicValue, setCalculatedIntrinsicValue] = useState(results.intrinsicValue);
  const [calculatedUpsidePercentage, setCalculatedUpsidePercentage] = useState(results.upsidePercentage);

  // Update calculations when editable Fair P/E changes
  useEffect(() => {
    const newIntrinsicValue = editableFairPE * results.forwardEps;
    const newUpsidePercentage = results.currentPrice > 0 ? 
      ((newIntrinsicValue - results.currentPrice) / results.currentPrice) * 100 : 0;
    
    setCalculatedIntrinsicValue(newIntrinsicValue);
    setCalculatedUpsidePercentage(newUpsidePercentage);
  }, [editableFairPE, results.forwardEps, results.currentPrice]);

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getDynamicRating = (upside: number) => {
    if (upside < 0) return 'SELL';
    if (upside > 5) return 'BUY';
    return 'HOLD';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'BUY':
        return 'text-green-400 bg-green-900/20 border-green-500';
      case 'SELL':
        return 'text-red-400 bg-red-900/20 border-red-500';
      default:
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Valuation Analysis Results</h3>
      
      <div className="space-y-6">
        {/* Main Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Fair P/E Estimate</p>
            <input
              type="number"
              step="0.1"
              value={editableFairPE}
              onChange={(e) => setEditableFairPE(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Editable - adjust to see impact</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Intrinsic Value</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(calculatedIntrinsicValue)}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-white">{results?.currentPrice ? formatCurrency(results.currentPrice) : 'N/A'}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Upside/Downside</p>
            <p className={`text-2xl font-bold ${calculatedUpsidePercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(calculatedUpsidePercentage)}
            </p>
          </div>
        </div>

        {/* Investment Rating */}
        <div className="text-center">
          <div className={`inline-flex items-center px-6 py-3 rounded-full border ${getRatingColor(getDynamicRating(calculatedUpsidePercentage))}`}>
            <span className="text-lg font-semibold">Investment Rating: {getDynamicRating(calculatedUpsidePercentage)}</span>
          </div>
        </div>

        {/* P/E Analysis Breakdown */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4">P/E Analysis Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Current P/E</p>
              <p className="text-white font-semibold">{results?.targetPE?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Peer Average P/E</p>
              <p className="text-white font-semibold">{results?.averagePE?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Peer Median P/E</p>
              <p className="text-white font-semibold">{results?.medianPE?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4">Key Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">TTM EPS</p>
              <p className="text-white font-semibold">{results?.ttmEps ? formatCurrency(results.ttmEps) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Peer Companies Analyzed</p>
              <p className="text-white font-semibold">{results?.filteredPeers || 0} of {results?.totalPeers || 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Outliers Removed</p>
              <p className="text-white font-semibold">{results?.outliersRemoved || 0}</p>
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Analysis Summary</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  <strong>{results?.targetTicker || 'N/A'}</strong> has a current P/E ratio of <strong>{results?.targetPE?.toFixed(2) || 'N/A'}</strong>.
                </p>
                <p>
                  When compared to {results?.filteredPeers || 0} peer companies (after removing {results?.outliersRemoved || 0} outliers), 
                  the peer average P/E is <strong>{results?.averagePE?.toFixed(2) || 'N/A'}</strong> and median is <strong>{results?.medianPE?.toFixed(2) || 'N/A'}</strong>.
                </p>
                <p>
                  Based on this analysis, the fair P/E estimate is <strong>{results?.fairPE?.toFixed(2) || 'N/A'}</strong>, 
                  suggesting an intrinsic value of <strong>{results?.intrinsicValue ? formatCurrency(results.intrinsicValue) : 'N/A'}</strong> 
                  ({results?.upsidePercentage ? formatPercentage(results.upsidePercentage) : 'N/A'} from current price).
                </p>
              </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500">
            <strong>Disclaimer:</strong> This analysis is for educational purposes only and should not be considered as investment advice. 
            Always conduct your own research and consider consulting with a financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

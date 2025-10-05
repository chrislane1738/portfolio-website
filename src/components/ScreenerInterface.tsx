'use client';

import { useState } from 'react';
import CalculatorDisplay from './CalculatorDisplay';
import { ScreenedStock } from '@/lib/screener';
import { formatMarketCap } from '@/lib/utils';

interface ScreenerInterfaceProps {
  initialStocks: ScreenedStock[];
  isLoading?: boolean;
  error?: string | null;
}

export default function ScreenerInterface({ initialStocks, isLoading = false, error = null }: ScreenerInterfaceProps) {
  const [selectedStock, setSelectedStock] = useState<ScreenedStock | null>(null);
  // Use the prop directly instead of maintaining separate state
  const stocks = initialStocks;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Left Panel - Stock List */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Screened Stocks ({stocks.length})
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Stocks that passed Graham&apos;s screening criteria: Market Cap &gt; $1B, 
            positive earnings for 10+ years, consistent dividends.
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Running Graham screener...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few minutes as we analyze each stock.
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Screening Error</h3>
                <p className="text-red-400 text-sm">{error}</p>
                <p className="text-gray-500 text-xs mt-2">
                  This could be due to API rate limits or network issues.
                </p>
              </div>
            ) : stocks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No stocks passed the screening criteria.</p>
                <p className="text-sm text-gray-500 mt-2">
                  This could be due to API rate limits or strict screening criteria.
                </p>
              </div>
            ) : (
              stocks.map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => setSelectedStock(stock)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedStock?.ticker === stock.ticker
                      ? 'border-blue-500 bg-blue-900/20 text-blue-100'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{stock.ticker}</h4>
                      <p className="text-sm text-gray-400 truncate">{stock.name}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-300">${stock.price.toFixed(2)}</p>
                      <p className="text-gray-400">
                        {stock.dividendYield > 0 ? `${(stock.dividendYield * 100).toFixed(1)}% yield` : 'No dividend'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Market Cap: ${formatMarketCap(stock.marketCap / 1000000000)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Calculator Display */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          {selectedStock ? (
            <CalculatorDisplay stockData={selectedStock} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Select a Stock
                </h3>
                <p className="text-gray-400">
                  Choose a stock from the list to see its Graham intrinsic value calculation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Graham Formula Explanation */}
      <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Graham Intrinsic Value Formula
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-300 mb-2">Formula</h4>
            <p className="text-sm text-gray-400 font-mono bg-gray-900 p-3 rounded">
              Value = (EPS × (8.5 + 2 × g) × 4.4) ÷ Y
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Where: EPS = Earnings Per Share, g = Growth Rate (%), Y = Bond Yield (%)
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-300 mb-2">Interpretation</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <strong>Positive %</strong>: Stock is undervalued</li>
              <li>• <strong>Negative %</strong>: Stock is overvalued</li>
              <li>• <strong>Margin of Safety</strong>: Look for 20%+ upside</li>
              <li>• <strong>Conservative</strong>: Assumes 7.5% annual return</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

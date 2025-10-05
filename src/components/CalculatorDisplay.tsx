'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage, calculateGrahamValueCustom } from '@/lib/calculator';
import { GrahamCalculation } from '@/lib/calculator';

interface CalculatorDisplayProps {
  stockData: {
    ticker: string;
    name: string;
    marketCap: number;
    dividendYield: number;
    eps: number;
    price: number;
    fullFinancialData: any;
  };
}

interface RawGrahamData {
  ttmEps: number;
  latestPrice: number;
  bondYield: number;
  sevenYearGrowthRate: number;
  marketCap: number;
}

export default function CalculatorDisplay({ stockData }: CalculatorDisplayProps) {
  const [editableG, setEditableG] = useState<number>(0);
  const [calculation, setCalculation] = useState<GrahamCalculation | null>(null);

  // Extract data from the pre-fetched stock data
  const financials = stockData.fullFinancialData;
  const ttmEps = parseFloat(financials.overview.EPS);
  const latestPrice = parseFloat(financials.quote['05. price']);
  const marketCap = parseFloat(financials.overview.MarketCapitalization);
  
  // Calculate growth rate from earnings data
  const sevenYearGrowthRate = calculateGrowthRate(financials.earnings);
  
  // Get bond yield (we'll need to fetch this or use a default)
  const bondYield = 4.5; // Default bond yield, could be fetched separately if needed

  // Set initial growth rate when component mounts
  useEffect(() => {
    setEditableG(sevenYearGrowthRate);
  }, [sevenYearGrowthRate]);

  // Calculate Graham value whenever editable growth rate changes
  useEffect(() => {
    const result = calculateGrahamValueCustom(
      ttmEps,
      editableG,
      bondYield,
      latestPrice
    );
    setCalculation(result);
  }, [ttmEps, editableG, bondYield, latestPrice]);

  if (!calculation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Calculating Graham value...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">{stockData.ticker}</h3>
        <p className="text-gray-400">Graham Intrinsic Value Analysis</p>
      </div>

      {/* Current Price vs Intrinsic Value */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-4">Valuation Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Current Price</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(calculation.currentPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Intrinsic Value</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(calculation.intrinsicValue)}</p>
          </div>
        </div>
        
        {/* Upside/Downside */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            calculation.isUndervalued 
              ? 'bg-green-900/20 text-green-400 border border-green-500' 
              : 'bg-red-900/20 text-red-400 border border-red-500'
          }`}>
            <span className="font-semibold">
              {calculation.isUndervalued ? 'Undervalued' : 'Overvalued'}
            </span>
            <span className="ml-2 font-bold">
              {calculation.isUndervalued ? '+' : ''}{formatPercentage(calculation.upsidePercentage)}
            </span>
          </div>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-4">Calculation Inputs</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">EPS (TTM)</p>
            <p className="text-white font-semibold">{formatCurrency(calculation.eps)}</p>
          </div>
          <div>
            <p className="text-gray-400">Bond Yield</p>
            <p className="text-white font-semibold">{formatPercentage(calculation.bondYield)}</p>
          </div>
        </div>
        
        {/* Editable Growth Rate */}
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="growth-rate" className="block text-sm text-gray-400 mb-2">
                Growth Rate (g) - Editable
              </label>
              <input
                id="growth-rate"
                type="number"
                value={editableG}
                onChange={(e) => setEditableG(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
                min="0"
                max="50"
              />
            </div>
            <div className="text-sm">
              <p className="text-gray-400">Original (7-year)</p>
              <p className="text-white font-semibold">{formatPercentage(sevenYearGrowthRate)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-400 text-sm">Formula Factor</p>
          <p className="text-white font-semibold">{(8.5 + 2 * calculation.growthRate).toFixed(1)}</p>
        </div>
      </div>

      {/* Graham Formula Breakdown */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-4">Formula Breakdown</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">EPS × (8.5 + 2g) × 4.4</span>
            <span className="text-white font-mono">
              {formatCurrency(calculation.eps)} × {(8.5 + 2 * calculation.growthRate).toFixed(1)} × 4.4
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">= Numerator</span>
            <span className="text-white font-mono">
              {formatCurrency(calculation.eps * (8.5 + 2 * calculation.growthRate) * 4.4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">÷ Bond Yield</span>
            <span className="text-white font-mono">{formatPercentage(calculation.bondYield)}</span>
          </div>
          <div className="border-t border-gray-600 pt-3 flex justify-between">
            <span className="text-gray-400 font-semibold">= Intrinsic Value</span>
            <span className="text-white font-bold text-lg">{formatCurrency(calculation.intrinsicValue)}</span>
          </div>
        </div>
      </div>

      {/* Investment Recommendation */}
      <div className={`rounded-lg p-6 border ${
        calculation.isUndervalued 
          ? 'bg-green-900/10 border-green-500' 
          : 'bg-red-900/10 border-red-500'
      }`}>
        <h4 className={`text-lg font-semibold mb-2 ${
          calculation.isUndervalued ? 'text-green-400' : 'text-red-400'
        }`}>
          Investment Recommendation
        </h4>
        <p className={`text-sm ${
          calculation.isUndervalued ? 'text-green-300' : 'text-red-300'
        }`}>
          {calculation.isUndervalued 
            ? `Based on Graham's formula, ${stockData.ticker} appears to be undervalued by ${formatPercentage(calculation.upsidePercentage)}. This suggests potential for capital appreciation if the company continues to grow at the projected rate.`
            : `Based on Graham's formula, ${stockData.ticker} appears to be overvalued by ${formatPercentage(Math.abs(calculation.upsidePercentage))}. Consider waiting for a better entry point or look for other opportunities.`
          }
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <strong>Disclaimer:</strong> This analysis is for educational purposes only and should not be considered as investment advice. 
          Always conduct your own research and consider consulting with a financial advisor.
        </p>
      </div>
    </div>
  );
}

/**
 * Calculate average annual growth rate from earnings data
 */
function calculateGrowthRate(earnings: any[]): number {
  if (!earnings || earnings.length < 7) {
    return 0; // Default to 0% growth if insufficient data
  }
  
  try {
    // Get the last 7 years of earnings data
    const recentEarnings = earnings.slice(0, 7).map(earning => {
      const eps = parseFloat(earning.reportedEPS);
      return eps;
    }).filter(eps => !isNaN(eps) && eps > 0);
    
    if (recentEarnings.length < 2) {
      return 0;
    }
    
    // Calculate compound annual growth rate (CAGR)
    const firstEps = recentEarnings[recentEarnings.length - 1]; // Oldest
    const lastEps = recentEarnings[0]; // Most recent
    const years = recentEarnings.length - 1;
    
    if (firstEps <= 0) {
      return 0;
    }
    
    const cagr = Math.pow(lastEps / firstEps, 1 / years) - 1;
    
    // Convert to percentage and round to nearest whole number
    return Math.round(cagr * 100);
    
  } catch (error) {
    console.error('Error calculating growth rate:', error);
    return 0;
  }
}

'use client';

import { useState } from 'react';
import InvestmentGraph from './InvestmentGraph';

interface CompoundInterestInputs {
  principal: number;
  rate: number;
  timesCompounded: number;
  years: number;
  monthlyContribution: number;
}

interface GraphDataPoint {
  year: number;
  balance: number;
}

interface CalculationResult {
  finalAmount: number;
  graphData: GraphDataPoint[];
}

/**
 * Calculate compound interest with monthly contributions
 * 
 * @param inputs Object containing principal, rate, timesCompounded, years, and monthlyContribution
 * @returns Object containing finalAmount and graphData array
 */
function calculateCompoundInterest(inputs: CompoundInterestInputs): CalculationResult {
  const { principal, rate, timesCompounded, years, monthlyContribution } = inputs;
  
  // Convert rate from percentage to decimal
  const decimalRate = rate / 100;
  
  // Calculate the periodic interest rate
  const periodicRate = decimalRate / timesCompounded;
  
  // Calculate the contribution per compounding period
  // Since user inputs monthly contribution, we need to convert to per-period contribution
  const contributionPerPeriod = (monthlyContribution * 12) / timesCompounded;
  
  // Initialize variables
  let balance = principal;
  const graphData: GraphDataPoint[] = [];
  
  // Add initial balance to graph data
  graphData.push({ year: 0, balance: principal });
  
  // Calculate total number of compounding periods
  const totalPeriods = years * timesCompounded;
  
  // Iterate through each compounding period
  for (let period = 1; period <= totalPeriods; period++) {
    // Add contribution for this period
    balance += contributionPerPeriod;
    
    // Calculate and add interest for this period
    const interest = balance * periodicRate;
    balance += interest;
    
    // Capture graph data at the end of each year
    if (period % timesCompounded === 0) {
      const year = period / timesCompounded;
      graphData.push({ year, balance });
    }
  }
  
  return {
    finalAmount: balance,
    graphData
  };
}

/**
 * Format currency amount to 2 decimal places with commas
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [timesCompounded, setTimesCompounded] = useState<string>('12');
  const [years, setYears] = useState<string>('');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    // Clear previous errors
    setError('');
    
    // Validate inputs
    if (!principal || !rate || !timesCompounded || !years || monthlyContribution === '') {
      setError('Please fill in all fields');
      return;
    }

    const principalNum = parseFloat(principal);
    const rateNum = parseFloat(rate);
    const timesCompoundedNum = parseInt(timesCompounded);
    const yearsNum = parseFloat(years);
    const monthlyContributionNum = parseFloat(monthlyContribution);

    // Validate numeric values
    if (isNaN(principalNum) || isNaN(rateNum) || isNaN(timesCompoundedNum) || isNaN(yearsNum) || isNaN(monthlyContributionNum)) {
      setError('Please enter valid numbers');
      return;
    }

    // Validate positive values
    if (principalNum < 0) {
      setError('Principal cannot be negative');
      return;
    }
    if (rateNum < 0) {
      setError('Interest rate cannot be negative');
      return;
    }
    if (timesCompoundedNum <= 0) {
      setError('Times compounded must be greater than 0');
      return;
    }
    if (yearsNum <= 0) {
      setError('Number of years must be greater than 0');
      return;
    }
    if (monthlyContributionNum < 0) {
      setError('Monthly contribution cannot be negative');
      return;
    }

    try {
      const calculatedResult = calculateCompoundInterest({
        principal: principalNum,
        rate: rateNum,
        timesCompounded: timesCompoundedNum,
        years: yearsNum,
        monthlyContribution: monthlyContributionNum,
      });
      
      setResult(calculatedResult);
    } catch (err) {
      setError('An error occurred during calculation');
    }
  };

  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setTimesCompounded('12');
    setYears('');
    setMonthlyContribution('');
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Compound Interest Calculator
      </h2>
      
      <div className="space-y-6">
        {/* Principal Input */}
        <div>
          <label htmlFor="principal" className="block text-sm font-medium text-gray-300 mb-2">
            Principal Amount ($)
          </label>
          <input
            type="number"
            id="principal"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="Enter initial investment amount"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            step="0.01"
            min="0"
          />
        </div>

        {/* Annual Rate Input */}
        <div>
          <label htmlFor="rate" className="block text-sm font-medium text-gray-300 mb-2">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            id="rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Enter annual interest rate (e.g., 5 for 5%)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            step="0.01"
            min="0"
          />
        </div>

        {/* Times Compounded Input */}
        <div>
          <label htmlFor="timesCompounded" className="block text-sm font-medium text-gray-300 mb-2">
            Times Compounded per Year
          </label>
          <select
            id="timesCompounded"
            value={timesCompounded}
            onChange={(e) => setTimesCompounded(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="1">Annually (1)</option>
            <option value="2">Semi-annually (2)</option>
            <option value="4">Quarterly (4)</option>
            <option value="12">Monthly (12)</option>
            <option value="52">Weekly (52)</option>
            <option value="365">Daily (365)</option>
          </select>
        </div>

        {/* Years Input */}
        <div>
          <label htmlFor="years" className="block text-sm font-medium text-gray-300 mb-2">
            Number of Years
          </label>
          <input
            type="number"
            id="years"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="Enter investment period in years"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            step="0.1"
            min="0"
          />
        </div>

        {/* Monthly Contribution Input */}
        <div>
          <label htmlFor="monthlyContribution" className="block text-sm font-medium text-gray-300 mb-2">
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            id="monthlyContribution"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            placeholder="Enter monthly contribution amount"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            step="0.01"
            min="0"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Calculate
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Reset
          </button>
        </div>

        {/* Result Display */}
        {result !== null && (
          <div className="space-y-6">
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-green-300 mb-2">Final Amount</h3>
              <p className="text-3xl font-bold text-green-100">
                {formatCurrency(result.finalAmount)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-300">Total Contributions:</p>
                  <p className="text-green-100 font-semibold">
                    {formatCurrency(parseFloat(principal) + (parseFloat(monthlyContribution) * 12 * parseFloat(years)))}
                  </p>
                </div>
                <div>
                  <p className="text-green-300">Interest Earned:</p>
                  <p className="text-green-100 font-semibold">
                    {formatCurrency(result.finalAmount - parseFloat(principal) - (parseFloat(monthlyContribution) * 12 * parseFloat(years)))}
                  </p>
                </div>
              </div>
            </div>

            {/* Investment Growth Graph */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Investment Growth Over Time</h3>
              <InvestmentGraph graphData={result.graphData} />
            </div>
          </div>
        )}
      </div>

      {/* Formula Display */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Calculation Method:</h4>
        <p className="text-xs text-gray-400 font-mono">
          Compound Interest with Monthly Contributions
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Each month: Add contribution, then apply compound interest. 
          Formula: A = P(1 + r/n)^(nt) + monthly contributions with compound growth.
        </p>
      </div>
    </div>
  );
}

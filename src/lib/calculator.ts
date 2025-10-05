import { getStockFinancials } from './api';

export interface GrahamCalculation {
  ticker: string;
  eps: number;
  growthRate: number;
  bondYield: number;
  currentPrice: number;
  intrinsicValue: number;
  upsidePercentage: number;
  isUndervalued: boolean;
}

/**
 * Calculate Graham intrinsic value for a stock
 */
export async function calculateGrahamValue(ticker: string, bondYield: number): Promise<GrahamCalculation> {
  try {
    const financials = await getStockFinancials(ticker);
    
    // Get TTM EPS
    const eps = parseFloat(financials.overview.EPS);
    if (!eps || eps <= 0) {
      throw new Error(`Invalid EPS for ${ticker}`);
    }
    
    // Calculate growth rate from earnings data
    const growthRate = calculateGrowthRate(financials.earnings);
    
    // Get current price
    const currentPrice = parseFloat(financials.quote['05. price']);
    if (!currentPrice || currentPrice <= 0) {
      throw new Error(`Invalid current price for ${ticker}`);
    }
    
    // Apply Graham formula: Value = (EPS * (8.5 + 2 * g) * 4.4) / Y
    // Where g is growth rate (as percentage), Y is bond yield (as percentage)
    const intrinsicValue = (eps * (8.5 + 2 * growthRate) * 4.4) / bondYield;
    
    // Calculate upside percentage
    const upsidePercentage = ((intrinsicValue - currentPrice) / currentPrice) * 100;
    
    return {
      ticker,
      eps,
      growthRate,
      bondYield,
      currentPrice,
      intrinsicValue,
      upsidePercentage,
      isUndervalued: upsidePercentage > 0
    };
    
  } catch (error) {
    console.error(`Error calculating Graham value for ${ticker}:`, error);
    throw error;
  }
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

/**
 * Calculate Graham value with custom parameters
 */
export function calculateGrahamValueCustom(
  eps: number,
  growthRate: number,
  bondYield: number,
  currentPrice: number
): GrahamCalculation {
  // Apply Graham formula: Value = (EPS * (8.5 + 2 * g) * 4.4) / Y
  const intrinsicValue = (eps * (8.5 + 2 * growthRate) * 4.4) / bondYield;
  
  // Calculate upside percentage
  const upsidePercentage = ((intrinsicValue - currentPrice) / currentPrice) * 100;
  
  return {
    ticker: 'CUSTOM',
    eps,
    growthRate,
    bondYield,
    currentPrice,
    intrinsicValue,
    upsidePercentage,
    isUndervalued: upsidePercentage > 0
  };
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

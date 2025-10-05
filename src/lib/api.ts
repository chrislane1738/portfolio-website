/**
 * API helpers for fetching financial data from various sources
 */

// Types for API responses
export interface StockOverview {
  Symbol: string;
  Name: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  EPS: string;
  Description: string;
}

export interface IncomeStatement {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalRevenue: string;
  totalOperatingExpense: string;
  costOfRevenue: string;
  grossProfit: string;
  ebit: string;
  netIncome: string;
}

export interface Earnings {
  fiscalDateEnding: string;
  reportedDate: string;
  reportedEPS: string;
  estimatedEPS: string;
  surprise: string;
  surprisePercentage: string;
}

export interface GlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface StockFinancials {
  overview: StockOverview;
  incomeStatements: IncomeStatement[];
  earnings: Earnings[];
  quote: GlobalQuote;
}

/**
 * Fetch AAA Corporate Bond Yield from FRED API
 */
export async function getBondYield(): Promise<number> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error('FRED_API_KEY environment variable is required');
  }

  const response = await fetch(
    `https://api.stlouisfed.org/fred/series/observations?series_id=BAMLC0A1CAAAEY&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch bond yield: ${response.statusText}`);
  }

  const data = await response.json();
  const latestValue = data.observations[0]?.value;
  
  if (!latestValue || latestValue === '.') {
    throw new Error('No valid bond yield data found');
  }

  return parseFloat(latestValue);
}

/**
 * Fetch stock financials from Alpha Vantage API
 */
export async function getStockFinancials(ticker: string): Promise<StockFinancials> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY environment variable is required');
  }

  const baseUrl = 'https://www.alphavantage.co/query';
  
  try {
    // Fetch all required data in parallel
    const [overviewRes, incomeRes, earningsRes, quoteRes] = await Promise.all([
      fetch(`${baseUrl}?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`),
      fetch(`${baseUrl}?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${apiKey}`),
      fetch(`${baseUrl}?function=EARNINGS&symbol=${ticker}&apikey=${apiKey}`),
      fetch(`${baseUrl}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`)
    ]);

    // Check if any request failed
    if (!overviewRes.ok || !incomeRes.ok || !earningsRes.ok || !quoteRes.ok) {
      throw new Error(`API request failed for ${ticker}`);
    }

    const [overview, incomeData, earningsData, quoteData] = await Promise.all([
      overviewRes.json(),
      incomeRes.json(),
      earningsRes.json(),
      quoteRes.json()
    ]);

    // Check for API errors
    if (overview['Error Message'] || incomeData['Error Message'] || 
        earningsData['Error Message'] || quoteData['Error Message']) {
      throw new Error(`API error for ${ticker}: ${overview['Error Message'] || incomeData['Error Message'] || earningsData['Error Message'] || quoteData['Error Message']}`);
    }

    // Check for rate limit
    if (overview['Note'] || incomeData['Note'] || earningsData['Note'] || quoteData['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    return {
      overview: overview as StockOverview,
      incomeStatements: incomeData.annualReports || [],
      earnings: earningsData.annualEarnings || [],
      quote: quoteData['Global Quote'] as GlobalQuote
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    throw error;
  }
}

/**
 * Get a sample of S&P 500 tickers for testing
 * In production, you would fetch the full list from an API
 */
export function getSP500Tickers(): string[] {
  return [
    'KO', 'JNJ', 'PG', 'MCD', 'WMT', 'PEP'
  ];
}

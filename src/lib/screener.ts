import { getStockFinancials, getSP500Tickers } from './api';

export interface ScreenedStock {
  ticker: string;
  name: string;
  marketCap: number;
  dividendYield: number;
  eps: number;
  price: number;
  fullFinancialData: any;
}

/**
 * Run the Graham screener on S&P 500 stocks
 */
export async function runGrahamScreener(): Promise<ScreenedStock[]> {
  const tickers = getSP500Tickers();
  const screenedStocks: ScreenedStock[] = [];
  
  console.log(`Starting Graham screener for ${tickers.length} stocks...`);
  
  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];
    
    try {
      console.log(`Processing ${ticker} (${i + 1}/${tickers.length})...`);
      
      const financials = await getStockFinancials(ticker);
      
      // Apply Graham screening criteria
      if (await passesGrahamScreen(financials)) {
        const marketCap = parseFloat(financials.overview.MarketCapitalization) || 0;
        const dividendYield = parseFloat(financials.overview.DividendYield) || 0;
        const eps = parseFloat(financials.overview.EPS) || 0;
        const price = parseFloat(financials.quote['05. price']) || 0;
        
        screenedStocks.push({
          ticker,
          name: financials.overview.Name,
          marketCap,
          dividendYield,
          eps,
          price,
          fullFinancialData: financials
        });
        
        console.log(`✓ ${ticker} passed screening`);
      } else {
        console.log(`✗ ${ticker} failed screening`);
      }
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Error processing ${ticker}:`, error);
      // Continue with next ticker
    }
  }
  
  console.log(`Screening complete. Found ${screenedStocks.length} qualifying stocks.`);
  return screenedStocks;
}

/**
 * Check if a stock passes Graham's screening criteria
 */
async function passesGrahamScreen(financials: any): Promise<boolean> {
  try {
    // 1. Market Cap > $1 Billion
    const marketCap = parseFloat(financials.overview.MarketCapitalization);
    if (!marketCap || marketCap < 1000000000) { // 1 billion
      return false;
    }
    
    // 2. Positive net income for the last 10 consecutive years
    const incomeStatements = financials.incomeStatements;
    if (!incomeStatements || incomeStatements.length < 10) {
      return false;
    }
    
    // Check last 10 years of net income
    for (let i = 0; i < 10; i++) {
      const netIncome = parseFloat(incomeStatements[i]?.netIncome);
      if (!netIncome || netIncome <= 0) {
        return false;
      }
    }
    
    // 3. Has paid dividends (approximate check)
    const dividendYield = parseFloat(financials.overview.DividendYield);
    if (!dividendYield || dividendYield <= 0) {
      return false;
    }
    
    // 4. Additional quality checks
    const eps = parseFloat(financials.overview.EPS);
    if (!eps || eps <= 0) {
      return false;
    }
    
    const peRatio = parseFloat(financials.overview.PERatio);
    if (!peRatio || peRatio <= 0 || peRatio > 50) { // Reasonable P/E range
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error in Graham screening:', error);
    return false;
  }
}

/**
 * Get a smaller sample for testing (to avoid API rate limits)
 */
export async function runGrahamScreenerSample(): Promise<ScreenedStock[]> {
  const sampleTickers = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'PEP', 'WMT', 'HD', 'JPM', 'V'];
  const screenedStocks: ScreenedStock[] = [];
  
  console.log(`Starting Graham screener for sample of ${sampleTickers.length} stocks...`);
  
  for (const ticker of sampleTickers) {
    try {
      console.log(`Processing ${ticker}...`);
      
      const financials = await getStockFinancials(ticker);
      
      if (await passesGrahamScreen(financials)) {
        const marketCap = parseFloat(financials.overview.MarketCapitalization) || 0;
        const dividendYield = parseFloat(financials.overview.DividendYield) || 0;
        const eps = parseFloat(financials.overview.EPS) || 0;
        const price = parseFloat(financials.quote['05. price']) || 0;
        
        screenedStocks.push({
          ticker,
          name: financials.overview.Name,
          marketCap,
          dividendYield,
          eps,
          price,
          fullFinancialData: financials
        });
        
        console.log(`✓ ${ticker} passed screening`);
      } else {
        console.log(`✗ ${ticker} failed screening`);
      }
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error processing ${ticker}:`, error);
    }
  }
  
  console.log(`Sample screening complete. Found ${screenedStocks.length} qualifying stocks.`);
  return screenedStocks;
}

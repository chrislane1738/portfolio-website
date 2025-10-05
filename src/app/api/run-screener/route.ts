import { NextResponse } from 'next/server';
import { getStockFinancials, getSP500Tickers } from '@/lib/api';

export interface ScreenedStock {
  ticker: string;
  name: string;
  marketCap: number;
  dividendYield: number;
  eps: number;
  price: number;
  // Add full financial data for calculator
  fullFinancialData: any;
}

export async function GET() {
  try {
    console.log('--- Screener API route started ---');
    
    // Use sample tickers for now to avoid API rate limits
    const sampleTickers = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'PEP', 'WMT', 'HD', 'JPM', 'V'];
    const screenedStocks: ScreenedStock[] = [];
    
    console.log('Screening these tickers:', sampleTickers);
    
    for (const ticker of sampleTickers) {
      try {
        console.log(`Processing ${ticker}...`);
        
        const financials = await getStockFinancials(ticker);
        console.log('Data received for ticker:', ticker, financials);
        
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
            fullFinancialData: financials // Store the complete financial data
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
    console.log('--- Screener API route finished ---');
    
    return NextResponse.json(screenedStocks);
  } catch (error) {
    console.error('Error running Graham screener:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run screener' },
      { status: 500 }
    );
  }
}

/**
 * Check if a stock passes Graham's screening criteria
 * TEMPORARILY RELAXED FOR DEBUGGING
 */
async function passesGrahamScreen(financials: any): Promise<boolean> {
  try {
    // 1. Market Cap > $1 Billion (KEEPING THIS CHECK)
    const marketCap = parseFloat(financials.overview.MarketCapitalization);
    if (!marketCap || marketCap < 1000000000) { // 1 billion
      return false;
    }
    
    // TEMPORARILY COMMENTED OUT: 10+ years of positive earnings
    // const incomeStatements = financials.incomeStatements;
    // if (!incomeStatements || incomeStatements.length < 10) {
    //   return false;
    // }
    
    // Check last 10 years of net income
    // for (let i = 0; i < 10; i++) {
    //   const netIncome = parseFloat(incomeStatements[i]?.netIncome);
    //   if (!netIncome || netIncome <= 0) {
    //     return false;
    //   }
    // }
    
    // TEMPORARILY COMMENTED OUT: Dividend history check
    // const dividendYield = parseFloat(financials.overview.DividendYield);
    // if (!dividendYield || dividendYield <= 0) {
    //   return false;
    // }
    
    // TEMPORARILY COMMENTED OUT: Additional quality checks for debugging
    // const eps = parseFloat(financials.overview.EPS);
    // if (!eps || eps <= 0) {
    //   return false;
    // }
    
    // const peRatio = parseFloat(financials.overview.PERatio);
    // if (!peRatio || peRatio <= 0 || peRatio > 50) { // Reasonable P/E range
    //   return false;
    // }
    
    return true;
    
  } catch (error) {
    console.error('Error in Graham screening:', error);
    return false;
  }
}

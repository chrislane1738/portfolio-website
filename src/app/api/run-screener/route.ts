import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { ScreenedStock } from '@/lib/screener';

const yahooFinance = new YahooFinance();

export async function GET() {
  try {
    const sampleTickers = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'PEP', 'WMT', 'HD', 'JPM', 'V'];
    const screenedStocks: ScreenedStock[] = [];

    for (const ticker of sampleTickers) {
      try {
        const quote: any = await yahooFinance.quoteSummary(ticker, {
          modules: ['summaryDetail', 'defaultKeyStatistics', 'price', 'earningsHistory', 'incomeStatementHistory']
        });

        const marketCap = quote.price?.marketCap ?? 0;
        const dividendYield = quote.summaryDetail?.dividendYield ?? 0;
        const eps = quote.defaultKeyStatistics?.trailingEps ?? 0;
        const price = quote.price?.regularMarketPrice ?? 0;
        const pe = quote.summaryDetail?.trailingPE ?? 0;
        const name = quote.price?.shortName ?? ticker;

        // Graham screen: market cap > $1B
        if (marketCap < 1_000_000_000) continue;

        // Map earnings history to the shape calculateGrowthRate expects
        const earningsHistory = (quote.earningsHistory?.history ?? []).map((e: any) => ({
          reportedEPS: String(e.epsActual ?? 0),
        }));

        // Build fullFinancialData in the shape CalculatorDisplay expects
        const fullFinancialData = {
          overview: {
            EPS: String(eps),
            MarketCapitalization: String(marketCap),
            PERatio: String(pe),
            DividendYield: String(dividendYield),
            Name: name,
          },
          quote: {
            '05. price': String(price),
          },
          earnings: earningsHistory,
        };

        screenedStocks.push({
          ticker,
          name,
          marketCap,
          dividendYield,
          eps,
          price,
          fullFinancialData,
        });

      } catch (error) {
        console.error(`Error processing ${ticker}:`, error);
      }
    }

    return NextResponse.json(screenedStocks);
  } catch (error) {
    console.error('Error running Graham screener:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run screener' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function POST(request: NextRequest) {
  try {
    const { targetTicker, peerTickers } = await request.json();

    if (!targetTicker || !peerTickers || peerTickers.length === 0) {
      return NextResponse.json(
        { error: 'Target ticker and peer tickers are required' },
        { status: 400 }
      );
    }

    // Fetch target stock data
    const targetQuote: any = await yahooFinance.quoteSummary(targetTicker, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'price']
    });

    const targetData = {
      ticker: targetTicker,
      trailingPE: targetQuote.summaryDetail?.trailingPE ?? 0,
      forwardPE: targetQuote.summaryDetail?.forwardPE ?? 0,
      eps: targetQuote.defaultKeyStatistics?.trailingEps ?? 0,
      currentPrice: targetQuote.price?.regularMarketPrice ?? 0,
      name: targetQuote.price?.shortName ?? targetTicker,
    };

    // Fetch peer stock data in parallel
    const peerResults = await Promise.all(
      peerTickers.map(async (ticker: string) => {
        try {
          const peerQuote: any = await yahooFinance.quoteSummary(ticker, {
            modules: ['summaryDetail', 'price']
          });
          return {
            ticker,
            pe: peerQuote.summaryDetail?.trailingPE ?? 0,
            name: peerQuote.price?.shortName ?? ticker,
          };
        } catch (error) {
          console.error(`Error fetching peer ${ticker}:`, error);
          return null;
        }
      })
    );

    const peers = peerResults.filter((p): p is NonNullable<typeof p> => p !== null && p.pe > 0);

    return NextResponse.json({ target: targetData, peers });

  } catch (error) {
    console.error('Error in P/E analysis API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch P/E analysis data' },
      { status: 500 }
    );
  }
}

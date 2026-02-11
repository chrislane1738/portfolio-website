import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
  try {
    // Use ^TNX (10-Year Treasury Note Yield) as bond yield proxy
    const quote: any = await yahooFinance.quote('^TNX');
    const bondYield = quote?.regularMarketPrice ?? 0;

    if (!bondYield || bondYield <= 0) {
      return NextResponse.json(
        { error: 'No valid bond yield data found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bondYield });
  } catch (error) {
    console.error('Error fetching bond yield:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

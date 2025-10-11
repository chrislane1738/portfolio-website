import { NextRequest, NextResponse } from 'next/server';

// Helper function to add delays between API calls
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(request: NextRequest) {
  try {
    const { targetTicker, peerTickers } = await request.json();
    
    if (!targetTicker || !peerTickers || peerTickers.length === 0) {
      return NextResponse.json(
        { error: 'Target ticker and peer tickers are required' },
        { status: 400 }
      );
    }

    console.log('Starting P/E analysis for:', targetTicker, 'with peers:', peerTickers);

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const baseUrl = 'https://www.alphavantage.co/query';

    // Fetch target stock overview (current P/E, TTM EPS, Forward P/E)
    const targetOverviewRes = await fetch(`${baseUrl}?function=OVERVIEW&symbol=${targetTicker}&apikey=${apiKey}`);
    const targetOverview = await targetOverviewRes.json();
    await delay(250);

    // Fetch target stock current price from GLOBAL_QUOTE
    const targetQuoteRes = await fetch(`${baseUrl}?function=GLOBAL_QUOTE&symbol=${targetTicker}&apikey=${apiKey}`);
    const targetQuote = await targetQuoteRes.json();
    await delay(250);


    // Fetch peer stock overviews (current P/E only)
    const peerDataPromises = peerTickers.map(async (ticker: string, index: number) => {
      try {
        await delay(250 * (index + 1));
        const peerRes = await fetch(`${baseUrl}?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`);
        const peerData = await peerRes.json();
        return { ticker, data: peerData };
      } catch (error) {
        console.error(`Error fetching data for peer ${ticker}:`, error);
        return { ticker, data: null };
      }
    });

    const peerDataResults = await Promise.all(peerDataPromises);
    const peerData = peerDataResults.filter(result => result.data !== null);

    // Structure the response data with all raw data needed for the client
    const analysisData = {
      target: {
        ticker: targetTicker,
        overview: targetOverview,
        quote: targetQuote
      },
      peers: peerData.map(result => ({
        ticker: result.ticker,
        overview: result.data
      }))
    };

    console.log('P/E analysis data fetched successfully');
    return NextResponse.json(analysisData);

  } catch (error) {
    console.error('Error in P/E analysis API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch P/E analysis data' },
      { status: 500 }
    );
  }
}

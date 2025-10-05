import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FRED_API_KEY environment variable is required' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=BAMLC0A1CAAAEY&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch bond yield: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const latestValue = data.observations[0]?.value;
    
    if (!latestValue || latestValue === '.') {
      return NextResponse.json(
        { error: 'No valid bond yield data found' },
        { status: 404 }
      );
    }

    const bondYield = parseFloat(latestValue);
    
    return NextResponse.json({ bondYield });
  } catch (error) {
    console.error('Error fetching bond yield:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

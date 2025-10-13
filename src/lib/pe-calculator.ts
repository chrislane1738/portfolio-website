
/**
 * Filter outliers from an array of P/E ratios using Interquartile Range (IQR) method
 */
export function filterOutliersIQR(peRatios: number[]): number[] {
  if (peRatios.length === 0) return [];
  
  // Sort the array
  const sorted = [...peRatios].sort((a, b) => a - b);
  
  // Calculate quartiles
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  
  // Calculate IQR
  const iqr = q3 - q1;
  
  // Define outlier bounds
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  // Filter out outliers
  return sorted.filter(pe => pe >= lowerBound && pe <= upperBound);
}

/**
 * Calculate average of an array of numbers
 */
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculate median of an array of numbers
 */
function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}


/**
 * Main analysis function that processes all the raw data
 */
export function runFullAnalysis(rawData: any) {
  try {
    console.log('Starting full P/E analysis...');
    
    // Extract target data
    const targetOverview = rawData.target.overview;
    const targetQuote = rawData.target.quote;
    
    // Get target data
    const ttmEps = parseFloat(targetOverview.EPS) || 0;
    const currentPE = parseFloat(targetOverview.PERatio) || 0;
    const forwardPE = parseFloat(targetOverview.ForwardPE) || currentPE;
    const currentPrice = parseFloat(targetQuote['Global Quote']['05. price']) || 0;
    
    // Calculate Forward EPS
    const forwardEps = forwardPE > 0 ? currentPrice / forwardPE : ttmEps;
    
    // Extract peer P/E ratios with ticker information
    const peerPEsWithTickers = rawData.peers
      .map((peer: any) => ({
        ticker: peer.ticker,
        pe: parseFloat(peer.overview.PERatio)
      }))
      .filter((peer: any) => !isNaN(peer.pe) && peer.pe > 0);
    
    // Extract just the P/E ratios for filtering
    const peerPEs = peerPEsWithTickers.map((peer: { ticker: string; pe: number }) => peer.pe);
    
    // Filter outliers from peer P/E ratios using IQR method
    const filteredPeerPEs = filterOutliersIQR(peerPEs);
    
    // Calculate peer statistics using the filtered P/E ratios
    const averagePE = calculateAverage(filteredPeerPEs);
    const medianPE = calculateMedian(filteredPeerPEs);
    
    // Filter the peer data to match the filtered P/E ratios for display
    const filteredPeerPEsWithTickers = peerPEsWithTickers.filter((peer: { ticker: string; pe: number }) => 
      filteredPeerPEs.includes(peer.pe)
    );
    
    // Calculate Fair P/E Estimate (average of 3 key metrics)
    const fairPE = Math.round(((currentPE + averagePE + medianPE) / 3) * 100) / 100;
    
    // Calculate intrinsic value and upside using Forward EPS
    const intrinsicValue = fairPE * forwardEps;
    const upsidePercentage = currentPrice > 0 ? ((intrinsicValue - currentPrice) / currentPrice) * 100 : 0;
    
    // Determine investment rating
    let rating = 'HOLD';
    if (upsidePercentage > 10) rating = 'BUY';
    else if (upsidePercentage < -3) rating = 'SELL';
    
    const results = {
      targetTicker: rawData.target.ticker,
      targetPE: currentPE,
      peerPEs: filteredPeerPEsWithTickers,
      averagePE,
      medianPE,
      fairPE,
      ttmEps,
      forwardEps,
      currentPrice,
      intrinsicValue,
      upsidePercentage,
      rating,
      // Additional metrics for display
      totalPeers: rawData.peers.length,
      filteredPeers: filteredPeerPEs.length,
      outliersRemoved: rawData.peers.length - filteredPeerPEs.length
    };
    
    console.log('P/E analysis completed:', results);
    return results;
    
  } catch (error) {
    console.error('Error in runFullAnalysis:', error);
    throw new Error('Failed to complete P/E analysis');
  }
}

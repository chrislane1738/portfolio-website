/**
 * Format market cap value for display
 * @param marketCapInBillions - Market cap value in billions
 * @returns Formatted string with appropriate suffix (B or T)
 */
export function formatMarketCap(marketCapInBillions: number): string {
  if (marketCapInBillions >= 1000) {
    const trillions = marketCapInBillions / 1000;
    return `${trillions.toFixed(2)}T`;
  }
  return `${marketCapInBillions.toFixed(1)}B`;
}

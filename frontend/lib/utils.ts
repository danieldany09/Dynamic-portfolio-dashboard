/**
 * Format number as Indian currency
 * @param amount - The amount to format
 * @param showSign - Whether to show +/- sign for gains/losses
 */
export function formatCurrency(amount: number, showSign = false): string {
  if (isNaN(amount)) return '₹0.00';
  
  const absAmount = Math.abs(amount);
  const formatted = `₹${absAmount.toLocaleString('en-IN')}`;
  
  if (showSign) {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${formatted}`;
  }
  
  return formatted;
}

/**
 * Format percentage with + or - sign
 */
export function formatPercentage(percent: number): string {
  if (isNaN(percent)) return '0.00%';
  
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
} 
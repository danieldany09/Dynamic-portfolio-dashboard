import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as Indian currency
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with Indian number system (lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
  if (isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 10000000) { // 1 crore
    return `${sign}${(absNum / 10000000).toFixed(2)}Cr`;
  } else if (absNum >= 100000) { // 1 lakh
    return `${sign}${(absNum / 100000).toFixed(2)}L`;
  } else if (absNum >= 1000) { // 1 thousand
    return `${sign}${(absNum / 1000).toFixed(1)}K`;
  } else {
    return `${sign}${absNum.toFixed(0)}`;
  }
}

/**
 * Format percentage with proper sign and color
 */
export function formatPercentage(percent: number): string {
  if (isNaN(percent)) return '0.00%';
  
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * Get color class based on gain/loss
 */
export function getGainLossColor(value: number): string {
  if (value > 0) return 'text-green-600 dark:text-green-400';
  if (value < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}

/**
 * Get background color class based on gain/loss
 */
export function getGainLossBackground(value: number): string {
  if (value > 0) return 'bg-green-50 dark:bg-green-900/20';
  if (value < 0) return 'bg-red-50 dark:bg-red-900/20';
  return 'bg-gray-50 dark:bg-gray-900/20';
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format large numbers for display
 */
export function formatLargeNumber(num: number): string {
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Calculate time difference from now
 */
export function getTimeAgo(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours}h ago`;
    }
  } catch {
    return 'N/A';
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Check if value is valid number
 */
export function isValidNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safe number parsing
 */
export function safeParseFloat(value: unknown): number {
  const parsed = parseFloat(String(value));
  return isValidNumber(parsed) ? parsed : 0;
} 
export interface Stock {
  particulars: string;
  symbol: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  exchange: string;
  cmp: number; // Current Market Price
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  peRatio: number | string;
  latestEarnings: string;
  sector: string;
  lastUpdated?: string;
  dayChange?: number;
  dayChangePercent?: number;
  volume?: number;
  marketCap?: number;
  error?: string;
}

export interface PortfolioSummary {
  totalStocks: number;
  totalInvestment: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  overallGainLossPercent: number;
}

export interface PortfolioData {
  stocks: Stock[];
  summary: PortfolioSummary;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
} 
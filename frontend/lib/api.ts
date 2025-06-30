import axios from 'axios';
import { PortfolioData, SectorData, ApiResponse, PriceUpdate } from '@/types/portfolio';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class PortfolioAPI {
  /**
   * Get complete portfolio data
   */
  static async getPortfolio(): Promise<PortfolioData> {
    try {
      const response = await apiClient.get<ApiResponse<PortfolioData>>('/portfolio');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch portfolio data');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw new Error('Failed to load portfolio data. Please check if the backend is running.');
    }
  }

  /**
   * Get sector-wise portfolio summary
   */
  static async getSectorSummary(): Promise<SectorData> {
    try {
      const response = await apiClient.get<ApiResponse<SectorData>>('/portfolio/sectors');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch sector data');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sector summary:', error);
      throw new Error('Failed to load sector data');
    }
  }

  /**
   * Get real-time price updates for specific symbols
   */
  static async getRealTimePrices(symbols: string[]): Promise<PriceUpdate[]> {
    try {
      const symbolsParam = symbols.join(',');
      const response = await apiClient.get<ApiResponse<PriceUpdate[]>>(`/portfolio/prices?symbols=${symbolsParam}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch price updates');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching price updates:', error);
      throw new Error('Failed to update prices');
    }
  }

  /**
   * Get detailed information for a specific stock
   */
  static async getStockDetails(symbol: string): Promise<Record<string, unknown>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get<ApiResponse<any>>(`/stocks/${symbol}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch stock details');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching stock details for ${symbol}:`, error);
      throw new Error(`Failed to load details for ${symbol}`);
    }
  }

  /**
   * Search for stocks
   */
  static async searchStocks(query: string): Promise<Record<string, unknown>[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get<ApiResponse<any[]>>(`/stocks/search?query=${encodeURIComponent(query)}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to search stocks');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw new Error('Failed to search stocks');
    }
  }
}

export default PortfolioAPI; 
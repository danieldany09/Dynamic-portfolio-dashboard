import axios from 'axios';
import { PortfolioData, ApiResponse } from '@/types/portfolio';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const JWT_TOKEN = process.env.NEXT_PUBLIC_JWT_TOKEN;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token to headers if available
    if (JWT_TOKEN) {
      config.headers.Authorization = `Bearer ${JWT_TOKEN}`;
    } else {
      console.warn('JWT_TOKEN is not set in environment variables');
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle JWT authentication errors
    if (error.response?.status === 401) {
      const errorData = error.response.data;
      if (errorData?.error === 'Token expired') {
        console.error('JWT token has expired. Please generate a new token.');
      } else if (errorData?.error === 'Invalid token') {
        console.error('JWT token is invalid. Please check your token.');
      } else if (errorData?.error === 'Access token is required') {
        console.error('JWT token is missing. Please set NEXT_PUBLIC_JWT_TOKEN in your environment variables.');
      }
    }
    
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
}

export default PortfolioAPI; 
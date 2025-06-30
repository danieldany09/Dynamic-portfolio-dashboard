const axios = require('axios');
const cheerio = require('cheerio');
const { GOOGLE_FINANCE_BASE_URL } = require('../config/constants');
const { createHttpClient } = require('../utils/httpClient');

class GoogleFinanceService {
  constructor() {
    this.baseURL = `${GOOGLE_FINANCE_BASE_URL}/quote/`;
    this.axiosInstance = createHttpClient();
  }

  /**
   * Get the 5 fields we actually need: peRatio, pbRatio, dividendYield, roe, latestEarnings
   */
  async getComprehensiveFundamentals(symbol) {
    try {
      const googleSymbol = this.convertToGoogleSymbol(symbol);
      const url = `${this.baseURL}${googleSymbol}`;
      
      const response = await this.axiosInstance.get(url);
      return this.parseData(response.data, symbol);
    } catch (error) {
      console.error(`Google Finance error for ${symbol}:`, error.message);
      return this.getDefaults(symbol);
    }
  }

  /**
   * Same as comprehensive (since we only return 5 fields anyway)
   */
  async getFundamentals(symbol) {
    return await this.getComprehensiveFundamentals(symbol);
  }

  /**
   * Simple data parsing - extract only the 5 fields we need
   */
  parseData(html, symbol) {
    const $ = cheerio.load(html);
    
    return {
      symbol,
      peRatio: this.extractValue($, 'P/E ratio'),
      pbRatio: this.extractValue($, 'P/B ratio'), 
      dividendYield: this.extractValue($, 'Dividend yield'),
      roe: this.extractValue($, 'Return on equity'),
      latestEarnings: null, // Yahoo Finance handles this better
      lastUpdated: new Date().toISOString(),
      dataSource: 'Google Finance'
    };
  }

  /**
   * Extract a single value from HTML
   */
  extractValue($, fieldName) {
    const selectors = [
      `[data-test="${fieldName}"] .P6K39c`,
      `[data-test="${fieldName}"] .kf0WUb`,
      `[data-test="${fieldName}"] .YFCdne`
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        if (text && text !== '—' && text !== '-' && text !== 'N/A') {
          return this.parseNumber(text);
        }
      }
    }
    return null;
  }

  /**
   * Simple number parsing
   */
  parseNumber(text) {
    if (!text) return null;
    const num = parseFloat(text.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? null : num;
  }

  /**
   * Default values when data unavailable
   */
  getDefaults(symbol) {
    return {
      symbol,
      peRatio: null,
      pbRatio: null,
      dividendYield: null,
      roe: null,
      latestEarnings: null,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Google Finance (Default)',
      error: 'Data unavailable'
    };
  }

  /**
   * Convert NSE symbols to Google Finance format
   */
  convertToGoogleSymbol(symbol) {
    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
    return `${cleanSymbol}:NSE`;
  }
}

module.exports = new GoogleFinanceService();
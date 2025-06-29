const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;

class YahooFinanceService {
  constructor() {
    this.baseURL = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }

  /**
   * Get current stock price using yahoo-finance2 library
   */
  async getStockPrice(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol);
      
      return {
        symbol: quote.symbol,
        currentPrice: quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow
      };
    } catch (error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch price data for ${symbol}`);
    }
  }

  /**
   * Get bulk prices for multiple stocks
   */
  async getBulkPrices(symbols) {
    try {
      const quotes = await yahooFinance.quote(symbols);
      
      // Handle both single quote and array of quotes
      const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
      
      return quotesArray.map(quote => ({
        symbol: quote.symbol,
        currentPrice: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Bulk price fetch error:', error.message);
      throw new Error('Failed to fetch bulk price data');
    }
  }

  /**
   * Get detailed stock data including historical information
   */
  async getDetailedStockData(symbol) {
    try {
      const [quote, historical] = await Promise.allSettled([
        yahooFinance.quote(symbol),
        yahooFinance.historical(symbol, {
          period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          period2: new Date(),
          interval: '1d'
        })
      ]);

      return {
        quote: quote.status === 'fulfilled' ? quote.value : null,
        historical: historical.status === 'fulfilled' ? historical.value : null,
        error: quote.status === 'rejected' ? quote.reason.message : null
      };
    } catch (error) {
      console.error(`Detailed data fetch error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch detailed data for ${symbol}`);
    }
  }

  /**
   * Search for stocks
   */
  async searchStocks(query) {
    try {
      
      const searchResults = await yahooFinance.search(query, {
        quotesCount: 10,
        newsCount: 0
      });

      if (!searchResults || !searchResults.quotes || searchResults.quotes.length === 0) {
        console.log('No quotes found in search results');
        return [];
      }

      const mappedResults = searchResults.quotes.map(quote => ({
        symbol: quote.symbol,
        shortname: quote.shortname,
        longname: quote.longname,
        exchDisp: quote.exchDisp,
        typeDisp: quote.typeDisp
      }));

      return mappedResults;
    } catch (error) {
      console.error('Stock search error:', error.message);
      console.error('Error stack:', error.stack);
      
      // Return empty array instead of throwing error to prevent API from failing
      return [];
    }
  }
}

module.exports = new YahooFinanceService();
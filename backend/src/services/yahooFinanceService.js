const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;
const { createHttpClient } = require('../utils/httpClient');

class YahooFinanceService {
  constructor() {
    this.axiosInstance = createHttpClient();
  }

  /**
   * Common method to fetch Yahoo Finance data (eliminates duplication)
   */
  async fetchYahooData(symbol) {
    return await Promise.allSettled([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, { 
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'] 
      })
    ]);
  }

  /**
   * Build base stock object (eliminates object construction duplication)
   */
  buildStockObject(symbol, quote, fundamentals, extraFields = {}) {
    const summaryDetail = fundamentals.summaryDetail || {};
    const defaultKeyStatistics = fundamentals.defaultKeyStatistics || {};
    const financialData = fundamentals.financialData || {};

    const baseObject = {
      symbol: quote.symbol || symbol,
      name: quote.longName || quote.shortName || symbol,
      currentPrice: quote.regularMarketPrice || 0,
      exchange: this.getExchangeCode(quote.fullExchangeName || quote.exchange),
      peRatio: quote.trailingPE || defaultKeyStatistics.trailingPE || 0,
      latestEarnings: this.formatEarnings(quote),
      dayChange: quote.regularMarketChange || 0,
      dayChangePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap || defaultKeyStatistics.marketCap || 0,
      pbRatio: defaultKeyStatistics.priceToBook || 0,
      dividendYield: quote.trailingAnnualDividendYield || summaryDetail.dividendYield || 0,
      returnOnEquity: financialData.returnOnEquity || 0,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Yahoo Finance'
    };

    return { ...baseObject, ...extraFields };
  }

  async getComprehensiveStockData(symbol) {
    try {
      const [quote, fundamentals] = await this.fetchYahooData(symbol);

      const quoteData = quote.status === 'fulfilled' ? quote.value : {};
      const fundamentalData = fundamentals.status === 'fulfilled' ? fundamentals.value : {};
      
      return this.buildStockObject(symbol, quoteData, fundamentalData);
    } catch (error) {
      console.error(`Comprehensive data fetch error for ${symbol}:`, error.message);
      return this.getBasicStockData(symbol);
    }
  }

  parseMinimalStockData(symbol, quote, fundamentals) {
    return this.buildStockObject(symbol, quote, fundamentals);
  }

  formatEarnings(quote) {
    if (quote.earningsTimestamp) {
      return {
        date: new Date(quote.earningsTimestamp * 1000).toISOString(),
        eps: quote.epsTrailingTwelveMonths || 0
      };
    }
    return { date: null, eps: quote.epsTrailingTwelveMonths || 0 };
  }

 
  getExchangeCode(exchangeName) {
    if (!exchangeName) return 'NSE';
    
    const exchange = exchangeName.toUpperCase();
    if (exchange.includes('BSE') || exchange.includes('BOMBAY')) return 'BSE';
    if (exchange.includes('NSE') || exchange.includes('NATIONAL')) return 'NSE';
    
    return 'NSE';
  }


  async getBasicStockData(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol);
      return this.buildStockObject(symbol, quote, {}, {
        dataSource: 'Yahoo Finance Basic'
      });
    } catch (error) {
      console.error(`Basic data fetch error for ${symbol}:`, error.message);
      return {
        symbol,
        name: symbol,
        currentPrice: 0,
        exchange: 'NSE',
        peRatio: 0,
        latestEarnings: { date: null, eps: 0 },
        dayChange: 0,
        dayChangePercent: 0,
        volume: 0,
        marketCap: 0,
        pbRatio: 0,
        dividendYield: 0,
        returnOnEquity: 0,
        error: 'Data unavailable',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getBulkComprehensiveData(symbols) {
    try {
      const results = await Promise.allSettled(
        symbols.map(symbol => this.getComprehensiveStockData(symbol))
      );
      
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Bulk comprehensive data error:', error.message);
      throw new Error('Failed to fetch bulk comprehensive data');
    }
  }


  async getDetailedStockData(symbol) {
    try {
      const [quote, fundamentals] = await this.fetchYahooData(symbol);

      const quoteData = quote.status === 'fulfilled' ? quote.value : {};
      const fundamentalData = fundamentals.status === 'fulfilled' ? fundamentals.value : {};
      
      // Use base builder with extra fields for detailed view
      return this.buildStockObject(symbol, quoteData, fundamentalData, {
        previousClose: quoteData.regularMarketPreviousClose || 0,
        dayHigh: quoteData.regularMarketDayHigh || 0,
        dayLow: quoteData.regularMarketDayLow || 0,
        fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow || 0,
        beta: quoteData.beta || 1
      });
    } catch (error) {
      console.error(`Detailed data fetch error for ${symbol}:`, error.message);
      return this.getBasicStockData(symbol);
    }
  }
}

module.exports = new YahooFinanceService();
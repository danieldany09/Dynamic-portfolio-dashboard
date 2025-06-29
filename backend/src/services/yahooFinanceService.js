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
   * Get comprehensive stock data with all fundamentals needed for portfolio
   */
  async getComprehensiveStockData(symbol) {
    try {
      // Fetch multiple data points simultaneously for comprehensive coverage
      const [quote, fundamentals, financials] = await Promise.allSettled([
        yahooFinance.quote(symbol),
        yahooFinance.quoteSummary(symbol, { 
          modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'] 
        }),
        yahooFinance.quoteSummary(symbol, { 
          modules: ['incomeStatementHistory', 'balanceSheetHistory', 'cashflowStatementHistory'] 
        })
      ]);

      const quoteData = quote.status === 'fulfilled' ? quote.value : {};
      const fundamentalData = fundamentals.status === 'fulfilled' ? fundamentals.value : {};
      const financialData = financials.status === 'fulfilled' ? financials.value : {};

      return this.parseComprehensiveStockData(symbol, quoteData, fundamentalData, financialData);
    } catch (error) {
      console.error(`Comprehensive data fetch error for ${symbol}:`, error.message);
      return this.getBasicStockData(symbol);
    }
  }

  /**
   * Parse comprehensive financial data into structured format
   */
  parseComprehensiveStockData(symbol, quote, fundamentals, financials) {
    const summaryDetail = fundamentals.summaryDetail || {};
    const defaultKeyStatistics = fundamentals.defaultKeyStatistics || {};
    const financialData = fundamentals.financialData || {};
    const incomeStatement = financials.incomeStatementHistory?.incomeStatementHistory?.[0] || {};
    const balanceSheet = financials.balanceSheetHistory?.balanceSheetHistory?.[0] || {};
    const cashFlow = financials.cashflowStatementHistory?.cashflowStatementHistory?.[0] || {};

    return {
      // Basic Stock Information
      symbol: quote.symbol || symbol,
      name: quote.longName || quote.shortName || symbol,
      exchange: this.getExchangeCode(quote.fullExchangeName || quote.exchange),
      
      // Current Market Data
      currentPrice: quote.regularMarketPrice || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      dayChange: quote.regularMarketChange || 0,
      dayChangePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      
      // Price Ranges
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      
      // Valuation Metrics
      marketCap: quote.marketCap || defaultKeyStatistics.marketCap || 0,
      peRatio: quote.trailingPE || defaultKeyStatistics.trailingPE || 0,
      forwardPE: quote.forwardPE || defaultKeyStatistics.forwardPE || 0,
      pbRatio: defaultKeyStatistics.priceToBook || 0,
      pegRatio: defaultKeyStatistics.pegRatio || 0,
      priceToSales: defaultKeyStatistics.priceToSalesTrailing12Months || 0,
      evToEbitda: defaultKeyStatistics.enterpriseToEbitda || 0,
      
      // Financial Performance
      revenue: incomeStatement.totalRevenue || financialData.totalRevenue || 0,
      revenueGrowth: financialData.revenueGrowth || 0,
      grossProfit: incomeStatement.grossProfit || 0,
      ebitda: incomeStatement.ebitda || 0,
      operatingIncome: incomeStatement.operatingIncome || 0,
      netIncome: incomeStatement.netIncome || 0,
      eps: quote.trailingEps || defaultKeyStatistics.trailingEps || 0,
      epsGrowth: financialData.earningsGrowth || 0,
      
      // Latest Earnings Info
      latestEarnings: {
        date: quote.earningsTimestamp ? new Date(quote.earningsTimestamp * 1000).toISOString() : null,
        eps: quote.epsTrailingTwelveMonths || 0,
        revenue: incomeStatement.totalRevenue || 0,
        surprise: defaultKeyStatistics.lastEarningsSurprise || 0
      },
      
      // Margins
      grossMargin: financialData.grossMargins || 0,
      operatingMargin: financialData.operatingMargins || 0,
      profitMargin: financialData.profitMargins || 0,
      ebitdaMargin: incomeStatement.ebitda && incomeStatement.totalRevenue 
        ? (incomeStatement.ebitda / incomeStatement.totalRevenue) * 100
        : 0,
      
      // Balance Sheet
      totalAssets: balanceSheet.totalAssets || 0,
      totalLiabilities: balanceSheet.totalLiab || 0,
      totalEquity: balanceSheet.totalStockholderEquity || 0,
      totalDebt: balanceSheet.totalDebt || 0,
      cash: balanceSheet.cash || 0,
      
      // Financial Ratios
      currentRatio: financialData.currentRatio || 0,
      quickRatio: financialData.quickRatio || 0,
      debtToEquity: financialData.debtToEquity || 0,
      returnOnEquity: financialData.returnOnEquity || 0,
      returnOnAssets: financialData.returnOnAssets || 0,
      
      // Cash Flow
      operatingCashFlow: cashFlow.totalCashFromOperatingActivities || 0,
      freeCashFlow: defaultKeyStatistics.freeCashflow || 0,
      cashPerShare: defaultKeyStatistics.totalCashPerShare || 0,
      
      // Dividend Information
      dividendYield: quote.trailingAnnualDividendYield || summaryDetail.dividendYield || 0,
      dividendRate: quote.trailingAnnualDividendRate || summaryDetail.dividendRate || 0,
      payoutRatio: defaultKeyStatistics.payoutRatio || 0,
      exDividendDate: quote.exDividendDate || summaryDetail.exDividendDate,
      
      // Risk Metrics
      beta: quote.beta || defaultKeyStatistics.beta || 1,
      fiftyDayAverage: quote.fiftyDayAverage || summaryDetail.fiftyDayAverage || 0,
      twoHundredDayAverage: quote.twoHundredDayAverage || summaryDetail.twoHundredDayAverage || 0,
      
      // Additional Data
      sharesOutstanding: defaultKeyStatistics.sharesOutstanding || 0,
      floatShares: defaultKeyStatistics.floatShares || 0,
      bookValue: defaultKeyStatistics.bookValue || 0,
      priceToBook: defaultKeyStatistics.priceToBook || 0,
      
      // Meta Information
      lastUpdated: new Date().toISOString(),
      dataSource: 'Yahoo Finance Enhanced',
      currency: quote.currency || 'INR'
    };
  }

  /**
   * Get exchange code for Indian stocks
   */
  getExchangeCode(exchangeName) {
    if (!exchangeName) return 'NSE';
    
    const exchange = exchangeName.toUpperCase();
    if (exchange.includes('BSE') || exchange.includes('BOMBAY')) return 'BSE';
    if (exchange.includes('NSE') || exchange.includes('NATIONAL')) return 'NSE';
    
    // Default to NSE for Indian stocks
    return 'NSE';
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
   * Get basic stock data as fallback
   */
  async getBasicStockData(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol);
      return {
        symbol: quote.symbol || symbol,
        name: quote.longName || quote.shortName || symbol,
        exchange: this.getExchangeCode(quote.fullExchangeName),
        currentPrice: quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        dayChange: quote.regularMarketChange || 0,
        dayChangePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        peRatio: quote.trailingPE || 0,
        eps: quote.trailingEps || 0,
        beta: quote.beta || 1,
        latestEarnings: {
          date: null,
          eps: quote.epsTrailingTwelveMonths || 0,
          revenue: 0,
          surprise: 0
        },
        lastUpdated: new Date().toISOString(),
        dataSource: 'Yahoo Finance Basic'
      };
    } catch (error) {
      console.error(`Basic data fetch error for ${symbol}:`, error.message);
      return {
        symbol,
        name: symbol,
        exchange: 'NSE',
        currentPrice: 0,
        error: 'Data unavailable',
        lastUpdated: new Date().toISOString()
      };
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
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Bulk price fetch error:', error.message);
      throw new Error('Failed to fetch bulk price data');
    }
  }

  /**
   * Get bulk comprehensive data for multiple stocks
   */
  async getBulkComprehensiveData(symbols) {
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getComprehensiveStockData(symbol))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
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
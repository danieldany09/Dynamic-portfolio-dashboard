const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class GoogleFinanceService {
  constructor() {
    this.baseURL = 'https://www.google.com/finance/quote/';
    this.axiosInstance = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
  }

  /**
   * Get comprehensive fundamental data for portfolio requirements
   */
  async getComprehensiveFundamentals(symbol) {
    try {
      const googleSymbol = this.convertToGoogleSymbol(symbol);
      const url = `${this.baseURL}${googleSymbol}`;

      // Try Cheerio first (faster), fallback to Puppeteer if needed
      try {
        const response = await this.axiosInstance.get(url);
        return await this.parseComprehensiveDataWithCheerio(response.data, symbol);
      } catch (cheerioError) {
        console.log(`Cheerio failed for ${symbol}, trying Puppeteer...`);
        return await this.parseComprehensiveDataWithPuppeteer(url, symbol);
      }
    } catch (error) {
      console.error(`Google Finance comprehensive error for ${symbol}:`, error.message);
      return this.getDefaultFundamentals(symbol);
    }
  }

  /**
   * Parse comprehensive data using Cheerio for portfolio table requirements
   */
  async parseComprehensiveDataWithCheerio(html, symbol) {
    const $ = cheerio.load(html);
    
    const fundamentals = {
      symbol,
      
      // Core Portfolio Table Requirements
      peRatio: this.extractMetric($, 'PE ratio', 'P/E ratio', 'Price-to-earnings'),
      latestEarnings: this.extractEarningsData($),
      
      // Additional Financial Metrics
      pbRatio: this.extractMetric($, 'PB ratio', 'Price/Book', 'Price-to-book'),
      marketCap: this.extractMetric($, 'Market cap'),
      eps: this.extractMetric($, 'EPS', 'Earnings per share'),
      
      // Dividend Information
      dividendYield: this.extractMetric($, 'Dividend yield'),
      
      // Financial Performance Ratios
      profitMargin: this.extractMetric($, 'Profit margin', 'Net margin'),
      operatingMargin: this.extractMetric($, 'Operating margin'),
      roe: this.extractMetric($, 'Return on equity', 'ROE'),
      roa: this.extractMetric($, 'Return on assets', 'ROA'),
      
      // Growth Metrics
      revenueGrowth: this.extractMetric($, 'Revenue growth', 'Sales growth'),
      epsGrowth: this.extractMetric($, 'EPS growth', 'Earnings growth'),
      
      // Debt and Liquidity
      debtToEquity: this.extractMetric($, 'Debt-to-equity', 'D/E ratio', 'Debt/Equity'),
      currentRatio: this.extractMetric($, 'Current ratio'),
      
      // Valuation Metrics
      pegRatio: this.extractMetric($, 'PEG ratio'),
      priceToSales: this.extractMetric($, 'Price/Sales', 'P/S ratio'),
      evToEbitda: this.extractMetric($, 'EV/EBITDA'),
      
      // Meta Information
      lastUpdated: new Date().toISOString(),
      dataSource: 'Google Finance Enhanced'
    };

    return fundamentals;
  }

  /**
   * Extract specific earnings data from Google Finance page
   */
  extractEarningsData($) {
    const earningsData = {
      date: null,
      eps: null,
      revenue: null,
      surprise: null,
      estimate: null
    };

    try {
      // Try to find earnings announcement date
      const earningsSelectors = [
        '.VfPpkd-WsjYwc:contains("Earnings date")',
        '.VfPpkd-WsjYwc:contains("Next earnings")',
        '.gyFHrc:contains("Earnings")'
      ];

      for (const selector of earningsSelectors) {
        const earningsElement = $(selector);
        if (earningsElement.length > 0) {
          const dateText = earningsElement.next('.P6K39c').text().trim();
          if (dateText && dateText !== '—') {
            earningsData.date = dateText;
            break;
          }
        }
      }

      // Extract latest EPS
      const epsElement = $('[data-test="EPS"] .P6K39c').first();
      if (epsElement.length > 0) {
        const epsText = epsElement.text().trim();
        if (epsText && epsText !== '—') {
          earningsData.eps = this.parseNumericValue(epsText);
        }
      }

      // Extract revenue information
      const revenueElement = $('[data-test="Revenue"] .P6K39c').first();
      if (revenueElement.length > 0) {
        const revenueText = revenueElement.text().trim();
        if (revenueText && revenueText !== '—') {
          earningsData.revenue = this.parseNumericValue(revenueText);
        }
      }

    } catch (error) {
      console.error('Error extracting earnings data:', error);
    }

    return earningsData;
  }

  /**
   * Extract metric value from HTML using multiple possible selectors
   */
  extractMetric($, ...metricNames) {
    for (const metricName of metricNames) {
      // Try different selector patterns
      const selectors = [
        `[data-test="${metricName}"] .P6K39c`,
        `[aria-label*="${metricName}"] .P6K39c`,
        `.VfPpkd-WsjYwc:contains("${metricName}") + .P6K39c`,
        `.gyFHrc:contains("${metricName}") .P6K39c`,
        `.Tnmv7d:contains("${metricName}") + .IsqQVc`
      ];

      for (const selector of selectors) {
        try {
          const element = $(selector).first();
          if (element.length > 0) {
            const text = element.text().trim();
            if (text && text !== '—' && text !== 'N/A' && text !== '-') {
              return this.parseNumericValue(text);
            }
          }
        } catch (e) {
          continue;
        }
      }
    }
    return null;
  }

  /**
   * Parse and convert string values to appropriate format
   */
  parseNumericValue(text) {
    if (!text || text === '—' || text === 'N/A' || text === '-') return null;
    
    // Handle percentage values
    if (text.includes('%')) {
      const numValue = parseFloat(text.replace('%', ''));
      return isNaN(numValue) ? null : numValue;
    }
    
    // Handle currency values (remove currency symbols)
    let cleanText = text.replace(/[₹$€£¥,]/g, '');
    
    // Handle abbreviated numbers (K, M, B, T)
    const multipliers = {
      'K': 1000,
      'M': 1000000,
      'B': 1000000000,
      'T': 1000000000000
    };
    
    const lastChar = cleanText.slice(-1).toUpperCase();
    if (multipliers[lastChar]) {
      const baseValue = parseFloat(cleanText.slice(0, -1));
      if (!isNaN(baseValue)) {
        return baseValue * multipliers[lastChar];
      }
    }
    
    // Try to parse as regular number
    const numValue = parseFloat(cleanText);
    return isNaN(numValue) ? text : numValue;
  }

  /**
   * Parse comprehensive data using Puppeteer for JavaScript-heavy pages
   */
  async parseComprehensiveDataWithPuppeteer(url, symbol) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

      const fundamentals = await page.evaluate((sym) => {
        const data = { 
          symbol: sym,
          peRatio: null,
          pbRatio: null,
          marketCap: null,
          eps: null,
          dividendYield: null,
          roe: null,
          debtToEquity: null,
          latestEarnings: {
            date: null,
            eps: null,
            revenue: null
          }
        };
        
        // Helper function to extract metric
        const extractMetric = (metricNames) => {
          for (const metricName of metricNames) {
            const selectors = [
              `[data-test="${metricName}"] .P6K39c`,
              `[aria-label*="${metricName}"] .P6K39c`
            ];
            
            for (const selector of selectors) {
              const element = document.querySelector(selector);
              if (element && element.textContent.trim() !== '—') {
                return element.textContent.trim();
              }
            }
          }
          return null;
        };

        // Extract core metrics needed for portfolio table
        data.peRatio = extractMetric(['PE ratio', 'P/E ratio']);
        data.pbRatio = extractMetric(['PB ratio', 'Price/Book']);
        data.marketCap = extractMetric(['Market cap']);
        data.eps = extractMetric(['EPS', 'Earnings per share']);
        data.dividendYield = extractMetric(['Dividend yield']);
        data.roe = extractMetric(['Return on equity', 'ROE']);
        data.debtToEquity = extractMetric(['Debt-to-equity', 'D/E ratio']);

        // Extract earnings information
        data.latestEarnings.eps = extractMetric(['EPS', 'Earnings per share']);
        data.latestEarnings.date = extractMetric(['Earnings date', 'Next earnings']);

        return data;
      }, symbol);

      return {
        ...fundamentals,
        lastUpdated: new Date().toISOString(),
        dataSource: 'Google Finance (Puppeteer)'
      };
    } catch (error) {
      console.error(`Puppeteer error for ${symbol}:`, error.message);
      return this.getDefaultFundamentals(symbol);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Get fundamental data using web scraping (original method for compatibility)
   */
  async getFundamentals(symbol) {
    try {
      const googleSymbol = this.convertToGoogleSymbol(symbol);
      const url = `${this.baseURL}${googleSymbol}`;

      try {
        const response = await this.axiosInstance.get(url);
        return this.parseWithCheerio(response.data, symbol);
      } catch (cheerioError) {
        console.log(`Cheerio failed for ${symbol}, trying Puppeteer...`);
        return await this.parseWithPuppeteer(url, symbol);
      }
    } catch (error) {
      console.error(`Google Finance error for ${symbol}:`, error.message);
      return {
        symbol,
        peRatio: 'N/A',
        latestEarnings: 'N/A',
        marketCap: 'N/A',
        error: error.message
      };
    }
  }

  /**
   * Parse data using Cheerio (original method)
   */
  parseWithCheerio(html, symbol) {
    const $ = cheerio.load(html);
    
    const fundamentals = {
      symbol,
      peRatio: 'N/A',
      latestEarnings: 'N/A',
      marketCap: 'N/A',
      dividend: 'N/A',
      eps: 'N/A'
    };

    // Extract P/E ratio
    $('[data-test="PE ratio"] .P6K39c').each((i, el) => {
      const peText = $(el).text().trim();
      if (peText && peText !== '—') {
        fundamentals.peRatio = peText;
      }
    });

    // Extract Market Cap
    $('[data-test="Market cap"] .P6K39c').each((i, el) => {
      const mcText = $(el).text().trim();
      if (mcText && mcText !== '—') {
        fundamentals.marketCap = mcText;
      }
    });

    // Extract EPS
    $('[data-test="EPS"] .P6K39c').each((i, el) => {
      const epsText = $(el).text().trim();
      if (epsText && epsText !== '—') {
        fundamentals.eps = epsText;
      }
    });

    // Extract Dividend
    $('[data-test="Dividend yield"] .P6K39c').each((i, el) => {
      const divText = $(el).text().trim();
      if (divText && divText !== '—') {
        fundamentals.dividend = divText;
      }
    });

    return fundamentals;
  }

  /**
   * Parse data using Puppeteer (original method)
   */
  async parseWithPuppeteer(url, symbol) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

      const fundamentals = await page.evaluate((sym) => {
        const data = { symbol: sym, peRatio: 'N/A', latestEarnings: 'N/A', marketCap: 'N/A' };
        
        // Extract P/E ratio
        const peElement = document.querySelector('[data-test="PE ratio"] .P6K39c');
        if (peElement && peElement.textContent.trim() !== '—') {
          data.peRatio = peElement.textContent.trim();
        }

        // Extract Market Cap
        const mcElement = document.querySelector('[data-test="Market cap"] .P6K39c');
        if (mcElement && mcElement.textContent.trim() !== '—') {
          data.marketCap = mcElement.textContent.trim();
        }

        return data;
      }, symbol);

      return fundamentals;
    } catch (error) {
      console.error(`Puppeteer error for ${symbol}:`, error.message);
      return { symbol, peRatio: 'N/A', latestEarnings: 'N/A', marketCap: 'N/A' };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Get default fundamentals structure for error cases
   */
  getDefaultFundamentals(symbol) {
    return {
      symbol,
      peRatio: null,
      pbRatio: null,
      marketCap: null,
      eps: null,
      dividendYield: null,
      roe: null,
      roa: null,
      debtToEquity: null,
      profitMargin: null,
      operatingMargin: null,
      revenueGrowth: null,
      epsGrowth: null,
      pegRatio: null,
      priceToSales: null,
      evToEbitda: null,
      currentRatio: null,
      latestEarnings: {
        date: null,
        eps: null,
        revenue: null,
        surprise: null
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'Google Finance (Default)',
      error: 'Unable to fetch data'
    };
  }

  /**
   * Convert NSE symbols to Google Finance format
   */
  convertToGoogleSymbol(symbol) {
    // Remove .NS suffix and convert to Google Finance format
    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
    return `${cleanSymbol}:NSE`;
  }

  /**
   * Get earnings data
   */
  async getEarningsData(symbol) {
    try {
      const comprehensiveData = await this.getComprehensiveFundamentals(symbol);
      return comprehensiveData.latestEarnings || {
        symbol,
        date: null,
        eps: null,
        revenue: null,
        surprise: null
      };
    } catch (error) {
      console.error(`Earnings data error for ${symbol}:`, error.message);
      return {
        symbol,
        date: null,
        eps: null,
        revenue: null,
        error: error.message
      };
    }
  }

  /**
   * Get bulk fundamentals for multiple stocks
   */
  async getBulkFundamentals(symbols) {
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getComprehensiveFundamentals(symbol))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }
}

module.exports = new GoogleFinanceService();
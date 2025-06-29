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
   * Get fundamental data using web scraping
   */
  async getFundamentals(symbol) {
    try {
      // Convert NSE symbols to Google Finance format
      const googleSymbol = this.convertToGoogleSymbol(symbol);
      const url = `${this.baseURL}${googleSymbol}`;

      // Try Cheerio first (faster)
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
   * Parse data using Cheerio (lightweight HTML parsing)
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
   * Parse data using Puppeteer (for JavaScript-heavy pages)
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
   * Convert NSE symbols to Google Finance format
   */
  convertToGoogleSymbol(symbol) {
    // Remove .NS suffix and convert to Google Finance format
    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
    return `${cleanSymbol}:NSE`;
  }

  /**
   * Get earnings data (placeholder for future implementation)
   */
  async getEarningsData(symbol) {
    // This would require more complex scraping or API integration
    return {
      symbol,
      latestEarnings: 'N/A',
      nextEarningsDate: 'N/A',
      estimatedEPS: 'N/A'
    };
  }
}

module.exports = new GoogleFinanceService();
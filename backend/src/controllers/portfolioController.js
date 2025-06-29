const yahooFinanceService = require('../services/yahooFinanceService');
const googleFinanceService = require('../services/googleFinanceService');
const dataAggregationService = require('../services/dataAggregationService');
const cache = require('../utils/cache');
const { validatePortfolioData } = require('../utils/dataValidator');

/**
 * Helper function to enrich portfolio data with real-time information
 */
async function enrichPortfolioData(stocks) {
  const enrichedStocks = await Promise.allSettled(
    stocks.map(async (stock) => {
      try {
        // Get real-time price from Yahoo Finance
        const priceData = await yahooFinanceService.getStockPrice(stock.symbol);
        
        // Get P/E ratio and earnings from Google Finance
        const fundamentalData = await googleFinanceService.getFundamentals(stock.symbol);

        // Calculate derived values
        const investment = stock.purchasePrice * stock.quantity;
        const presentValue = priceData.currentPrice * stock.quantity;
        const gainLoss = presentValue - investment;
        const gainLossPercentage = ((gainLoss / investment) * 100).toFixed(2);

        return {
          ...stock,
          currentPrice: priceData.currentPrice,
          previousClose: priceData.previousClose,
          change: priceData.change,
          changePercent: priceData.changePercent,
          investment,
          presentValue,
          gainLoss,
          gainLossPercentage,
          peRatio: fundamentalData?.peRatio || 'N/A',
          latestEarnings: fundamentalData?.latestEarnings || 'N/A',
          marketCap: fundamentalData?.marketCap || 'N/A',
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error enriching data for ${stock.symbol}:`, error.message);
        // Return stock with error state
        return {
          ...stock,
          error: 'Data unavailable',
          currentPrice: 0,
          investment: stock.purchasePrice * stock.quantity,
          presentValue: 0,
          gainLoss: 0,
          gainLossPercentage: '0.00'
        };
      }
    })
  );

  return enrichedStocks
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
}

/**
 * Helper function to get portfolio data
 */
async function getPortfolioData() {
  // In production, this would fetch from database
  const sampleStocks = [
    { symbol: 'RELIANCE.NS', purchasePrice: 2400, quantity: 10, sector: 'Energy' },
    { symbol: 'TCS.NS', purchasePrice: 3200, quantity: 5, sector: 'Technology' },
    { symbol: 'HDFCBANK.NS', purchasePrice: 1600, quantity: 15, sector: 'Banking' },
    { symbol: 'INFY.NS', purchasePrice: 1400, quantity: 8, sector: 'Technology' }
  ];

  return await enrichPortfolioData(sampleStocks);
}

/**
 * Get complete portfolio data with real-time updates
 */
async function getPortfolio(req, res, next) {
  try {
    const cacheKey = 'portfolio_data';
    let portfolioData = cache.get(cacheKey);

    if (!portfolioData) {
      // Sample portfolio data - in production, this would come from database
      const sampleStocks = [
        { symbol: 'RELIANCE.NS', purchasePrice: 2400, quantity: 10, sector: 'Energy' },
        { symbol: 'TCS.NS', purchasePrice: 3200, quantity: 5, sector: 'Technology' },
        { symbol: 'HDFCBANK.NS', purchasePrice: 1600, quantity: 15, sector: 'Banking' },
        { symbol: 'INFY.NS', purchasePrice: 1400, quantity: 8, sector: 'Technology' }
      ];

      portfolioData = await enrichPortfolioData(sampleStocks);
      
      // Cache for 30 seconds to balance real-time updates and API limits
      cache.set(cacheKey, portfolioData, 30);
    }

    res.status(200).json({
      success: true,
      data: portfolioData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get sector-wise portfolio summary
 */
async function getSectorSummary(req, res, next) {
  try {
    const cacheKey = 'sector_summary';
    let sectorData = cache.get(cacheKey);

    if (!sectorData) {
      const portfolioData = await getPortfolioData();
      sectorData = dataAggregationService.groupBySector(portfolioData);
      cache.set(cacheKey, sectorData, 30);
    }

    res.status(200).json({
      success: true,
      data: sectorData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get real-time price updates for all portfolio stocks
 */
async function getRealTimePrices(req, res, next) {
  try {
    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({
        success: false,
        error: 'Stock symbols are required'
      });
    }

    const symbolArray = symbols.split(',');
    const priceData = await yahooFinanceService.getBulkPrices(symbolArray);

    res.status(200).json({
      success: true,
      data: priceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPortfolio,
  getSectorSummary,
  getRealTimePrices
};
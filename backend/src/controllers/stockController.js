const yahooFinanceService = require('../services/yahooFinanceService');
const googleFinanceService = require('../services/googleFinanceService');
const cache = require('../utils/cache');

/**
 * Get detailed stock information
 */
async function getStockDetails(req, res, next) {
  try {
    const { symbol } = req.params;
    const cacheKey = `stock_${symbol}`;
    
    let stockData = cache.get(cacheKey);

    if (!stockData) {
      const [priceData, fundamentalData] = await Promise.allSettled([
        yahooFinanceService.getDetailedStockData(symbol),
        googleFinanceService.getFundamentals(symbol)
      ]);

      stockData = {
        symbol,
        priceData: priceData.status === 'fulfilled' ? priceData.value : null,
        fundamentalData: fundamentalData.status === 'fulfilled' ? fundamentalData.value : null,
        lastUpdated: new Date().toISOString()
      };

      cache.set(cacheKey, stockData, 60); // Cache for 1 minute
    }

    res.status(200).json({
      success: true,
      data: stockData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Search for stocks
 */
async function searchStocks(req, res, next) {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const searchResults = await yahooFinanceService.searchStocks(query);

    res.status(200).json({
      success: true,
      data: searchResults
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStockDetails,
  searchStocks
};
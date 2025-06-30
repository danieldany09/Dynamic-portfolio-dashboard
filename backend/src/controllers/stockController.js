const yahooFinanceService = require('../services/yahooFinanceService');
const googleFinanceService = require('../services/googleFinanceService');
const cache = require('../utils/cache');
const { CACHE_KEYS } = require('../config/constants');

async function getStockDetails(req, res, next) {
  try {
    const { symbol } = req.params;
    const cacheKey = `${CACHE_KEYS.STOCK_DETAILS}${symbol}`;
    
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

      cache.set(cacheKey, stockData, 60);
    }

    res.status(200).json({
      success: true,
      data: stockData
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStockDetails
};
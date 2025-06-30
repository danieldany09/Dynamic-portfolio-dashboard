const yahooFinanceService = require('../services/yahooFinanceService');
const googleFinanceService = require('../services/googleFinanceService');
const dataAggregationService = require('../services/dataAggregationService');
const cache = require('../utils/cache');
const { CACHE_KEYS } = require('../config/constants');

/**
 * Get complete portfolio data with comprehensive financial metrics
 */
async function getPortfolio(req, res, next) {
  try {
    const cacheKey = CACHE_KEYS.PORTFOLIO;
    let portfolioData = cache.get(cacheKey);

    if (!portfolioData) {
      console.log('Fetching fresh portfolio data...');
      
      portfolioData = await dataAggregationService.createPortfolioData();
      console.log('portfolioDataaa', portfolioData);
      cache.set(cacheKey, portfolioData, 30);
      
      console.log(`Portfolio data refreshed with ${portfolioData.length} stocks`);
    }

    // Calculate summary metrics
    const summary = {
      totalStocks: portfolioData.length,
      totalInvestment: portfolioData.reduce((sum, stock) => sum + (stock.investment || 0), 0),
      totalCurrentValue: portfolioData.reduce((sum, stock) => sum + (stock.presentValue || 0), 0),
      totalGainLoss: portfolioData.reduce((sum, stock) => sum + (stock.gainLoss || 0), 0),
      overallGainLossPercent: (() => {
        const totalInv = portfolioData.reduce((sum, stock) => sum + (stock.investment || 0), 0);
        const totalGainLoss = portfolioData.reduce((sum, stock) => sum + (stock.gainLoss || 0), 0);
        return totalInv > 0 ? parseFloat(((totalGainLoss / totalInv) * 100).toFixed(2)) : 0;
      })()
    };

    res.status(200).json({
      success: true,
      data: {
        stocks: portfolioData.map(stock => ({
          particulars: stock.particulars,
          symbol: stock.symbol,
          purchasePrice: stock.purchasePrice,
          quantity: stock.quantity,
          investment: stock.investment,
          portfolioPercentage: stock.portfolioPercentage,
          exchange: stock.exchange,
          cmp: stock.cmp,
          presentValue: stock.presentValue,
          gainLoss: stock.gainLoss,
          gainLossPercentage: stock.gainLossPercentage,
          peRatio: stock.peRatio,
          latestEarnings: stock.latestEarnings,
          sector: stock.sector,
          lastUpdated: stock.lastUpdated
        })),
        summary
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Portfolio data error:', error);
    next(error);
  }
}

/**
 * Get sector-wise portfolio summary
 */
async function getSectorSummary(req, res, next) {
  try {
    const cacheKey = CACHE_KEYS.SECTOR_SUMMARY;
    let sectorData = cache.get(cacheKey);

    if (!sectorData) {
      console.log('Calculating sector summary...');
      
      const portfolioData = await dataAggregationService.createPortfolioData();
      
      sectorData = dataAggregationService.groupBySector(portfolioData);
      
      cache.set(cacheKey, sectorData, 30);
      
      console.log(`Sector summary calculated for ${sectorData.sectors.length} sectors`);
    }

    res.status(200).json({
      success: true,
      data: sectorData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sector summary error:', error);
    next(error);
  }
}

/**
 * Get real-time price updates for portfolio stocks
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
    
    const priceData = await yahooFinanceService.getBulkComprehensiveData(symbolArray);

    res.status(200).json({
      success: true,
      data: priceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Real-time prices error:', error);
    next(error);
  }
}

module.exports = {
  getPortfolio,
  getSectorSummary,
  getRealTimePrices
};
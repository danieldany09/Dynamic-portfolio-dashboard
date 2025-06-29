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
 * Get complete portfolio data with comprehensive financial metrics
 */
async function getPortfolio(req, res, next) {
  try {
    const cacheKey = 'comprehensive_portfolio_data';
    let portfolioData = cache.get(cacheKey);

    if (!portfolioData) {
      console.log('Fetching fresh portfolio data...');
      
      // Get comprehensive portfolio data matching Excel structure
      portfolioData = await dataAggregationService.createPortfolioData();
      
      // Cache for 30 seconds to balance real-time updates and API limits
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
        // Portfolio table data matching Excel structure
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
    const cacheKey = 'sector_summary';
    let sectorData = cache.get(cacheKey);

    if (!sectorData) {
      console.log('Calculating sector summary...');
      
      // Get fresh portfolio data
      const portfolioData = await dataAggregationService.createPortfolioData();
      
      // Calculate sector analytics
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
    
    // Get comprehensive data
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
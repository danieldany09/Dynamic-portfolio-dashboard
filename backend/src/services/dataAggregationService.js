class DataAggregationService {
    /**
     * Group portfolio data by sectors
     */
    groupBySector(portfolioData) {
      const sectorMap = new Map();
  
      portfolioData.forEach(stock => {
        const sector = stock.sector || 'Uncategorized';
        
        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, {
            sector,
            stocks: [],
            totalInvestment: 0,
            totalPresentValue: 0,
            totalGainLoss: 0,
            stockCount: 0
          });
        }
  
        const sectorData = sectorMap.get(sector);
        sectorData.stocks.push(stock);
        sectorData.totalInvestment += stock.investment || 0;
        sectorData.totalPresentValue += stock.presentValue || 0;
        sectorData.totalGainLoss += stock.gainLoss || 0;
        sectorData.stockCount += 1;
      });
  
      // Convert map to array and calculate percentages
      const sectors = Array.from(sectorMap.values()).map(sector => ({
        ...sector,
        gainLossPercentage: sector.totalInvestment > 0 
          ? ((sector.totalGainLoss / sector.totalInvestment) * 100).toFixed(2)
          : '0.00',
        portfolioPercentage: this.calculatePortfolioPercentage(
          sector.totalInvestment, 
          portfolioData
        )
      }));
  
      return {
        sectors,
        summary: this.calculatePortfolioSummary(portfolioData)
      };
    }
  
    /**
     * Calculate portfolio percentage for a sector
     */
    calculatePortfolioPercentage(sectorInvestment, portfolioData) {
      const totalInvestment = portfolioData.reduce(
        (sum, stock) => sum + (stock.investment || 0), 
        0
      );
      
      return totalInvestment > 0 
        ? ((sectorInvestment / totalInvestment) * 100).toFixed(2)
        : '0.00';
    }
  
    /**
     * Calculate overall portfolio summary
     */
    calculatePortfolioSummary(portfolioData) {
      const summary = portfolioData.reduce(
        (acc, stock) => ({
          totalInvestment: acc.totalInvestment + (stock.investment || 0),
          totalPresentValue: acc.totalPresentValue + (stock.presentValue || 0),
          totalGainLoss: acc.totalGainLoss + (stock.gainLoss || 0),
          stockCount: acc.stockCount + 1
        }),
        { totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0, stockCount: 0 }
      );
  
      return {
        ...summary,
        overallGainLossPercentage: summary.totalInvestment > 0
          ? ((summary.totalGainLoss / summary.totalInvestment) * 100).toFixed(2)
          : '0.00'
      };
    }
  
    /**
     * Calculate portfolio metrics
     */
    calculateMetrics(portfolioData) {
      const metrics = {
        totalValue: 0,
        totalInvested: 0,
        totalGainLoss: 0,
        dayChange: 0,
        topGainer: null,
        topLoser: null,
        mostActive: null
      };
  
      let maxGain = -Infinity;
      let maxLoss = Infinity;
      let maxVolume = 0;
  
      portfolioData.forEach(stock => {
        metrics.totalValue += stock.presentValue || 0;
        metrics.totalInvested += stock.investment || 0;
        metrics.totalGainLoss += stock.gainLoss || 0;
        metrics.dayChange += (stock.change || 0) * (stock.quantity || 0);
  
        // Track top gainer
        if (stock.changePercent > maxGain) {
          maxGain = stock.changePercent;
          metrics.topGainer = stock;
        }
  
        // Track top loser
        if (stock.changePercent < maxLoss) {
          maxLoss = stock.changePercent;
          metrics.topLoser = stock;
        }
  
        // Track most active (by volume)
        if ((stock.volume || 0) > maxVolume) {
          maxVolume = stock.volume || 0;
          metrics.mostActive = stock;
        }
      });
  
      return metrics;
    }
  }
  
  module.exports = new DataAggregationService();
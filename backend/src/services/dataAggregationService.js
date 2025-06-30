const yahooFinanceService = require('./yahooFinanceService');
const googleFinanceService = require('./googleFinanceService');

class DataAggregationService {

    calculatePercentage(value, total, decimals = 2) {
      return total > 0 ? parseFloat(((value / total) * 100).toFixed(decimals)) : 0;
    }

    createStockTemplate(stock, investment, presentValue, gainLoss, extraData = {}) {
      return {
        // Core Portfolio Table Columns
        particulars: stock.name,
        symbol: stock.symbol,
        purchasePrice: stock.purchasePrice,
        quantity: stock.quantity,
        investment,
        exchange: extraData.exchange || 'NSE',
        cmp: extraData.currentPrice || stock.purchasePrice,
        presentValue,
        gainLoss,
        gainLossPercentage: this.calculatePercentage(gainLoss, investment),
        peRatio: extraData.peRatio || 0,
        latestEarnings: extraData.latestEarnings || 'N/A',
        sector: stock.sector,
        portfolioPercentage: 0, // Will be calculated after all stocks are processed
        
        // Additional display data
        dayChange: extraData.dayChange || 0,
        dayChangePercent: extraData.dayChangePercent || 0,
        volume: extraData.volume || 0,
        marketCap: extraData.marketCap || 0,
        pbRatio: extraData.pbRatio || 0,
        dividendYield: extraData.dividendYield || 0,
        roe: extraData.roe || 0,
        
        // Meta information
        lastUpdated: new Date().toISOString(),
        dataSource: extraData.dataSource || 'API data unavailable',
        ...extraData.meta
      };
    }

    async createPortfolioData() {
      const portfolioStocks = [
        // Financial Sector
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', purchasePrice: 2000, quantity: 50, sector: 'Financial' },
        { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', purchasePrice: 6466, quantity: 15, sector: 'Financial' },
        { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', purchasePrice: 780, quantity: 84, sector: 'Financial' },
        { symbol: 'BAJAJHLDNG.NS', name: 'Bajaj Holdings', purchasePrice: 130, quantity: 504, sector: 'Financial' },
        { symbol: 'SBILIFE.NS', name: 'SBI Life', purchasePrice: 24, quantity: 1080, sector: 'Financial' },

        // Technology Sector  
        { symbol: 'AFFLE.NS', name: 'Affle India', purchasePrice: 1151, quantity: 50, sector: 'Technology' },
        { symbol: 'LTIM.NS', name: 'LTI Mindtree', purchasePrice: 4775, quantity: 16, sector: 'Technology' },
        { symbol: 'KPIT.NS', name: 'KPIT Tech', purchasePrice: 672, quantity: 61, sector: 'Technology' },
        { symbol: 'TATATECH.NS', name: 'Tata Tech', purchasePrice: 1072, quantity: 63, sector: 'Technology' },
        { symbol: 'BLS.NS', name: 'BLS E Services', purchasePrice: 232, quantity: 191, sector: 'Technology' },
        { symbol: 'TANLA.NS', name: 'Tanla', purchasePrice: 1134, quantity: 45, sector: 'Technology' },

        // Consumer Sector
        { symbol: 'DMART.NS', name: 'D-Mart', purchasePrice: 3777, quantity: 27, sector: 'Consumer' },
        { symbol: 'TATACONS.NS', name: 'Tata Consumer', purchasePrice: 845, quantity: 90, sector: 'Consumer' },
        { symbol: 'PIDILITIND.NS', name: 'Pidilite', purchasePrice: 2376, quantity: 36, sector: 'Consumer' },

        // Power Sector
        { symbol: 'TATAPOWER.NS', name: 'Tata Power', purchasePrice: 224, quantity: 225, sector: 'Power' },
        { symbol: 'KPIGREEN.NS', name: 'KPI Green', purchasePrice: 875, quantity: 50, sector: 'Power' },
        { symbol: 'SUZLON.NS', name: 'Suzlon', purchasePrice: 44, quantity: 450, sector: 'Power' },
        { symbol: 'GENSOL.NS', name: 'Gensol', purchasePrice: 998, quantity: 45, sector: 'Power' },

        // Pipe Sector
        { symbol: 'HARIOMPIPE.NS', name: 'Hariom Pipes', purchasePrice: 580, quantity: 60, sector: 'Pipe' },
        { symbol: 'ASTRAL.NS', name: 'Astral', purchasePrice: 1517, quantity: 56, sector: 'Pipe' },
        { symbol: 'POLYCAB.NS', name: 'Polycab', purchasePrice: 2818, quantity: 28, sector: 'Pipe' },

        // Others
        { symbol: 'CLEANSCIENCE.NS', name: 'Clean Science', purchasePrice: 1610, quantity: 32, sector: 'Others' },
        { symbol: 'DEEPAKNTR.NS', name: 'Deepak Nitrite', purchasePrice: 2248, quantity: 27, sector: 'Others' },
        { symbol: 'FINEORG.NS', name: 'Fine Organic', purchasePrice: 4284, quantity: 16, sector: 'Others' },
        { symbol: 'GRAVITA.NS', name: 'Gravita', purchasePrice: 2037, quantity: 8, sector: 'Others' },
        { symbol: 'SBILIFE.NS', name: 'SBI Life', purchasePrice: 1197, quantity: 49, sector: 'Others' }
      ];

      console.log('Fetching live market data for portfolio...');
      
      // Fetch real-time data for all stocks
      const enrichedStocks = await Promise.allSettled(
        portfolioStocks.map(async (stock) => {
          try {
            // Get Yahoo Finance data
            const yahooData = await yahooFinanceService.getComprehensiveStockData(stock.symbol);
            
            // Get Google Finance fundamentals (as backup)
            let googleData = {};
            try {
              googleData = await googleFinanceService.getComprehensiveFundamentals(stock.symbol);
            } catch (error) {
              console.log(`Google Finance data unavailable for ${stock.symbol}`);
            }

            // Calculate portfolio metrics
            const investment = stock.purchasePrice * stock.quantity;
            const currentPrice = yahooData.currentPrice || stock.purchasePrice;
            const presentValue = currentPrice * stock.quantity;
            const gainLoss = presentValue - investment;

            // Use template with success data
            return this.createStockTemplate(stock, investment, presentValue, gainLoss, {
              exchange: yahooData.exchange,
              currentPrice,
              peRatio: yahooData.peRatio || googleData.peRatio,
              latestEarnings: this.formatEarnings(yahooData.latestEarnings || googleData.latestEarnings),
              dayChange: yahooData.dayChange,
              dayChangePercent: yahooData.dayChangePercent,
              volume: yahooData.volume,
              marketCap: yahooData.marketCap,
              pbRatio: googleData.pbRatio || yahooData.pbRatio,
              dividendYield: yahooData.dividendYield || googleData.dividendYield,
              roe: googleData.roe || yahooData.returnOnEquity,
              dataSource: 'Yahoo + Google Finance'
            });
          } catch (error) {
            console.error(`Error processing ${stock.symbol}:`, error.message);
            
            // Use template with error data (much simpler now)
            const investment = stock.purchasePrice * stock.quantity;
            return this.createStockTemplate(stock, investment, investment, 0, {
              meta: { error: 'API data unavailable' }
            });
          }
        })
      );

      // Filter successful results
      const validStocks = enrichedStocks
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      // Calculate portfolio percentages using utility method
      const totalPortfolioValue = validStocks.reduce((sum, stock) => sum + stock.presentValue, 0);
      validStocks.forEach(stock => {
        stock.portfolioPercentage = this.calculatePercentage(stock.presentValue, totalPortfolioValue);
      });

      console.log(`Successfully processed ${validStocks.length} stocks`);
      return validStocks;
    }

    /**
     * Format earnings data for display
     */
    formatEarnings(earningsData) {
      if (!earningsData || typeof earningsData === 'string') {
        return earningsData || 'N/A';
      }
      
      if (earningsData.eps) {
        return `EPS: ₹${earningsData.eps}`;
      }
      
      if (earningsData.date) {
        return `Next: ${earningsData.date}`;
      }
      
      return 'N/A';
    }

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
  
      // Convert map to array and calculate percentages using utility
      const sectors = Array.from(sectorMap.values()).map(sector => ({
        ...sector,
        gainLossPercentage: this.calculatePercentage(sector.totalGainLoss, sector.totalInvestment),
        portfolioPercentage: this.calculatePortfolioPercentage(sector.totalInvestment, portfolioData)
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
      
      return this.calculatePercentage(sectorInvestment, totalInvestment);
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
        overallGainLossPercentage: this.calculatePercentage(summary.totalGainLoss, summary.totalInvestment)
      };
    }
  }
  
  module.exports = new DataAggregationService();
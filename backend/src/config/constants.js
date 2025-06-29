module.exports = {
    // API Endpoints
    YAHOO_FINANCE_BASE_URL: 'https://query1.finance.yahoo.com',
    GOOGLE_FINANCE_BASE_URL: 'https://www.google.com/finance',
    
    // Cache Keys
    CACHE_KEYS: {
      PORTFOLIO: 'portfolio_data',
      SECTOR_SUMMARY: 'sector_summary',
      STOCK_PRICE: 'stock_price_',
      STOCK_DETAILS: 'stock_details_'
    },
    
    // Cache TTL (in seconds)
    CACHE_TTL: {
      PORTFOLIO: 30,
      STOCK_PRICE: 15,
      STOCK_DETAILS: 60,
      SECTOR_SUMMARY: 30
    },
    
    // API Limits
    API_LIMITS: {
      YAHOO_REQUESTS_PER_MINUTE: 100,
      GOOGLE_REQUESTS_PER_MINUTE: 60,
      MAX_BULK_SYMBOLS: 50
    },
    
    // Default Sectors
    SECTORS: [
      'Technology',
      'Banking',
      'Energy',
      'Healthcare',
      'Consumer Goods',
      'Utilities',
      'Real Estate',
      'Telecommunications',
      'Materials',
      'Industrials'
    ],
    
    // Indian Stock Exchanges
    EXCHANGES: {
      NSE: '.NS',
      BSE: '.BO'
    }
  };
const Joi = require('joi');

const stockSchema = Joi.object({
  symbol: Joi.string().required(),
  purchasePrice: Joi.number().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  sector: Joi.string().optional()
});

const portfolioSchema = Joi.array().items(stockSchema).min(1);

/**
 * Validate portfolio data
 */
const validatePortfolioData = (data) => {
  const { error, value } = portfolioSchema.validate(data);
  
  if (error) {
    throw new Error(`Validation Error: ${error.details[0].message}`);
  }
  
  return value;
};

/**
 * Validate stock symbol format
 */
const validateStockSymbol = (symbol) => {
  const symbolRegex = /^[A-Z0-9]+(\.[A-Z]{2})?$/;
  
  if (!symbolRegex.test(symbol)) {
    throw new Error('Invalid stock symbol format');
  }
  
  return symbol;
};

/**
 * Sanitize and validate API response data
 */
const sanitizeApiResponse = (data) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Remove null/undefined values and sanitize numbers
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value !== null && value !== undefined) {
      if (typeof value === 'number' && !isNaN(value)) {
        sanitized[key] = Number(value.toFixed(2));
      } else if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  });

  return sanitized;
};

module.exports = {
  validatePortfolioData,
  validateStockSymbol,
  sanitizeApiResponse
};
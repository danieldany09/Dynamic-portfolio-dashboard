const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

const stockDataLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  20, // limit each IP to 20 requests per minute for stock data
  'Too many stock data requests, please try again later.'
);

module.exports = {
  general: generalLimiter,
  stockData: stockDataLimiter
};
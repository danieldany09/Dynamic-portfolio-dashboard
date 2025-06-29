const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const { stockData: stockDataLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Get complete portfolio data
router.get('/', stockDataLimiter, portfolioController.getPortfolio);

// Get sector-wise summary
router.get('/sectors', stockDataLimiter, portfolioController.getSectorSummary);

// Get real-time price updates
router.get('/prices', stockDataLimiter, portfolioController.getRealTimePrices);

module.exports = router;
const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const { stockData: stockDataLimiter } = require('../middleware/rateLimiter');
const jwtAuth = require('../middleware/jwtAuth');

const router = express.Router();

// Get complete portfolio data
router.get('/', jwtAuth, stockDataLimiter, portfolioController.getPortfolio);

// Get sector-wise summary
router.get('/sectors', jwtAuth, stockDataLimiter, portfolioController.getSectorSummary);

// Get real-time price updates
router.get('/prices', jwtAuth, stockDataLimiter, portfolioController.getRealTimePrices);

module.exports = router;
const express = require('express');
const stockController = require('../controllers/stockController');
const { stockData: stockDataLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/search', stockController.searchStocks);

router.get('/:symbol', stockDataLimiter, stockController.getStockDetails);

module.exports = router;
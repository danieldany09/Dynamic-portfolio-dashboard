const express = require('express');
const stockController = require('../controllers/stockController');
const { stockData: stockDataLimiter } = require('../middleware/rateLimiter');
const jwtAuth = require('../middleware/jwtAuth');

const router = express.Router();

router.get('/:symbol', jwtAuth, stockDataLimiter, stockController.getStockDetails);

module.exports = router;
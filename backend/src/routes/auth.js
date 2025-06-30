const express = require('express');
const authController = require('../controllers/authController');
const jwtAuth = require('../middleware/jwtAuth');
const { general: generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Generate JWT token (requires API key)
router.post('/token', generalLimiter, authController.generateToken);

// Verify JWT token (requires valid JWT token)
router.get('/verify', jwtAuth, authController.verifyToken);

module.exports = router; 
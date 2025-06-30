const jwt = require('jsonwebtoken');

class AuthController {
  
  // Generate JWT token
  generateToken = (req, res) => {
    try {
      const { apiKey } = req.body;
      
      // Get the valid API key and JWT secret from environment variables
      const validApiKey = process.env.API_KEY;
      const jwtSecret = process.env.JWT_SECRET;
      
      if (!validApiKey || !jwtSecret) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error',
          message: 'Authentication configuration is missing'
        });
      }
      
      // Check if the provided API key is valid
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'API key is required',
          message: 'Please provide an API key to generate a token'
        });
      }
      
      if (apiKey !== validApiKey) {
        console.log('apiKey', apiKey);
        console.log('validApiKey', validApiKey);
        return res.status(401).json({
          success: false,
          error: 'Invalid API key',
          message: 'The provided API key is not valid'
        });
      }
      
      // Generate JWT token
      const payload = {
        authorized: true,
        timestamp: Date.now()
      };
      
      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
      
      res.json({
        success: true,
        message: 'Token generated successfully',
        token: token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
      
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Token generation failed',
        message: 'An error occurred while generating the token'
      });
    }
  };
  
  // Verify token (optional endpoint to check if token is valid)
  verifyToken = (req, res) => {
    res.json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  };
}

module.exports = new AuthController(); 
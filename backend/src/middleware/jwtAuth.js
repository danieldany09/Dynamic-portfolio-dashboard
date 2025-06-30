const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-access-token'];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token is required',
      message: 'Please provide a JWT token in the Authorization header (Bearer <token>) or x-access-token header'
    });
  }

  // Get the JWT secret from environment variable
  const jwtSecret = process.env.JWT_SECRET;
  console.log('jwtSecret', jwtSecret);

  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'JWT secret configuration is missing'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('decoded', decoded);
    
    // Add user info to request object
    req.user = decoded;
    
    // Proceed to next middleware
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please generate a new token.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Token verification failed',
        message: 'Failed to authenticate token'
      });
    }
  }
};

module.exports = jwtAuth; 
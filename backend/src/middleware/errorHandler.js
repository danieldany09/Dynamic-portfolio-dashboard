const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
  
    let error = {
      message: err.message || 'Internal Server Error',
      status: err.statusCode || 500
    };
  
    if (err.name === 'ValidationError') {
      error.message = 'Validation Error';
      error.status = 400;
      error.details = err.details;
    }
  
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      error.message = 'External API temporarily unavailable';
      error.status = 503;
    }
  
    if (err.response && err.response.status) {
      error.status = err.response.status;
      error.message = err.response.data?.message || 'External API Error';
    }
  
    res.status(error.status).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      timestamp: new Date().toISOString()
    });
  };
  
  module.exports = errorHandler;
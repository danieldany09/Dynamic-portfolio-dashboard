const axios = require('axios');

/**
 * Shared HTTP client configuration
 * Eliminates duplication between Yahoo and Google Finance services
 */
const createHttpClient = (timeout = 10000) => {
  return axios.create({
    timeout,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
};

module.exports = {
  createHttpClient
}; 
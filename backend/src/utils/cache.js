const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    // Create cache instance with default TTL of 60 seconds
    this.cache = new NodeCache({
      stdTTL: 60,
      checkperiod: 120,
      useClones: false
    });

    // Log cache statistics periodically
    setInterval(() => {
      const stats = this.cache.getStats();
      console.log('Cache Stats:', {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0
      });
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get value from cache
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key, value, ttl) {
    return this.cache.set(key, value, ttl);
  }

  /**
   * Delete key from cache
   */
  del(key) {
    return this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  flush() {
    return this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Get all cache keys
   */
  keys() {
    return this.cache.keys();
  }
}

module.exports = new CacheManager();
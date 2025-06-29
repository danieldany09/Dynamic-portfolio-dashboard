const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    // Create cache instance with default TTL of 60 seconds
    this.cache = new NodeCache({
      stdTTL: 900, //15 minutes
      checkperiod: 600,
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


  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }


  flush() {
    return this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  keys() {
    return this.cache.keys();
  }
}

module.exports = new CacheManager();
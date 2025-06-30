const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 900, //15 minutes
      checkperiod: 600,
      useClones: false
    });

    setInterval(() => {
      const stats = this.cache.getStats();
      console.log('Cache Stats:', {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0
      });
    }, 5 * 60 * 1000); 
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
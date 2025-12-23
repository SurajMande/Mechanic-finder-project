const redisClient = require("../config/redis")

class CacheService {
  constructor() {
    this.defaultTTL = 3600 // 1 hour
    this.shortTTL = 300 // 5 minutes
    this.longTTL = 86400 // 24 hours
  }

  async get(key) {
    return await redisClient.get(key)
  }

  async set(key, value, ttl = this.defaultTTL) {
    return await redisClient.set(key, value, ttl)
  }

  async del(key) {
    return await redisClient.del(key)
  }

  async invalidatePattern(pattern) {
    return await redisClient.invalidatePattern(pattern)
  }
  
  // Mechanic-related caching
  async getMechanicProfile(mechanicId) {
    const cacheKey = `mechanic:profile:${mechanicId}`
    return await redisClient.get(cacheKey)
  }

  async setMechanicProfile(mechanicId, profileData) {
    const cacheKey = `mechanic:profile:${mechanicId}`
    return await redisClient.set(cacheKey, profileData, this.defaultTTL)
  }

  async invalidateMechanicProfile(mechanicId) {
    const cacheKey = `mechanic:profile:${mechanicId}`
    return await redisClient.del(cacheKey)
  }

  // Location-based caching
  async getNearbyMechanics(latitude, longitude, radius) {
    const cacheKey = `nearby:${latitude}:${longitude}:${radius}`
    return await redisClient.get(cacheKey)
  }

  async setNearbyMechanics(latitude, longitude, radius, mechanics) {
    const cacheKey = `nearby:${latitude}:${longitude}:${radius}`
    return await redisClient.set(cacheKey, mechanics, this.shortTTL) // Short TTL for location data
  }

  // Geospatial caching for mechanic locations
  async updateMechanicLocation(mechanicId, longitude, latitude) {
    const geoKey = "mechanic:locations"
    return await redisClient.geoadd(geoKey, longitude, latitude, mechanicId)
  }

  async findNearbyMechanicsGeo(longitude, latitude, radius = 10) {
    const geoKey = "mechanic:locations"
    return await redisClient.georadius(geoKey, longitude, latitude, radius, "km")
  }

  // Request caching
  async getActiveRequests() {
    const cacheKey = "requests:active"
    return await redisClient.get(cacheKey)
  }

  async setActiveRequests(requests) {
    const cacheKey = "requests:active"
    return await redisClient.set(cacheKey, requests, this.shortTTL)
  }

  async invalidateActiveRequests() {
    const cacheKey = "requests:active"
    return await redisClient.del(cacheKey)
  }

  // User session caching
  async getUserSession(userId) {
    const cacheKey = `user:session:${userId}`
    return await redisClient.get(cacheKey)
  }

  async setUserSession(userId, sessionData) {
    const cacheKey = `user:session:${userId}`
    return await redisClient.set(cacheKey, sessionData, this.longTTL)
  }

  async invalidateUserSession(userId) {
    const cacheKey = `user:session:${userId}`
    return await redisClient.del(cacheKey)
  }

  // Rating and statistics caching
  async getMechanicStats(mechanicId) {
    const cacheKey = `mechanic:stats:${mechanicId}`
    return await redisClient.get(cacheKey)
  }

  async setMechanicStats(mechanicId, stats) {
    const cacheKey = `mechanic:stats:${mechanicId}`
    return await redisClient.set(cacheKey, stats, this.defaultTTL)
  }

  async invalidateMechanicStats(mechanicId) {
    const cacheKey = `mechanic:stats:${mechanicId}`
    return await redisClient.del(cacheKey)
  }

  // Portfolio caching
  async getMechanicPortfolio(mechanicId) {
    const cacheKey = `mechanic:portfolio:${mechanicId}`
    return await redisClient.get(cacheKey)
  }

  async setMechanicPortfolio(mechanicId, portfolio) {
    const cacheKey = `mechanic:portfolio:${mechanicId}`
    return await redisClient.set(cacheKey, portfolio, this.longTTL)
  }

  async invalidateMechanicPortfolio(mechanicId) {
    const cacheKey = `mechanic:portfolio:${mechanicId}`
    return await redisClient.del(cacheKey)
  }

  // Search results caching
  async getSearchResults(searchQuery, filters) {
    const cacheKey = `search:${this.generateSearchKey(searchQuery, filters)}`
    return await redisClient.get(cacheKey)
  }

  async setSearchResults(searchQuery, filters, results) {
    const cacheKey = `search:${this.generateSearchKey(searchQuery, filters)}`
    return await redisClient.set(cacheKey, results, this.shortTTL)
  }

  // Notification queue caching
  async addNotificationToQueue(userId, notification) {
    const queueKey = `notifications:queue:${userId}`
    return await redisClient.lpush(queueKey, notification)
  }

  async getNotificationFromQueue(userId) {
    const queueKey = `notifications:queue:${userId}`
    return await redisClient.rpop(queueKey)
  }

  // Rate limiting cache
  async incrementRateLimit(identifier, windowSeconds = 3600) {
    const cacheKey = `rate_limit:${identifier}`
    const current = (await redisClient.get(cacheKey)) || 0
    const newCount = Number.parseInt(current) + 1
    await redisClient.set(cacheKey, newCount, windowSeconds)
    return newCount
  }

  async getRateLimit(identifier) {
    const cacheKey = `rate_limit:${identifier}`
    return (await redisClient.get(cacheKey)) || 0
  }

  // Analytics caching
  async incrementCounter(counterName, value = 1) {
    const cacheKey = `counter:${counterName}`
    const current = (await redisClient.get(cacheKey)) || 0
    const newValue = Number.parseInt(current) + value
    await redisClient.set(cacheKey, newValue, this.longTTL)
    return newValue
  }

  async getCounter(counterName) {
    const cacheKey = `counter:${counterName}`
    return (await redisClient.get(cacheKey)) || 0
  }

  // Utility methods
  generateSearchKey(query, filters) {
    const filterString = Object.keys(filters)
      .sort()
      .map((key) => `${key}:${filters[key]}`)
      .join("|")
    return `${query}:${filterString}`.replace(/[^a-zA-Z0-9:|\-_]/g, "")
  }

  // Bulk operations
  async invalidateUserRelatedCache(userId) {
    const patterns = [
      `user:session:${userId}`,
      `user:requests:${userId}`,
      `user:bookings:${userId}`,
      `notifications:queue:${userId}`,
    ]

    for (const pattern of patterns) {
      await redisClient.del(pattern)
    }
  }

  async invalidateMechanicRelatedCache(mechanicId) {
    const patterns = [
      `mechanic:profile:${mechanicId}`,
      `mechanic:stats:${mechanicId}`,
      `mechanic:portfolio:${mechanicId}`,
      `mechanic:requests:${mechanicId}`,
    ]

    for (const pattern of patterns) {
      await redisClient.del(pattern)
    }

    // Also invalidate location-based caches
    await redisClient.invalidatePattern("nearby:*")
    await redisClient.invalidatePattern("search:*")
  }

  // Health check
  async healthCheck() {
    try {
      const testKey = "health:check"
      const testValue = { timestamp: Date.now() }

      await redisClient.set(testKey, testValue, 60)
      const retrieved = await redisClient.get(testKey)
      await redisClient.del(testKey)

      return {
        status: "healthy",
        connected: redisClient.isConnected,
        testPassed: retrieved && retrieved.timestamp === testValue.timestamp,
      }
    } catch (error) {
      return {
        status: "error",
        connected: false,
        error: error.message,
      }
    }
  }
}

const cacheService = new CacheService()

module.exports = cacheService

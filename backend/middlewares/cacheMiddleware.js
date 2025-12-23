const cacheService = require("../services/cacheService")

// Generic cache middleware
const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey = typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey)

      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`)
        return res.json(cachedData)
      }

      // Store original res.json
      const originalJson = res.json

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        cacheService.set(cacheKey, data, ttl).catch((err) => {
          console.error("Cache set error:", err)
        })

        console.log(`Cache miss for key: ${cacheKey} - data cached`)

        // Call original res.json
        return originalJson.call(this, data)
      }

      next()
    } catch (error) {
      console.error("Cache middleware error:", error)
      next() // Continue without caching on error
    }
  }
}

// Specific cache middlewares
const cacheNearbyMechanics = cacheMiddleware((req) => {
  const { latitude, longitude, radius = 10 } = req.query
  return `nearby:${latitude}:${longitude}:${radius}`
}, 300) // 5 minutes TTL

const cacheMechanicProfile = cacheMiddleware((req) => {
  return `mechanic:profile:${req.params.mechanicId || req.user._id}`
}, 3600) // 1 hour TTL

const cacheMechanicPortfolio = cacheMiddleware((req) => {
  return `mechanic:portfolio:${req.params.mechanicId}`
}, 86400) // 24 hours TTL

const cacheActiveRequests = cacheMiddleware("requests:active", 300) // 5 minutes TTL

const cacheSearchResults = cacheMiddleware((req) => {
  const { q, specialization, minRating, maxDistance, sortBy } = req.query
  const filters = { specialization, minRating, maxDistance, sortBy }
  return cacheService.generateSearchKey(q || "", filters)
}, 600) // 10 minutes TTL

// Cache invalidation middleware
const invalidateCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json

    // Override res.json to invalidate cache after successful response
    res.json = function (data) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        Promise.all(
          patterns.map((pattern) => {
            if (typeof pattern === "function") {
              return cacheService.del(pattern(req, data))
            }
            return cacheService.invalidatePattern(pattern)
          }),
        ).catch((err) => {
          console.error("Cache invalidation error:", err)
        })
      }

      // Call original res.json
      return originalJson.call(this, data)
    }

    next()
  }
}

// Rate limiting middleware using Redis
const rateLimitMiddleware = (maxRequests = 100, windowSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      const identifier = req.ip || req.connection.remoteAddress
      const current = await cacheService.incrementRateLimit(identifier, windowSeconds)

      // Add rate limit headers
      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": Math.max(0, maxRequests - current),
        "X-RateLimit-Reset": new Date(Date.now() + windowSeconds * 1000).toISOString(),
      })

      if (current > maxRequests) {
        return res.status(429).json({
          message: "Too many requests",
          retryAfter: windowSeconds,
        })
      }

      next()
    } catch (error) {
      console.error("Rate limit middleware error:", error)
      next() // Continue without rate limiting on error
    }
  }
}

// Session cache middleware
const sessionCacheMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      // Try to get session from cache
      const cachedSession = await cacheService.getUserSession(req.user._id)

      if (cachedSession) {
        req.userSession = cachedSession
      }
    }

    next()
  } catch (error) {
    console.error("Session cache middleware error:", error)
    next()
  }
}

module.exports = {
  cacheMiddleware,
  cacheNearbyMechanics,
  cacheMechanicProfile,
  cacheMechanicPortfolio,
  cacheActiveRequests,
  cacheSearchResults,
  invalidateCacheMiddleware,
  rateLimitMiddleware,
  sessionCacheMiddleware,
}

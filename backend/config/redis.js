const redis = require("redis")

class RedisClient {
  constructor() {
    this.client = null
    this.isConnected = false
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retry_strategy: (options) => {
          if (options.error && options.error.code === "ECONNREFUSED") {
            console.error("Redis connection refused")
            return new Error("Redis connection refused")
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error("Redis retry time exhausted")
          }
          if (options.attempt > 10) {
            return undefined
          }
          return Math.min(options.attempt * 100, 3000)
        },
      })

      this.client.on("connect", () => {
        console.log("Redis client connected")
        this.isConnected = true
      })

      this.client.on("error", (err) => {
        console.error("Redis client error:", err)
        this.isConnected = false
      })

      this.client.on("end", () => {
        console.log("Redis client disconnected")
        this.isConnected = false
      })

      await this.client.connect()
      return this.client
    } catch (error) {
      console.error("Redis connection error:", error)
      throw error
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect()
      this.isConnected = false
    }
  }

  // Cache operations
  async get(key) {
    try {
      if (!this.isConnected) return null
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error("Redis get error:", error)
      return null
    }
  }

  async set(key, value, expireInSeconds = 3600) {
    try {
      if (!this.isConnected) return false
      await this.client.setEx(key, expireInSeconds, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Redis set error:", error)
      return false
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) return false
      await this.client.del(key)
      return true
    } catch (error) {
      console.error("Redis del error:", error)
      return false
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) return false
      const exists = await this.client.exists(key)
      return exists === 1
    } catch (error) {
      console.error("Redis exists error:", error)
      return false
    }
  }

  // Hash operations for complex data
  async hget(key, field) {
    try {
      if (!this.isConnected) return null
      const value = await this.client.hGet(key, field)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error("Redis hget error:", error)
      return null
    }
  }

  async hset(key, field, value, expireInSeconds = 3600) {
    try {
      if (!this.isConnected) return false
      await this.client.hSet(key, field, JSON.stringify(value))
      await this.client.expire(key, expireInSeconds)
      return true
    } catch (error) {
      console.error("Redis hset error:", error)
      return false
    }
  }

  async hgetall(key) {
    try {
      if (!this.isConnected) return null
      const hash = await this.client.hGetAll(key)
      const result = {}
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value)
      }
      return result
    } catch (error) {
      console.error("Redis hgetall error:", error)
      return null
    }
  }

  // List operations for queues
  async lpush(key, value) {
    try {
      if (!this.isConnected) return false
      await this.client.lPush(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Redis lpush error:", error)
      return false
    }
  }

  async rpop(key) {
    try {
      if (!this.isConnected) return null
      const value = await this.client.rPop(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error("Redis rpop error:", error)
      return null
    }
  }

  // Set operations for unique collections
  async sadd(key, value) {
    try {
      if (!this.isConnected) return false
      await this.client.sAdd(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Redis sadd error:", error)
      return false
    }
  }

  async smembers(key) {
    try {
      if (!this.isConnected) return []
      const members = await this.client.sMembers(key)
      return members.map((member) => JSON.parse(member))
    } catch (error) {
      console.error("Redis smembers error:", error)
      return []
    }
  }

  // Geospatial operations for location-based queries
  async geoadd(key, longitude, latitude, member) {
    try {
      if (!this.isConnected) return false
      await this.client.geoAdd(key, {
        longitude: Number.parseFloat(longitude),
        latitude: Number.parseFloat(latitude),
        member: member,
      })
      return true
    } catch (error) {
      console.error("Redis geoadd error:", error)
      return false
    }
  }

  async georadius(key, longitude, latitude, radius, unit = "km") {
    try {
      if (!this.isConnected) return []
      const results = await this.client.geoRadius(
        key,
        {
          longitude: Number.parseFloat(longitude),
          latitude: Number.parseFloat(latitude),
        },
        radius,
        unit,
        {
          WITHDIST: true,
          WITHCOORD: true,
        },
      )
      return results
    } catch (error) {
      console.error("Redis georadius error:", error)
      return []
    }
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern) {
    try {
      if (!this.isConnected) return false
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
      return true
    } catch (error) {
      console.error("Redis invalidatePattern error:", error)
      return false
    }
  }
}

const redisClient = new RedisClient()

module.exports = redisClient

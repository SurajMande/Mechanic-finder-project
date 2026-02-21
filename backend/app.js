const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const dotenv = require("dotenv")
const helmet = require("helmet")
const compression = require("compression")
const connectDB = require("./config/db")
// const redisClient = require("./config/redis") // ❌ Redis commented

// Load environment variables
dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()
const server = http.createServer(app)

// Configure allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  process.env.CLIENT_URL || "http://localhost:3000",
  "https://mechanic-finder-project.vercel.app",
  "https://mechanic-finder-project.onrender.com",
]

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`)
        callback(new Error("CORS not allowed"), false)
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Support both WebSocket and polling
})

// Security and performance middleware
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ❌ Redis initialization commented
/*
async function initializeServices() {
  try {
    await redisClient.connect()
    console.log("Redis connected successfully")
  } catch (error) {
    console.error("Service initialization error:", error)
  }
}

initializeServices()
*/

// Routes
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/user", require("./routes/userRoutes"))
app.use("/api/mechanic", require("./routes/mechanicRoutes"))
app.use("/api/request", require("./routes/requestRoutes"))
app.use("/api/bookings", require("./routes/bookingRoutes"))
app.use("/api/ratings", require("./routes/ratingRoutes"))
app.use("/api/portfolio", require("./routes/portfolioRoutes"))

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        redis: "disabled", // ❌ Redis disabled
      },
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    })
  }
})

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-mechanic-room", () => {
    socket.join("mechanics")
    console.log("Mechanic joined room:", socket.id)
  })

  socket.on("join-tracking-room", (requestId) => {
    socket.join(`tracking-${requestId}`)
    console.log("User joined tracking room:", requestId)
  })

  socket.on("update-location", async (data) => {
    try {
      console.log(`📍 Received location update from ${socket.id}:`, data)
      
      const { requestId, location, mechanicId } = data

      // Validate data structure
      if (!requestId) {
        console.warn("❌ Missing requestId")
        return socket.emit("error", {
          message: "Missing required field: requestId",
        })
      }

      if (!location) {
        console.warn("❌ Missing location object")
        return socket.emit("error", {
          message: "Missing required field: location",
        })
      }

      if (!mechanicId) {
        console.warn("❌ Missing mechanicId")
        return socket.emit("error", {
          message: "Missing required field: mechanicId",
        })
      }

      // Validate location object
      if (typeof location.latitude !== "number") {
        console.warn("❌ Invalid latitude type:", typeof location.latitude)
        return socket.emit("error", {
          message: "Invalid location format. Latitude must be a number",
        })
      }

      if (typeof location.longitude !== "number") {
        console.warn("❌ Invalid longitude type:", typeof location.longitude)
        return socket.emit("error", {
          message: "Invalid location format. Longitude must be a number",
        })
      }

      // Validate coordinate ranges
      if (Math.abs(location.latitude) > 90) {
        console.warn("❌ Latitude out of range:", location.latitude)
        return socket.emit("error", {
          message: "Invalid latitude. Must be between -90 and 90",
        })
      }

      if (Math.abs(location.longitude) > 180) {
        console.warn("❌ Longitude out of range:", location.longitude)
        return socket.emit("error", {
          message: "Invalid longitude. Must be between -180 and 180",
        })
      }

      // Broadcast to users tracking this request
      const trackingRoom = `tracking-${requestId}`
      const updateData = {
        mechanicId,
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          accuracy: location.accuracy || null,
        },
        timestamp: Date.now(),
      }

      console.log(`📡 Broadcasting location to room: ${trackingRoom}`)
      socket.to(trackingRoom).emit("location-update", updateData)

      // Also broadcast to mechanics room for awareness
      console.log(`📡 Broadcasting to mechanics room`)
      socket.to("mechanics").emit("mechanic-location-update", {
        mechanicId,
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          accuracy: location.accuracy || null,
        },
        timestamp: Date.now(),
      })

      console.log(`✅ Location update successfully processed for request ${requestId}`)
    } catch (error) {
      console.error("❌ Error processing location update:", error)
      socket.emit("error", {
        message: "Failed to process location update",
        details: error.message,
      })
    }
  })

  socket.on("status-update", async (data) => {
    try {
      const { requestId, status, mechanicId } = data

      // Validate required fields
      if (!requestId || !status || !mechanicId) {
        return socket.emit("error", {
          message: "Missing required fields: requestId, status, mechanicId",
        })
      }

      // Validate status value
      const validStatuses = ["pending", "assigned", "accepted", "in-progress", "completed", "cancelled"]
      if (!validStatuses.includes(status)) {
        return socket.emit("error", {
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        })
      }

      // Broadcast to users tracking this request
      socket.to(`tracking-${requestId}`).emit("status-update", {
        requestId,
        status,
        mechanicId,
        timestamp: Date.now(),
      })

      console.log(`Status update for request ${requestId}: ${status}`)
    } catch (error) {
      console.error("Error processing status update:", error)
      socket.emit("error", {
        message: "Failed to process status update",
        details: error.message,
      })
    }
  })

  socket.on("availability-toggle", async (data) => {
    try {
      const { mechanicId, isAvailable } = data

      // Validate required fields
      if (!mechanicId || typeof isAvailable !== "boolean") {
        return socket.emit("error", {
          message: "Missing or invalid required fields: mechanicId (string), isAvailable (boolean)",
        })
      }

      // Broadcast to all mechanics
      socket.to("mechanics").emit("mechanic-availability-changed", {
        mechanicId,
        isAvailable,
        timestamp: Date.now(),
      })

      console.log(`Mechanic ${mechanicId} availability: ${isAvailable}`)
    } catch (error) {
      console.error("Error processing availability toggle:", error)
      socket.emit("error", {
        message: "Failed to process availability update",
        details: error.message,
      })
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    // Optional: Update mechanic availability when they disconnect
    // This could trigger marking them as offline in the database
  })

  // Error handler
  socket.on("error", (error) => {
    console.error("Socket error for", socket.id, ":", error)
  })

  // Invalid data handler
  socket.on("invalid-data", (data) => {
    console.warn("Invalid data received from", socket.id, ":", data)
  })
})

// Make io accessible to routes
app.set("io", io)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully")

  try {
    // await redisClient.disconnect() // ❌ Redis disconnect commented
    server.close(() => {
      console.log("Process terminated")
      process.exit(0)
    })
  } catch (error) {
    console.error("Error during shutdown:", error)
    process.exit(1)
  }
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

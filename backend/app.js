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
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
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
    const { requestId, location, mechanicId } = data

    socket.to(`tracking-${requestId}`).emit("location-update", {
      mechanicId,
      location,
      timestamp: Date.now(),
    })

    socket.to("mechanics").emit("mechanic-location-update", {
      mechanicId,
      location,
      timestamp: Date.now(),
    })
  })

  socket.on("status-update", async (data) => {
    const { requestId, status, mechanicId } = data

    socket.to(`tracking-${requestId}`).emit("status-update", {
      requestId,
      status,
      mechanicId,
      timestamp: Date.now(),
    })
  })

  socket.on("availability-toggle", async (data) => {
    const { mechanicId, isAvailable } = data

    socket.to("mechanics").emit("mechanic-availability-changed", {
      mechanicId,
      isAvailable,
      timestamp: Date.now(),
    })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
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

const Mechanic = require("../models/Mechanic")
const MechanicPortfolio = require("../models/MechanicPortfolio")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
// const cacheService = require("../services/cacheService") // ❌ COMMENTED

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc Register mechanic
const registerMechanic = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() })
    }

    const { name, email, password, phone, specialization, experience } = req.body

    const existingMechanic = await Mechanic.findOne({ email })
    if (existingMechanic) {
      return res.status(400).json({ message: "Mechanic already exists with this email" })
    }

    const mechanic = await Mechanic.create({
      name,
      email,
      password,
      phone,
      specialization,
      experience: Number.parseInt(experience),
      role: "mechanic",
    })

    // Create default portfolio for new mechanic
    await MechanicPortfolio.create({
      mechanic: mechanic._id,
      bio: "",
      services: [],
      certifications: [],
      workImages: [],
      availability: {
        monday: { start: "09:00", end: "18:00", available: true },
        tuesday: { start: "09:00", end: "18:00", available: true },
        wednesday: { start: "09:00", end: "18:00", available: true },
        thursday: { start: "09:00", end: "18:00", available: true },
        friday: { start: "09:00", end: "18:00", available: true },
        saturday: { start: "09:00", end: "16:00", available: true },
        sunday: { start: "", end: "", available: false },
      },
      serviceAreas: [],
      tools: [],
      achievements: [],
      socialLinks: {},
      isPublic: true,
      views: 0,
    })

    const token = generateToken(mechanic._id, mechanic.role)

    const mechanicData = {
      id: mechanic._id,
      name: mechanic.name,
      email: mechanic.email,
      phone: mechanic.phone,
      specialization: mechanic.specialization,
      experience: mechanic.experience,
      role: mechanic.role,
      profileImage: mechanic.profileImage,
      isAvailable: mechanic.isAvailable,
    }

    // ❌ cacheService.setMechanicProfile(mechanic._id, mechanicData)

    res.status(201).json({
      message: "Mechanic registered successfully",
      token,
      mechanic: mechanicData,
    })
  } catch (error) {
    console.error("Register mechanic error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
}

// @desc Get mechanic profile
const getMechanicProfile = async (req, res) => {
  try {
    // ❌ let mechanic = await cacheService.getMechanicProfile(req.user._id)

    let mechanic = null

    if (!mechanic) {
      mechanic = await Mechanic.findById(req.user._id).select("-password")

      if (!mechanic) {
        return res.status(404).json({ message: "Mechanic not found" })
      }

      // ❌ cacheService.setMechanicProfile(req.user._id, mechanic)
    }

    res.json(mechanic)
  } catch (error) {
    console.error("Get mechanic profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc Update mechanic profile
const updateMechanicProfile = async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, profileImage, isAvailable } = req.body

    const mechanic = await Mechanic.findById(req.user._id)

    if (!mechanic) {
      return res.status(404).json({ message: "Mechanic not found" })
    }

    if (email && email !== mechanic.email) {
      const existingMechanic = await Mechanic.findOne({ email })
      if (existingMechanic) {
        return res.status(400).json({ message: "Email already in use" })
      }
    }

    mechanic.name = name || mechanic.name
    mechanic.email = email || mechanic.email
    mechanic.phone = phone || mechanic.phone
    mechanic.specialization = specialization || mechanic.specialization
    mechanic.experience =
      experience !== undefined ? Number.parseInt(experience) : mechanic.experience
    mechanic.profileImage = profileImage || mechanic.profileImage
    mechanic.isAvailable =
      isAvailable !== undefined ? isAvailable : mechanic.isAvailable

    const updatedMechanic = await mechanic.save()

    const mechanicData = {
      id: updatedMechanic._id,
      name: updatedMechanic.name,
      email: updatedMechanic.email,
      phone: updatedMechanic.phone,
      specialization: updatedMechanic.specialization,
      experience: updatedMechanic.experience,
      role: updatedMechanic.role,
      profileImage: updatedMechanic.profileImage,
      isAvailable: updatedMechanic.isAvailable,
      rating: updatedMechanic.rating,
      completedJobs: updatedMechanic.completedJobs,
    }

    // ❌ cacheService.setMechanicProfile(req.user._id, mechanicData)

    res.json({
      message: "Profile updated successfully",
      mechanic: mechanicData,
    })
  } catch (error) {
    console.error("Update mechanic profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc Update mechanic location
const updateMechanicLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" })
    }

    const mechanic = await Mechanic.findById(req.user._id)

    if (!mechanic) {
      return res.status(404).json({ message: "Mechanic not found" })
    }

    const locationData = {
      latitude: Number.parseFloat(latitude),
      longitude: Number.parseFloat(longitude),
    }

    mechanic.currentLocation = locationData
    await mechanic.save()

    // ❌ cacheService.updateMechanicLocation(
    //   req.user._id,
    //   locationData.longitude,
    //   locationData.latitude
    // )

    res.json({
      message: "Location updated successfully",
      location: mechanic.currentLocation,
    })
  } catch (error) {
    console.error("Update mechanic location error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc Toggle mechanic availability
const toggleAvailability = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.user._id)

    if (!mechanic) {
      return res.status(404).json({ message: "Mechanic not found" })
    }

    mechanic.isAvailable = !mechanic.isAvailable
    await mechanic.save()

    // ❌ cacheService.invalidateMechanicProfile(req.user._id)

    res.json({
      message: `Availability ${mechanic.isAvailable ? "enabled" : "disabled"}`,
      isAvailable: mechanic.isAvailable,
    })
  } catch (error) {
    console.error("Toggle availability error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc Get nearby mechanics
const getNearbyMechanics = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, specialization, minRating } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" })
    }

    // ❌ const cacheKey = `nearby:${latitude}:${longitude}:${radius}:${specialization || "all"}:${minRating || 0}`
    // ❌ let mechanics = await cacheService.get(cacheKey)

    let mechanics = null

    if (!mechanics) {
      const query = { isAvailable: true, isActive: true }

      if (specialization) query.specialization = specialization
      if (minRating) query.rating = { $gte: Number.parseFloat(minRating) }

      mechanics = await Mechanic.find(query).select("-password").lean()

      mechanics = mechanics
        .filter(m => m.currentLocation)
        .map(m => ({
          ...m,
          distance: calculateDistance(
            Number(latitude),
            Number(longitude),
            m.currentLocation.latitude,
            m.currentLocation.longitude
          )
        }))
        .filter(m => m.distance <= Number(radius))
        .sort((a, b) => a.distance - b.distance)

      // ❌ cacheService.set(cacheKey, mechanics, 300)
    }

    res.json(mechanics)
  } catch (error) {
    console.error("Get nearby mechanics error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc Get mechanic stats
const getMechanicStats = async (req, res) => {
  try {
    // ❌ let stats = await cacheService.getMechanicStats(req.user._id)

    let stats = null

    if (!stats) {
      const mechanic = await Mechanic.findById(req.user._id).select("-password")

      if (!mechanic) {
        return res.status(404).json({ message: "Mechanic not found" })
      }

      stats = {
        totalJobs: mechanic.completedJobs,
        rating: mechanic.rating,
        totalRatings: mechanic.totalRatings,
        specialization: mechanic.specialization,
        experience: mechanic.experience,
        joinDate: mechanic.createdAt,
        isAvailable: mechanic.isAvailable,
        averageJobsPerMonth: Math.round(mechanic.completedJobs / 12),
        successRate:
          mechanic.completedJobs > 0
            ? ((mechanic.completedJobs / (mechanic.completedJobs + 5)) * 100).toFixed(1)
            : 0,
      }

      // ❌ cacheService.setMechanicStats(req.user._id, stats)
    }

    res.json(stats)
  } catch (error) {
    console.error("Get mechanic stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Distance helper
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

module.exports = {
  registerMechanic,
  getMechanicProfile,
  updateMechanicProfile,
  updateMechanicLocation,
  toggleAvailability,
  getNearbyMechanics,
  getMechanicStats,
}

const express = require("express")
const { body } = require("express-validator")
const User = require("../models/User")
const Mechanic = require("../models/Mechanic")
const jwt = require("jsonwebtoken")

const router = express.Router()

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Login user or mechanic
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body

      // Try to find user first
      let user = await User.findOne({ email })
      let role = "user"

      // If not found in users, try mechanics
      if (!user) {
        user = await Mechanic.findOne({ email })
        role = "mechanic"
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" })
      }

      // Generate token
      const token = generateToken(user._id, role)

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: role,
          profileImage: user.profileImage,
          ...(role === "mechanic" && {
            specialization: user.specialization,
            experience: user.experience,
            isAvailable: user.isAvailable,
            rating: user.rating,
            completedJobs: user.completedJobs,
          }),
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user based on role
    let user
    if (decoded.role === "mechanic") {
      user = await Mechanic.findById(decoded.id).select("-password")
    } else {
      user = await User.findById(decoded.id).select("-password")
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: decoded.role,
        profileImage: user.profileImage,
        ...(decoded.role === "mechanic" && {
          specialization: user.specialization,
          experience: user.experience,
          isAvailable: user.isAvailable,
          rating: user.rating,
          completedJobs: user.completedJobs,
        }),
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
})

module.exports = router

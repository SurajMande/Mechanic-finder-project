const User = require("../models/User")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Register user
// @route   POST /api/user/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() })
    }

    const { name, email, password, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "user",
    })

    // Generate token
    const token = generateToken(user._id, user.role)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    })
  } catch (error) {
    console.error("Register user error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
}

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, profileImage } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
      }
    }

    // Update fields
    user.name = name || user.name
    user.email = email || user.email
    user.phone = phone || user.phone
    user.profileImage = profileImage || user.profileImage

    const updatedUser = await user.save()

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
      },
    })
  } catch (error) {
    console.error("Update user profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete user account
// @route   DELETE /api/user/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndDelete(req.user._id)

    res.json({ message: "User account deleted successfully" })
  } catch (error) {
    console.error("Delete user account error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
}

const express = require("express")
const { body } = require("express-validator")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const { registerUser, getUserProfile, updateUserProfile, deleteUserAccount } = require("../controllers/userController")

const router = express.Router()

// @desc    Register user
// @route   POST /api/user/register
// @access  Public
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").trim().isLength({ min: 10 }).withMessage("Phone number must be at least 10 characters"),
  ],
  registerUser,
)

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private (User only)
router.get("/profile", authMiddleware, roleMiddleware(["user"]), getUserProfile)

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private (User only)
router.put(
  "/profile",
  [
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("phone").optional().trim().isLength({ min: 10 }).withMessage("Phone number must be at least 10 characters"),
  ],
  authMiddleware,
  roleMiddleware(["user"]),
  updateUserProfile,
)

// @desc    Delete user account
// @route   DELETE /api/user/profile
// @access  Private (User only)
router.delete("/profile", authMiddleware, roleMiddleware(["user"]), deleteUserAccount)

module.exports = router

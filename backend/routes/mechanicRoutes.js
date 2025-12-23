const express = require("express")
const { body } = require("express-validator")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

// ❌ Cache middleware imports commented
// const {
//   cacheNearbyMechanics,
//   cacheMechanicProfile,
//   invalidateCacheMiddleware,
//   rateLimitMiddleware,
// } = require("../middlewares/cacheMiddleware")

const {
  registerMechanic,
  getMechanicProfile,
  updateMechanicProfile,
  updateMechanicLocation,
  toggleAvailability,
  getNearbyMechanics,
  getMechanicStats,
} = require("../controllers/mechanicController")

const router = express.Router()

// @desc Register mechanic
// @route POST /api/mechanic/register
// @access Public
router.post(
  "/register",
  // rateLimitMiddleware(5, 3600), // ❌ commented
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").trim().isLength({ min: 10 }).withMessage("Phone number must be at least 10 characters"),
    body("specialization")
      .isIn([
        "Engine Repair",
        "Brake Service",
        "Transmission",
        "Electrical",
        "AC Repair",
        "General Maintenance",
      ])
      .withMessage("Invalid specialization"),
    body("experience").isInt({ min: 0, max: 50 }).withMessage("Experience must be between 0 and 50 years"),
  ],
  registerMechanic
)

// @desc Get mechanic profile
// @route GET /api/mechanic/profile
// @access Private (Mechanic only)
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // cacheMechanicProfile, // ❌ commented
  getMechanicProfile
)

// @desc Update mechanic profile
// @route PUT /api/mechanic/profile
// @access Private (Mechanic only)
router.put(
  "/profile",
  [
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("phone").optional().trim().isLength({ min: 10 }).withMessage("Phone number must be at least 10 characters"),
    body("specialization")
      .optional()
      .isIn([
        "Engine Repair",
        "Brake Service",
        "Transmission",
        "Electrical",
        "AC Repair",
        "General Maintenance",
      ])
      .withMessage("Invalid specialization"),
    body("experience").optional().isInt({ min: 0, max: 50 }).withMessage("Experience must be between 0 and 50 years"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // invalidateCacheMiddleware([   // ❌ commented
  //   (req) => `mechanic:profile:${req.user._id}`,
  //   (req) => `mechanic:stats:${req.user._id}`,
  //   "nearby:*",
  // ]),
  updateMechanicProfile
)

// @desc Update mechanic location
// @route PUT /api/mechanic/location
// @access Private (Mechanic only)
router.put(
  "/location",
  [
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
  ],
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // rateLimitMiddleware(60, 60), // ❌ commented
  // invalidateCacheMiddleware(["nearby:*"]), // ❌ commented
  updateMechanicLocation
)

// @desc Toggle mechanic availability
// @route PUT /api/mechanic/availability
// @access Private (Mechanic only)
router.put(
  "/availability",
  authMiddleware,
  roleMiddleware(["mechanic"]),
  // invalidateCacheMiddleware([
  //   (req) => `mechanic:profile:${req.user._id}`,
  //   "nearby:*",
  // ]), // ❌ commented
  toggleAvailability
)

// @desc Get nearby mechanics
// @route GET /api/mechanic/nearby
// @access Public
router.get(
  "/nearby",
  // rateLimitMiddleware(100, 3600), // ❌ commented
  // cacheNearbyMechanics, // ❌ commented
  getNearbyMechanics
)

// @desc Get mechanic statistics
// @route GET /api/mechanic/stats
// @access Private (Mechanic only)
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["mechanic"]),
  getMechanicStats
)

module.exports = router
